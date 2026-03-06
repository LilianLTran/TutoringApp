import { prisma } from "@/lib/prisma";
import { sendTemplatedEmail } from "@/lib/email/pipeline";
import type { SessionStatus } from "@prisma/client";

import convertTime from "@/lib/covertTime";

type Actor =
  | { role: "MANAGER"; userId: string }
  | { role: "TUTOR"; userId: string; tutorProfileId: string };

type UpdateSessionStatusInput = {
  sessionId: string;
  nextStatus: SessionStatus;
  reason?: string;
};

export async function updateSessionStatus(
  actor: Actor,
  input: UpdateSessionStatusInput
) {
  const { sessionId, nextStatus, reason } = input;

  const session = await prisma.tutoringSession.findUnique({
    where: { id: sessionId },
    include: {
      tutor: { select: { id: true, name: true, email: true } },
      student: { select: { id: true, email: true, name: true } },
      course: { select: { name: true } },
    },
  });

  if (!session) throw new Error("Session not found.");

  console.log("updateSessionStatus", {
    sessionId,
    prev: session.status,
    next: nextStatus,
    willEmail: nextStatus === "CANCELLED",
  });

  // Auth rules
  if (actor.role === "TUTOR") {
    if (session.tutorId !== actor.tutorProfileId) {
      throw new Error("Not allowed to update this session.");
    }
  }

  if (session.status === nextStatus) {
    return { ok: true as const, changed: false as const };
  }

  const updated = await prisma.tutoringSession.update({
    where: { id: sessionId },
    data: { status: nextStatus },
  });

  const from = process.env.MAIL_FROM;
  if (!from) {
    throw new Error("MAIL_FROM is not configured");
  }

  // Email notify rules
  if (nextStatus === "CANCELLED") {
    const dateKey = session.date.toISOString().slice(0, 10);
    const time = convertTime(session.startMin);

    // Fire emails in parallel (don’t block the DB update)
    await Promise.all([
      sendTemplatedEmail({
        from,
        to: session.student.email,
        templateKey: "SESSION_CANCELLED_STUDENT",
        variables: {
          studentName: session.student.name ?? "Student",
          tutorName: session.tutor.name,
          courseName: session.course.name,
          date: dateKey,
          time,
          location: session.location ?? "",
          reason: reason ?? "",
        },
      }),

      sendTemplatedEmail({
        from,
        to: session.tutor.email,
        templateKey: "SESSION_CANCELLED_TUTOR",
        variables: {
          tutorName: session.tutor.name,
          studentName: session.student.name ?? "Student",
          studentEmail: session.student.email,
          courseName: session.course.name,
          date: dateKey,
          time,
          location: session.location ?? "",
          reason: reason ?? "",
        },
      }),
    ]);
  }

  return { ok: true as const, changed: true as const, session: updated };
}