"use client";

import type { SessionStatus } from "./types";

export default function SessionStatusModal({
  open,
  status,
  setStatus,
  cancelReason,
  setCancelReason,
  saving,
  onClose,
  onSave,
}: {
  open: boolean;
  status: SessionStatus;
  setStatus: (s: SessionStatus) => void;
  cancelReason: string;
  setCancelReason: (r: string) => void;
  saving: boolean;
  onClose: () => void;
  onSave: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center 
      bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-lg">
        <h3 className="text-lg font-semibold">Update Session</h3>

        <div className="mt-4">
          <label className="block text-sm">Status</label>
          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as SessionStatus)
            }
            className="mt-1 w-full rounded-lg border px-3 py-2"
          >
            <option value="SCHEDULED">SCHEDULED</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
            <option value="NO_SHOW">NO_SHOW</option>
          </select>
        </div>

        {status === "CANCELLED" && (
          <div className="mt-3">
            <label className="block text-sm">
              Cancellation reason (optional)
            </label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2"
              rows={3}
            />
          </div>
        )}

        <div className="mt-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-3 py-2 text-gray-600"
          >
            Close
          </button>

          <button
            onClick={onSave}
            disabled={saving}
            className="h-10 min-w-[120px] px-4 py-2 bg-[#99000D] text-white 
              rounded disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}