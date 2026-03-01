import ManagerDashboardView from "@/components/ManagerDashboardView";
import { prisma } from "@/lib/prisma";

export default async function ManagerDashboardPage() {
  const [activeTutors, courses, instructors] = await Promise.all([
    prisma.tutorProfile.count({ where: { isActive: true } }),
    prisma.course.count(),
    prisma.instructor.count(),
  ]);

  return (
    <ManagerDashboardView
      stats={{
        activeTutors,
        courses,
        instructors,
      }}
    />
  );
}