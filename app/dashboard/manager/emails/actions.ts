"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/requireRole";
import { EmailTemplateKey } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function updateEmailTemplate(input: {
  id: string;
  subject: string;
  body: string;
  enabled: boolean;
  isHtml: boolean;
}) {
  await requireRole("MANAGER");

  await prisma.emailTemplate.update({
    where: { id: input.id },
    data: {
      subject: input.subject,
      body: input.body,
      enabled: input.enabled,
      isHtml: input.isHtml,
    },
  });

  revalidatePath("/dashboard/manager/emails");
}