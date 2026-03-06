"use client";

import { useMemo, useState } from "react";
import { createEmailTemplate, updateEmailTemplate } from "./actions";

type EmailTemplateRow = {
  id: string;
  key: string;
  name: string;
  subject: string;
  body: string;
  isHtml: boolean;
  enabled: boolean;
  updatedAt: Date;
};

function fmtDate(d: Date) {
  return new Date(d).toLocaleString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ManagerEmailTemplatesView({
  initialTemplates,
}: {
  initialTemplates: EmailTemplateRow[];
}) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState<EmailTemplateRow | null>(null);

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // create modal
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return initialTemplates;
    return initialTemplates.filter((t) => {
      return (
        t.key.toLowerCase().includes(s) ||
        t.name.toLowerCase().includes(s) ||
        t.subject.toLowerCase().includes(s)
      );
    });
  }, [q, initialTemplates]);

  function openEdit(t: EmailTemplateRow) {
    setMsg(null);
    setActive(t);
  }

  async function saveEdit(form: {
    id: string;
    name: string;
    subject: string;
    body: string;
    enabled: boolean;
    isHtml: boolean;
  }) {
    setSaving(true);
    setMsg(null);
    try {
      await updateEmailTemplate(form);
      setMsg("Saved. Refreshing…");
      // Server action revalidates; page will refresh on navigation.
      // For immediate UI sync you can also router.refresh() if desired.
      setActive(null);
    } catch (e: any) {
      setMsg(e?.message ?? "Failed to save template");
    } finally {
      setSaving(false);
    }
  }

  async function doCreate(form: {
    key: string;
    name: string;
    subject: string;
    body: string;
    enabled: boolean;
    isHtml: boolean;
  }) {
    setCreating(true);
    setMsg(null);
    try {
      await createEmailTemplate(form);
      setMsg("Created. Refreshing…");
      setCreateOpen(false);
    } catch (e: any) {
      setMsg(e?.message ?? "Failed to create template");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:max-w-md">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search templates (key, name, subject)…"
            className="w-full rounded-xl border bg-white px-3 py-2 text-sm"
          />
        </div>

        <button
          onClick={() => setCreateOpen(true)}
          className="h-10 rounded-xl bg-[#99000D] px-4 text-sm font-medium text-white"
        >
          New Template
        </button>
      </div>

      {msg && (
        <div className="rounded-xl border bg-white px-4 py-3 text-sm text-gray-700">
          {msg}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border bg-white">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-600">
            <tr>
              <th className="px-4 py-3">Key</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Enabled</th>
              <th className="px-4 py-3">Format</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {filtered.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs text-gray-800">{t.key}</td>
                <td className="px-4 py-3 text-gray-900">{t.name}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      t.enabled ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {t.enabled ? "Enabled" : "Disabled"}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-700">{t.isHtml ? "HTML" : "Text"}</td>
                <td className="px-4 py-3 text-gray-600">{fmtDate(t.updatedAt)}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => openEdit(t)}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium text-[#99000D] hover:bg-red-50"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td className="px-4 py-10 text-center text-gray-500" colSpan={6}>
                  No templates found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit modal */}
      {active && (
        <TemplateModal
          title={`Edit: ${active.key}`}
          initial={{
            id: active.id,
            key: active.key,
            name: active.name,
            subject: active.subject,
            body: active.body,
            enabled: active.enabled,
            isHtml: active.isHtml,
          }}
          saving={saving}
          onClose={() => setActive(null)}
          onSave={saveEdit}
          keyEditable={false}
        />
      )}

      {/* Create modal */}
      {createOpen && (
        <TemplateModal
          title="New Template"
          initial={{
            id: "",
            key: "",
            name: "",
            subject: "",
            body: "",
            enabled: true,
            isHtml: true,
          }}
          saving={creating}
          onClose={() => setCreateOpen(false)}
          onSave={(x) =>
            doCreate({
              key: x.key,
              name: x.name,
              subject: x.subject,
              body: x.body,
              enabled: x.enabled,
              isHtml: x.isHtml,
            })
          }
          keyEditable={true}
        />
      )}
    </div>
  );
}

function TemplateModal(props: {
  title: string;
  initial: {
    id: string;
    key: string;
    name: string;
    subject: string;
    body: string;
    enabled: boolean;
    isHtml: boolean;
  };
  saving: boolean;
  onClose: () => void;
  onSave: (x: {
    id: string;
    key: string;
    name: string;
    subject: string;
    body: string;
    enabled: boolean;
    isHtml: boolean;
  }) => void;
  keyEditable: boolean;
}) {
  const [key, setKey] = useState(props.initial.key);
  const [name, setName] = useState(props.initial.name);
  const [subject, setSubject] = useState(props.initial.subject);
  const [body, setBody] = useState(props.initial.body);
  const [enabled, setEnabled] = useState(props.initial.enabled);
  const [isHtml, setIsHtml] = useState(props.initial.isHtml);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-lg">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-900">{props.title}</h3>
          <button
            onClick={props.onClose}
            className="rounded-lg px-2 py-1 text-sm text-gray-500 hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Key</label>
              <input
                value={key}
                onChange={(e) => setKey(e.target.value)}
                disabled={!props.keyEditable}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm font-mono disabled:bg-gray-50"
                placeholder="SESSION_CANCELLED_STUDENT"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                placeholder="Session cancelled (student)"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
              />
              Enabled
            </label>

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={isHtml}
                onChange={(e) => setIsHtml(e.target.checked)}
              />
              HTML body
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Subject</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              placeholder='Tutoring session cancelled: {{courseName}}'
            />
            <p className="mt-1 text-xs text-gray-500">
              Variables like <span className="font-mono">{"{{studentName}}"}</span>{" "}
              and <span className="font-mono">{"{{time}}"}</span> will be filled at send time.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Body</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={12}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm font-mono"
              placeholder={`Hi {{studentName}},\n\nYour session with {{tutorName}} on {{date}} at {{time}} was cancelled.\n\nReason: {{reason}}\n`}
            />
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <button onClick={props.onClose} className="rounded-lg px-3 py-2 text-sm hover:bg-gray-100">
            Close
          </button>
          <button
            onClick={() =>
              props.onSave({
                id: props.initial.id,
                key,
                name,
                subject,
                body,
                enabled,
                isHtml,
              })
            }
            disabled={props.saving || !key.trim() || !name.trim()}
            className="rounded-lg bg-[#99000D] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {props.saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}