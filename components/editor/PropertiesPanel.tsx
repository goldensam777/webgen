"use client";
import React, { useState } from "react";
import { SECTION_FIELDS, type FieldDef } from "@/lib/section-fields";
import { useSiteStore, useActivePage } from "@/app/store/siteStore";

interface Props {
  section:    string | null;
  onMoveUp:   () => void;
  onMoveDown: () => void;
  onRemove:   () => void;
  onClose:    () => void;
}

export function PropertiesPanel({ section, onMoveUp, onMoveDown, onRemove, onClose }: Props) {
  const activePage        = useActivePage();
  const { updateSection } = useSiteStore();

  /* ── État vide ── */
  if (!section || !activePage) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 px-6 text-center">
        <svg className="w-10 h-10 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.4}
            d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
        </svg>
        <p className="text-sm" style={{ color: "var(--wg-text-3)" }}>
          Clique sur une section dans l&apos;aperçu pour l&apos;éditer
        </p>
      </div>
    );
  }

  const def  = SECTION_FIELDS[section];
  const data = activePage.data[section] ?? {};

  const update = (key: string, value: string) =>
    updateSection(section, (d) => ({ ...d, [key]: value }));

  const updateArrayItem = (arrayKey: string, idx: number, itemKey: string, value: string) =>
    updateSection(section, (d) => {
      const arr = Array.isArray(d[arrayKey])
        ? [...(d[arrayKey] as Record<string, unknown>[])]
        : [];
      arr[idx] = { ...(arr[idx] ?? {}), [itemKey]: value };
      return { ...d, [arrayKey]: arr };
    });

  const addArrayItem = (arrayKey: string, defaultItem: Record<string, unknown>) =>
    updateSection(section, (d) => ({
      ...d,
      [arrayKey]: [...(Array.isArray(d[arrayKey]) ? (d[arrayKey] as unknown[]) : []), defaultItem],
    }));

  const removeArrayItem = (arrayKey: string, idx: number) =>
    updateSection(section, (d) => {
      const arr = Array.isArray(d[arrayKey]) ? (d[arrayKey] as unknown[]) : [];
      return { ...d, [arrayKey]: arr.filter((_, i) => i !== idx) };
    });

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* ── En-tête ── */}
      <div
        className="shrink-0 flex items-center gap-2 px-4 py-3 border-b"
        style={{ borderColor: "var(--wg-border)" }}
      >
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--wg-text-3)" }}>
            Section sélectionnée
          </p>
          <p className="text-sm font-semibold truncate" style={{ color: "var(--wg-text)" }}>
            {def?.label ?? section}
          </p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <ActionBtn title="Monter" onClick={onMoveUp}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </ActionBtn>
          <ActionBtn title="Descendre" onClick={onMoveDown}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </ActionBtn>
          <ActionBtn title="Supprimer" danger onClick={onRemove}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </ActionBtn>
          <div className="w-px h-4 mx-0.5" style={{ backgroundColor: "var(--wg-border)" }} />
          <ActionBtn title="Fermer" onClick={onClose}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </ActionBtn>
        </div>
      </div>

      {/* ── Champs éditables ── */}
      <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-5">

        {!def ? (
          <p className="text-xs" style={{ color: "var(--wg-text-3)" }}>
            Pas de champs configurables pour cette section.
          </p>
        ) : (
          def.fields.map((field) => {

            /* ── Array field ── */
            if (field.type === "array") {
              const items      = Array.isArray(data[field.key])
                ? (data[field.key] as Record<string, unknown>[])
                : [];
              const defaultItem = Object.fromEntries(
                (field.itemFields ?? []).map((f) => [f.key, ""])
              );

              return (
                <div key={field.key} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold" style={{ color: "var(--wg-text-2)" }}>
                      {field.label}
                      <span className="ml-1.5 font-normal opacity-50">{items.length}</span>
                    </label>
                    <AddBtn onClick={() => addArrayItem(field.key, defaultItem)} />
                  </div>

                  {items.length === 0 && (
                    <p className="text-xs italic py-2 text-center" style={{ color: "var(--wg-text-3)" }}>
                      Aucun élément — cliquez +
                    </p>
                  )}

                  {items.map((item, idx) => (
                    <ArrayItemCard
                      key={idx}
                      idx={idx}
                      item={item}
                      itemLabel={field.itemLabel ?? "Item"}
                      itemFields={field.itemFields ?? []}
                      onUpdate={(itemKey, val) => updateArrayItem(field.key, idx, itemKey, val)}
                      onRemove={() => removeArrayItem(field.key, idx)}
                    />
                  ))}
                </div>
              );
            }

            /* ── Flat field ── */
            const rawVal = data[field.key];
            const value  = rawVal !== undefined && rawVal !== null ? String(rawVal) : "";

            return (
              <div key={field.key} className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold" style={{ color: "var(--wg-text-2)" }}>
                  {field.label}
                  {field.type === "url" && (
                    <span className="ml-1 font-normal opacity-60">url</span>
                  )}
                </label>

                {field.type === "textarea" ? (
                  <textarea
                    value={value}
                    rows={3}
                    onChange={(e) => update(field.key, e.target.value)}
                    className="text-sm rounded-lg border px-3 py-2 focus:outline-none resize-none leading-relaxed"
                    style={{ backgroundColor: "var(--wg-bg)", borderColor: "var(--wg-border)", color: "var(--wg-text)" }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "var(--wg-green)")}
                    onBlur={(e)  => (e.currentTarget.style.borderColor = "var(--wg-border)")}
                  />
                ) : field.type === "select" ? (
                  <select
                    value={value}
                    onChange={(e) => update(field.key, e.target.value)}
                    className="text-sm rounded-lg border px-3 py-2 focus:outline-none"
                    style={{ backgroundColor: "var(--wg-bg)", borderColor: "var(--wg-border)", color: "var(--wg-text)" }}
                  >
                    {field.options?.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : field.type === "url" ? (
                  <input
                    type="text"
                    value={value}
                    placeholder="https://..."
                    onChange={(e) => update(field.key, e.target.value)}
                    className="text-sm rounded-lg border px-3 py-2 focus:outline-none font-mono"
                    style={{ backgroundColor: "var(--wg-bg)", borderColor: "var(--wg-border)", color: "var(--wg-text)" }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "var(--wg-green)")}
                    onBlur={(e)  => (e.currentTarget.style.borderColor = "var(--wg-border)")}
                  />
                ) : (
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => update(field.key, e.target.value)}
                    className="text-sm rounded-lg border px-3 py-2 focus:outline-none"
                    style={{ backgroundColor: "var(--wg-bg)", borderColor: "var(--wg-border)", color: "var(--wg-text)" }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "var(--wg-green)")}
                    onBlur={(e)  => (e.currentTarget.style.borderColor = "var(--wg-border)")}
                  />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

/* ── Array item card ─────────────────────────────────────────── */

interface ArrayItemCardProps {
  idx:        number;
  item:       Record<string, unknown>;
  itemLabel:  string;
  itemFields: FieldDef[];
  onUpdate:   (key: string, value: string) => void;
  onRemove:   () => void;
}

function ArrayItemCard({ idx, item, itemLabel, itemFields, onUpdate, onRemove }: ArrayItemCardProps) {
  const [open, setOpen] = useState(true);

  return (
    <div className="rounded-lg border overflow-hidden" style={{ borderColor: "var(--wg-border)" }}>

      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2 cursor-pointer select-none"
        style={{ backgroundColor: "var(--wg-bg-2)" }}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="text-xs font-semibold" style={{ color: "var(--wg-text-2)" }}>
          {itemLabel} {idx + 1}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            title="Supprimer"
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="w-5 h-5 flex items-center justify-center rounded transition-colors"
            style={{ color: "var(--wg-text-3)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color           = "#ef4444";
              e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color           = "var(--wg-text-3)";
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
          <svg
            className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`}
            style={{ color: "var(--wg-text-3)" }}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Fields */}
      {open && (
        <div className="px-3 py-3 flex flex-col gap-3" style={{ backgroundColor: "var(--wg-bg)" }}>
          {itemFields.map((field) => {
            const rawVal = item[field.key];
            const value  = rawVal !== undefined && rawVal !== null ? String(rawVal) : "";

            return (
              <div key={field.key} className="flex flex-col gap-1">
                <label
                  className="text-[10px] font-semibold uppercase tracking-wide"
                  style={{ color: "var(--wg-text-3)" }}
                >
                  {field.label}
                </label>

                {field.type === "textarea" ? (
                  <textarea
                    value={value}
                    rows={2}
                    onChange={(e) => onUpdate(field.key, e.target.value)}
                    className="text-xs rounded border px-2 py-1.5 focus:outline-none resize-none leading-relaxed"
                    style={{ backgroundColor: "var(--wg-bg)", borderColor: "var(--wg-border)", color: "var(--wg-text)" }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "var(--wg-green)")}
                    onBlur={(e)  => (e.currentTarget.style.borderColor = "var(--wg-border)")}
                  />
                ) : field.type === "url" ? (
                  <input
                    type="text"
                    value={value}
                    placeholder="https://..."
                    onChange={(e) => onUpdate(field.key, e.target.value)}
                    className="text-xs rounded border px-2 py-1.5 focus:outline-none font-mono"
                    style={{ backgroundColor: "var(--wg-bg)", borderColor: "var(--wg-border)", color: "var(--wg-text)" }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "var(--wg-green)")}
                    onBlur={(e)  => (e.currentTarget.style.borderColor = "var(--wg-border)")}
                  />
                ) : (
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => onUpdate(field.key, e.target.value)}
                    className="text-xs rounded border px-2 py-1.5 focus:outline-none"
                    style={{ backgroundColor: "var(--wg-bg)", borderColor: "var(--wg-border)", color: "var(--wg-text)" }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "var(--wg-green)")}
                    onBlur={(e)  => (e.currentTarget.style.borderColor = "var(--wg-border)")}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Add button ──────────────────────────────────────────────── */

function AddBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-xs flex items-center gap-1 px-2 py-0.5 rounded border transition-colors"
      style={{ color: "var(--wg-green)", borderColor: "var(--wg-green)" }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(16,185,129,0.1)")}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
    >
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
      </svg>
      Ajouter
    </button>
  );
}

/* ── ActionBtn ───────────────────────────────────────────────── */

interface ActionBtnProps {
  title:    string;
  danger?:  boolean;
  onClick:  () => void;
  children: React.ReactNode;
}
function ActionBtn({ title, danger, onClick, children }: ActionBtnProps) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="w-6 h-6 flex items-center justify-center rounded transition-colors"
      style={{ color: "var(--wg-text-3)" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color           = danger ? "#ef4444" : "var(--wg-text)";
        e.currentTarget.style.backgroundColor = danger ? "rgba(239,68,68,0.1)" : "var(--wg-bg-3)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color           = "var(--wg-text-3)";
        e.currentTarget.style.backgroundColor = "transparent";
      }}
    >
      {children}
    </button>
  );
}
