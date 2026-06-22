"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { card, th, td } from "@/lib/styles";
import type { Product, Purchase, Store } from "@/lib/types";
import Link from "next/link";
import { useLocale } from "@/components/locale-provider";
import { useRequireAuth } from "@/lib/use-require-auth";

export default function Dashboard() {
  const { t } = useLocale();
  const { ready } = useRequireAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;
    Promise.all([api.products.list(), api.stores.list(), api.purchases.list()])
      .then(([p, s, pu]) => { setProducts(p); setStores(s); setPurchases(pu); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [ready]);

  const totalSpend = purchases.reduce((sum, p) => sum + p.price * p.quantity, 0);
  const recent = purchases.slice(0, 5);

  if (!ready || loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-[#a0907c] text-sm">{t.common.loading}</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#1a1208]">{t.dashboard.title}</h1>
        <p className="text-sm text-[#9c8c7c] mt-1">Personal price tracker</p>
      </div>

      <div className="grid grid-cols-3 gap-5">
        <StatCard
          label={t.nav.products}
          value={products.length}
          href="/products"
          color="bg-[#b07040]"
          emptyHint={products.length === 0 ? "Add your first product" : undefined}
        />
        <StatCard
          label={t.nav.stores}
          value={stores.length}
          href="/stores"
          color="bg-[#c8a46a]"
          emptyHint={stores.length === 0 ? "Add your first store" : undefined}
        />
        <StatCard
          label={t.nav.purchases}
          value={purchases.length}
          href="/purchases"
          color="bg-[#7a9060]"
          sub={purchases.length > 0 ? `฿${totalSpend.toLocaleString("th-TH", { minimumFractionDigits: 2 })} ${t.dashboard.totalSuffix}` : undefined}
        />
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold text-[#a0907c] uppercase tracking-wider">
            {t.dashboard.recentPurchases}
          </h2>
          {recent.length > 0 && (
            <Link href="/purchases" className="text-xs font-medium text-[#b07040] hover:text-[#8f5a32] transition-colors">
              {t.dashboard.viewAll}
            </Link>
          )}
        </div>

        {recent.length === 0 ? (
          <div className={`${card} p-10 text-center`}>
            <p className="text-[#a0907c] text-sm">{t.dashboard.noData}</p>
            <Link href="/purchases" className="mt-2 inline-block text-sm text-[#b07040] font-medium hover:text-[#8f5a32] transition-colors">
              {t.dashboard.recordLink}
            </Link>
          </div>
        ) : (
          <div className={`${card} overflow-hidden`}>
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#e8dfd5] bg-[#faf5ef]">
                  <th className={th}>{t.dashboard.col.product}</th>
                  <th className={th}>{t.dashboard.col.store}</th>
                  <th className={th}>{t.dashboard.col.price}</th>
                  <th className={th}>{t.dashboard.col.qty}</th>
                  <th className={th}>{t.dashboard.col.total}</th>
                  <th className={th}>{t.dashboard.col.date}</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((p) => (
                  <tr key={String(p.id)} className="border-b border-[#f0e9e0] last:border-0 hover:bg-[#fdf9f5] transition-colors">
                    <td className={`${td} font-medium text-[#1a1208]`}>{p.product?.name ?? `#${p.product_id}`}</td>
                    <td className={`${td} text-[#7a6858]`}>{p.store?.name ?? `#${p.store_id}`}</td>
                    <td className={`${td} text-[#4a3728]`}>฿{p.price.toFixed(2)}</td>
                    <td className={`${td} text-[#7a6858]`}>{p.quantity}</td>
                    <td className={`${td} font-semibold text-[#1a1208]`}>฿{(p.price * p.quantity).toFixed(2)}</td>
                    <td className={`${td} text-[#a0907c]`}>{new Date(p.purchased_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value, href, color, sub, emptyHint }: {
  label: string; value: number; href: string;
  color: string; sub?: string; emptyHint?: string;
}) {
  return (
    <Link
      href={href}
      className={`${card} p-6 group hover:border-[#d4c9bc] transition-all duration-150`}
    >
      <div className={`w-8 h-1 rounded-full ${color} mb-4 group-hover:w-12 transition-all duration-200`} />
      <div className="text-4xl font-bold tracking-tight text-[#1a1208]">{value}</div>
      <div className="text-sm font-medium text-[#7a6858] mt-1">{label}</div>
      {sub && <div className="text-xs text-[#a0907c] mt-1">{sub}</div>}
      {emptyHint && <div className="text-xs text-[#b07040] mt-1">{emptyHint}</div>}
    </Link>
  );
}
