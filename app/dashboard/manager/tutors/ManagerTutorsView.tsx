"use client";

import { useMemo, useState } from "react";
import AddTutorForm from "./AddTutorForm";
import TutorsTable from "./TutorsTable";
import DeleteTutorModal from "./DeleteTutorModal";
import { TutorRow } from "./types";

export const dynamic = "force-dynamic";

export default function ManagerTutorsView(
  { initialTutors }: { initialTutors: TutorRow[] }
) {
  const [items, setItems] = useState<TutorRow[]>(initialTutors ?? []);
  const [msg, setMsg] = useState<string | null>(null);

  const [creating, setCreating] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [tutorToDelete, setTutorToDelete] = useState<TutorRow | null>(null);

  const sorted = useMemo(
    () => [...items].sort((a, b) => a.name.localeCompare(b.name)), [items]
  );

  function canCreate(email: string) {
    return !items.some((t) => t.email.toLowerCase() === email.toLowerCase());
  }

  async function createTutor(payload: { name: string; email: string }) {
    const res = await fetch("/api/manager/tutors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.error ?? "Failed to create tutor");

    setItems((prev) => [
      {
        id: data.id,
        name: data.name,
        email: data.email,
        isActive: data.isActive ?? false,
        coursesCount: 0,
        availabilityCount: 0,
        sessionsCount: 0,
      },
      ...prev,
    ]);
  }

  function openDelete(t: TutorRow) {
    setTutorToDelete(t);
    setDeleteOpen(true);
    setMsg(null);
  }

  async function confirmDelete() {
    if (!tutorToDelete) return;

    setDeleting(true);
    setMsg(null);

    try {
      const res = await fetch(`/api/manager/tutors/${tutorToDelete.id}`, { 
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: tutorToDelete.id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Failed to delete tutor");

      setItems((prev) => prev.filter((x) => x.id !== tutorToDelete.id));
      setMsg("Tutor deleted. (role reverted to STUDENT.)");
      setDeleteOpen(false);
      setTutorToDelete(null);
    } catch (e: any) {
      setMsg(e?.message ?? "Failed to delete tutor.");
    } finally {
      setDeleting(false);
    }
  }

  function closeDelete() {
    if (deleting) return;
    setDeleteOpen(false);
    setTutorToDelete(null);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Tutors</h1>
        <p className="text-sm text-gray-600">Add and manage tutor profiles.</p>
      </div>
      
      <AddTutorForm
        onCreate={createTutor}
        creating={creating}
        setCreating={setCreating}
        setMsg={setMsg}
        canCreate={canCreate}
      />

      <TutorsTable tutors={sorted} onDeleteClick={openDelete} />

      <DeleteTutorModal 
        open={deleteOpen} 
        tutor={tutorToDelete} 
        deleting={deleting} 
        onCancel={closeDelete} 
        onConfirm={confirmDelete} 
      />
    </div>
  );
}