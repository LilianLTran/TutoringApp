import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/api/auth/signin")
  }

  if (!session.user?.role) {
    redirect("/")
  }

  switch (session.user.role) {
    case "STUDENT":
      redirect("/dashboard/student")

    case "TUTOR":
      redirect("/dashboard/tutor")

    case "MANAGER":
      redirect("/dashboard/manager")

    default:
      redirect("/")
  }
}