export type EmailTemplateKey =
  | "SESSION_CREATED_STUDENT"
  | "SESSION_CREATED_TUTOR"
  | "SESSION_CANCELLED_STUDENT"
  | "SESSION_CANCELLED_TUTOR";

export type EmailAddress = string;

export type EmailSendInput<Vars extends Record<string, string>> = {
  to: EmailAddress | EmailAddress[];
  templateKey: EmailTemplateKey;
  variables: Vars;
  from: string;
  replyTo?: string;
};