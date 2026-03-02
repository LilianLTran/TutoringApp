import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/requireRole";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(req: NextRequest, ctx: Ctx) {
  await requireRole("MANAGER");

  const { id: instructorId } = await ctx.params;

  await prisma.$transaction(async (tx) => {
    // 1) delete requests that reference this instructor
    await tx.tutoringRequest.deleteMany({
      where: { instructorId },
    });

    // 2) unlink course relationships (safety)
    await tx.instructor.update({
      where: { id: instructorId },
      data: { courses: { set: [] } },
    });

    // 3) delete instructor
    await tx.instructor.delete({
      where: { id: instructorId },
    });
  });

  return NextResponse.json({ success: true });
}