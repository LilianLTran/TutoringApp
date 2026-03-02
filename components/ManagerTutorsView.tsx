"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type TutorRow = {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  coursesCount: number;
  availabilityCount: number;
  sessionsCount: number;
};

export default function ManagerTutorsView({ initialTutors }: { initialTutors: TutorRow[] }) {
  const [items, setItems] = useState<TutorRow[]>(initialTutors ?? []);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const sorted = useMemo(() => [...items].sort((a, b) => a.name.localeCompare(b.name)), [items]);

  async function addTutor() {
    setMsg(null);
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || !cleanEmail) {
      setMsg("Name and email are required.");
      return;
    }

    // basic client-side duplicate check
    if (items.some((t) => t.email.toLowerCase() === cleanEmail)) {
      setMsg("A tutor with that email already exists.");
      return;
    }

    setCreating(true);

    try {
      const res = await fetch("/api/manager/tutors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: cleanName, email: cleanEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error ?? "Failed to create tutor");
      }

      // optimistic / immediate UI update: created tutor will not have related counts yet
      setItems((prev) => [
        {
          id: data.id,
          name: data.name,
          email: data.email,
          isActive: data.isActive ?? false,
          coursesCount: 0,
          availabilityCount: 0,
          sessionsCount: 0,
        },
        ...prev,
      ]);

      setName("");
      setEmail("");
      setMsg("Tutor added.");
    } catch (e: any) {
      setMsg(e?.message ?? "Failed to add tutor.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Tutors</h1>
        <p className="text-sm text-gray-600">Add and manage tutor profiles.</p>
      </div>

      {msg && (
        <div className="rounded-xl border bg-white px-4 py-3 text-sm text-gray-700">
          {msg}
        </div>
      )}

      {/* Add form */}
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:items-end">
          <div className="sm:col-span-1">
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2"
              placeholder="e.g. Jane Doe"
            />
          </div>

          <div className="sm:col-span-1">
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2"
              placeholder="jane@example.edu"
              type="email"
            />
          </div>

          <div className="sm:col-span-1 flex gap-2 justify-start sm:justify-end">
            <button
              className="min-w-[140px] rounded-lg bg-[#99000D] px-4 py-2 text-white disabled:opacity-50"
              onClick={addTutor}
              disabled={creating || !name.trim() || !email.trim()}
            >
              {creating ? "Adding..." : "Add Tutor"}
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wide">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-center">Courses</th>
              <th className="px-6 py-3 text-center">Availability</th>
              <th className="px-6 py-3 text-center">Sessions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {sorted.map((tutor) => (
              <tr key={tutor.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">
                  <Link href={`/dashboard/manager/tutors/${tutor.id}`} className="hover:text-black hover:underline">
                    {tutor.name}
                  </Link>
                </td>

                <td className="px-6 py-4 text-gray-600">{tutor.email}</td>

                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      tutor.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {tutor.isActive ? "Active" : "Inactive"}
                  </span>
                </td>

                <td className="px-6 py-4 text-center text-gray-700">{tutor.coursesCount}</td>

                <td className="px-6 py-4 text-center text-gray-700">{tutor.availabilityCount}</td>

                <td className="px-6 py-4 text-center text-gray-700">{tutor.sessionsCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}