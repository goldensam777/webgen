"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { SectionAnimation } from "@/lib/animations";
import { normalizeSitePayload, sanitizePageSlug } from "@/lib/site-schema";

/* ── Types ──────────────────────────────────────────────────── */

export interface SiteTheme {
  primary:    string;
  secondary:  string;
  background: string;
  surface:    string;
  text:       string;
  textMuted:  string;
  border:     string;
  font:       string; // Google Font name, ex: "Inter", "Poppins"
}

export interface SitePage {
  id:         string;
  name:       string;   // ex: "Accueil"
  slug:       string;   // ex: "accueil" (vide = page d'accueil)
  sections:   string[];
  data:       Record<string, Record<string, unknown>>;
  /** animations[sectionKey] = list of SectionAnimation configs */
  animations?: Record<string, SectionAnimation[]>;
}

export interface SiteConfig {
  pages: SitePage[];
  theme: SiteTheme;
}

interface SiteStore {
  config:          SiteConfig | null;
  activePageId:    string | null;

  /* undo/redo history (non-persisté) */
  past:            SiteConfig[];
  future:          SiteConfig[];

  setConfig:       (config: SiteConfig) => void;
  clearConfig:     () => void;
  setActivePage:   (id: string) => void;

  /* undo / redo */
  undo:            () => void;
  redo:            () => void;

  /* page-level */
  addPage:         (name: string) => void;
  removePage:      (id: string) => void;
  renamePage:      (id: string, name: string) => void;

  /* theme */
  updateTheme:     (key: keyof SiteTheme, value: string) => void;

  /* section-level (agit sur la page active) */
  updateSection:   (
    section: string,
    updater: Record<string, unknown> | ((prev: Record<string, unknown>) => Record<string, unknown>)
  ) => void;
  addSection:      (section: string) => void;
  removeSection:   (section: string) => void;
  reorderSections: (sections: string[]) => void;

  /* patch page without resetting activePageId or history */
  patchActivePage: (sections: string[], data: Record<string, Record<string, unknown>>) => void;

  /* animations */
  setAnimation:    (section: string, anim: SectionAnimation) => void;
  removeAnimation: (section: string, animId: string) => void;
}

/* ── Defaults ───────────────────────────────────────────────── */

export const DEFAULT_THEME: SiteTheme = {
  primary:    "#2563eb",
  secondary:  "#7c3aed",
  background: "#f9fafb",
  surface:    "#ffffff",
  text:       "#111827",
  textMuted:  "#6b7280",
  border:     "#e5e7eb",
  font:       "Inter",
};

/* ── Helpers ────────────────────────────────────────────────── */

function uid(): string {
  return crypto.randomUUID();
}

function activePage(config: SiteConfig, activePageId: string | null): SitePage | null {
  if (!config.pages?.length) return null;
  return config.pages.find(p => p.id === activePageId) ?? config.pages[0];
}

function mapPage(
  config: SiteConfig,
  id: string,
  fn: (p: SitePage) => SitePage
): SiteConfig {
  return { ...config, pages: config.pages.map(p => p.id === id ? fn(p) : p) };
}

/* ── Store ──────────────────────────────────────────────────── */

/* ── History helpers ─────────────────────────────────────────── */

const MAX_HISTORY = 50;

function snapshot(s: SiteStore): Pick<SiteStore, "past" | "future"> {
  if (!s.config) return { past: s.past, future: s.future };
  return {
    past:   [...s.past.slice(-(MAX_HISTORY - 1)), s.config],
    future: [],
  };
}

/* ── Store ──────────────────────────────────────────────────── */

