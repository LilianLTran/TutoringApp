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
    <ManagerDashboardView
      user={user}
      stats={{ activeTutors, courses, instructors }}
    />
  );
}