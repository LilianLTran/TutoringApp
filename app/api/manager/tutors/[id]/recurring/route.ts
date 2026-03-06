import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/requireRole";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  await requireRole("MANAGER")
  const { id: tutorId } = await ctx.params;

  const data = await prisma.recurringAvailability.findMany({
    where: { tutorId },
  });

  return NextResponse.json(data);
}

export async function POST(req: NextRequest, ctx: Ctx) {
  await requireRole("MANAGER")
  const { id: tutorId } = await ctx.params;
  const { dayOfWeek, startMin, endMin } = await req.json();

  if (startMin == null || endMin == null) {
    return NextResponse.json({ error: "Missing time range" }, { status: 400 });
  }

  // Check variable (optional)
  if (!tutorId) return NextResponse.json(
    { error: "Missing tutorId" }, 
    { status: 400 }
  )
  if (![0,1,2,3,4,5,6].includes(dayOfWeek)) {
    return NextResponse.json({ error: "Invalid dayOfWeek" }, { status: 400 })
  }
  if (
    !Number.isFinite(startMin) || 
    !Number.isFinite(endMin) || 
    startMin < 0 || 
    endMin > 24 * 60 || 
    startMin >= endMin
  ) {
    return NextResponse.json({ error: "Invalid time range" }, { status: 400 })
  }

  const result = await prisma.$transaction(async (tx) => {
    const hit = await tx.recurringAvailability.findMany({
      where: {
        tutorId,
        dayOfWeek,
        startMin: { lte: endMin },
        endMin: { gte: startMin },
      },
      select: { id: true, startMin: true, endMin: true },
    })

    // Compute merged range
    let mergedStart = startMin
    let mergedEnd = endMin

    for (const r of hit) {
      mergedStart = Math.min(mergedStart, r.startMin)
      mergedEnd = Math.max(mergedEnd, r.endMin)
    }

    // Delete the overlapped/touched rows
    if (hit.length > 0) {
      await tx.recurringAvailability.deleteMany({
        where: { id: { in: hit.map((r) => r.id) } },
      })
    }

    // Insert merged row
    const created = await tx.recurringAvailability.create({
      data: {
        tutorId,
        dayOfWeek,
        startMin: mergedStart,
        endMin: mergedEnd,
      },
    })

    return { created, mergedFrom: hit }
  })

  return NextResponse.json({
    success: true,
    recurring: result.created,
    mergedCount: result.mergedFrom.length,
  })

}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  await requireRole("MANAGER")

  const body = await req.json()
  await prisma.recurringAvailability.delete({ where: { id: body.id } })
  
  return NextResponse.json({ success: true })
}