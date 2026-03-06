"use client";

import Link from "next/link";
import { TutorRow } from "./types";

type Props = {
  tutors: TutorRow[];
  onDeleteClick: (t: TutorRow) => void;
};

export default function TutorsTable({ tutors, onDeleteClick }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 
      bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 text-xs uppercase tracking-wide 
          text-gray-600">
          <tr>
            <th className="px-6 py-3">Name</th>
            <th className="px-6 py-3">Email</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3 text-center">Courses</th>
            <th className="px-6 py-3 text-center">Availability</th>
            <th className="px-6 py-3 text-center">Sessions</th>
            <th className="px-6 py-3 text-right">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {tutors.map((t) => (
            <tr key={t.id} className="transition-colors hover:bg-gray-50">
              <td className="px-6 py-4 font-medium text-gray-900">
                <Link 
                  href={`/dashboard/manager/tutors/${t.id}`} 
                  className="hover:text-black hover:underline"
                >
                  {t.name}
                </Link>
              </td>

              <td className="px-6 py-4 text-gray-600">{t.email}</td>

              <td className="px-6 py-4">
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    t.isActive ? "bg-green-100 text-green-700" : 
                    "bg-red-100 text-red-700"
                  }`}
                >
                  {t.isActive ? "Active" : "Inactive"}
                </span>
              </td>

              <td className="px-6 py-4 text-center text-gray-700">
                {t.coursesCount}
              </td>
              <td className="px-6 py-4 text-center text-gray-700">
                {t.availabilityCount}
              </td>
              <td className="px-6 py-4 text-center text-gray-700">
                {t.sessionsCount}
              </td>

              <td className="px-6 py-4 text-right">
                <button
                  onClick={() => onDeleteClick(t)}
                  className="rounded-lg border px-3 py-1.5 text-xs font-medium 
                    text-red-700 hover:bg-red-50"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}

          {tutors.length === 0 && (
            <tr>
              <td 
                colSpan={7} 
                className="px-6 py-10 text-center text-sm text-gray-500"
              >
                No tutors yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}