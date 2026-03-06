import { sendTemplatedEmail } from "./pipeline";

export async function emailStudentSessionCreated(args: {
  from: string;
  to: string;
  studentName: string;
  tutorName: string;
  courseName: string;
  date: string;
  time: string;
  location: string;
}) {
  return sendTemplatedEmail({
    from: args.from,
    to: args.to,
    templateKey: "SESSION_CREATED_STUDENT",
    variables: args,
  });
}

export async function emailTutorSessionCreated(args: {
  from: string;
  to: string;
  tutorName: string;
  studentName: string;
  studentEmail: string;
  courseName: string;
  date: string;
  time: string;
  location: string;
}) {
  return sendTemplatedEmail({
    from: args.from,
    to: args.to,
    templateKey: "SESSION_CREATED_TUTOR",
    variables: args,
  });
}