"use client"

import FullCalendar from "@fullcalendar/react"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"
import { useEffect, useMemo, useState } from "react"

import TutorTimeEditModal, { ModalMode } from "./TutorTimeEditModal"
import { subtractMany } from "@/lib/timeBlocks"
import { dayKey, minsToDate } from "@/lib/dateNormalization"

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

function startOfWeekMonday(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  const day = x.getDay()
  const diff = (day + 6) % 7
  x.setDate(x.getDate() - diff)
  return x
}

export default function AvailabilityCalendar({ tutorId }: Props) {
  const [events, setEvents] = useState<any[]>([])
  const [refreshKey, setRefreshKey] = useState(0)

  const [selection, setSelection] = useState<SelectionInfo | null>(null)
  const [showModal, setShowModal] = useState(false)

  const [modalMode, setModalMode] = useState<ModalMode>("ADD")
  const [clickedId, setClickedId] = useState<string | null>(null)
  const [clickedKind, setClickedKind] = 
    useState<"RECURRING" | "NONRECURRING" | null>(null)

  const initialDate = useMemo(() => {
    const today = new Date()
    const day = today.getDay()
    // If today is weekend, set Monday to the next week
    if (day === 6) 
      return new Date(new Date(today).setDate(today.getDate() + 2))
    if (day === 0) 
      return new Date(new Date(today).setDate(today.getDate() + 1))
    return today
  }, [])

  useEffect(() => {
    async function load() {
      const [recRes, exRes] = await Promise.all([
        fetch(
          `/api/manager/tutors/${tutorId}/recurring`, 
          { cache: "no-store" }
        ),
        fetch(
          `/api/manager/tutors/${tutorId}/nonrecurring`, 
          { cache: "no-store" }
        ),
      ])

      const [recurring, exceptions] = 
        await Promise.all([recRes.json(), exRes.json()])
      const recByDow = 
        new Map<number, Array<Block & { recurringId: string }>>()

      for (const r of recurring) {
        const arr = recByDow.get(r.dayOfWeek) ?? []
        arr.push({ 
          recurringId: String(r.id), 
          startMin: r.startMin, 
          endMin: r.endMin 
        })
        recByDow.set(r.dayOfWeek, arr)
      }

      const exByDate = new Map<string, any[]>()
      for (const ex of exceptions) {
        // We only care about local calendar day:
        const k = dayKey(new Date(ex.date))
        const arr = exByDate.get(k) ?? []
        arr.push(ex)
        exByDate.set(k, arr)
      }

      // Build events for next 3 months
      const startDate = startOfWeekMonday(initialDate)
      startDate.setHours(0, 0, 0, 0)

      const endDate = new Date(startDate)
      endDate.setMonth(endDate.getMonth() + 3)

      const out: any[] = []

      for (
        let d = new Date(startDate); 
        d < endDate; 
        d.setDate(d.getDate() + 1)
      ) {
        const day = new Date(d)
        const dow = day.getDay()
        const k = dayKey(day)

        const base = recByDow.get(dow) ?? []
        const dayExceptions = exByDate.get(k) ?? []

        const removes = dayExceptions
          .filter((ex) => ex.type === "REMOVE")
          .map((ex) => ({ startMin: ex.startMin, endMin: ex.endMin }))

        const adds = dayExceptions.filter((ex) => ex.type === "ADD")

        for (const baseBlock of base) {
          // Start with the recurring block as the base
          let blocks: Block[] = [{ 
            startMin: baseBlock.startMin, 
            endMin: baseBlock.endMin 
          }]

          blocks = subtractMany(blocks, removes)

          // Convert remaining blocks into events
          for (const b of blocks) {
            out.push({
              id: `occ:${baseBlock.recurringId}:` + 
                `${k}:${b.startMin}:${b.endMin}`,
              start: minsToDate(day, b.startMin),
              end: minsToDate(day, b.endMin),
              backgroundColor: RECURRING_COLOR,  
              borderColor: RECURRING_COLOR,
              extendedProps: {
                kind: "RECURRING",
                recurringId: baseBlock.recurringId,
                dayOfWeek: dow,
                startMin: b.startMin,
                endMin: b.endMin,
                dateKey: k,
              },
            })
          }
        }

        // Also include ADD exceptions that happen on days with 
        // no recurring blocks at all
        for (const ex of adds) {
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

  function handleEventClick(info: any) {
    const p: any = info.event.extendedProps
    const dayOfWeek = p.dayOfWeek ?? info.event.start!.getDay()

    if (p.kind === "RECURRING") {
      setClickedId(String(p.recurringId))
      setClickedKind("RECURRING")
      setModalMode("CLICK_RECURRING")
    } else {
      // For nonrecurring blocks created from exceptions, 
      // prefer exceptionId if present.
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
        eventClick={handleEventClick}
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