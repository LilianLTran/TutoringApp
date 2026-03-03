import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireRole } from "@/lib/requireRole";

export async function PATCH(req: NextRequest) {
  await requireRole("STUDENT")

  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  const body = await req.json();
  const name = body?.name;

  const me = await prisma.user.findUnique({
    where: { email: session.user.email.toLowerCase() },
  });

  if (!me) {
    return NextResponse.json(
      { error: "User not found" },
      { status: 404 }
    );
  }

  const updated = await prisma.user.update({
    where: { id: me.id },
    data: { name: name === "" ? null : name?.trim() ?? null },
  });

  return NextResponse.json(updated);
}