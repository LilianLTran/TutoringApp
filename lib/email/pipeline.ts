import { prisma } from "@/lib/prisma";
import { renderTemplateString } from "./render";
import { sendEmailRaw } from "./provider";
import type { EmailSendInput } from "./types";

export async function sendTemplatedEmail(input: EmailSendInput<Record<string, string>>) {
  const template = await prisma.emailTemplate.findUnique({
    where: { key: input.templateKey },
  });

  if (!template) {
    throw new Error(`Email template not found: ${input.templateKey}`);
  }
  if (!template.enabled) {
    return { skipped: true as const, reason: "disabled" };
  }

  const vars = input.variables ?? {};

  const subject = renderTemplateString(template.subject, vars as Record<string, any>, {
    isHtml: false, // subject should not contain HTML
  });

  const body = renderTemplateString(template.body, vars as Record<string, any>, {
    isHtml: template.isHtml,
  });

  const res = await sendEmailRaw({
    to: input.to,
    from: input.from,
    subject,
    html: template.isHtml ? body : undefined,
    text: template.isHtml ? undefined : body,
    replyTo: input.replyTo,
  });

  return { skipped: false as const, ...res };
}