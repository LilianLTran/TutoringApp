/*
  Warnings:

  - A unique constraint covering the columns `[tutorId,date,startMin]` on the table `TutoringSession` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "TutoringSession_tutorId_date_startMin_key" ON "TutoringSession"("tutorId", "date", "startMin");
