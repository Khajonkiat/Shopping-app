"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api, imageUrl } from "@/lib/api";
import { card, editCard, inputCls, btnPrimary, btnSecondary, th, td, labelCls } from "@/lib/styles";
import type { PriceEntry, Product, ProductImage, Purchase, Store } from "@/lib/types";
import { useLocale } from "@/components/locale-provider";
import { useRequireAuth } from "@/lib/use-require-auth";
import { Toast } from "@/components/toast";
import { useToast } from "@/lib/use-toast";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { SkeletonProductDetail } from "@/components/skeleton";

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
  const { message: toastMsg, toast, dismiss } = useToast();
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

  // --- Pending deletes ---
  const [pendingDeletePriceId, setPendingDeletePriceId] = useState<number | null>(null);
  const [pendingDeletePurchaseId, setPendingDeletePurchaseId] = useState<number | null>(null);

  useEffect(() => {
    if (!ready) return;
    api.products.get(productId).then(setProduct).catch(() => {});
    api.products.prices(productId).then(setPrices).catch(() => {});
    api.products.purchases(productId).then(setPurchases).catch(() => {});
    api.stores.list().then(setStores).catch(() => {});
    api.images.list(productId).then(setImages).catch(() => {});
  }, [ready, productId]);

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
      toast(t.common.toastSaved);
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
      toast(t.common.toastUpdated);
    } catch (err) {
      setEditPriceError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setEditPriceSubmitting(false);
    }
  }

  async function handleDeletePrice(id: number) {
    await api.prices.delete(id);
    setPrices((prev) => prev.filter((x) => x.id !== id));
    if (editingPriceId === id) cancelEditPrice();
    setPendingDeletePriceId(null);
    toast(t.common.toastDeleted);
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
      toast(t.common.toastSaved);
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
      toast(t.common.toastUpdated);
    } catch (err) {
      setEditPurchaseError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setEditPurchaseSubmitting(false);
    }
  }

  async function handleDeletePurchase(id: number) {
    await api.purchases.delete(id);
    setPurchases((prev) => prev.filter((x) => x.id !== id));
    if (editingPurchaseId === id) cancelEditPurchase();
    setPendingDeletePurchaseId(null);
    toast(t.common.toastDeleted);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    setImageError(null);
    try {
      const img = await api.images.upload(productId, file);
      setImages((prev) => [...prev, img]);
      toast(t.common.toastSaved);
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
    toast(t.common.toastDeleted);
  }

  const storeComparison = stores
    .map((store) => {
      const storePrices = prices
        .filter((p) => p.store_id === store.id)
        .sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime());
      if (storePrices.length === 0) return null;
      return { store, latestPrice: storePrices[0].price, lastRecorded: storePrices[0].recorded_at, count: storePrices.length };
    })
    .filter(Boolean)
    .sort((a, b) => a!.latestPrice - b!.latestPrice) as { store: Store; latestPrice: number; lastRecorded: string; count: number }[];

  if (!ready || !product) return <SkeletonProductDetail />;

  const tabs = [
    { key: "prices" as const, label: t.productDetail.pricesTab, count: prices.length },
    { key: "purchases" as const, label: t.productDetail.purchasesTab, count: purchases.length },
    { key: "images" as const, label: t.productDetail.imagesTab, count: images.length },
  ];

  return (
    <div className="space-y-8">
      {/* Breadcrumb + header */}
      <div>
        <Link href="/products" className="inline-flex items-center gap-1 text-xs font-medium text-[#a0907c] hover:text-[#4a3728] transition-colors mb-3">
          ← {t.productDetail.back.replace("← ", "")}
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-[#1a1208]">{product.name}</h1>
        {(product.category || product.unit || product.description) && (
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {product.category && (
              <span className="text-xs font-medium bg-[#e5d4be] text-[#4a3728] px-2.5 py-1 rounded-full">
                {product.category}
              </span>
            )}
            {product.unit && (
              <span className="text-xs font-medium bg-[#e5d4be] text-[#4a3728] px-2.5 py-1 rounded-full">
                {product.unit}
              </span>
            )}
            {product.description && (
              <span className="text-xs text-[#a0907c]">{product.description}</span>
            )}
          </div>
        )}
      </div>

      {/* Price comparison */}
      {storeComparison.length > 0 && (
        <div className={`${card} overflow-hidden`}>
          <div className="px-4 py-2.5 border-b border-[#d9cfc3] bg-[#f0e7d8]">
            <p className="text-xs font-semibold text-[#5c4433] uppercase tracking-wider">
              {t.productDetail.priceComparison}
            </p>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#d9cfc3] bg-[#f8f4ef]">
                <th className={th}>{t.common.store}</th>
                <th className={th}>{t.common.price}</th>
                <th className={th}>{t.productDetail.lastRecorded}</th>
                <th className={th}>{t.productDetail.priceCount}</th>
              </tr>
            </thead>
            <tbody>
              {storeComparison.map(({ store, latestPrice, lastRecorded, count }, i) => (
                <tr key={store.id} className={`border-b border-[#e8dfd5] last:border-0 transition-colors ${i === 0 ? "bg-[#f5fdf3]" : "hover:bg-[#fdf9f5]"}`}>
                  <td className={`${td} font-medium text-[#1a1208]`}>
                    {store.name}
                    {i === 0 && storeComparison.length > 1 && (
                      <span className="ml-2 text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                        {t.productDetail.cheapest}
                      </span>
                    )}
                  </td>
                  <td className={`${td} font-bold ${i === 0 ? "text-emerald-700" : "text-[#1a1208]"}`}>
                    ฿{latestPrice.toFixed(2)}
                  </td>
                  <td className={`${td} text-[#a0907c]`}>
                    {new Date(lastRecorded).toLocaleDateString()}
                  </td>
                  <td className={`${td} text-[#a0907c]`}>
                    {count}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-[#d9cfc3] flex gap-1">
        {tabs.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`relative pb-3 px-1 mr-4 text-sm font-medium transition-colors ${
              tab === key ? "text-[#b07040]" : "text-[#7a6858] hover:text-[#4a3728]"
            }`}
          >
            {label}
            <span className={`ml-1.5 text-xs font-semibold px-1.5 py-0.5 rounded-full ${
              tab === key ? "bg-[#e5d4be] text-[#b07040]" : "bg-[#f0ece8] text-[#a0907c]"
            }`}>
              {count}
            </span>
            {tab === key && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#b07040] rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Prices tab */}
      {tab === "prices" && (
        <div className="space-y-5">
          <div className="flex justify-end">
            <button
              className={showPriceForm ? btnSecondary : btnPrimary}
              onClick={() => { setShowPriceForm((v) => !v); setPriceError(null); cancelEditPrice(); }}
            >
              {showPriceForm ? t.common.cancel : t.productDetail.recordPrice}
            </button>
          </div>

          {showPriceForm && (
            <div className={`${card} p-6`}>
              <h3 className="text-sm font-semibold text-[#4a3728] mb-5">{t.productDetail.formRecordPrice}</h3>
              <form onSubmit={handleAddPrice} noValidate className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
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
                  <p className="text-sm text-rose-700 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
                    {priceError}
                  </p>
                )}

                <div className="flex justify-end gap-3 pt-1 border-t border-[#e8dfd5]">
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
                    {priceSubmitting ? t.common.saving : t.common.save}
                  </button>
                </div>
              </form>
            </div>
          )}

          {editingPriceId !== null && (
            <div className={`${editCard} p-6`}>
              <h3 className="text-sm font-semibold text-[#4a3728] mb-5">{t.productDetail.formEditPrice}</h3>
              <form onSubmit={handleUpdatePrice} noValidate className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
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
                  <p className="text-sm text-rose-700 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
                    {editPriceError}
                  </p>
                )}

                <div className="flex justify-end gap-3 pt-1 border-t border-[#e8dfd5]">
                  <button type="button" className={btnSecondary} onClick={cancelEditPrice}>{t.common.cancel}</button>
                  <button
                    type="submit"
                    className={btnPrimary}
                    disabled={!canEditPrice || editPriceSubmitting}
                  >
                    {editPriceSubmitting ? t.common.saving : t.common.save}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className={`${card} overflow-x-auto`}>
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#d9cfc3] bg-[#f0e7d8]">
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
                    <td colSpan={5} className="px-4 py-16 text-center text-[#a0907c] text-sm">
                      {t.productDetail.noPrices}
                    </td>
                  </tr>
                ) : prices.map((p) => (
                  <tr key={String(p.id)} className={`border-b border-[#e8dfd5] last:border-0 transition-colors ${editingPriceId === p.id ? "bg-[#f7f0e8]" : "hover:bg-[#fdf9f5]"}`}>
                    <td className={`${td} font-medium text-[#1a1208]`}>{p.store?.name ?? `#${p.store_id}`}</td>
                    <td className={`${td} font-semibold text-[#1a1208]`}>฿{p.price.toFixed(2)}</td>
                    <td className={`${td} text-[#a0907c]`}>{new Date(p.recorded_at).toLocaleDateString()}</td>
                    <td className={td}>
                      <span className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full ${
                        p.source_type === "scraped"
                          ? "bg-[#e8f0e4] text-[#4a6a38]"
                          : "bg-[#e5d4be] text-[#4a3728]"
                      }`}>
                        {p.source_type === "scraped" ? t.productDetail.sourceScraped : t.productDetail.sourceManual}
                      </span>
                    </td>
                    <td className={`${td} text-right`}>
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => editingPriceId === p.id ? cancelEditPrice() : startEditPrice(p)}
                          className={`text-xs font-medium transition-colors ${editingPriceId === p.id ? "text-[#b07040]" : "text-[#a0907c] hover:text-[#b07040]"}`}
                        >
                          {editingPriceId === p.id ? t.common.cancel : t.common.edit}
                        </button>
                        <button onClick={() => setPendingDeletePriceId(p.id)} className="text-xs font-medium text-[#a0907c] hover:text-rose-500 transition-colors">
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
      )}

      {/* Purchases tab */}
      {tab === "purchases" && (
        <div className="space-y-5">
          <div className="flex justify-end">
            <button
              className={showPurchaseForm ? btnSecondary : btnPrimary}
              onClick={() => { setShowPurchaseForm((v) => !v); setPurchaseError(null); cancelEditPurchase(); }}
            >
              {showPurchaseForm ? t.common.cancel : t.productDetail.recordPurchase}
            </button>
          </div>

          {showPurchaseForm && (
            <div className={`${card} p-6`}>
              <h3 className="text-sm font-semibold text-[#4a3728] mb-5">{t.productDetail.formRecordPurchase}</h3>
              <form onSubmit={handleAddPurchase} noValidate className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
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
                  <p className="text-sm text-rose-700 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
                    {purchaseError}
                  </p>
                )}

                <div className="flex justify-end gap-3 pt-1 border-t border-[#e8dfd5]">
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
                    {purchaseSubmitting ? t.common.saving : t.common.save}
                  </button>
                </div>
              </form>
            </div>
          )}

          {editingPurchaseId !== null && (
            <div className={`${editCard} p-6`}>
              <h3 className="text-sm font-semibold text-[#4a3728] mb-5">{t.productDetail.formEditPurchase}</h3>
              <form onSubmit={handleUpdatePurchase} noValidate className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
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
                  <p className="text-sm text-rose-700 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
                    {editPurchaseError}
                  </p>
                )}

                <div className="flex justify-end gap-3 pt-1 border-t border-[#e8dfd5]">
                  <button type="button" className={btnSecondary} onClick={cancelEditPurchase}>{t.common.cancel}</button>
                  <button
                    type="submit"
                    className={btnPrimary}
                    disabled={!canEditPurchase || editPurchaseSubmitting}
                  >
                    {editPurchaseSubmitting ? t.common.saving : t.common.save}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className={`${card} overflow-x-auto`}>
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#d9cfc3] bg-[#f0e7d8]">
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
                    <td colSpan={7} className="px-4 py-16 text-center text-[#a0907c] text-sm">
                      {t.productDetail.noPurchases}
                    </td>
                  </tr>
                ) : purchases.map((p) => (
                  <tr key={String(p.id)} className={`border-b border-[#e8dfd5] last:border-0 transition-colors ${editingPurchaseId === p.id ? "bg-[#f7f0e8]" : "hover:bg-[#fdf9f5]"}`}>
                    <td className={`${td} font-medium text-[#1a1208]`}>{p.store?.name ?? `#${p.store_id}`}</td>
                    <td className={`${td} text-[#4a3728]`}>฿{p.price.toFixed(2)}</td>
                    <td className={`${td} text-[#4a3728]`}>{p.quantity}</td>
                    <td className={`${td} font-semibold text-[#1a1208]`}>฿{(p.price * p.quantity).toFixed(2)}</td>
                    <td className={`${td} text-[#a0907c]`}>{new Date(p.purchased_at).toLocaleDateString()}</td>
                    <td className={`${td} text-[#a0907c]`}>{p.notes || <span className="text-[#c4b5a5]">—</span>}</td>
                    <td className={`${td} text-right`}>
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => editingPurchaseId === p.id ? cancelEditPurchase() : startEditPurchase(p)}
                          className={`text-xs font-medium transition-colors ${editingPurchaseId === p.id ? "text-[#b07040]" : "text-[#a0907c] hover:text-[#b07040]"}`}
                        >
                          {editingPurchaseId === p.id ? t.common.cancel : t.common.edit}
                        </button>
                        <button onClick={() => setPendingDeletePurchaseId(p.id)} className="text-xs font-medium text-[#a0907c] hover:text-rose-500 transition-colors">
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
      )}

      {/* Images tab */}
      {tab === "images" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#7a6858]">{images.length} {t.productDetail.imagesTab}</p>
            <label className={`${btnPrimary} cursor-pointer`}>
              {imageUploading ? t.common.saving : t.productDetail.uploadImage}
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="hidden"
                disabled={imageUploading}
                onChange={handleImageUpload}
              />
            </label>
          </div>

          {imageError && (
            <p className="text-sm text-rose-700 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
              {imageError}
            </p>
          )}

          {images.length === 0 ? (
            <div className={`${card} px-4 py-16 text-center text-[#a0907c] text-sm`}>
              {t.productDetail.noImages}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((img) => (
                <div key={img.id} className="group relative">
                  <div className="aspect-square overflow-hidden rounded-xl border border-[#d9cfc3] bg-[#fdf9f5]">
                    <img
                      src={imageUrl(img.filename)}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    onClick={() => handleImageDelete(img)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-rose-50 text-rose-500 rounded-lg px-2 py-1 text-xs font-medium shadow-sm border border-rose-100"
                  >
                    {t.common.delete}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {pendingDeletePriceId !== null && (
        <ConfirmDialog
          message={t.productDetail.confirmDeletePrice}
          confirmLabel={t.common.delete}
          cancelLabel={t.common.cancel}
          onConfirm={() => handleDeletePrice(pendingDeletePriceId)}
          onCancel={() => setPendingDeletePriceId(null)}
        />
      )}
      {pendingDeletePurchaseId !== null && (
        <ConfirmDialog
          message={t.productDetail.confirmDeletePurchase}
          confirmLabel={t.common.delete}
          cancelLabel={t.common.cancel}
          onConfirm={() => handleDeletePurchase(pendingDeletePurchaseId)}
          onCancel={() => setPendingDeletePurchaseId(null)}
        />
      )}
      {toastMsg && <Toast message={toastMsg} onDismiss={dismiss} />}
    </div>
  );
}
