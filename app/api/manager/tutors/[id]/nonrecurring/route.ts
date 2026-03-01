import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  const { id: tutorId } = await ctx.params;

  const data = await prisma.availabilityException.findMany({
    where: { tutorId },
  });

  return NextResponse.json(data);
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const { id: tutorId } = await ctx.params;
  const { date, startMin, endMin, type } = await req.json();

  // Parse as local date-only (important!)
  const dateOnly = new Date(`${date}T00:00:00`);

  if (startMin == null || endMin == null) {
    return NextResponse.json({ error: "Missing time range" }, { status: 400 });
  }

  await prisma.availabilityException.create({
    data: {
      tutorId,
      date: dateOnly,
      startMin,
      endMin,
      type, // "ADD" or "REMOVE"
    },
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const body = await req.json()
  await prisma.availabilityException.delete({ where: { id: body.id } })
  return NextResponse.json({ success: true })
}