"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Course = { id: string; name: string };

export default function InstructorCoursesEditor({
  instructor,
  allCourses,
}: {
  instructor: { id: string; name: string; courseIds: string[] };
  allCourses: Course[];
}) {
  const router = useRouter();

  const [selected, setSelected] = useState<string[]>(instructor.courseIds);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const selectedSet = useMemo(() => new Set(selected), [selected]);

  function toggle(id: string) {
    setSelected((prev) => 
      (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function save() {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch(
        `/api/manager/instructors/${instructor.id}/courses`, 
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courseIds: selected }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Failed to save courses");

      setMsg("Courses updated.");
      router.refresh();
    } catch (e: any) {
      setMsg(e?.message ?? "Failed to save courses");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          {instructor.name}
        </h1>
        <p className="text-sm text-gray-600">
          Select the courses this instructor teaches.
        </p>
      </div>

      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="grid gap-2">
          {allCourses.map((c) => {
            const picked = selectedSet.has(c.id);
            return (
              <div
                key={c.id}
                role="button"
                tabIndex={0}
                onClick={() => toggle(c.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggle(c.id);
                  }
                }}
                className={
                  "flex items-center justify-between rounded-lg " +
                  "border px-3 py-2 transition cursor-pointer " +
                  (picked
                      ? "bg-[#FBECE1] border-[#FFB6C1]"
                      : "bg-white border-gray-200 hover:shadow-sm")
                }
              >
                <div className="text-sm font-medium text-gray-900">
                  {c.name}
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={save}
          disabled={saving}
          className="mt-5 w-full rounded-lg bg-[#99000D] px-4 py-2 
            text-white disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Courses"}
        </button>
      </div>
    </div>
  );
}
