-- AlterTable
ALTER TABLE "Registration" ADD COLUMN     "checkedInAt" TIMESTAMP(3),
ADD COLUMN     "checkedInById" TEXT;

-- CreateIndex
CREATE INDEX "Registration_eventId_checkedInAt_idx" ON "Registration"("eventId", "checkedInAt");

-- CreateIndex
CREATE INDEX "Registration_checkedInById_idx" ON "Registration"("checkedInById");

-- AddForeignKey
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_checkedInById_fkey" FOREIGN KEY ("checkedInById") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;
