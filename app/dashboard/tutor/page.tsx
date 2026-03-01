import { requireRole } from "@/lib/requireRole"

export default async function TutorDashboard() {
  await requireRole("TUTOR")

  return <div>Tutor Dashboard</div>
}