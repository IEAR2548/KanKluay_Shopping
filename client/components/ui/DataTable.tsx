"use client";

// client/components/ui/DataTable.tsx

import React, { useState, useRef, useEffect, useMemo } from "react";

export interface Column<T> {
  key: keyof T | string;
  label: string;
  align?: "left" | "center" | "right";
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T extends Record<string, unknown>> {
  title?: string;
  columns: Column<T>[];
  data: T[];
  pageSize?: number;
  searchable?: boolean;
  searchPlaceholder?: string;
}

// ─── Export CSV Helper ────────────────────────────────────────

function exportCSV<T extends Record<string, unknown>>(
  data: T[],
  columns: Column<T>[],
  filename = "export.csv"
) {
  const header = columns.map((c) => c.label).join(",");
  const rows = data.map((row) =>
    columns
      .map((col) => {
        const val = col.render
          ? String(col.render(row) ?? "")
          : String(row[col.key as keyof T] ?? "");
        // escape commas/quotes
        return `"${val.replace(/"/g, '""')}"`;
      })
      .join(",")
  );
  const csv = [header, ...rows].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Dropdown Portal (renders inline, no portal needed) ───────

interface DropdownProps {
  children: React.ReactNode;
  onClose: () => void;
}

function Dropdown({ children, onClose }: DropdownProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        top: "calc(100% + 6px)",
        right: 0,
        background: "#fff",
        border: "1px solid #e8e8e8",
        borderRadius: 12,
        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        zIndex: 200,
        minWidth: 170,
        overflow: "hidden",
        animation: "dropIn 0.15s ease",
      }}
    >
      {children}
      <style>{`
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ─── Main DataTable ───────────────────────────────────────────

export function DataTable<T extends Record<string, unknown>>({
  title,
  columns,
  data,
  pageSize = 10,
  searchable = false,
  searchPlaceholder = "Search…",
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // ── Quick Filter (limit rows)
  const [quickLimit, setQuickLimit] = useState<number | null>(null);
  const [showQuickMenu, setShowQuickMenu] = useState(false);

  // ── Column Toggle
  const [hiddenCols, setHiddenCols] = useState<Set<string>>(new Set());
  const [showColMenu, setShowColMenu] = useState(false);

  // ── Export Menu
  const [showExportMenu, setShowExportMenu] = useState(false);

  const quickBtnRef = useRef<HTMLDivElement>(null);
  const colBtnRef = useRef<HTMLDivElement>(null);
  const exportBtnRef = useRef<HTMLDivElement>(null);

  // Visible columns
  const visibleColumns = columns.filter((c) => !hiddenCols.has(String(c.key)));

  // Filter data by search
  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter((row) =>
      visibleColumns.some((col) => {
        const val = col.render
          ? String(col.render(row) ?? "")
          : String(row[col.key as keyof T] ?? "");
        return val.toLowerCase().includes(q);
      })
    );
  }, [data, search, visibleColumns]);

  // Apply quick limit
  const limited = quickLimit !== null ? filtered.slice(0, quickLimit) : filtered;

  // Pagination
  const totalPages = Math.max(1, Math.ceil(limited.length / pageSize));
  const paginated = limited.slice((page - 1) * pageSize, page * pageSize);

  // Reset page when data/filter changes
  useEffect(() => { setPage(1); }, [search, quickLimit, data]);

  const toggleCol = (key: string) => {
    setHiddenCols((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handlePrint = () => {
    const printContent = `
      <html><head><title>Export</title>
      <style>
        body { font-family: sans-serif; font-size: 13px; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
        th { background: #f5c518; font-weight: 700; }
        tr:nth-child(even) { background: #fafafa; }
      </style></head><body>
      <h2>${title || "Report"}</h2>
      <table>
        <thead><tr>${visibleColumns.map((c) => `<th>${c.label}</th>`).join("")}</tr></thead>
        <tbody>
          ${limited
            .map(
              (row) =>
                `<tr>${visibleColumns
                  .map((col) => {
                    const val = col.render
                      ? String(col.render(row) ?? "")
                      : String(row[col.key as keyof T] ?? "");
                    return `<td>${val}</td>`;
                  })
                  .join("")}</tr>`
            )
            .join("")}
        </tbody>
      </table>
      </body></html>
    `;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(printContent);
    win.document.close();
    win.print();
  };

  // ── Styles
  const btnStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 32,
    height: 32,
    borderRadius: 8,
    border: "1px solid #e8e8e8",
    background: "#fff",
    cursor: "pointer",
    fontSize: 14,
    color: "#555",
    transition: "background 0.15s, border-color 0.15s",
    flexShrink: 0,
  };

  const menuItemStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 16px",
    cursor: "pointer",
    fontSize: 13,
    color: "#333",
    transition: "background 0.12s",
    whiteSpace: "nowrap",
  };

  return (
    <div style={{ background: "#fff", borderRadius: 16, padding: "20px 0 0" }}>
      {/* ── Toolbar ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: 8,
          padding: "0 20px 14px",
          flexWrap: "wrap",
        }}
      >
        {/* Search */}
        {searchable && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginRight: "auto" }}>
            <span style={{ color: "#aaa", fontSize: 14 }}>🔍</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              style={{
                border: "1px solid #e8e8e8",
                borderRadius: 8,
                padding: "6px 12px",
                fontSize: 13,
                outline: "none",
                width: 180,
                background: "#fafafa",
                color: "#333",
              }}
            />
          </div>
        )}

        {/* ── ⚡ Quick Filter Button ── */}
        <div ref={quickBtnRef} style={{ position: "relative" }}>
          <button
            title="Quick Filter"
            onClick={() => {
              setShowQuickMenu((v) => !v);
              setShowColMenu(false);
              setShowExportMenu(false);
            }}
            style={{
              ...btnStyle,
              background: quickLimit !== null ? "#fff8d6" : "#fff",
              borderColor: quickLimit !== null ? "#f5c518" : "#e8e8e8",
              color: quickLimit !== null ? "#b8860b" : "#555",
            }}
          >
            ⚡
          </button>
          {showQuickMenu && (
            <Dropdown onClose={() => setShowQuickMenu(false)}>
              <div style={{ padding: "8px 0" }}>
                <div style={{ padding: "6px 16px 6px", fontSize: 11, color: "#aaa", fontWeight: 700, letterSpacing: 1 }}>
                  QUICK FILTER
                </div>
                {[
                  { label: "Show Top 5", value: 5 },
                  { label: "Show Top 10", value: 10 },
                  { label: "Show Top 20", value: 20 },
                  { label: "Show All", value: null },
                ].map((opt) => (
                  <div
                    key={String(opt.value)}
                    onClick={() => {
                      setQuickLimit(opt.value);
                      setShowQuickMenu(false);
                    }}
                    style={{
                      ...menuItemStyle,
                      background: quickLimit === opt.value ? "#fffbea" : "transparent",
                      fontWeight: quickLimit === opt.value ? 700 : 400,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f9f9f9")}
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background =
                        quickLimit === opt.value ? "#fffbea" : "transparent")
                    }
                  >
                    <span style={{ fontSize: 15 }}>
                      {opt.value === null ? "🔓" : "🏆"}
                    </span>
                    {opt.label}
                    {quickLimit === opt.value && (
                      <span style={{ marginLeft: "auto", color: "#f5c518" }}>✓</span>
                    )}
                  </div>
                ))}
              </div>
            </Dropdown>
          )}
        </div>

        {/* ── ⋮ Column Toggle Button ── */}
        <div ref={colBtnRef} style={{ position: "relative" }}>
          <button
            title="Toggle Columns"
            onClick={() => {
              setShowColMenu((v) => !v);
              setShowQuickMenu(false);
              setShowExportMenu(false);
            }}
            style={{
              ...btnStyle,
              background: hiddenCols.size > 0 ? "#fff8d6" : "#fff",
              borderColor: hiddenCols.size > 0 ? "#f5c518" : "#e8e8e8",
              color: hiddenCols.size > 0 ? "#b8860b" : "#555",
            }}
          >
            ⋮
          </button>
          {showColMenu && (
            <Dropdown onClose={() => setShowColMenu(false)}>
              <div style={{ padding: "8px 0" }}>
                <div style={{ padding: "6px 16px 6px", fontSize: 11, color: "#aaa", fontWeight: 700, letterSpacing: 1 }}>
                  TOGGLE COLUMNS
                </div>
                {columns.map((col) => {
                  const key = String(col.key);
                  const hidden = hiddenCols.has(key);
                  return (
                    <div
                      key={key}
                      onClick={() => toggleCol(key)}
                      style={{ ...menuItemStyle }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f9f9f9")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <span
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: 4,
                          border: `2px solid ${hidden ? "#ddd" : "#f5c518"}`,
                          background: hidden ? "#fff" : "#f5c518",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 11,
                          flexShrink: 0,
                          transition: "all 0.15s",
                        }}
                      >
                        {!hidden && "✓"}
                      </span>
                      {col.label}
                    </div>
                  );
                })}
                {hiddenCols.size > 0 && (
                  <>
                    <div style={{ borderTop: "1px solid #f0f0f0", margin: "6px 0" }} />
                    <div
                      onClick={() => {
                        setHiddenCols(new Set());
                        setShowColMenu(false);
                      }}
                      style={{ ...menuItemStyle, color: "#f5c518", fontWeight: 600 }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#fffbea")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <span>↺</span> Reset Columns
                    </div>
                  </>
                )}
              </div>
            </Dropdown>
          )}
        </div>

        {/* ── ⋯ Export Button ── */}
        <div ref={exportBtnRef} style={{ position: "relative" }}>
          <button
            title="Export / More"
            onClick={() => {
              setShowExportMenu((v) => !v);
              setShowQuickMenu(false);
              setShowColMenu(false);
            }}
            style={btnStyle}
          >
            ⋯
          </button>
          {showExportMenu && (
            <Dropdown onClose={() => setShowExportMenu(false)}>
              <div style={{ padding: "8px 0" }}>
                <div style={{ padding: "6px 16px 6px", fontSize: 11, color: "#aaa", fontWeight: 700, letterSpacing: 1 }}>
                  EXPORT
                </div>
                <div
                  onClick={() => {
                    exportCSV(limited, visibleColumns, `${title || "report"}.csv`);
                    setShowExportMenu(false);
                  }}
                  style={menuItemStyle}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f9f9f9")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <span style={{ fontSize: 16 }}>📄</span> Export as CSV
                </div>
                <div
                  onClick={() => {
                    handlePrint();
                    setShowExportMenu(false);
                  }}
                  style={menuItemStyle}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f9f9f9")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <span style={{ fontSize: 16 }}>🖨️</span> Print Table
                </div>
                <div style={{ borderTop: "1px solid #f0f0f0", margin: "6px 0" }} />
                <div style={{ padding: "4px 16px 8px", fontSize: 12, color: "#aaa" }}>
                  {limited.length} rows · {visibleColumns.length} columns
                </div>
              </div>
            </Dropdown>
          )}
        </div>
      </div>

      {/* ── Table ── */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ background: "#fffbea" }}>
              <th
                style={{
                  padding: "10px 20px",
                  textAlign: "left",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#888",
                  width: 48,
                }}
              >
                No.
              </th>
              {visibleColumns.map((col) => (
                <th
                  key={String(col.key)}
                  style={{
                    padding: "10px 16px",
                    textAlign: col.align || "left",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#888",
                    whiteSpace: "nowrap",
                  }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td
                  colSpan={visibleColumns.length + 1}
                  style={{ textAlign: "center", padding: "40px 20px", color: "#bbb", fontSize: 14 }}
                >
                  No data found
                </td>
              </tr>
            ) : (
              paginated.map((row, idx) => (
                <tr
                  key={idx}
                  style={{
                    borderBottom: "1px solid #f5f5f5",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#fafafa")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: "12px 20px", color: "#999", fontSize: 13 }}>
                    {(page - 1) * pageSize + idx + 1}
                  </td>
                  {visibleColumns.map((col) => (
                    <td
                      key={String(col.key)}
                      style={{
                        padding: "12px 16px",
                        textAlign: col.align || "left",
                        color: "#222",
                        fontWeight: col.align === "right" ? 600 : 400,
                      }}
                    >
                      {col.render ? col.render(row) : String(row[col.key as keyof T] ?? "")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 6,
            padding: "14px 20px",
            borderTop: "1px solid #f5f5f5",
          }}
        >
          <span style={{ fontSize: 12, color: "#aaa", marginRight: 8 }}>
            {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, limited.length)} of {limited.length}
          </span>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                border: "none",
                background: p === page ? "#f5c518" : "transparent",
                color: p === page ? "#111" : "#666",
                fontWeight: p === page ? 700 : 400,
                cursor: "pointer",
                fontSize: 13,
                transition: "background 0.15s",
              }}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}