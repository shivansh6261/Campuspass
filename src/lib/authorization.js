
import "server-only";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentStudent } from "@/lib/auth";

// Any active, authenticated student
export async function requireStudent() {
  const student = await getCurrentStudent();

  if (!student) {
    redirect("/login");
  }

  return student;
}

// Only administrators
export async function requireAdmin() {
  const student = await requireStudent();

  if (student.role !== "ADMIN") {
    redirect("/student");
  }

  return student;
}

// Organizer must have an approved,
// active membership in an active club.
export async function requireOrganizer() {
  const student = await requireStudent();

  if (
    student.role !== "ORGANIZER" &&
    student.role !== "ADMIN"
  ) {
    redirect("/student");
  }

  const memberships = await prisma.clubMembership.findMany({
    where: {
      studentId: student.id,
      isActive: true,
      club: {
        isActive: true,
      },
    },
    include: {
      club: true,
    },
  });

  if (
    memberships.length === 0 &&
    student.role !== "ADMIN"
  ) {
    redirect("/student");
  }

  return {
    student,
    memberships,
  };
}
