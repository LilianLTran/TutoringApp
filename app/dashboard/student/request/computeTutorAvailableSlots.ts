import { prisma } from "@/lib/prisma";
import { subtractMany, merge, Block } from "@/lib/timeBlocks";
import { TIME_SLOT } from "@/lib/constants/time";

export async function computeTutorAvailableSlots(
tutorId: string,
dateKey: string,
) {
  const dateOnly = new Date(`${dateKey}T00:00:00`);
  dateOnly.setHours(0, 0, 0, 0);
  const dayOfWeek = dateOnly.getDay();
  console.log(dateKey)

  const [recurring, exceptions, bookedSessions] = await Promise.all([
    prisma.recurringAvailability.findMany({
      where: {
        tutorId,
        dayOfWeek,
      },
      orderBy: { startMin: "asc" },
    }),

    prisma.availabilityException.findMany({
      where: {
        tutorId,
        date: dateOnly, // exact match (since you normalize on insert)
      },
      orderBy: { startMin: "asc" },
    }),

    prisma.tutoringSession.findMany({
      where: {
        tutorId,
        date: dateOnly, // exact match (since session.date is also midnight)
        status: "SCHEDULED", // optional but recommended
      },
      orderBy: { startMin: "asc" },
    }),
  ]);

  const removes = exceptions
    .filter((ex) => ex.type === "REMOVE")
    .map((ex) => ({ startMin: ex.startMin, endMin: ex.endMin }));

  const adds = exceptions
    .filter((ex) => ex.type === "ADD")
    .map((ex) => ({ startMin: ex.startMin, endMin: ex.endMin }));

  let available = subtractMany(recurring, removes);
  available = merge([...available, ...adds]);
  available = subtractMany(available, bookedSessions);

  return blocksToSlots(available);
}

function blocksToSlots(blocks: Block[], step=TIME_SLOT): Block[] {
  const slots: Block[] = [];

  for (const b of blocks) {
    const start = b.startMin;
    const end = b.endMin;

    for (let t = start; t + step <= end; t += step) {
      slots.push({startMin: t, endMin: t + step});
    }
  }

  return slots;
}