import React from "react";

type FeedStatus = "success" | "warning" | "error" | "info" | "neutral";

interface FeedItem {
  id:           string;
  title:        string;
  description?: string;
  timestamp:    string;
  status?:      FeedStatus;
  icon?:        React.ReactNode;
}

interface ActivityFeedProps {
  items:      FeedItem[];
  title?:     string;
  maxItems?:  number;
  bgColor?:   string;
}

const STATUS_COLOR: Record<FeedStatus, string> = {
  success: "#10b981",
  warning: "#f59e0b",
  error:   "#ef4444",
  info:    "#3b82f6",
  neutral: "#94a3b8",
};

function relativeTime(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)   return "à l'instant";
  if (m < 60)  return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `il y a ${h}h`;
  const d = Math.floor(h / 24);
  return `il y a ${d}j`;
}

export function ActivityFeed({
  items,
  title    = "Activité récente",
  maxItems = 8,
  bgColor  = "var(--color-surface)",
}: ActivityFeedProps) {
  const visible = items.slice(0, maxItems);

  return (
    <div
      className="rounded-2xl p-5"
      style={{ backgroundColor: bgColor, border: "1px solid var(--color-border)" }}
    >
      {title && (
        <p className="text-sm font-semibold mb-4" style={{ color: "var(--color-text)" }}>
          {title}
        </p>
      )}

      {visible.length === 0 && (
        <p className="text-sm text-center py-8" style={{ color: "var(--color-text-muted)" }}>
          Aucune activité récente.
        </p>
      )}

      <div className="flex flex-col">
        {visible.map((item, i) => {
          const color = STATUS_COLOR[item.status ?? "neutral"];
          const isLast = i === visible.length - 1;

          return (
            <div key={item.id} className="flex gap-3 relative">
              {/* Timeline line */}
              {!isLast && (
                <div
                  className="absolute left-[13px] top-7 bottom-0 w-px"
                  style={{ backgroundColor: "var(--color-border)" }}
                />
              )}

              {/* Dot / icon */}
              <div className="shrink-0 mt-1">
                {item.icon ? (
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${color}18`, color }}
                  >
                    {item.icon}
                  </div>
                ) : (
                  <div
                    className="w-2.5 h-2.5 rounded-full mt-1.5 ml-[5px]"
                    style={{ backgroundColor: color }}
                  />
                )}
              </div>

              {/* Content */}
              <div className={`flex-1 min-w-0 ${isLast ? "pb-0" : "pb-4"}`}>
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium leading-snug" style={{ color: "var(--color-text)" }}>
                    {item.title}
                  </p>
                  <span
                    className="text-[10px] shrink-0 mt-0.5"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {relativeTime(item.timestamp)}
                  </span>
                </div>
                {item.description && (
                  <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
