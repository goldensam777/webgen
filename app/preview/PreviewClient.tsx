"use client";
import { useEffect, useState } from "react";
import type { SiteConfig, SitePage } from "@/app/store/siteStore";
import type { ParentMsg } from "@/lib/preview-bridge";
import type { FieldStyle, ElementStyle } from "@/components/editor/EditableContext";
import { EditableContext } from "@/components/editor/EditableContext";
import {
  Navbar, Hero, Features, Pricing, FAQ, Footer,
  Stats, Testimonials, CTA, Contact, Blog, ChatWidget,
} from "@/components";
import { AnimationWrapper } from "@/components/AnimationWrapper";
import "@/lib/animations.css";
import {
  findPageForHref,
  normalizeSectionData,
  rewriteSectionLinks,
  sectionAnchorId,
} from "@/lib/site-schema";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SECTION_MAP: Record<string, React.ComponentType<any>> = {
  navbar: Navbar, hero: Hero, features: Features, stats: Stats,
  testimonials: Testimonials, pricing: Pricing, faq: FAQ,
  cta: CTA, contact: Contact, footer: Footer,
  blog: Blog, chatwidget: ChatWidget,
};

function getPage(config: SiteConfig, pageId: string | null): SitePage | null {
  if (!config.pages?.length) return null;
  return config.pages.find(p => p.id === pageId) ?? config.pages[0];
}

function buildCSSVars(config: SiteConfig): string {
  const t = config.theme;
  return `
    :root {
      --color-primary:    ${t.primary};
      --color-secondary:  ${t.secondary};
      --color-background: ${t.background};
      --color-surface:    ${t.surface};
      --color-text:       ${t.text};
      --color-text-muted: ${t.textMuted};
      --color-border:     ${t.border};
      /* Editor UI vars — used by FloatingToolbar inside the iframe */
      --wg-bg:          #f8fafc;
      --wg-bg-2:        #ffffff;
      --wg-bg-3:        #f1f5f9;
      --wg-text:        #0f172a;
      --wg-text-2:      #475569;
      --wg-text-3:      #94a3b8;
      --wg-border:      #e2e8f0;
      --wg-green:       #10b981;
      --wg-green-hover: #047857;
      --wg-green-muted: rgba(16,185,129,0.12);
    }
    html, body {
      background-color: ${t.background};
      font-family: '${t.font || "Inter"}', system-ui, sans-serif;
      overflow-x: hidden;
      scroll-behavior: smooth;
    }
  `;
}

function buildFontUrl(font: string): string {
  // Load weights 400 (regular), 500 (medium), 600 (semibold), 700 (bold), 800 (extrabold)
  return `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font)}:wght@400;500;600;700;800&display=swap`;
}

