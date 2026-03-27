"use client";
/**
 * AnimationWrapper
 * Wraps any children and applies a Webgen animation.
 *
 * - trigger="load"   → plays immediately on mount
 * - trigger="scroll" → plays when element enters viewport (IntersectionObserver)
 * - trigger="hover"  → applies hover CSS class only (no JS needed)
 */
import { useEffect, useRef } from "react";
import { buildAnimClass, ANIMATION_MAP } from "@/lib/animations";
import type { SectionAnimation } from "@/lib/animations";

interface Props {
  cfg:       SectionAnimation;
  children:  React.ReactNode;
  className?: string;
  style?:    React.CSSProperties;
  as?:       "div" | "section" | "article" | "span" | "header" | "footer" | "main";
}

export function AnimationWrapper({
  cfg,
  children,
  className = "",
  style,
  as: Tag = "div",
}: Props) {
  const ref   = useRef<HTMLElement>(null);
  const def   = ANIMATION_MAP[cfg.animation];
  const cls   = buildAnimClass(cfg);

  useEffect(() => {
    const el = ref.current;
    if (!el || !def) return;

    // Hover-triggered continuous animations are pure CSS — nothing to do
    if (cfg.trigger === "hover") return;

    // Continuous (load) — class already makes it loop, just add immediately
    if (def.kind === "continuous" && cfg.trigger === "load") return;

    // Entrance — need to fire wg-play
    if (def.kind === "entrance") {
      if (cfg.trigger === "load") {
        // Small rAF so the browser renders the paused state first
        requestAnimationFrame(() => el.classList.add("wg-play"));
        return;
      }

      if (cfg.trigger === "scroll") {
        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              el.classList.add("wg-play");
              if (!cfg.repeat) observer.disconnect();
            } else if (cfg.repeat) {
              el.classList.remove("wg-play");
            }
          },
          { threshold: 0.15 }
        );
        observer.observe(el);
        return () => observer.disconnect();
      }
    }
  }, [cfg, def]);

  const allClasses = [cls, className].filter(Boolean).join(" ");

  const DynTag = Tag as "div";
  return (
    <DynTag ref={ref as React.RefObject<HTMLDivElement>} className={allClasses} style={style}>
      {children}
    </DynTag>
  );
}
