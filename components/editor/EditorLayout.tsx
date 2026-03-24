// components/editor/EditorLayout.tsx
"use client";
import { useState } from "react";
import { StylePanel }      from "./StylePanel";
import { SectionPanel }    from "./SectionPanel";
import { SectionWrapper }  from "./SectionWrapper";
import { ContentPanel }    from "./ContentPanel";
import { EditableContext } from "./EditableContext";
import { useSiteStore, useActivePage } from "@/app/store/siteStore";
import {
  Navbar, Hero, Features, Pricing, FAQ, Footer,
  Stats, Testimonials, CTA, Contact,
} from "@/components";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SECTION_MAP: Record<string, React.ComponentType<any>> = {
  navbar: Navbar, hero: Hero, features: Features, stats: Stats,
  testimonials: Testimonials, pricing: Pricing, faq: FAQ,
  cta: CTA, contact: Contact, footer: Footer,
};

type Tab = "pages" | "sections" | "styles";

export function EditorLayout() {
  const { config, activePageId, setActivePage, addPage, removePage } = useSiteStore();
  const activePage = useActivePage();

  const [tab, setTab]                         = useState<Tab>("sections");
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [editingSection, setEditingSection]   = useState<string | null>(null);
  const [dragging, setDragging]               = useState<string | null>(null);
  const [dragOver, setDragOver]               = useState<string | null>(null);
  const [addingPage, setAddingPage]           = useState(false);
  const [newPageName, setNewPageName]         = useState("");

  const { removeSection, reorderSections, updateSection } = useSiteStore();

  if (!config || !activePage) return null;

  /* ── section helpers ─────────────────────────────────────── */

  const moveUp = (section: string) => {
    const arr = [...activePage.sections];
    const i   = arr.indexOf(section);
    if (i <= 0) return;
    [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
    reorderSections(arr);
  };

  const moveDown = (section: string) => {
    const arr = [...activePage.sections];
    const i   = arr.indexOf(section);
    if (i >= arr.length - 1) return;
    [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
    reorderSections(arr);
  };

  const handleDrop = (target: string) => {
    if (!dragging || dragging === target) { setDragging(null); setDragOver(null); return; }
    const next = [...activePage.sections];
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

  /* ── page helpers ────────────────────────────────────────── */

  const handleAddPage = () => {
    const name = newPageName.trim();
    if (!name) return;
    addPage(name);
    setNewPageName("");
    setAddingPage(false);
    setTab("sections");
  };

  /* ── render ──────────────────────────────────────────────── */

  return (
    <div className="flex h-[calc(100vh-56px)] overflow-hidden">

      {/* ── Sidebar ──────────────────────────────────────── */}
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
            {/* Tabs */}
            <div className="flex shrink-0 border-b" style={{ borderColor: "var(--wg-border)" }}>
              {(["pages", "sections", "styles"] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className="flex-1 py-2.5 text-xs font-semibold uppercase tracking-wide transition-colors"
                  style={tab === t
                    ? { color: "var(--wg-green)", borderBottom: "2px solid var(--wg-green)" }
                    : { color: "var(--wg-text-3)" }
                  }
                >
                  {t === "pages" ? "Pages" : t === "sections" ? "Sections" : "Styles"}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-visible pb-4">
              {/* ── Pages tab ─────────────────────────────── */}
              {tab === "pages" && (
                <div className="flex flex-col gap-1 pt-2">
                  <p
                    className="text-xs font-semibold uppercase tracking-wide px-4 pt-2 pb-1"
                    style={{ color: "var(--wg-text-3)" }}
                  >
                    Pages du site
                  </p>

                  {config.pages.map((page, idx) => (
                    <div
                      key={page.id}
                      className="flex items-center gap-2 px-3 py-2 mx-1 rounded-lg cursor-pointer transition-colors"
                      style={{
                        backgroundColor: page.id === activePageId ? "var(--wg-green-muted)" : "transparent",
                        border:           page.id === activePageId ? "1px solid var(--wg-green)" : "1px solid transparent",
                      }}
                      onClick={() => { setActivePage(page.id); setTab("sections"); setSelectedSection(null); setEditingSection(null); }}
                      onMouseEnter={e => {
                        if (page.id !== activePageId) e.currentTarget.style.backgroundColor = "var(--wg-bg-3)";
                      }}
                      onMouseLeave={e => {
                        if (page.id !== activePageId) e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{
                          color: page.id === activePageId ? "var(--wg-green)" : "var(--wg-text)",
                        }}>
                          {page.name}
                        </p>
                        <p className="text-xs truncate" style={{ color: "var(--wg-text-3)" }}>
                          {idx === 0 ? "/ (accueil)" : `/${page.slug}`}
                        </p>
                      </div>
                      {config.pages.length > 1 && (
                        <button
                          onClick={e => { e.stopPropagation(); removePage(page.id); }}
                          className="shrink-0 transition-colors"
                          style={{ color: "var(--wg-text-3)" }}
                          onMouseEnter={e => (e.currentTarget.style.color = "#ef4444")}
                          onMouseLeave={e => (e.currentTarget.style.color = "var(--wg-text-3)")}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}

                  {/* Add page */}
                  {addingPage ? (
                    <div className="flex gap-2 px-3 mx-1 mt-2">
                      <input
                        autoFocus
                        value={newPageName}
                        onChange={e => setNewPageName(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === "Enter")  handleAddPage();
                          if (e.key === "Escape") { setAddingPage(false); setNewPageName(""); }
                        }}
                        placeholder="Ex: Services"
                        className="flex-1 text-xs px-2 py-1.5 rounded border focus:outline-none"
                        style={{
                          backgroundColor: "var(--wg-bg)",
                          borderColor:     "var(--wg-green)",
                          color:           "var(--wg-text)",
                        }}
                      />
                      <button
                        onClick={handleAddPage}
                        className="btn-green px-2 py-1 rounded text-xs font-semibold shrink-0"
                      >
                        OK
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAddingPage(true)}
                      className="flex items-center gap-1.5 px-4 py-2 mx-1 rounded-lg text-xs font-semibold transition-colors"
                      style={{ color: "var(--wg-green)" }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = "var(--wg-green-muted)")}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Nouvelle page
                    </button>
                  )}
                </div>
              )}

              {tab === "sections" && <SectionPanel />}
              {tab === "styles"   && <StylePanel />}
            </div>
          </>
        )}
      </aside>

      {/* ── Preview ──────────────────────────────────────── */}
      <main
        className="flex-1 overflow-y-auto"
        style={{ backgroundColor: "var(--wg-bg-3)" }}
        onClick={() => setSelectedSection(null)}
      >
        {/* Page indicator */}
        {config.pages.length > 1 && (
          <div
            className="sticky top-0 z-10 flex items-center gap-2 px-4 py-2 border-b text-xs font-semibold"
            style={{
              backgroundColor: "var(--wg-bg-2)",
              borderColor:     "var(--wg-border)",
              color:           "var(--wg-text-2)",
            }}
          >
            <span style={{ color: "var(--wg-text-3)" }}>Aperçu :</span>
            <span style={{ color: "var(--wg-green)" }}>{activePage.name}</span>
            <span style={{ color: "var(--wg-text-3)" }}>
              {activePage.slug === "" ? "/ (accueil)" : `/${activePage.slug}`}
            </span>
          </div>
        )}

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
          {activePage.sections.map((section, index) => {
            const Component = SECTION_MAP[section];
            const data      = activePage.data[section] ?? {};
            if (!Component) return null;

            // Read private editor state from section data
            const fieldStyles   = ((data._styles   ?? {}) as Record<string, import("./EditableContext").FieldStyle>);
            const elementStyles = ((data._elStyles  ?? {}) as Record<string, import("./EditableContext").ElementStyle>);
            const canvasMode    = (data._canvasMode as boolean) ?? false;
            const extraPadding  = (data._paddingY as number) ?? 0;

            // Filter internal keys before passing to component
            const componentData = Object.fromEntries(
              Object.entries(data).filter(([k]) => !k.startsWith("_"))
            );

            return (
              <SectionWrapper
                key={section}
                isFirst={index === 0}
                isLast={index === activePage.sections.length - 1}
                isSelected={selectedSection === section}
                extraPadding={extraPadding}
                canvasMode={canvasMode}
                onExtraPaddingChange={(v) => updateSection(section, { ...data, _paddingY: v })}
                onToggleCanvas={(v) => updateSection(section, { ...data, _canvasMode: v })}
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
                <EditableContext.Provider
                  value={{
                    isEditing: selectedSection === section,
                    canvasMode,
                    fieldStyles,
                    elementStyles,
                    onUpdate:      (field, val) => updateSection(section, { ...data, [field]: val }),
                    onStyleUpdate: (field, style) => updateSection(section, {
                      ...data,
                      _styles: { ...fieldStyles, [field]: { ...fieldStyles[field], ...style } },
                    }),
                    onElementStyleUpdate: (elementId, style) => updateSection(section, {
                      ...data,
                      _elStyles: { ...elementStyles, [elementId]: style },
                    }),
                  }}
                >
                  <Component {...componentData} />
                </EditableContext.Provider>
              </SectionWrapper>
            );
          })}
        </div>
      </main>
    </div>
  );
}
