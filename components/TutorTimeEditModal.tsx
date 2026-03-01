"use client";

export type ModalMode = "ADD" | "CLICK_RECURRING" | "CLICK_NONRECURRING"

type Props = {
  open: boolean;
  mode: ModalMode;
  onClose: () => void;

  onAddRecurring: () => void;
  onAddNonRecurring: () => void;
  
  onRemoveRecurring: () => void;
  onRemoveNonRecurring: () => void;

  onReverseAddNonRecurring: () => void;
};

export default function TutorTimeEditModal({
  open,
  mode,
  onClose,
  onAddRecurring,
  onAddNonRecurring,
  onRemoveRecurring,
  onRemoveNonRecurring,
  onReverseAddNonRecurring,
}: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold">Select Action</h2>
          <button
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm text-gray-500 hover:bg-gray-100"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3">
          {mode === "ADD" && (
            <>
              <button
                onClick={onAddRecurring}
                className="w-full rounded-md bg-[#F0B312] py-2 text-white hover:bg-[#99000D]"
              >
                Add Recurring
              </button>

              <button
                onClick={onAddNonRecurring}
                className="w-full rounded-md bg-gray-200 py-2 text-gray-700 hover:bg-gray-300"
              >
                Add Extra Date
              </button>
            </>
          )}

          {mode === "CLICK_RECURRING" && (
            <>
              <button
                onClick={onRemoveRecurring}
                className="w-full rounded-md bg-[#99000D] py-2 text-white hover:bg-[#B30014]"
              >
                Delete Recurring (Every Week)
              </button>

              <button
                onClick={onRemoveNonRecurring}
                className="w-full rounded-md bg-red-100 py-2 text-red-700 hover:bg-red-200"
              >
                Delete Only This Date
              </button>
            </>
          )}

          {mode === "CLICK_NONRECURRING" && (
            <button
              onClick={onReverseAddNonRecurring}
              className="w-full rounded-md bg-[#99000D] py-2 text-white hover:bg-[#B30014]"
            >
              Delete Only This Date
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

