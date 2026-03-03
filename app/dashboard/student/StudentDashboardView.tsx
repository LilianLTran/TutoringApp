"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type SessionRow = {
  id: string;
  start: string;
  end: string;
  status: string;
  location: string;
  courseName: string;
  tutorName: string;
};

type Props = {
  user: { id: string; email: string; name: string };
  sessions: SessionRow[];
};

function fmt(dtIso: string) {
  const d = new Date(dtIso);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function statusPill(status: string) {
  const base = "px-2 py-1 rounded-full text-xs font-medium";
  switch (status) {
    case "COMPLETED":
      return `${base} bg-green-100 text-green-700`;
    case "CANCELLED":
      return `${base} bg-gray-200 text-gray-700`;
    case "NO_SHOW":
      return `${base} bg-red-100 text-red-700`;
    default:
      return `${base} bg-blue-100 text-blue-700`;
  }
}

export default function StudentDashboardView({ user, sessions }: Props) {
  const [name, setName] = useState(user.name ?? "");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const sorted = useMemo(() => sessions, [sessions]);

  async function saveName() {
    setMsg(null);
    setSaving(true);
    try {
      const res = await fetch("/api/student/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }), // can be blank
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Failed to update profile");
      setMsg("Profile updated.");
    } catch (e: any) {
      setMsg(e?.message ?? "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Left column */}
      <div className="space-y-6 lg:col-span-1">
        {/* Profile card */}
        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Student Profile</h2>
              <p className="mt-1 text-sm text-gray-500">Update your display name.</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-semibold">
              {(name?.trim()?.[0] ?? user.email[0] ?? "S").toUpperCase()}
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <div className="mt-1 rounded-lg border bg-gray-50 px-3 py-2 text-sm text-gray-700">
                {user.email}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name <span className="text-gray-400">(optional)</span>
              </label>
              <input
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="You can leave this blank"
              />
            </div>

            <button
              onClick={saveName}
              disabled={saving}
              className="h-10 w-full rounded-lg bg-[#99000D] text-white disabled:opacity-50 flex items-center justify-center"
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </section>

        {/* Request card */}
        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Request Tutoring</h2>
          <p className="mt-1 text-sm text-gray-500">
            Submit a tutoring request for your course and preferred time.
          </p>

          <Link
            href="/dashboard/student/request"
            className="mt-4 h-10 w-full rounded-lg bg-[#99000D] text-white flex items-center justify-center"
          >
            New Tutoring Request
          </Link>
        </section>
      </div>

      {/* Right column: history */}
      <section className="rounded-2xl border bg-white p-6 shadow-sm lg:col-span-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Tutoring History</h2>
            <p className="mt-1 text-sm text-gray-500">
              Your scheduled and completed sessions.
            </p>
          </div>
          <div className="text-sm text-gray-500">
            Total: <span className="font-semibold text-gray-900">{sorted.length}</span>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-xl border">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-600">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Course</th>
                <th className="px-4 py-3">Tutor</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Location</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sorted.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900 font-medium">
                    {fmt(s.start)} – {new Date(s.end).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{s.courseName}</td>
                  <td className="px-4 py-3 text-gray-700">{s.tutorName}</td>
                  <td className="px-4 py-3">
                    <span className={statusPill(s.status)}>{s.status}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{s.location || "—"}</td>
                </tr>
              ))}

              {sorted.length === 0 && (
                <tr>
                  <td className="px-4 py-8 text-center text-gray-500" colSpan={5}>
                    No sessions yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}