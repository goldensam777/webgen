"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/* ── Types ──────────────────────────────────────────────────── */

export interface SiteTheme {
  primary:    string;
  secondary:  string;
  background: string;
  surface:    string;
  text:       string;
  textMuted:  string;
  border:     string;
}

export interface SitePage {
  id:       string;
  name:     string;   // ex: "Accueil"
  slug:     string;   // ex: "accueil" (vide = page d'accueil)
  sections: string[];
  data:     Record<string, Record<string, unknown>>;
}

export interface SiteConfig {
  pages: SitePage[];
  theme: SiteTheme;
}

interface SiteStore {
  config:          SiteConfig | null;
  activePageId:    string | null;

  setConfig:       (config: SiteConfig) => void;
  clearConfig:     () => void;
  setActivePage:   (id: string) => void;

  /* page-level */
  addPage:         (name: string) => void;
  removePage:      (id: string) => void;
  renamePage:      (id: string, name: string) => void;

  /* theme */
  updateTheme:     (key: keyof SiteTheme, value: string) => void;

  /* section-level (agit sur la page active) */
  updateSection:   (section: string, data: Record<string, unknown>) => void;
  addSection:      (section: string) => void;
  removeSection:   (section: string) => void;
  reorderSections: (sections: string[]) => void;
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

export const useSiteStore = create<SiteStore>()(
  persist(
    (set, get) => ({
      config:       null,
      activePageId: null,

      setConfig: (config) => set({
        config,
        activePageId: config.pages[0]?.id ?? null,
      }),

      clearConfig: () => set({ config: null, activePageId: null }),

      setActivePage: (id) => set({ activePageId: id }),

      /* ── pages ── */

      addPage: (name) => set((s) => {
        if (!s.config) return s;
        const slug = name.toLowerCase()
          .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
        const page: SitePage = {
          id: uid(), name, slug,
          sections: ["navbar", "hero", "footer"],
          data: {},
        };
        return {
          config:       { ...s.config, pages: [...s.config.pages, page] },
          activePageId: page.id,
        };
      }),

      removePage: (id) => set((s) => {
        if (!s.config || s.config.pages.length <= 1) return s;
        const pages    = s.config.pages.filter(p => p.id !== id);
        const activeId = s.activePageId === id ? (pages[0]?.id ?? null) : s.activePageId;
        return { config: { ...s.config, pages }, activePageId: activeId };
      }),

      renamePage: (id, name) => set((s) => {
        if (!s.config) return s;
        return { config: mapPage(s.config, id, p => ({ ...p, name })) };
      }),

      /* ── theme ── */

      updateTheme: (key, value) => set((s) => s.config ? {
        config: { ...s.config, theme: { ...s.config.theme, [key]: value } }
      } : s),

      /* ── sections (page active) ── */

      updateSection: (section, data) => set((s) => {
        if (!s.config) return s;
        const page = activePage(s.config, s.activePageId);
        if (!page) return s;
        return {
          config: mapPage(s.config, page.id, p => ({
            ...p, data: { ...p.data, [section]: data },
          })),
        };
      }),

      addSection: (section) => set((s) => {
        if (!s.config) return s;
        const page = activePage(s.config, s.activePageId);
        if (!page || page.sections.includes(section)) return s;
        return {
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
          config: mapPage(s.config, page.id, p => ({
            ...p, sections: p.sections.filter(v => v !== section),
          })),
        };
      }),

      reorderSections: (sections) => set((s) => {
        if (!s.config) return s;
        const page = activePage(s.config, s.activePageId);
        if (!page) return s;
        return { config: mapPage(s.config, page.id, p => ({ ...p, sections })) };
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
      // Efface automatiquement les configs en ancien format (sans pages[])
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
  // Merge theme
  const raw = (apiConfig.theme ?? {}) as Record<string, unknown>;
  const theme: SiteTheme = {
    primary:    isValidHex(raw.primary)    ? raw.primary    : DEFAULT_THEME.primary,
    secondary:  isValidHex(raw.secondary)  ? raw.secondary  : DEFAULT_THEME.secondary,
    background: isValidHex(raw.background) ? raw.background : DEFAULT_THEME.background,
    surface:    isValidHex(raw.surface)    ? raw.surface    : DEFAULT_THEME.surface,
    text:       isValidHex(raw.text)       ? raw.text       : DEFAULT_THEME.text,
    textMuted:  isValidHex(raw.textMuted)  ? raw.textMuted  : DEFAULT_THEME.textMuted,
    border:     isValidHex(raw.border)     ? raw.border     : DEFAULT_THEME.border,
  };

  // Multi-pages format
  if (Array.isArray(apiConfig.pages)) {
    const pages: SitePage[] = (apiConfig.pages as Record<string, unknown>[]).map(p => {
      const sections = (p.sections as string[]) ?? [];
      const data: Record<string, Record<string, unknown>> = {};
      for (const key of sections) {
        if (p[key]) data[key] = p[key] as Record<string, unknown>;
      }
      return {
        id:   uid(),
        name: (p.name as string) ?? "Page",
        slug: (p.slug as string) ?? "",
        sections,
        data,
      };
    });
    return { pages, theme };
  }

  // Fallback: ancien format mono-page
  const sections = (apiConfig.sections as string[]) ?? [];
  const data: Record<string, Record<string, unknown>> = {};
  for (const key of sections) {
    if (apiConfig[key]) data[key] = apiConfig[key] as Record<string, unknown>;
  }
  return {
    pages: [{ id: uid(), name: "Accueil", slug: "", sections, data }],
    theme,
  };
}
