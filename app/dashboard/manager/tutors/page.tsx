import Link from "next/link"
import { prisma } from "@/lib/prisma"

export default async function TutorsPage() {
  const tutors = await prisma.tutorProfile.findMany({
    include: {
      courses: true,
      availability: true,
      sessions: true,
    },
  })
  console.log("APP DB:", process.env.DATABASE_URL)

  return (
    <div className="mt-8">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wide">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-center">Courses</th>
              <th className="px-6 py-3 text-center">Availability</th>
              <th className="px-6 py-3 text-center">Sessions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {tutors.map((tutor) => (
              <tr
                key={tutor.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 font-medium text-gray-900">
                  <Link
                    href={`/dashboard/manager/tutors/${tutor.id}`}
                    className="hover:text-black hover:underline"
                  >
                    {tutor.name}
                  </Link>
                </td>

                <td className="px-6 py-4 text-gray-600">
                  {tutor.email}
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      tutor.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {tutor.isActive ? "Active" : "Inactive"}
                  </span>
                </td>

                <td className="px-6 py-4 text-center text-gray-700">
                  {tutor.courses.length}
                </td>

                <td className="px-6 py-4 text-center text-gray-700">
                  {tutor.availability.length}
                </td>

                <td className="px-6 py-4 text-center text-gray-700">
                  {tutor.sessions.length}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}