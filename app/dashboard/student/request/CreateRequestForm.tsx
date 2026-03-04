"use client"

import { useMemo } from "react";
import { useEffect, useState } from "react";

import { submitTutoringRequest } from "./actions";

import { 
  ERROR_OPTIONS,
  LOCATION_OPTIONS, 
  DSS_OPTIONS
} from "@/lib/constants/requestOptions";

type Course = {
  id: string
  name: string
};

type Instructor = {
  id: string
  name: string
  courses: { id: string; name: string }[]
};

type Props = {
  courses: Course[]
  instructors: Instructor[]
  action: (formData: FormData) => void
};

type TutorSlots = {
  tutorId: string;
  tutorName: string;
  slots: { startMin: number; endMin: number }[];
};

function minutesToLabel(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// helper to convert Date -> yyyy-mm-dd local
function toDateOnlyStringLocal(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function CreateRequestForm({
  courses,
  instructors,
  action,
}: Props) {

  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedInstructor, setSelectedInstructor] = useState<string>("");
  const [fullName, setFullName] = useState("");
  const [cwid, setCwid] = useState("");
  const [errorType, setErrorType] = useState("");
  const [location, setLocation] = useState("");
  const [dssRequire, setDssRequire] = useState("");

  const [selectedDateISO, setSelectedDateISO] = useState<string>(""); 
    // store date as "YYYY-MM-DD" (see below)
  const [slotsByTutor, setSlotsByTutor] = useState<TutorSlots[] | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedTutorId, setSelectedTutorId] = useState<string | null>(null);
  const [selectedStartMin, setSelectedStartMin] = useState<number | null>(null);

  const weekDates = useMemo(() => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const monday = new Date(today)
    monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7))

    return Array.from({ length: 14 })
      .map((_, i) => {
        const date = new Date(monday)
        date.setDate(monday.getDate() + i)
        return date
      })
      .filter((date) => {
        const day = date.getDay()
        return day !== 0 && day !== 6
      })
      .map((date) => ({
        value: toDateOnlyStringLocal(date),
        label: date.toLocaleDateString("en-US", {
          weekday: "short",
          month: "numeric",
          day: "numeric",
        }),
      }))
  }, [])

  useEffect(() => {
    // fetch only when course+date selected
    if (!selectedCourse || !selectedDateISO) {
      setSlotsByTutor(null);
      return;
    }

    let mounted = true;
    setLoadingSlots(true);
    setSlotsByTutor(null);

    (async () => {
      try {
        const params = new URLSearchParams({
          courseId: selectedCourse,
          date: selectedDateISO.slice(0, 10),
        });
        const res = await fetch(`/api/student/slots?${params}`);
        const data = await res.json();
        console.log("slots response", data);
        if (!res.ok) throw new Error(data?.error ?? "Failed to fetch slots");
        if (!mounted) return;
        setSlotsByTutor(data.tutors ?? []);
      } catch (e:any) {
        console.error(e);
        if (mounted) setSlotsByTutor([]);
      } finally {
        if (mounted) setLoadingSlots(false);
      }
    })();

    return () => { mounted = false; };
  }, [selectedCourse, selectedDateISO]);


