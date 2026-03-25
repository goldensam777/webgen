// components/editor/EditorLayout.tsx
"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { StylePanel }       from "./StylePanel";
import { SectionPanel }     from "./SectionPanel";
import { PropertiesPanel }  from "./PropertiesPanel";
import { MediaPanel }       from "./MediaPanel";
import { useSiteStore, useActivePage } from "@/app/store/siteStore";
import type { PreviewMsg } from "@/lib/preview-bridge";

type Tab         = "pages" | "sections" | "styles" | "media";
type MobileSheet = Tab | "properties" | null;

/* ── Icônes ────────────────────────────────────────────────── */
function IconPages() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}
function IconSections() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  );
}
function IconStyles() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
    </svg>
  );
}
function IconProps() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
}
function IconMedia() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

/* ── Composant principal ────────────────────────────────────── */
export function EditorLayout() {
  const { config, activePageId, setActivePage, addPage, removePage, undo, redo, past, future } = useSiteStore();
  const activePage = useActivePage();

  const [tab,             setTab]             = useState<Tab>("sections");
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [addingPage,      setAddingPage]      = useState(false);
  const [newPageName,     setNewPageName]     = useState("");
  const [isMobile,        setIsMobile]        = useState(false);
  const [mobileSheet,     setMobileSheet]     = useState<MobileSheet>(null);

  const { removeSection, reorderSections, updateSection } = useSiteStore();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  /* ── Raccourcis clavier Ctrl+Z / Ctrl+Y (fenêtre parente) ── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      const key = e.key.toLowerCase();
      if (key === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
      if (key === "y" || (key === "z" && e.shiftKey)) { e.preventDefault(); redo(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo]);

  /* ── Détection mobile ── */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* ── Sync config → iframe (debounce 60ms) ── */
  useEffect(() => {
    if (!config || !activePageId) return;
    const t = setTimeout(() => {
      iframeRef.current?.contentWindow?.postMessage(
        { type: "config", config, pageId: activePageId },
        "*"
      );
    }, 60);
    return () => clearTimeout(t);
  }, [config, activePageId]);

  /* ── Sync section sélectionnée → iframe ── */
  useEffect(() => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: "highlight", sectionId: selectedSection },
      "*"
    );
  }, [selectedSection]);

  /* ── Messages venant de l'iframe ── */
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      const msg = e.data as PreviewMsg;
      if (!msg?.type) return;
      if (msg.type === "ready" && config && activePageId) {
        iframeRef.current?.contentWindow?.postMessage(
          { type: "config", config, pageId: activePageId },
          "*"
        );
      }
      if (msg.type === "select") {
        setSelectedSection(msg.sectionId);
        if (isMobile) setMobileSheet("properties");
      }
      if (msg.type === "navigate") {
        setActivePage(msg.pageId);
        setSelectedSection(null);
      }
      if (msg.type === "update") {
        updateSection(msg.sectionId, (d) => ({ ...d, [msg.field]: msg.value }));
      }
      if (msg.type === "style-update") {
        updateSection(msg.sectionId, (d) => ({
          ...d,
          _styles: {
            ...((d._styles ?? {}) as Record<string, unknown>),
            [msg.field]: msg.style,
          },
        }));
      }
      if (msg.type === "element-style-update") {
        updateSection(msg.sectionId, (d) => ({
          ...d,
          _elStyles: {
            ...((d._elStyles ?? {}) as Record<string, unknown>),
            [msg.elementId]: msg.style,
          },
        }));
      }
      if (msg.type === "undo") { undo(); }
      if (msg.type === "redo") { redo(); }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [config, activePageId, isMobile, undo, redo]);

  if (!config || !activePage) return null;

  /* ── Section helpers ── */
  const moveUp = useCallback((section: string) => {
    const arr = [...activePage.sections];
    const i   = arr.indexOf(section);
    if (i <= 0) return;
    [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
    reorderSections(arr);
  }, [activePage.sections, reorderSections]);

  const moveDown = useCallback((section: string) => {
    const arr = [...activePage.sections];
    const i   = arr.indexOf(section);
    if (i >= arr.length - 1) return;
    [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
    reorderSections(arr);
  }, [activePage.sections, reorderSections]);

  /* ── Page helpers ── */
  const handleAddPage = () => {
    const name = newPageName.trim();
    if (!name) return;
    addPage(name);
    setNewPageName("");
    setAddingPage(false);
    setTab("sections");
    if (isMobile) setMobileSheet(null);
  };

  /* ── Pages list ── */
  const renderPagesContent = () => (
    <div className="flex flex-col gap-1 pt-2">
      <p className="text-xs font-semibold uppercase tracking-wide px-4 pt-2 pb-1"
        style={{ color: "var(--wg-text-3)" }}>
        Pages du site
      </p>
      {config.pages.map((page, idx) => (
        <div
          key={page.id}
          className="flex items-center gap-2 px-3 py-2 mx-1 rounded-lg cursor-pointer transition-colors"
          style={{
            backgroundColor: page.id === activePageId ? "var(--wg-green-muted)" : "transparent",
            border: page.id === activePageId ? "1px solid var(--wg-green)" : "1px solid transparent",
          }}
          onClick={() => {
            setActivePage(page.id);
            setTab("sections");
            setSelectedSection(null);
            if (isMobile) setMobileSheet(null);
          }}
          onMouseEnter={(e) => { if (page.id !== activePageId) e.currentTarget.style.backgroundColor = "var(--wg-bg-3)"; }}
          onMouseLeave={(e) => { if (page.id !== activePageId) e.currentTarget.style.backgroundColor = "transparent"; }}
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate"
              style={{ color: page.id === activePageId ? "var(--wg-green)" : "var(--wg-text)" }}>
              {page.name}
            </p>
            <p className="text-xs truncate" style={{ color: "var(--wg-text-3)" }}>
              {idx === 0 ? "/ (accueil)" : `/${page.slug}`}
            </p>
          </div>
          {config.pages.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); removePage(page.id); }}
              className="shrink-0"
              style={{ color: "var(--wg-text-3)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--wg-text-3)")}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      ))}

      {addingPage ? (
        <div className="flex gap-2 px-3 mx-1 mt-2">
          <input
            autoFocus
            value={newPageName}
            onChange={(e) => setNewPageName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter")  handleAddPage();
              if (e.key === "Escape") { setAddingPage(false); setNewPageName(""); }
            }}
            placeholder="Ex: Services"
            className="flex-1 text-xs px-2 py-1.5 rounded border focus:outline-none"
            style={{ backgroundColor: "var(--wg-bg)", borderColor: "var(--wg-green)", color: "var(--wg-text)" }}
          />
          <button onClick={handleAddPage} className="btn-green px-2 py-1 rounded text-xs font-semibold shrink-0">
            OK
          </button>
        </div>
      ) : (
        <button
          onClick={() => setAddingPage(true)}
          className="flex items-center gap-1.5 px-4 py-2 mx-1 rounded-lg text-xs font-semibold"
          style={{ color: "var(--wg-green)" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--wg-green-muted)")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouvelle page
        </button>
      )}
    </div>
  );

  /* ── Iframe preview ── */
  const renderIframe = () => (
    <iframe
      ref={iframeRef}
      src="/preview"
      title="Aperçu du site"
      style={{ width: "100%", height: "100%", border: "none", display: "block" }}
    />
  );

  /* ── PropertiesPanel avec callbacks de section ── */
  const renderProperties = () => (
    <PropertiesPanel
      section={selectedSection}
      onMoveUp={()   => selectedSection && moveUp(selectedSection)}
      onMoveDown={()  => selectedSection && moveDown(selectedSection)}
      onRemove={() => { if (selectedSection) { removeSection(selectedSection); setSelectedSection(null); } }}
      onClose={()   => setSelectedSection(null)}
    />
  );

  /* ── Mobile ─────────────────────────────────────────────── */
  if (isMobile) {
    const MOBILE_TABS: { key: MobileSheet; label: string; icon: React.ReactNode }[] = [
      { key: "pages",      label: "Pages",    icon: <IconPages /> },
      { key: "sections",   label: "Sections", icon: <IconSections /> },
      { key: "styles",     label: "Styles",   icon: <IconStyles /> },
      { key: "media",      label: "Médias",   icon: <IconMedia /> },
      { key: "properties", label: "Éditer",   icon: <IconProps /> },
    ];

    return (
      <div className="flex flex-col" style={{ height: "calc(100vh - 56px)" }}>

        {/* Iframe plein écran */}
        <main className="flex-1 overflow-hidden" style={{ backgroundColor: "var(--wg-bg-3)" }}>
          {config.pages.length > 1 && (
            <div
              className="sticky top-0 z-10 flex items-center gap-2 px-4 py-2 border-b text-xs font-semibold"
              style={{ backgroundColor: "var(--wg-bg-2)", borderColor: "var(--wg-border)" }}
            >
              <span style={{ color: "var(--wg-text-3)" }}>Aperçu :</span>
              <span style={{ color: "var(--wg-green)" }}>{activePage.name}</span>
            </div>
          )}
          <div style={{ height: "100%" }}>{renderIframe()}</div>
        </main>

        {/* Bottom sheet */}
        {mobileSheet && (
          <div
            className="fixed inset-0 z-40"
            style={{ backgroundColor: "rgba(0,0,0,0.35)" }}
            onClick={() => setMobileSheet(null)}
          >
            <div
              className="absolute bottom-14 left-0 right-0 rounded-t-2xl border-t overflow-hidden flex flex-col"
              style={{ backgroundColor: "var(--wg-bg-2)", borderColor: "var(--wg-border)", maxHeight: "65vh" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-center pt-3 pb-1 shrink-0">
                <div className="w-10 h-1 rounded-full" style={{ backgroundColor: "var(--wg-border)" }} />
              </div>
              <div className="flex-1 overflow-y-auto pb-4">
                {mobileSheet === "pages"      && renderPagesContent()}
                {mobileSheet === "sections"   && <SectionPanel />}
                {mobileSheet === "styles"     && <StylePanel />}
                {mobileSheet === "media"      && <MediaPanel />}
                {mobileSheet === "properties" && renderProperties()}
              </div>
            </div>
          </div>
        )}

        {/* Tab bar */}
        <nav
          className="shrink-0 flex border-t z-50"
          style={{ backgroundColor: "var(--wg-bg-2)", borderColor: "var(--wg-border)", height: "56px" }}
        >
          {MOBILE_TABS.map((t) => (
            <button
              key={String(t.key)}
              onClick={() => setMobileSheet((s) => s === t.key ? null : t.key)}
              className="flex-1 flex flex-col items-center justify-center gap-0.5"
              style={{ color: mobileSheet === t.key ? "var(--wg-green)" : "var(--wg-text-3)" }}
            >
              {t.icon}
              <span className="text-[9px] font-semibold uppercase tracking-wide">{t.label}</span>
            </button>
          ))}
        </nav>
      </div>
    );
  }

  /* ── Desktop ─────────────────────────────────────────────── */
  return (
    <div className="flex h-[calc(100vh-56px)] overflow-hidden">

      {/* Sidebar gauche — pages / sections / styles */}
      <aside
        className="w-64 shrink-0 flex flex-col border-r overflow-hidden"
        style={{ backgroundColor: "var(--wg-bg-2)", borderColor: "var(--wg-border)" }}
      >
        <div className="flex shrink-0 border-b" style={{ borderColor: "var(--wg-border)" }}>
          {(["pages", "sections", "styles", "media"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex-1 py-2.5 text-xs font-semibold uppercase tracking-wide transition-colors"
              style={tab === t
                ? { color: "var(--wg-green)", borderBottom: "2px solid var(--wg-green)" }
                : { color: "var(--wg-text-3)" }
              }
            >
              {t === "pages" ? "Pages" : t === "sections" ? "Sections" : t === "styles" ? "Styles" : "Médias"}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto overflow-x-visible pb-4">
          {tab === "pages"    && renderPagesContent()}
          {tab === "sections" && <SectionPanel />}
          {tab === "styles"   && <StylePanel />}
          {tab === "media"    && <MediaPanel />}
        </div>
      </aside>

      {/* Centre — iframe */}
      <main
        className="flex-1 overflow-hidden flex flex-col"
        style={{ backgroundColor: "var(--wg-bg-3)" }}
      >
        {config.pages.length > 1 && (
          <div
            className="shrink-0 flex items-center gap-2 px-4 py-2 border-b text-xs font-semibold"
            style={{ backgroundColor: "var(--wg-bg-2)", borderColor: "var(--wg-border)" }}
          >
            <span style={{ color: "var(--wg-text-3)" }}>Aperçu :</span>
            <span style={{ color: "var(--wg-green)" }}>{activePage.name}</span>
            <span style={{ color: "var(--wg-text-3)" }}>
              {activePage.slug === "" ? "/ (accueil)" : `/${activePage.slug}`}
            </span>
          </div>
        )}
        <div className="flex-1 overflow-hidden">{renderIframe()}</div>
      </main>

      {/* Panel droit — propriétés */}
      <aside
        className="w-72 shrink-0 flex flex-col border-l overflow-hidden"
        style={{ backgroundColor: "var(--wg-bg-2)", borderColor: "var(--wg-border)" }}
      >
        {renderProperties()}
      </aside>
    </div>
  );
}
