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
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Tutors</h1>

      <table className="w-full border">
        <thead>
          <tr className="border-b">
            <th>Name</th>
            <th>Email</th>
            <th>Active</th>
            <th>Courses</th>
            <th>Availability</th>
            <th>Sessions</th>
          </tr>
        </thead>
        <tbody>
          {tutors.map((tutor) => (
            <tr key={tutor.id} className="border-b">
              <td>
                <Link
                  href={`/dashboard/manager/tutors/${tutor.id}`}
                  className="text-blue-600 hover:underline"
                >
                  {tutor.name}
                </Link>
              </td>
              <td>{tutor.email}</td>
              <td>{tutor.isActive ? "Yes" : "No"}</td>
              <td>{tutor.courses.length}</td>
              <td>{tutor.availability.length}</td>
              <td>{tutor.sessions.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}