import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireRole } from "@/lib/requireRole"

export async function POST(req: Request) {
  await requireRole("MANAGER")
  
  const body = await req.json()
  const email = body.email?.toLowerCase().trim();
  const name = body.name?.trim();

    const existingTutor = await prisma.tutorProfile.findUnique({
    where: { email },
  });
  if (existingTutor) {
    return NextResponse.json(
      { error: "Tutor with this email already exists" },
      { status: 400 }
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  let tutor;

  if (existingUser) {
    // If user with email exists, promote to Tutor
    await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        role: "TUTOR",
      },
    });
    tutor = await prisma.tutorProfile.create({
      data: {
        name,
        email,
        isActive: true,
        userId: existingUser.id,
      },
    });
  } else {
    // If user with email does not exist, create new Tutor
    tutor = await prisma.tutorProfile.create({
      data: {
        name,
        email,
        isActive: true,
      },
    });
  }

  return NextResponse.json(tutor)
}