import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const body = await req.json()

  const tutor = await prisma.tutorProfile.create({
    data: {
      name: body.name,
      email: body.email,
      isActive: true,
    },
  })

  return NextResponse.json(tutor)
}