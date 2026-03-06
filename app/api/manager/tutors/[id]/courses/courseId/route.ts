import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/requireRole";

type Ctx = { params: Promise<{ id: string; courseId: string }> };

export async function DELETE(req: NextRequest, ctx: Ctx) {
  await requireRole("MANAGER");

  const { id: tutorId, courseId } = await ctx.params;

  if (!tutorId || !courseId) {
    return NextResponse.json(
      { error: "Missing tutorId or courseId" }, 
      { status: 400 }
    );
  }

  const updated = await prisma.tutorProfile.update({
    where: { id: tutorId },
    data: {
      courses: {
        disconnect: { id: courseId },
      },
    },
    include: { courses: true },
  });

  return NextResponse.json(updated);
}