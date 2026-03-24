"use client";
import React, { useMemo } from "react";

interface MiniChartProps {
  data:        number[];
  labels?:     string[];
  type?:       "line" | "bar";
  color?:      string;
  height?:     number;
  showGrid?:   boolean;
  showLabels?: boolean;
  title?:      string;
  subtitle?:   string;
  bgColor?:    string;
  filled?:     boolean;
}

export function MiniChart({
  data = [],
  labels,
  type       = "line",
  color      = "var(--color-primary)",
  height     = 120,
  showGrid   = true,
  showLabels = false,
  title,
  subtitle,
  bgColor    = "var(--color-surface)",
  filled     = true,
}: MiniChartProps) {
  const W = 400;
  const H = height;
  const PAD = { top: 8, right: 8, bottom: showLabels ? 24 : 8, left: 8 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top  - PAD.bottom;

  const { points, path, fillPath } = useMemo(() => {
    if (!data.length) return { min: 0, max: 1, points: [], path: "", fillPath: "" };
    const mn  = Math.min(...data);
    const mx  = Math.max(...data);
    const rng = mx - mn || 1;

    const pts = data.map((v, i) => ({
      x: PAD.left + (i / Math.max(data.length - 1, 1)) * chartW,
      y: PAD.top  + chartH - ((v - mn) / rng) * chartH,
    }));

    const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
    const f = d
      + ` L${pts[pts.length - 1].x.toFixed(1)},${(PAD.top + chartH).toFixed(1)}`
      + ` L${pts[0].x.toFixed(1)},${(PAD.top + chartH).toFixed(1)} Z`;

    return { min: mn, max: mx, points: pts, path: d, fillPath: f };
  }, [data, chartW, chartH, PAD.left, PAD.top]);

  if (!data.length) return null;

  const gradId = `grad-${Math.random().toString(36).slice(2, 7)}`;

  return (
    <div
      className="rounded-2xl p-5"
      style={{ backgroundColor: bgColor, border: "1px solid var(--color-border)" }}
    >
      {(title || subtitle) && (
        <div className="mb-3">
          {title && (
            <p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>{title}</p>
          )}
          {subtitle && (
            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>{subtitle}</p>
          )}
        </div>
      )}

      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="w-full"
        style={{ height }}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0"    />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {showGrid && [0.25, 0.5, 0.75, 1].map((t) => (
          <line
            key={t}
            x1={PAD.left} y1={PAD.top + chartH * (1 - t)}
            x2={PAD.left + chartW} y2={PAD.top + chartH * (1 - t)}
            stroke="var(--color-border)" strokeWidth="1" strokeDasharray="4 4"
          />
        ))}

        {type === "line" && (
          <>
            {filled && <path d={fillPath} fill={`url(#${gradId})`} />}
            <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            {points.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r="3" fill={color} stroke="white" strokeWidth="1.5" />
            ))}
          </>
        )}

        {type === "bar" && (() => {
          const mn   = Math.min(...data);
          const mx   = Math.max(...data);
          const rng  = mx - mn || 1;
          const n    = data.length;
          const gap  = 4;
          const bw   = (chartW - gap * (n - 1)) / n;
          return data.map((v, i) => {
            const bh = ((v - mn) / rng) * chartH;
            return (
              <rect
                key={i}
                x={PAD.left + i * (bw + gap)}
                y={PAD.top + chartH - bh}
                width={bw}
                height={bh}
                rx="3"
                fill={color}
                opacity="0.85"
              />
            );
          });
        })()}

        {/* X-axis labels */}
        {showLabels && labels && labels.map((lbl, i) => {
          const x = PAD.left + (i / Math.max(data.length - 1, 1)) * chartW;
          return (
            <text
              key={i}
              x={x} y={H - 4}
              textAnchor="middle"
              fontSize="10"
              fill="var(--color-text-muted)"
            >
              {lbl}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
