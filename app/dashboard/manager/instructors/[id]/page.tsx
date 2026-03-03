import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/requireRole";
import InstructorCoursesEditor from "./InstructorCoursesEditor";

export default async function InstructorDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("MANAGER");

  const { id } = await props.params;

  const instructor = await prisma.instructor.findUnique({
    where: { id },
    include: { courses: { select: { id: true } } },
  });

  if (!instructor) return <div className="p-6">Not found</div>;

  const allCourses = await prisma.course.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="px-4 pt-10">
      <div className="max-w-4xl mx-auto">
        <InstructorCoursesEditor
          instructor={{
            id: instructor.id,
            name: instructor.name,
            courseIds: instructor.courses.map((c) => c.id),
          }}
          allCourses={allCourses}
        />
      </div>
    </div>
  );
}