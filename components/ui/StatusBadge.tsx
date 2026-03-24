"use client";
import React from "react";

type Status = "success" | "warning" | "error" | "info" | "neutral";

interface StatusBadgeProps {
  status:  Status;
  label:   string;
  dot?:    boolean;
  size?:   "sm" | "md";
}

const COLORS: Record<Status, { bg: string; text: string; dot: string; border: string }> = {
  success: { bg: "rgba(16,185,129,0.1)",  text: "#10b981", dot: "#10b981", border: "rgba(16,185,129,0.3)"  },
  warning: { bg: "rgba(245,158,11,0.1)",  text: "#f59e0b", dot: "#f59e0b", border: "rgba(245,158,11,0.3)"  },
  error:   { bg: "rgba(239,68,68,0.1)",   text: "#ef4444", dot: "#ef4444", border: "rgba(239,68,68,0.3)"   },
  info:    { bg: "rgba(59,130,246,0.1)",  text: "#3b82f6", dot: "#3b82f6", border: "rgba(59,130,246,0.3)"  },
  neutral: { bg: "rgba(100,116,139,0.1)", text: "#64748b", dot: "#64748b", border: "rgba(100,116,139,0.3)" },
};

export function StatusBadge({ status, label, dot = true, size = "md" }: StatusBadgeProps) {
  const c   = COLORS[status];
  const pad = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold border ${pad}`}
      style={{ backgroundColor: c.bg, color: c.text, borderColor: c.border }}
    >
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ backgroundColor: c.dot }}
        />
      )}
      {label}
    </span>
  );
}