export function PreviewClient() {
  const [config,      setConfig]    = useState<SiteConfig | null>(null);
  const [pageId,      setPageId]    = useState<string | null>(null);
  const [selected,    setSelected]  = useState<string | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [visiblePageId, setVisiblePageId] = useState<string | null>(null);

  /* ── Relay Ctrl+Z / Ctrl+Y / Ctrl+I vers le parent quand hors contentEditable ── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      const key = e.key.toLowerCase();
      if (key !== "z" && key !== "y" && key !== "i") return;
      const active = document.activeElement as HTMLElement | null;
      if (active?.isContentEditable) return;
      e.preventDefault();
      if (key === "i") { window.parent?.postMessage({ type: "ai-patch" }, "*"); return; }
      const type = (key === "z" && !e.shiftKey) ? "undo" : "redo";
      window.parent?.postMessage({ type }, "*");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  /* ── Écoute les messages du parent ── */
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      const msg = e.data as ParentMsg;
      if (!msg?.type) return;
      if (msg.type === "config") {
        const newPageId = msg.pageId;
        setConfig(msg.config);
        setPageId(newPageId);
        setVisiblePageId(prev => {
          if (prev === null || prev === newPageId) {
            // First load or same page — no transition
            return newPageId;
          }
          // Page change → trigger fade transition
          setTransitioning(true);
          setTimeout(() => {
            setVisiblePageId(newPageId);
            setTransitioning(false);
          }, 220);
          return prev; // Keep old page visible during fade-out
        });
      }
      if (msg.type === "highlight") {
        setSelected(msg.sectionId);
      }
    };
    window.addEventListener("message", handler);
    // Signale au parent que l'iframe est prête
    window.parent?.postMessage({ type: "ready" }, "*");
    return () => window.removeEventListener("message", handler);
  }, []);

  /* ── Chargement initial ── */
  if (!config) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-green-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const page = getPage(config, visiblePageId ?? pageId);
  if (!page) return null;

  return (
    <>
      {/* CSS variables du thème courant */}
      <style dangerouslySetInnerHTML={{ __html: buildCSSVars(config) }} />
      {/* Google Font */}
      <link
        rel="stylesheet"
        href={buildFontUrl(config.theme.font || "Inter")}
      />

      <div
        style={{
          fontFamily:  `'${config.theme.font || "Inter"}', system-ui, sans-serif`,
          opacity:     transitioning ? 0 : 1,
          transition:  "opacity 0.22s ease",
        }}
      >
        {page.sections.map((sectionId) => {
          const Component = SECTION_MAP[sectionId];
          if (!Component) return null;

          const data = normalizeSectionData(sectionId, page.data[sectionId] ?? {});
          const fieldStyles   = (data._styles  ?? {}) as Record<string, FieldStyle>;
          const elementStyles = (data._elStyles ?? {}) as Record<string, ElementStyle>;
          const componentData = rewriteSectionLinks(
            Object.fromEntries(
              Object.entries(data).filter(([k]) => !k.startsWith("_"))
            ),
            config.pages
          );
          const isSelected   = selected === sectionId;
          const sectionAnims = page.animations?.[sectionId] ?? [];
          /* Section-level background override — set via AI or style panel */
          const sectionBg    = (data.bgColor as string | undefined) || undefined;

          return (
            <div
              key={sectionId}
              id={sectionAnchorId(sectionId)}
              style={{
                position:        "relative",
                outline:         isSelected ? "2px solid #10b981" : "none",
                outlineOffset:   "-2px",
                cursor:          "pointer",
                transition:      "outline 0.1s",
                backgroundColor: sectionBg,
              }}
              onClick={(e) => {
                const a = (e.target as HTMLElement).closest("a[href]");
                if (a) {
                  e.preventDefault();
                  const href = (a as HTMLAnchorElement).getAttribute("href") ?? "";
                  if (href.startsWith("#")) {
                    const targetId = sectionAnchorId(href.slice(1));
                    const targetSection = page.sections.find(
                      (candidate) => sectionAnchorId(candidate) === targetId
                    );
                    document.getElementById(targetId)?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                    if (targetSection) {
                      setSelected(targetSection);
                      window.parent?.postMessage({ type: "select", sectionId: targetSection }, "*");
                    }
                    return;
                  }
                  // Lien interne → naviguer vers la page correspondante
                  if (href && !href.startsWith("http") && !href.startsWith("//") && !href.startsWith("#")) {
                    const targetPage = findPageForHref(href, config.pages);
                    if (targetPage) {
                      window.parent?.postMessage({ type: "navigate", pageId: targetPage.id }, "*");
                    }
                  }
                  return;
                }
                setSelected(sectionId);
                window.parent?.postMessage({ type: "select", sectionId }, "*");
              }}
              onMouseEnter={(e) => {
                if (!isSelected)
                  (e.currentTarget as HTMLElement).style.outline = "1.5px dashed rgba(16,185,129,0.4)";
              }}
              onMouseLeave={(e) => {
                if (!isSelected)
                  (e.currentTarget as HTMLElement).style.outline = "none";
              }}
            >
              {/* Badge de sélection */}
              {isSelected && (
                <span
                  style={{
                    position:      "absolute",
                    top:           6,
                    left:          6,
                    zIndex:        100,
                    pointerEvents: "none",
                    backgroundColor: "#10b981",
                    color:         "#fff",
                    fontSize:      "10px",
                    fontWeight:    700,
                    padding:       "2px 8px",
                    borderRadius:  "4px",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    fontFamily:    "system-ui, sans-serif",
                  }}
                >
                  {sectionId}
                </span>
              )}

              <EditableContext.Provider
                value={{
                  isEditing:  sectionId === selected,
                  canvasMode: sectionId === selected,
                  fieldStyles,
                  elementStyles,
                  onUpdate: (field, value) => {
                    window.parent?.postMessage(
                      { type: "update", sectionId, field, value }, "*"
                    );
                  },
                  onStyleUpdate: (field, style) => {
                    window.parent?.postMessage(
                      { type: "style-update", sectionId, field, style }, "*"
                    );
                  },
                  onElementStyleUpdate: (elementId, style) => {
                    window.parent?.postMessage(
                      { type: "element-style-update", sectionId, elementId, style }, "*"
                    );
                  },
                }}
              >
                {sectionAnims.length > 0 ? (
                  sectionAnims.reduce(
                    (children, anim) => (
                      <AnimationWrapper key={anim.id} cfg={anim}>{children}</AnimationWrapper>
                    ),
                    <Component {...componentData} /> as React.ReactNode
                  )
                ) : (
                  <Component {...componentData} />
                )}
              </EditableContext.Provider>
            </div>
          );
        })}
      </div>
    </>
  );
}
