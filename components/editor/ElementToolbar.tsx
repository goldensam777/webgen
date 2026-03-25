"use client";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import type { ElementStyle } from "./EditableContext";

interface Props {
  anchorEl: HTMLElement | null;
  elementId: string;
  style: ElementStyle;
  onStyleChange: (s: ElementStyle) => void;
  onClose: () => void;
}

export function ElementToolbar({ anchorEl, elementId, style, onStyleChange, onClose }: Props) {
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!anchorEl) return;
    const update = () => {
      const rect = anchorEl.getBoundingClientRect();
      setPos({
        top:  rect.top + window.scrollY - 60,
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

  const radiusVal  = Math.max(0, parseInt(style.borderRadius ?? "0", 10)  || 0);
  const paddingVal = Math.max(0, parseInt(style.padding      ?? "0", 10)  || 0);
  const opacityVal = style.opacity ? Math.round((parseFloat(style.opacity) || 1) * 100) : 100;

  const sep = (
    <div className="w-px h-4 mx-0.5" style={{ backgroundColor: "var(--wg-border)" }} />
  );

  const content = (
    <div
      data-canvas-toolbar="true"
      style={{ position: "absolute", top: pos.top, left: pos.left, zIndex: 9999 }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div
        className="flex flex-wrap items-center gap-1 px-2 py-1.5 rounded-xl shadow-2xl border"
        style={{ backgroundColor: "var(--wg-bg-2)", borderColor: "var(--wg-border)", maxWidth: 560 }}
      >
        {/* Label */}
        <span className="text-[10px] font-semibold px-1 shrink-0" style={{ color: "var(--wg-text-3)" }}>
          Élément · {elementId}
        </span>

        {sep}

        {/* Background color */}
        <label className="flex items-center gap-1 cursor-pointer shrink-0">
          <span className="text-[10px]" style={{ color: "var(--wg-text-3)" }}>Fond</span>
          <input
            type="color"
            value={style.backgroundColor ?? "#ffffff"}
            onChange={(e) => onStyleChange({ ...style, backgroundColor: e.target.value })}
            className="w-5 h-5 rounded cursor-pointer border-0 p-0"
            style={{ backgroundColor: "transparent" }}
          />
        </label>

        {/* Text color */}
        <label className="flex items-center gap-1 cursor-pointer shrink-0">
          <span className="text-[10px]" style={{ color: "var(--wg-text-3)" }}>Texte</span>
          <input
            type="color"
            value={style.color ?? "#000000"}
            onChange={(e) => onStyleChange({ ...style, color: e.target.value })}
            className="w-5 h-5 rounded cursor-pointer border-0 p-0"
            style={{ backgroundColor: "transparent" }}
          />
        </label>

        {sep}

        {/* Border radius */}
        <label className="flex items-center gap-1 shrink-0">
          <span className="text-[10px]" style={{ color: "var(--wg-text-3)" }}>Radius</span>
          <input
            type="number"
            min={0}
            max={50}
            step={1}
            value={radiusVal}
            onChange={(e) => { const v = parseInt(e.target.value, 10); if (!isNaN(v)) onStyleChange({ ...style, borderRadius: `${v}px` }); }}
            className="w-12 text-xs text-center rounded border px-1 py-0.5 focus:outline-none"
            style={{
              backgroundColor: "var(--wg-bg)",
              borderColor: "var(--wg-border)",
              color: "var(--wg-text)",
            }}
          />
        </label>

        {/* Padding */}
        <label className="flex items-center gap-1 shrink-0">
          <span className="text-[10px]" style={{ color: "var(--wg-text-3)" }}>Padding</span>
          <input
            type="number"
            min={0}
            max={64}
            step={2}
            value={paddingVal}
            onChange={(e) => { const v = parseInt(e.target.value, 10); if (!isNaN(v)) onStyleChange({ ...style, padding: `${v}px` }); }}
            className="w-12 text-xs text-center rounded border px-1 py-0.5 focus:outline-none"
            style={{
              backgroundColor: "var(--wg-bg)",
              borderColor: "var(--wg-border)",
              color: "var(--wg-text)",
            }}
          />
        </label>

        {sep}

        {/* Opacity */}
        <label className="flex items-center gap-1 shrink-0">
          <span className="text-[10px]" style={{ color: "var(--wg-text-3)" }}>Opacité</span>
          <input
            type="number"
            min={0}
            max={100}
            step={5}
            value={opacityVal}
            onChange={(e) => onStyleChange({ ...style, opacity: String(parseInt(e.target.value, 10) / 100) })}
            className="w-12 text-xs text-center rounded border px-1 py-0.5 focus:outline-none"
            style={{
              backgroundColor: "var(--wg-bg)",
              borderColor: "var(--wg-border)",
              color: "var(--wg-text)",
            }}
          />
        </label>

        {sep}

        {/* Mobile toggle */}
        <button
          title={style.hideOnMobile ? "Masquer mobile" : "Visible sur mobile"}
          onClick={() => onStyleChange({ ...style, hideOnMobile: !style.hideOnMobile })}
          className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0 transition-colors"
          style={{
            color:           style.hideOnMobile ? "var(--wg-green)" : "var(--wg-text-3)",
            backgroundColor: style.hideOnMobile ? "var(--wg-green-muted)" : "transparent",
          }}
        >
          {style.hideOnMobile ? (
            /* eye-off */
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
          ) : (
            /* eye */
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
          {style.hideOnMobile ? "Masquer mobile" : "Mobile"}
        </button>

        {sep}

        {/* Reset */}
        <button
          title="Réinitialiser les styles"
          onClick={() => onStyleChange({})}
          className="p-1 rounded transition-colors shrink-0"
          style={{ color: "var(--wg-text-3)" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#ef4444")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--wg-text-3)")}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>

        {/* Close */}
        <button
          title="Fermer"
          onClick={onClose}
          className="p-1 rounded transition-colors shrink-0"
          style={{ color: "var(--wg-text-3)" }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--wg-text)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--wg-text-3)")}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
