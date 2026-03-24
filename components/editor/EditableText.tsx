"use client";
import { useRef, useEffect, useState } from "react";
import { useEditable } from "./EditableContext";
import { FloatingToolbar } from "./FloatingToolbar";

interface Props {
  field: string;
  value: string;
}

export function EditableText({ field, value }: Props) {
  const { isEditing, fieldStyles, onUpdate, onStyleUpdate } = useEditable();
  const ref = useRef<HTMLSpanElement>(null);
  const [focused, setFocused] = useState(false);

  const customStyle = fieldStyles[field] ?? {};

  useEffect(() => {
    if (ref.current && document.activeElement !== ref.current) {
      ref.current.textContent = value;
    }
  }, [value]);

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
        anchorEl={focused ? ref.current : null}
        field={field}
        style={customStyle}
        onStyleChange={(s) => onStyleUpdate(field, s)}
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
        onFocus={() => setFocused(true)}
        onBlur={(e) => {
          setFocused(false);
          onUpdate(field, e.currentTarget.textContent ?? "");
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") { e.preventDefault(); e.currentTarget.blur(); }
          if (e.key === "Escape") {
            e.currentTarget.textContent = value;
            e.currentTarget.blur();
          }
        }}
      >
        {value}
      </span>
    </>
  );
}
