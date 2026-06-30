import { useState } from "react";

export function useSearchPagination<T>(
  items: T[],
  filter: (item: T, query: string) => boolean,
  pageSize = 20
) {
  const [query, setQueryRaw] = useState("");
  const [page, setPage] = useState(1);

  const filtered = query.trim()
    ? items.filter((item) => filter(item, query.toLowerCase().trim()))
    : items;

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const slice = filtered.slice(start, start + pageSize);

  function setQuery(q: string) {
    setQueryRaw(q);
    setPage(1);
  }

  return {
    query,
    setQuery,
    page: safePage,
    setPage,
    totalPages,
    slice,
    total: filtered.length,
    totalUnfiltered: items.length,
    from: filtered.length === 0 ? 0 : start + 1,
    to: Math.min(start + pageSize, filtered.length),
  };
}
