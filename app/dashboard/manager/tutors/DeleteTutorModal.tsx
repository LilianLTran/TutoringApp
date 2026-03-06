"use client";

import { TutorRow } from "./types";

type Props = {
  open: boolean;
  tutor: TutorRow | null;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
};

export default function DeleteTutorModal({ 
  open, 
  tutor, 
  deleting, 
  onCancel, 
  onConfirm 
}: Props) {
  if (!open || !tutor) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center 
      bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold">Delete tutor</h3>
          <button onClick={onCancel} className="rounded-md px-2 py-1 text-sm 
            text-gray-500 hover:bg-gray-100">
            ✕
          </button>
        </div>

        <p className="mt-3 text-sm text-gray-700">
          Delete <span className="font-semibold">{tutor.name}</span>?
        </p>

        <div className="mt-5 flex justify-end gap-3">
          <button onClick={onCancel} className="rounded-md px-3 py-2 text-sm 
            text-gray-600 hover:bg-gray-100">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="h-9 min-w-[90px] rounded-md bg-red-600 px-3 py-2 text-sm 
              font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}