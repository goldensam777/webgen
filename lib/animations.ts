/* ─────────────────────────────────────────────────────────
   Webgen — Animation catalogue
   Single source of truth for available animations.
   Used by: AnimationWrapper, AnimationsPanel, AI prompt.
   ───────────────────────────────────────────────────────── */

export type AnimationTrigger = "load" | "scroll" | "hover";
export type AnimationEasing  =
  | "ease-out" | "ease-in" | "ease-in-out" | "linear"
  | "spring"   | "back";

export interface AnimationDef {
  /** CSS class applied (maps to wg-* keyframe) */
  className:   string;
  /** Human label shown in the editor */
  label:       string;
  /** "entrance" = one-shot, "continuous" = infinite loop */
  kind:        "entrance" | "continuous";
  /** Triggers available for this animation */
  triggers:    AnimationTrigger[];
  /** Default duration in ms */
  defaultDuration: number;
}

/* ── Catalogue ───────────────────────────────────────────── */
export const ANIMATIONS: AnimationDef[] = [
  // Entrances
  { className: "fadeIn",    label: "Fondu",              kind: "entrance",   triggers: ["load","scroll"], defaultDuration: 500 },
  { className: "fadeUp",    label: "Glissement bas→haut", kind: "entrance",   triggers: ["load","scroll"], defaultDuration: 600 },
  { className: "fadeDown",  label: "Glissement haut→bas", kind: "entrance",   triggers: ["load","scroll"], defaultDuration: 600 },
  { className: "fadeLeft",  label: "Glissement droite→gauche", kind: "entrance", triggers: ["load","scroll"], defaultDuration: 600 },
  { className: "fadeRight", label: "Glissement gauche→droite", kind: "entrance", triggers: ["load","scroll"], defaultDuration: 600 },
  { className: "scaleIn",   label: "Zoom doux",          kind: "entrance",   triggers: ["load","scroll"], defaultDuration: 500 },
  { className: "scaleUp",   label: "Zoom fort",          kind: "entrance",   triggers: ["load","scroll"], defaultDuration: 600 },
  { className: "rotateIn",  label: "Rotation d'entrée",  kind: "entrance",   triggers: ["load","scroll"], defaultDuration: 700 },
  { className: "blurIn",    label: "Flou → net",         kind: "entrance",   triggers: ["load","scroll"], defaultDuration: 700 },
  { className: "slideUp",   label: "Slide (clip)",       kind: "entrance",   triggers: ["load","scroll"], defaultDuration: 600 },
  // Continuous
  { className: "float",     label: "Flottement",         kind: "continuous", triggers: ["load","hover"],  defaultDuration: 3000 },
  { className: "pulse",     label: "Pulsation",          kind: "continuous", triggers: ["load","hover"],  defaultDuration: 2000 },
  { className: "bounce",    label: "Rebond",             kind: "continuous", triggers: ["load","hover"],  defaultDuration: 1200 },
  { className: "spin",      label: "Rotation",           kind: "continuous", triggers: ["load","hover"],  defaultDuration: 2000 },
  { className: "wiggle",    label: "Wiggle",             kind: "continuous", triggers: ["load","hover"],  defaultDuration: 600  },
];

export const ANIMATION_MAP = Object.fromEntries(ANIMATIONS.map(a => [a.className, a]));

/* ── Config stored per-section in siteStore ─────────────── */
export interface SectionAnimation {
  id:        string;            // nanoid
  animation: string;           // className key
  trigger:   AnimationTrigger;
  duration:  number;           // ms
  delay:     number;           // ms
  easing:    AnimationEasing;
  repeat:    boolean;          // continuous only — keep looping vs play once
}

/* ── Helpers ─────────────────────────────────────────────── */
export function durationClass(ms: number): string {
  const snapped = [200,300,400,500,600,700,800,1000,1200].reduce(
    (prev, cur) => Math.abs(cur - ms) < Math.abs(prev - ms) ? cur : prev
  );
  return `wg-dur-${snapped}`;
}

export function delayClass(ms: number): string {
  const snapped = [0,100,150,200,300,400,500,600,800,1000].reduce(
    (prev, cur) => Math.abs(cur - ms) < Math.abs(prev - ms) ? cur : prev
  );
  return `wg-delay-${snapped}`;
}

export function easingClass(easing: AnimationEasing): string {
  const map: Record<AnimationEasing, string> = {
    "ease-out":    "wg-ease-out",
    "ease-in":     "wg-ease-in",
    "ease-in-out": "wg-ease-in-out",
    "linear":      "wg-ease-linear",
    "spring":      "wg-ease-spring",
    "back":        "wg-ease-back",
  };
  return map[easing] ?? "wg-ease-out";
}

/** Build the full class string for an entrance animation config */
export function buildAnimClass(cfg: SectionAnimation): string {
  const def = ANIMATION_MAP[cfg.animation];
  if (!def) return "";

  if (def.kind === "continuous") {
    // Continuous: use the simple .wg-{name} class (already infinite)
    // hover trigger → use .wg-hover-{name} instead
    if (cfg.trigger === "hover") return `wg-hover-${cfg.animation}`;
    return `wg-${cfg.animation}`;
  }

  // Entrance: needs wg-anim + name + duration + delay + easing
  // wg-play is added by AnimationWrapper via JS
  return [
    "wg-anim",
    `wg-${cfg.animation}`,
    durationClass(cfg.duration),
    delayClass(cfg.delay),
    easingClass(cfg.easing),
  ].join(" ");
}

/** Names listed for the AI system prompt */
export const ANIMATION_NAMES_FOR_AI = ANIMATIONS.map(a => a.className).join(", ");
