// app/api/manager/tutors/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/requireRole";

export async function POST(req: NextRequest) {
  await requireRole("MANAGER");

  const { name, email } = await req.json();

  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "Invalid name" }, { status: 400 });
  }
  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();

  // Check duplicate by email
  const existing = await prisma.tutorProfile.findUnique({ where: { email: cleanEmail } });
  if (existing) {
    return NextResponse.json({ error: "Tutor with that email already exists" }, { status: 409 });
  }

  const created = await prisma.tutorProfile.create({
    data: {
      name: cleanName,
      email: cleanEmail,
      // isActive defaults to false per schema
    },
  });

  // Return minimal created object used by the client
  return NextResponse.json({
    id: created.id,
    name: created.name,
    email: created.email,
    isActive: created.isActive,
  });
}