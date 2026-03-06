import { EmailTemplateKey } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const REQUIRED_TEMPLATES: Array<{
  key: EmailTemplateKey;
  subject: string;
  body: string;
  isHtml?: boolean;
  enabled?: boolean;
}> = [
  {
    key: "SESSION_CREATED_STUDENT",
    subject: "Tutoring session confirmed: {{courseName}}",
    body: 
`<p>Hi {{studentName}},</p>
<p>Your tutoring session with {{tutorName}} is confirmed.</p>
<p><b>Date:</b> {{date}}<br/>
<b>Time:</b> {{time}}<br/>
<b>Location:</b> {{location}}</p>`,
    isHtml: true,
    enabled: true,
  },
  {
    key: "SESSION_CREATED_TUTOR",
    subject: "New tutoring session: {{courseName}}",
    body: 
`<p>Hi {{tutorName}},</p>
<p>You have a new session with {{studentName}} ({{studentEmail}}).</p>
<p><b>Date:</b> {{date}}<br/>
<b>Time:</b> {{time}}<br/>
<b>Location:</b> {{location}}</p>`,
    isHtml: true,
    enabled: true,
  },
  {
    key: "SESSION_CANCELLED_STUDENT",
    subject: "Session cancelled: {{courseName}}",
    body: 
`<p>Hi {{studentName}},</p>
<p>Your session with {{tutorName}} was cancelled.</p>
<p><b>Date:</b> {{date}}<br/>
<b>Time:</b> {{time}}<br/>
<b>Location:</b> {{location}}</p>
<p><b>Reason:</b> {{reason}}</p>`,
    isHtml: true,
    enabled: true,
  },
  {
    key: "SESSION_CANCELLED_TUTOR",
    subject: "Session cancelled: {{courseName}}",
    body: 
`<p>Hi {{tutorName}},</p>
<p>Your session with {{studentName}} was cancelled.</p>
<p><b>Date:</b> {{date}}<br/>
<b>Time:</b> {{time}}<br/>
<b>Location:</b> {{location}}</p>
<p><b>Reason:</b> {{reason}}</p>`,
isHtml: true,
    enabled: true,
  },
];

async function main() {
  for (const t of REQUIRED_TEMPLATES) {
    await prisma.emailTemplate.upsert({
      where: { key: t.key },
      create: {
        key: t.key,
        subject: t.subject,
        body: t.body,
        isHtml: t.isHtml ?? true,
        enabled: t.enabled ?? true,
      },
      update: {}, // don't overwrite manager edits
    });
  }
}

main()
  .finally(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });