
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    // Check same-origin request
    const origin = request.headers.get("origin");

    if (
      origin &&
      origin !== new URL(request.url).origin
    ) {
      return NextResponse.json(
        { success: false, message: "Forbidden." },
        { status: 403 }
      );
    }

    const cookieStore = await cookies();

    const token = cookieStore.get(
      "campuspass_session"
    )?.value;

    if (token) {
      const tokenHash = createHash("sha256")
        .update(token)
        .digest("hex");

      // Revoke session in database
      await prisma.session.deleteMany({
        where: { tokenHash },
      });
    }

    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully.",
    });

    // Delete browser cookie
    response.cookies.set(
      "campuspass_session",
      "",
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
      }
    );

    return response;

  } catch (error) {
    console.error("Logout failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to log out.",
      },
      { status: 500 }
    );
  }
}
