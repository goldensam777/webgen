"use client";
import { useState } from "react";
import { useSiteStore, useActivePage } from "@/app/store/siteStore";
import { MediaLibrary } from "./MediaLibrary";

// ── Types ──────────────────────────────────────────────────────────────────

type SimpleField = { type: "text" | "textarea"; label: string; key: string };

type Field =
  | { type: "text" | "textarea"; label: string; key: string }
  | { type: "select";  label: string; key: string; options: string[] }
  | { type: "media";   label: string; key: string; accept?: string }
  | { type: "array-objects"; label: string; key: string; fields: SimpleField[]; itemLabel?: string };

// ── Schema ─────────────────────────────────────────────────────────────────

const SCHEMA: Record<string, Field[]> = {
  navbar: [
    { type: "text",  label: "Logo / Nom",       key: "logo"     },
    { type: "media", label: "Logo image",        key: "logoSrc", accept: "image/*" },
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
    { type: "media",    label: "Image hero",          key: "imageSrc", accept: "image/*" },
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
    { type: "media",    label: "Logo image",  key: "logoSrc", accept: "image/*" },
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
  const { updateSection } = useSiteStore();
  const activePage = useActivePage();
  const [expandedItems, setExpandedItems] = useState<Record<string, Set<number>>>({});
  const [mediaField,    setMediaField]    = useState<{ key: string; accept?: string } | null>(null);

  if (!activePage) return null;

  const data  = (activePage.data[section] ?? {}) as Record<string, unknown>;
  const fields = SCHEMA[section] ?? [];

  const update = (key: string, value: unknown) =>
    updateSection(section, { ...data, [key]: value });

  const toggleItem = (fieldKey: string, index: number) =>
    setExpandedItems((prev) => {
      const set = new Set(prev[fieldKey] ?? []);
      if (set.has(index)) set.delete(index);
      else set.add(index);
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

  const inputCls = "w-full text-xs rounded px-2 py-1.5 focus:outline-none border";
  const inputStyle: React.CSSProperties = {
    backgroundColor: "var(--wg-bg)",
    borderColor:     "var(--wg-border)",
    color:           "var(--wg-text)",
  };
  const labelCls = "text-xs mb-1 block";
  const labelStyle: React.CSSProperties = { color: "var(--wg-text-2)" };

  return (
    <div className="flex flex-col h-full">
      {/* Media library portal */}
      {mediaField && (
        <MediaLibrary
          accept={mediaField.accept}
          onSelect={(url) => update(mediaField.key, url)}
          onClose={() => setMediaField(null)}
        />
      )}

      {/* Header */}
      <div
        className="flex items-center gap-2 px-4 py-3 border-b shrink-0"
        style={{ borderColor: "var(--wg-border)" }}
      >
        <button
          onClick={onBack}
          className="transition-colors"
          style={{ color: "var(--wg-text-3)" }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--wg-text)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--wg-text-3)")}
          title="Retour"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-sm font-semibold" style={{ color: "var(--wg-text)" }}>
          {SECTION_LABELS[section] ?? section}
        </span>
      </div>

      {/* Fields */}
      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-4">
        {fields.map((field) => {

          /* ── text ── */
          if (field.type === "text") return (
            <div key={field.key}>
              <label className={labelCls} style={labelStyle}>{field.label}</label>
              <input
                type="text"
                className={inputCls}
                style={inputStyle}
                value={(data[field.key] as string) ?? ""}
                onChange={(e) => update(field.key, e.target.value)}
              />
            </div>
          );

          /* ── textarea ── */
          if (field.type === "textarea") return (
            <div key={field.key}>
              <label className={labelCls} style={labelStyle}>{field.label}</label>
              <textarea
                className={`${inputCls} resize-none`}
                style={inputStyle}
                rows={3}
                value={(data[field.key] as string) ?? ""}
                onChange={(e) => update(field.key, e.target.value)}
              />
            </div>
          );

          /* ── select ── */
          if (field.type === "select") return (
            <div key={field.key}>
              <label className={labelCls} style={labelStyle}>{field.label}</label>
              <select
                className={inputCls}
                style={inputStyle}
                value={(data[field.key] as string) ?? field.options[0]}
                onChange={(e) => update(field.key, e.target.value)}
              >
                {field.options.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          );

          /* ── media ── */
          if (field.type === "media") {
            const url = (data[field.key] as string) ?? "";
            const isImage = url && /\.(jpe?g|png|gif|webp|svg)(\?|$)/i.test(url);
            return (
              <div key={field.key}>
                <label className={labelCls} style={labelStyle}>{field.label}</label>
                <div className="flex flex-col gap-2">
                  {url && (
                    <div
                      className="relative rounded-lg overflow-hidden border"
                      style={{ borderColor: "var(--wg-border)" }}
                    >
                      {isImage ? (
                        <img src={url} alt="" className="w-full h-24 object-cover" />
                      ) : (
                        <div className="flex items-center gap-2 px-3 py-2" style={{ backgroundColor: "var(--wg-bg-3)" }}>
                          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                            style={{ color: "var(--wg-text-3)" }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                              d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32" />
                          </svg>
                          <span className="text-xs truncate" style={{ color: "var(--wg-text-2)" }}>
                            {url.split("/").pop()}
                          </span>
                        </div>
                      )}
                      <button
                        onClick={() => update(field.key, "")}
                        className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center
                          transition-colors text-white text-xs"
                        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#ef4444")}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.5)")}
                        title="Supprimer"
                      >✕</button>
                    </div>
                  )}
                  <button
                    onClick={() => setMediaField({ key: field.key, accept: field.accept })}
                    className="flex items-center justify-center gap-2 py-2 rounded-lg border text-xs font-medium
                      transition-colors"
                    style={{
                      borderColor:     "var(--wg-border)",
                      color:           "var(--wg-green)",
                      backgroundColor: "var(--wg-bg)",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = "var(--wg-green-muted)")}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = "var(--wg-bg)")}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {url ? "Changer le média" : "Choisir un média"}
                  </button>
                </div>
              </div>
            );
          }

          /* ── array-objects ── */
          if (field.type === "array-objects") {
            const items     = (data[field.key] as Record<string, unknown>[]) ?? [];
            const expanded  = expandedItems[field.key] ?? new Set<number>();
            const itemLabel = field.itemLabel ?? "Item";

            return (
              <div key={field.key}>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold" style={{ color: "var(--wg-text-2)" }}>{field.label}</label>
                  <button
                    onClick={() => addArrayItem(field.key, field.fields)}
                    className="text-xs flex items-center gap-0.5 transition-colors"
                    style={{ color: "var(--wg-green)" }}
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
                      <div key={i} className="rounded-lg overflow-hidden border" style={{ borderColor: "var(--wg-border)" }}>

                        {/* Item header */}
                        <div
                          className="flex items-center justify-between px-3 py-2 cursor-pointer transition-colors"
                          style={{ backgroundColor: "var(--wg-bg-3)" }}
                          onMouseEnter={e => (e.currentTarget.style.filter = "brightness(0.96)")}
                          onMouseLeave={e => (e.currentTarget.style.filter = "")}
                          onClick={() => toggleItem(field.key, i)}
                        >
                          <span className="text-xs font-medium truncate flex-1" style={{ color: "var(--wg-text)" }}>
                            {getItemName(item, i, itemLabel)}
                          </span>
                          <div className="flex items-center gap-1 ml-2 shrink-0">
                            <button
                              onClick={(e) => { e.stopPropagation(); removeArrayItem(field.key, i); }}
                              className="transition-colors"
                              style={{ color: "var(--wg-text-3)" }}
                              onMouseEnter={e => (e.currentTarget.style.color = "#ef4444")}
                              onMouseLeave={e => (e.currentTarget.style.color = "var(--wg-text-3)")}
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
                          <div
                            className="px-3 py-3 flex flex-col gap-2 border-t"
                            style={{ borderColor: "var(--wg-border)" }}
                          >
                            {field.fields.map((subField) => {
                              if (subField.key === "features" && Array.isArray(item[subField.key])) {
                                return (
                                  <div key={subField.key}>
                                    <label className={labelCls} style={labelStyle}>{subField.label}</label>
                                    <textarea
                                      className={`${inputCls} resize-none`}
                                      style={inputStyle}
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
                                  <label className={labelCls} style={labelStyle}>{subField.label}</label>
                                  <textarea
                                    className={`${inputCls} resize-none`}
                                    style={inputStyle}
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
                                  <label className={labelCls} style={labelStyle}>{subField.label}</label>
                                  <input
                                    type="text"
                                    className={inputCls}
                                    style={inputStyle}
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
                    <p className="text-xs text-center py-3" style={{ color: "var(--wg-text-3)" }}>
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
          <p className="text-xs text-center py-8" style={{ color: "var(--wg-text-3)" }}>
            Pas de champs éditables pour cette section.
          </p>
        )}
      </div>
    </div>
  );
}
