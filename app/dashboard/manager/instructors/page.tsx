export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/requireRole";
import ManagerInstructorsView from "@/components/ManagerInstructorsView";

export default async function ManagerInstructorsPage() {
  await requireRole("MANAGER");

  const instructors = await prisma.instructor.findMany({
    orderBy: { name: "asc" },
    include: { courses: { select: { id: true, name: true } } },
  });

  return (
    <div className="px-4 pt-10">
      <div className="max-w-5xl mx-auto">
        <ManagerInstructorsView initialInstructors={instructors} />
      </div>
    </div>
  );
}