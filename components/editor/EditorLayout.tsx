// components/editor/EditorLayout.tsx — Professional UI Redesign
"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { StylePanel }       from "./StylePanel";
import { SectionPanel }     from "./SectionPanel";
import { PropertiesPanel }  from "./PropertiesPanel";
import { MediaPanel }       from "./MediaPanel";
import { SEOPanel }         from "./SEOPanel";
import { AIPatchPanel }     from "./AIPatchPanel";
import { useSiteStore, useActivePage } from "@/app/store/siteStore";
import type { PreviewMsg } from "@/lib/preview-bridge";

type Tab = "sections" | "styles" | "media" | "pages" | "seo";
type Viewport = "desktop" | "tablet" | "mobile";

/* ── Icons ───────────────── */
const Icons = {
  Sections: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  Styles: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
    </svg>
  ),
  Media: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  SEO: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  Pages: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  Desktop: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h6l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  Mobile: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  ),
};

export function EditorLayout() {
  const { config, activePageId, setActivePage, undo, redo, updateSection, removeSection, reorderSections } = useSiteStore();
  const activePage = useActivePage();

  const [tab, setTab] = useState<Tab>("sections");
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [aiPatchOpen, setAiPatchOpen] = useState(false);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);

  /* ── Sync & Events ── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      const key = e.key.toLowerCase();
      if (key === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
      if (key === "y" || (key === "z" && e.shiftKey)) { e.preventDefault(); redo(); }
      if (key === "i") { e.preventDefault(); setAiPatchOpen(o => !o); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo]);

  useEffect(() => {
    if (!config || !activePageId) return;
    const t = setTimeout(() => {
      iframeRef.current?.contentWindow?.postMessage({ type: "config", config, pageId: activePageId }, "*");
    }, 60);
    return () => clearTimeout(t);
  }, [config, activePageId]);

  useEffect(() => {
    iframeRef.current?.contentWindow?.postMessage({ type: "highlight", sectionId: selectedSection }, "*");
  }, [selectedSection]);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      const msg = e.data as PreviewMsg;
      if (!msg?.type) return;
      if (msg.type === "ready" && config && activePageId) {
        iframeRef.current?.contentWindow?.postMessage({ type: "config", config, pageId: activePageId }, "*");
      }
      if (msg.type === "select") setSelectedSection(msg.sectionId);
      if (msg.type === "navigate") { setActivePage(msg.pageId); setSelectedSection(null); }
      if (msg.type === "update") updateSection(msg.sectionId, (d) => ({ ...d, [msg.field]: msg.value }));
      if (msg.type === "style-update") updateSection(msg.sectionId, (d) => ({ ...d, _styles: { ...((d._styles ?? {}) as Record<string, unknown>), [msg.field]: msg.style } }));
      if (msg.type === "element-style-update") updateSection(msg.sectionId, (d) => ({ ...d, _elStyles: { ...((d._elStyles ?? {}) as Record<string, unknown>), [msg.elementId]: msg.style } }));
      if (msg.type === "undo") undo();
      if (msg.type === "redo") redo();
      if (msg.type === "ai-patch") setAiPatchOpen(o => !o);
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [config, activePageId, redo, setActivePage, undo, updateSection]);

  const moveUp = useCallback((section: string) => {
    if (!activePage) return;
    const arr = [...activePage.sections];
    const i = arr.indexOf(section);
    if (i <= 0) return;
    [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
    reorderSections(arr);
  }, [activePage, reorderSections]);

  const moveDown = useCallback((section: string) => {
    if (!activePage) return;
    const arr = [...activePage.sections];
    const i = arr.indexOf(section);
    if (i >= arr.length - 1) return;
    [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
    reorderSections(arr);
  }, [activePage, reorderSections]);

  if (!config || !activePage) return null;

  return (
    <div className="flex flex-1 overflow-hidden" style={{ backgroundColor: "var(--wg-bg-3)" }}>
      {aiPatchOpen && <AIPatchPanel selectedSection={selectedSection} onClose={() => setAiPatchOpen(false)} />}

      {/* ── Mini Left Sidebar ── */}
      <aside className="w-16 shrink-0 flex flex-col items-center py-4 gap-4 border-r"
        style={{ backgroundColor: "var(--wg-bg-2)", borderColor: "var(--wg-border)" }}>
        <SidebarTab icon={<Icons.Sections />} active={tab === "sections"} onClick={() => setTab("sections")} label="Sections" />
        <SidebarTab icon={<Icons.Styles />} active={tab === "styles"} onClick={() => setTab("styles")} label="Styles" />
        <SidebarTab icon={<Icons.Media />} active={tab === "media"} onClick={() => setTab("media")} label="Médias" />
        <SidebarTab icon={<Icons.SEO />} active={tab === "seo"} onClick={() => setTab("seo")} label="SEO" />
        <SidebarTab icon={<Icons.Pages />} active={tab === "pages"} onClick={() => setTab("pages")} label="Pages" />
      </aside>

      {/* ── Sub Sidebar (Panel Content) ── */}
      <aside className="w-64 shrink-0 flex flex-col border-r overflow-hidden"
        style={{ backgroundColor: "var(--wg-bg-2)", borderColor: "var(--wg-border)" }}>
        <div className="h-12 flex items-center px-4 border-b font-black text-[10px] uppercase tracking-widest opacity-40"
          style={{ borderColor: "var(--wg-border)" }}>
          {tab}
        </div>
        <div className="flex-1 overflow-y-auto pb-10">
          {tab === "sections" && <SectionPanel />}
          {tab === "styles" && <StylePanel />}
          {tab === "media" && <MediaPanel />}
          {tab === "pages" && <PagesPanel />}
          {tab === "seo" && <SEOPanel />}
        </div>
      </aside>

      {/* ── Main Canvas Area ── */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Canvas Toolbar */}
        <div className="h-12 shrink-0 border-b flex items-center justify-between px-4"
          style={{ backgroundColor: "var(--wg-bg-2)", borderColor: "var(--wg-border)" }}>
          
          <div className="flex items-center gap-4">
            <select 
              value={activePageId || ""} 
              onChange={e => setActivePage(e.target.value)}
              className="bg-transparent text-xs font-bold focus:outline-none cursor-pointer hover:text-emerald-500 transition-colors"
            >
              {config.pages.map(p => (
                <option key={p.id} value={p.id}>{p.name} {p.slug === "" ? "(Accueil)" : `/${p.slug}`}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center glass rounded-xl p-0.5 border" style={{ borderColor: "var(--wg-border)" }}>
            <ViewportBtn active={viewport === "desktop"} onClick={() => setViewport("desktop")} icon={<Icons.Desktop />} />
            <ViewportBtn active={viewport === "mobile"} onClick={() => setViewport("mobile")} icon={<Icons.Mobile />} />
          </div>

          <div className="w-24" /> {/* Spacer */}
        </div>

        {/* Iframe Wrapper */}
        <div className="flex-1 overflow-auto p-8 flex justify-center bg-slate-100 dark:bg-slate-950/20">
          <div 
            className="transition-all duration-500 shadow-2xl bg-white dark:bg-black overflow-hidden"
            style={{ 
              width: viewport === "desktop" ? "100%" : "375px",
              height: viewport === "desktop" ? "100%" : "667px",
              borderRadius: viewport === "desktop" ? "0" : "32px",
              border: viewport === "desktop" ? "none" : "12px solid #1e293b"
            }}
          >
            <iframe ref={iframeRef} src="/preview" title="Aperçu" className="w-full h-full border-none block" />
          </div>
        </div>
      </main>

      {/* ── Right Sidebar (Properties) ── */}
      <aside className="w-72 shrink-0 flex flex-col border-l overflow-hidden"
        style={{ backgroundColor: "var(--wg-bg-2)", borderColor: "var(--wg-border)" }}>
        <div className="flex-1 overflow-y-auto">
          <PropertiesPanel
            section={selectedSection}
            onMoveUp={() => selectedSection && moveUp(selectedSection)}
            onMoveDown={() => selectedSection && moveDown(selectedSection)}
            onRemove={() => { if (selectedSection) { removeSection(selectedSection); setSelectedSection(null); } }}
            onClose={() => setSelectedSection(null)}
          />
        </div>
        
        {/* AI Quick Access */}
        <div className="p-4 border-t" style={{ borderColor: "var(--wg-border)" }}>
          <button
            onClick={() => setAiPatchOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-black uppercase tracking-widest bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition-transform"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" /></svg>
            Magic Patch
            <kbd className="opacity-40 text-[10px] ml-1">⌘I</kbd>
          </button>
        </div>
      </aside>
    </div>
  );
}

/* ── Helper Components ── */

function SidebarTab({ icon, active, onClick, label }: { icon: React.ReactNode; active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 ${
        active ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "opacity-40 hover:opacity-100 hover:bg-slate-100 dark:hover:bg-white/5"
      }`}
    >
      {icon}
    </button>
  );
}

function ViewportBtn({ active, onClick, icon }: { active: boolean; onClick: () => void; icon: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`p-1.5 rounded-lg transition-all ${active ? "bg-emerald-500 text-white shadow-sm" : "opacity-30 hover:opacity-60"}`}
    >
      {icon}
    </button>
  );
}

function PagesPanel() {
  const { config, activePageId, setActivePage, addPage, removePage } = useSiteStore();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");

  if (!config) return null;

  return (
    <div className="flex flex-col gap-1 p-2">
      {config.pages.map(page => (
        <div key={page.id} onClick={() => setActivePage(page.id)}
          className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
            page.id === activePageId ? "bg-emerald-500/10 text-emerald-500" : "hover:bg-slate-100 dark:hover:bg-white/5"
          }`}>
          <span className="text-sm font-bold truncate">{page.name}</span>
          {config.pages.length > 1 && (
            <button onClick={(e) => { e.stopPropagation(); removePage(page.id); }} className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          )}
        </div>
      ))}
      <button onClick={() => setAdding(true)} className="mt-4 flex items-center gap-2 px-3 text-xs font-black uppercase tracking-widest text-emerald-500 opacity-60 hover:opacity-100">
        + Nouvelle page
      </button>
      {adding && (
        <div className="px-2 mt-2 flex gap-2">
          <input autoFocus value={name} onChange={e => setName(e.target.value)} 
            placeholder="Nom..." className="flex-1 bg-transparent border-b border-emerald-500 text-sm focus:outline-none" />
          <button onClick={() => { if(name.trim()) { addPage(name.trim()); setName(""); setAdding(false); } }} 
            className="text-xs font-bold text-emerald-500">OK</button>
        </div>
      )}
    </div>
  );
}
