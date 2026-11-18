
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentStudent } from "@/lib/auth";

const clubSchema = z.object({
  name: z.string().trim().min(3).max(80),
  description: z.string().trim().max(500).optional(),
});

function isSameOrigin(request) {
  return (
    request.headers.get("origin") ===
    new URL(request.url).origin
  );
}

// GET: List active clubs
export async function GET() {
  try {
    const clubs = await prisma.club.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(
      { success: true, clubs },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Club listing failed:", error);

    return NextResponse.json(
      { success: false, message: "Unable to load clubs." },
      { status: 500 }
    );
  }
}

// POST: Admin creates a club
export async function POST(request) {
  try {
    if (!isSameOrigin(request)) {
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

    const body = await request.json();
    const parsed = clubSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Invalid club details." },
        { status: 400 }
      );
    }

    const { name, description } = parsed.data;

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          message: "Use a club name containing English letters or numbers.",
        },
        { status: 400 }
      );
    }

    const club = await prisma.club.create({
      data: {
        name,
        slug,
        description: description || null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Club created successfully.",
        club,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error.code === "P2002") {
      return NextResponse.json(
        {
          success: false,
          message: "A club with this name or slug already exists.",
        },
        { status: 409 }
      );
    }

    console.error("Club creation failed:", error);

    return NextResponse.json(
      { success: false, message: "Unable to create club." },
      { status: 500 }
    );
  }
}
