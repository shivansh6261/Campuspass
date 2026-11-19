
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentStudent } from "@/lib/auth";

function errorResponse(message, status) {
  return NextResponse.json(
    { success: false, message },
    { status }
  );
}

export async function PATCH(request, { params }) {
  try {
    const origin = request.headers.get("origin");

    if (origin !== new URL(request.url).origin) {
      return errorResponse("Forbidden.", 403);
    }

    const student = await getCurrentStudent();

    if (!student) {
      return errorResponse("Login required.", 401);
    }

    if (student.role !== "ORGANIZER") {
      return errorResponse(
        "Organizer access required.",
        403
      );
    }

    const { id } = await params;

    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      return errorResponse("Event not found.", 404);
    }

    const membership =
      await prisma.clubMembership.findFirst({
        where: {
          studentId: student.id,
          clubId: event.clubId,
          isActive: true,
          club: {
            isActive: true,
          },
        },
      });

    if (!membership) {
      return errorResponse(
        "You cannot publish this club's events.",
        403
      );
    }

    if (event.status !== "DRAFT") {
      return errorResponse(
        "Only draft events can be published.",
        400
      );
    }

    const now = new Date();

    if (
      event.startAt <= now ||
      event.endAt <= event.startAt ||
      event.registrationDeadline <= now ||
      event.registrationDeadline > event.startAt
    ) {
      return errorResponse(
        "Check the event dates before publishing.",
        400
      );
    }

    const result = await prisma.event.updateMany({
      where: {
        id,
        status: "DRAFT",
      },
      data: {
        status: "PUBLISHED",
      },
    });

    if (result.count !== 1) {
      return errorResponse(
        "Event status changed. Please refresh.",
        409
      );
    }

    return NextResponse.json({
      success: true,
      message: "Event published successfully.",
    });

  } catch (error) {
    console.error("Publish event failed:", error);

    return errorResponse(
      "Unable to publish event.",
      500
    );
  }
}
