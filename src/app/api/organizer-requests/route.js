
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentStudent } from "@/lib/auth";

const requestSchema = z.object({
  clubId: z.string().min(1),
  reason: z.string().trim().min(20).max(500),
});

function isSameOrigin(request) {
  return (
    request.headers.get("origin") ===
    new URL(request.url).origin
  );
}

// GET: Student sees own requests;
// admin sees pending applications.
export async function GET() {
  try {
    const student = await getCurrentStudent();

    if (!student) {
      return NextResponse.json(
        { success: false, message: "Login required." },
        { status: 401 }
      );
    }

    const isAdmin = student.role === "ADMIN";

    const requests = await prisma.organizerRequest.findMany({
      where: isAdmin
        ? { status: "PENDING" }
        : { studentId: student.id },
      include: {
        club: {
          select: {
            id: true,
            name: true,
            slug: true,
            isActive: true,
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            enrollment: true,
            department: true,
            year: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      { success: true, requests },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Organizer requests GET failed:", error);

    return NextResponse.json(
      { success: false, message: "Unable to load requests." },
      { status: 500 }
    );
  }
}

// POST: Apply for organizer access
export async function POST(request) {
  try {
    if (!isSameOrigin(request)) {
      return NextResponse.json(
        { success: false, message: "Forbidden." },
        { status: 403 }
      );
    }

    const student = await getCurrentStudent();

    if (!student) {
      return NextResponse.json(
        { success: false, message: "Please log in." },
        { status: 401 }
      );
    }

    if (student.role === "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Admin accounts cannot apply." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Select a club and provide at least 20 characters.",
        },
        { status: 400 }
      );
    }

    const { clubId, reason } = parsed.data;

    const club = await prisma.club.findUnique({
      where: { id: clubId },
    });

    if (!club || !club.isActive) {
      return NextResponse.json(
        { success: false, message: "Club not available." },
        { status: 404 }
      );
    }

    const membership = await prisma.clubMembership.findUnique({
      where: {
        studentId_clubId: {
          studentId: student.id,
          clubId,
        },
      },
    });

    if (membership?.isActive) {
      return NextResponse.json(
        {
          success: false,
          message: "You are already an organizer for this club.",
        },
        { status: 409 }
      );
    }

    const existing = await prisma.organizerRequest.findUnique({
      where: {
        studentId_clubId: {
          studentId: student.id,
          clubId,
        },
      },
    });

    if (existing?.status === "PENDING") {
      return NextResponse.json(
        {
          success: false,
          message: "Your application is already pending.",
        },
        { status: 409 }
      );
    }

    const application = await prisma.organizerRequest.upsert({
      where: {
        studentId_clubId: {
          studentId: student.id,
          clubId,
        },
      },
      create: {
        studentId: student.id,
        clubId,
        reason,
        status: "PENDING",
      },
      update: {
        reason,
        status: "PENDING",
        reviewedById: null,
        reviewedAt: null,
        reviewNote: null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Organizer application submitted.",
        application,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Organizer application failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to submit application.",
      },
      { status: 500 }
    );
  }
}
