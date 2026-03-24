"use client";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import type { FieldStyle } from "./EditableContext";

const FIELD_LABELS: Record<string, string> = {
  title: "Titre", subtitle: "Sous-titre", description: "Description",
  badgeLabel: "Badge", ctaLabel: "Bouton", secondaryCtaLabel: "Bouton 2",
  logo: "Logo", copyright: "Copyright",
};

interface Props {
  anchorEl: HTMLElement | null;
  field: string;
  style: FieldStyle;
  onStyleChange: (s: FieldStyle) => void;
}

export function FloatingToolbar({ anchorEl, field, style, onStyleChange }: Props) {
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

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
    const observer = new ResizeObserver(update);
    observer.observe(anchorEl);
    window.addEventListener("scroll", update, true);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", update, true);
    };
  }, [anchorEl]);

  if (!mounted || !anchorEl) return null;

  const currentSize = style.fontSize
    ? parseInt(style.fontSize, 10)
    : Math.round(parseFloat(getComputedStyle(anchorEl).fontSize));
  const isBold = style.fontWeight === "bold" || style.fontWeight === "700";

  const setSize = (delta: number) => {
    onStyleChange({ ...style, fontSize: `${Math.max(10, Math.min(120, currentSize + delta))}px` });
  };

  return createPortal(
    <div
      style={{ position: "absolute", top: pos.top, left: pos.left, zIndex: 9999 }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <div
        className="flex items-center gap-1 px-2 py-1.5 rounded-xl shadow-2xl border"
        style={{ backgroundColor: "var(--wg-bg-2)", borderColor: "var(--wg-border)" }}
      >
        <span className="text-[10px] font-semibold px-1" style={{ color: "var(--wg-text-3)" }}>
          {FIELD_LABELS[field] ?? field}
        </span>

        <div className="w-px h-4 mx-1" style={{ backgroundColor: "var(--wg-border)" }} />

        <button
          className="w-6 h-6 flex items-center justify-center rounded text-xs font-bold"
          style={{ color: "var(--wg-text-2)" }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = "var(--wg-bg-3)")}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
          onClick={() => setSize(-2)}
          title="Réduire"
        >A<sub>−</sub></button>

        <span className="w-10 text-center text-xs font-mono select-none" style={{ color: "var(--wg-text)" }}>
          {currentSize}px
        </span>

        <button
          className="w-6 h-6 flex items-center justify-center rounded text-xs font-bold"
          style={{ color: "var(--wg-text-2)" }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = "var(--wg-bg-3)")}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
          onClick={() => setSize(2)}
          title="Agrandir"
        >A<sup>+</sup></button>

        <div className="w-px h-4 mx-1" style={{ backgroundColor: "var(--wg-border)" }} />

        <button
          className="w-6 h-6 flex items-center justify-center rounded text-sm font-bold"
          style={{
            color:           isBold ? "var(--wg-green)" : "var(--wg-text-2)",
            backgroundColor: isBold ? "var(--wg-green-muted)" : "transparent",
          }}
          onMouseEnter={e => { if (!isBold) e.currentTarget.style.backgroundColor = "var(--wg-bg-3)"; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = isBold ? "var(--wg-green-muted)" : "transparent"; }}
          onClick={() => onStyleChange({ ...style, fontWeight: isBold ? "normal" : "bold" })}
          title="Gras"
        >B</button>
      </div>
    </div>,
    document.body
  );
}
