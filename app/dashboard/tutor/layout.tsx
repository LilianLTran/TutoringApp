import { requireRole } from "@/lib/requireRole"

export default async function TutorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireRole("TUTOR")

  return <>{children}</>
}