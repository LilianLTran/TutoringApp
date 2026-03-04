"use client";

export default function DateSelect({
  dates,
  value,
  onChange,
}: {
  dates: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-2">
        On which date do you need help?
      </label>
      <select
        name="dateRequest"
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded-xl px-4 py-3
          focus:ring-2 focus:ring-[#99000D]
          text-black invalid:text-gray-400"
      >
        <option value="" disabled>
          Select Date
        </option>
        {dates.map((d) => (
          <option key={d.value} value={d.value}>
            {d.label}
          </option>
        ))}
      </select>
    </div>
  );
}