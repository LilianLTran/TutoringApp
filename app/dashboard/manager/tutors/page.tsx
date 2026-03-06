import { prisma } from "@/lib/prisma";
import ManagerTutorsView from "./ManagerTutorsView";
import { requireRole } from "@/lib/requireRole";

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
        <ManagerTutorsView
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