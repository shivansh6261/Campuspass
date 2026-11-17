
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

// Validate all incoming student details
const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),

  email: z.email().trim().toLowerCase(),

  enrollment: z.string().trim().min(3).max(40),

  phone: z.string().regex(/^[0-9]{10}$/),

  department: z.enum([
    "Computer Science",
    "Information Technology",
    "Electronics",
    "Electrical",
    "Mechanical",
    "Civil",
    "Industrial & Production",
    "Other",
  ]),

  year: z.enum([
    "1st Year",
    "2nd Year",
    "3rd Year",
    "4th Year",
    "Other",
  ]),

  password: z.string().min(8).max(72),

  confirmPassword: z.string(),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  }
);

// Handle POST requests
export async function POST(request) {
  try {
    const body = await request.json();

    // Step 1: Validate request data
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid registration details.",
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = result.data;

    // Step 2: Check bcrypt's password length limit
    if (bcrypt.truncates(data.password)) {
      return NextResponse.json(
        {
          success: false,
          message: "Password is too long.",
        },
        { status: 400 }
      );
    }

    // Step 3: Hash the password
    const passwordHash = await bcrypt.hash(
      data.password,
      12
    );

    // Step 4: Save student to PostgreSQL
    const student = await prisma.student.create({
      data: {
        name: data.name,
        email: data.email,
        enrollment: data.enrollment,
        phone: data.phone,
        department: data.department,
        year: data.year,
        passwordHash,

        verificationStatus: "PENDING",
      },
      select: {
        id: true,
        name: true,
        email: true,
        enrollment: true,
        verificationStatus: true,
      },
    });

    // Step 5: Send success response
    return NextResponse.json(
      {
        success: true,
        message:
          "Registration received. Email and college verification are pending.",
        student,
      },
      { status: 201 }
    );

  } catch (error) {

    // Duplicate email or enrollment number
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Email or enrollment number is already registered.",
        },
        { status: 409 }
      );
    }

    // Invalid JSON request
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON request.",
        },
        { status: 400 }
      );
    }

    // Unexpected server error
    console.error("Registration request failed");

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong. Please try again.",
      },
      { status: 500 }
    );
  }
}
