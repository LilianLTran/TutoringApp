"use server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import convertTime from "@/lib/covertTime";
import { dayKey } from "@/lib/dateNormalization";

import { 
  emailStudentSessionCancelled,
  emailTutorSessionCancelled
} from "@/lib/email/notify";

export async function updateSessionStatus(input: {
  sessionId: string;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  cancelReason?: string;
}) {
  // Basic auth check (will throw if not logged in)
  const sess = await getServerSession(authOptions);
  if (!sess?.user) throw new Error("Not authenticated");

  // Fetch session first
  const s = await prisma.tutoringSession.findUnique({
    where: { id: input.sessionId }, 
    include: { 
      tutor: { select: { id: true, userId: true, name: true, email: true } },
      student: { select: { id: true, name: true, email: true } },
      course: { select: { name: true } },
    }
  });
  if (!s) throw new Error("Session not found");

  // Manager can always update
  const isManager = sess.user.role === "MANAGER";
  const isTutor = sess.user.role === "TUTOR";

  if (!isManager) {
    // if tutor, ensure they own the tutor profile
    if (!isTutor || s.tutor.userId !== sess.user.id) {
      throw new Error("Not authorized to update this session");
    }
  }

  // proceed to update
  const updated = await prisma.tutoringSession.update({ 
    where: { id: input.sessionId }, 
    data: { status: input.status } 
  });

  // if cancelled -> trigger notify pipeline (send email)
  if (input.status === "CANCELLED") {
    const from = process.env.MAIL_FROM;
    if (!from) throw new Error("MAIL_FROM is not configured");

    const date = dayKey(s.date);
    const time = convertTime(s.startMin);
    const location = s.location ?? "";
    const reason = input.cancelReason ?? "";

    await Promise.all([
      emailStudentSessionCancelled({
        from,
        to: s.student.email,
        tutorName: s.tutor.name,
        studentName: s.student.name ?? "Student",
        courseName: s.course.name,
        date,
        time,
        location,
        reason,
      }),
      emailTutorSessionCancelled({
        from,
        to: s.tutor.email,
        tutorName: s.tutor.name,
        studentName: s.student.name ?? "Student",
        studentEmail: s.student.email,
        courseName: s.course.name,
        date,
        time,
        location,
        reason,
      }),
    ]);
  }

  return { ok: true, sessionId: updated.id };
}