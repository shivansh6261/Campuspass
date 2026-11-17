
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getCurrentStudent } from "@/lib/auth";

const profileSchema = z.object({
  phone: z.string().regex(
    /^[0-9]{10}$/,
    "Phone number must contain 10 digits."
  ),

  year: z.enum([
    "1st Year",
    "2nd Year",
    "3rd Year",
    "4th Year",
    "Other",
  ]),
}).strict();

export async function PATCH(request) {
  try {
    // Same-origin protection
    const origin = request.headers.get("origin");

    if (
      origin &&
      origin !== new URL(request.url).origin
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden.",
        },
        { status: 403 }
      );
    }

    // Verify student session
    const student = await getCurrentStudent();

    if (!student) {
      return NextResponse.json(
        {
          success: false,
          message: "Please log in first.",
        },
        { status: 401 }
      );
    }

    // Validate incoming data
    const body = await request.json();
    const result = profileSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid profile details.",
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // Update only allowed fields
    const updatedStudent = await prisma.student.update({
      where: {
        id: student.id,
      },

      data: {
        phone: result.data.phone,
        year: result.data.year,
      },

      select: {
        id: true,
        name: true,
        email: true,
        enrollment: true,
        phone: true,
        department: true,
        year: true,
        verificationStatus: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Profile updated successfully.",
        student: updatedStudent,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );

  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request data.",
        },
        { status: 400 }
      );
    }

    console.error("Profile update failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update profile.",
      },
      { status: 500 }
    );
  }
}
