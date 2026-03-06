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

    const user = await prisma.user.findFirst()

    if (!user) {
      throw new Error("User not found")
    }
    
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