"use client";

import { useState } from "react";

export function useSaveProfileName() {
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function saveName(name: string) {
    setMsg(null);
    setSaving(true);

    try {
      const res = await fetch("/api/me/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }), // can be blank
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Failed to update profile");

      setMsg("Profile updated.");
      return { ok: true as const };
    } catch (e: any) {
      setMsg(e?.message ?? "Failed to update profile");
      return { ok: false as const };
    } finally {
      setSaving(false);
    }
  }

  return { saving, msg, setMsg, saveName };
}