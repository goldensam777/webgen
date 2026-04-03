export type FieldType = "text" | "textarea" | "url" | "select" | "array" | "color";

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
      { key: "bgColor",      label: "Fond",         type: "color" },
      { key: "logoColor",    label: "Logo",          type: "color" },
      { key: "textColor",    label: "Liens",         type: "color" },
      { key: "borderColor",  label: "Bordure",       type: "color" },
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
      { key: "bgColor",             label: "Fond",               type: "color" },
      { key: "titleColor",          label: "Titre",              type: "color" },
      { key: "subtitleColor",       label: "Sous-titre",         type: "color" },
      { key: "descriptionColor",    label: "Description",        type: "color" },
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
      { key: "bgColor",        label: "Fond",            type: "color" },
      { key: "titleColor",     label: "Titre",           type: "color" },
      { key: "subtitleColor",  label: "Sous-titre",      type: "color" },
      { key: "itemTitleColor", label: "Titre des items", type: "color" },
      { key: "itemDescColor",  label: "Texte des items", type: "color" },
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
      { key: "bgColor",          label: "Fond",        type: "color" },
      { key: "titleColor",       label: "Titre",       type: "color" },
      { key: "subtitleColor",    label: "Sous-titre",  type: "color" },
      { key: "valueColor",       label: "Valeurs",     type: "color" },
      { key: "labelColor",       label: "Labels",      type: "color" },
      { key: "descriptionColor", label: "Description", type: "color" },
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
      { key: "bgColor",       label: "Fond",       type: "color" },
      { key: "titleColor",    label: "Titre",      type: "color" },
      { key: "subtitleColor", label: "Sous-titre", type: "color" },
      { key: "quoteColor",    label: "Citations",  type: "color" },
      { key: "nameColor",     label: "Noms",       type: "color" },
      { key: "roleColor",     label: "Rôles",      type: "color" },
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
      { key: "bgColor",       label: "Fond",       type: "color" },
      { key: "titleColor",    label: "Titre",      type: "color" },
      { key: "subtitleColor", label: "Sous-titre", type: "color" },
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
      { key: "bgColor",       label: "Fond",       type: "color" },
      { key: "titleColor",    label: "Titre",      type: "color" },
      { key: "subtitleColor", label: "Sous-titre", type: "color" },
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
      { key: "bgColor",           label: "Fond",              type: "color" },
      { key: "titleColor",        label: "Titre",             type: "color" },
    ],
  },

  contact: {
    label: "Contact",
    fields: [
      { key: "title",    label: "Titre",      type: "text"     },
      { key: "subtitle", label: "Sous-titre", type: "textarea" },
      { key: "email",    label: "Email",      type: "text"     },
      { key: "phone",    label: "Téléphone",  type: "text"     },
      { key: "address",  label: "Adresse",    type: "textarea" },
      { key: "ctaLabel", label: "Bouton",     type: "text"     },
      { key: "bgColor",       label: "Fond",       type: "color" },
      { key: "titleColor",    label: "Titre",      type: "color" },
      { key: "subtitleColor", label: "Sous-titre", type: "color" },
    ],
  },

  footer: {
    label: "Footer",
    fields: [
      { key: "logo",        label: "Nom / Logo",  type: "text"     },
      { key: "description", label: "Description", type: "textarea" },
      { key: "copyright",   label: "Copyright",   type: "text"     },
      { key: "bgColor",            label: "Fond",          type: "color" },
      { key: "logoColor",          label: "Logo",          type: "color" },
      { key: "descriptionColor",   label: "Description",   type: "color" },
      { key: "sectionTitleColor",  label: "Titres groupes",type: "color" },
      { key: "linkColor",          label: "Liens",         type: "color" },
      { key: "copyrightColor",     label: "Copyright",     type: "color" },
      { key: "borderColor",        label: "Bordure",       type: "color" },
    ],
  },

  blog: {
    label: "Blog",
    fields: [
      { key: "title",    label: "Titre",      type: "text"     },
      { key: "subtitle", label: "Sous-titre", type: "textarea" },
      { key: "ctaLabel", label: "Bouton",     type: "text"     },
      { key: "bgColor",      label: "Fond",       type: "color" },
      { key: "titleColor",   label: "Titre",      type: "color" },
    ],
  },

  chatwidget: {
    label: "Chat IA",
    fields: [
      { key: "greeting",    label: "Message d'accueil", type: "textarea" },
      { key: "placeholder", label: "Placeholder",       type: "text"     },
      { key: "buttonLabel", label: "Label bouton",      type: "text"     },
      { key: "bgColor",     label: "Fond",              type: "color" },
    ],
  },
};
