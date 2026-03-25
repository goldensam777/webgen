// components/editor/StylePanel.tsx
"use client";
import { useSiteStore, SiteTheme } from "@/app/store/siteStore";
import { ColorPicker } from "@/components/ui/ColorPicker";

const COLOR_KEYS: (keyof SiteTheme)[] = [
  "primary", "secondary", "background", "surface", "text", "textMuted", "border",
];

const THEME_LABELS: Record<keyof SiteTheme, string> = {
  primary:    "Couleur principale",
  secondary:  "Couleur secondaire",
  background: "Fond de page",
  surface:    "Fond des cartes",
  text:       "Texte principal",
  textMuted:  "Texte secondaire",
  border:     "Bordures",
  font:       "Police",
};

const FONTS = [
  "Inter", "Poppins", "Roboto", "Lato", "Montserrat",
  "Raleway", "Nunito", "Open Sans", "Playfair Display",
  "Merriweather", "DM Sans", "Space Grotesk",
];

export function StylePanel() {
  const { config, updateTheme } = useSiteStore();
  if (!config) return null;

  const currentFont = config.theme.font || "Inter";

  return (
    <div className="flex flex-col gap-1">

      {/* Police */}
      <p className="text-xs font-semibold uppercase tracking-wide px-4 pt-4 pb-2"
        style={{ color: "var(--wg-text-3)" }}>
        Typographie
      </p>
      <div
        className="flex items-center justify-between px-4 py-2 rounded-lg mx-1 transition-colors"
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = "var(--wg-bg-3)")}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
      >
        <span className="text-sm" style={{ color: "var(--wg-text-2)" }}>
          {THEME_LABELS.font}
        </span>
        <select
          value={currentFont}
          onChange={e => updateTheme("font", e.target.value)}
          className="text-xs rounded px-2 py-1 border focus:outline-none"
          style={{
            backgroundColor: "var(--wg-bg)",
            borderColor:     "var(--wg-border)",
            color:           "var(--wg-text)",
            fontFamily:      `'${currentFont}', sans-serif`,
          }}
        >
          {FONTS.map(f => (
            <option key={f} value={f} style={{ fontFamily: `'${f}', sans-serif` }}>{f}</option>
          ))}
        </select>
      </div>

      {/* Couleurs */}
      <p className="text-xs font-semibold uppercase tracking-wide px-4 pt-4 pb-2"
        style={{ color: "var(--wg-text-3)" }}>
        Couleurs
      </p>
      {COLOR_KEYS.map((key) => (
        <div
          key={key}
          className="flex items-center justify-between px-4 py-2 rounded-lg mx-1 transition-colors"
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
