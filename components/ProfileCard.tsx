"use client";

type Props = {
  roleLabel: string; // "Student" | "Tutor" | "Manager"
  email: string;
  name: string;
  setName: (v: string) => void;
  saving: boolean;
  saveName: () => void;
};

export default function ProfileCard({
  roleLabel,
  email,
  name,
  setName,
  saving,
  saveName,
}: Props) {
  const initial = (name?.trim()?.[0] ?? email?.[0] ?? "U").toUpperCase();

  return (
       <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {roleLabel} Profile
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Update your display name.
              </p>
            </div>
            <div className="h-10 w-10 rounded-full bg-gray-900 text-white 
              flex items-center justify-center font-semibold"
              aria-label={`${roleLabel} avatar`}
            >
              {initial}
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1 rounded-lg border bg-gray-50 px-3 py-2 
                text-sm text-gray-700">
                {email}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name <span className="text-gray-400">(optional)</span>
              </label>
              <input
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="You can leave this blank"
              />
            </div>

            <button
              onClick={saveName}
              disabled={saving}
              className="h-10 w-full rounded-lg bg-[#99000D] text-white 
                disabled:opacity-50 flex items-center justify-center"
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </section>
  )
}