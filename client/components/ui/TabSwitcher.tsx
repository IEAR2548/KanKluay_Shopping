// client/components/ui/TabSwitcher.tsx
"use client";

import React, { useState } from "react";

interface Tab {
  key: string;
  label: string;
  badge?: string | number;
}

interface TabSwitcherProps {
  tabs: Tab[];
  defaultTab?: string;
  children: (activeTab: string) => React.ReactNode;
}

export function TabSwitcher({ tabs, defaultTab, children }: TabSwitcherProps) {
  const [active, setActive] = useState(defaultTab || tabs[0]?.key);

  return (
    <div>
      {/* Tab buttons */}
      <div style={{ display: "flex", gap: 0, marginBottom: 0 }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            style={{
              padding: "10px 22px",
              border: "none",
              borderRadius: "10px 10px 0 0",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: 14,
              background: active === tab.key ? "#f5c518" : "#f0f0f0",
              color: active === tab.key ? "#111" : "#888",
              transition: "all 0.15s",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {tab.label}
            {tab.badge !== undefined && (
              <span
                style={{
                  background: active === tab.key ? "#111" : "#ccc",
                  color: active === tab.key ? "#f5c518" : "#fff",
                  borderRadius: 10,
                  padding: "1px 7px",
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ marginTop: -1 }}>{children(active)}</div>
    </div>
  );
}