"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { card, inputCls, btnPrimary, btnSecondary, th, td, labelCls } from "@/lib/styles";
import type { Store } from "@/lib/types";
import { useLocale } from "@/components/locale-provider";

const emptyForm = { name: "", base_url: "" };

export default function StoresPage() {
  const { t } = useLocale();
  const [stores, setStores] = useState<Store[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);

  useEffect(() => { api.stores.list().then(setStores); }, []);

  function startEdit(s: Store) {
    setShowForm(false);
    setEditingId(s.id);
    setEditForm({ name: s.name, base_url: s.base_url ?? "" });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm(emptyForm);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const s = await api.stores.create(form);
    setStores((prev) => [...prev, s]);
    setForm(emptyForm);
    setShowForm(false);
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    const updated = await api.stores.update(editingId, editForm);
    setStores((prev) => prev.map((s) => s.id === editingId ? { ...s, ...updated } : s));
    cancelEdit();
  }

  async function handleDelete(id: number) {
    if (!confirm(t.stores.confirmDelete)) return;
    await api.stores.delete(id);
    setStores((prev) => prev.filter((s) => s.id !== id));
    if (editingId === id) cancelEdit();
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{t.stores.title}</h1>
          <p className="text-sm text-slate-500 mt-1">{stores.length} {stores.length === 1 ? "store" : "stores"}</p>
        </div>
        <button
          className={showForm ? btnSecondary : btnPrimary}
          onClick={() => { setShowForm((v) => !v); cancelEdit(); }}
        >
          {showForm ? t.common.cancel : t.stores.addButton}
        </button>
      </div>

      {showForm && (
        <div className={`${card} p-6`}>
          <h3 className="text-sm font-semibold text-slate-700 mb-5">New store</h3>
          <form onSubmit={handleCreate} className="space-y-5">
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className={labelCls}>{t.common.name} <span className="text-rose-400">*</span></label>
                <input required className={inputCls} value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder={t.stores.namePlaceholder} />
              </div>
              <div>
                <label className={labelCls}>{t.common.baseUrl}</label>
                <input className={inputCls} value={form.base_url}
                  onChange={(e) => setForm((f) => ({ ...f, base_url: e.target.value }))}
                  placeholder="https://…" />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-1 border-t border-slate-100">
              <button type="button" className={btnSecondary} onClick={() => setShowForm(false)}>{t.common.cancel}</button>
              <button type="submit" className={btnPrimary}>{t.common.create}</button>
            </div>
          </form>
        </div>
      )}

      {editingId !== null && (
        <div className={`${card} p-6 ring-indigo-300/60`}>
          <h3 className="text-sm font-semibold text-slate-700 mb-5">Edit store</h3>
          <form onSubmit={handleUpdate} className="space-y-5">
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className={labelCls}>{t.common.name} <span className="text-rose-400">*</span></label>
                <input required className={inputCls} value={editForm.name}
                  onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder={t.stores.namePlaceholder} />
              </div>
              <div>
                <label className={labelCls}>{t.common.baseUrl}</label>
                <input className={inputCls} value={editForm.base_url}
                  onChange={(e) => setEditForm((f) => ({ ...f, base_url: e.target.value }))}
                  placeholder="https://…" />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-1 border-t border-slate-100">
              <button type="button" className={btnSecondary} onClick={cancelEdit}>{t.common.cancel}</button>
              <button type="submit" className={btnPrimary}>{t.common.save}</button>
            </div>
          </form>
        </div>
      )}

      <div className={`${card} overflow-hidden`}>
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70">
              <th className={th}>{t.common.name}</th>
              <th className={th}>{t.common.baseUrl}</th>
              <th className={th} />
            </tr>
          </thead>
          <tbody>
            {stores.length === 0 ? (
              <tr key="empty">
                <td colSpan={3} className="px-4 py-16 text-center text-slate-400 text-sm">{t.stores.noData}</td>
              </tr>
            ) : stores.map((s) => (
              <tr key={String(s.id)} className={`border-b border-slate-100 last:border-0 transition-colors ${editingId === s.id ? "bg-indigo-50/40" : "hover:bg-slate-50/60"}`}>
                <td className={`${td} font-medium text-slate-900`}>{s.name}</td>
                <td className={td}>
                  {s.base_url ? (
                    <a href={s.base_url} target="_blank" rel="noreferrer"
                      className="text-xs text-indigo-600 hover:text-indigo-700 hover:underline transition-colors">
                      {s.base_url}
                    </a>
                  ) : <span className="text-slate-300 text-sm">—</span>}
                </td>
                <td className={`${td} text-right`}>
                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={() => editingId === s.id ? cancelEdit() : startEdit(s)}
                      className={`text-xs font-medium transition-colors ${editingId === s.id ? "text-indigo-500" : "text-slate-400 hover:text-indigo-500"}`}
                    >
                      {editingId === s.id ? t.common.cancel : t.common.edit}
                    </button>
                    <button onClick={() => handleDelete(s.id)} className="text-xs font-medium text-slate-400 hover:text-rose-500 transition-colors">
                      {t.common.delete}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
