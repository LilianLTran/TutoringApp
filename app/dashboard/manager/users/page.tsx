import { prisma } from "@/lib/prisma";
import UserRoleTable from "./UserRoleTable";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function ManagerUsersPage() {

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 pt-8 pb-12">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">User Roles</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manager promotion and demotion
          </p>
        </div>

        <UserRoleTable initialUsers={users} />
      </div>
    </div>
  );
}