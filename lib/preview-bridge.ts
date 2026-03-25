import type { SiteConfig } from "@/app/store/siteStore";

/** Messages envoyés du parent (EditorLayout) → iframe (/preview) */
export type ParentMsg =
  | { type: "config"; config: SiteConfig; pageId: string }
  | { type: "highlight"; sectionId: string | null };

/** Messages envoyés de l'iframe (/preview) → parent (EditorLayout) */
export type PreviewMsg =
  | { type: "ready" }
  | { type: "select"; sectionId: string }
  | { type: "navigate"; pageId: string }
  | { type: "update"; sectionId: string; field: string; value: string }
  | { type: "style-update"; sectionId: string; field: string; style: { fontSize?: string; fontWeight?: string } }
  | { type: "element-style-update"; sectionId: string; elementId: string; style: Record<string, unknown> };
