"use client";
import React, { useState, useMemo } from "react";

export interface TableColumn {
  key:       string;
  label:     string;
  sortable?: boolean;
  width?:    string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render?:   (value: any, row: Record<string, unknown>) => React.ReactNode;
}

interface DataTableProps {
  columns:       TableColumn[];
  data:          Record<string, unknown>[];
  searchable?:   boolean;
  searchKeys?:   string[];
  pageSize?:     number;
  emptyMessage?: string;
  title?:        string;
  bgColor?:      string;
}

export function DataTable({
  columns,
  data,
  searchable   = true,
  searchKeys,
  pageSize     = 10,
  emptyMessage = "Aucune donnée.",
  title,
  bgColor      = "var(--color-surface)",
}: DataTableProps) {
  const [search,    setSearch]    = useState("");
  const [sortKey,   setSortKey]   = useState<string | null>(null);
  const [sortDir,   setSortDir]   = useState<"asc" | "desc">("asc");
  const [page,      setPage]      = useState(1);

  const searchableKeys = searchKeys ?? columns.map(c => c.key);

  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter(row =>
      searchableKeys.some(k =>
        String(row[k] ?? "").toLowerCase().includes(q)
      )
    );
  }, [data, search, searchableKeys]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const av = String(a[sortKey] ?? "");
      const bv = String(b[sortKey] ?? "");
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paginated  = sorted.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
    setPage(1);
  };

  const handleSearch = (q: string) => { setSearch(q); setPage(1); };

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ backgroundColor: bgColor, border: "1px solid var(--color-border)" }}
    >
      {/* Table header */}
      {(title || searchable) && (
        <div
          className="flex items-center justify-between gap-4 px-5 py-4 border-b"
          style={{ borderColor: "var(--color-border)" }}
        >
          {title && (
            <p className="text-sm font-semibold shrink-0" style={{ color: "var(--color-text)" }}>
              {title}
            </p>
          )}
          {searchable && (
            <div className="relative ml-auto w-48">
              <svg
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
                style={{ color: "var(--color-text-muted)" }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Rechercher…"
                value={search}
                onChange={e => handleSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border text-xs focus:outline-none"
                style={{
                  backgroundColor: "var(--color-background)",
                  borderColor:     "var(--color-border)",
                  color:           "var(--color-text)",
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
              {columns.map(col => (
                <th
                  key={col.key}
                  className={`px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide
                    ${col.sortable ? "cursor-pointer select-none" : ""}`}
                  style={{ color: "var(--color-text-muted)", width: col.width }}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && sortKey === col.key && (
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d={sortDir === "asc" ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                      </svg>
                    )}
                    {col.sortable && sortKey !== col.key && (
                      <svg className="w-3 h-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m10 4v12" />
                      </svg>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-5 py-10 text-center text-sm"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginated.map((row, i) => (
                <tr
                  key={i}
                  style={{ borderBottom: "1px solid var(--color-border)" }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = "var(--color-background)")}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  {columns.map(col => (
                    <td
                      key={col.key}
                      className="px-5 py-3"
                      style={{ color: "var(--color-text)" }}
                    >
                      {col.render
                        ? col.render(row[col.key], row)
                        : String(row[col.key] ?? "—")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          className="flex items-center justify-between px-5 py-3 border-t text-xs"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
        >
          <span>
            {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, sorted.length)} sur {sorted.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-2 py-1 rounded border disabled:opacity-40"
              style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
            >←</button>
            <span className="px-2">{page} / {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-2 py-1 rounded border disabled:opacity-40"
              style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
            >→</button>
          </div>
        </div>
      )}
    </div>
  );
}
