"use client";

import { useMemo, useState } from "react";

type CourseRow = {
  id: string;
  name: string;
  _count: {
    requests: number;
    sessions: number;
    tutors: number;
    instructors: number;
  };
};

export default function ManagerCoursesView({
  initialCourses,
}: {
  initialCourses: CourseRow[];
}) {
  const [courses, setCourses] = useState<CourseRow[]>(initialCourses);

  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<CourseRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [msg, setMsg] = useState<string | null>(null);

  const sorted = useMemo(
    () => [...courses].sort((a, b) => a.name.localeCompare(b.name)),
    [courses]
  );

  async function addCourse() {
    const clean = name.trim();
    if (!clean) return;

    setCreating(true);
    setMsg(null);
    try {
      const res = await fetch("/api/manager/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: clean }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Failed to create course");

      setCourses((prev) => [data, ...prev]);
      setName("");
      setMsg("Course created.");
    } catch (e: any) {
      setMsg(e?.message ?? "Failed to create course");
    } finally {
      setCreating(false);
    }
  }

  function openDelete(c: CourseRow) {
    setToDelete(c);
    setDeleteOpen(true);
    setMsg(null);
  }

  async function confirmDelete() {
    if (!toDelete) return;

    setDeleting(true);
    setMsg(null);
    try {
      const res = await fetch("/api/manager/courses", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: toDelete.id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Failed to delete course");

      setCourses((prev) => prev.filter((c) => c.id !== toDelete.id));
      setMsg("Course deleted (and related data removed).");
      setDeleteOpen(false);
      setToDelete(null);
    } catch (e: any) {
      setMsg(e?.message ?? "Failed to delete course");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Courses</h1>
        <p className="text-sm text-gray-600">
          Create and manage courses. Deleting a course will remove its related 
          requests/sessions.
        </p>
      </div>

      {/* Create */}
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end 
          sm:justify-between">
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700">
              New course name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2"
              placeholder="CIS 22A"
            />
          </div>

          <button
            onClick={addCourse}
            disabled={creating || !name.trim()}
            className="h-10 w-40 rounded-lg bg-[#99000D] px-4 py-2 text-white 
              disabled:opacity-50"
          >
            {creating ? "Adding..." : "Add Course"}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 
        overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs 
            tracking-wide">
            <tr>
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3 text-center">Requests</th>
              <th className="px-5 py-3 text-center">Sessions</th>
              <th className="px-5 py-3 text-center">Tutors</th>
              <th className="px-5 py-3 text-center">Instructors</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {sorted.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3 font-medium text-gray-900">
                  {c.name}
                </td>
                <td className="px-5 py-3 text-center">
                  {c._count.requests}
                </td>
                <td className="px-5 py-3 text-center">
                  {c._count.sessions}
                </td>
                <td className="px-5 py-3 text-center">
                  {c._count.tutors}
                </td>
                <td className="px-5 py-3 text-center">
                  {c._count.instructors}
                </td>
                <td className="px-5 py-3 text-right">
                  <button
                    onClick={() => openDelete(c)}
                    className="rounded-md px-3 py-1.5 text-xs font-medium 
                      text-red-700 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {sorted.length === 0 && (
              <tr>
                <td 
                  className="px-5 py-10 text-center text-gray-500" 
                  colSpan={6}
                >
                  No courses yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete confirm modal */}
      {deleteOpen && toDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center 
          bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-lg font-semibold">Delete Course</h3>
              <button
                onClick={() => {
                  setDeleteOpen(false);
                  setToDelete(null);
                }}
                className="rounded-md px-2 py-1 text-sm text-gray-500 
                  hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <p className="mt-3 text-sm text-gray-700">
              Delete <span className="font-semibold">{toDelete.name}</span>?
            </p>

            <div className="mt-3 rounded-lg border bg-gray-50 p-3 text-xs
              text-gray-600">
              This will also delete:
              <ul className="mt-2 list-disc pl-5 space-y-1">
                <li>{toDelete._count.requests} tutoring request(s)</li>
                <li>{toDelete._count.sessions} session(s)</li>
                <li>and unlink {toDelete._count.tutors} tutor(s) + 
                  {toDelete._count.instructors} instructor(s)</li>
              </ul>
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => {
                  setDeleteOpen(false);
                  setToDelete(null);
                }}
                className="rounded-md px-3 py-2 text-sm text-gray-600 
                  hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium 
                  text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}