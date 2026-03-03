import { prisma } from "@/lib/prisma";
import TutorEditForm from "./TutorEditForm";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function TutorEditPage({ params }: PageProps) {
  const { id: tutorId } = await params;

  if (!tutorId) {
    return <div className="p-6">Missing tutor id in URL.</div>;
  }

  const [tutor, courses] = await Promise.all([
    prisma.tutorProfile.findUnique({
      where: { id: tutorId },
      include: { courses: true },
    }),
    prisma.course.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!tutor) return <div className="p-6">Tutor not found.</div>;

  return (
    <div className="p-6">
      <TutorEditForm
        tutor={{
          id: tutor.id,
          name: tutor.name,
          email: tutor.email,
          isActive: tutor.isActive,
          courseIds: tutor.courses.map((c) => c.id),
        }}
        allCourses={courses}
      />
    </div>
  );
}