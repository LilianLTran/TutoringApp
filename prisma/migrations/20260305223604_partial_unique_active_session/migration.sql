-- DropIndex
DROP INDEX "TutoringSession_tutorId_date_startMin_key";

CREATE UNIQUE INDEX "TutoringSession_unique_scheduled_slot"
ON "TutoringSession" ("tutorId", "date", "startMin")
WHERE "status" = 'SCHEDULED';