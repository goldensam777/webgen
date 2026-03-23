"use client";
import { useState } from "react";
import { useSiteStore } from "@/app/store/siteStore";

// ── Types ──────────────────────────────────────────────────────────────────

type SimpleField = { type: "text" | "textarea"; label: string; key: string };

type Field =
  | { type: "text" | "textarea"; label: string; key: string }
  | { type: "select"; label: string; key: string; options: string[] }
  | { type: "array-objects"; label: string; key: string; fields: SimpleField[]; itemLabel?: string };

// ── Schema ─────────────────────────────────────────────────────────────────

const SCHEMA: Record<string, Field[]> = {
  navbar: [
    { type: "text",    label: "Logo / Nom",    key: "logo" },
    { type: "array-objects", label: "Liens de navigation", key: "links", itemLabel: "Lien",
      fields: [
        { type: "text", label: "Titre", key: "label" },
        { type: "text", label: "URL",   key: "href"  },
      ],
    },
    { type: "text", label: "Texte du bouton CTA", key: "ctaLabel" },
    { type: "text", label: "URL du bouton CTA",   key: "ctaHref"  },
  ],
  hero: [
    { type: "text",     label: "Badge",               key: "badgeLabel"        },
    { type: "text",     label: "Titre",               key: "title"             },
    { type: "text",     label: "Sous-titre",          key: "subtitle"          },
    { type: "textarea", label: "Description",         key: "description"       },
    { type: "text",     label: "CTA principal",       key: "ctaLabel"          },
    { type: "text",     label: "CTA secondaire",      key: "secondaryCtaLabel" },
    { type: "select",   label: "Alignement",          key: "align", options: ["center", "left"] },
  ],
  features: [
    { type: "text", label: "Titre",      key: "title"    },
    { type: "text", label: "Sous-titre", key: "subtitle" },
    { type: "array-objects", label: "Fonctionnalités", key: "items", itemLabel: "Fonctionnalité",
      fields: [
        { type: "text",     label: "Titre",       key: "title"       },
        { type: "textarea", label: "Description", key: "description" },
      ],
    },
  ],
  pricing: [
    { type: "text", label: "Titre",      key: "title"    },
    { type: "text", label: "Sous-titre", key: "subtitle" },
    { type: "array-objects", label: "Plans tarifaires", key: "plans", itemLabel: "Plan",
      fields: [
        { type: "text",     label: "Nom du plan",            key: "name"        },
        { type: "text",     label: "Prix",                   key: "price"       },
        { type: "text",     label: "Période (ex: /mois)",    key: "period"      },
        { type: "textarea", label: "Description",            key: "description" },
        { type: "text",     label: "Texte du bouton",        key: "ctaLabel"    },
        { type: "textarea", label: "Avantages (un par ligne)", key: "features"  },
      ],
    },
  ],
  faq: [
    { type: "text", label: "Titre",      key: "title"    },
    { type: "text", label: "Sous-titre", key: "subtitle" },
    { type: "array-objects", label: "Questions", key: "items", itemLabel: "Question",
      fields: [
        { type: "text",     label: "Question", key: "title"   },
        { type: "textarea", label: "Réponse",  key: "content" },
      ],
    },
  ],
  footer: [
    { type: "text",     label: "Logo / Nom",  key: "logo"        },
    { type: "textarea", label: "Description", key: "description" },
    { type: "text",     label: "Copyright",   key: "copyright"   },
  ],
  stats: [
    { type: "text", label: "Titre",      key: "title"    },
    { type: "text", label: "Sous-titre", key: "subtitle" },
    { type: "array-objects", label: "Statistiques", key: "items", itemLabel: "Statistique",
      fields: [
        { type: "text", label: "Valeur (ex: 10k+)", key: "value"       },
        { type: "text", label: "Label",             key: "label"       },
        { type: "text", label: "Description",       key: "description" },
      ],
    },
  ],
  testimonials: [
    { type: "text", label: "Titre",      key: "title"    },
    { type: "text", label: "Sous-titre", key: "subtitle" },
    { type: "array-objects", label: "Témoignages", key: "items", itemLabel: "Témoignage",
      fields: [
        { type: "textarea", label: "Citation", key: "quote" },
        { type: "text",     label: "Nom",      key: "name"  },
        { type: "text",     label: "Rôle",     key: "role"  },
      ],
    },
  ],
  cta: [
    { type: "text", label: "Titre",           key: "title"        },
    { type: "text", label: "Sous-titre",      key: "subtitle"     },
    { type: "text", label: "CTA principal",   key: "primaryCta"   },
    { type: "text", label: "CTA secondaire",  key: "secondaryCta" },
  ],
  contact: [
    { type: "text", label: "Titre",      key: "title"    },
    { type: "text", label: "Sous-titre", key: "subtitle" },
  ],
};

