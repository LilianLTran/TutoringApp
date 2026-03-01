import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { upsertRecurringAvailability } from "@/lib/availability"

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  const { id: tutorId } = await ctx.params;

  const data = await prisma.recurringAvailability.findMany({
    where: { tutorId },
  });

  return NextResponse.json(data);
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const { id: tutorId } = await ctx.params;
  const { dayOfWeek, startMin, endMin } = await req.json();

  if (startMin == null || endMin == null) {
    return NextResponse.json({ error: "Missing time range" }, { status: 400 });
  }

  await prisma.recurringAvailability.create({
    data: {
      tutorId,
      dayOfWeek,
      startMin,
      endMin,
    },
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const body = await req.json()
  await prisma.recurringAvailability.delete({ where: { id: body.id } })
  return NextResponse.json({ success: true })
}