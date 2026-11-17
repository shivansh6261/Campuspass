
import { NextResponse } from "next/server";
import { randomBytes, createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const SESSION_DURATION = 7 * 24 * 60 * 60;

const loginSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(1),
});

export async function POST(request) {
  try {
    const body = await request.json();

    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Enter a valid email and password.",
        },
        { status: 400 }
      );
    }

    const { email, password } = result.data;

    const student = await prisma.student.findUnique({
      where: { email },
    });

    if (!student) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    const validPassword = await bcrypt.compare(
      password,
      student.passwordHash
    );

    if (!validPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    if (student.accountStatus !== "ACTIVE") {
      return NextResponse.json(
        {
          success: false,
          message: "Your account is suspended.",
        },
        { status: 403 }
      );
    }

    const sessionToken = randomBytes(32).toString("hex");

    const tokenHash = createHash("sha256")
      .update(sessionToken)
      .digest("hex");

    const expiresAt = new Date(
      Date.now() + SESSION_DURATION * 1000
    );

    await prisma.session.create({
      data: {
        studentId: student.id,
        tokenHash,
        expiresAt,
      },
    });

    const response = NextResponse.json({
      success: true,
      message: "Login successful.",
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        role: student.role,
        verificationStatus: student.verificationStatus,
      },
    });

    response.cookies.set(
      "campuspass_session",
      sessionToken,
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: SESSION_DURATION,
      }
    );

    return response;

  } catch (error) {
    console.error("Login failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to sign in.",
      },
      { status: 500 }
    );
  }
}
