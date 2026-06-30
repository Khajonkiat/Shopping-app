"use client";

interface PaginationProps {
  page: number;
  totalPages: number;
  from: number;
  to: number;
  total: number;
  onPage: (p: number) => void;
}

function pageRange(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "…", total];
  if (current >= total - 3) return [1, "…", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "…", current - 1, current, current + 1, "…", total];
}

export function Pagination({ page, totalPages, from, to, total, onPage }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = pageRange(page, totalPages);
  const base = "inline-flex items-center justify-center w-8 h-8 text-sm rounded-lg transition-colors";

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-[#e8dfd5]">
      <p className="text-xs text-[#a0907c]">{from}–{to} of {total}</p>
      <div className="flex items-center gap-1">
        <button
          className={`${base} ${page <= 1 ? "text-[#c4b5a5] cursor-not-allowed" : "text-[#4a3728] hover:bg-[#f0e7d8]"}`}
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
          aria-label="Previous page"
        >
          ‹
        </button>
        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`e${i}`} className="text-xs text-[#a0907c] w-8 text-center select-none">…</span>
          ) : (
            <button
              key={p}
              className={`${base} ${p === page ? "bg-[#b07040] text-white font-medium" : "text-[#4a3728] hover:bg-[#f0e7d8]"}`}
              onClick={() => onPage(p as number)}
            >
              {p}
            </button>
          )
        )}
        <button
          className={`${base} ${page >= totalPages ? "text-[#c4b5a5] cursor-not-allowed" : "text-[#4a3728] hover:bg-[#f0e7d8]"}`}
          disabled={page >= totalPages}
          onClick={() => onPage(page + 1)}
          aria-label="Next page"
        >
          ›
        </button>
      </div>
    </div>
  );
}
