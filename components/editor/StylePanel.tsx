// components/editor/StylePanel.tsx
"use client";
import { useSiteStore, SiteTheme } from "@/app/store/siteStore";
import { ColorPicker } from "@/components/ui/ColorPicker";

const THEME_LABELS: Record<keyof SiteTheme, string> = {
  primary:    "Couleur principale",
  secondary:  "Couleur secondaire",
  background: "Fond de page",
  surface:    "Fond des cartes",
  text:       "Texte principal",
  textMuted:  "Texte secondaire",
  border:     "Bordures",
};

export function StylePanel() {
  const { config, updateTheme } = useSiteStore();
  if (!config) return null;

  return (
    <div className="flex flex-col gap-1">
      <p
        className="text-xs font-semibold uppercase tracking-wide px-4 pt-4 pb-2"
        style={{ color: "var(--wg-text-3)" }}
      >
        Couleurs
      </p>
      {(Object.keys(THEME_LABELS) as (keyof SiteTheme)[]).map((key) => (
        <div
          key={key}
          className="flex items-center justify-between px-4 py-2 rounded-lg mx-1 transition-colors"
          style={{ color: "var(--wg-text)" }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = "var(--wg-bg-3)")}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
        >
          <span className="text-sm" style={{ color: "var(--wg-text-2)" }}>
            {THEME_LABELS[key]}
          </span>
          <ColorPicker
            value={config.theme[key]}
            onChange={(v) => updateTheme(key, v)}
            size="sm"
            showPresets={false}
            showInput
          />
        </div>
      ))}
    </div>
  );
}
