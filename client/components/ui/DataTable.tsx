// client/components/ui/DataTable.tsx
"use client";

import React, { useState, useMemo } from "react";

export interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
  align?: "left" | "center" | "right";
}

interface DataTableProps<T> {
  title: string;
  columns: Column<T>[];
  data: T[];
  pageSize?: number;
  searchable?: boolean;
  searchPlaceholder?: string;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
}

export function DataTable<T extends Record<string, any>>({
  title,
  columns,
  data,
  pageSize = 5,
  searchable = true,
  searchPlaceholder = "Search",
  onEdit,
  onDelete,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const showActionCol = Boolean(onEdit || onDelete);

  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter((row) =>
      Object.values(row).some((v) => String(v).toLowerCase().includes(q))
    );
  }, [data, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const pageNumbers = useMemo(() => {
    const nums: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) nums.push(i);
    } else {
      nums.push(1, 2, 3, 4, 5, "...", totalPages);
    }
    return nums;
  }, [totalPages]);

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        padding: "24px 0 0",
        boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
        marginTop: 24,
        overflow: "hidden",
      }}
    >
      {/* Title + Search row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 24px 16px",
        }}
      >
        <h3 style={{ fontWeight: 700, fontSize: 17, margin: 0 }}>{title}</h3>
        {searchable && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "#f5f5f5",
                borderRadius: 20,
                padding: "6px 14px",
              }}
            >
              <span style={{ color: "#aaa", fontSize: 14 }}>🔍</span>
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder={searchPlaceholder}
                style={{
                  border: "none",
                  background: "transparent",
                  outline: "none",
                  fontSize: 13,
                  width: 160,
                  color: "#333",
                }}
              />
            </div>
            {["⚡", "↕", "⋯"].map((icon, i) => (
              <button
                key={i}
                style={{
                  background: "#f5f5f5",
                  border: "none",
                  borderRadius: 8,
                  padding: "6px 10px",
                  cursor: "pointer",
                  fontSize: 14,
                  color: "#555",
                }}
              >
                {icon}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ background: "#fef9e7" }}>
              <th style={{ padding: "12px 24px", textAlign: "left", fontWeight: 700, color: "#555", fontSize: 13 }}>
                No.
              </th>
              {columns.map((col, colIdx) => (
                <th
                  key={`th-${String(col.key)}-${colIdx}`}
                  style={{
                    padding: "12px 16px",
                    textAlign: col.align || "left",
                    fontWeight: 700,
                    color: "#555",
                    fontSize: 13,
                    whiteSpace: "nowrap",
                  }}
                >
                  {col.label}
                </th>
              ))}
              {/* Action column — แสดงเฉพาะตอนมี handler */}
              {showActionCol && (
                <th style={{ padding: "12px 24px", textAlign: "center", fontWeight: 700, color: "#555", fontSize: 13 }}>
                  Action
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (showActionCol ? 2 : 1)}
                  style={{ textAlign: "center", padding: 32, color: "#aaa" }}
                >
                  No data found
                </td>
              </tr>
            ) : (
              paged.map((row, idx) => (
                <tr
                  key={idx}
                  style={{ borderBottom: "1px solid #f0f0f0", transition: "background 0.1s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#fafafa")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                >
                  <td style={{ padding: "14px 24px", color: "#555" }}>
                    {(page - 1) * pageSize + idx + 1}
                  </td>
                  {columns.map((col, colIdx) => (
                    <td
                      key={`td-${String(col.key)}-${colIdx}`}
                      style={{
                        padding: "14px 16px",
                        color: "#222",
                        textAlign: col.align || "left",
                      }}
                    >
                      {col.render ? col.render(row) : String(row[col.key as string] ?? "-")}
                    </td>
                  ))}
                  {showActionCol && (
                    <td style={{ padding: "14px 24px", textAlign: "center" }}>
                      <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                        {onEdit && (
                          <button
                            onClick={() => onEdit(row)}
                            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#888", padding: 2 }}
                            title="Edit"
                          >
                            ✏️
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(row)}
                            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#888", padding: 2 }}
                            title="Delete"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 24px",
            borderTop: "1px solid #f0f0f0",
          }}
        >
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{
              background: "none", border: "none",
              cursor: page === 1 ? "not-allowed" : "pointer",
              color: page === 1 ? "#ccc" : "#555",
              fontWeight: 600, fontSize: 13,
            }}
          >
            ← Previous
          </button>

          <div style={{ display: "flex", gap: 4 }}>
            {pageNumbers.map((n, i) =>
              n === "..." ? (
                <span key={i} style={{ padding: "4px 8px", color: "#aaa" }}>...</span>
              ) : (
                <button
                  key={i}
                  onClick={() => setPage(n as number)}
                  style={{
                    width: 32, height: 32, borderRadius: 8, border: "none",
                    background: page === n ? "#f5c518" : "transparent",
                    color: page === n ? "#111" : "#555",
                    fontWeight: page === n ? 700 : 400,
                    cursor: "pointer", fontSize: 13,
                  }}
                >
                  {n}
                </button>
              )
            )}
          </div>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={{
              background: "none", border: "none",
              cursor: page === totalPages ? "not-allowed" : "pointer",
              color: page === totalPages ? "#ccc" : "#555",
              fontWeight: 600, fontSize: 13,
            }}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}