export const useSiteStore = create<SiteStore>()(
  persist(
    (set, get) => ({
      config:       null,
      activePageId: null,
      past:         [],
      future:       [],

      /* setConfig / clearConfig ne poussent pas d'historique — nouveau projet */
      setConfig: (config) => set({
        config,
        activePageId: config.pages[0]?.id ?? null,
        past:   [],
        future: [],
      }),

      clearConfig: () => set({ config: null, activePageId: null, past: [], future: [] }),

      setActivePage: (id) => set({ activePageId: id }),

      /* ── undo / redo ── */

      undo: () => set((s) => {
        if (!s.past.length) return s;
        const previous = s.past[s.past.length - 1];
        return {
          config:  previous,
          past:    s.past.slice(0, -1),
          future:  s.config ? [s.config, ...s.future.slice(0, MAX_HISTORY - 1)] : s.future,
        };
      }),

      redo: () => set((s) => {
        if (!s.future.length) return s;
        const next = s.future[0];
        return {
          config:  next,
          past:    s.config ? [...s.past.slice(-(MAX_HISTORY - 1)), s.config] : s.past,
          future:  s.future.slice(1),
        };
      }),

      /* ── pages ── */

      addPage: (name) => set((s) => {
        if (!s.config) return s;
        const slug = sanitizePageSlug(name, name);
        const page: SitePage = {
          id: uid(), name, slug,
          sections:   ["navbar", "hero", "footer"],
          data:       {},
          animations: {},
        };
        return {
          ...snapshot(s),
          config:       { ...s.config, pages: [...s.config.pages, page] },
          activePageId: page.id,
        };
      }),

      removePage: (id) => set((s) => {
        if (!s.config || s.config.pages.length <= 1) return s;
        const pages    = s.config.pages.filter(p => p.id !== id);
        const activeId = s.activePageId === id ? (pages[0]?.id ?? null) : s.activePageId;
        return { ...snapshot(s), config: { ...s.config, pages }, activePageId: activeId };
      }),

      renamePage: (id, name) => set((s) => {
        if (!s.config) return s;
        return { ...snapshot(s), config: mapPage(s.config, id, p => ({ ...p, name })) };
      }),

      /* ── theme ── */

      updateTheme: (key, value) => set((s) => s.config ? {
        ...snapshot(s),
        config: { ...s.config, theme: { ...s.config.theme, [key]: value } },
      } : s),

      /* ── sections (page active) ── */

      updateSection: (section, updater) => set((s) => {
        if (!s.config) return s;
        const page = activePage(s.config, s.activePageId);
        if (!page) return s;
        const prev    = page.data[section] ?? {};
        const newData = typeof updater === "function" ? updater(prev) : { ...prev, ...updater };
        return {
          ...snapshot(s),
          config: mapPage(s.config, page.id, p => ({
            ...p, data: { ...p.data, [section]: newData },
          })),
        };
      }),

      addSection: (section) => set((s) => {
        if (!s.config) return s;
        const page = activePage(s.config, s.activePageId);
        if (!page || page.sections.includes(section)) return s;
        return {
          ...snapshot(s),
          config: mapPage(s.config, page.id, p => ({
            ...p, sections: [...p.sections, section],
          })),
        };
      }),

      removeSection: (section) => set((s) => {
        if (!s.config) return s;
        const page = activePage(s.config, s.activePageId);
        if (!page) return s;
        return {
          ...snapshot(s),
          config: mapPage(s.config, page.id, p => ({
            ...p, sections: p.sections.filter(v => v !== section),
          })),
        };
      }),

      patchActivePage: (sections, data) => set((s) => {
        if (!s.config) return s;
        const page = activePage(s.config, s.activePageId);
        if (!page) return s;
        return {
          ...snapshot(s),
          config: mapPage(s.config, page.id, p => ({ ...p, sections, data })),
        };
      }),

      reorderSections: (sections) => set((s) => {
        if (!s.config) return s;
        const page = activePage(s.config, s.activePageId);
        if (!page) return s;
        return {
          ...snapshot(s),
          config: mapPage(s.config, page.id, p => ({ ...p, sections })),
        };
      }),

      setAnimation: (section, anim) => set((s) => {
        if (!s.config) return s;
        const page = activePage(s.config, s.activePageId);
        if (!page) return s;
        const prev    = page.animations?.[section] ?? [];
        const exists  = prev.findIndex(a => a.id === anim.id);
        const updated = exists >= 0
          ? prev.map(a => a.id === anim.id ? anim : a)
          : [...prev, anim];
        return {
          ...snapshot(s),
          config: mapPage(s.config, page.id, p => ({
            ...p,
            animations: { ...(p.animations ?? {}), [section]: updated },
          })),
        };
      }),

      removeAnimation: (section, animId) => set((s) => {
        if (!s.config) return s;
        const page = activePage(s.config, s.activePageId);
        if (!page) return s;
        const prev = page.animations?.[section] ?? [];
        return {
          ...snapshot(s),
          config: mapPage(s.config, page.id, p => ({
            ...p,
            animations: {
              ...(p.animations ?? {}),
              [section]: prev.filter(a => a.id !== animId),
            },
          })),
        };
      }),

      /* expose pour les composants */
      _getActivePage: () => {
        const s = get();
        if (!s.config) return null;
        return activePage(s.config, s.activePageId);
      },
    }),
    {
      name:    "webgen-site",
      storage: createJSONStorage(() => localStorage),
      // Ne persister que config + activePageId (pas l'historique)
      partialize: (s) => ({ config: s.config, activePageId: s.activePageId }),
      onRehydrateStorage: () => (state) => {
        if (state?.config && !Array.isArray((state.config as unknown as Record<string, unknown>).pages)) {
          state.config       = null;
          state.activePageId = null;
        }
      },
    }
  )
);

