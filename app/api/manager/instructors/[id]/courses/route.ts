import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/requireRole";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  await requireRole("MANAGER");

  const { id: instructorId } = await ctx.params;
  const { courseIds } = await req.json();

  if (!Array.isArray(courseIds) || !courseIds.every((x) => typeof x === "string")) {
    return NextResponse.json({ error: "courseIds must be string[]" }, { status: 400 });
  }

  const updated = await prisma.instructor.update({
    where: { id: instructorId },
    data: {
      courses: {
        set: courseIds.map((id: string) => ({ id })),
      },
    },
    include: { courses: { select: { id: true } } },
  });

  return NextResponse.json({
    success: true,
    courseIds: updated.courses.map((c) => c.id),
  });
}