import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/requireRole";
import SessionsView from "@/components/SessionsView/SessionsView";

export const dynamic = "force-dynamic";

export default async function Page() {
  await requireRole("MANAGER");
  const sessions = await prisma.tutoringSession.findMany({
    orderBy: [{ date: "desc" }, { startMin: "desc" }],
    include: { 
      course: { select: { name: true } }, 
      tutor: { select: { name: true, email: true } }, 
      student: { select: { name: true, email: true } } },
    take: 500,
  });

  const rows = sessions.map(s => ({
    id: s.id,
    date: s.date.toISOString().slice(0,10),
    startMin: s.startMin,
    endMin: s.endMin,
    status: s.status,
    location: s.location ?? "",
    courseName: s.course.name,
    tutorName: s.tutor.name,
    tutorEmail: s.tutor.email,
    studentName: s.student.name ?? "",
    studentEmail: s.student.email,
  }));

  return <SessionsView initialSessions={rows} canChangeStatus={true} />;
}