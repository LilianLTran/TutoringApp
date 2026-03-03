import { prisma } from "@/lib/prisma"
import CreateRequestForm from "./CreateRequestForm"
import { revalidatePath } from "next/cache"

export default async function StudentDashboard() {
  const courses = await prisma.course.findMany({
    orderBy: {
      name: "asc",
    },
  })

  const instructors = await prisma.instructor.findMany({
    include: {
      courses: {
        orderBy: { name: "asc" },
      },
    },
    orderBy: { name: "asc" },
  })

  async function createRequest(formData: FormData) {
    "use server"

    const fullName = formData.get("fullName") as string
    const cwid = formData.get("cwid") as string
    const courseId = formData.get("courseId") as string
    const instructorId = formData.get("instructorId") as string
    const dateRequest = formData.get("dateRequest") as string
    const timeRequest = formData.get("timeRequest") as string
    const errorType = formData.get("errorType") as string
    const location = formData.get("location") as string
    const dssRequire = formData.get("dssRequire") as string

    const user = await prisma.user.findFirst()

    if (!user) {
      throw new Error("User not found")
    }

    await prisma.tutoringRequest.create({
      data: {
        fullName,
        cwid,
        courseId,
        instructorId,
        dateRequest: new Date(dateRequest),
        timeRequest,
        errorType,
        location,
        dssRequire,
        createdById: user.id,
      },
    })

    revalidatePath("/student/dashboard")
  }

  return (
    <div className="p-10">
      <CreateRequestForm
        courses={courses}
        instructors={instructors}
        action={createRequest}
      />
    </div>
  )
}