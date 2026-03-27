// components/editor/AnimationsPanel.tsx
"use client";
import { useState } from "react";
import { useSiteStore, useActivePage } from "@/app/store/siteStore";
import {
  ANIMATIONS, ANIMATION_MAP,
  type SectionAnimation, type AnimationTrigger, type AnimationEasing,
} from "@/lib/animations";

const TRIGGERS: { value: AnimationTrigger; label: string }[] = [
  { value: "scroll", label: "Au scroll" },
  { value: "load",   label: "Au chargement" },
  { value: "hover",  label: "Au survol" },
];

const EASINGS: { value: AnimationEasing; label: string }[] = [
  { value: "ease-out",    label: "Ease out (défaut)" },
  { value: "ease-in-out", label: "Ease in-out" },
  { value: "spring",      label: "Spring (rebond)" },
  { value: "back",        label: "Back" },
  { value: "linear",      label: "Linear" },
];

function uid() { return crypto.randomUUID(); }

interface Props { selectedSection: string | null }

export function AnimationsPanel({ selectedSection }: Props) {
  const activePage = useActivePage();
  const { setAnimation, removeAnimation } = useSiteStore();
  const [adding, setAdding] = useState(false);

  // Default new anim state
  const [draft, setDraft] = useState<Omit<SectionAnimation, "id">>({
    animation: "fadeUp",
    trigger:   "scroll",
    duration:  600,
    delay:     0,
    easing:    "ease-out",
    repeat:    false,
  });

  if (!selectedSection || !activePage) {
    return (
      <div className="px-4 py-8 text-center text-sm" style={{ color: "var(--wg-text-3)" }}>
        Sélectionnez une section pour gérer ses animations.
      </div>
    );
  }

  const anims: SectionAnimation[] = activePage.animations?.[selectedSection] ?? [];
  const def = ANIMATION_MAP[draft.animation];

  function saveDraft() {
    setAnimation(selectedSection!, { id: uid(), ...draft });
    setAdding(false);
    setDraft({ animation: "fadeUp", trigger: "scroll", duration: 600, delay: 0, easing: "ease-out", repeat: false });
  }

  return (
    <div className="flex flex-col gap-1 pb-4">
      <p className="text-xs font-semibold uppercase tracking-wide px-4 pt-4 pb-2"
        style={{ color: "var(--wg-text-3)" }}>
        Animations — {selectedSection}
      </p>

      {/* Active animations */}
      {anims.length === 0 && !adding && (
        <p className="px-4 text-sm" style={{ color: "var(--wg-text-3)" }}>
          Aucune animation. Ajoutez-en une ci-dessous.
        </p>
      )}

      {anims.map(a => {
        const d = ANIMATION_MAP[a.animation];
        return (
          <div key={a.id}
            className="mx-2 px-3 py-2 rounded-lg flex items-center justify-between gap-2"
            style={{ background: "var(--wg-bg-3)", border: "1px solid var(--wg-border)" }}>
            <div>
              <span className="text-sm font-medium" style={{ color: "var(--wg-text)" }}>
                {d?.label ?? a.animation}
              </span>
              <span className="text-xs ml-2" style={{ color: "var(--wg-text-3)" }}>
                {TRIGGERS.find(t => t.value === a.trigger)?.label} · {a.duration}ms
                {a.delay > 0 ? ` +${a.delay}ms` : ""}
              </span>
            </div>
            <button
              onClick={() => removeAnimation(selectedSection, a.id)}
              className="text-xs transition-colors"
              style={{ color: "var(--wg-text-3)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#ef4444")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--wg-text-3)")}
            >✕</button>
          </div>
        );
      })}

      {/* Add form */}
      {adding ? (
        <div className="mx-2 mt-2 p-3 rounded-lg flex flex-col gap-3"
          style={{ background: "var(--wg-bg-3)", border: "1px solid var(--wg-border)" }}>

          {/* Animation picker */}
          <div className="flex flex-col gap-1">
            <label className="text-xs" style={{ color: "var(--wg-text-3)" }}>Animation</label>
            <select
              value={draft.animation}
              onChange={e => setDraft(d => ({ ...d, animation: e.target.value }))}
              className="text-sm rounded px-2 py-1"
              style={{ background: "var(--wg-bg-2)", border: "1px solid var(--wg-border)", color: "var(--wg-text)" }}
            >
              {["— Entrées —", ...ANIMATIONS.filter(a => a.kind === "entrance").map(a => a.className),
                "— Continu —", ...ANIMATIONS.filter(a => a.kind === "continuous").map(a => a.className)]
                .map(name => {
                  if (name.startsWith("—")) return <option key={name} disabled>{name}</option>;
                  const a = ANIMATION_MAP[name];
                  return <option key={name} value={name}>{a?.label ?? name}</option>;
                })}
            </select>
          </div>

          {/* Trigger */}
          <div className="flex flex-col gap-1">
            <label className="text-xs" style={{ color: "var(--wg-text-3)" }}>Déclencheur</label>
            <div className="flex gap-1 flex-wrap">
              {TRIGGERS.filter(t => def?.triggers.includes(t.value) ?? true).map(t => (
                <button key={t.value}
                  onClick={() => setDraft(d => ({ ...d, trigger: t.value }))}
                  className="text-xs px-2 py-1 rounded transition-colors"
                  style={{
                    background: draft.trigger === t.value ? "var(--wg-green)" : "var(--wg-bg-2)",
                    color:      draft.trigger === t.value ? "#fff" : "var(--wg-text-2)",
                    border:     "1px solid var(--wg-border)",
                  }}
                >{t.label}</button>
              ))}
            </div>
          </div>

          {/* Duration + Delay */}
          {def?.kind === "entrance" && (
            <div className="flex gap-2">
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-xs" style={{ color: "var(--wg-text-3)" }}>Durée (ms)</label>
                <input type="number" min={100} max={2000} step={100}
                  value={draft.duration}
                  onChange={e => setDraft(d => ({ ...d, duration: Number(e.target.value) }))}
                  className="text-sm rounded px-2 py-1 w-full"
                  style={{ background: "var(--wg-bg-2)", border: "1px solid var(--wg-border)", color: "var(--wg-text)" }}
                />
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-xs" style={{ color: "var(--wg-text-3)" }}>Délai (ms)</label>
                <input type="number" min={0} max={2000} step={50}
                  value={draft.delay}
                  onChange={e => setDraft(d => ({ ...d, delay: Number(e.target.value) }))}
                  className="text-sm rounded px-2 py-1 w-full"
                  style={{ background: "var(--wg-bg-2)", border: "1px solid var(--wg-border)", color: "var(--wg-text)" }}
                />
              </div>
            </div>
          )}

          {/* Easing */}
          {def?.kind === "entrance" && draft.trigger !== "hover" && (
            <div className="flex flex-col gap-1">
              <label className="text-xs" style={{ color: "var(--wg-text-3)" }}>Easing</label>
              <select
                value={draft.easing}
                onChange={e => setDraft(d => ({ ...d, easing: e.target.value as AnimationEasing }))}
                className="text-sm rounded px-2 py-1"
                style={{ background: "var(--wg-bg-2)", border: "1px solid var(--wg-border)", color: "var(--wg-text)" }}
              >
                {EASINGS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
              </select>
            </div>
          )}

          {/* Repeat (continuous) */}
          {def?.kind === "continuous" && draft.trigger !== "hover" && (
            <label className="flex items-center gap-2 text-sm" style={{ color: "var(--wg-text-2)" }}>
              <input type="checkbox" checked={draft.repeat}
                onChange={e => setDraft(d => ({ ...d, repeat: e.target.checked }))} />
              Répéter indéfiniment
            </label>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <button onClick={saveDraft}
              className="flex-1 text-sm py-1.5 rounded font-semibold"
              style={{ background: "var(--wg-green)", color: "#fff" }}>
              Ajouter
            </button>
            <button onClick={() => setAdding(false)}
              className="flex-1 text-sm py-1.5 rounded"
              style={{ background: "var(--wg-bg-2)", color: "var(--wg-text-2)", border: "1px solid var(--wg-border)" }}>
              Annuler
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="mx-2 mt-2 flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
          style={{ color: "var(--wg-green)", border: "1px dashed var(--wg-green)", background: "var(--wg-green-muted)" }}
        >
          <span>+</span> Ajouter une animation
        </button>
      )}
    </div>
  );
}
