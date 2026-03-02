import { prisma } from "@/lib/prisma"
import AvailabilityCalendar from "@/components/AvailabilityCalendar"
import Link from "next/link"

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
        orderBy: { start: "desc" },
      },
    },
  })

  if (!tutor) return <div>Not found</div>

  return (
    <div className="space-y-8">
      <br></br>
      <div className="flex items-center gap-4 mb-6 pl-4">
        <div className="h-12 w-12 rounded-full bg-[#CC1A1F] text-white flex items-center justify-center font-semibold text-lg">
          {tutor.name.charAt(0)}
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {tutor.name}
          </h1>
          <p className="text-sm text-gray-500">Tutor Profile</p>
        </div>
      </div>


      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Basic Info Card */}
          <Link href={`/dashboard/manager/tutors/${tutor.id}/edit`} className="block">
            <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-gray-300 transition cursor-pointer">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
                Basic Info
              </h2>

              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-500">Email</span>
                  <span>{tutor.email}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-500">Status</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      tutor.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {tutor.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </section>
          </Link>

          {/* Courses Card */}
          <Link href={`/dashboard/manager/tutors/${tutor.id}/edit`} className="block">
            <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-gray-300 transition cursor-pointer">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
                Courses
              </h2>

              <ul className="space-y-2">
                {tutor.courses.map((course) => (
                  <li
                    key={course.id}
                    className="px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-700"
                  >
                    {course.name}
                  </li>
                ))}
              </ul>
            </section>
          </Link>

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