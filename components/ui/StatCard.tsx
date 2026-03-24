import React from "react";

type Color = "green" | "blue" | "amber" | "red" | "purple" | "teal";

interface StatCardProps {
  label:      string;
  value:      string | number;
  icon?:      React.ReactNode;
  trend?:     { value: number; label?: string };
  color?:     Color;
  bgColor?:   string;
  textColor?: string;
}

const ACCENT: Record<Color, string> = {
  green:  "#10b981",
  blue:   "#3b82f6",
  amber:  "#f59e0b",
  red:    "#ef4444",
  purple: "#8b5cf6",
  teal:   "#14b8a6",
};

export function StatCard({
  label, value, icon, trend,
  color     = "green",
  bgColor   = "var(--color-surface)",
  textColor = "var(--color-text)",
}: StatCardProps) {
  const accent    = ACCENT[color];
  const trendUp   = trend && trend.value >= 0;
  const trendColor = trendUp ? "#10b981" : "#ef4444";

  return (
    <div
      className="relative rounded-2xl p-5 overflow-hidden"
      style={{ backgroundColor: bgColor, border: `1px solid var(--color-border)` }}
    >
      {/* Accent top bar */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5"
        style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p
            className="text-xs font-semibold uppercase tracking-wide mb-1 truncate"
            style={{ color: "var(--color-text-muted)" }}
          >
            {label}
          </p>
          <p
            className="text-3xl font-bold leading-none"
            style={{ color: textColor }}
          >
            {value}
          </p>

          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <svg
                className="w-3.5 h-3.5 shrink-0"
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
                style={{ color: trendColor }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                  d={trendUp ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
              </svg>
              <span className="text-xs font-semibold" style={{ color: trendColor }}>
                {trendUp ? "+" : ""}{trend.value}%
              </span>
              {trend.label && (
                <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                  {trend.label}
                </span>
              )}
            </div>
          )}
        </div>

        {icon && (
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${accent}18`, color: accent }}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
