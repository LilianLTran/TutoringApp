"use client";

import Link from "next/link";

type Props = {
  tutorId: string;
  email: string;
  isActive: boolean;
};

export default function TutorCoursesCard({ tutorId, email, isActive }: Props) {
  return (
    <Link href={`/dashboard/manager/tutors/${tutorId}/edit`} className="block">
      <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-gray-300 transition cursor-pointer">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
          Basic Info
        </h2>

        <div className="space-y-3 text-sm text-gray-700">
          <div className="flex justify-between">
            <span className="font-medium text-gray-500">Email</span>
            <span>{email}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-500">Status</span>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                isActive
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      </section>
    </Link>
  )
}