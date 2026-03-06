"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/requireRole";
import { revalidatePath } from "next/cache";

export async function updateEmailTemplate(input: {
  id: string;
  name: string;
  subject: string;
  body: string;
  enabled: boolean;
  isHtml: boolean;
}) {
  await requireRole("MANAGER");

  await prisma.emailTemplate.update({
    where: { id: input.id },
    data: {
      name: input.name,
      subject: input.subject,
      body: input.body,
      enabled: input.enabled,
      isHtml: input.isHtml,
    },
  });

  revalidatePath("/dashboard/manager/emails");
}

export async function createEmailTemplate(input: {
  key: string;
  name: string;
  subject: string;
  body: string;
  enabled: boolean;
  isHtml: boolean;
}) {
  await requireRole("MANAGER");

  await prisma.emailTemplate.create({
    data: {
      key: input.key.trim(),
      name: input.name.trim(),
      subject: input.subject,
      body: input.body,
      enabled: input.enabled,
      isHtml: input.isHtml,
    },
  });

  revalidatePath("/dashboard/manager/emails");
}