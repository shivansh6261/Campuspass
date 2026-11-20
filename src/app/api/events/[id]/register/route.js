
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getCurrentStudent } from "@/lib/auth";

const MAX_RETRIES = 5;

export async function POST(request, { params }) {
  try {
    // Basic same-origin protection
    const origin = request.headers.get("origin");
    const expectedOrigin = new URL(request.url).origin;

    if (origin && origin !== expectedOrigin) {
      return NextResponse.json(
        { error: "Invalid request origin." },
        { status: 403 }
      );
    }

    // Authentication
    const currentStudent = await getCurrentStudent();

    if (!currentStudent?.id) {
      return NextResponse.json(
        { error: "Please login to register." },
        { status: 401 }
      );
    }

    // Verify current account permissions from database
    const student = await prisma.student.findUnique({
      where: {
        id: currentStudent.id,
      },
      select: {
        id: true,
        role: true,
        accountStatus: true,
      },
    });

    if (
      !student ||
      student.accountStatus !== "ACTIVE" ||
      student.role !== "STUDENT"
    ) {
      return NextResponse.json(
        { error: "Only active student accounts can register." },
        { status: 403 }
      );
    }

    const { id: eventId } = await params;

    if (!eventId || typeof eventId !== "string") {
      return NextResponse.json(
        { error: "Invalid event ID." },
        { status: 400 }
      );
    }

    // Serializable transactions prevent concurrent overbooking.
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const result = await prisma.$transaction(
          async (tx) => {
            const event = await tx.event.findUnique({
              where: {
                id: eventId,
              },
              select: {
                id: true,
                title: true,
                status: true,
                capacity: true,
                isPaid: true,
                startAt: true,
                registrationDeadline: true,
                club: {
                  select: {
                    isActive: true,
                  },
                },
              },
            });

            if (!event) {
              return {
                status: 404,
                error: "Event not found.",
              };
            }

            if (
              event.status !== "PUBLISHED" ||
              !event.club.isActive
            ) {
              return {
                status: 400,
                error: "Registration is not available for this event.",
              };
            }

            // Paid registration needs payment verification.
            if (event.isPaid) {
              return {
                status: 400,
                error: "Online payment registration is coming soon.",
              };
            }

            const now = new Date();

            if (
              now >= event.registrationDeadline ||
              now >= event.startAt
            ) {
              return {
                status: 400,
                error: "Registration for this event has closed.",
              };
            }

            // Check duplicate registration
            const existing = await tx.registration.findUnique({
              where: {
                studentId_eventId: {
                  studentId: student.id,
                  eventId,
                },
              },
              select: {
                id: true,
              },
            });

            if (existing) {
              return {
                status: 409,
                error: "You are already registered for this event.",
              };
            }

            // Count confirmed registrations
            const bookedSeats = await tx.registration.count({
              where: {
                eventId,
              },
            });

            if (
              event.capacity <= 0 ||
              bookedSeats >= event.capacity
            ) {
              return {
                status: 409,
                error: "Sorry, this event is fully booked.",
              };
            }

            // Create registration in the same transaction
            const registration = await tx.registration.create({
              data: {
                studentId: student.id,
                eventId,
              },
              select: {
                id: true,
                createdAt: true,
              },
            });

            return {
              status: 201,
              success: true,
              message: "Registration successful!",
              registrationId: registration.id,
              eventTitle: event.title,
            };
          },
          {
            isolationLevel:
              Prisma.TransactionIsolationLevel.Serializable,
            maxWait: 10000,
            timeout: 15000,
          }
        );

        const { status, ...body } = result;

        return NextResponse.json(body, {
          status,
        });
      } catch (error) {
        // PostgreSQL serialization conflict:
        // retry the entire transaction.
        if (
          error.code === "P2034" &&
          attempt < MAX_RETRIES - 1
        ) {
          continue;
        }

        // Unique constraint prevents duplicate bookings.
        if (error.code === "P2002") {
          return NextResponse.json(
            {
              error: "You are already registered for this event.",
            },
            { status: 409 }
          );
        }

        throw error;
      }
    }

    return NextResponse.json(
      {
        error: "The event is busy. Please try again.",
      },
      { status: 409 }
    );
  } catch (error) {
    console.error("Event registration failed:", error);

    if (error.code === "P2034") {
      return NextResponse.json(
        {
          error: "Booking conflict. Please try again.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        error: "Unable to register right now. Please try again.",
      },
      { status: 500 }
    );
  }
}
