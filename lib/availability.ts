import { prisma } from "@/lib/prisma"

type TimeBlock = {
  startMin: number
  endMin: number
}

// ✅ Replace OverrideType import with a local union type
export type OverrideType = "ADD" | "REMOVE"

/* =========================================================
   Utility Functions
========================================================= */

function overlaps(a: TimeBlock, b: TimeBlock) {
  return a.startMin < b.endMin && a.endMin > b.startMin
}

function mergeBlocks(blocks: TimeBlock[]): TimeBlock[] {
  if (blocks.length === 0) return []

  const sorted = [...blocks].sort((a, b) => a.startMin - b.startMin)
  const result: TimeBlock[] = [{ ...sorted[0] }]

  for (let i = 1; i < sorted.length; i++) {
    const prev = result[result.length - 1]
    const curr = sorted[i]

    if (curr.startMin <= prev.endMin) {
      prev.endMin = Math.max(prev.endMin, curr.endMin)
    } else {
      result.push({ ...curr })
    }
  }

  return result
}

function subtractBlock(blocks: TimeBlock[], removeBlock: TimeBlock): TimeBlock[] {
  const result: TimeBlock[] = []

  for (const block of blocks) {
    if (!overlaps(block, removeBlock)) {
      result.push(block)
      continue
    }

    if (removeBlock.startMin > block.startMin) {
      result.push({
        startMin: block.startMin,
        endMin: removeBlock.startMin,
      })
    }

    if (removeBlock.endMin < block.endMin) {
      result.push({
        startMin: removeBlock.endMin,
        endMin: block.endMin,
      })
    }
  }

  return result
}

/* =========================================================
   Recurring Management
========================================================= */

export async function upsertRecurringAvailability(
  tutorId: string,
  dayOfWeek: number,
  startMin: number,
  endMin: number
) {
  if (startMin >= endMin) throw new Error("Invalid time range")

  await prisma.$transaction(async (tx) => {
    const overlapping = await tx.recurringAvailability.findMany({
      where: {
        tutorId,
        dayOfWeek,
        startMin: { lt: endMin },
        endMin: { gt: startMin },
      },
    })

    if (overlapping.length > 0) {
      const mergedStart = Math.min(startMin, ...overlapping.map((b) => b.startMin))
      const mergedEnd = Math.max(endMin, ...overlapping.map((b) => b.endMin))

      await tx.recurringAvailability.deleteMany({
        where: { id: { in: overlapping.map((b) => b.id) } },
      })

      await tx.recurringAvailability.create({
        data: { tutorId, dayOfWeek, startMin: mergedStart, endMin: mergedEnd },
      })
      return
    }

    await tx.recurringAvailability.create({
      data: { tutorId, dayOfWeek, startMin, endMin },
    })
  })
}

/* =========================================================
   Override Management
========================================================= */

export async function createOverride(
  tutorId: string,
  date: Date,
  startMin: number | null,
  endMin: number | null,
  type: OverrideType
) {
  const dateOnly = new Date(date)
  dateOnly.setHours(0, 0, 0, 0)

  await prisma.$transaction(async (tx) => {

    // ✅ allow 0, but reject null/undefined
    if (startMin == null || endMin == null) {
      throw new Error("Time range required")
    }

    const overlapping = await tx.availabilityException.findMany({
      where: {
        tutorId,
        date: dateOnly,
        startMin: { lt: endMin },
        endMin: { gt: startMin },
      },
    })

    if (type === "ADD") {
      const mergedStart = overlapping.length
        ? Math.min(startMin, ...overlapping.map((b) => b.startMin ?? startMin))
        : startMin

      const mergedEnd = overlapping.length
        ? Math.max(endMin, ...overlapping.map((b) => b.endMin ?? endMin))
        : endMin

      if (overlapping.length > 0) {
        await tx.availabilityException.deleteMany({
          where: { id: { in: overlapping.map((b) => b.id) } },
        })
      }

      await tx.availabilityException.create({
        data: { tutorId, date: dateOnly, startMin: mergedStart, endMin: mergedEnd, type },
      })
      return
    }

    if (type === "REMOVE") {
      await tx.availabilityException.create({
        data: { tutorId, date: dateOnly, startMin, endMin, type },
      })
    }
  })
}

/* =========================================================
   Availability Resolver (For Calendar)
========================================================= */

export async function resolveAvailabilityForDate(
  tutorId: string,
  date: Date
): Promise<TimeBlock[]> {
  const weekday = date.getDay()

  const dateOnly = new Date(date)
  dateOnly.setHours(0, 0, 0, 0)

  // ✅ BUGFIX: use weekday variable properly
  const recurring = await prisma.recurringAvailability.findMany({
    where: { tutorId, dayOfWeek: weekday },
  })

  const overrides = await prisma.availabilityException.findMany({
    where: { tutorId, date: dateOnly },
  })

  let result: TimeBlock[] = recurring.map((r) => ({
    startMin: r.startMin,
    endMin: r.endMin,
  }))

  for (const remove of overrides.filter((o) => o.type === "REMOVE")) {
    result = subtractBlock(result, {
      startMin: remove.startMin!,
      endMin: remove.endMin!,
    })
  }

  const addBlocks = overrides
    .filter((o) => o.type === "ADD")
    .map((o) => ({
      startMin: o.startMin!,
      endMin: o.endMin!,
    }))

  result = mergeBlocks([...result, ...addBlocks])
  return result
}