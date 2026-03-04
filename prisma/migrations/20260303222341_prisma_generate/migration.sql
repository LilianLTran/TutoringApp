/*
  Warnings:

  - You are about to drop the column `timeRequest` on the `TutoringRequest` table. All the data in the column will be lost.
  - You are about to drop the column `end` on the `TutoringSession` table. All the data in the column will be lost.
  - You are about to drop the column `start` on the `TutoringSession` table. All the data in the column will be lost.
  - You are about to drop the `TutorAvailability` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `startMin` to the `TutoringRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date` to the `TutoringSession` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endMin` to the `TutoringSession` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startMin` to the `TutoringSession` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ExceptionType" AS ENUM ('REMOVE', 'ADD');

-- DropForeignKey
ALTER TABLE "TutorAvailability" DROP CONSTRAINT "TutorAvailability_tutorId_fkey";

-- DropIndex
DROP INDEX "TutoringSession_studentId_start_idx";

-- DropIndex
DROP INDEX "TutoringSession_tutorId_start_idx";

-- AlterTable
ALTER TABLE "TutoringRequest" DROP COLUMN "timeRequest",
ADD COLUMN     "startMin" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "TutoringSession" DROP COLUMN "end",
DROP COLUMN "start",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "endMin" INTEGER NOT NULL,
ADD COLUMN     "startMin" INTEGER NOT NULL;

-- DropTable
DROP TABLE "TutorAvailability";

-- CreateTable
CREATE TABLE "RecurringAvailability" (
    "id" TEXT NOT NULL,
    "tutorId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startMin" INTEGER NOT NULL,
    "endMin" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecurringAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AvailabilityException" (
    "id" TEXT NOT NULL,
    "tutorId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startMin" INTEGER NOT NULL,
    "endMin" INTEGER NOT NULL,
    "type" "ExceptionType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AvailabilityException_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RecurringAvailability_tutorId_dayOfWeek_idx" ON "RecurringAvailability"("tutorId", "dayOfWeek");

-- CreateIndex
CREATE INDEX "AvailabilityException_tutorId_date_idx" ON "AvailabilityException"("tutorId", "date");

-- CreateIndex
CREATE INDEX "TutoringSession_tutorId_date_idx" ON "TutoringSession"("tutorId", "date");

-- CreateIndex
CREATE INDEX "TutoringSession_studentId_date_idx" ON "TutoringSession"("studentId", "date");

-- AddForeignKey
ALTER TABLE "RecurringAvailability" ADD CONSTRAINT "RecurringAvailability_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "TutorProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvailabilityException" ADD CONSTRAINT "AvailabilityException_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "TutorProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
