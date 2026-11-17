
import "server-only";

import { cookies } from "next/headers";
import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";

export async function getCurrentStudent() {
  const cookieStore = await cookies();

  const token = cookieStore.get(
    "campuspass_session"
  )?.value;

  if (!token) return null;

  const tokenHash = createHash("sha256")
    .update(token)
    .digest("hex");

  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: {
      student: {
        select: {
          id: true,
          name: true,
          email: true,
          enrollment: true,
          phone: true,
          department: true,
          year: true,
          role: true,
          accountStatus: true,
          verificationStatus: true,
          emailVerifiedAt: true,
          collegeVerifiedAt: true,
          createdAt: true,
        },
      },
    },
  });

  if (!session) return null;

  if (session.expiresAt <= new Date()) {
    return null;
  }

  if (session.student.accountStatus !== "ACTIVE") {
    return null;
  }

  return session.student;
}
