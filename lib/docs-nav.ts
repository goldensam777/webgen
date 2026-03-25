export interface NavCategory {
  category: string;
  slugs:    string[];
}

export const DOCS_NAV: NavCategory[] = [
  {
    category: "Démarrage",
    slugs: ["introduction", "creer-son-site"],
  },
  {
    category: "Éditeur",
    slugs: ["editeur-sections", "editeur-theme", "editeur-canvas", "editeur-inline"],
  },
  {
    category: "Publier & Exporter",
    slugs: ["publier", "telecharger"],
  },
  {
    category: "Génération IA",
    slugs: ["ia-description", "ia-fichiers"],
  },
  {
    category: "Référence",
    slugs: ["ref-sections"],
  },
];

export const FIRST_SLUG = DOCS_NAV[0].slugs[0];

/** Retourne le slug précédent et le suivant dans la nav aplatie */
export function getAdjacentSlugs(slug: string): { prev: string | null; next: string | null } {
  const flat = DOCS_NAV.flatMap(c => c.slugs);
  const idx  = flat.indexOf(slug);
  return {
    prev: idx > 0             ? flat[idx - 1] : null,
    next: idx < flat.length - 1 ? flat[idx + 1] : null,
  };
}
