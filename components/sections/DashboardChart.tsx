import React from "react";
import { MiniChart } from "../ui/MiniChart";

interface DashboardChartProps {
  title?:      string;
  subtitle?:   string;
  data:        number[];
  labels?:     string[];
  type?:       "line" | "bar";
  color?:      string;
  height?:     number;
  bgColor?:    string;
  summaryItems?: { label: string; value: string }[];
}

export function DashboardChart({
  title,
  subtitle,
  data     = [],
  labels,
  type     = "line",
  color    = "var(--color-primary)",
  height   = 160,
  bgColor  = "var(--color-surface)",
  summaryItems,
}: DashboardChartProps) {
  return (
    <section className="py-8 px-6" style={{ backgroundColor: bgColor }}>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-start">
          <MiniChart
            data={data}
            labels={labels}
            type={type}
            color={color}
            height={height}
            title={title}
            subtitle={subtitle}
            showGrid
            showLabels={!!labels}
            filled
          />
          {summaryItems && summaryItems.length > 0 && (
            <div
              className="rounded-2xl p-5 flex flex-col gap-4 min-w-[160px]"
              style={{ backgroundColor: "var(--color-background)", border: "1px solid var(--color-border)" }}
            >
              {summaryItems.map((item, i) => (
                <div key={i}>
                  <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{item.label}</p>
                  <p className="text-xl font-bold mt-0.5" style={{ color: "var(--color-text)" }}>{item.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
