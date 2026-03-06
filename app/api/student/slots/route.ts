import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { 
  computeTutorAvailableSlots 
} from "@/app/dashboard/student/request/computeTutorAvailableSlots";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const courseId = url.searchParams.get("courseId");
  const dateKey = url.searchParams.get("date"); // must be YYYY-MM-DD

  if (!courseId || !dateKey) {
    return NextResponse.json(
      { error: "Missing courseId or date" }, 
      { status: 400 }
    );
  }

  // find tutors for the course
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { tutors: { select: { id: true, name: true } } },
  });

  if (!course) return NextResponse.json(
    { error: "Course not found" }, 
    { status: 404 }
  );

  // compute slots for each tutor in parallel
  const results = await Promise.all(
    course.tutors.map(async (t) => {
      const slots = await computeTutorAvailableSlots(t.id, dateKey);
      return {
        tutorId: t.id,
        tutorName: t.name,
        slots,
      };
    })
  );

  return NextResponse.json({ tutors: results });
}