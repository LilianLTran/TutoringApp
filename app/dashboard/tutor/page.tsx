// app/dashboard/tutor/sessions/page.tsx
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/requireRole";

import SessionsView from "@/components/SessionsView/SessionsView";

import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function Page() {
  await requireRole("TUTOR");
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.toLowerCase();
  const user = await prisma.user.findUnique({ 
    where: { email }, 
    select: { id: true } 
  });
  if (!user) return <div className="p-6">User not found</div>;

  const tutorProfile = await prisma.tutorProfile.findUnique({ 
    where: { userId: user.id }
  });
  if (!tutorProfile) return <div className="p-6">No tutor profile</div>;

  const sessions = await prisma.tutoringSession.findMany({
    where: { tutorId: tutorProfile.id },
    orderBy: [{ date: "desc" }, { startMin: "desc" }],
    include: { 
      course: { select: { name: true } }, 
      student: { select: { name: true, email: true } } },
  });

  const rows = sessions.map(s => ({
    id: s.id,
    date: s.date.toISOString().slice(0,10),
    startMin: s.startMin,
    endMin: s.endMin,
    status: s.status,
    location: s.location ?? "",
    courseName: s.course.name,
    tutorName: undefined,
    tutorEmail: undefined,
    studentName: s.student.name ?? "",
    studentEmail: s.student.email,
  }));

  return <SessionsView initialSessions={rows} canChangeStatus={true} />;
}