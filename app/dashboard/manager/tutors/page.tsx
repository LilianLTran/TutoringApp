import { prisma } from "@/lib/prisma";
import TutorsView from "@/components/ManagerTutorsView";
import { requireRole } from "@/lib/requireRole";

export const dynamic = "force-dynamic"; // optional, safe for manager pages

export default async function TutorsPage() {
  await requireRole("MANAGER");

  const tutors = await prisma.tutorProfile.findMany({
    orderBy: { name: "asc" },
    include: {
      courses: true,
      availability: true,
      sessions: true,
    },
  });

  return (
    <div className="mt-8">
      <div className="max-w-5xl mx-auto">
        {/* TutorsView is a client component that receives server data as initial state */}
        {/* Passing minimal fields to keep payload small */}
        <TutorsView
          initialTutors={tutors.map((t) => ({
            id: t.id,
            name: t.name,
            email: t.email,
            isActive: t.isActive,
            coursesCount: t.courses?.length ?? 0,
            availabilityCount: t.availability?.length ?? 0,
            sessionsCount: t.sessions?.length ?? 0,
          }))}
        />
      </div>
    </div>
  );
}