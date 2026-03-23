// app/dashboard/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/app/store/authStore";

interface SiteMeta {
  slug:        string;
  publishedAt: string;
  title:       string;
  url:         string;
}

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [sites, setSites]     = useState<SiteMeta[]>([]);
  const [loading, setLoading] = useState(true);

  const { user, token, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => { setMounted(true); }, []);

  // Guard: redirect to auth if not logged in
  useEffect(() => {
    if (!mounted) return;
    if (!user) router.replace("/auth");
  }, [mounted, user, router]);

  // Fetch user's sites
  useEffect(() => {
    if (!mounted || !user || !token) return;
    fetch("/api/dashboard/sites", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => setSites(data.sites ?? []))
      .finally(() => setLoading(false));
  }, [mounted, user, token]);

  if (!mounted || !user) {
    return <div className="min-h-screen" style={{ backgroundColor: "var(--wg-bg)" }} />;
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "var(--wg-bg)", color: "var(--wg-text)" }}
    >
      {/* ── Header ──────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 px-6 h-14 flex items-center justify-between border-b"
        style={{ backgroundColor: "var(--wg-bg-2)", borderColor: "var(--wg-border)" }}
      >
        <Link href="/" className="font-bold text-xl" style={{ color: "var(--wg-green)" }}>
          Webgen
        </Link>

        <div className="flex items-center gap-4">
          <span className="text-sm hidden sm:block" style={{ color: "var(--wg-text-2)" }}>
            {user.name}
          </span>
          <Link
            href="/create"
            className="btn-green px-4 py-1.5 rounded-lg text-sm font-semibold"
          >
            + Nouveau site
          </Link>
          <button
            onClick={() => { logout(); router.push("/"); }}
            className="text-sm transition-opacity hover:opacity-60"
            style={{ color: "var(--wg-text-3)" }}
          >
            Déconnexion
          </button>
        </div>
      </header>

      {/* ── Content ─────────────────────────────────────── */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-12">

        {/* Welcome */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold" style={{ color: "var(--wg-text)" }}>
            Bonjour, {user.name.split(" ")[0]} 👋
          </h1>
          <p className="mt-2 text-base" style={{ color: "var(--wg-text-2)" }}>
            Vos sites publiés sur Webgen.
          </p>
        </div>

        {loading ? (
          /* Skeleton */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="rounded-2xl border h-40 animate-pulse"
                style={{ backgroundColor: "var(--wg-bg-2)", borderColor: "var(--wg-border)" }}
              />
            ))}
          </div>
        ) : sites.length === 0 ? (
          /* Empty state */
          <div
            className="rounded-2xl border flex flex-col items-center justify-center py-20 gap-4 text-center"
            style={{ borderColor: "var(--wg-border)", borderStyle: "dashed" }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
              style={{ backgroundColor: "var(--wg-green-muted)", color: "var(--wg-green)" }}
            >
              ✦
            </div>
            <div>
              <p className="font-semibold text-lg" style={{ color: "var(--wg-text)" }}>
                Aucun site publié
              </p>
              <p className="text-sm mt-1" style={{ color: "var(--wg-text-2)" }}>
                Créez votre premier site et publiez-le en quelques secondes.
              </p>
            </div>
            <Link
              href="/create"
              className="btn-green px-6 py-2.5 rounded-xl text-sm font-semibold inline-block mt-2"
            >
              Créer mon premier site →
            </Link>
          </div>
        ) : (
          /* Sites grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sites.map(site => (
              <div
                key={site.slug}
                className="rounded-2xl border p-5 flex flex-col gap-4 transition-shadow hover:shadow-md"
                style={{ backgroundColor: "var(--wg-bg-2)", borderColor: "var(--wg-border)" }}
              >
                {/* Preview bar */}
                <div
                  className="h-24 rounded-xl flex items-center justify-center text-xs font-semibold"
                  style={{
                    backgroundColor: "var(--wg-bg-3)",
                    color:           "var(--wg-text-3)",
                  }}
                >
                  {site.slug}.webgen.app
                </div>

                <div className="flex-1">
                  <p className="font-semibold text-sm" style={{ color: "var(--wg-text)" }}>
                    {site.title || site.slug}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--wg-text-3)" }}>
                    Publié le{" "}
                    {new Date(site.publishedAt).toLocaleDateString("fr-FR", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </p>
                </div>

                <div className="flex gap-2">
                  <a
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-1.5 rounded-lg border text-xs font-semibold text-center transition-opacity hover:opacity-75"
                    style={{
                      borderColor: "var(--wg-border)",
                      color:       "var(--wg-text-2)",
                    }}
                  >
                    Voir →
                  </a>
                  <button
                    onClick={() => navigator.clipboard.writeText(site.url)}
                    className="px-3 py-1.5 rounded-lg border text-xs font-semibold transition-opacity hover:opacity-75"
                    style={{
                      borderColor: "var(--wg-border)",
                      color:       "var(--wg-text-3)",
                    }}
                    title="Copier le lien"
                  >
                    ⎘
                  </button>
                </div>
              </div>
            ))}

            {/* Add more card */}
            <Link
              href="/create"
              className="rounded-2xl border flex flex-col items-center justify-center py-12 gap-3 transition-colors"
              style={{
                borderColor: "var(--wg-border)",
                borderStyle: "dashed",
                color:       "var(--wg-text-3)",
              }}
            >
              <span className="text-2xl">+</span>
              <span className="text-sm font-semibold">Nouveau site</span>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
