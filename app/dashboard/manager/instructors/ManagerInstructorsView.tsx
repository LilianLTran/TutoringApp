"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Course = { id: string; name: string };
type Instructor = { id: string; name: string; courses: Course[] };

export default function ManagerInstructorsView({
  initialInstructors,
}: {
  initialInstructors: Instructor[];
}) {
  const [items, setItems] = useState<Instructor[]>(initialInstructors);

  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Instructor | null>(null);
  const [deleting, setDeleting] = useState(false);

  const sorted = useMemo(
    () => [...items].sort((a, b) => a.name.localeCompare(b.name)),
    [items]
  );

  async function addInstructor() {
    const clean = name.trim();
    if (!clean) return;

    setCreating(true);

    try {
      const res = await fetch("/api/manager/instructors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: clean }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Failed to create instructor");

      setItems((prev) => [{ id: data.id, name: data.name, courses: [] }, ...prev]);

      setName("");
    } catch (e: any) {
    } finally {
      setCreating(false);
    }
  }

  function openDelete(ins: Instructor) {
    setToDelete(ins);
    setDeleteOpen(true);
  }

  async function confirmDelete() {
    if (!toDelete) return;

    setDeleting(true);

    try {
      const res = await fetch(`/api/manager/instructors/${toDelete.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Failed to delete instructor");

      setItems((prev) => prev.filter((x) => x.id !== toDelete.id));

      setDeleteOpen(false);
      setToDelete(null);
    } catch (e: any) {
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Instructors</h1>
        <p className="text-sm text-gray-600">
          Create instructors and assign the courses they teach.
        </p>
      </div>

      {/* Add instructor */}
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700">
              New instructor name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2"
              placeholder="Dr. John Smith"
            />
          </div>

          <button
            className="min-w-[160px] rounded-lg bg-[#99000D] px-4 py-2 text-white"
            onClick={addInstructor}
            disabled={creating || !name.trim()}
          >
            {creating ? "Adding..." : "Add Instructor"}
          </button>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wide">
            <tr>
              <th className="px-5 py-3">Instructor</th>
              <th className="px-5 py-3">Courses</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {sorted.map((ins) => (
              <tr key={ins.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4 font-medium text-gray-900">
                  <Link
                    href={`/dashboard/manager/instructors/${ins.id}`}
                    className="hover:underline"
                  >
                    {ins.name}
                  </Link>
                </td>

                <td className="px-5 py-4 text-gray-700">
                  {ins.courses.length === 0 ? (
                    <span className="text-gray-400">No courses assigned</span>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {ins.courses.map((c) => (
                        <span
                          key={c.id}
                          className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700"
                        >
                          {c.name}
                        </span>
                      ))}
                    </div>
                  )}
                </td>

                <td className="px-5 py-4 text-right">
                  <button
                    onClick={() => openDelete(ins)}
                    className="rounded-md px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {sorted.length === 0 && (
              <tr>
                <td className="px-5 py-10 text-center text-gray-500" colSpan={3}>
                  No instructors yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete confirm modal */}
      {deleteOpen && toDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-lg font-semibold">Delete Instructor</h3>
              <button
                onClick={() => {
                  setDeleteOpen(false);
                  setToDelete(null);
                }}
                className="rounded-md px-2 py-1 text-sm text-gray-500 hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <p className="mt-3 text-sm text-gray-700">
              Delete <span className="font-semibold">{toDelete.name}</span>?
            </p>

            <div className="mt-3 rounded-lg border bg-gray-50 p-3 text-xs text-gray-600">
              This will also remove their association with{" "}
              <span className="font-semibold">{toDelete.courses.length}</span> course(s).
              Requests linked to this instructor will also be deleted.
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => {
                  setDeleteOpen(false);
                  setToDelete(null);
                }}
                className="rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
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