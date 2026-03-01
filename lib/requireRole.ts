import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

type Role = "STUDENT" | "TUTOR" | "MANAGER"

export async function requireRole(allowedRoles: Role | Role[]) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect("/login")
  }

  const userRole = session.user.role as Role

  // Convert single role to array
  const rolesArray = Array.isArray(allowedRoles)
    ? allowedRoles
    : [allowedRoles]

  if (!rolesArray.includes(userRole)) {
    redirect("/dashboard") // or unauthorized page
  }

  return session
}