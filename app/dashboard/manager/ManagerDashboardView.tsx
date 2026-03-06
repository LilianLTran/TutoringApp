"use client";

import { useRouter } from "next/navigation";
import { Users, BookOpen, GraduationCap, CalendarCheck } from "lucide-react";
import ActionCard from "./ActionCard";
import StatTile from "./StatTile";

type Props = {
  stats: {
    activeTutors: number;
    courses: number;
    instructors: number;
  };
};

export default function ManagerDashboardView({ stats }: Props) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
          {/* Sidebar */}
          <aside className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gray-900 text-white flex items-center justify-center font-semibold">
                M
              </div>
              <div>
                <p className="text-sm text-gray-500">Manager</p>
                <p className="font-semibold text-gray-900">Dashboard</p>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <button
                onClick={() => router.push("/dashboard/manager/tutors")}
                className="w-full rounded-xl px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                Manage Tutors
              </button>

              <button
                onClick={() => router.push("/dashboard/manager/courses")}
                className="w-full rounded-xl px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 flex items-center gap-2"
              >
                <BookOpen className="h-4 w-4" />
                Manage Courses
              </button>

              <button
                onClick={() => router.push("/dashboard/manager/instructors")}
                className="w-full rounded-xl px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 flex items-center gap-2"
              >
                <GraduationCap className="h-4 w-4" />
                Manage Instructors
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500">Quick Tips</p>
              <ul className="mt-2 space-y-1 text-xs text-gray-600">
                <li>• Keep tutor availability up to date</li>
                <li>• Ensure courses have assigned instructors</li>
                <li>• Review inactive profiles periodically</li>
              </ul>
            </div>
          </aside>

          {/* Main */}
          <main className="space-y-6">
            {/* Header */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
                    Manager Dashboard
                  </h1>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatTile label="Active Tutors" value={stats.activeTutors} />
              <StatTile label="Courses" value={stats.courses} />
              <StatTile label="Instructors" value={stats.instructors} />
            </div>

            {/* Primary Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ActionCard
                title="Manage Tutors"
                description="View profiles, edit availability, activate/deactivate tutors."
                icon={<Users className="h-5 w-5 text-gray-800" />}
                onClick={() => router.push("/dashboard/manager/tutors")}
              />
              <ActionCard
                title="Manage Courses"
                description="Create courses, update curriculum, and assign instructors."
                icon={<BookOpen className="h-5 w-5 text-gray-800" />}
                onClick={() => router.push("/dashboard/manager/courses")}
              />
              <ActionCard
                title="Manage Instructors"
                description="Manage instructor profiles, assignments, and capacity."
                icon={<GraduationCap className="h-5 w-5 text-gray-800" />}
                onClick={() => router.push("/dashboard/manager/instructors")}
              />
              <ActionCard
                title="Manage Tutoring Sessions"
                description="Manage tutoring sessions and their status."
                icon={<CalendarCheck className="h-5 w-5 text-gray-800" />}
                onClick={() => router.push("/dashboard/manager/sessions")}
              />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}