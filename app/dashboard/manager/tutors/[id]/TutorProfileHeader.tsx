"use client";

type Props = {
  name: string;
  subtitle?: string;
  accentColor?: string;
};

export default function TutorProfileHeader({
  name,
  subtitle = "Tutor Profile",
  accentColor = "#F0B312",
}: Props) {
  const initial = name?.charAt(0)?.toUpperCase() ?? "?";

  return (
    <div className="flex items-center gap-4 mb-6 pl-4">
      <div
        className="h-12 w-12 rounded-full text-white flex items-center justify-center font-semibold text-lg"
        style={{ backgroundColor: accentColor }}
      >
        {initial}
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>
    </div>
  );
}