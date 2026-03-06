"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import CoursePanel from "./CoursePanel";

type Course = { id: string; name: string };

type Props = {
  tutor: {
    id: string;
    name: string;
    email: string;
    isActive: boolean;
    courseIds: string[];
  };
  allCourses: Course[];
};

export default function TutorEditForm({ tutor, allCourses }: Props) {
  const [name, setName] = useState(tutor.name);
  const [email, setEmail] = useState(tutor.email);
  const [isActive, setIsActive] = useState(tutor.isActive);
  const [selected, setSelected] = useState<string[]>(tutor.courseIds);

  const [savingBasic, setSavingBasic] = useState(false);
  const [savingCourses, setSavingCourses] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const router = useRouter();

  async function saveBasic() {
    setMsg(null);
    setSavingBasic(true);
    try {
      const res = await fetch(`/api/manager/tutors/${tutor.id}/basic`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, isActive }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Failed to save basic info");
      setMsg("Basic info saved.");
      router.refresh();
    } catch (e: any) {
      setMsg(e.message ?? "Failed to save basic info");
    } finally {
      setSavingBasic(false);
    }
  }

  async function saveCourses() {
    setMsg(null);
    setSavingCourses(true);
    try {
      const res = await fetch(`/api/manager/tutors/${tutor.id}/courses`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseIds: selected }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Failed to save courses");
      setMsg("Courses updated.");
      router.refresh();
    } catch (e: any) {
      setMsg(e.message ?? "Failed to save courses");
    } finally {
      setSavingCourses(false);
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Edit Tutor</h1>
        <p className="text-gray-600">
          Update basic information and assign courses.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Basic Info */}
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Basic Info</h2>

          <label className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            className="mt-1 w-full rounded-lg border px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <label className="mt-4 block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            className="mt-1 w-full rounded-lg border px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label className="mt-4 flex items-center gap-2 text-sm 
            text-gray-700">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            Active tutor
          </label>

          <button
            onClick={saveBasic}
            disabled={savingBasic}
            className="mt-5 w-full rounded-lg bg-[#99000D] px-4 py-2 
              text-white disabled:opacity-50"
          >
            {savingBasic ? "Saving..." : "Save Basic Info"}
          </button>
        </div>

        {/* Courses Panel */}
        <CoursePanel
          allCourses={allCourses}
          selected={selected}
          setSelected={setSelected}
          onSave={saveCourses}
          saving={savingCourses}
        />
      </div>
    </div>
  );
}