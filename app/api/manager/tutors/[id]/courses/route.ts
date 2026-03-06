import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/requireRole";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  await requireRole("MANAGER");
  const { id: tutorId } = await ctx.params;

  const tutor = await prisma.tutorProfile.findUnique({
    where: { id: tutorId },
    include: { courses: { select: { id: true, name: true } } },
  });

  if (!tutor) {
    return NextResponse.json(
      { error: "Tutor not found" }, 
      { status: 404 }
    );
  }

  return NextResponse.json({ courses: tutor.courses });
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  await requireRole("MANAGER");
  const { id: tutorId } = await ctx.params;

  const { courseIds } = await req.json();

  if (!Array.isArray(courseIds) 
    || !courseIds.every((x) => typeof x === "string")) {
    return NextResponse.json(
      { error: "courseIds must be string[]" }, 
      { status: 400 }
    );
  }

  const updated = await prisma.tutorProfile.update({
    where: { id: tutorId },
    data: {
      courses: {
        set: courseIds.map((id: string) => ({ id })),
      },
    },
    include: { courses: { select: { id: true, name: true } } },
  });

  return NextResponse.json({ courses: updated.courses });
}