"use client"

import { useMemo } from "react";
import { useEffect, useState } from "react";

import TextField from "./TextField";
import CourseSelect from "./CourseSelect";
import InstructorSelect from "./InstructorSelect";
import DateSelect from "./DateSelect";
import SlotSelect from "./SlotSelect";
import LocationSelect from "./LocationSelect";
import ErrorTypeSelect from "./ErrorTypeSelect";
import DSSRequiredSelect from "./DSSRequiredSelect";

import { submitTutoringRequest } from "./actions";

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

// Convert Date -> YYYY-MM-DD local
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
    // Store date as "YYYY-MM-DD" (see below)
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

  function handleChangeName(value: string) { setFullName(value); }
  function handleChangeCwid(value: string) { setCwid(value); }
  function handleChangeCourse(value: string) {
    setSelectedCourse(value);
    // Clear slots/tutor selection when course changes
    setSelectedTutorId(null);
    setSelectedStartMin(null);
    setSlotsByTutor(null);
    setSelectedInstructor("");
  }
  function handleChangeInstructor(value: string) {
    setSelectedInstructor(value);
  }
  function handleChangeDate(value: string) {
    setSelectedDateISO(value);
    setSelectedTutorId(null); 
    setSelectedStartMin(null);
  }
  function handleSelectSlot(tutorId: string, startMin: number) {
    setSelectedTutorId(tutorId);
    setSelectedStartMin(startMin);
  }
  function handleChangeErrorType(value: string) { setErrorType(value); }
  function handleChangeLocation(value: string) { setLocation(value); }
  function handleChangeDssRequire(value: string) { setDssRequire(value); }


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
        <TextField
          name="fullName"
          label="FULL Name"
          placeholder="John Smith"
          onChange={handleChangeName}
        />

        {/* CWID */}
        <TextField
          name="cwid"
          label="CWID"
          placeholder="012345678"
          onChange={handleChangeCwid}
        />

        {/* Course */}
        <CourseSelect
          courses={courses}
          value={selectedCourse}
          onChange={handleChangeCourse}
        />

        {/* Instructor */}
        <InstructorSelect
          instructors={instructors}
          value={selectedInstructor}
          onChange={handleChangeInstructor}
        />

        {/* Date */}
        <DateSelect
          dates={weekDates}
          value={selectedDateISO}
          onChange={handleChangeDate}
        />

        {/* Time slot picker */}
        <SlotSelect
          loadingSlots={loadingSlots}
          slotsByTutor={slotsByTutor}
          selectedTutorId={selectedTutorId}
          selectedStartMin={selectedStartMin}
          onPick={handleSelectSlot}
        />

        {/* Error Type */}
        <ErrorTypeSelect
          value={errorType}
          onChange={handleChangeErrorType}
        />

        {/* Location */}
        <LocationSelect
          value={location}
          onChange={handleChangeLocation}
        />

        {/* DSS */}
        <DSSRequiredSelect
          value={dssRequire}
          onChange={handleChangeDssRequire}
        />

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