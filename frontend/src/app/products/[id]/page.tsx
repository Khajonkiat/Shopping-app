"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api, imageUrl } from "@/lib/api";
import { card, inputCls, btnPrimary, btnSecondary, th, td, labelCls } from "@/lib/styles";
import type { PriceEntry, Product, ProductImage, Purchase, Store } from "@/lib/types";
import { useLocale } from "@/components/locale-provider";
import { useRequireAuth } from "@/lib/use-require-auth";
import { useAuth } from "@/lib/auth";

function toISO(dateStr: string): string | undefined {
  return dateStr ? `${dateStr}T00:00:00Z` : undefined;
}

function toDateInput(iso: string | undefined): string {
  if (!iso) return "";
  return iso.split("T")[0];
}

export default function ProductDetailPage() {
  const { t } = useLocale();
  const { ready } = useRequireAuth();
  const { isMaster } = useAuth();
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);

  const [product, setProduct] = useState<Product | null>(null);
  const [prices, setPrices] = useState<PriceEntry[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [tab, setTab] = useState<"prices" | "purchases" | "images">("prices");

  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // --- Create price ---
  const [showPriceForm, setShowPriceForm] = useState(false);
  const [priceForm, setPriceForm] = useState({ store_id: "", price: "", recorded_at: "" });
  const [priceSubmitting, setPriceSubmitting] = useState(false);
  const [priceError, setPriceError] = useState<string | null>(null);

  // --- Edit price ---
  const [editingPriceId, setEditingPriceId] = useState<number | null>(null);
  const [editPriceForm, setEditPriceForm] = useState({ store_id: "", price: "", recorded_at: "" });
  const [editPriceSubmitting, setEditPriceSubmitting] = useState(false);
  const [editPriceError, setEditPriceError] = useState<string | null>(null);

  // --- Create purchase ---
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [purchaseForm, setPurchaseForm] = useState({
    store_id: "", price: "", quantity: "1", purchased_at: "", notes: "",
  });
  const [purchaseSubmitting, setPurchaseSubmitting] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  // --- Edit purchase ---
  const [editingPurchaseId, setEditingPurchaseId] = useState<number | null>(null);
  const [editPurchaseForm, setEditPurchaseForm] = useState({
    store_id: "", price: "", quantity: "1", purchased_at: "", notes: "",
  });
  const [editPurchaseSubmitting, setEditPurchaseSubmitting] = useState(false);
  const [editPurchaseError, setEditPurchaseError] = useState<string | null>(null);

  useEffect(() => {
    api.products.get(productId).then(setProduct);
    api.products.prices(productId).then(setPrices);
    api.products.purchases(productId).then(setPurchases);
    api.stores.list().then(setStores);
    api.images.list(productId).then(setImages);
  }, [productId]);

  const canSubmitPrice = Number(priceForm.store_id) > 0 && Number(priceForm.price) > 0;
  const canSubmitPurchase = Number(purchaseForm.store_id) > 0 && Number(purchaseForm.price) > 0;
  const canEditPrice = Number(editPriceForm.store_id) > 0 && Number(editPriceForm.price) > 0;
  const canEditPurchase = Number(editPurchaseForm.store_id) > 0 && Number(editPurchaseForm.price) > 0;

  // Price CRUD
  async function handleAddPrice(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmitPrice) return;
    setPriceSubmitting(true);
    setPriceError(null);
    try {
      const entry = await api.prices.create({
        product_id: productId,
        store_id: Number(priceForm.store_id),
        price: Number(priceForm.price),
        ...(toISO(priceForm.recorded_at) && { recorded_at: toISO(priceForm.recorded_at) }),
      });
      setPrices((prev) => [{
        ...entry,
        store: stores.find((x) => x.id === entry.store_id),
      }, ...prev]);
      setPriceForm({ store_id: "", price: "", recorded_at: "" });
      setShowPriceForm(false);
    } catch (err) {
      setPriceError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setPriceSubmitting(false);
    }
  }

  function startEditPrice(p: PriceEntry) {
    setShowPriceForm(false);
    setPriceError(null);
    setEditingPriceId(p.id);
    setEditPriceError(null);
    setEditPriceForm({
      store_id: String(p.store_id),
      price: String(p.price),
      recorded_at: toDateInput(p.recorded_at),
    });
  }

  function cancelEditPrice() {
    setEditingPriceId(null);
    setEditPriceForm({ store_id: "", price: "", recorded_at: "" });
    setEditPriceError(null);
  }

  async function handleUpdatePrice(e: React.FormEvent) {
    e.preventDefault();
    if (!editingPriceId || !canEditPrice) return;
    setEditPriceSubmitting(true);
    setEditPriceError(null);
    try {
      const payload: Record<string, unknown> = {
        store_id: Number(editPriceForm.store_id),
        price: Number(editPriceForm.price),
      };
      if (editPriceForm.recorded_at) payload.recorded_at = toISO(editPriceForm.recorded_at);
      const updated = await api.prices.update(editingPriceId, payload);
      setPrices((prev) => prev.map((p) =>
        p.id === editingPriceId
          ? { ...updated, store: stores.find((x) => x.id === updated.store_id) }
          : p
      ));
      cancelEditPrice();
    } catch (err) {
      setEditPriceError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setEditPriceSubmitting(false);
    }
  }

  // Purchase CRUD
  async function handleAddPurchase(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmitPurchase) return;
    setPurchaseSubmitting(true);
    setPurchaseError(null);
    try {
      const purchase = await api.purchases.create({
        product_id: productId,
        store_id: Number(purchaseForm.store_id),
        price: Number(purchaseForm.price),
        quantity: Number(purchaseForm.quantity) || 1,
        notes: purchaseForm.notes,
        ...(toISO(purchaseForm.purchased_at) && { purchased_at: toISO(purchaseForm.purchased_at) }),
      });
      setPurchases((prev) => [{
        ...purchase,
        store: stores.find((x) => x.id === purchase.store_id),
      }, ...prev]);
      setPurchaseForm({ store_id: "", price: "", quantity: "1", purchased_at: "", notes: "" });
      setShowPurchaseForm(false);
    } catch (err) {
      setPurchaseError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setPurchaseSubmitting(false);
    }
  }

  function startEditPurchase(p: Purchase) {
    setShowPurchaseForm(false);
    setPurchaseError(null);
    setEditingPurchaseId(p.id);
    setEditPurchaseError(null);
    setEditPurchaseForm({
      store_id: String(p.store_id),
      price: String(p.price),
      quantity: String(p.quantity),
      purchased_at: toDateInput(p.purchased_at),
      notes: p.notes ?? "",
    });
  }

  function cancelEditPurchase() {
    setEditingPurchaseId(null);
    setEditPurchaseForm({ store_id: "", price: "", quantity: "1", purchased_at: "", notes: "" });
    setEditPurchaseError(null);
  }

  async function handleUpdatePurchase(e: React.FormEvent) {
    e.preventDefault();
    if (!editingPurchaseId || !canEditPurchase) return;
    setEditPurchaseSubmitting(true);
    setEditPurchaseError(null);
    try {
      const payload: Record<string, unknown> = {
        store_id: Number(editPurchaseForm.store_id),
        price: Number(editPurchaseForm.price),
        quantity: Number(editPurchaseForm.quantity) || 1,
        notes: editPurchaseForm.notes,
      };
      if (editPurchaseForm.purchased_at) payload.purchased_at = toISO(editPurchaseForm.purchased_at);
      const updated = await api.purchases.update(editingPurchaseId, payload);
      setPurchases((prev) => prev.map((p) =>
        p.id === editingPurchaseId
          ? { ...updated, store: stores.find((x) => x.id === updated.store_id) }
          : p
      ));
      cancelEditPurchase();
    } catch (err) {
      setEditPurchaseError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setEditPurchaseSubmitting(false);
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    setImageError(null);
    try {
      const img = await api.images.upload(productId, file);
      setImages((prev) => [...prev, img]);
    } catch (err) {
      setImageError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setImageUploading(false);
      e.target.value = "";
    }
  }

  async function handleImageDelete(img: ProductImage) {
    await api.images.delete(img.id);
    setImages((prev) => prev.filter((x) => x.id !== img.id));
  }

  const latestPerStore = stores
    .map((store) => {
      const entry = prices
        .filter((p) => p.store_id === store.id)
        .sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime())[0];
      return entry ? { store, price: entry.price } : null;
    })
    .filter(Boolean)
    .sort((a, b) => a!.price - b!.price) as { store: Store; price: number }[];

  if (!ready || !product) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-slate-400 text-sm">{t.common.loading}</p>
      </div>
    );
  }

  const tabs = [
    { key: "prices" as const, label: t.productDetail.pricesTab, count: prices.length },
    { key: "purchases" as const, label: t.productDetail.purchasesTab, count: purchases.length },
    { key: "images" as const, label: t.productDetail.imagesTab, count: images.length },
  ];

  return (
    <div className="space-y-8">
      {/* Breadcrumb + header */}
      <div>
        <Link href="/products" className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors mb-3">
          ← {t.productDetail.back.replace("← ", "")}
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{product.name}</h1>
        {(product.category || product.unit || product.description) && (
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {product.category && (
              <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
                {product.category}
              </span>
            )}
            {product.unit && (
              <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
                {product.unit}
              </span>
            )}
            {product.description && (
              <span className="text-xs text-slate-400">{product.description}</span>
            )}
          </div>
        )}
      </div>

      {/* Price comparison */}
      {latestPerStore.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {latestPerStore.map(({ store, price }, i) => (
            <div
              key={store.id}
              className={`${card} px-5 py-4 min-w-[120px] ${
                i === 0 ? "ring-emerald-300/70 shadow-emerald-100" : ""
              }`}
            >
              <div className="text-xs font-medium text-slate-400 mb-1">{store.name}</div>
              <div className={`text-xl font-bold tracking-tight ${i === 0 ? "text-emerald-700" : "text-slate-900"}`}>
                ฿{price.toFixed(2)}
              </div>
              {i === 0 && latestPerStore.length > 1 && (
                <div className="mt-1 text-xs font-semibold text-emerald-600 uppercase tracking-wide">
                  {t.productDetail.cheapest}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-slate-200 flex gap-1">
        {tabs.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`relative pb-3 px-1 mr-4 text-sm font-medium transition-colors ${
              tab === key ? "text-indigo-600" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {label}
            <span className={`ml-1.5 text-xs font-semibold px-1.5 py-0.5 rounded-full ${
              tab === key ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-400"
            }`}>
              {count}
            </span>
            {tab === key && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Prices tab */}
      {tab === "prices" && (
        <div className="space-y-5">
          {isMaster && (
            <div className="flex justify-end">
              <button
                className={showPriceForm ? btnSecondary : btnPrimary}
                onClick={() => { setShowPriceForm((v) => !v); setPriceError(null); cancelEditPrice(); }}
              >
                {showPriceForm ? t.common.cancel : t.productDetail.recordPrice}
              </button>
            </div>
          )}

          {showPriceForm && (
            <div className={`${card} p-6`}>
              <h3 className="text-sm font-semibold text-slate-700 mb-5">Record price</h3>
              <form onSubmit={handleAddPrice} noValidate className="space-y-5">
                <div className="grid grid-cols-3 gap-5">
                  <div>
                    <label className={labelCls}>{t.common.store} <span className="text-rose-400">*</span></label>
                    <select
                      className={inputCls}
                      value={priceForm.store_id}
                      onChange={(e) => setPriceForm((f) => ({ ...f, store_id: e.target.value }))}
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
                      value={priceForm.price}
                      onChange={(e) => setPriceForm((f) => ({ ...f, price: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>{t.common.date}</label>
                    <input
                      type="date"
                      className={inputCls}
                      value={priceForm.recorded_at}
                      onChange={(e) => setPriceForm((f) => ({ ...f, recorded_at: e.target.value }))}
                    />
                  </div>
                </div>

                {priceError && (
                  <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                    {priceError}
                  </p>
                )}

                <div className="flex justify-end gap-3 pt-1 border-t border-slate-100">
                  <button
                    type="button"
                    className={btnSecondary}
                    onClick={() => { setShowPriceForm(false); setPriceError(null); }}
                  >
                    {t.common.cancel}
                  </button>
                  <button
                    type="submit"
                    className={btnPrimary}
                    disabled={!canSubmitPrice || priceSubmitting}
                  >
                    {priceSubmitting ? "Saving…" : t.common.save}
                  </button>
                </div>
              </form>
            </div>
          )}

          {editingPriceId !== null && (
            <div className={`${card} p-6 ring-indigo-300/60`}>
              <h3 className="text-sm font-semibold text-slate-700 mb-5">Edit price</h3>
              <form onSubmit={handleUpdatePrice} noValidate className="space-y-5">
                <div className="grid grid-cols-3 gap-5">
                  <div>
                    <label className={labelCls}>{t.common.store} <span className="text-rose-400">*</span></label>
                    <select
                      className={inputCls}
                      value={editPriceForm.store_id}
                      onChange={(e) => setEditPriceForm((f) => ({ ...f, store_id: e.target.value }))}
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
                      value={editPriceForm.price}
                      onChange={(e) => setEditPriceForm((f) => ({ ...f, price: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>{t.common.date}</label>
                    <input
                      type="date"
                      className={inputCls}
                      value={editPriceForm.recorded_at}
                      onChange={(e) => setEditPriceForm((f) => ({ ...f, recorded_at: e.target.value }))}
                    />
                  </div>
                </div>

                {editPriceError && (
                  <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                    {editPriceError}
                  </p>
                )}

                <div className="flex justify-end gap-3 pt-1 border-t border-slate-100">
                  <button type="button" className={btnSecondary} onClick={cancelEditPrice}>{t.common.cancel}</button>
                  <button
                    type="submit"
                    className={btnPrimary}
                    disabled={!canEditPrice || editPriceSubmitting}
                  >
                    {editPriceSubmitting ? "Saving…" : t.common.save}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className={`${card} overflow-hidden`}>
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  <th className={th}>{t.common.store}</th>
                  <th className={th}>{t.common.price}</th>
                  <th className={th}>{t.common.date}</th>
                  <th className={th}>{t.common.source}</th>
                  <th className={th} />
                </tr>
              </thead>
              <tbody>
                {prices.length === 0 ? (
                  <tr key="empty">
                    <td colSpan={5} className="px-4 py-16 text-center text-slate-400 text-sm">
                      {t.productDetail.noPrices}
                    </td>
                  </tr>
                ) : prices.map((p) => (
                  <tr key={String(p.id)} className={`border-b border-slate-100 last:border-0 transition-colors ${editingPriceId === p.id ? "bg-indigo-50/40" : "hover:bg-slate-50/60"}`}>
                    <td className={`${td} font-medium text-slate-900`}>{p.store?.name ?? `#${p.store_id}`}</td>
                    <td className={`${td} font-semibold text-slate-900`}>฿{p.price.toFixed(2)}</td>
                    <td className={`${td} text-slate-400`}>{new Date(p.recorded_at).toLocaleDateString()}</td>
                    <td className={td}>
                      <span className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full ${
                        p.source_type === "scraped"
                          ? "bg-indigo-50 text-indigo-700"
                          : "bg-slate-100 text-slate-600"
                      }`}>
                        {p.source_type === "scraped" ? t.productDetail.sourceScraped : t.productDetail.sourceManual}
                      </span>
                    </td>
                    {isMaster && (
                      <td className={`${td} text-right`}>
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => editingPriceId === p.id ? cancelEditPrice() : startEditPrice(p)}
                            className={`text-xs font-medium transition-colors ${editingPriceId === p.id ? "text-indigo-500" : "text-slate-400 hover:text-indigo-500"}`}
                          >
                            {editingPriceId === p.id ? t.common.cancel : t.common.edit}
                          </button>
                          <button
                            onClick={async () => {
                              await api.prices.delete(p.id);
                              setPrices((prev) => prev.filter((x) => x.id !== p.id));
                              if (editingPriceId === p.id) cancelEditPrice();
                            }}
                            className="text-xs font-medium text-slate-400 hover:text-rose-500 transition-colors"
                          >
                            {t.common.delete}
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Purchases tab */}
      {tab === "purchases" && (
        <div className="space-y-5">
          {isMaster && (
            <div className="flex justify-end">
              <button
                className={showPurchaseForm ? btnSecondary : btnPrimary}
                onClick={() => { setShowPurchaseForm((v) => !v); setPurchaseError(null); cancelEditPurchase(); }}
              >
                {showPurchaseForm ? t.common.cancel : t.productDetail.recordPurchase}
              </button>
            </div>
          )}

          {showPurchaseForm && (
            <div className={`${card} p-6`}>
              <h3 className="text-sm font-semibold text-slate-700 mb-5">Record purchase</h3>
              <form onSubmit={handleAddPurchase} noValidate className="space-y-5">
                <div className="grid grid-cols-3 gap-5">
                  <div>
                    <label className={labelCls}>{t.common.store} <span className="text-rose-400">*</span></label>
                    <select
                      className={inputCls}
                      value={purchaseForm.store_id}
                      onChange={(e) => setPurchaseForm((f) => ({ ...f, store_id: e.target.value }))}
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
                      value={purchaseForm.price}
                      onChange={(e) => setPurchaseForm((f) => ({ ...f, price: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>{t.common.qty}</label>
                    <input
                      type="number" step="0.01" min="0.01"
                      className={inputCls}
                      value={purchaseForm.quantity}
                      onChange={(e) => setPurchaseForm((f) => ({ ...f, quantity: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>{t.common.date}</label>
                    <input
                      type="date"
                      className={inputCls}
                      value={purchaseForm.purchased_at}
                      onChange={(e) => setPurchaseForm((f) => ({ ...f, purchased_at: e.target.value }))}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className={labelCls}>{t.common.notes}</label>
                    <input
                      type="text"
                      className={inputCls}
                      placeholder={t.common.optional}
                      value={purchaseForm.notes}
                      onChange={(e) => setPurchaseForm((f) => ({ ...f, notes: e.target.value }))}
                    />
                  </div>
                </div>

                {purchaseError && (
                  <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                    {purchaseError}
                  </p>
                )}

                <div className="flex justify-end gap-3 pt-1 border-t border-slate-100">
                  <button
                    type="button"
                    className={btnSecondary}
                    onClick={() => { setShowPurchaseForm(false); setPurchaseError(null); }}
                  >
                    {t.common.cancel}
                  </button>
                  <button
                    type="submit"
                    className={btnPrimary}
                    disabled={!canSubmitPurchase || purchaseSubmitting}
                  >
                    {purchaseSubmitting ? "Saving…" : t.common.save}
                  </button>
                </div>
              </form>
            </div>
          )}

          {editingPurchaseId !== null && (
            <div className={`${card} p-6 ring-indigo-300/60`}>
              <h3 className="text-sm font-semibold text-slate-700 mb-5">Edit purchase</h3>
              <form onSubmit={handleUpdatePurchase} noValidate className="space-y-5">
                <div className="grid grid-cols-3 gap-5">
                  <div>
                    <label className={labelCls}>{t.common.store} <span className="text-rose-400">*</span></label>
                    <select
                      className={inputCls}
                      value={editPurchaseForm.store_id}
                      onChange={(e) => setEditPurchaseForm((f) => ({ ...f, store_id: e.target.value }))}
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
                      value={editPurchaseForm.price}
                      onChange={(e) => setEditPurchaseForm((f) => ({ ...f, price: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>{t.common.qty}</label>
                    <input
                      type="number" step="0.01" min="0.01"
                      className={inputCls}
                      value={editPurchaseForm.quantity}
                      onChange={(e) => setEditPurchaseForm((f) => ({ ...f, quantity: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>{t.common.date}</label>
                    <input
                      type="date"
                      className={inputCls}
                      value={editPurchaseForm.purchased_at}
                      onChange={(e) => setEditPurchaseForm((f) => ({ ...f, purchased_at: e.target.value }))}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className={labelCls}>{t.common.notes}</label>
                    <input
                      type="text"
                      className={inputCls}
                      placeholder={t.common.optional}
                      value={editPurchaseForm.notes}
                      onChange={(e) => setEditPurchaseForm((f) => ({ ...f, notes: e.target.value }))}
                    />
                  </div>
                </div>

                {editPurchaseError && (
                  <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                    {editPurchaseError}
                  </p>
                )}

                <div className="flex justify-end gap-3 pt-1 border-t border-slate-100">
                  <button type="button" className={btnSecondary} onClick={cancelEditPurchase}>{t.common.cancel}</button>
                  <button
                    type="submit"
                    className={btnPrimary}
                    disabled={!canEditPurchase || editPurchaseSubmitting}
                  >
                    {editPurchaseSubmitting ? "Saving…" : t.common.save}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className={`${card} overflow-hidden`}>
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
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
                {purchases.length === 0 ? (
                  <tr key="empty">
                    <td colSpan={7} className="px-4 py-16 text-center text-slate-400 text-sm">
                      {t.productDetail.noPurchases}
                    </td>
                  </tr>
                ) : purchases.map((p) => (
                  <tr key={String(p.id)} className={`border-b border-slate-100 last:border-0 transition-colors ${editingPurchaseId === p.id ? "bg-indigo-50/40" : "hover:bg-slate-50/60"}`}>
                    <td className={`${td} font-medium text-slate-900`}>{p.store?.name ?? `#${p.store_id}`}</td>
                    <td className={`${td} text-slate-700`}>฿{p.price.toFixed(2)}</td>
                    <td className={`${td} text-slate-600`}>{p.quantity}</td>
                    <td className={`${td} font-semibold text-slate-900`}>฿{(p.price * p.quantity).toFixed(2)}</td>
                    <td className={`${td} text-slate-400`}>{new Date(p.purchased_at).toLocaleDateString()}</td>
                    <td className={`${td} text-slate-400`}>{p.notes || <span className="text-slate-300">—</span>}</td>
                    {isMaster && (
                      <td className={`${td} text-right`}>
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => editingPurchaseId === p.id ? cancelEditPurchase() : startEditPurchase(p)}
                            className={`text-xs font-medium transition-colors ${editingPurchaseId === p.id ? "text-indigo-500" : "text-slate-400 hover:text-indigo-500"}`}
                          >
                            {editingPurchaseId === p.id ? t.common.cancel : t.common.edit}
                          </button>
                          <button
                            onClick={async () => {
                              await api.purchases.delete(p.id);
                              setPurchases((prev) => prev.filter((x) => x.id !== p.id));
                              if (editingPurchaseId === p.id) cancelEditPurchase();
                            }}
                            className="text-xs font-medium text-slate-400 hover:text-rose-500 transition-colors"
                          >
                            {t.common.delete}
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Images tab */}
      {tab === "images" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">{images.length} {t.productDetail.imagesTab}</p>
            {isMaster && (
              <label className={`${btnPrimary} cursor-pointer`}>
                {imageUploading ? "Uploading…" : t.productDetail.uploadImage}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                  disabled={imageUploading}
                  onChange={handleImageUpload}
                />
              </label>
            )}
          </div>

          {imageError && (
            <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
              {imageError}
            </p>
          )}

          {images.length === 0 ? (
            <div className={`${card} px-4 py-16 text-center text-slate-400 text-sm`}>
              {t.productDetail.noImages}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((img) => (
                <div key={img.id} className="group relative">
                  <div className="aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                    <img
                      src={imageUrl(img.filename)}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {isMaster && (
                    <button
                      onClick={() => handleImageDelete(img)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-rose-50 text-rose-500 rounded-lg px-2 py-1 text-xs font-medium shadow-sm border border-rose-100"
                    >
                      {t.common.delete}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
