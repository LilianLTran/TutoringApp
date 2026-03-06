import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/requireRole";

import ManagerEmailTemplatesView from "./ManagerEmailTemplatsView";

export const dynamic = "force-dynamic";

export default async function ManagerEmailTemplatesPage() {
  await requireRole("MANAGER");

  console.log(Object.keys(prisma));

  const templates = await prisma.emailTemplate.findMany({
    orderBy: { key: "asc" },
    select: {
      id: true,
      key: true,
      name: true,
      subject: true,
      body: true,
      isHtml: true,
      enabled: true,
      updatedAt: true,
    },
  });

  return (
    <div className="px-4 pt-10">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Email Templates</h1>
          <p className="mt-1 text-sm text-gray-600">
            Managers can edit the email content used for notifications.
            Variables use <span className="font-mono">{"{{var}}"}</span>.
          </p>
        </div>

        <ManagerEmailTemplatesView initialTemplates={templates} />
      </div>
    </div>
  );
}