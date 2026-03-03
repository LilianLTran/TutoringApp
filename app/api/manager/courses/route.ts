import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/requireRole";

export async function GET() {
  await requireRole("MANAGER");

  const courses = await prisma.course.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: {
          requests: true,
          sessions: true,
          tutors: true,
          instructors: true,
        },
      },
    },
  });

  return NextResponse.json(courses);
}

export async function POST(req: NextRequest) {
  await requireRole("MANAGER");

  const { name } = await req.json();

  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Invalid name" }, { status: 400 });
  }

  const clean = name.trim();

  try {
    const created = await prisma.course.create({
      data: { name: clean },
      include: {
        _count: {
          select: { requests: true, sessions: true, tutors: true, instructors: true },
        },
      },
    });

    return NextResponse.json(created);
  } catch (e: any) {
    // Unique constraint on Course.name
    return NextResponse.json(
      { error: "Course name already exists" },
      { status: 409 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  await requireRole("MANAGER");

  const { id } = await req.json();

  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.tutoringSession.deleteMany({ where: { courseId: id } });
    await tx.tutoringRequest.deleteMany({ where: { courseId: id } });
    await tx.course.delete({ where: { id } });
  });

  return NextResponse.json({ success: true });
}