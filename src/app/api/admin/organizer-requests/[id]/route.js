
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentStudent } from "@/lib/auth";

const decisionSchema = z.object({
  action: z.enum(["APPROVE", "REJECT"]),
  reviewNote: z.string().trim().max(500).optional(),
});

export async function PATCH(request, { params }) {
  try {
    const origin = request.headers.get("origin");

    if (origin !== new URL(request.url).origin) {
      return NextResponse.json(
        { success: false, message: "Forbidden." },
        { status: 403 }
      );
    }

    const admin = await getCurrentStudent();

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Login required." },
        { status: 401 }
      );
    }

    if (admin.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Admin access required." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = decisionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Invalid decision." },
        { status: 400 }
      );
    }

    const { action, reviewNote } = parsed.data;

    if (
      action === "REJECT" &&
      (!reviewNote || reviewNote.length < 10)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Provide a rejection reason of at least 10 characters.",
        },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const application = await tx.organizerRequest.findUnique({
        where: { id },
        include: {
          club: true,
          student: true,
        },
      });

      if (!application) {
        return { error: "NOT_FOUND" };
      }

      if (application.status !== "PENDING") {
        return { error: "ALREADY_REVIEWED" };
      }

      if (action === "APPROVE") {
        if (
          !application.club.isActive ||
          application.student.accountStatus !== "ACTIVE"
        ) {
          return { error: "INACTIVE_ACCOUNT_OR_CLUB" };
        }
      }

      const updated = await tx.organizerRequest.updateMany({
        where: {
          id,
          status: "PENDING",
        },
        data: {
          status: action === "APPROVE"
            ? "APPROVED"
            : "REJECTED",
          reviewedById: admin.id,
          reviewedAt: new Date(),
          reviewNote: reviewNote || null,
        },
      });

      if (updated.count !== 1) {
        return { error: "ALREADY_REVIEWED" };
      }

      if (action === "APPROVE") {
        await tx.clubMembership.upsert({
          where: {
            studentId_clubId: {
              studentId: application.studentId,
              clubId: application.clubId,
            },
          },
          update: {
            isActive: true,
            approvedAt: new Date(),
          },
          create: {
            studentId: application.studentId,
            clubId: application.clubId,
            isActive: true,
          },
        });

        await tx.student.updateMany({
          where: {
            id: application.studentId,
            role: "STUDENT",
          },
          data: {
            role: "ORGANIZER",
          },
        });
      }

      return { success: true };
    });

    if (result.error) {
      const messages = {
        NOT_FOUND: "Application not found.",
        ALREADY_REVIEWED: "Application already reviewed.",
        INACTIVE_ACCOUNT_OR_CLUB: "Student or club is inactive.",
      };

      return NextResponse.json(
        {
          success: false,
          message: messages[result.error],
        },
        {
          status: result.error === "NOT_FOUND" ? 404 : 409,
        }
      );
    }

    return NextResponse.json({
      success: true,
      message: action === "APPROVE"
        ? "Organizer approved successfully."
        : "Application rejected.",
    });
  } catch (error) {
    console.error("Organizer approval failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to process organizer request.",
      },
      { status: 500 }
    );
  }
}
