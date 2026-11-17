
import { NextResponse } from "next/server";
import { getCurrentStudent } from "@/lib/auth";

export async function GET() {
  try {
    const student = await getCurrentStudent();

    if (!student) {
      return NextResponse.json(
        {
          authenticated: false,
          message: "Not logged in.",
        },
        {
          status: 401,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    return NextResponse.json(
      {
        authenticated: true,
        student,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Session verification failed");

    return NextResponse.json(
      {
        authenticated: false,
        message: "Unable to verify session.",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
