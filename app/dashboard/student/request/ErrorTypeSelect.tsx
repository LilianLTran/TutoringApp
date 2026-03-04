"use client";

import { ERROR_OPTIONS } from "@/lib/constants/requestOptions";

export default function ErrorTypeSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-2">
        What kind of error do you get?
      </label>
      <select
        name="errorType"
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-300 rounded-xl px-4 py-3
          focus:ring-2 focus:ring-[#99000D]
          text-black invalid:text-gray-400"
      >
        <option value="" disabled>
          Select Type of Help
        </option>
        {ERROR_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>        
    </div>
  );
}