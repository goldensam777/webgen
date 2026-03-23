// components/editor/EditorLayout.tsx
"use client";
import { useState } from "react";
import { StylePanel } from "./StylePanel";
import { SectionPanel } from "./SectionPanel";
import { SectionWrapper } from "./SectionWrapper";
import { ContentPanel } from "./ContentPanel";
import { useSiteStore } from "@/app/store/siteStore";
import {
  Navbar, Hero, Features, Pricing, FAQ, Footer,
  Stats, Testimonials, CTA, Contact,
} from "@/components";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SECTION_MAP: Record<string, React.ComponentType<any>> = {
  navbar:       Navbar,
  hero:         Hero,
  features:     Features,
  stats:        Stats,
  testimonials: Testimonials,
  pricing:      Pricing,
  faq:          FAQ,
  cta:          CTA,
  contact:      Contact,
  footer:       Footer,
};

type Tab = "sections" | "styles";

export function EditorLayout() {
  const { config, removeSection, reorderSections } = useSiteStore();
  const [tab, setTab]                         = useState<Tab>("sections");
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [editingSection, setEditingSection]   = useState<string | null>(null);
  const [dragging, setDragging]               = useState<string | null>(null);
  const [dragOver, setDragOver]               = useState<string | null>(null);

  if (!config) return null;

  // ── section move helpers ─────────────────────────────────────────────────

  const moveUp = (section: string) => {
    const arr = [...config.sections];
    const i = arr.indexOf(section);
    if (i <= 0) return;
    [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
    reorderSections(arr);
  };

  const moveDown = (section: string) => {
    const arr = [...config.sections];
    const i = arr.indexOf(section);
    if (i >= arr.length - 1) return;
    [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
    reorderSections(arr);
  };

  const handleDrop = (target: string) => {
    if (!dragging || dragging === target) { setDragging(null); setDragOver(null); return; }
    const next = [...config.sections];
    const from = next.indexOf(dragging);
    const to   = next.indexOf(target);
    next.splice(from, 1);
    next.splice(to, 0, dragging);
    reorderSections(next);
    setDragging(null);
    setDragOver(null);
  };

  const handleEdit = (section: string) => {
    setEditingSection(section);
    setSelectedSection(section);
  };

  // ── render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex h-[calc(100vh-56px)] overflow-hidden">

      {/* ── Sidebar ────────────────────────────────────────────────────── */}
      <aside
        className="w-64 shrink-0 flex flex-col overflow-visible border-r"
        style={{ backgroundColor: "var(--wg-bg-2)", borderColor: "var(--wg-border)" }}
      >
        {editingSection ? (
          <ContentPanel
            section={editingSection}
            onBack={() => setEditingSection(null)}
          />
        ) : (
          <>
            <div className="flex shrink-0 border-b" style={{ borderColor: "var(--wg-border)" }}>
              {(["sections", "styles"] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className="flex-1 py-3 text-xs font-semibold uppercase tracking-wide transition-colors"
                  style={tab === t
                    ? { color: "var(--wg-green)", borderBottom: "2px solid var(--wg-green)" }
                    : { color: "var(--wg-text-3)" }
                  }
                >
                  {t === "sections" ? "Sections" : "Styles"}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto overflow-x-visible pb-4">
              {tab === "sections" && <SectionPanel />}
              {tab === "styles"   && <StylePanel />}
            </div>
          </>
        )}
      </aside>

      {/* ── Preview ────────────────────────────────────────────────────── */}
      <main
        className="flex-1 overflow-y-auto"
        style={{ backgroundColor: "var(--wg-bg-3)" }}
        onClick={() => setSelectedSection(null)}
      >
        <div
          className="min-h-full shadow-sm"
          style={{
            backgroundColor:      "var(--wg-bg-2)",
            "--color-primary":    config.theme.primary,
            "--color-secondary":  config.theme.secondary,
            "--color-background": config.theme.background,
            "--color-surface":    config.theme.surface,
            "--color-text":       config.theme.text,
            "--color-text-muted": config.theme.textMuted,
            "--color-border":     config.theme.border,
          } as React.CSSProperties}
        >
          {config.sections.map((section, index) => {
            const Component = SECTION_MAP[section];
            const data      = config.data[section] ?? {};
            if (!Component) return null;

            return (
              <SectionWrapper
                key={section}
                isFirst={index === 0}
                isLast={index === config.sections.length - 1}
                isSelected={selectedSection === section}
                onSelect={() => setSelectedSection(section)}
                onMoveUp={() => moveUp(section)}
                onMoveDown={() => moveDown(section)}
                onRemove={() => removeSection(section)}
                onEdit={() => handleEdit(section)}
                onDragStart={() => setDragging(section)}
                onDragOver={(e) => { e.preventDefault(); setDragOver(section); }}
                onDrop={() => handleDrop(section)}
                onDragEnd={() => { setDragging(null); setDragOver(null); }}
                isDragOver={dragOver === section}
              >
                <Component {...data} />
              </SectionWrapper>
            );
          })}
        </div>
      </main>
    </div>
  );
}
