
import "server-only";

import { cookies } from "next/headers";
import { createHash } from "node:crypto";

import { prisma } from "@/lib/prisma";

export async function getCurrentStudent() {
  const cookieStore = await cookies();

  const token = cookieStore.get(
    "campuspass_session"
  )?.value;

  if (!token) {
    return null;
  }

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
          department: true,
          year: true,
          verificationStatus: true,
          emailVerifiedAt: true,
        },
      },
    },
  });

  if (!session) {
    return null;
  }

  // Check expiration
  if (session.expiresAt <= new Date()) {
    return null;
  }

  return session.student;
}
