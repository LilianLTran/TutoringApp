"use client";

export type TutorSlots = {
  tutorId: string;
  tutorName: string;
  slots: { startMin: number; endMin: number }[];
};

function minutesToLabel(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export default function SlotSelect({
  slotsByTutor,
  loading,
  selectedTutorId,
  selectedStartMin,
  onPick,
}: {
  slotsByTutor: TutorSlots[] | null;
  loading: boolean;
  selectedTutorId: string | null;
  selectedStartMin: number | null;
  onPick: (tutorId: string, startMin: number) => void;
}) {
  if (loading) return <div className="text-sm text-gray-500">Loading slots…</div>;
  if (!slotsByTutor) return null;

  if (slotsByTutor.length === 0) {
    return <div className="text-sm text-gray-500">No slots available for this date & course.</div>;
  }

  return (
    <div className="mt-4">
      <label className="block text-sm font-semibold mb-2">
        Available slots
      </label>
      {/* {loadingSlots && <div className="text-sm text-gray-500">Loading slots…</div>}

      {!loadingSlots && slotsByTutor && slotsByTutor.length === 0 && (
        <div className="text-sm text-gray-500">No slots available for this date & course.</div>
      )}

      {!loadingSlots && slotsByTutor && slotsByTutor.map((t) => (
        <div key={t.tutorId} className="mb-3">
          <div className="text-sm font-medium mb-2 font-mono">{t.tutorName}</div>
          <div className="flex flex-wrap gap-2">
            {t.slots.map((s) => {
              const isSelected = selectedTutorId === t.tutorId && selectedStartMin === s.startMin;
              return (
                <button
                  key={`${t.tutorId}-${s.startMin}`}
                  type="button"
                  onClick={() => {
                    setSelectedTutorId(t.tutorId);
                    setSelectedStartMin(s.startMin);
                  }}
                  className={`px-3 py-1 rounded-lg text-sm border ${isSelected ? "bg-[#99000D] text-white" : "bg-white text-gray-700"}`}
                >
                  {minutesToLabel(s.startMin)}
                </button>
              );
            })}
          </div>
        </div>
      ))} */}

    </div>
  );
}