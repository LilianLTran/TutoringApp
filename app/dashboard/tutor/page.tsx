import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

import TutorDashboardView from "./TutorDashboardView";

export const dynamic = "force-dynamic";

export default async function TutorDashboardPage() {

  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.toLowerCase().trim();

  if (!email) return <div className="p-6">Not authenticated</div>;

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true },
  });
  if (!user) return <div className="p-6">User not found</div>;

  const tutorProfile = await prisma.tutorProfile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });
  if (!tutorProfile) return <div className="p-6">No tutor profile</div>;

  const sessions = await prisma.tutoringSession.findMany({
    where: { tutorId: tutorProfile.id },
    orderBy: [{ date: "desc" }, { startMin: "desc" }],
    include: {
      course: { select: { name: true } },
      student: { select: { name: true, email: true } },
    },
  });

  const rows = sessions.map((s) => ({
    id: s.id,
    date: s.date.toISOString().slice(0, 10),
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

  return (
    <div className="px-4 pt-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Tutor Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your profile and review your session history.
          </p>
        </div>
        <TutorDashboardView user={user} rows={rows} />
      </div>
    </div>
  );
}