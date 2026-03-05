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

type Props = {
  loadingSlots: boolean;
  slotsByTutor: TutorSlots[] | null;
  selectedTutorId: string | null;
  selectedStartMin: number | null;
  onPick: (tutorId: string, startMin: number) => void;
};

export default function SlotSelect({
  slotsByTutor,
  loadingSlots,
  selectedTutorId,
  selectedStartMin,
  onPick,
}: Props) {
  return (
    <div className="mt-4">
      <label className="block text-sm font-semibold mb-2">
        Available slots
      </label>
      {loadingSlots && <div className="text-sm text-gray-500">
        Loading slots…
      </div>}

      {!loadingSlots && slotsByTutor && slotsByTutor.length === 0 && (
        <div className="text-sm text-gray-500">
          No slots available for this date & course.
          </div>
      )}

      {!loadingSlots && slotsByTutor && slotsByTutor.map((t) => (
        <div key={t.tutorId} className="mb-3">
          <div className="text-sm font-medium mb-2 font-mono">
            {t.tutorName}
          </div>
          <div className="flex flex-wrap gap-2">
            {t.slots.map((s) => {
              const isSelected = selectedTutorId === t.tutorId && 
                selectedStartMin === s.startMin;
              return (
                <button
                  key={`${t.tutorId}-${s.startMin}`}
                  type="button"
                  onClick={() => onPick(t.tutorId, s.startMin)}
                  className={`px-3 py-1 rounded-lg text-sm border 
                    ${isSelected ? 
                      "bg-[#99000D] text-white" : 
                      "bg-white text-gray-700"}`}
                >
                  {minutesToLabel(s.startMin)}
                </button>
              );
            })}
          </div>
        </div>
      ))}

    </div>
  );
}