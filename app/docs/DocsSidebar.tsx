// app/docs/DocsSidebar.tsx
"use client";
import Link          from "next/link";
import { usePathname } from "next/navigation";
import { useState }  from "react";
import type { DocMeta } from "@/lib/docs";

interface Props {
  nav: { category: string; items: DocMeta[] }[];
}

export function DocsSidebar({ nav }: Props) {
  const pathname   = usePathname();
  const [open, setOpen] = useState(false);

  const currentSlug = pathname.replace(/^\/docs\/?/, "") || "introduction";

  const SidebarContent = () => (
    <nav className="flex flex-col gap-6 py-8 px-4">
      {nav.map(({ category, items }) => (
        <div key={category}>
          <p
            className="text-xs font-semibold uppercase tracking-wide mb-2 px-2"
            style={{ color: "var(--wg-text-3)" }}
          >
            {category}
          </p>
          <ul className="flex flex-col gap-0.5">
            {items.map(({ slug, title }) => {
              const active = slug === currentSlug;
              return (
                <li key={slug}>
                  <Link
                    href={`/docs/${slug}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
                    style={{
                      backgroundColor: active ? "var(--wg-green-muted)" : "transparent",
                      color:           active ? "var(--wg-green)"       : "var(--wg-text-2)",
                      fontWeight:      active ? "600"                   : "400",
                    }}
                    onMouseEnter={e => {
                      if (!active) e.currentTarget.style.backgroundColor = "var(--wg-bg-3)";
                    }}
                    onMouseLeave={e => {
                      if (!active) e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    {active && (
                      <span className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: "var(--wg-green)" }} />
                    )}
                    {title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <>
      {/* ── Mobile : bouton hamburger ── */}
      <div className="lg:hidden fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setOpen(o => !o)}
          className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg border"
          style={{
            backgroundColor: "var(--wg-bg-2)",
            borderColor:     "var(--wg-border)",
            color:           "var(--wg-text)",
          }}
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="absolute left-0 top-0 bottom-0 w-72 overflow-y-auto"
            style={{ backgroundColor: "var(--wg-bg-2)", borderRight: "1px solid var(--wg-border)" }}
            onClick={e => e.stopPropagation()}
          >
            <SidebarContent />
          </div>
        </div>
      )}

      {/* ── Desktop : sidebar fixe ── */}
      <aside
        className="hidden lg:block w-60 shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto border-r"
        style={{ borderColor: "var(--wg-border)" }}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
