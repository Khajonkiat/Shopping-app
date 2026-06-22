"use client";
import { useEffect, useState } from "react";
import { api, imageUrl } from "@/lib/api";
import { card, inputCls, btnPrimary, btnSecondary, th, td, labelCls } from "@/lib/styles";
import type { Product } from "@/lib/types";
import Link from "next/link";
import { useLocale } from "@/components/locale-provider";
import { useRequireAuth } from "@/lib/use-require-auth";

const emptyForm = { name: "", category: "", unit: "", description: "" };

export default function ProductsPage() {
  const { t } = useLocale();
  const { ready } = useRequireAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);

  useEffect(() => { if (ready) api.products.list().then(setProducts).catch(() => {}); }, [ready]);

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function setEdit(field: keyof typeof editForm) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setEditForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function startEdit(p: Product) {
    setShowForm(false);
    setEditingId(p.id);
    setEditForm({
      name: p.name,
      category: p.category ?? "",
      unit: p.unit ?? "",
      description: p.description ?? "",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm(emptyForm);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const p = await api.products.create(form);
    setProducts((prev) => [...prev, p]);
    setForm(emptyForm);
    setShowForm(false);
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    const updated = await api.products.update(editingId, editForm);
    setProducts((prev) => prev.map((p) => p.id === editingId ? { ...p, ...updated } : p));
    cancelEdit();
  }

  async function handleDelete(id: number) {
    if (!confirm(t.products.confirmDelete)) return;
    await api.products.delete(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    if (editingId === id) cancelEdit();
  }

  if (!ready) return null;

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#1a1208]">{t.products.title}</h1>
          <p className="text-sm text-[#7a6858] mt-1">{products.length} {products.length === 1 ? "item" : "items"}</p>
        </div>
        <button
          className={showForm ? btnSecondary : btnPrimary}
          onClick={() => { setShowForm((v) => !v); cancelEdit(); }}
        >
          {showForm ? t.common.cancel : t.products.addButton}
        </button>
      </div>

      {showForm && (
        <div className={`${card} p-6`}>
          <h3 className="text-sm font-semibold text-[#4a3728] mb-5">New product</h3>
          <form onSubmit={handleCreate} className="space-y-5">
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className={labelCls}>{t.common.name} <span className="text-rose-400">*</span></label>
                <input className={inputCls} required value={form.name} onChange={set("name")} />
              </div>
              <div>
                <label className={labelCls}>{t.common.category}</label>
                <input className={inputCls} value={form.category} onChange={set("category")} placeholder={t.products.categoryPlaceholder} />
              </div>
              <div>
                <label className={labelCls}>{t.common.unit}</label>
                <input className={inputCls} value={form.unit} onChange={set("unit")} placeholder={t.products.unitPlaceholder} />
              </div>
              <div>
                <label className={labelCls}>{t.common.description}</label>
                <input className={inputCls} value={form.description} onChange={set("description")} />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-1 border-t border-[#f0e9e0]">
              <button type="button" className={btnSecondary} onClick={() => setShowForm(false)}>{t.common.cancel}</button>
              <button type="submit" className={btnPrimary}>{t.common.create}</button>
            </div>
          </form>
        </div>
      )}

      {editingId !== null && (
        <div className={`${card} p-6 ring-[#d4b896]/60`}>
          <h3 className="text-sm font-semibold text-[#4a3728] mb-5">Edit product</h3>
          <form onSubmit={handleUpdate} className="space-y-5">
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className={labelCls}>{t.common.name} <span className="text-rose-400">*</span></label>
                <input className={inputCls} required value={editForm.name} onChange={setEdit("name")} />
              </div>
              <div>
                <label className={labelCls}>{t.common.category}</label>
                <input className={inputCls} value={editForm.category} onChange={setEdit("category")} placeholder={t.products.categoryPlaceholder} />
              </div>
              <div>
                <label className={labelCls}>{t.common.unit}</label>
                <input className={inputCls} value={editForm.unit} onChange={setEdit("unit")} placeholder={t.products.unitPlaceholder} />
              </div>
              <div>
                <label className={labelCls}>{t.common.description}</label>
                <input className={inputCls} value={editForm.description} onChange={setEdit("description")} />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-1 border-t border-[#f0e9e0]">
              <button type="button" className={btnSecondary} onClick={cancelEdit}>{t.common.cancel}</button>
              <button type="submit" className={btnPrimary}>{t.common.save}</button>
            </div>
          </form>
        </div>
      )}

      <div className={`${card} overflow-hidden`}>
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#f0e9e0] bg-[#faf5ef]">
              <th className={th} />
              <th className={th}>{t.common.name}</th>
              <th className={th}>{t.common.category}</th>
              <th className={th}>{t.common.unit}</th>
              <th className={th} />
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr key="empty">
                <td colSpan={5} className="px-4 py-16 text-center">
                  <p className="text-[#a0907c] text-sm">{t.products.noData}</p>
                </td>
              </tr>
            ) : products.map((p) => {
              const thumb = p.images?.[0];
              return (
              <tr key={String(p.id)} className={`border-b border-[#f0e9e0] last:border-0 transition-colors ${editingId === p.id ? "bg-[#f7f0e8]" : "hover:bg-[#fdf9f5]"}`}>
                <td className="px-3 py-2 w-12">
                  <Link href={`/products/${p.id}`}>
                    {thumb ? (
                      <img
                        src={imageUrl(thumb.filename)}
                        alt=""
                        className="w-10 h-10 rounded-lg object-cover border border-[#e8dfd5]"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-[#f0e9e0] border border-[#e8dfd5] flex items-center justify-center">
                        <svg className="w-4 h-4 text-[#c4b5a5]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 3h18M3 21h18" />
                        </svg>
                      </div>
                    )}
                  </Link>
                </td>
                <td className={`${td} font-medium`}>
                  <Link href={`/products/${p.id}`} className="text-[#1a1208] hover:text-[#b07040] transition-colors">
                    {p.name}
                  </Link>
                </td>
                <td className={`${td} text-[#7a6858]`}>{p.category || <span className="text-[#c4b5a5]">—</span>}</td>
                <td className={`${td} text-[#7a6858]`}>{p.unit || <span className="text-[#c4b5a5]">—</span>}</td>
                <td className={`${td} text-right`}>
                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={() => editingId === p.id ? cancelEdit() : startEdit(p)}
                      className={`text-xs font-medium transition-colors ${editingId === p.id ? "text-[#b07040]" : "text-[#a0907c] hover:text-[#b07040]"}`}
                    >
                      {editingId === p.id ? t.common.cancel : t.common.edit}
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="text-xs font-medium text-[#a0907c] hover:text-rose-500 transition-colors">
                      {t.common.delete}
                    </button>
                  </div>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
