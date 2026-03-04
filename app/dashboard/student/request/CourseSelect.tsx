"use client";

type Course = { id: string; name: string };

export default function CourseSelect({
  courses,
  value,
  onChange,
}: {
  courses: Course[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-2">
        Which class do you need assistance with?
      </label>
      <select
        name="courseId"
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded-xl px-4 py-3
          focus:ring-2 focus:ring-[#99000D]
          text-black invalid:text-gray-400"
      >
        <option value="" disabled>
          Select Course
        </option>
        {courses.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}