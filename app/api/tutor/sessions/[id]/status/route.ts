import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { requireRole } from "@/lib/requireRole";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

import { updateSessionStatus } from "@/lib/sessions/updateSessionStatus";

export async function PATCH(
  req: Request, 
  ctx: { params: Promise<{ id: string }> }
) {
  await requireRole("TUTOR");

  const session = await getServerSession(authOptions);
  const userId = session!.user!.id;
  const email = session!.user!.email!.toLowerCase().trim();

  const tutorProfile = await prisma.tutorProfile.findUnique({
    where: { email },
    select: { id: true },
  });
  if (!tutorProfile) {
    return NextResponse.json(
      { error: "Tutor profile not found." }, 
      { status: 404 }
    );
  }

  const { id: sessionId } = await ctx.params;
  const body = await req.json();

  const res = await updateSessionStatus(
    { role: "TUTOR", userId, tutorProfileId: tutorProfile.id },
    { sessionId, nextStatus: body.status, reason: body.reason }
  );

  return NextResponse.json(res);
}