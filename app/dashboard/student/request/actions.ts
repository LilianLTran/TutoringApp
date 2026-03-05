"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
// import { sendStudentEmail, sendTutorEmail } from "@/lib/email";
import { revalidatePath } from "next/cache";

function parseDateOnly(dateKey: string) {
  // dateKey must be "YYYY-MM-DD"
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

export async function submitTutoringRequest(data: {
  fullName: string;
  cwid: string;
  courseId: string;
  instructorId: string;
  errorType: string;
  location: string;
  dssRequire: string;
  tutorId: string;
  startMin: number;
  dateKey: string;
}){
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.toLowerCase().trim();
  if (!email) throw new Error("Not authenticated");

  const me = await prisma.user.findUnique({ where: { email } });
  if (!me) throw new Error("User not found");

  // form fields
  const fullName = String(data.fullName ?? "");
  const cwid = String(data.cwid ?? "");
  const courseId = String(data.courseId ?? "");
  const instructorId = String(data.instructorId ?? "");
  const errorType = String(data.errorType?? "");
  const location = String(data.location?? "");
  const dssRequire = String(data.dssRequire ?? "");

  // chosen slot fields (from your slot picker)
  const tutorId = String(data.tutorId ?? "");
  const dateKey = String(data.dateKey ?? ""); // "YYYY-MM-DD"
  const startMinRaw = data.startMin;
  const startMin = startMinRaw == null ? NaN : Number(startMinRaw);

  if (!tutorId || !dateKey || !Number.isFinite(startMin)) {
    throw new Error("Missing selected tutor/date/time slot");
  }

  const dateOnly = parseDateOnly(dateKey);
  const endMin = startMin + 30;

  // (Optional but recommended) validate slot is actually available
  // e.g. call your computeTutorAvailableSlots(tutorId, dateOnly) and 
  // confirm it contains startMin

  let created: {
    requestId: string;
    sessionId: string;
    tutorEmail: string;
    tutorName: string;
  } | null = null;

  let createdSessionId: string | null = null;
  try {
    created = await prisma.$transaction(async (tx) => {
      // create session first (protected by @@unique([tutorId,date,startMin]))
      const newSession = await tx.tutoringSession.create({
        data: {
          tutorId,
          studentId: me.id,
          courseId,
          date: dateOnly,
          startMin,
          endMin,
          status: "SCHEDULED",
          location,
        },
        include: {
          tutor: { select: { name: true, email: true } },
          course: { select: { name: true } },
        },
      });
      createdSessionId = newSession.id;

      // create request linked to this session
      const newRequest = await tx.tutoringRequest.create({
        data: {
          fullName,
          cwid,
          dateRequest: dateOnly,
          startMin,
          errorType,
          location,
          dssRequire,
          courseId,
          instructorId,
          createdById: me.id,
          sessionId: newSession.id, // link
        },
      });

      return {
        requestId: newRequest.id,
        sessionId: newSession.id,
        tutorEmail: newSession.tutor.email,
        tutorName: newSession.tutor.name,
      };
    });
  } catch (err: any) {
    // Prisma unique constraint error -> slot already taken
    if (createdSessionId) {
      await prisma.tutoringSession.update({
        where: { id: createdSessionId },
        data: {status: "CANCELLED" },
      });
    }
    if (err?.code === "P2002") {
      throw new Error(
        "That slot was just booked by someone else. Please pick another one."
      );
    }
    throw err;
  }

  // Only email after DB success
  // await Promise.all([
  //   sendStudentEmail({
  //     to: me.email,
  //     studentName: fullName || me.name || "Student",
  //     tutorName: created.tutorName,
  //     dateKey,
  //     startMin,
  //     location,
  //   }),
  //   sendTutorEmail({
  //     to: created.tutorEmail,
  //     tutorName: created.tutorName,
  //     studentName: fullName || me.name || "Student",
  //     studentEmail: me.email,
  //     dateKey,
  //     startMin,
  //     location,
  //   }),
  // ]);

  revalidatePath("/dashboard/student"); // or wherever history shows
  return { ok: true, requestId: created.requestId, 
    sessionId: created.sessionId };
}