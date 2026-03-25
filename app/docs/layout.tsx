// app/docs/layout.tsx
import Link from "next/link";
import { getNavWithTitles } from "@/lib/docs";
import { DocsSidebar }      from "./DocsSidebar";

export const metadata = {
  title: { template: "%s — Webgen Docs", default: "Documentation — Webgen" },
  description: "Documentation officielle de Webgen — créez, éditez et publiez votre site web en quelques secondes.",
  robots: { index: true, follow: true },
};

export default async function DocsLayout({ children }: { children: React.ReactNode }) {
  const nav = await getNavWithTitles();

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--wg-bg)", color: "var(--wg-text)" }}>

      {/* ── Header ──────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 h-14 flex items-center justify-between px-6 border-b shrink-0"
        style={{ backgroundColor: "var(--wg-bg-2)", borderColor: "var(--wg-border)" }}
      >
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-lg" style={{ color: "var(--wg-green)" }}>
            Webgen
          </Link>
          <span className="text-sm hidden sm:block" style={{ color: "var(--wg-text-3)" }}>
            /
          </span>
          <span className="text-sm font-medium hidden sm:block" style={{ color: "var(--wg-text-2)" }}>
            Documentation
          </span>
        </div>
        <Link
          href="/create"
          className="btn-green px-4 py-1.5 rounded-lg text-sm font-semibold"
        >
          Créer un site →
        </Link>
      </header>

      {/* ── Body ────────────────────────────────────────── */}
      <div className="flex flex-1 max-w-screen-xl mx-auto w-full">

        {/* Sidebar */}
        <DocsSidebar nav={nav} />

        {/* Contenu */}
        <main className="flex-1 min-w-0 px-6 sm:px-10 py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
