"use client";

import { useMemo, useState } from "react";

type Role = "STUDENT" | "MANAGER" | "TUTOR";

type UserRow = {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  createdAt: string | Date;
};

export default function UserRoleTable({
  initialUsers,
}: {
  initialUsers: UserRow[];
}) {
  const [rows, setRows] = useState<UserRow[]>(initialUsers);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const sorted = useMemo(() => rows, [rows]);

  async function updateRole(userId: string, role: "STUDENT" | "MANAGER") {
    setMsg(null);
    setSavingId(userId);

    try {
      const res = await fetch(`/api/manager/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Failed to update role");

      setRows((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: data.user.role } : u))
      );
      setMsg("Role updated.");
    } catch (e: any) {
      setMsg(e?.message ?? "Failed to update role");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide 
            text-gray-600">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {sorted.map((u) => {
              const saving = savingId === u.id;

              return (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900 font-medium">
                    {u.name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{u.email}</td>

                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full 
                        px-2 py-1 text-xs font-medium
                        ${
                          u.role === "MANAGER"
                            ? "bg-purple-100 text-purple-700"
                            : u.role === "TUTOR"
                            ? "bg-cyan-100 text-cyan-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                    >
                      {u.role}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-right">
                    {u.role !== "MANAGER" ? (
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => updateRole(u.id, "MANAGER")}
                        className="h-9 w-44 rounded-lg border px-3 py-2 text-xs 
                          font-medium hover:bg-gray-50 disabled:opacity-50"
                      >
                        {saving ? "Saving…" : "Promote to MANAGER"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => updateRole(u.id, "STUDENT")}
                        className="h-9 w-44 rounded-lg border px-3 py-2 text-xs 
                          font-medium hover:bg-gray-50 disabled:opacity-50"
                      >
                        {saving ? "Saving…" : "Demote to STUDENT"}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}

            {sorted.length === 0 && (
              <tr>
                <td 
                  className="px-4 py-10 text-center text-gray-500" 
                  colSpan={4}
                >
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}