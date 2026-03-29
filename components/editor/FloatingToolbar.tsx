"use client";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import type { FieldStyle } from "./EditableContext";
import { useHydrated } from "@/lib/use-hydrated";

const FIELD_LABELS: Record<string, string> = {
  title: "Titre", subtitle: "Sous-titre", description: "Description",
  badgeLabel: "Badge", ctaLabel: "Bouton", secondaryCtaLabel: "Bouton 2",
  logo: "Logo", copyright: "Copyright",
};

interface Props {
  anchorEl:           HTMLElement | null;
  field:              string;
  style:              FieldStyle;
  onStyleChange:      (s: FieldStyle) => void;
  hrefField?:         string;
  hrefValue?:         string;
  onHrefChange?:      (field: string, value: string) => void;
  onToolbarMouseDown: () => void;   // fires BEFORE span blur — blocks close
  onToolbarBlur:      () => void;   // fires when focus truly leaves toolbar
}

export function FloatingToolbar({
  anchorEl, field, style, onStyleChange,
  hrefField, hrefValue = "",
  onHrefChange,
  onToolbarMouseDown, onToolbarBlur,
}: Props) {
  const [pos,       setPos]       = useState({ top: 0, left: 0 });
  const [localHref, setLocalHref] = useState(hrefValue);
  const hydrated = useHydrated();

  useEffect(() => { setLocalHref(hrefValue); }, [hrefValue]);

  useEffect(() => {
    if (!anchorEl) return;
    const update = () => {
      const rect = anchorEl.getBoundingClientRect();
      setPos({
        top:  rect.top + window.scrollY - 52,
        left: Math.max(8, rect.left + window.scrollX),
      });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(anchorEl);
    window.addEventListener("scroll", update, true);
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", update, true);
    };
  }, [anchorEl]);

  if (!hydrated || !anchorEl) return null;

  const currentSize = style.fontSize
    ? parseInt(style.fontSize, 10)
    : Math.round(parseFloat(getComputedStyle(anchorEl).fontSize));
  const isBold = style.fontWeight === "bold" || style.fontWeight === "700";

  const setSize = (delta: number) =>
    onStyleChange({ ...style, fontSize: `${Math.max(10, Math.min(120, currentSize + delta))}px` });

  const saveHref = () => {
    if (onHrefChange && hrefField) onHrefChange(hrefField, localHref);
  };

  return createPortal(
    <div
      style={{ position: "absolute", top: pos.top, left: pos.left, zIndex: 9999 }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => {
        e.stopPropagation();
        onToolbarMouseDown();   // ← signal BEFORE browser fires blur on span
      }}
      onBlur={(e) => {
        // Only fire when focus truly leaves the toolbar (not between children)
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          onToolbarBlur();
        }
      }}
    >
      <div
        className="flex items-center gap-1 px-2 py-1.5 rounded-xl shadow-2xl border"
        style={{ backgroundColor: "var(--wg-bg-2)", borderColor: "var(--wg-border)" }}
      >
        {/* Label */}
        <span className="text-[10px] font-semibold px-1 shrink-0" style={{ color: "var(--wg-text-3)" }}>
          {FIELD_LABELS[field] ?? field}
        </span>

        <Divider />

        {/* A− */}
        <ToolBtn title="Réduire" onMouseDown={(e) => e.preventDefault()} onClick={() => setSize(-2)}>
          A<sub>−</sub>
        </ToolBtn>

        <span className="w-10 text-center text-xs font-mono select-none shrink-0" style={{ color: "var(--wg-text)" }}>
          {currentSize}px
        </span>

        {/* A+ */}
        <ToolBtn title="Agrandir" onMouseDown={(e) => e.preventDefault()} onClick={() => setSize(2)}>
          A<sup>+</sup>
        </ToolBtn>

        <Divider />

        {/* Gras */}
        <ToolBtn
          title="Gras"
          active={isBold}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onStyleChange({ ...style, fontWeight: isBold ? "normal" : "bold" })}
        >
          B
        </ToolBtn>

        {/* Lien */}
        {hrefField && (
          <>
            <Divider />
            <svg
              width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="var(--wg-text-3)" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round"
              className="shrink-0" aria-hidden
            >
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            <input
              type="text"
              value={localHref}
              onChange={(e) => setLocalHref(e.target.value)}
              onBlur={saveHref}
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === "Enter")  { e.preventDefault(); saveHref(); (e.target as HTMLInputElement).blur(); }
                if (e.key === "Escape") { setLocalHref(hrefValue); (e.target as HTMLInputElement).blur(); }
              }}
              placeholder="https://..."
              spellCheck={false}
              className="text-xs font-mono outline-none bg-transparent border-b"
              style={{
                width: "160px",
                color: "var(--wg-text)",
                borderColor: "var(--wg-border)",
                caretColor:  "var(--wg-green)",
              }}
            />
          </>
        )}
      </div>
    </div>,
    document.body
  );
}

/* ── Sous-composants ─────────────────────────────────────── */

function Divider() {
  return <div className="w-px h-4 mx-1 shrink-0" style={{ backgroundColor: "var(--wg-border)" }} />;
}

interface ToolBtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

function ToolBtn({ active, children, style: s, ...rest }: ToolBtnProps) {
  return (
    <button
      type="button"
      className="w-6 h-6 flex items-center justify-center rounded text-xs font-bold shrink-0"
      style={{
        color:           active ? "var(--wg-green)"       : "var(--wg-text-2)",
        backgroundColor: active ? "var(--wg-green-muted)" : "transparent",
        ...s,
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.backgroundColor = "var(--wg-bg-3)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = active ? "var(--wg-green-muted)" : "transparent"; }}
      {...rest}
    >
      {children}
    </button>
  );
}
