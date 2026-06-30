"use client";
import { card } from "@/lib/styles";

const pulse = "bg-[#e8dfd5] animate-pulse rounded-md";

function Bar({ w, h = "h-4" }: { w: string; h?: string }) {
  return <div className={`${pulse} ${h} ${w}`} />;
}

function Th({ count }: { count: number }) {
  return (
    <thead>
      <tr className="border-b border-[#d9cfc3] bg-[#f0e7d8]">
        {Array.from({ length: count }).map((_, i) => (
          <th key={i} className="px-4 py-3" />
        ))}
      </tr>
    </thead>
  );
}

// widths[i] = Tailwind w-* class; null = empty cell (actions column)
function Rows({ cols, count = 6 }: { cols: (string | null)[][]; count?: number }) {
  return (
    <tbody>
      {Array.from({ length: count }).map((_, i) => (
        <tr key={i} className="border-b border-[#e8dfd5] last:border-0">
          {cols[i % cols.length].map((w, j) => (
            <td key={j} className="px-4 py-3.5">
              {w && <Bar w={w} />}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

/* ─── Products ─────────────────────────────────────────── */

export function SkeletonProducts() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Bar w="w-28" h="h-8" />
            <Bar w="w-16" />
          </div>
          <Bar w="w-32" h="h-9" />
        </div>
        <Bar w="w-full" h="h-10" />
      </div>
      <div className={`${card} overflow-hidden`}>
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#d9cfc3] bg-[#f0e7d8]">
              {[0, 1, 2, 3, 4, 5].map((i) => <th key={i} className="px-4 py-3" />)}
            </tr>
          </thead>
          <tbody>
            {[
              ["w-3/5", "w-2/5", "w-1/3", "w-20"],
              ["w-full", "w-1/2", "w-1/4", "w-16"],
              ["w-4/5", "w-3/5", "w-2/5", "w-20"],
              ["w-2/3", "w-1/4", "w-1/2", "w-16"],
              ["w-full", "w-2/5", "w-1/3", "w-20"],
              ["w-3/4", "w-1/3", "w-1/4", "w-16"],
            ].map((widths, i) => (
              <tr key={i} className="border-b border-[#e8dfd5] last:border-0">
                <td className="px-3 py-2 w-12">
                  <Bar w="w-10" h="h-10" />
                </td>
                {widths.map((w, j) => (
                  <td key={j} className="px-4 py-3.5">
                    <Bar w={w} />
                  </td>
                ))}
                <td className="px-4 py-3.5" />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Shopping List ──────────────────────────────────────── */

export function SkeletonShoppingList() {
  return (
    <div className="space-y-8 max-w-2xl">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Bar w="w-40" h="h-8" />
          <Bar w="w-16" />
        </div>
      </div>
      <Bar w="w-full" h="h-10" />
      <div className={`${card} divide-y divide-[#e8dfd5]`}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3">
            <Bar w="w-5" h="h-5" />
            <Bar w="w-9" h="h-9" />
            <div className="flex-1 space-y-1.5">
              <Bar w={i % 2 === 0 ? "w-2/5" : "w-1/2"} />
              <Bar w={i % 3 === 0 ? "w-1/3" : "w-1/4"} h="h-3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Stores ────────────────────────────────────────────── */

export function SkeletonStores() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Bar w="w-24" h="h-8" />
            <Bar w="w-16" />
          </div>
          <Bar w="w-28" h="h-9" />
        </div>
        <Bar w="w-full" h="h-10" />
      </div>
      <div className={`${card} overflow-hidden`}>
        <table className="w-full">
          <Th count={3} />
          <Rows
            cols={[
              ["w-1/3", "w-2/3", null],
              ["w-1/2", "w-full", null],
              ["w-2/5", "w-1/2", null],
              ["w-3/5", "w-3/4", null],
              ["w-1/3", "w-2/5", null],
              ["w-1/2", "w-1/3", null],
            ]}
          />
        </table>
      </div>
    </div>
  );
}

/* ─── Purchases ─────────────────────────────────────────── */

export function SkeletonPurchases() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Bar w="w-28" h="h-8" />
            <Bar w="w-44" />
          </div>
          <Bar w="w-36" h="h-9" />
        </div>
        <Bar w="w-full" h="h-10" />
      </div>
      <div className={`${card} overflow-hidden`}>
        <table className="w-full">
          <Th count={8} />
          <Rows
            cols={[
              ["w-2/5", "w-1/3", "w-16", "w-8", "w-16", "w-20", "w-1/4", null],
              ["w-1/2", "w-2/5", "w-20", "w-6", "w-20", "w-24", "w-1/5", null],
              ["w-2/5", "w-1/4", "w-16", "w-8", "w-16", "w-20", "w-0",   null],
              ["w-3/5", "w-1/3", "w-20", "w-6", "w-20", "w-24", "w-1/3", null],
              ["w-1/2", "w-2/5", "w-16", "w-8", "w-16", "w-20", "w-1/4", null],
              ["w-2/5", "w-1/3", "w-20", "w-6", "w-20", "w-24", "w-0",   null],
            ]}
          />
        </table>
      </div>
    </div>
  );
}

/* ─── Dashboard ─────────────────────────────────────────── */

export function SkeletonDashboard() {
  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <Bar w="w-36" h="h-8" />
        <Bar w="w-40" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`${card} p-6 space-y-3`}>
            <Bar w="w-8" h="h-1.5" />
            <Bar w="w-12" h="h-10" />
            <Bar w="w-24" />
          </div>
        ))}
      </div>
      <div className="space-y-4">
        <Bar w="w-40" />
        <div className={`${card} overflow-hidden`}>
          <table className="w-full">
            <Th count={6} />
            <Rows
              cols={[
                ["w-2/5", "w-1/3", "w-16", "w-8", "w-16", "w-20"],
                ["w-1/2", "w-2/5", "w-20", "w-6", "w-20", "w-24"],
                ["w-2/5", "w-1/4", "w-16", "w-8", "w-16", "w-20"],
                ["w-3/5", "w-1/3", "w-20", "w-6", "w-20", "w-24"],
                ["w-1/2", "w-2/5", "w-16", "w-8", "w-16", "w-20"],
              ]}
              count={5}
            />
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─── Product Detail ─────────────────────────────────────── */

export function SkeletonProductDetail() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Bar w="w-20" />
        <Bar w="w-56" h="h-8" />
      </div>
      <div className="border-b border-[#d9cfc3] flex gap-8 pb-3">
        {[0, 1, 2].map((i) => <Bar key={i} w="w-16" />)}
      </div>
      <div className={`${card} overflow-hidden`}>
        <table className="w-full">
          <Th count={5} />
          <Rows
            cols={[
              ["w-1/3", "w-1/4", "w-24", "w-20", null],
              ["w-2/5", "w-1/5", "w-20", "w-24", null],
              ["w-1/3", "w-1/4", "w-24", "w-20", null],
              ["w-1/2", "w-1/5", "w-20", "w-24", null],
              ["w-2/5", "w-1/4", "w-24", "w-20", null],
            ]}
            count={5}
          />
        </table>
      </div>
    </div>
  );
}

/* ─── Household ─────────────────────────────────────────── */

export function SkeletonHousehold() {
  return (
    <div className="space-y-8 max-w-xl">
      <Bar w="w-32" h="h-8" />
      {/* Members card */}
      <div className={`${card} p-6 space-y-5`}>
        <div className="space-y-2">
          <Bar w="w-20" h="h-3" />
          <Bar w="w-48" h="h-5" />
        </div>
        <div className="space-y-2">
          <Bar w="w-20" h="h-3" />
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Bar w="w-7" h="h-7" />
              <Bar w="w-24" />
              <Bar w="w-36" />
            </div>
          ))}
        </div>
        <div className="pt-2 border-t border-[#e8dfd5]">
          <Bar w="w-36" h="h-9" />
        </div>
      </div>
      {/* Join card */}
      <div className={`${card} p-6 space-y-4`}>
        <Bar w="w-32" h="h-5" />
        <div className="flex gap-2">
          <Bar w="w-full" h="h-10" />
          <Bar w="w-20" h="h-10" />
        </div>
      </div>
    </div>
  );
}

/* ─── Admin Users ────────────────────────────────────────── */

export function SkeletonAdminUsers() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Bar w="w-48" h="h-8" />
        <Bar w="w-24" />
      </div>
      <div className={`${card} overflow-x-auto`}>
        <table className="w-full">
          <Th count={6} />
          <Rows
            cols={[
              ["w-1/4", "w-2/5", "w-16", "w-1/3", "w-24", "w-16"],
              ["w-1/3", "w-1/2", "w-12", "w-2/5", "w-20", "w-16"],
              ["w-1/4", "w-2/5", "w-16", "w-1/3", "w-24", "w-16"],
              ["w-2/5", "w-1/3", "w-12", "w-1/4", "w-20", "w-16"],
              ["w-1/4", "w-2/5", "w-16", "w-1/3", "w-24", "w-16"],
              ["w-1/3", "w-1/2", "w-12", "w-2/5", "w-20", "w-16"],
            ]}
          />
        </table>
      </div>
    </div>
  );
}
