import { NextResponse } from "next/server";
import { sendTemplatedEmail } from "@/lib/email/pipeline";

export const runtime = "nodejs"; // important for nodemailer

export async function GET() {
  try {
    const from = process.env.MAIL_FROM;
    if (!from) {
      return NextResponse.json(
        { ok: false, error: "MAIL_FROM is missing in env" },
        { status: 500 }
      );
    }
    const result = await sendTemplatedEmail({
      from,
      to: "xxx@gmail.com",
      templateKey: "SESSION_CANCELLED_STUDENT",
      variables: {
        studentName: "Student",
        tutorName: "Alice",
        courseName: "ABC",
        date: "2026-03-05", // use a date-only string
        time: "10:00 AM",
        location: "",
        reason: "",
      },
    });
    return NextResponse.json({ ok: true, result });
  } catch (err: any) {
    console.error("DEBUG EMAIL ERROR:", err);
    return NextResponse.json(
      {
        ok: false,
        error: err?.message ?? String(err),
        stack: err?.stack ?? null,
      },
      { status: 500 }
    );
  }
}