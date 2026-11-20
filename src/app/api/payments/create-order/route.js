
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getCurrentStudent } from "@/lib/auth";
import { getRazorpay } from "@/lib/razorpay";

const HOLD_MINUTES = 10;
const MAX_RETRIES = 5;

function fail(error, status) {
  return NextResponse.json(
    { success: false, error },
    { status }
  );
}

export async function POST(request) {
  try {
    const origin = request.headers.get("origin");

    if (
      origin &&
      origin !== new URL(request.url).origin
    ) {
      return fail("Invalid request origin.", 403);
    }

    const session = await getCurrentStudent();

    if (!session?.id) {
      return fail("Please log in first.", 401);
    }

    const student = await prisma.student.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        role: true,
        accountStatus: true,
      },
    });

    if (
      !student ||
      student.role !== "STUDENT" ||
      student.accountStatus !== "ACTIVE"
    ) {
      return fail("Student account required.", 403);
    }

    let body;

    try {
      body = await request.json();
    } catch {
      return fail("Invalid request body.", 400);
    }

    const eventId = body?.eventId;

    if (
      typeof eventId !== "string" ||
      !/^[a-zA-Z0-9_-]{10,80}$/.test(eventId)
    ) {
      return fail("Invalid event ID.", 400);
    }

    let reservation;

    // Serializable transaction prevents concurrent
    // checkout attempts from over-reserving seats.
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        reservation = await prisma.$transaction(
          async (tx) => {
            const now = new Date();

            const event = await tx.event.findUnique({
              where: { id: eventId },
              include: {
                club: {
                  select: { isActive: true },
                },
              },
            });

            if (
              !event ||
              event.status !== "PUBLISHED" ||
              !event.club.isActive ||
              !event.isPaid ||
              event.pricePaise <= 0 ||
              now >= event.registrationDeadline ||
              now >= event.startAt
            ) {
              return {
                kind: "error",
                message: "Paid booking is unavailable.",
                status: 400,
              };
            }

            const alreadyRegistered =
              await tx.registration.findUnique({
                where: {
                  studentId_eventId: {
                    studentId: student.id,
                    eventId,
                  },
                },
                select: { id: true },
              });

            if (alreadyRegistered) {
              return {
                kind: "error",
                message: "You are already registered.",
                status: 409,
              };
            }

            // Reuse a valid existing checkout.
            const existingHold =
              await tx.paymentOrder.findFirst({
                where: {
                  studentId: student.id,
                  eventId,
                  status: {
                    in: ["RESERVED", "ORDER_CREATED"],
                  },
                  expiresAt: { gt: now },
                },
                orderBy: { createdAt: "desc" },
              });

            if (existingHold) {
              return {
                kind: "existing",
                hold: existingHold,
              };
            }

            const registered =
              await tx.registration.count({
                where: { eventId },
              });

            const activeHolds =
              await tx.paymentOrder.count({
                where: {
                  eventId,
                  status: {
                    in: ["RESERVED", "ORDER_CREATED"],
                  },
                  expiresAt: { gt: now },
                },
              });

            if (
              registered + activeHolds >= event.capacity
            ) {
              return {
                kind: "error",
                message: "This event is sold out.",
                status: 409,
              };
            }

            const expiresAt = new Date(
              now.getTime() +
                HOLD_MINUTES * 60 * 1000
            );

            const hold = await tx.paymentOrder.create({
              data: {
                studentId: student.id,
                eventId,
                amountPaise: event.pricePaise,
                currency: "INR",
                status: "RESERVED",
                expiresAt,
              },
            });

            return { kind: "new", hold };
          },
          {
            isolationLevel:
              Prisma.TransactionIsolationLevel.Serializable,
          }
        );

        break;
      } catch (error) {
        if (
          error.code === "P2034" &&
          attempt < MAX_RETRIES - 1
        ) {
          continue;
        }

        throw error;
      }
    }

    if (reservation.kind === "error") {
      return fail(
        reservation.message,
        reservation.status
      );
    }

    const hold = reservation.hold;

    if (reservation.kind === "existing") {
      if (
        hold.status !== "ORDER_CREATED" ||
        !hold.razorpayOrderId
      ) {
        return fail(
          "Checkout is being prepared. Retry shortly.",
          409
        );
      }

      return NextResponse.json({
        success: true,
        keyId: process.env.RAZORPAY_KEY_ID,
        orderId: hold.razorpayOrderId,
        amount: hold.amountPaise,
        currency: hold.currency,
        expiresAt: hold.expiresAt,
      });
    }

    // Call Razorpay OUTSIDE the database transaction.
    let gatewayOrder;

    try {
      gatewayOrder = await getRazorpay().orders.create({
        amount: hold.amountPaise,
        currency: "INR",
        receipt: hold.id,
        notes: {
          eventId,
          studentId: student.id,
        },
      });
    } catch (error) {
      console.error("Razorpay order creation failed:", error);

      await prisma.paymentOrder.updateMany({
        where: {
          id: hold.id,
          status: "RESERVED",
        },
        data: { status: "FAILED" },
      });

      return fail(
        "Unable to initialize payment. Try again.",
        502
      );
    }

    const updated = await prisma.paymentOrder.updateMany({
      where: {
        id: hold.id,
        status: "RESERVED",
        expiresAt: { gt: new Date() },
      },
      data: {
        razorpayOrderId: gatewayOrder.id,
        status: "ORDER_CREATED",
      },
    });

    if (updated.count !== 1) {
      return fail(
        "Seat reservation expired. Please retry.",
        409
      );
    }

    return NextResponse.json({
      success: true,
      keyId: process.env.RAZORPAY_KEY_ID,
      orderId: gatewayOrder.id,
      amount: hold.amountPaise,
      currency: "INR",
      expiresAt: hold.expiresAt,
    });
  } catch (error) {
    console.error("Create payment order error:", error);

    return fail(
      "Unable to create payment order.",
      500
    );
  }
}
