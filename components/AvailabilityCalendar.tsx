"use client"

import FullCalendar from "@fullcalendar/react"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"
import { useEffect, useMemo, useState } from "react"

import TutorTimeEditModal, { ModalMode } from "./TutorTimeEditModal"

const RECURRING_COLOR = "#CC1A1F"
const NON_RECURRING_COLOR = "#E04B4F"

type Props = {
  tutorId: string
}

type SelectionInfo = {
  dayOfWeek: number
  startMin: number
  endMin: number
  date: Date
}

type Block = { startMin: number; endMin: number }

function overlaps(a: Block, b: Block) {
  return a.startMin < b.endMin && a.endMin > b.startMin
}

function subtract(blocks: Block[], cut: Block): Block[] {
  const out: Block[] = []
  for (const b of blocks) {
    if (!overlaps(b, cut)) {
      out.push(b)
      continue
    }
    if (cut.startMin > b.startMin) out.push({ startMin: b.startMin, endMin: cut.startMin })
    if (cut.endMin < b.endMin) out.push({ startMin: cut.endMin, endMin: b.endMin })
  }
  return out
}

function merge(blocks: Block[]): Block[] {
  if (blocks.length <= 1) return blocks
  const sorted = [...blocks].sort((a, b) => a.startMin - b.startMin)
  const res: Block[] = [{ ...sorted[0] }]
  for (let i = 1; i < sorted.length; i++) {
    const last = res[res.length - 1]
    const cur = sorted[i]
    if (cur.startMin <= last.endMin) last.endMin = Math.max(last.endMin, cur.endMin)
    else res.push({ ...cur })
  }
  return res
}

