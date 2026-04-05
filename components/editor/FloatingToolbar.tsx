// components/editor/FloatingToolbar.tsx
"use client";
import { useEffect, useState, useRef } from "react";

interface FieldStyle {
  fontWeight?: string;
  fontStyle?: string;
  textDecoration?: string;
  color?: string;
}

interface Props {
  anchorEl:   HTMLElement | null;
  field?: string;
  style?: FieldStyle;
  onStyleChange?: (s: FieldStyle) => void;
  hrefField?: string;
  hrefValue?: string;
  onHrefChange?: (f: string, v: string) => void;
  onToolbarMouseDown?: () => void;
  onToolbarBlur?: () => void;
  onBold?:    () => void;
  onItalic?:  () => void;
  onLink?:    () => void;
  onClose?:    () => void;
}

export function FloatingToolbar({ anchorEl, onBold, onItalic, onLink, onClose }: Props) {
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const toolbarRef    = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!anchorEl) return;
    const rect = anchorEl.getBoundingClientRect();
    setPos({
      top:  rect.top - 50,
      left: rect.left + rect.width / 2,
    });
  }, [anchorEl]);

  if (!anchorEl) return null;

  return (
    <div
      ref={toolbarRef}
      className="fixed z-[1000] -translate-x-1/2 flex items-center gap-1 p-1.5 glass rounded-2xl border shadow-2xl animate-in fade-in zoom-in duration-200"
      style={{ 
        top: pos.top, 
        left: pos.left,
        borderColor: "var(--wg-border)",
        backgroundColor: "rgba(var(--wg-bg-2-rgb), 0.9)"
      }}
    >
      <ToolbarBtn onClick={onBold} title="Gras (⌘B)">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" /></svg>
      </ToolbarBtn>
      <ToolbarBtn onClick={onItalic} title="Italique (⌘I)">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 20l4-16m-9 16h5m2-16h5" /></svg>
      </ToolbarBtn>
      <div className="w-px h-4 bg-slate-200 dark:bg-white/10 mx-1" />
      <ToolbarBtn onClick={onLink} title="Lien (⌘K)">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
      </ToolbarBtn>
      <div className="w-px h-4 bg-slate-200 dark:bg-white/10 mx-1" />
      <ToolbarBtn onClick={onClose} className="text-red-500 hover:bg-red-500/10">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      </ToolbarBtn>
    </div>
  );
}

function ToolbarBtn({ children, onClick, title, className = "" }: { children: React.ReactNode; onClick?: () => void; title?: string; className?: string }) {
  return (
    <button
      onClick={e => { e.stopPropagation(); onClick?.(); }}
      title={title}
      className={`p-2 rounded-xl transition-all duration-200 hover:bg-slate-100 dark:hover:bg-white/5 opacity-70 hover:opacity-100 ${className}`}
    >
      {children}
    </button>
  );
}
