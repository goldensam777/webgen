"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useEditable } from "./EditableContext";
import { ElementToolbar } from "./ElementToolbar";
import type { ElementStyle } from "./EditableContext";
import { useHydrated } from "@/lib/use-hydrated";

interface Props {
  id: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

function buildAppliedStyle(elStyle: ElementStyle): React.CSSProperties {
  const s: React.CSSProperties = {};
  if (elStyle.backgroundColor) s.backgroundColor = elStyle.backgroundColor;
  if (elStyle.color)            s.color           = elStyle.color;
  if (elStyle.borderRadius)     s.borderRadius    = elStyle.borderRadius;
  if (elStyle.padding)          s.padding         = elStyle.padding;
  if (elStyle.fontWeight)       s.fontWeight      = elStyle.fontWeight;
  if (elStyle.fontSize)         s.fontSize        = elStyle.fontSize;
  if (elStyle.opacity)          s.opacity         = Number(elStyle.opacity);
  return s;
}

export function CanvasElement({ id, children, className, style: externalStyle }: Props) {
  const { isEditing, canvasMode, elementStyles, onElementStyleUpdate } = useEditable();
  const [hovered,  setHovered]  = useState(false);
  const [selected, setSelected] = useState(false);
  const [rect,     setRect]     = useState<DOMRect | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [childRadius, setChildRadius] = useState("4px");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const hydrated = useHydrated();

  const elStyle     = elementStyles[id] ?? {};
  const appliedStyle = buildAppliedStyle(elStyle);
  const hasStyles   = Object.keys(appliedStyle).length > 0;
  const hideClass   = elStyle.hideOnMobile ? "wg-hide-mobile" : "";
  const mergedStyle = { ...externalStyle, ...appliedStyle };
  const cx = [className, hideClass].filter(Boolean).join(" ") || undefined;

  /* ── Rect tracking pour l'overlay portal ── */
  const updateRect = useCallback(() => {
    const child = wrapperRef.current?.firstElementChild as HTMLElement | null;
    if (!child) {
      setAnchorEl(null);
      return;
    }
    setAnchorEl(child);
    setRect(child.getBoundingClientRect());
    setChildRadius(getComputedStyle(child).borderRadius || "4px");
  }, []);

  useEffect(() => {
    if (!isEditing || !canvasMode || (!hovered && !selected)) return;
    let frame = 0;
    const syncRect = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateRect);
    };
    syncRect();
    window.addEventListener("scroll",  syncRect, true);
    window.addEventListener("resize",  syncRect);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll",  syncRect, true);
      window.removeEventListener("resize",  syncRect);
    };
  }, [isEditing, canvasMode, hovered, selected, updateRect]);

  /* ── Fermer la sélection au clic extérieur ── */
  useEffect(() => {
    if (!selected) return;
    const onOutside = (e: MouseEvent) => {
      // Ne pas désélectionner si le clic est dans un toolbar portal
      if ((e.target as HTMLElement).closest("[data-canvas-toolbar]")) return;
      if (!wrapperRef.current?.contains(e.target as Node)) setSelected(false);
    };
    window.addEventListener("mousedown", onOutside);
    return () => window.removeEventListener("mousedown", onOutside);
  }, [selected]);

  /* ── Mode non-canvas : zéro overhead ── */
  if (!isEditing || !canvasMode) {
    if (!hasStyles && !hideClass) return <>{children}</>;
    return <div className={cx} style={mergedStyle}>{children}</div>;
  }

  /* ── Mode canvas : wrapper display:contents + overlay portal ── */

  // Injecter les styles directement dans l'enfant (si c'est un ReactElement)
  let styledChildren = children;
  if (hasStyles) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const only = React.Children.only(children) as React.ReactElement<any>;
      styledChildren = React.cloneElement(only, {
        style:     { ...(only.props.style ?? {}), ...appliedStyle },
        className: [only.props.className, hideClass].filter(Boolean).join(" ") || undefined,
      });
    } catch {
      // Multiple children — on ne peut pas cloneElement, on ignore
      styledChildren = children;
    }
  }

  const showOverlay = hydrated && rect && (hovered || selected);

  return (
    <>
      {/* Wrapper display:contents — totalement transparent pour le layout */}
      <div
        ref={wrapperRef}
        data-canvas-el={id}
        style={{ display: "contents" }}
        onMouseEnter={() => { setHovered(true); updateRect(); }}
        onMouseLeave={() => setHovered(false)}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setSelected(s => !s);
          updateRect();
        }}
      >
        {styledChildren}
      </div>

      {/* Overlay portal — épouse exactement la forme de l'élément */}
      {showOverlay && createPortal(
        <div
          style={{
            position:    "fixed",
            top:         rect!.top    - 3,
            left:        rect!.left   - 3,
            width:       rect!.width  + 6,
            height:      rect!.height + 6,
            border:      selected
              ? "2px solid #10b981"
              : "1.5px dashed rgba(16,185,129,0.6)",
            borderRadius: childRadius,
            pointerEvents: "none",
            zIndex:       9998,
            boxSizing:    "border-box",
            transition:   "border 0.1s",
          }}
        />,
        document.body
      )}

      {/* Toolbar */}
      {selected && anchorEl && (
        <ElementToolbar
          anchorEl={anchorEl}
          elementId={id}
          style={elStyle}
          onStyleChange={(s) => onElementStyleUpdate(id, s)}
          onClose={() => setSelected(false)}
        />
      )}
    </>
  );
}