async function handleSubmit(e: React.MouseEvent<HTMLButtonElement>) {
  if (!selectedTutorId || selectedStartMin == null || !selectedDateISO) {
    alert("Please select a tutor and time slot.");
    return;
  }

  if (!fullName || !cwid || !selectedCourse || !selectedInstructor) {
    alert("Please fill all required fields.");
    return;
  }

  try {
    await submitTutoringRequest({
      fullName,
      cwid,
      courseId: selectedCourse,
      instructorId: selectedInstructor,
      errorType,
      location,
      dssRequire,
      tutorId: selectedTutorId,
      startMin: selectedStartMin,
      dateKey: selectedDateISO,
    });

    alert("Request submitted successfully!");
  } catch (err: any) {
    alert(err?.message ?? "Submission failed.");
  }
}

  return (
    <div className="w-full min-h-screen sm:min-h-0 sm:max-w-2xl mx-auto
      bg-white p-6 sm:p-10 rounded-none sm:rounded-3xl shadow-none sm:shadow-xl
      border-0 sm:border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 mb-8">
        Tutoring Request Form
      </h2>

      <form action={action} className="space-y-6">

        {/* Name */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            FULL Name
          </label>
          <input
            name="fullName"
            type="text"
            required
            placeholder="John Smith"
            className="w-full border rounded-xl px-4 py-3
              focus:ring-2 focus:ring-[#99000D]
              text-black placeholder:text-gray-400"
            onChange={(e) => {
              setFullName(e.target.value)
            }}
          />
        </div>

        {/* CWID */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            CWID
          </label>
          <input
            name="cwid"
            type="text"
            required
            placeholder="012345678"
            className="w-full border rounded-xl px-4 py-3
              focus:ring-2 focus:ring-[#99000D]
              text-black placeholder:text-gray-400"
            onChange={(e) =>
              setCwid(e.target.value)
            }
          />
        </div>

        {/* Course */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Which class do you need assistance with?
          </label>
          <select
            name="courseId"
            required
            defaultValue=""
            onChange={(e) => {
              setSelectedCourse(e.target.value);
              // clear slots/tutor selection when course changes
              setSelectedTutorId(null);
              setSelectedStartMin(null);
              setSlotsByTutor(null);
              // also reset selected instructor because course change may 
              // change options
              setSelectedInstructor("");
            }}
            className="w-full border rounded-xl px-4 py-3
              focus:ring-2 focus:ring-[#99000D]
              text-black invalid:text-gray-400"
          >
            <option value="" disabled>Select Course</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Instructor */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Who is your instructor?
          </label>
          <select
            name="instructorId"
            required
            defaultValue=""
            className="w-full border rounded-xl px-4 py-3
              focus:ring-2 focus:ring-[#99000D]
              text-black invalid:text-gray-400"
            onChange={(e) => {
              setSelectedInstructor(e.target.value)
            }}
          >
            <option value="" disabled>Select Instructor</option>
            {instructors.map((instructor) => {
              const courseNames = instructor.courses
                .map((course) => course.name)
                .join(", ")

              return (
                <option key={instructor.id} value={instructor.id}>
                  {instructor.name} ({courseNames})
                </option>
              )
            })}
          </select>
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            On which date do you need help?
          </label>
          <select
            name="dateRequest"
            required
            defaultValue=""
            className="w-full border rounded-xl px-4 py-3
              focus:ring-2 focus:ring-[#99000D]
              text-black invalid:text-gray-400"
            onChange={(e) => {
              setSelectedDateISO(e.target.value);
              setSelectedTutorId(null); 
              setSelectedStartMin(null);
            }}
          >
            <option value="" disabled>Select Date</option>
            {weekDates.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>

        {/* Time slot picker */}
        <div className="mt-4">
          <label className="block text-sm font-semibold mb-2">
            Available slots
          </label>

          {loadingSlots && 
            <div className="text-sm text-gray-500">
              Loading slots…
            </div>
          }

          {!loadingSlots && slotsByTutor && slotsByTutor.length === 0 && (
            <div className="text-sm text-gray-500">
              No slots available for this date & course.
            </div>
          )}

          {!loadingSlots && slotsByTutor && slotsByTutor.map((t) => (
            <div key={t.tutorId} className="mb-3">
              <div className="text-sm font-medium mb-2 font-mono">{t.tutorName}</div>
              <div className="flex flex-wrap gap-2">
                {t.slots.map((s) => {
                  const isSelected = 
                    selectedTutorId === t.tutorId && 
                    selectedStartMin === s.startMin;
                  return (
                    <button
                      key={`${t.tutorId}-${s.startMin}`}
                      type="button"
                      onClick={() => {
                        setSelectedTutorId(t.tutorId);
                        setSelectedStartMin(s.startMin);
                      }}
                      className={`px-3 py-1 rounded-lg text-sm border 
                        ${isSelected ? "bg-[#99000D] text-white" : 
                          "bg-white text-gray-700"}`}
                    >
                      {minutesToLabel(s.startMin)}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Error Type */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            What kind of error do you get?
          </label>
          <select
            name="errorType"
            required
            defaultValue=""
            className="w-full border border-gray-300 rounded-xl px-4 py-3
              focus:ring-2 focus:ring-[#99000D]
              text-black invalid:text-gray-400"
            onChange={(e) => {
              setErrorType(e.target.value)
            }}
          >
            <option value="" disabled>
              Select Type of Help
            </option>

            {ERROR_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>        
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Zoom or in person? (Zoom only on Friday)
          </label>
          <select
            name="location"
            required
            defaultValue=""
            className="w-full border border-gray-300 rounded-xl px-4 py-3
              focus:ring-2 focus:ring-[#99000D]
              text-black invalid:text-gray-400"
            onChange={(e) => {
              setLocation(e.target.value)
            }}
          >
            <option value="" disabled>
              Select Location
            </option>

            {LOCATION_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* DSS */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Are you a DSS (Disability Support Services) student? 
            <br></br>
            (If yes, you need to ask a DSS counselor to email us in advance 
            to verify.)
          </label>
          <select
            name="dssRequire"
            required
            defaultValue=""
            className="w-full border border-gray-300 rounded-xl px-4 py-3
              focus:ring-2 focus:ring-[#99000D]
              text-black invalid:text-gray-400"
            onChange={(e) => {
              setDssRequire(e.target.value)
            }}
          >
            <option value="" disabled>
              Select DSS Requirement
            </option>

            {DSS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          onClick={handleSubmit}
          className="w-full bg-[#99000D] text-white py-3 
            rounded-2xl font-semibold"
        >
          Submit Request
        </button>
      </form>
    </div>
  )
}