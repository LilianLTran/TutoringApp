"use client"

import { useMemo } from "react"
import { 
  ERROR_OPTIONS,
  LOCATION_OPTIONS, 
  DSS_OPTIONS 
} from "@/lib/constants/requestOptions"

type Course = {
  id: string
  name: string
}

type Instructor = {
  id: string
  name: string
  courses: { id: string; name: string }[]
}

type Props = {
  courses: Course[]
  instructors: Instructor[]
  action: (formData: FormData) => void
}

export default function CreateRequestForm({
  courses,
  instructors,
  action,
}: Props) {

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
        value: date.toISOString(),
        label: date.toLocaleDateString("en-US", {
          weekday: "short",
          month: "numeric",
          day: "numeric",
        }),
      }))
  }, [])

  const timeSlots = Array.from({ length: 15 }, (_, i) => {
    const hour = 10 + Math.floor(i / 2)
    const minute = i % 2 === 0 ? "00" : "30"
    return `${hour.toString().padStart(2, "0")}:${minute}`
  })

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
          >
            <option value="" disabled>Select Date</option>
            {weekDates.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>

        {/* Time */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            At what time? (Please sign up at lease two hours in advance, 
            one session per day)
          </label>
          <select
            name="timeRequest"
            required
            defaultValue=""
            className="w-full border rounded-xl px-4 py-3
              focus:ring-2 focus:ring-[#99000D]
              text-black invalid:text-gray-400"
          >
            <option value="" disabled>Select Time</option>
            {timeSlots.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
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
          className="w-full bg-[#99000D] text-white py-3 
            rounded-2xl font-semibold"
        >
          Submit Request
        </button>
      </form>
    </div>
  )
}