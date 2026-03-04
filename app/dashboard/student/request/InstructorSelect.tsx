"use client";

type Instructor = { id: string; name: string; courses: { id: string; name: string }[] };

export default function InstructorSelect({
  instructors,
  value,
  onChange,
}: {
  instructors: Instructor[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-2">
        Who is your instructor?
      </label>
      <select
        name="instructorId"
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded-xl px-4 py-3
          focus:ring-2 focus:ring-[#99000D]
          text-black invalid:text-gray-400"
      >
        <option value="" disabled>
          Select Instructor
        </option>
        {instructors.map((instructor) => {
          const courseNames = instructor.courses.map((c) => c.name).join(", ");
          return (
            <option key={instructor.id} value={instructor.id}>
              {instructor.name} ({courseNames})
            </option>
          );
        })}
      </select>
    </div>
  );
}