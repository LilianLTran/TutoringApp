"use client";

import { useState } from "react";

import SessionsView from "@/components/SessionsView/SessionsView";
import ProfileCard from "@/components/ProfileCard";
import { useSaveProfileName } from "@/app/hooks/useSaveProfileName";

type Props = {
  user: { id: string; name: string | null; email: string };
  rows: any[];
};

export default function TutorDashboardView({ user, rows }: Props) {
  const [name, setName] = useState(user.name ?? "");
  const { saving, msg, saveName } = useSaveProfileName();

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-1">
        <ProfileCard
          roleLabel="Tutor"
          email={user.email}
          name={name}
          setName={setName}
          saving={saving}
          saveName={() => saveName(name)}
        />
      </div>

      <section className="rounded-2xl border bg-white p-6 shadow-sm lg:col-span-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Tutoring History
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Your scheduled and completed sessions.
            </p>
          </div>

          <div className="text-sm text-gray-500">
            Total: <span className="font-semibold text-gray-900">{rows.length}</span>
          </div>
        </div>

        <div className="mt-5">
          <SessionsView initialSessions={rows} canChangeStatus />
        </div>
      </section>
    </div>
  );
}