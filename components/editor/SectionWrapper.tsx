"use client";
import { useState, useEffect, useRef } from "react";

interface SectionWrapperProps {
  isFirst: boolean;
  isLast: boolean;
  isSelected: boolean;
  extraPadding: number;
  onSelect: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  onEdit: () => void;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
  onDragEnd: () => void;
  onExtraPaddingChange: (v: number) => void;
  isDragOver: boolean;
  children: React.ReactNode;
}

export function SectionWrapper({
  isFirst, isLast, isSelected, extraPadding,
  onSelect, onMoveUp, onMoveDown, onRemove, onEdit,
  onDragStart, onDragOver, onDrop, onDragEnd, isDragOver,
  onExtraPaddingChange,
  children,
}: SectionWrapperProps) {
  const [hovered, setHovered] = useState(false);
  const [resizing, setResizing] = useState(false);
  const resizeStartY = useRef(0);
  const resizeStartPad = useRef(0);

  const showToolbar = isSelected || hovered;
  const ringColor   = isSelected ? "#10b981" : "rgba(16,185,129,0.4)";

  useEffect(() => {
    if (!resizing) return;
    const onMove = (e: MouseEvent) => {
      const delta = e.clientY - resizeStartY.current;
      onExtraPaddingChange(Math.max(0, resizeStartPad.current + delta));
    };
    const onUp = () => setResizing(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [resizing, onExtraPaddingChange]);

  return (
    <div
      className={`relative transition-opacity ${isDragOver ? "opacity-50" : ""}`}
      draggable={!resizing}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Outline ring */}
      {(isSelected || hovered) && (
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{ boxShadow: `inset 0 0 0 2px ${ringColor}` }}
        />
      )}

      {/* Floating toolbar */}
      <div
        className="absolute top-3 right-3 z-20 flex items-center gap-0.5 rounded-lg shadow-lg px-1 py-1 border transition-opacity"
        style={{
          backgroundColor: "var(--wg-bg-2)",
          borderColor:     "var(--wg-border)",
          opacity:         showToolbar ? 1 : 0,
          pointerEvents:   showToolbar ? "auto" : "none",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onMoveUp} disabled={isFirst} title="Monter"
          className="p-1.5 rounded transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
          style={{ color: "var(--wg-text-3)" }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--wg-text)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--wg-text-3)")}>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
        <button onClick={onMoveDown} disabled={isLast} title="Descendre"
          className="p-1.5 rounded transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
          style={{ color: "var(--wg-text-3)" }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--wg-text)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--wg-text-3)")}>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div className="w-px h-4 mx-0.5" style={{ backgroundColor: "var(--wg-border)" }} />
        <button onClick={onEdit} title="Éditer le contenu"
          className="p-1.5 rounded transition-colors"
          style={{ color: "var(--wg-text-3)" }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--wg-green)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--wg-text-3)")}>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button onClick={onRemove} title="Supprimer"
          className="p-1.5 rounded transition-colors"
          style={{ color: "var(--wg-text-3)" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#ef4444")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--wg-text-3)")}>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Content with extra padding */}
      <div
        className="wg-editing"
        style={{ paddingTop: extraPadding / 2, paddingBottom: extraPadding / 2 }}
        onClickCapture={isSelected ? (e) => {
          const t = e.target as HTMLElement;
          if (t.isContentEditable) return;
          const link = t.closest("a, button");
          if (link) { e.preventDefault(); e.stopPropagation(); }
        } : undefined}
      >
        {children}
      </div>

      {/* Resize handle — bottom center, only when selected */}
      {isSelected && (
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center"
          style={{ transform: "translateX(-50%)" }}
        >
          {resizing && (
            <div
              className="mb-1 px-2 py-0.5 rounded text-xs font-mono"
              style={{
                backgroundColor: "#10b981",
                color: "#fff",
              }}
            >
              ↕ +{extraPadding}px
            </div>
          )}
          <div
            className="flex items-center gap-1.5 px-3 py-1 rounded-t-lg cursor-ns-resize select-none text-xs font-medium"
            style={{
              backgroundColor: "var(--wg-bg-2)",
              borderColor:     "var(--wg-border)",
              border:          "1px solid",
              borderBottom:    "none",
              color:           "var(--wg-text-3)",
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
              resizeStartY.current   = e.clientY;
              resizeStartPad.current = extraPadding;
              setResizing(true);
            }}
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
            </svg>
            Redimensionner
          </div>
        </div>
      )}
    </div>
  );
}
