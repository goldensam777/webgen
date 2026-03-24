"use client";
import { useState, useRef } from "react";
import { useEditable } from "./EditableContext";
import { ElementToolbar } from "./ElementToolbar";
import type { ElementStyle } from "./EditableContext";

interface Props {
  id: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function CanvasElement({ id, children, className, style: externalStyle }: Props) {
  const { isEditing, canvasMode, elementStyles, onElementStyleUpdate } = useEditable();
  const [selected, setSelected] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const elStyle: ElementStyle = elementStyles[id] ?? {};

  // Build CSS from elementStyle
  const appliedStyle: React.CSSProperties = {};
  if (elStyle.backgroundColor) appliedStyle.backgroundColor = elStyle.backgroundColor;
  if (elStyle.color)            appliedStyle.color            = elStyle.color;
  if (elStyle.borderRadius)     appliedStyle.borderRadius     = elStyle.borderRadius;
  if (elStyle.padding)          appliedStyle.padding          = elStyle.padding;
  if (elStyle.fontWeight)       appliedStyle.fontWeight       = elStyle.fontWeight;
  if (elStyle.fontSize)         appliedStyle.fontSize         = elStyle.fontSize;
  if (elStyle.opacity !== undefined) appliedStyle.opacity     = Number(elStyle.opacity);

  const hideClass  = elStyle.hideOnMobile ? "wg-hide-mobile" : "";
  const hasStyles  = Object.keys(appliedStyle).length > 0;
  const mergedStyle = { ...externalStyle, ...appliedStyle };
  const cx = [className, hideClass].filter(Boolean).join(" ") || undefined;

  // Non-editing or canvasMode off: just apply styles if any, otherwise fragment
  if (!isEditing || !canvasMode) {
    if (!hasStyles && !hideClass) return <>{children}</>;
    return <div className={cx} style={mergedStyle}>{children}</div>;
  }

  // Canvas mode active: selectable element
  return (
    <>
      <ElementToolbar
        anchorEl={selected ? ref.current : null}
        elementId={id}
        style={elStyle}
        onStyleChange={(s) => onElementStyleUpdate(id, s)}
        onClose={() => setSelected(false)}
      />
      <div
        ref={ref}
        className={cx}
        style={{
          ...mergedStyle,
          outline: selected
            ? "2px solid #10b981"
            : "1.5px dashed rgba(16,185,129,0.35)",
          outlineOffset: "3px",
          borderRadius: elStyle.borderRadius ?? "4px",
          cursor: "pointer",
          transition: "outline 0.1s",
        }}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelected(s => !s); }}
      >
        {children}
      </div>
    </>
  );
}
