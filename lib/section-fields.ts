export type FieldType = "text" | "textarea" | "url" | "select" | "array";

export interface FieldDef {
  key:         string;
  label:       string;
  type:        FieldType;
  options?:    string[];    // pour le type "select"
  itemFields?: FieldDef[];  // pour le type "array"
  itemLabel?:  string;      // label d'un item (ex: "Témoignage")
}

export interface SectionDef {
  label:  string;
  fields: FieldDef[];
}

export const SECTION_FIELDS: Record<string, SectionDef> = {
  navbar: {
    label: "Navbar",
    fields: [
      { key: "logo",     label: "Nom / Logo",  type: "text" },
      { key: "ctaLabel", label: "Bouton CTA",  type: "text" },
      { key: "ctaHref",  label: "Lien CTA",    type: "url"  },
      {
        key:        "links",
        label:      "Liens de navigation",
        type:       "array",
        itemLabel:  "Lien",
        itemFields: [
          { key: "label", label: "Texte", type: "text" },
          { key: "href",  label: "URL",   type: "url"  },
        ],
      },
    ],
  },

  hero: {
    label: "Hero",
    fields: [
      { key: "title",               label: "Titre",              type: "text"     },
      { key: "subtitle",            label: "Sous-titre",         type: "text"     },
      { key: "description",         label: "Description",        type: "textarea" },
      { key: "badgeLabel",          label: "Badge",              type: "text"     },
      { key: "ctaLabel",            label: "Bouton principal",   type: "text"     },
      { key: "ctaHref",             label: "Lien principal",     type: "url"      },
      { key: "secondaryCtaLabel",   label: "Bouton secondaire",  type: "text"     },
      { key: "secondaryCtaHref",    label: "Lien secondaire",    type: "url"      },
      { key: "align",               label: "Alignement",         type: "select",  options: ["center", "left"] },
    ],
  },

  features: {
    label: "Fonctionnalités",
    fields: [
      { key: "title",    label: "Titre",      type: "text"     },
      { key: "subtitle", label: "Sous-titre", type: "textarea" },
      {
        key:        "items",
        label:      "Fonctionnalités",
        type:       "array",
        itemLabel:  "Fonctionnalité",
        itemFields: [
          { key: "title",       label: "Titre",       type: "text"     },
          { key: "description", label: "Description", type: "textarea" },
        ],
      },
    ],
  },

  stats: {
    label: "Statistiques",
    fields: [
      { key: "title",    label: "Titre",      type: "text"     },
      { key: "subtitle", label: "Sous-titre", type: "textarea" },
      {
        key:        "items",
        label:      "Statistiques",
        type:       "array",
        itemLabel:  "Stat",
        itemFields: [
          { key: "value",       label: "Valeur",      type: "text" },
          { key: "label",       label: "Label",       type: "text" },
          { key: "description", label: "Description", type: "text" },
        ],
      },
    ],
  },

  testimonials: {
    label: "Témoignages",
    fields: [
      { key: "title",    label: "Titre",      type: "text"     },
      { key: "subtitle", label: "Sous-titre", type: "textarea" },
      {
        key:        "items",
        label:      "Témoignages",
        type:       "array",
        itemLabel:  "Témoignage",
        itemFields: [
          { key: "quote", label: "Citation",  type: "textarea" },
          { key: "name",  label: "Nom",       type: "text"     },
          { key: "role",  label: "Rôle",      type: "text"     },
        ],
      },
    ],
  },

  pricing: {
    label: "Tarifs",
    fields: [
      { key: "title",    label: "Titre",      type: "text"     },
      { key: "subtitle", label: "Sous-titre", type: "textarea" },
      {
        key:        "plans",
        label:      "Plans",
        type:       "array",
        itemLabel:  "Plan",
        itemFields: [
          { key: "name",        label: "Nom du plan",  type: "text"     },
          { key: "price",       label: "Prix",         type: "text"     },
          { key: "period",      label: "Période",      type: "text"     },
          { key: "description", label: "Description",  type: "textarea" },
          { key: "ctaLabel",    label: "Bouton CTA",   type: "text"     },
          { key: "ctaHref",     label: "Lien CTA",     type: "url"      },
        ],
      },
    ],
  },

  faq: {
    label: "FAQ",
    fields: [
      { key: "title",    label: "Titre",      type: "text"     },
      { key: "subtitle", label: "Sous-titre", type: "textarea" },
      {
        key:        "items",
        label:      "Questions",
        type:       "array",
        itemLabel:  "Question",
        itemFields: [
          { key: "title",   label: "Question", type: "text"     },
          { key: "content", label: "Réponse",  type: "textarea" },
        ],
      },
    ],
  },

  cta: {
    label: "CTA",
    fields: [
      { key: "title",             label: "Titre",             type: "text"     },
      { key: "description",       label: "Description",       type: "textarea" },
      { key: "ctaLabel",          label: "Bouton principal",  type: "text"     },
      { key: "ctaHref",           label: "Lien principal",    type: "url"      },
      { key: "secondaryCtaLabel", label: "Bouton secondaire", type: "text"     },
      { key: "secondaryCtaHref",  label: "Lien secondaire",   type: "url"      },
    ],
  },

  contact: {
    label: "Contact",
    fields: [
      { key: "title",    label: "Titre",      type: "text"     },
      { key: "subtitle", label: "Sous-titre", type: "textarea" },
      { key: "email",    label: "Email",      type: "text"     },
    ],
  },

  footer: {
    label: "Footer",
    fields: [
      { key: "logo",      label: "Nom / Logo", type: "text" },
      { key: "tagline",   label: "Tagline",    type: "text" },
      { key: "copyright", label: "Copyright",  type: "text" },
    ],
  },
};
