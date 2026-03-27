"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/app/store/authStore";
import { useSiteStore, apiConfigToSiteConfig } from "@/app/store/siteStore";
import { StatCard }     from "@/components/ui/StatCard";
import { DataTable }    from "@/components/ui/DataTable";
import { ActivityFeed } from "@/components/ui/ActivityFeed";
import { StatusBadge }  from "@/components/ui/StatusBadge";
import type { TableColumn } from "@/components/ui/DataTable";

interface Site {
  slug:        string;
  title?:      string;
  publishedAt: string;
  url:         string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

export default function DashboardPage() {
  const { user, token, logout } = useAuthStore();
  const { setConfig, clearConfig } = useSiteStore();
  const router = useRouter();

  const [sites,    setSites]    = useState<Site[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [mounted,  setMounted]  = useState(false);
  const [resuming, setResuming] = useState<string | null>(null);

  const handleEdit = async (slug: string) => {
    setResuming(slug);
    try {
      const res  = await fetch(`/api/dashboard/sites/${slug}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setConfig(apiConfigToSiteConfig(data.config));
      router.push("/create");
    } catch {
      alert("Impossible de charger ce site.");
    } finally {
      setResuming(null);
    }
  };

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!user) { router.push("/auth"); return; }

    fetch("/api/dashboard/sites", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => { setSites(d.sites ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [mounted, user, token, router]);

  if (!mounted) return null;

  const lastSite = sites[0];
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Bonjour";
    if (h < 18) return "Bon après-midi";
    return "Bonsoir";
  })();

  const columns: TableColumn[] = [
    {
      key: "title", label: "Site", sortable: true,
      render: (v, row) => (
        <div>
          <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
            {String(v || row.slug)}
          </p>
          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>/{String(row.slug)}</p>
        </div>
      ),
    },
    {
      key: "publishedAt", label: "Publié le", sortable: true,
      render: (v) => <span className="text-sm">{formatDate(String(v))}</span>,
    },
    {
      key: "status", label: "Statut",
      render: () => <StatusBadge status="success" label="En ligne" size="sm" />,
    },
    {
      key: "url", label: "Actions",
      render: (v, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEdit(String(row.slug))}
            disabled={resuming === String(row.slug)}
            className="text-xs font-medium px-2.5 py-1 rounded-lg border transition-colors disabled:opacity-50"
            style={{ color: "var(--color-primary)", borderColor: "var(--color-border)" }}
          >
            {resuming === String(row.slug) ? "…" : "✏ Modifier"}
          </button>
          <a
            href={String(v)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium px-2.5 py-1 rounded-lg border transition-colors"
            style={{ color: "var(--color-text-muted)", borderColor: "var(--color-border)" }}
          >
            Voir →
          </a>
        </div>
      ),
    },
  ];

  const feedItems = sites.slice(0, 6).map(s => ({
    id:          s.slug,
    title:       `${s.title || s.slug} publié`,
    description: s.url,
    timestamp:   s.publishedAt,
    status:      "success" as const,
  }));

  const tableData = sites.map(s => ({
    title:       s.title || s.slug,
    slug:        s.slug,
    publishedAt: s.publishedAt,
    url:         s.url,
    status:      "online",
  }));

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--wg-bg)" }}>

      {/* ── Top nav ── */}
      <header
        className="sticky top-0 z-30 border-b px-6 h-14 flex items-center justify-between"
        style={{ backgroundColor: "var(--wg-bg-2)", borderColor: "var(--wg-border)" }}
      >
        <Link href="/" className="font-bold text-lg" style={{ color: "var(--wg-green)" }}>
          Webgen
        </Link>
        <div className="flex items-center gap-4">
          <button
            onClick={() => { clearConfig(); router.push("/create"); }}
            className="btn-green px-4 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nouveau site
          </button>
          <button
            onClick={() => { logout(); router.push("/"); }}
            className="text-sm transition-colors"
            style={{ color: "var(--wg-text-3)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--wg-text)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--wg-text-3)")}
          >
            Déconnexion
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* ── Page header ── */}
        <div className="mb-8">
          <p className="text-sm mb-1" style={{ color: "var(--wg-text-3)" }}>
            {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
          <h1 className="text-2xl font-bold" style={{ color: "var(--wg-text)" }}>
            {greeting}, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--wg-text-2)" }}>
            Voici l&apos;état de vos sites publiés.
          </p>
        </div>

        {loading ? (
          /* ── Skeleton ── */
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-28 rounded-2xl animate-pulse"
                style={{ backgroundColor: "var(--wg-bg-2)" }} />
            ))}
          </div>
        ) : (
          <>
            {/* ── KPI cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
              style={{ "--color-surface": "var(--wg-bg-2)", "--color-border": "var(--wg-border)",
                "--color-text": "var(--wg-text)", "--color-text-muted": "var(--wg-text-2)" } as React.CSSProperties}
            >
              <StatCard
                label="Sites publiés"
                value={sites.length}
                color="green"
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                }
              />
              <StatCard
                label="Dernier publié"
                value={lastSite ? formatDate(lastSite.publishedAt) : "—"}
                color="blue"
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                }
              />
              <StatCard
                label="Slug récent"
                value={lastSite ? `/${lastSite.slug}` : "—"}
                color="purple"
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                }
              />
            </div>

            {sites.length === 0 ? (
              /* ── Empty state ── */
              <div
                className="rounded-2xl border p-16 text-center"
                style={{ borderColor: "var(--wg-border)", backgroundColor: "var(--wg-bg-2)" }}
              >
                <svg className="w-14 h-14 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  style={{ color: "var(--wg-text-3)" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                    d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                <p className="text-lg font-semibold mb-2" style={{ color: "var(--wg-text)" }}>
                  Aucun site publié
                </p>
                <p className="text-sm mb-6" style={{ color: "var(--wg-text-2)" }}>
                  Créez votre premier site en quelques secondes avec l&apos;IA.
                </p>
                <button
                  onClick={() => { clearConfig(); router.push("/create"); }}
                  className="btn-green px-6 py-2.5 rounded-xl text-sm font-semibold"
                >
                  Créer mon premier site →
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6"
                style={{
                  "--color-surface":    "var(--wg-bg-2)",
                  "--color-background": "var(--wg-bg)",
                  "--color-border":     "var(--wg-border)",
                  "--color-text":       "var(--wg-text)",
                  "--color-text-muted": "var(--wg-text-2)",
                  "--color-primary":    "var(--wg-green)",
                } as React.CSSProperties}
              >
                <DataTable
                  title="Mes sites"
                  columns={columns}
                  data={tableData}
                  searchable
                  pageSize={8}
                  emptyMessage="Aucun site trouvé."
                />
                <ActivityFeed
                  title="Activité"
                  items={feedItems}
                  maxItems={6}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
