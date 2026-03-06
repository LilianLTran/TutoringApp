"use client";

import { useState } from "react";

type Props = {
  onCreate: (payload: { name: string; email: string }) => Promise<void>;
  creating: boolean;
  setCreating: (v: boolean) => void;
  setMsg: (m: string | null) => void;
  canCreate: (email: string) => boolean; // duplicate check hook
};

export default function AddTutorForm({ 
  onCreate, 
  creating, 
  setCreating, 
  setMsg, 
  canCreate 
}: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  async function submit() {
    setMsg(null);

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || !cleanEmail) {
      setMsg("Name and email are required.");
      return;
    }
    if (!canCreate(cleanEmail)) {
      setMsg("A tutor with that email already exists.");
      return;
    }

    setCreating(true);
    try {
      await onCreate({ name: cleanName, email: cleanEmail });
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
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:items-end">
        <div className="sm:col-span-1">
          <label className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2"
            placeholder="e.g. Jane Doe"
          />
        </div>

        <div className="sm:col-span-1">
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2"
            placeholder="jane@example.edu"
            type="email"
          />
        </div>

        <div className="sm:col-span-1 flex justify-start gap-2 sm:justify-end">
          <button
            onClick={submit}
            disabled={creating || !name.trim() || !email.trim()}
            className="min-w-[140px] rounded-lg bg-[#99000D] px-4 py-2 
              text-white disabled:opacity-50"
          >
            {creating ? "Adding..." : "Add Tutor"}
          </button>
        </div>
      </div>
    </div>
  );
}