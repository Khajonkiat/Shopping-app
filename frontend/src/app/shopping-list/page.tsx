"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { api, imageUrl } from "@/lib/api";
import { useRequireAuth } from "@/lib/use-require-auth";
import { useLocale } from "@/components/locale-provider";
import { card, inputCls } from "@/lib/styles";
import type { PriceEntry, Product } from "@/lib/types";
import { SkeletonShoppingList } from "@/components/skeleton";

const STORAGE_KEY = "shopping_list_checked";

function loadChecked(): Set<number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw) as number[]) : new Set();
  } catch {
    return new Set();
  }
}

function saveChecked(next: Set<number>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
}

function IconCheck() {
  return (
    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function IconImage() {
  return (
    <svg className="w-4 h-4 text-[#c4b5a5]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 3h18M3 21h18" />
    </svg>
  );
}

interface ProductSummary {
  storeName: string;
  price: number;
}

function ShoppingItem({
  product,
  summary,
  isChecked,
  onToggle,
}: {
  product: Product;
  summary: ProductSummary | undefined;
  isChecked: boolean;
  onToggle: () => void;
}) {
  const { t } = useLocale();
  const thumb = product.images?.[0];

  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-[#fdf9f5] transition-colors">
      <button
        onClick={onToggle}
        className={`w-5 h-5 rounded-md border-2 shrink-0 flex items-center justify-center transition-colors ${
          isChecked
            ? "bg-[#b07040] border-[#b07040]"
            : "border-[#c4b5a5] hover:border-[#b07040]"
        }`}
        aria-label={isChecked ? "Uncheck" : "Check"}
      >
        {isChecked && <IconCheck />}
      </button>

      <Link href={`/products/${product.id}`} className="flex items-center gap-3 flex-1 min-w-0">
        {thumb ? (
          <img
            src={imageUrl(thumb.filename)}
            alt=""
            className="w-9 h-9 rounded-lg object-cover border border-[#d9cfc3] shrink-0"
          />
        ) : (
          <div className="w-9 h-9 rounded-lg bg-[#eddccc] border border-[#d9cfc3] flex items-center justify-center shrink-0">
            <IconImage />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate transition-colors ${
            isChecked ? "line-through text-[#a0907c]" : "text-[#1a1208]"
          }`}>
            {product.name}
          </p>
          {summary ? (
            <p className="text-xs text-[#a0907c] truncate">
              {t.shoppingList.cheapestAt} <span className="font-medium">{summary.storeName}</span>
              {" · "}฿{summary.price.toFixed(2)}
            </p>
          ) : (
            <p className="text-xs text-[#c4b5a5]">{t.shoppingList.noPrice}</p>
          )}
        </div>
      </Link>
    </div>
  );
}

export default function ShoppingListPage() {
  const { t } = useLocale();
  const { ready } = useRequireAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [allPrices, setAllPrices] = useState<PriceEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [query, setQuery] = useState("");

  // Hydrate checked set from localStorage after mount
  useEffect(() => {
    setChecked(loadChecked());
  }, []);

  useEffect(() => {
    if (!ready) return;
    Promise.all([api.products.list(), api.prices.listAll()])
      .then(([prods, prices]) => {
        setProducts(prods);
        setAllPrices(prices);
      })
      .finally(() => setLoading(false));
  }, [ready]);

  // Cheapest current price per product: latest price per store, then min across stores
  const productSummary = useMemo<Map<number, ProductSummary>>(() => {
    const latestByKey = new Map<string, PriceEntry>(); // "productId:storeId" → latest entry
    for (const e of allPrices) { // allPrices sorted DESC from API
      const key = `${e.product_id}:${e.store_id}`;
      if (!latestByKey.has(key)) latestByKey.set(key, e);
    }
    const cheapest = new Map<number, ProductSummary>();
    for (const e of latestByKey.values()) {
      const cur = cheapest.get(e.product_id);
      if (!cur || e.price < cur.price) {
        cheapest.set(e.product_id, {
          storeName: e.store?.name ?? `#${e.store_id}`,
          price: e.price,
        });
      }
    }
    return cheapest;
  }, [allPrices]);

  function toggle(id: number) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      saveChecked(next);
      return next;
    });
  }

  function clearChecked() {
    const next = new Set<number>();
    setChecked(next);
    saveChecked(next);
  }

  const q = query.toLowerCase().trim();
  const filtered = q ? products.filter((p) => p.name.toLowerCase().includes(q)) : products;
  const unchecked = filtered.filter((p) => !checked.has(p.id));
  const checkedItems = filtered.filter((p) => checked.has(p.id));
  const estimatedTotal = unchecked.reduce((sum, p) => sum + (productSummary.get(p.id)?.price ?? 0), 0);
  const hasPricedItems = unchecked.some((p) => productSummary.has(p.id));

  if (!ready || loading) return <SkeletonShoppingList />;

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#1a1208]">{t.shoppingList.title}</h1>
          <p className="text-sm text-[#7a6858] mt-1">
            {products.length} {t.shoppingList.subtitle}
          </p>
          {hasPricedItems && (
            <p className="text-sm text-[#7a6858] mt-0.5">
              {t.shoppingList.estimatedTotal}:{" "}
              <span className="font-semibold text-[#1a1208]">฿{estimatedTotal.toFixed(2)}</span>
            </p>
          )}
        </div>
        {checked.size > 0 && (
          <button
            onClick={clearChecked}
            className="text-sm text-[#a0907c] hover:text-rose-500 transition-colors mt-1"
          >
            {t.shoppingList.clearChecked}
          </button>
        )}
      </div>

      <input
        className={inputCls}
        placeholder={t.common.search}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {filtered.length === 0 ? (
        <div className={`${card} px-4 py-16 text-center text-[#a0907c] text-sm`}>
          {query ? t.common.noResults : t.shoppingList.noData}
        </div>
      ) : (
        <div className="space-y-6">
          {unchecked.length > 0 && (
            <div className={`${card} divide-y divide-[#e8dfd5]`}>
              {unchecked.map((p) => (
                <ShoppingItem
                  key={p.id}
                  product={p}
                  summary={productSummary.get(p.id)}
                  isChecked={false}
                  onToggle={() => toggle(p.id)}
                />
              ))}
            </div>
          )}

          {checkedItems.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-[#5c4433] uppercase tracking-wider mb-2">
                {t.shoppingList.inCart} ({checkedItems.length})
              </p>
              <div className={`${card} divide-y divide-[#e8dfd5] opacity-60`}>
                {checkedItems.map((p) => (
                  <ShoppingItem
                    key={p.id}
                    product={p}
                    summary={productSummary.get(p.id)}
                    isChecked={true}
                    onToggle={() => toggle(p.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
