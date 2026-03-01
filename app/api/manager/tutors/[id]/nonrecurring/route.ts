import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createOverride } from "@/lib/availability"

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

  const body = await req.json();
  const date = new Date(body.date);

  const { startMin, endMin, type } = body;

  await createOverride(tutorId, date, startMin, endMin, type);

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const body = await req.json()
  await prisma.availabilityException.delete({ where: { id: body.id } })
  return NextResponse.json({ success: true })
}