"use server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function updateSessionStatus(input: {
  sessionId: string;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  cancelReason?: string;
}) {
  // Basic auth check (will throw if not logged in)
  const sess = await getServerSession(authOptions);
  if (!sess?.user) throw new Error("Not authenticated");

  // Fetch session first
  const s = await prisma.tutoringSession.findUnique({ where: { id: input.sessionId }, include: { tutor: { select: { id: true, userId: true } } }});
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
  const updated = await prisma.tutoringSession.update({ where: { id: input.sessionId }, data: { status: input.status } });

  // if cancelled -> trigger notify pipeline (send email)
  if (input.status === "CANCELLED") {
    // call your notify function (emails)
  }

  return { ok: true, sessionId: updated.id };
}