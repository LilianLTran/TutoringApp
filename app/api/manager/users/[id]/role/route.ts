import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import type { Role } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/requireRole";
import { authOptions } from "@/lib/auth";


export const runtime = "nodejs";

// Only allow promotions/demotions between these roles in THIS route
const ALLOWED_NEXT_ROLES: Role[] = ["STUDENT", "MANAGER"];

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  await requireRole("MANAGER");

  const session = await getServerSession(authOptions);
  const meId = session?.user?.id;
  if (!meId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id: targetUserId } = await ctx.params;

  const body = await req.json().catch(() => ({}));
  const nextRole = body?.role as Role | undefined;

  if (!nextRole || !ALLOWED_NEXT_ROLES.includes(nextRole)) {
    return NextResponse.json(
      { error: "Invalid role. Allowed here: STUDENT, MANAGER" },
      { status: 400 }
    );
  }

  // Safety: prevent self-demotion
  if (targetUserId === meId && nextRole !== "MANAGER") {
    return NextResponse.json(
      { error: "You cannot change your own role." },
      { status: 400 }
    );
  }

  // Tutor can ONLY be promoted to manager (not demoted to student)
  const current = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { role: true },
  });
  if (!current) 
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (current.role === "TUTOR" && nextRole === "STUDENT") {
    return NextResponse.json(
      { error: "Tutors can only be promoted to MANAGER here." },
      { status: 400 }
    );
  }

  const updated = await prisma.user.update({
    where: { id: targetUserId },
    data: { role: nextRole },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });

  return NextResponse.json({ ok: true, user: updated });
}