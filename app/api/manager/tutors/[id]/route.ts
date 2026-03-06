import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/requireRole"
import { NextRequest, NextResponse } from "next/server"

type Ctx = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, ctx: Ctx) {
  await requireRole("MANAGER")
  const { id } = await ctx.params

  const tutor = await prisma.tutorProfile.findUnique({
    where: { id },
    include: { courses: true },
  })

  if (!tutor) return NextResponse.json(
    { error: "Tutor not found" }, 
    { status: 404 }
  )
  return NextResponse.json(tutor)
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  await requireRole("MANAGER")
  const { id } = await ctx.params

  const body = await req.json()
  const { name, email, isActive, courseIds } = body as {
    name?: string
    email?: string
    isActive?: boolean
    courseIds?: string[]
  }

  const updated = await prisma.tutorProfile.update({
    where: { id },
    data: {
      ...(name != null ? { name: name.trim() } : {}),
      ...(email != null ? { email: email.trim().toLowerCase() } : {}),
      ...(isActive != null ? { isActive } : {}),
      ...(Array.isArray(courseIds)
        ? { courses: { set: courseIds.map((cid) => ({ id: cid })) } }
        : {}),
    },
    include: { courses: true },
  })

  return NextResponse.json(updated)
}


export async function DELETE(req: Request) {
  await requireRole("MANAGER");

  const { id } = await req.json();

  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  await prisma.$transaction(async (tx) => {
    
    await tx.recurringAvailability.deleteMany({ where: { tutorId: id } });
    await tx.availabilityException.deleteMany({ where: { tutorId: id } });

    const tutor = await tx.tutorProfile.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (tutor?.userId) {
    await tx.user.update({
      where: { id: tutor.userId },
      data: { role: "STUDENT" },
    });
    // Also need to cancel all of the upcoming session for that tutor!
  }
    await tx.tutorProfile.delete({ where: { id: id } })
  });

  return NextResponse.json({ success: true });
}