import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/requireRole";
import ManagerCoursesView from "./ManagerCoursesView";

export default async function ManagerCoursesPage() {
  await requireRole("MANAGER");

  const courses = await prisma.course.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: {
          requests: true,
          sessions: true,
          tutors: true,
          instructors: true,
        },
      },
    },
  });

  return (
    <div className="px-4 pt-10">
      <div className="max-w-5xl mx-auto">
        <ManagerCoursesView initialCourses={courses} />
      </div>
    </div>
  );
}