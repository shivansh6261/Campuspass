
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentStudent } from "@/lib/auth";
import { verifyTicket } from "@/lib/tickets";

const EARLY_CHECKIN_MS = 2 * 60 * 60 * 1000;

function errorResponse(message, status) {
  return NextResponse.json(
    { success: false, error: message },
    { status }
  );
}

export async function POST(request) {
  try {
    const origin = request.headers.get("origin");
    const expectedOrigin = new URL(request.url).origin;

    if (origin && origin !== expectedOrigin) {
      return errorResponse("Invalid request origin.", 403);
    }

    // 1. Authenticate organizer
    const currentStudent = await getCurrentStudent();

    if (!currentStudent?.id) {
      return errorResponse("Please log in.", 401);
    }

    const organizer = await prisma.student.findUnique({
      where: { id: currentStudent.id },
      select: {
        id: true,
        role: true,
        accountStatus: true,
      },
    });

    if (
      !organizer ||
      organizer.role !== "ORGANIZER" ||
      organizer.accountStatus !== "ACTIVE"
    ) {
      return errorResponse(
        "Only active organizers can verify tickets.",
        403
      );
    }

    // 2. Read request
    let body;

    try {
      body = await request.json();
    } catch {
      return errorResponse("Invalid request body.", 400);
    }

    const { action, ticket } = body || {};

    if (!["preview", "confirm"].includes(action)) {
      return errorResponse("Invalid verification action.", 400);
    }

    if (
      typeof ticket !== "string" ||
      ticket.length > 256
    ) {
      return errorResponse("Invalid QR ticket.", 400);
    }

    // 3. Verify cryptographic signature
    const registrationId = verifyTicket(ticket);

    if (!registrationId) {
      return errorResponse(
        "Invalid or tampered QR ticket.",
        400
      );
    }

    // 4. Load booking and student identity
    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            enrollment: true,
            department: true,
            year: true,
            accountStatus: true,
          },
        },
        event: {
          include: {
            club: {
              select: {
                name: true,
                isActive: true,
              },
            },
          },
        },
      },
    });

    if (!registration) {
      return errorResponse("Registration not found.", 404);
    }

    const event = registration.event;
    const student = registration.student;

    // 5. Organizer must belong to the event's club
    const membership = await prisma.clubMembership.findFirst({
      where: {
        studentId: organizer.id,
        clubId: event.clubId,
        isActive: true,
        club: {
          isActive: true,
        },
      },
      select: { id: true },
    });

    if (!membership) {
      return errorResponse(
        "You cannot verify tickets for this club.",
        403
      );
    }

    // 6. Validate event and registration
    if (
      event.status !== "PUBLISHED" ||
      !event.club.isActive
    ) {
      return errorResponse(
        "Check-in is unavailable for this event.",
        400
      );
    }

    if (student.accountStatus !== "ACTIVE") {
      return errorResponse(
        "Student account is not active.",
        403
      );
    }

    const now = new Date();

    if (
      now.getTime() <
      event.startAt.getTime() - EARLY_CHECKIN_MS
    ) {
      return errorResponse(
        "Check-in opens two hours before the event.",
        400
      );
    }

    if (now >= event.endAt) {
      return errorResponse(
        "Event check-in has closed.",
        400
      );
    }

    if (registration.checkedInAt) {
      return errorResponse(
        "This student has already checked in.",
        409
      );
    }

    // 7. PREVIEW: show student details before entry
    if (action === "preview") {
      return NextResponse.json({
        success: true,
        status: "AWAITING_ID_VERIFICATION",
        message: "Verify the student's college ID card.",
        student: {
          name: student.name,
          enrollment: student.enrollment,
          department: student.department,
          year: student.year,
        },
        event: {
          title: event.title,
          clubName: event.club.name,
          venue: event.venue,
        },
        registrationId: registration.id,
      });
    }

    // 8. CONFIRM: only after physical ID verification
    // Atomic update prevents duplicate check-ins.
    const updated = await prisma.registration.updateMany({
      where: {
        id: registration.id,
        checkedInAt: null,
        student: {
          accountStatus: "ACTIVE",
        },
        event: {
          status: "PUBLISHED",
          club: {
            isActive: true,
          },
        },
      },
      data: {
        checkedInAt: now,
        checkedInById: organizer.id,
      },
    });

    if (updated.count !== 1) {
      return errorResponse(
        "Ticket already used or no longer eligible.",
        409
      );
    }

    return NextResponse.json({
      success: true,
      status: "CHECKED_IN",
      message: "Student entry confirmed successfully!",
      student: {
        name: student.name,
        enrollment: student.enrollment,
        department: student.department,
        year: student.year,
      },
      event: {
        title: event.title,
        clubName: event.club.name,
      },
      checkedInAt: now.toISOString(),
    });
  } catch (error) {
    console.error("QR verification error:", error);

    return errorResponse(
      "Unable to verify the ticket right now.",
      500
    );
  }
}
