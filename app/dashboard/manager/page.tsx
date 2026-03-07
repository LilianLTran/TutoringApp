import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

import ManagerDashboardView from "./ManagerDashboardView";

export default async function ManagerDashboardPage() {

  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.toLowerCase().trim();

  if (!email) {
    return <div className="p-6">Not authenticated</div>;
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true },
  });

  if (!user) {
    return <div className="p-6">User not found</div>;
  }

  const [activeTutors, courses, instructors] = await Promise.all([
    prisma.tutorProfile.count({ where: { isActive: true } }),
    prisma.course.count(),
    prisma.instructor.count(),
  ]);

  return (
    <div className="px-4 pt-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Manager Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage tutoring sessions and oversee all related operations.
          </p>
        </div>

        <ManagerDashboardView
          user={user}
          stats={{ activeTutors, courses, instructors }}
        />
      </div>
    </div>

  );
}