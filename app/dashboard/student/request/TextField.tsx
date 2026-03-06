"use client";

export default function TextField({
  name,
  label,
  placeholder = "",
  type = "text",
  value,
  onChange,
}: {
  name: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  type?: string;
  value?: string;
  onChange?: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-2">
        {label}
      </label>
      <input
        name={name}
        type={type}
        required
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full border rounded-xl px-4 py-3
          focus:ring-2 focus:ring-[#99000D]
          text-black placeholder:text-gray-400"
      />
    </div>
  );
}