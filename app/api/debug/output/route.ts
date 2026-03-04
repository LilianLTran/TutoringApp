// import { NextResponse } from "next/server";
// import { computeTutorAvailableSlots } from "@/app/dashboard/student/request/computeTutorAvailableSlots";
// import { prisma } from "@/lib/prisma";

// function buildDateOnly(dateStr: string) {
//   const ymd = dateStr.includes("T") ? dateStr.slice(0, 10) : dateStr;
//   return new Date(`${ymd}T00:00:00`);
// }

// export async function GET(req: Request) {
//   try {
//     const url = new URL(req.url);
//     const tutorId = url.searchParams.get("tutorId") ?? "";
//     const dateStr = url.searchParams.get("date") ?? "";

//     if (!tutorId || !dateStr) {
//       return NextResponse.json(
//         { error: "Missing tutorId or date query param" },
//         { status: 400 }
//       );
//     }

//     const dateOnly = buildDateOnly(dateStr);

//     const [recurring, exceptions, sessions] = await Promise.all([
//       prisma.recurringAvailability.findMany({
//         where: { tutorId, dayOfWeek: dateOnly.getDay() },
//         orderBy: { startMin: "asc" },
//       }),
//       prisma.availabilityException.findMany({
//         where: { tutorId, date: dateOnly },
//         orderBy: { startMin: "asc" },
//       }),
//       prisma.tutoringSession.findMany({
//         where: { tutorId, date: dateOnly, status: "SCHEDULED" },
//         orderBy: { startMin: "asc" },
//       }),
//     ]);

//     const slots = await computeTutorAvailableSlots(tutorId, dateStr);

//     return NextResponse.json({
//       tutorId,
//       dateOnly: dateOnly.toISOString(),
//       recurring,
//       exceptions,
//       sessions,
//       slots,
//     });
//   } catch (err: any) {
//     console.error("DEBUG AVAIL ERROR:", err);
//     return NextResponse.json({ error: String(err.message ?? err) }, { status: 500 });
//   }
// }