// ✅ LOCAL YYYY-MM-DD (no toISOString / UTC shifts)
function dayKey(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

function minsToDate(day: Date, min: number) {
  const d = new Date(day)
  d.setHours(0, 0, 0, 0)
  d.setMinutes(min)
  return d
}

export default function RecurringCalendar({ tutorId }: Props) {
  const [events, setEvents] = useState<any[]>([])
  const [refreshKey, setRefreshKey] = useState(0)

  const [selection, setSelection] = useState<SelectionInfo | null>(null)
  const [showModal, setShowModal] = useState(false)

  const [modalMode, setModalMode] = useState<ModalMode>("ADD")
  const [clickedId, setClickedId] = useState<string | null>(null)
  const [clickedKind, setClickedKind] = useState<"RECURRING" | "NONRECURRING" | null>(null)

  // Calendar initial date: if weekend, show next Monday
  const initialDate = useMemo(() => {
    const today = new Date()
    const day = today.getDay()
    if (day === 6) return new Date(new Date(today).setDate(today.getDate() + 2)) // Sat -> Mon
    if (day === 0) return new Date(new Date(today).setDate(today.getDate() + 1)) // Sun -> Mon
    return today
  }, [])

  useEffect(() => {
    async function load() {
      const [recRes, exRes] = await Promise.all([
        fetch(`/api/manager/tutors/${tutorId}/recurring`, { cache: "no-store" }),
        fetch(`/api/manager/tutors/${tutorId}/nonrecurring`, { cache: "no-store" }),
      ])

      const [recurring, exceptions] = await Promise.all([recRes.json(), exRes.json()])

      // Group recurring by weekday, but keep row id so we can delete recurring by id
      const recByDow = new Map<number, Array<Block & { recurringId: string }>>()
      for (const r of recurring) {
        const arr = recByDow.get(r.dayOfWeek) ?? []
        arr.push({ recurringId: String(r.id), startMin: r.startMin, endMin: r.endMin })
        recByDow.set(r.dayOfWeek, arr)
      }

      // Group exceptions by LOCAL date key
      const exByDate = new Map<string, any[]>()
      for (const ex of exceptions) {
        // Prisma often returns ISO string like "2026-03-02T00:00:00.000Z"
        // We only care about local calendar day:
        const k = dayKey(new Date(ex.date))
        const arr = exByDate.get(k) ?? []
        arr.push(ex)
        exByDate.set(k, arr)
      }

      // Build events for next 3 months
      const startDate = new Date()
      startDate.setHours(0, 0, 0, 0)

      const endDate = new Date(startDate)
      endDate.setMonth(endDate.getMonth() + 3)

      const out: any[] = []

      for (let d = new Date(startDate); d < endDate; d.setDate(d.getDate() + 1)) {
        const day = new Date(d)
        const dow = day.getDay()
        const k = dayKey(day)

        const base = recByDow.get(dow) ?? []
        const dayExceptions = exByDate.get(k) ?? []

        for (const baseBlock of base) {
          // Start with the recurring block as the base
          let blocks: Block[] = [{ startMin: baseBlock.startMin, endMin: baseBlock.endMin }]

          // Apply REMOVE exceptions by subtracting from the recurring block
          for (const ex of dayExceptions) {
            if (ex.type === "REMOVE") {
              blocks = subtract(blocks, { startMin: ex.startMin, endMin: ex.endMin })
            }
          }

          // Apply ADD exceptions by merging into the blocks for that day
          const adds: Block[] = dayExceptions
            .filter((ex) => ex.type === "ADD")
            .map((ex) => ({ startMin: ex.startMin, endMin: ex.endMin }))

          blocks = merge([...blocks, ...adds])

          // Convert remaining blocks into events
          for (const b of blocks) {
            // If a block exactly matches an ADD exception, color it as NON_RECURRING_COLOR (optional)
            const isAdd = adds.some((a) => a.startMin === b.startMin && a.endMin === b.endMin)
            const color = isAdd ? NON_RECURRING_COLOR : RECURRING_COLOR

            out.push({
              id: `occ:${baseBlock.recurringId}:${k}:${b.startMin}:${b.endMin}`,
              start: minsToDate(day, b.startMin),
              end: minsToDate(day, b.endMin),
              backgroundColor: color,
              borderColor: color,
              extendedProps: {
                kind: isAdd ? "NONRECURRING" : "RECURRING",
                recurringId: baseBlock.recurringId,
                dayOfWeek: dow,
                startMin: b.startMin,
                endMin: b.endMin,
                dateKey: k,
              },
            })
          }
        }

        // Also include ADD exceptions that happen on days with no recurring blocks at all
        if (base.length === 0) {
          for (const ex of dayExceptions) {
            if (ex.type !== "ADD") continue
            out.push({
              id: String(ex.id),
              start: minsToDate(day, ex.startMin),
              end: minsToDate(day, ex.endMin),
              backgroundColor: NON_RECURRING_COLOR,
              borderColor: NON_RECURRING_COLOR,
              extendedProps: {
                kind: "NONRECURRING",
                exceptionId: String(ex.id),
                dayOfWeek: dow,
                startMin: ex.startMin,
                endMin: ex.endMin,
                dateKey: k,
                type: ex.type,
              },
            })
          }
        }
      }

      setEvents(out)
    }

    load().catch((e) => {
      console.error(e)
      setEvents([])
    })
  }, [tutorId, refreshKey])

  function handleSelect(info: any) {
    const dayOfWeek = info.start.getDay()
    const startMin = info.start.getHours() * 60 + info.start.getMinutes()
    const endMin = info.end.getHours() * 60 + info.end.getMinutes()

    setSelection({
      dayOfWeek,
      startMin,
      endMin,
      date: new Date(info.start),
    })

    setClickedId(null)
    setClickedKind(null)
    setModalMode("ADD")
    setShowModal(true)
  }

  async function handleAddRecurring() {
    if (!selection) return

    await fetch(`/api/manager/tutors/${tutorId}/recurring`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dayOfWeek: selection.dayOfWeek,
        startMin: selection.startMin,
        endMin: selection.endMin,
      }),
    })

    closeModal()
    setRefreshKey((k) => k + 1)
  }

  async function handleAddNonRecurring() {
    if (!selection) return

    // ✅ send date-only string (local)
    await fetch(`/api/manager/tutors/${tutorId}/nonrecurring`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: dayKey(selection.date),
        startMin: selection.startMin,
        endMin: selection.endMin,
        type: "ADD",
      }),
    })

    closeModal()
    setRefreshKey((k) => k + 1)
  }

  async function handleRemoveRecurring() {
    const recurringId = clickedKind === "RECURRING" ? clickedId : null
    if (!recurringId) return

    await fetch(`/api/manager/tutors/${tutorId}/recurring`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: recurringId }),
    })

    closeModal()
    setRefreshKey((k) => k + 1)
  }

  async function handleRemoveNonRecurring() {
    if (!selection) return

    // ✅ send date-only string (local)
    await fetch(`/api/manager/tutors/${tutorId}/nonrecurring`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: dayKey(selection.date),
        startMin: selection.startMin,
        endMin: selection.endMin,
        type: "REMOVE",
      }),
    })

    closeModal()
    setRefreshKey((k) => k + 1)
  }

  async function handleReverseAddNonRecurring() {
    if (!clickedId) return

    await fetch(`/api/manager/tutors/${tutorId}/nonrecurring`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: clickedId }),
    })

    closeModal()
    setRefreshKey((k) => k + 1)
  }

  function closeModal() {
    setShowModal(false)
    setSelection(null)
    setClickedId(null)
    setClickedKind(null)
    setModalMode("ADD")
  }

  return (
    <div className="max-w-5xl mx-auto mt-8 relative">
      <FullCalendar
        plugins={[timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        initialDate={initialDate}
        weekends={false}
        selectable={true}
        select={handleSelect}
        selectOverlap={false}
        unselectAuto={false}
        allDaySlot={false}
        headerToolbar={{
          left: "prev,next",
          center: "title",
          right: "",
        }}
        slotMinTime="09:00:00"
        slotMaxTime="18:00:00"
        events={events}
        height="auto"
        eventContent={(arg) => (
          <div className="p-1">
            <div className="text-sm font-mono">{arg.timeText}</div>
          </div>
        )}
        eventClick={(info) => {
          const p: any = info.event.extendedProps
          const dayOfWeek = p.dayOfWeek ?? info.event.start!.getDay()

          if (p.kind === "RECURRING") {
            setClickedId(String(p.recurringId))
            setClickedKind("RECURRING")
            setModalMode("CLICK_RECURRING")
          } else {
            // For nonrecurring blocks created from exceptions, prefer exceptionId if present.
            setClickedId(String(p.exceptionId ?? info.event.id))
            setClickedKind("NONRECURRING")
            setModalMode("CLICK_NONRECURRING")
          }

          setSelection({
            dayOfWeek,
            startMin: p.startMin,
            endMin: p.endMin,
            date: info.event.start!,
          })

          setShowModal(true)
        }}
      />

      <style jsx global>{`
        .fc .fc-timegrid-slot {
          height: 30px;
        }
      `}</style>

      <TutorTimeEditModal
        open={showModal && !!selection}
        mode={modalMode}
        onClose={closeModal}
        onAddRecurring={handleAddRecurring}
        onAddNonRecurring={handleAddNonRecurring}
        onRemoveRecurring={handleRemoveRecurring}
        onRemoveNonRecurring={handleRemoveNonRecurring}
        onReverseAddNonRecurring={handleReverseAddNonRecurring}
      />
    </div>
  )
}