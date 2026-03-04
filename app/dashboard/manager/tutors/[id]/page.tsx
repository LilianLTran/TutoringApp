import { prisma } from "@/lib/prisma"
import AvailabilityCalendar from "./AvailabilityCalendar"
import TutorCoursesCard from "./TutorCoursesCard";
import TutorInfoCard from "./TutorInfoCard";
import TutorProfileHeader from "./TutorProfileHeader";

export const dynamic = "force-dynamic";

export default async function TutorDetailPage(props: {
  params: Promise<{ id: string }>
}) {
  const params = await props.params

  const tutor = await prisma.tutorProfile.findUnique({
    where: { id: params.id },
    include: {
      courses: true,
      availability: true,
      sessions: {
        orderBy: { startMin: "desc" },
      },
    },
  })

  if (!tutor) return <div>Not found</div>

  return (
    <div className="space-y-8 mt-8">
      <TutorProfileHeader name={tutor.name} />

      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Basic Info Card */}
          <TutorInfoCard
            tutorId={tutor.id}
            email={tutor.email}
            isActive={tutor.isActive}
          />

          {/* Courses Card */}
          <TutorCoursesCard tutorId={tutor.id} courses={tutor.courses} />

        </div>
      </div>

      <div className="w-full flex justify-center">
        <div className="w-full max-w-5xl px-4 sm:px-6 lg:px-8">
          <AvailabilityCalendar tutorId={tutor.id} />
        </div>
      </div>
    </div>
  )
}