
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getCurrentStudent } from "@/lib/auth";

const eventSchema = z.object({
  title: z.string().trim().min(5).max(120),

  description: z.string().trim().min(30).max(10000),

  venue: z.string().trim().min(3).max(200),

  bannerUrl: z
    .string()
    .trim()
    .max(1000)
    .refine(
      (value) => !value || value.startsWith("https://"),
      "Banner must use an HTTPS URL."
    ),

  clubId: z.string().min(1),

  startAt: z.coerce.date(),
  endAt: z.coerce.date(),
  registrationDeadline: z.coerce.date(),

  capacity: z.number().int().min(1).max(100000),

  isPaid: z.boolean(),

  pricePaise: z.number().int().min(0).max(100000000),
});

function jsonError(message, status) {
  return NextResponse.json(
    { success: false, message },
    { status }
  );
}

export async function POST(request) {
  try {
    // Protect cookie-authenticated mutations.
    const origin = request.headers.get("origin");

    if (origin !== new URL(request.url).origin) {
      return jsonError("Forbidden.", 403);
    }

    const student = await getCurrentStudent();

    if (!student) {
      return jsonError("Login required.", 401);
    }

    if (student.role !== "ORGANIZER") {
      return jsonError("Organizer access required.", 403);
    }

    const body = await request.json();

    const parsed = eventSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Please check the event details.",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = parsed.data;

    if (data.startAt <= new Date()) {
      return jsonError(
        "Event start time must be in the future.",
        400
      );
    }

    if (data.endAt <= data.startAt) {
      return jsonError(
        "Event end time must be after the start time.",
        400
      );
    }

    if (
      data.registrationDeadline <= new Date() ||
      data.registrationDeadline > data.startAt
    ) {
      return jsonError(
        "Registration deadline must be in the future and no later than the event start.",
        400
      );
    }

    if (data.isPaid && data.pricePaise <= 0) {
      return jsonError(
        "Paid events must have a ticket price.",
        400
      );
    }

    // Check club authorization inside the transaction.
    const event = await prisma.$transaction(async (tx) => {
      const membership = await tx.clubMembership.findFirst({
        where: {
          studentId: student.id,
          clubId: data.clubId,
          isActive: true,
          club: {
            isActive: true,
          },
        },
        select: { id: true },
      });

      if (!membership) {
        return null;
      }

      return tx.event.create({
        data: {
          title: data.title,
          description: data.description,
          venue: data.venue,

          bannerUrl: data.bannerUrl || null,

          clubId: data.clubId,
          createdById: student.id,

          startAt: data.startAt,
          endAt: data.endAt,
          registrationDeadline: data.registrationDeadline,

          capacity: data.capacity,

          isPaid: data.isPaid,
          pricePaise: data.isPaid ? data.pricePaise : 0,

          status: "DRAFT",
        },
        select: {
          id: true,
          title: true,
          status: true,
          clubId: true,
        },
      });
    });

    if (!event) {
      return jsonError(
        "You are not authorized to create events for this club.",
        403
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Event draft created successfully.",
        event,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Event creation failed:", error);

    return jsonError(
      "Unable to create event. Please try again.",
      500
    );
  }
}
