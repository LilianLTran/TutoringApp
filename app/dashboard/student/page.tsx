import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/requireRole";
import StudentDashboardView from "./StudentDashboardView";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function StudentDashboardPage() {
  await requireRole("STUDENT");

  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.toLowerCase().trim();

  if (!email) {
    return <div className="p-6">Not authenticated</div>;
  }

  const me = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true },
  });

  if (!me) {
    return <div className="p-6">User not found</div>;
  }

  const sessions = await prisma.tutoringSession.findMany({
    where: { studentId: me.id },
    orderBy: { startMin: "desc" },
    include: {
      course: { select: { name: true } },
      tutor: { select: { name: true, email: true } },
    },
  });

  return (
    <div className="px-4 pt-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Student Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your profile, request tutoring, 
            and review your session history.
          </p>
        </div>

        <StudentDashboardView
          user={{ id: me.id, email: me.email, name: me.name ?? "" }}
          sessions={sessions.map((s) => ({
            id: s.id,
            date: s.date,
            start: s.startMin,
            end: s.endMin,
            status: s.status,
            location: s.location ?? "",
            courseName: s.course.name,
            tutorName: s.tutor.name,
          }))}
        />
      </div>
    </div>
  );
}