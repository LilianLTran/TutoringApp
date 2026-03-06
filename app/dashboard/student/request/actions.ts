"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { sendTemplatedEmail } from "@/lib/email/pipeline";

import convertTime from "@/lib/covertTime";
import { create } from "domain";

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

  // Form fields
  const fullName = String(data.fullName ?? "");
  const cwid = String(data.cwid ?? "");
  const courseId = String(data.courseId ?? "");
  const instructorId = String(data.instructorId ?? "");
  const errorType = String(data.errorType?? "");
  const location = String(data.location?? "");
  const dssRequire = String(data.dssRequire ?? "");

  const tutorId = String(data.tutorId ?? "");
  const dateKey = String(data.dateKey ?? ""); // "YYYY-MM-DD"
  const startMinRaw = data.startMin;
  const startMin = startMinRaw == null ? NaN : Number(startMinRaw);

  if (!tutorId || !dateKey || !Number.isFinite(startMin)) {
    throw new Error("Missing selected tutor/date/time slot");
  }

  const dateOnly = parseDateOnly(dateKey);
  const endMin = startMin + 30;

  let created: {
    requestId: string;
    sessionId: string;
    tutorEmail: string;
    tutorName: string;
    courseName: string;
    location: string;
  } | null = null;

  let createdSessionId: string | null = null;
  try {
    created = await prisma.$transaction(async (tx) => {
      // Create session first (protected by @@unique([tutorId,date,startMin]))
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

      // Create request linked to this session
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
        courseName: newSession.course.name,
        location: newSession.location ?? "",
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

  if (!created) throw new Error("Failed to create session/request");
  
  const from = process.env.MAIL_FROM;
  if (!from) throw new Error("MAIL_FROM is not configured");

  const time = convertTime(startMin);

  await Promise.all([
    sendTemplatedEmail({
      from,
      to: me.email,
      templateKey: "SESSION_CREATED_STUDENT",
      variables: {
        studentName: me.name ?? fullName ?? "Student",
        tutorName: created.tutorName,
        courseName: created.courseName,
        date: dateKey,
        time,
        location: created.location,
      },
    }),

    sendTemplatedEmail({
      from,
      to: created.tutorEmail,
      templateKey: "SESSION_CREATED_TUTOR",
      variables: {
        tutorName: created.tutorName,
        studentName: me.name ?? fullName ?? "Student",
        studentEmail: me.email,
        courseName: created.courseName,
        date: dateKey,
        time,
        location: created.location,
      },
    }),
  ]);
};