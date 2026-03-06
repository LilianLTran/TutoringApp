"use client";

import type { SessionRow } from "./types";
import convertTime from "@/lib/covertTime";

function statusClass(status: string) {
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

export default function SessionsTable({
  rows,
  canChangeStatus,
  onEdit,
}: {
  rows: SessionRow[];
  canChangeStatus: boolean;
  onEdit: (row: SessionRow) => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50 text-xs text-gray-600 uppercase">
          <tr>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Course</th>
            <th className="px-4 py-3">Tutor</th>
            <th className="px-4 py-3">Student</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Location</th>
            {canChangeStatus && (
              <th className="px-4 py-3 text-right">Actions</th>
            )}
          </tr>
        </thead>

        <tbody>
          {rows.map((s) => (
            <tr key={s.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <div>{s.date}</div>
                <div className="text-xs text-gray-500">
                  {convertTime(s.startMin)}–{convertTime(s.endMin)}
                </div>
              </td>

              <td className="px-4 py-3">{s.courseName}</td>
              <td className="px-4 py-3">{s.tutorName ?? "—"}</td>
              <td className="px-4 py-3">{s.studentName ?? "—"}</td>

              <td className="px-4 py-3">
                <span className={statusClass(s.status)}>
                  {s.status}
                </span>
              </td>

              <td className="px-4 py-3">{s.location || "—"}</td>

              {canChangeStatus && (
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => onEdit(s)}
                    className="text-xs text-[#99000D]"
                  >
                    Update
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}