import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/requireRole";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  await requireRole("MANAGER");
  
  const { id } = await ctx.params;
  const body = await req.json();

  const { name, email, isActive } = body as {
    name?: string;
    email?: string;
    isActive?: boolean;
  };

  const cleanName = name?.trim();
  const cleanEmail = email?.trim().toLowerCase();

  const tutor = await prisma.tutorProfile.findUnique({
    where: { id },
    select: { id: true, userId: true },
  });

  if (!tutor) {
    return NextResponse.json({ error: "Tutor not found" }, { status: 404 });
  }

  try {
    const updated = await prisma.$transaction(async (tx) => {
      // 1️⃣ Always update TutorProfile
      const updatedTutor = await tx.tutorProfile.update({
        where: { id },
        data: {
          ...(cleanName != null ? { name: cleanName } : {}),
          ...(cleanEmail != null ? { email: cleanEmail } : {}),
          ...(isActive != null ? { isActive } : {}),
        },
      });

      // 2️⃣ Only update User if linked
      if (tutor.userId) {
        await tx.user.update({
          where: { id: tutor.userId },
          data: {
            ...(cleanName != null ? { name: cleanName } : {}),
            ...(cleanEmail != null ? { email: cleanEmail } : {}),
          },
        });
      }

      return updatedTutor;
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Update failed" },
      { status: 400 }
    );
  }
}