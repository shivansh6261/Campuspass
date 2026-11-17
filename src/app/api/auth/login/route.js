
import { NextResponse } from "next/server";
import { randomBytes, createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

// export const runtime = "nodejs";

const SESSION_DURATION = 7 * 24 * 60 * 60;

// Validate login input
const loginSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(1),
});

export async function POST(request) {
  try {
    const body = await request.json();

    // Step 1: Validate data
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

    // Step 2: Find student
    const student = await prisma.student.findUnique({
      where: { email },
    });

    // Do not reveal whether email exists
    if (!student) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    // Step 3: Verify password
    const passwordValid = await bcrypt.compare(
      password,
      student.passwordHash
    );

    if (!passwordValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    // Step 4: Generate cryptographically secure token
    const sessionToken = randomBytes(32).toString("hex");

    // Store only a hash of the token in database
    const tokenHash = createHash("sha256")
      .update(sessionToken)
      .digest("hex");

    const expiresAt = new Date(
      Date.now() + SESSION_DURATION * 1000
    );

    // Step 5: Save session in database
    await prisma.session.create({
      data: {
        studentId: student.id,
        tokenHash,
        expiresAt,
      },
    });

    // Step 6: Prepare response
    const response = NextResponse.json({
      success: true,
      message: "Login successful.",
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        verificationStatus: student.verificationStatus,
      },
    });

    // Step 7: Set secure session cookie
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
    console.error("Login request failed");

    return NextResponse.json(
      {
        success: false,
        message: "Unable to sign in. Please try again.",
      },
      { status: 500 }
    );
  }
}
