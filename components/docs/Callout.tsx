// components/docs/Callout.tsx
import { ReactNode } from "react";

type Variant = "note" | "tip" | "warning" | "danger";

const CONFIG: Record<Variant, { icon: string; label: string; border: string; bg: string; color: string }> = {
  note:    { icon: "ℹ", label: "Note",         border: "#3b82f6", bg: "rgba(59,130,246,0.08)",  color: "#60a5fa" },
  tip:     { icon: "✦", label: "Astuce",        border: "#10b981", bg: "rgba(16,185,129,0.08)", color: "#34d399" },
  warning: { icon: "⚠", label: "Attention",     border: "#f59e0b", bg: "rgba(245,158,11,0.08)", color: "#fbbf24" },
  danger:  { icon: "✕", label: "Important",     border: "#ef4444", bg: "rgba(239,68,68,0.08)",  color: "#f87171" },
};

export function Callout({
  variant = "note",
  children,
}: {
  variant?: Variant;
  children: ReactNode;
}) {
  const c = CONFIG[variant];
  return (
    <div
      className="flex gap-3 rounded-xl px-4 py-3 my-5 text-sm leading-relaxed"
      style={{ backgroundColor: c.bg, borderLeft: `3px solid ${c.border}` }}
    >
      <span className="mt-0.5 shrink-0 text-base leading-none" style={{ color: c.color }}>
        {c.icon}
      </span>
      <div style={{ color: "var(--wg-text-2)" }}>
        <span className="font-semibold mr-1.5" style={{ color: c.color }}>{c.label} —</span>
        {children}
      </div>
    </div>
  );
}
