// components/editor/SectionPanel.tsx
"use client";
import { useState } from "react";
import { useSiteStore } from "@/app/store/siteStore";

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
  const { config, addSection, removeSection, reorderSections } = useSiteStore();
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOver, setDragOver]  = useState<string | null>(null);

  if (!config) return null;

  const available = ALL_SECTIONS.filter(
    (s) => !config.sections.includes(s)
  );

  const handleDragStart = (s: string) => setDragging(s);
  const handleDragOver  = (e: React.DragEvent, s: string) => {
    e.preventDefault();
    setDragOver(s);
  };
  const handleDrop = (target: string) => {
    if (!dragging || dragging === target) {
      setDragging(null); setDragOver(null); return;
    }
    const next = [...config.sections];
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
      <p className="text-xs font-semibold uppercase tracking-wide
        text-gray-400 px-4 pt-4 pb-2">
        Sections actives
      </p>
      {config.sections.map((s) => (
        <div
          key={s}
          draggable
          onDragStart={() => handleDragStart(s)}
          onDragOver={(e) => handleDragOver(e, s)}
          onDrop={() => handleDrop(s)}
          onDragEnd={() => { setDragging(null); setDragOver(null); }}
          className={`flex items-center justify-between px-4 py-2
            rounded-lg mx-1 cursor-grab active:cursor-grabbing
            transition-colors
            ${dragOver === s ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50"}
            ${dragging === s ? "opacity-40" : ""}`}
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-300" fill="none"
              viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round"
                strokeWidth={2} d="M4 8h16M4 16h16" />
            </svg>
            <span className="text-sm text-gray-700">
              {SECTION_LABELS[s] ?? s}
            </span>
          </div>
          <button
            onClick={() => removeSection(s)}
            className="text-gray-300 hover:text-red-400 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round"
                strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}

      {/* Sections disponibles */}
      {available.length > 0 && (
        <>
          <p className="text-xs font-semibold uppercase tracking-wide
            text-gray-400 px-4 pt-4 pb-2">
            Ajouter
          </p>
          {available.map((s) => (
            <button
              key={s}
              onClick={() => addSection(s)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg mx-1
                hover:bg-blue-50 text-left transition-colors group"
            >
              <svg className="w-4 h-4 text-gray-300 group-hover:text-blue-500
                transition-colors" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round"
                  strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-sm text-gray-600 group-hover:text-blue-600">
                {SECTION_LABELS[s] ?? s}
              </span>
            </button>
          ))}
        </>
      )}
    </div>
  );
}