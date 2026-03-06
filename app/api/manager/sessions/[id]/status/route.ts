import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { requireRole } from "@/lib/requireRole";

import { updateSessionStatus } from "@/lib/sessions/updateSessionStatus";

export async function PATCH(
  req: Request, 
  ctx: { params: Promise<{ id: string }> }
) {
  await requireRole("MANAGER");
  const session = await getServerSession(authOptions);
  const userId = session!.user!.id;

  const { id: sessionId } = await ctx.params;
  const body = await req.json();

  const res = await updateSessionStatus(
    { role: "MANAGER", userId },
    { sessionId, nextStatus: body.status, reason: body.reason }
  );

  return NextResponse.json(res);
}