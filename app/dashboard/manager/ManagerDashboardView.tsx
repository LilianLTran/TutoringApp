"use client";

import { useRouter } from "next/navigation";
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  CalendarCheck, 
  MailQuestion,
  Settings, 
} from "lucide-react";
import ActionCard from "./ActionCard";
import StatTile from "./StatTile";

import ProfileCard from "@/components/ProfileCard";
import { useSaveProfileName } from "@/app/hooks/useSaveProfileName";
import { useState } from "react";


type Props = {
  user: { id: string; name: string | null; email: string };
  stats: {
    activeTutors: number;
    courses: number;
    instructors: number;
  };
};

export default function ManagerDashboardView({ user, stats }: Props) {
  const router = useRouter();

  const [name, setName] = useState(user.name ?? "");
  const { saving, msg, saveName } = useSaveProfileName();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
      {/* LEFT COLUMN */}
      <div className="space-y-6 lg:col-span-1">
        <ProfileCard
          roleLabel="Manager"
          email={user.email}
          name={name}
          setName={setName}
          saving={saving}
          saveName={() => saveName(name)}
        />
      </div>
      {/* Main */}
      <main className="space-y-6">
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
            description="View profiles, edit availability, 
              activate/deactivate tutors."
            icon={<Users className="h-5 w-5 text-gray-800" />}
            onClick={() => router.push("/dashboard/manager/tutors")}
          />
          <ActionCard
            title="Manage Courses"
            description="Create courses, update curriculum, and assign 
              instructors."
            icon={<BookOpen className="h-5 w-5 text-gray-800" />}
            onClick={() => router.push("/dashboard/manager/courses")}
          />
          <ActionCard
            title="Manage Instructors"
            description="Manage instructor profiles, assignments, and 
              capacity."
            icon={<GraduationCap className="h-5 w-5 text-gray-800" />}
            onClick={() => router.push("/dashboard/manager/instructors")}
          />
          <ActionCard
            title="Manage Tutoring Sessions"
            description="Manage tutoring sessions and their status."
            icon={<CalendarCheck className="h-5 w-5 text-gray-800" />}
            onClick={() => router.push("/dashboard/manager/sessions")}
          />
          <ActionCard
            title="Manage Email Templates"
            description="Manage auto email content"
            icon={<MailQuestion className="h-5 w-5 text-gray-800" />}
            onClick={() => router.push("/dashboard/manager/emails")}
          />
          <ActionCard
            title="Promote/Demote Manager"
            description="Manage all managers"
            icon={<Settings className="h-5 w-5 text-gray-800" />}
            onClick={() => router.push("/dashboard/manager/users")}
          />
        </div>
      </main>
    </div>
  );
}