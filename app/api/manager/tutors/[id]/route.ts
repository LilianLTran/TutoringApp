import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/requireRole"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  await requireRole("MANAGER")

  const body = await req.json()
  const { tutorId, dayOfWeek, startMin, endMin } = body

  const availability = await prisma.recurringAvailability.create({
    data: {
      tutorId,
      dayOfWeek,
      startMin,
      endMin,
    },
  })

  return NextResponse.json(availability)
}