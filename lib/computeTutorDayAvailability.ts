// import { prisma } from "@/lib/prisma"

// type Block = { startMin: number; endMin: number }

// function overlaps(a: Block, b: Block) {
//   return a.startMin < b.endMin && a.endMin > b.startMin
// }

// function mergeBlocks(blocks: Block[]): Block[] {
//   if (blocks.length <= 1) return blocks
//   const sorted = [...blocks].sort((a, b) => a.startMin - b.startMin)
//   const out: Block[] = [{ ...sorted[0] }]
//   for (let i = 1; i < sorted.length; i++) {
//     const last = out[out.length - 1]
//     const cur = sorted[i]
//     if (cur.startMin <= last.endMin) last.endMin = Math.max(last.endMin, cur.endMin)
//     else out.push({ ...cur })
//   }
//   return out
// }

// function subtractBlocks(blocks: Block[], cut: Block): Block[] {
//   const out: Block[] = []
//   for (const b of blocks) {
//     if (!overlaps(b, cut)) {
//       out.push(b)
//       continue
//     }
//     if (cut.startMin > b.startMin) out.push({ startMin: b.startMin, endMin: cut.startMin })
//     if (cut.endMin < b.endMin) out.push({ startMin: cut.endMin, endMin: b.endMin })
//   }
//   return out
// }

// function toHHMM(min: number) {
//   const h = Math.floor(min / 60)
//   const m = min % 60
//   return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
// }

// function clamp(n: number, lo = 0, hi = 1440) {
//   return Math.max(lo, Math.min(hi, n))
// }

// function minutesFromDayStart(dayStart: Date, dt: Date) {
//   return Math.floor((dt.getTime() - dayStart.getTime()) / 60000)
// }

// /**
//  * Returns availability per tutor for a specific date (date-only).
//  * Does NOT mix tutors.
//  */
// export async function computeTutorDayAvailability(
//   tutorIds: string[],
//   dateStrYYYYMMDD: string,   // strongly recommend this format from client
//   slotSizeMin = 30
// ): Promise<
//   Array<{
//     tutorId: string
//     tutorName: string
//     slots: { startMin: number; label: string }[]
//     sessions: { start: string; end: string; label: string }[]
//   }>
// > {
//   if (!tutorIds.length) return []

//   // date-only normalization (local)
//   const dayStart = new Date(`${dateStrYYYYMMDD}T00:00:00`)
//   if (isNaN(dayStart.getTime())) throw new Error("Invalid date")
//   const dayEnd = new Date(dayStart)
//   dayEnd.setDate(dayEnd.getDate() + 1)

//   const weekday = dayStart.getDay()

//   // Fetch everything in 3 queries
//   const [tutors, recurringRows, exceptionRows, sessions] = await Promise.all([
//     prisma.tutorProfile.findMany({
//       where: { id: { in: tutorIds }, isActive: true },
//       select: { id: true, name: true },
//     }),

//     prisma.recurringAvailability.findMany({
//       where: {
//         tutorId: { in: tutorIds },
//         dayOfWeek: weekday,
//       },
//       select: { tutorId: true, startMin: true, endMin: true },
//     }),

//     prisma.availabilityException.findMany({
//       where: {
//         tutorId: { in: tutorIds },
//         date: dayStart,
//       },
//       select: { tutorId: true, startMin: true, endMin: true, type: true },
//     }),

//     prisma.tutoringSession.findMany({
//       where: {
//         tutorId: { in: tutorIds },
//         start: { lt: dayEnd },
//         end: { gt: dayStart },
//         status: "SCHEDULED", // optional, but usually correct for “booked”
//       },
//       select: { tutorId: true, start: true, end: true },
//       orderBy: { start: "asc" },
//     }),
//   ])

//   // group recurring by tutor
//   const recByTutor = new Map<string, Block[]>()
//   for (const r of recurringRows) {
//     const arr = recByTutor.get(r.tutorId) ?? []
//     arr.push({ startMin: r.startMin, endMin: r.endMin })
//     recByTutor.set(r.tutorId, arr)
//   }

//   // group exceptions by tutor
//   const exByTutor = new Map<string, Array<{ startMin: number; endMin: number; type: "ADD" | "REMOVE" }>>()
//   for (const ex of exceptionRows) {
//     const arr = exByTutor.get(ex.tutorId) ?? []
//     arr.push({ startMin: ex.startMin, endMin: ex.endMin, type: ex.type as any })
//     exByTutor.set(ex.tutorId, arr)
//   }

//   // group sessions by tutor (as minute blocks + pretty labels)
//   const sessByTutor = new Map<
//     string,
//     { blocks: Block[]; ui: { start: string; end: string; label: string }[] }
//   >()

//   for (const s of sessions) {
//     const startMin = clamp(minutesFromDayStart(dayStart, s.start))
//     const endMin = clamp(minutesFromDayStart(dayStart, s.end))
//     if (endMin <= startMin) continue

//     const entry = sessByTutor.get(s.tutorId) ?? { blocks: [], ui: [] }
//     entry.blocks.push({ startMin, endMin })
//     entry.ui.push({
//       start: s.start.toISOString(),
//       end: s.end.toISOString(),
//       label: `${toHHMM(startMin)}–${toHHMM(endMin)}`,
//     })
//     sessByTutor.set(s.tutorId, entry)
//   }

//   // compute per tutor
//   const result: Array<{
//     tutorId: string
//     tutorName: string
//     slots: { startMin: number; label: string }[]
//     sessions: { start: string; end: string; label: string }[]
//   }> = []

//   for (const t of tutors) {
//     // base recurring blocks
//     let blocks = mergeBlocks(recByTutor.get(t.id) ?? [])

//     // exceptions for that day
//     const exs = exByTutor.get(t.id) ?? []

//     // subtract REMOVE exceptions
//     for (const ex of exs) {
//       if (ex.type === "REMOVE") blocks = subtractBlocks(blocks, { startMin: ex.startMin, endMin: ex.endMin })
//     }

//     // add ADD exceptions
//     const addBlocks = exs.filter(e => e.type === "ADD").map(e => ({ startMin: e.startMin, endMin: e.endMin }))
//     if (addBlocks.length) blocks = mergeBlocks([...blocks, ...addBlocks])

//     // subtract booked sessions
//     const booked = sessByTutor.get(t.id)?.blocks ?? []
//     for (const b of booked) {
//       blocks = subtractBlocks(blocks, b)
//       if (!blocks.length) break
//     }

//     // blocks -> 30-min slots (start times)
//     const slots: { startMin: number; label: string }[] = []
//     for (const b of blocks) {
//       // align to slot boundary (round up)
//       let start = b.startMin
//       const rem = start % slotSizeMin
//       if (rem !== 0) start += slotSizeMin - rem

//       for (let m = start; m + slotSizeMin <= b.endMin; m += slotSizeMin) {
//         slots.push({ startMin: m, label: toHHMM(m) })
//       }
//     }

//     result.push({
//       tutorId: t.id,
//       tutorName: t.name,
//       slots,
//       sessions: sessByTutor.get(t.id)?.ui ?? [],
//     })
//   }

//   // Optional: sort tutors by name
//   result.sort((a, b) => a.tutorName.localeCompare(b.tutorName))

//   return result
// }