const SECTION_LABELS: Record<string, string> = {
  navbar: "Navigation", hero: "Accueil", features: "Fonctionnalités",
  stats: "Statistiques", testimonials: "Témoignages", pricing: "Tarifs",
  faq: "FAQ", cta: "Appel à l'action", contact: "Contact", footer: "Pied de page",
};

// ── Helpers ────────────────────────────────────────────────────────────────

function getItemName(item: Record<string, unknown>, index: number, itemLabel: string): string {
  const name = item.label ?? item.name ?? item.title ?? item.value;
  return name ? String(name) : `${itemLabel} ${index + 1}`;
}

// ── Component ──────────────────────────────────────────────────────────────

interface ContentPanelProps {
  section: string;
  onBack: () => void;
}

export function ContentPanel({ section, onBack }: ContentPanelProps) {
  const { config, updateSection } = useSiteStore();
  const [expandedItems, setExpandedItems] = useState<Record<string, Set<number>>>({});

  if (!config) return null;

  const data  = (config.data[section] ?? {}) as Record<string, unknown>;
  const fields = SCHEMA[section] ?? [];

  const update = (key: string, value: unknown) =>
    updateSection(section, { ...data, [key]: value });

  const toggleItem = (fieldKey: string, index: number) =>
    setExpandedItems((prev) => {
      const set = new Set(prev[fieldKey] ?? []);
      set.has(index) ? set.delete(index) : set.add(index);
      return { ...prev, [fieldKey]: set };
    });

  const updateArrayItem = (
    fieldKey: string, index: number, subKey: string, value: unknown
  ) => {
    const arr = [...((data[fieldKey] as Record<string, unknown>[]) ?? [])];
    arr[index] = { ...arr[index], [subKey]: value };
    update(fieldKey, arr);
  };

  const addArrayItem = (fieldKey: string, subFields: SimpleField[]) => {
    const arr = [...((data[fieldKey] as Record<string, unknown>[]) ?? [])];
    const newItem: Record<string, unknown> = {};
    subFields.forEach((f) => { newItem[f.key] = ""; });
    arr.push(newItem);
    update(fieldKey, arr);
    setExpandedItems((prev) => {
      const set = new Set(prev[fieldKey] ?? []);
      set.add(arr.length - 1);
      return { ...prev, [fieldKey]: set };
    });
  };

  const removeArrayItem = (fieldKey: string, index: number) => {
    const arr = [...((data[fieldKey] as Record<string, unknown>[]) ?? [])];
    arr.splice(index, 1);
    update(fieldKey, arr);
  };

  const inputCls = `w-full text-xs border border-gray-200 rounded px-2 py-1.5
    focus:outline-none focus:border-blue-400 bg-white`;
  const labelCls = "text-xs text-gray-500 mb-1 block";

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 shrink-0">
        <button
          onClick={onBack}
          className="text-gray-400 hover:text-gray-700 transition-colors"
          title="Retour"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-sm font-semibold text-gray-800">
          {SECTION_LABELS[section] ?? section}
        </span>
      </div>

      {/* Fields */}
      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-4">
        {fields.map((field) => {

          /* ── text ── */
          if (field.type === "text") return (
            <div key={field.key}>
              <label className={labelCls}>{field.label}</label>
              <input
                type="text"
                className={inputCls}
                value={(data[field.key] as string) ?? ""}
                onChange={(e) => update(field.key, e.target.value)}
              />
            </div>
          );

          /* ── textarea ── */
          if (field.type === "textarea") return (
            <div key={field.key}>
              <label className={labelCls}>{field.label}</label>
              <textarea
                className={`${inputCls} resize-none`}
                rows={3}
                value={(data[field.key] as string) ?? ""}
                onChange={(e) => update(field.key, e.target.value)}
              />
            </div>
          );

          /* ── select ── */
          if (field.type === "select") return (
            <div key={field.key}>
              <label className={labelCls}>{field.label}</label>
              <select
                className={inputCls}
                value={(data[field.key] as string) ?? field.options[0]}
                onChange={(e) => update(field.key, e.target.value)}
              >
                {field.options.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          );

          /* ── array-objects ── */
          if (field.type === "array-objects") {
            const items     = (data[field.key] as Record<string, unknown>[]) ?? [];
            const expanded  = expandedItems[field.key] ?? new Set<number>();
            const itemLabel = field.itemLabel ?? "Item";

            return (
              <div key={field.key}>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-gray-600">{field.label}</label>
                  <button
                    onClick={() => addArrayItem(field.key, field.fields)}
                    className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-0.5"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Ajouter
                  </button>
                </div>

                <div className="flex flex-col gap-1">
                  {items.map((item, i) => {
                    const isExpanded = expanded.has(i);

                    return (
                      <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">

                        {/* Item header */}
                        <div
                          className="flex items-center justify-between px-3 py-2 bg-gray-50
                            cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => toggleItem(field.key, i)}
                        >
                          <span className="text-xs font-medium text-gray-700 truncate flex-1">
                            {getItemName(item, i, itemLabel)}
                          </span>
                          <div className="flex items-center gap-1 ml-2 shrink-0">
                            <button
                              onClick={(e) => { e.stopPropagation(); removeArrayItem(field.key, i); }}
                              className="text-gray-300 hover:text-red-400 transition-colors"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                            <svg
                              className={`w-3.5 h-3.5 text-gray-400 transition-transform
                                ${isExpanded ? "rotate-180" : ""}`}
                              fill="none" viewBox="0 0 24 24" stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>

                        {/* Item fields */}
                        {isExpanded && (
                          <div className="px-3 py-3 flex flex-col gap-2 bg-white border-t border-gray-100">
                            {field.fields.map((subField) => {
                              // features: string[] → textarea (one per line)
                              if (subField.key === "features" && Array.isArray(item[subField.key])) {
                                return (
                                  <div key={subField.key}>
                                    <label className={labelCls}>{subField.label}</label>
                                    <textarea
                                      className={`${inputCls} resize-none`}
                                      rows={4}
                                      value={(item[subField.key] as string[]).join("\n")}
                                      onChange={(e) =>
                                        updateArrayItem(field.key, i, subField.key,
                                          e.target.value.split("\n"))
                                      }
                                    />
                                  </div>
                                );
                              }

                              if (subField.type === "textarea") return (
                                <div key={subField.key}>
                                  <label className={labelCls}>{subField.label}</label>
                                  <textarea
                                    className={`${inputCls} resize-none`}
                                    rows={3}
                                    value={(item[subField.key] as string) ?? ""}
                                    onChange={(e) =>
                                      updateArrayItem(field.key, i, subField.key, e.target.value)
                                    }
                                  />
                                </div>
                              );

                              return (
                                <div key={subField.key}>
                                  <label className={labelCls}>{subField.label}</label>
                                  <input
                                    type="text"
                                    className={inputCls}
                                    value={(item[subField.key] as string) ?? ""}
                                    onChange={(e) =>
                                      updateArrayItem(field.key, i, subField.key, e.target.value)
                                    }
                                  />
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {items.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-3">
                      Aucun élément. Cliquez sur «&nbsp;Ajouter&nbsp;».
                    </p>
                  )}
                </div>
              </div>
            );
          }

          return null;
        })}

        {fields.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-8">
            Pas de champs éditables pour cette section.
          </p>
        )}
      </div>
    </div>
  );
}
