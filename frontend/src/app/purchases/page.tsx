"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { card, editCard, inputCls, btnPrimary, btnSecondary, th, td, labelCls } from "@/lib/styles";
import type { Product, Purchase, Store } from "@/lib/types";
import { useLocale } from "@/components/locale-provider";
import { useRequireAuth } from "@/lib/use-require-auth";
import { Toast } from "@/components/toast";
import { SkeletonPurchases } from "@/components/skeleton";
import { useToast } from "@/lib/use-toast";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useSearchPagination } from "@/lib/use-search-pagination";
import { Pagination } from "@/components/pagination";

function toISO(dateStr: string): string | undefined {
  return dateStr ? `${dateStr}T00:00:00Z` : undefined;
}

function toDateInput(iso: string | undefined): string {
  if (!iso) return "";
  return iso.split("T")[0];
}

const emptyForm = { product_id: "", store_id: "", price: "", quantity: "1", purchased_at: "", notes: "" };

export default function PurchasesPage() {
  const { t } = useLocale();
  const { ready } = useRequireAuth();
  const { message: toastMsg, toast, dismiss } = useToast();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  useEffect(() => {
    if (!ready) return;
    Promise.all([api.purchases.list(), api.products.list(), api.stores.list()])
      .then(([pu, p, s]) => { setPurchases(pu); setProducts(p); setStores(s); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [ready]);

  const canSubmit = Number(form.product_id) > 0 && Number(form.store_id) > 0 && Number(form.price) > 0;
  const canEditSubmit = Number(editForm.product_id) > 0 && Number(editForm.store_id) > 0 && Number(editForm.price) > 0;

  function startEdit(p: Purchase) {
    setShowForm(false);
    setError(null);
    setEditingId(p.id);
    setEditError(null);
    setEditForm({
      product_id: String(p.product_id),
      store_id: String(p.store_id),
      price: String(p.price),
      quantity: String(p.quantity),
      purchased_at: toDateInput(p.purchased_at),
      notes: p.notes ?? "",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm(emptyForm);
    setEditError(null);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const p = await api.purchases.create({
        product_id: Number(form.product_id),
        store_id: Number(form.store_id),
        price: Number(form.price),
        quantity: Number(form.quantity) || 1,
        notes: form.notes,
        ...(toISO(form.purchased_at) && { purchased_at: toISO(form.purchased_at) }),
      });
      setPurchases((prev) => [{
        ...p,
        product: products.find((x) => x.id === p.product_id),
        store: stores.find((x) => x.id === p.store_id),
      }, ...prev]);
      setForm(emptyForm);
      setShowForm(false);
      toast(t.common.toastSaved);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId || !canEditSubmit) return;
    setEditSubmitting(true);
    setEditError(null);
    try {
      const payload: Record<string, unknown> = {
        product_id: Number(editForm.product_id),
        store_id: Number(editForm.store_id),
        price: Number(editForm.price),
        quantity: Number(editForm.quantity) || 1,
        notes: editForm.notes,
      };
      if (editForm.purchased_at) payload.purchased_at = toISO(editForm.purchased_at);
      const updated = await api.purchases.update(editingId, payload);
      setPurchases((prev) => prev.map((p) =>
        p.id === editingId
          ? { ...updated, product: products.find((x) => x.id === updated.product_id), store: stores.find((x) => x.id === updated.store_id) }
          : p
      ));
      cancelEdit();
      toast(t.common.toastUpdated);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setEditSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    await api.purchases.delete(id);
    setPurchases((prev) => prev.filter((x) => x.id !== id));
    if (editingId === id) cancelEdit();
    setPendingDeleteId(null);
    toast(t.common.toastDeleted);
  }

  const totalSpend = purchases.reduce((sum, p) => sum + p.price * p.quantity, 0);

  const { query, setQuery, slice: visiblePurchases, page, setPage, totalPages, from, to, total } =
    useSearchPagination(
      purchases,
      (p, q) =>
        (p.product?.name ?? "").toLowerCase().includes(q) ||
        (p.store?.name ?? "").toLowerCase().includes(q) ||
        (p.notes ?? "").toLowerCase().includes(q),
      20
    );

  if (!ready) return null;
  if (loading) return <SkeletonPurchases />;

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#1a1208]">{t.purchases.title}</h1>
            {purchases.length > 0 ? (
              <p className="text-sm text-[#7a6858] mt-1">
                {purchases.length} {t.purchases.recordsSuffix}
                <span className="mx-1.5 text-[#c4b5a5]">·</span>
                <span className="font-medium text-[#4a3728]">
                  ฿{totalSpend.toLocaleString("th-TH", { minimumFractionDigits: 2 })} {t.purchases.totalSuffix}
                </span>
              </p>
            ) : (
              <p className="text-sm text-[#a0907c] mt-1">0 {t.purchases.recordsSuffix}</p>
            )}
          </div>
          <button
            className={showForm ? btnSecondary : btnPrimary}
            onClick={() => { setShowForm((v) => !v); setError(null); cancelEdit(); }}
          >
            {showForm ? t.common.cancel : t.purchases.recordButton}
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
          <h3 className="text-sm font-semibold text-[#4a3728] mb-5">{t.purchases.formRecord}</h3>
          <form onSubmit={handleCreate} noValidate className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className={labelCls}>{t.common.product} <span className="text-rose-400">*</span></label>
                <select
                  className={inputCls}
                  value={form.product_id}
                  onChange={(e) => setForm((f) => ({ ...f, product_id: e.target.value }))}
                >
                  <option key="__" value="">{t.common.selectProduct}</option>
                  {products.map((p) => (
                    <option key={String(p.id)} value={String(p.id)}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>{t.common.store} <span className="text-rose-400">*</span></label>
                <select
                  className={inputCls}
                  value={form.store_id}
                  onChange={(e) => setForm((f) => ({ ...f, store_id: e.target.value }))}
                >
                  <option key="__" value="">{t.common.selectStore}</option>
                  {stores.map((s) => (
                    <option key={String(s.id)} value={String(s.id)}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>{t.common.price} (฿) <span className="text-rose-400">*</span></label>
                <input
                  type="number" step="0.01" min="0.01"
                  className={inputCls}
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                />
              </div>
              <div>
                <label className={labelCls}>{t.common.qty}</label>
                <input
                  type="number" step="0.01" min="0.01"
                  className={inputCls}
                  value={form.quantity}
                  onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                />
              </div>
              <div>
                <label className={labelCls}>{t.common.date}</label>
                <input
                  type="date"
                  className={inputCls}
                  value={form.purchased_at}
                  onChange={(e) => setForm((f) => ({ ...f, purchased_at: e.target.value }))}
                />
              </div>
              <div>
                <label className={labelCls}>{t.common.notes}</label>
                <input
                  type="text"
                  className={inputCls}
                  placeholder={t.common.optional}
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-rose-700 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-3 pt-1 border-t border-[#e8dfd5]">
              <button
                type="button"
                className={btnSecondary}
                onClick={() => { setShowForm(false); setError(null); }}
              >
                {t.common.cancel}
              </button>
              <button
                type="submit"
                className={btnPrimary}
                disabled={!canSubmit || submitting}
              >
                {submitting ? t.common.saving : t.common.save}
              </button>
            </div>
          </form>
        </div>
      )}

      {editingId !== null && (
        <div className={`${editCard} p-6`}>
          <h3 className="text-sm font-semibold text-[#4a3728] mb-5">{t.purchases.formEdit}</h3>
          <form onSubmit={handleUpdate} noValidate className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className={labelCls}>{t.common.product} <span className="text-rose-400">*</span></label>
                <select
                  className={inputCls}
                  value={editForm.product_id}
                  onChange={(e) => setEditForm((f) => ({ ...f, product_id: e.target.value }))}
                >
                  <option key="__" value="">{t.common.selectProduct}</option>
                  {products.map((p) => (
                    <option key={String(p.id)} value={String(p.id)}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>{t.common.store} <span className="text-rose-400">*</span></label>
                <select
                  className={inputCls}
                  value={editForm.store_id}
                  onChange={(e) => setEditForm((f) => ({ ...f, store_id: e.target.value }))}
                >
                  <option key="__" value="">{t.common.selectStore}</option>
                  {stores.map((s) => (
                    <option key={String(s.id)} value={String(s.id)}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>{t.common.price} (฿) <span className="text-rose-400">*</span></label>
                <input
                  type="number" step="0.01" min="0.01"
                  className={inputCls}
                  value={editForm.price}
                  onChange={(e) => setEditForm((f) => ({ ...f, price: e.target.value }))}
                />
              </div>
              <div>
                <label className={labelCls}>{t.common.qty}</label>
                <input
                  type="number" step="0.01" min="0.01"
                  className={inputCls}
                  value={editForm.quantity}
                  onChange={(e) => setEditForm((f) => ({ ...f, quantity: e.target.value }))}
                />
              </div>
              <div>
                <label className={labelCls}>{t.common.date}</label>
                <input
                  type="date"
                  className={inputCls}
                  value={editForm.purchased_at}
                  onChange={(e) => setEditForm((f) => ({ ...f, purchased_at: e.target.value }))}
                />
              </div>
              <div>
                <label className={labelCls}>{t.common.notes}</label>
                <input
                  type="text"
                  className={inputCls}
                  placeholder={t.common.optional}
                  value={editForm.notes}
                  onChange={(e) => setEditForm((f) => ({ ...f, notes: e.target.value }))}
                />
              </div>
            </div>

            {editError && (
              <p className="text-sm text-rose-700 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
                {editError}
              </p>
            )}

            <div className="flex justify-end gap-3 pt-1 border-t border-[#e8dfd5]">
              <button type="button" className={btnSecondary} onClick={cancelEdit}>{t.common.cancel}</button>
              <button
                type="submit"
                className={btnPrimary}
                disabled={!canEditSubmit || editSubmitting}
              >
                {editSubmitting ? t.common.saving : t.common.save}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className={card}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#d9cfc3] bg-[#f0e7d8]">
                <th className={th}>{t.common.product}</th>
                <th className={th}>{t.common.store}</th>
                <th className={th}>{t.common.price}</th>
                <th className={th}>{t.common.qty}</th>
                <th className={th}>{t.common.total}</th>
                <th className={th}>{t.common.date}</th>
                <th className={th}>{t.common.notes}</th>
                <th className={th} />
              </tr>
            </thead>
            <tbody>
              {visiblePurchases.length === 0 ? (
                <tr key="empty">
                  <td colSpan={8} className="px-4 py-16 text-center text-[#a0907c] text-sm">
                    {query ? t.common.noResults : t.purchases.noData}
                  </td>
                </tr>
              ) : visiblePurchases.map((p) => (
                <tr key={String(p.id)} className={`border-b border-[#e8dfd5] last:border-0 transition-colors ${editingId === p.id ? "bg-[#f7f0e8]" : "hover:bg-[#fdf9f5]"}`}>
                  <td className={`${td} font-medium text-[#1a1208]`}>{p.product?.name ?? `#${p.product_id}`}</td>
                  <td className={`${td} text-[#7a6858]`}>{p.store?.name ?? `#${p.store_id}`}</td>
                  <td className={`${td} text-[#4a3728]`}>฿{p.price.toFixed(2)}</td>
                  <td className={`${td} text-[#4a3728]`}>{p.quantity}</td>
                  <td className={`${td} font-semibold text-[#1a1208]`}>฿{(p.price * p.quantity).toFixed(2)}</td>
                  <td className={`${td} text-[#a0907c]`}>{new Date(p.purchased_at).toLocaleDateString()}</td>
                  <td className={`${td} text-[#a0907c]`}>{p.notes || <span className="text-[#c4b5a5]">—</span>}</td>
                  <td className={`${td} text-right`}>
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => editingId === p.id ? cancelEdit() : startEdit(p)}
                        className={`text-xs font-medium transition-colors ${editingId === p.id ? "text-[#b07040]" : "text-[#a0907c] hover:text-[#b07040]"}`}
                      >
                        {editingId === p.id ? t.common.cancel : t.common.edit}
                      </button>
                      <button onClick={() => setPendingDeleteId(p.id)} className="text-xs font-medium text-[#a0907c] hover:text-rose-500 transition-colors">
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
          message={t.purchases.confirmDelete}
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
