// components/editor/SectionPanel.tsx
"use client";
import { useState } from "react";
import { useSiteStore, useActivePage } from "@/app/store/siteStore";

const ALL_SECTIONS = [
  "navbar", "hero", "stats", "features",
  "testimonials", "pricing", "faq", "cta", "contact", "footer"
];

const SECTION_LABELS: Record<string, string> = {
  navbar:       "Navigation",
  hero:         "Accueil",
  stats:        "Statistiques",
  features:     "Fonctionnalités",
  testimonials: "Témoignages",
  pricing:      "Tarifs",
  faq:          "FAQ",
  cta:          "Appel à l'action",
  contact:      "Contact",
  footer:       "Pied de page",
};

export function SectionPanel() {
  const { addSection, removeSection, reorderSections } = useSiteStore();
  const activePage = useActivePage();
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOver, setDragOver]  = useState<string | null>(null);

  if (!activePage) return null;

  const available = ALL_SECTIONS.filter(s => !activePage.sections.includes(s));

  const handleDragStart = (s: string) => setDragging(s);
  const handleDragOver  = (e: React.DragEvent, s: string) => { e.preventDefault(); setDragOver(s); };
  const handleDrop = (target: string) => {
    if (!dragging || dragging === target) { setDragging(null); setDragOver(null); return; }
    const next = [...activePage.sections];
    const from = next.indexOf(dragging);
    const to   = next.indexOf(target);
    next.splice(from, 1);
    next.splice(to, 0, dragging);
    reorderSections(next);
    setDragging(null); setDragOver(null);
  };

  return (
    <div className="flex flex-col gap-1">

      {/* Sections actives */}
      <p
        className="text-xs font-semibold uppercase tracking-wide px-4 pt-4 pb-2"
        style={{ color: "var(--wg-text-3)" }}
      >
        Sections actives
      </p>

      {activePage.sections.map((s) => (
        <div
          key={s}
          draggable
          onDragStart={() => handleDragStart(s)}
          onDragOver={(e) => handleDragOver(e, s)}
          onDrop={() => handleDrop(s)}
          onDragEnd={() => { setDragging(null); setDragOver(null); }}
          className="flex items-center justify-between px-4 py-2 rounded-lg mx-1
            cursor-grab active:cursor-grabbing transition-colors"
          style={{
            backgroundColor: dragOver === s ? "var(--wg-green-muted)" : "transparent",
            border:           dragOver === s ? "1px solid var(--wg-green)"  : "1px solid transparent",
            opacity:          dragging === s ? 0.4 : 1,
          }}
          onMouseEnter={e => {
            if (dragOver !== s) e.currentTarget.style.backgroundColor = "var(--wg-bg-3)";
          }}
          onMouseLeave={e => {
            if (dragOver !== s) e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" style={{ color: "var(--wg-text-3)" }}
              fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
            </svg>
            <span className="text-sm" style={{ color: "var(--wg-text)" }}>
              {SECTION_LABELS[s] ?? s}
            </span>
          </div>
          <button
            onClick={() => removeSection(s)}
            className="transition-colors"
            style={{ color: "var(--wg-text-3)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#ef4444")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--wg-text-3)")}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}

      {/* Sections disponibles */}
      {available.length > 0 && (
        <>
          <p
            className="text-xs font-semibold uppercase tracking-wide px-4 pt-4 pb-2"
            style={{ color: "var(--wg-text-3)" }}
          >
            Ajouter
          </p>
          {available.map((s) => (
            <button
              key={s}
              onClick={() => addSection(s)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg mx-1
                text-left transition-colors group"
              style={{ color: "var(--wg-text-2)" }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = "var(--wg-green-muted)";
                e.currentTarget.style.color = "var(--wg-green)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "var(--wg-text-2)";
              }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-sm">{SECTION_LABELS[s] ?? s}</span>
            </button>
          ))}
        </>
      )}
    </div>
  );
}
