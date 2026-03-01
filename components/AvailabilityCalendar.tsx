"use client"

import FullCalendar from "@fullcalendar/react"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"
import { useEffect, useState, useMemo } from "react"

import TutorTimeEditModal, {ModalMode} from "./TutorTimeEditModal"


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

function minutesToTime(min: number) {
  const h = Math.floor(min / 60)
  const m = min % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`
}

function minutesToDate(dateStrOrDate: string | Date, min: number) {
  const d = new Date(dateStrOrDate);
  d.setHours(0, 0, 0, 0);
  d.setMinutes(min);
  return d;
}

export default function RecurringCalendar({ tutorId }: Props) {
  const [events, setEvents] = useState<any[]>([])
  const [refreshKey, setRefreshKey] = useState(0)

  const [selection, setSelection] = useState<SelectionInfo | null>(null)
  const [showModal, setShowModal] = useState(false)

  const [modalMode, setModalMode] = useState<ModalMode>("ADD")
  const [clickedId, setClickedId] = useState<string | null>(null)
  const [clickedKind, setClickedKind] = useState<"RECURRING" | "NONRECURRING" | null>(null);

  // Set the first date to be shown on the calendar
  // Same Monday for dayofweek, next Monday for weekend
  const initialDate = useMemo(() => {
    const today = new Date()
    const day = today.getDay()
    if (day === 6) return new Date(new Date(today).setDate(today.getDate() + 2)) // Sat -> Mon
    if (day === 0) return new Date(new Date(today).setDate(today.getDate() + 1)) // Sun -> Mon
    return today
  }, [])


  useEffect(() => {
    async function load() {
      const [recRes, nonRes] = await Promise.all([
        fetch(`/api/manager/tutors/${tutorId}/recurring`),
        fetch(`/api/manager/tutors/${tutorId}/nonrecurring`),
      ]);

      const [recurring, nonrecurring] = await Promise.all([
        recRes.json(),
        nonRes.json(),
      ]);

      const recurringEvents = recurring.map((block: any) => ({
        id: String(block.id),
        daysOfWeek: [block.dayOfWeek],
        startTime: minutesToTime(block.startMin),
        endTime: minutesToTime(block.endMin),
        backgroundColor: RECURRING_COLOR,
        borderColor: RECURRING_COLOR,
        extendedProps: {
          kind: "RECURRING",
          dayOfWeek: block.dayOfWeek,
          startMin: block.startMin,
          endMin: block.endMin,
        },
      }));

      const nonRecurringEvents = nonrecurring.map((block: any) => {
        const start = minutesToDate(block.date, block.startMin);
        const end = minutesToDate(block.date, block.endMin);

        return {
          id: String(block.id),
          start,
          end,
          backgroundColor: NON_RECURRING_COLOR,
          borderColor: NON_RECURRING_COLOR,
          extendedProps: {
            kind: "NONRECURRING",
            date: block.date,
            startMin: block.startMin,
            endMin: block.endMin,
            type: block.type, // "ADD" | "REMOVE"
          },
        };
      });

      setEvents([...recurringEvents, ...nonRecurringEvents]);
    }

    load().catch((e) => {
      console.error(e);
      setEvents([]);
    });
  }, [tutorId, refreshKey]);

  function handleSelect(info: any) {
    const dayOfWeek = info.start.getDay()
    const startMin =
      info.start.getHours() * 60 + info.start.getMinutes()
    const endMin =
      info.end.getHours() * 60 + info.end.getMinutes()

    setSelection({
      dayOfWeek,
      startMin,
      endMin,
      date: new Date(info.start),
    })

    setClickedId(null)
    setModalMode("ADD")
    setShowModal(true)
  }

  async function handleAddRecurring() {
    if (!selection) return

    const res = await fetch(`/api/manager/tutors/${tutorId}/recurring`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dayOfWeek: selection.dayOfWeek,
        startMin: selection.startMin,
        endMin: selection.endMin,
      }),
    })

    closeModal()
    setRefreshKey(k => k + 1)
  }

  async function handleAddNonRecurring() {
    if (!selection) return

    await fetch(`/api/manager/tutors/${tutorId}/nonrecurring`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: selection.date.toISOString(),
        startMin: selection.startMin,
        endMin: selection.endMin,
        type: "ADD",
      }),
    })

    closeModal()
    setRefreshKey(k => k + 1)
  }

  async function handleRemoveRecurring() {
    if (!selection) return

    const res = await fetch(`/api/manager/tutors/${tutorId}/recurring`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: clickedId }),
    })

    closeModal()
    setRefreshKey((k) => k + 1)
  }

  async function handleRemoveNonRecurring() {
    if (!selection) return

    const res = await fetch(`/api/manager/tutors/${tutorId}/nonrecurring`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: selection.date.toISOString(),
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

    const res = await fetch(`/api/manager/tutors/${tutorId}/nonrecurring`, {
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
    setModalMode("ADD")
  }

  return (
    <div className="max-w-5xl mx-auto mt-8 relative">
      <FullCalendar
        // key={refreshKey}
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
        
        eventContent={(arg) => {
          return (
            <div className="p-1">
              <div className="text-sm font-mono">
                {arg.timeText}
              </div>
            </div>
          )
        }}

        eventClick={(info) => {
          const p: any = info.event.extendedProps
          const dayOfWeek = p.dayOfWeek ?? info.event.start!.getDay()

          setClickedId(info.event.id || null)
          setClickedKind(p.kind)
          
          if (p.kind === "RECURRING") {
            setModalMode("CLICK_RECURRING")
          } else {
            setModalMode("CLICK_NONRECURRING")
          }

          setSelection({
            dayOfWeek: dayOfWeek,
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