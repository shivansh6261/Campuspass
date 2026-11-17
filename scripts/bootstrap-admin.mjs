
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();

  if (!email) {
    throw new Error(
      "Provide the email of an existing account."
    );
  }

  const student = await prisma.student.findUnique({
    where: { email },
  });

  if (!student) {
    throw new Error(
      "Account not found. Register the account first."
    );
  }

  if (student.accountStatus !== "ACTIVE") {
    throw new Error("Account is not active.");
  }

  await prisma.student.update({
    where: { id: student.id },
    data: { role: "ADMIN" },
  });

  console.log(
    `Admin access assigned to: ${student.email}`
  );
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
