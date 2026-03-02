import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/requireRole";

export async function POST(req: NextRequest) {
  await requireRole("MANAGER");

  const { name } = await req.json();
  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Invalid name" }, { status: 400 });
  }

  const created = await prisma.instructor.create({
    data: { name: name.trim() },
  });

  return NextResponse.json(created);
}