"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { card, editCard, inputCls, btnPrimary, btnSecondary, th, td, labelCls } from "@/lib/styles";
import type { Store } from "@/lib/types";
import { useLocale } from "@/components/locale-provider";
import { useRequireAuth } from "@/lib/use-require-auth";
import { Toast } from "@/components/toast";
import { SkeletonStores } from "@/components/skeleton";
import { useToast } from "@/lib/use-toast";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useSearchPagination } from "@/lib/use-search-pagination";
import { Pagination } from "@/components/pagination";

const emptyForm = { name: "", base_url: "" };

export default function StoresPage() {
  const { t } = useLocale();
  const { ready } = useRequireAuth();
  const { message: toastMsg, toast, dismiss } = useToast();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  useEffect(() => {
    if (!ready) return;
    api.stores.list()
      .then(setStores)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [ready]);

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
    toast(t.common.toastSaved);
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    const updated = await api.stores.update(editingId, editForm);
    setStores((prev) => prev.map((s) => s.id === editingId ? { ...s, ...updated } : s));
    cancelEdit();
    toast(t.common.toastUpdated);
  }

  async function handleDelete(id: number) {
    await api.stores.delete(id);
    setStores((prev) => prev.filter((s) => s.id !== id));
    if (editingId === id) cancelEdit();
    setPendingDeleteId(null);
    toast(t.common.toastDeleted);
  }

  const { query, setQuery, slice: visibleStores, page, setPage, totalPages, from, to, total } =
    useSearchPagination(
      stores,
      (s, q) => s.name.toLowerCase().includes(q) || (s.base_url ?? "").toLowerCase().includes(q),
      20
    );

  if (!ready) return null;
  if (loading) return <SkeletonStores />;

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#1a1208]">{t.stores.title}</h1>
            <p className="text-sm text-[#7a6858] mt-1">{stores.length} {t.stores.recordsSuffix}</p>
          </div>
          <button
            className={showForm ? btnSecondary : btnPrimary}
            onClick={() => { setShowForm((v) => !v); cancelEdit(); }}
          >
            {showForm ? t.common.cancel : t.stores.addButton}
          </button>
        </div>
        <input
          className={inputCls}
          placeholder={t.common.search}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {showForm && (
        <div className={`${card} p-6`}>
          <h3 className="text-sm font-semibold text-[#4a3728] mb-5">{t.stores.formNew}</h3>
          <form onSubmit={handleCreate} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
            <div className="flex justify-end gap-3 pt-1 border-t border-[#e8dfd5]">
              <button type="button" className={btnSecondary} onClick={() => setShowForm(false)}>{t.common.cancel}</button>
              <button type="submit" className={btnPrimary}>{t.common.create}</button>
            </div>
          </form>
        </div>
      )}

      {editingId !== null && (
        <div className={`${editCard} p-6`}>
          <h3 className="text-sm font-semibold text-[#4a3728] mb-5">{t.stores.formEdit}</h3>
          <form onSubmit={handleUpdate} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
            <div className="flex justify-end gap-3 pt-1 border-t border-[#e8dfd5]">
              <button type="button" className={btnSecondary} onClick={cancelEdit}>{t.common.cancel}</button>
              <button type="submit" className={btnPrimary}>{t.common.save}</button>
            </div>
          </form>
        </div>
      )}

      <div className={card}>
        <div className="overflow-hidden rounded-2xl">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#d9cfc3] bg-[#f0e7d8]">
                <th className={th}>{t.common.name}</th>
                <th className={th}>{t.common.baseUrl}</th>
                <th className={th} />
              </tr>
            </thead>
            <tbody>
              {visibleStores.length === 0 ? (
                <tr key="empty">
                  <td colSpan={3} className="px-4 py-16 text-center text-[#a0907c] text-sm">
                    {query ? t.common.noResults : t.stores.noData}
                  </td>
                </tr>
              ) : visibleStores.map((s) => (
                <tr key={String(s.id)} className={`border-b border-[#e8dfd5] last:border-0 transition-colors ${editingId === s.id ? "bg-[#f7f0e8]" : "hover:bg-[#fdf9f5]"}`}>
                  <td className={`${td} font-medium text-[#1a1208]`}>{s.name}</td>
                  <td className={td}>
                    {s.base_url ? (
                      <a href={s.base_url} target="_blank" rel="noreferrer"
                        className="text-xs text-[#b07040] hover:text-[#8f5a32] hover:underline transition-colors">
                        {s.base_url}
                      </a>
                    ) : <span className="text-[#c4b5a5] text-sm">—</span>}
                  </td>
                  <td className={`${td} text-right`}>
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => editingId === s.id ? cancelEdit() : startEdit(s)}
                        className={`text-xs font-medium transition-colors ${editingId === s.id ? "text-[#b07040]" : "text-[#a0907c] hover:text-[#b07040]"}`}
                      >
                        {editingId === s.id ? t.common.cancel : t.common.edit}
                      </button>
                      <button onClick={() => setPendingDeleteId(s.id)} className="text-xs font-medium text-[#a0907c] hover:text-rose-500 transition-colors">
                        {t.common.delete}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} totalPages={totalPages} from={from} to={to} total={total} onPage={setPage} />
      </div>

      {pendingDeleteId !== null && (
        <ConfirmDialog
          message={t.stores.confirmDelete}
          confirmLabel={t.common.delete}
          cancelLabel={t.common.cancel}
          onConfirm={() => handleDelete(pendingDeleteId)}
          onCancel={() => setPendingDeleteId(null)}
        />
      )}
      {toastMsg && <Toast message={toastMsg} onDismiss={dismiss} />}
    </div>
  );
}
