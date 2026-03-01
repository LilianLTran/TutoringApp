import { requireRole } from "@/lib/requireRole"

export default async function ManagerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireRole("MANAGER")

  return <>{children}</>
}