/* ── Sélecteur pratique ─────────────────────────────────────── */

export function useActivePage(): SitePage | null {
  const config       = useSiteStore(s => s.config);
  const activePageId = useSiteStore(s => s.activePageId);
  if (!config) return null;
  return activePage(config, activePageId);
}

/* ── Conversion API → SiteConfig ────────────────────────────── */

function isValidHex(v: unknown): v is string {
  return typeof v === "string" && /^#[0-9a-fA-F]{6}$/.test(v);
}

export function apiConfigToSiteConfig(
  apiConfig: Record<string, unknown>
): SiteConfig {
  const normalizedApiConfig = normalizeSitePayload(apiConfig);

  // Merge theme
  const raw = (normalizedApiConfig.theme ?? {}) as Record<string, unknown>;
  const theme: SiteTheme = {
    primary:    isValidHex(raw.primary)    ? raw.primary    : DEFAULT_THEME.primary,
    secondary:  isValidHex(raw.secondary)  ? raw.secondary  : DEFAULT_THEME.secondary,
    background: isValidHex(raw.background) ? raw.background : DEFAULT_THEME.background,
    surface:    isValidHex(raw.surface)    ? raw.surface    : DEFAULT_THEME.surface,
    text:       isValidHex(raw.text)       ? raw.text       : DEFAULT_THEME.text,
    textMuted:  isValidHex(raw.textMuted)  ? raw.textMuted  : DEFAULT_THEME.textMuted,
    border:     isValidHex(raw.border)     ? raw.border     : DEFAULT_THEME.border,
    font:       typeof raw.font === "string" && raw.font.trim() ? raw.font : DEFAULT_THEME.font,
  };

  // Multi-pages format
  if (Array.isArray(normalizedApiConfig.pages)) {
    const pages: SitePage[] = (normalizedApiConfig.pages as Record<string, unknown>[]).map((p, index) => {
      const sections = (p.sections as string[]) ?? [];
      const dataRecord = (p.data ?? {}) as Record<string, Record<string, unknown>>;
      const data: Record<string, Record<string, unknown>> = {};
      for (const key of sections) {
        if (dataRecord[key]) data[key] = dataRecord[key];
      }
      return {
        id:         uid(),
        name:       (p.name as string) ?? (index === 0 ? "Accueil" : "Page"),
        slug:       sanitizePageSlug(p.slug, p.name, index === 0),
        sections,
        data,
        animations: (p.animations as Record<string, SectionAnimation[]>) ?? {},
      };
    });
    return { pages, theme };
  }

  // Fallback: ancien format mono-page
  const sections = (normalizedApiConfig.sections as string[]) ?? [];
  const data: Record<string, Record<string, unknown>> = {};
  for (const key of sections) {
    if ((normalizedApiConfig.data as Record<string, unknown> | undefined)?.[key]) {
      data[key] = (normalizedApiConfig.data as Record<string, Record<string, unknown>>)[key];
    }
  }
  return {
    pages: [{ id: uid(), name: "Accueil", slug: "", sections, data, animations: {} }],
    theme,
  };
}
