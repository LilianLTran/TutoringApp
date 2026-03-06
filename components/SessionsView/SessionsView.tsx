"use client";

import { useState, useMemo } from "react";
import type { SessionRow, SessionStatus } from "./types";
import { updateSessionStatus } from "./actions";

import SessionsTable from "./SessionsTable";
import SessionStatusModal from "./SessionStatusModal";

export default function SessionsView({
  initialSessions,
  canChangeStatus = true,
}: {
  initialSessions: SessionRow[];
  canChangeStatus?: boolean;
}) {
  const [rows, setRows] = useState<SessionRow[]>(initialSessions);
  const [active, setActive] = useState<SessionRow | null>(null);
  const [newStatus, setNewStatus] = useState<SessionStatus>("SCHEDULED");
  const [cancelReason, setCancelReason] = useState("");
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => rows, [rows]);

  async function openEditor(r: SessionRow) {
    setActive(r);
    setNewStatus(r.status);
    setCancelReason("");
  }

  async function save() {
    if (!active) return;
    setSaving(true);
    try {
      await updateSessionStatus({
        sessionId: active.id,
        status: newStatus,
        cancelReason: newStatus === "CANCELLED" ? cancelReason : undefined,
      });
      setRows((prev) => prev.map((p) => (p.id === active.id ? { ...p, status: newStatus } : p)));
      setActive(null);
    } catch (err: any) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="pt-12">
      <div className="max-w-5xl mx-auto px-4">
        <div className="space-y-4">
          <SessionsTable
            rows={filtered}
            canChangeStatus={canChangeStatus}
            onEdit={openEditor}
          />

          <SessionStatusModal
            open={!!active && canChangeStatus}
            status={newStatus}
            setStatus={setNewStatus}
            cancelReason={cancelReason}
            setCancelReason={setCancelReason}
            saving={saving}
            onClose={() => setActive(null)}
            onSave={save}
          />
        </div>
      </div>
    </div>
  );
}