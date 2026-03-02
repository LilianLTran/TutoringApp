"use client";

import { useMemo, useState } from "react";


type Course = { id: string; name: string };

type Props = {
  allCourses: Course[];
  selected: string[];
  setSelected: (ids: string[]) => void;

  onSave: () => Promise<void>;
  saving: boolean;

  setMsg?: (m: string | null) => void;
};

export default function CoursePanel({
  allCourses,
  selected,
  setSelected,
  onSave,
  saving,
}: Props) {
  const [courses, setCourses] = useState<Course[]>(allCourses);

  const selectedSet = useMemo(() => new Set(selected), [selected]);

  function toggleCourse(id: string) {
    setSelected(selectedSet.has(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  }

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Courses</h2>
          <p className="mt-1 text-sm text-gray-500">Select courses this tutor can teach.</p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border bg-gray-50 p-3">
        <div className="max-h-[360px] overflow-auto">
          <div className="grid gap-2">
            {courses.map((c) => {
              const checked = selectedSet.has(c.id);
              return (
                <div
                  key={c.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleCourse(c.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggleCourse(c.id);
                    }
                  }}
                  className={
                    "flex items-center justify-between gap-3 rounded-lg border px-3 py-2 transition " +
                    (checked
                      ? "bg-[#FBECE1] border-[#FFB6C1]"
                      : "bg-white border-gray-200 hover:shadow-sm")
                  }
                >
                  <div className="flex items-center gap-3 text-sm select-none">
                    <div className="font-medium">{c.name}</div>
                  </div>
                </div>
              );
            })}

            {courses.length === 0 && (
              <div className="rounded-lg border border-dashed bg-white p-4 text-sm text-gray-500">
                No courses yet.
              </div>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={onSave}
        disabled={saving}
        className="mt-5 w-full rounded-lg bg-[#99000D] px-4 py-2 text-white disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Courses"}
      </button>
    </div>
  );
}