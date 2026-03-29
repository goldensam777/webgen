"use client";
import { useRef, useState, useEffect } from "react";
import { useEditable } from "./EditableContext";
import { FloatingToolbar } from "./FloatingToolbar";

interface Props {
  field:      string;
  value:      string;
  hrefField?: string;
  hrefValue?: string;
}

export function EditableText({ field, value, hrefField, hrefValue }: Props) {
  const { isEditing, fieldStyles, onUpdate, onStyleUpdate } = useEditable();
  const ref              = useRef<HTMLSpanElement>(null);
  const [focused, setFocused] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLSpanElement | null>(null);

  /* ── Close-lifecycle refs (never stale, no re-render cost) ── */
  const pendingTextRef   = useRef("");
  const closeTimerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const preventCloseRef  = useRef(false);   // toolbar mousedown sets this BEFORE span blur fires

  const customStyle = fieldStyles[field] ?? {};

  useEffect(() => {
    if (ref.current && document.activeElement !== ref.current) {
      ref.current.textContent = value;
    }
  }, [value]);

  /* ── Toolbar interaction signals ── */

  // Called from toolbar onMouseDown — fires before span onBlur
  const onToolbarMouseDown = () => {
    preventCloseRef.current = true;
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  // Called from toolbar onBlur (focus truly left the toolbar to outside)
  const onToolbarBlur = () => {
    preventCloseRef.current = false;
    setFocused(false);
    setAnchorEl(null);
    onUpdate(field, pendingTextRef.current);
  };

  /* ── Span blur handling ── */

  const onSpanBlur = (text: string) => {
    pendingTextRef.current = text;
    if (preventCloseRef.current) {
      // Toolbar intercepted — don't close, reset flag
      preventCloseRef.current = false;
      return;
    }
    // Normal blur (clicked outside) — close after current event finishes
    closeTimerRef.current = setTimeout(() => {
      setFocused(false);
      setAnchorEl(null);
      onUpdate(field, pendingTextRef.current);
    }, 0);
  };

  /* ── Styles ── */
  const appliedStyle: React.CSSProperties = {};
  if (customStyle.fontSize)   appliedStyle.fontSize   = customStyle.fontSize;
  if (customStyle.fontWeight) appliedStyle.fontWeight = customStyle.fontWeight;
  const hasCustomStyle = Object.keys(appliedStyle).length > 0;

  if (!isEditing) {
    return hasCustomStyle ? <span style={appliedStyle}>{value}</span> : <>{value}</>;
  }

  return (
    <>
      <FloatingToolbar
        anchorEl={focused ? anchorEl : null}
        field={field}
        style={customStyle}
        onStyleChange={(s) => onStyleUpdate(field, s)}
        hrefField={hrefField}
        hrefValue={hrefValue}
        onHrefChange={(f, v) => onUpdate(f, v)}
        onToolbarMouseDown={onToolbarMouseDown}
        onToolbarBlur={onToolbarBlur}
      />
      <span
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        style={{
          ...appliedStyle,
          outline:         focused ? "2px solid #10b981" : "1.5px dashed rgba(16,185,129,0.5)",
          outlineOffset:   "2px",
          borderRadius:    "3px",
          cursor:          "text",
          minWidth:        "1em",
          display:         "inline",
          whiteSpace:      "pre-wrap",
          backgroundColor: focused ? "rgba(16,185,129,0.06)" : "transparent",
          transition:      "outline 0.1s, background-color 0.1s",
        }}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); e.currentTarget.focus(); }}
        onFocus={(e) => { setFocused(true); setAnchorEl(e.currentTarget); }}
        onBlur={(e)   => onSpanBlur(e.currentTarget.textContent ?? "")}
        onKeyDown={(e) => {
          if (e.key === "Enter")  { e.preventDefault(); e.currentTarget.blur(); }
          if (e.key === "Escape") { e.currentTarget.textContent = value; e.currentTarget.blur(); }
        }}
      >
        {value}
      </span>
    </>
  );
}
