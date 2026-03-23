"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface SiteTheme {
  primary:    string;
  secondary:  string;
  background: string;
  surface:    string;
  text:       string;
  textMuted:  string;
  border:     string;
}

export interface SiteConfig {
  sections: string[];
  theme:    SiteTheme;
  data:     Record<string, Record<string, unknown>>;
}

interface SiteStore {
  config:          SiteConfig | null;
  setConfig:       (config: SiteConfig) => void;
  clearConfig:     () => void;
  updateTheme:     (key: keyof SiteTheme, value: string) => void;
  updateSection:   (section: string, data: Record<string, unknown>) => void;
  addSection:      (section: string) => void;
  removeSection:   (section: string) => void;
  reorderSections: (sections: string[]) => void;
}

const DEFAULT_THEME: SiteTheme = {
  primary:    "#2563eb",
  secondary:  "#7c3aed",
  background: "#f9fafb",
  surface:    "#ffffff",
  text:       "#111827",
  textMuted:  "#6b7280",
  border:     "#e5e7eb",
};

export const useSiteStore = create<SiteStore>()(
  persist(
    (set) => ({
      config: null,

      setConfig: (config) => set({ config }),

      clearConfig: () => set({ config: null }),

      updateTheme: (key, value) =>
        set((s) => s.config ? {
          config: {
            ...s.config,
            theme: { ...s.config.theme, [key]: value },
          }
        } : s),

      updateSection: (section, data) =>
        set((s) => s.config ? {
          config: {
            ...s.config,
            data: { ...s.config.data, [section]: data },
          }
        } : s),

      addSection: (section) =>
        set((s) => s.config && !s.config.sections.includes(section) ? {
          config: {
            ...s.config,
            sections: [...s.config.sections, section],
          }
        } : s),

      removeSection: (section) =>
        set((s) => s.config ? {
          config: {
            ...s.config,
            sections: s.config.sections.filter((v) => v !== section),
          }
        } : s),

      reorderSections: (sections) =>
        set((s) => s.config ? {
          config: { ...s.config, sections }
        } : s),
    }),
    {
      name:    "webgen-site",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

function isValidHex(v: unknown): v is string {
  return typeof v === "string" && /^#[0-9a-fA-F]{6}$/.test(v);
}

export function apiConfigToSiteConfig(
  apiConfig: Record<string, unknown>
): SiteConfig {
  const sections = (apiConfig.sections as string[]) ?? [];
  const data: Record<string, Record<string, unknown>> = {};
  for (const key of sections) {
    if (apiConfig[key]) {
      data[key] = apiConfig[key] as Record<string, unknown>;
    }
  }

  // Merge generated theme with defaults — only accept valid hex values
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

  return { sections, theme, data };
}
