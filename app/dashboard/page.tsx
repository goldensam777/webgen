// app/dashboard/page.tsx — Pro Redesign
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/store/authStore";
import { useSiteStore, apiConfigToSiteConfig } from "@/app/store/siteStore";
import { StatCard }     from "@/components/ui/StatCard";
import { ActivityFeed } from "@/components/ui/ActivityFeed";
import { SiteCard }     from "@/components/dashboard/SiteCard";
import { useHydrated } from "@/lib/use-hydrated";

interface Site {
  slug:        string;
  title?:      string;
  publishedAt: string;
  url:         string;
}

export default function DashboardPage() {
  const { user, token } = useAuthStore();
  const { setConfig, clearConfig } = useSiteStore();
  const router = useRouter();

  const [sites,    setSites]    = useState<Site[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [resuming, setResuming] = useState<string | null>(null);
  const [search,   setSearch]   = useState("");
  const hydrated                = useHydrated();

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

  useEffect(() => {
    if (!hydrated) return;
    if (!user) { router.push("/auth"); return; }

    fetch("/api/dashboard/sites", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => { setSites(d.sites ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [hydrated, user, token, router]);

  if (!hydrated) return null;

  const filteredSites = sites.filter(s => 
    (s.title || s.slug).toLowerCase().includes(search.toLowerCase())
  );

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Bonjour";
    if (h < 18) return "Bon après-midi";
    return "Bonsoir";
  })();

  const feedItems = sites.slice(0, 5).map(s => ({
    id:          s.slug,
    title:       `${s.title || s.slug} publié`,
    description: s.url,
    timestamp:   s.publishedAt,
    status:      "success" as const,
  }));

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto">
      
      {/* ── Page Header ── */}
      <header className="px-8 pt-8 pb-6 border-b sticky top-0 z-20 backdrop-blur-md flex flex-col gap-6"
        style={{ backgroundColor: "rgba(var(--wg-bg-rgb), 0.8)", borderColor: "var(--wg-border)" }}>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight" style={{ color: "var(--wg-text)" }}>
              {greeting}, {user?.name?.split(" ")[0]} 👋
            </h1>
            <p className="text-sm opacity-50 font-medium">Gérez vos créations et lancez de nouveaux projets.</p>
          </div>
          <button
            onClick={() => { clearConfig(); router.push("/create"); }}
            className="btn-green px-6 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Nouveau projet
          </button>
        </div>

        {/* Search & Stats Bar */}
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text"
              placeholder="Rechercher un site..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-2xl border text-sm focus:outline-none transition-all focus:ring-2 focus:ring-emerald-500/20"
              style={{ backgroundColor: "var(--wg-bg)", borderColor: "var(--wg-border)" }}
            />
          </div>
          <div className="flex items-center gap-6 px-4">
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Projets</p>
              <p className="text-lg font-black">{sites.length}</p>
            </div>
            <div className="w-px h-8 bg-slate-200 dark:bg-white/10" />
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 text-emerald-500">Visites</p>
              <p className="text-lg font-black">{sites.length > 0 ? "1.2k" : "0"}</p>
            </div>
            <div className="w-px h-8 bg-slate-200 dark:bg-white/10" />
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Plan</p>
              <p className="text-lg font-black text-emerald-500">BETA</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-10">
        
        {/* ── Main Content ── */}
        <section>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-72 rounded-3xl animate-pulse"
                  style={{ backgroundColor: "var(--wg-bg-2)" }} />
              ))}
            </div>
          ) : filteredSites.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center glass rounded-[3rem] border-dashed border-2"
              style={{ borderColor: "var(--wg-border)" }}>
              <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-6">
                <svg className="w-8 h-8 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Aucun projet trouvé</h3>
              <p className="text-sm opacity-50 mb-8 max-w-xs">Commencez par créer votre premier site avec l&apos;intelligence artificielle.</p>
              <button
                onClick={() => { clearConfig(); router.push("/create"); }}
                className="btn-green px-8 py-3 rounded-2xl font-bold text-sm"
              >
                Créer mon premier site →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {filteredSites.map(site => (
                <SiteCard
                  key={site.slug}
                  title={site.title || site.slug}
                  slug={site.slug}
                  url={site.url}
                  publishedAt={site.publishedAt}
                  onEdit={() => handleEdit(site.slug)}
                  isResuming={resuming === site.slug}
                />
              ))}
            </div>
          )}
        </section>

        {/* ── Sidebar Info ── */}
        <aside className="flex flex-col gap-8">
          <div className="glass rounded-[2rem] p-6 border" style={{ borderColor: "var(--wg-border)" }}>
            <h4 className="text-xs font-black uppercase tracking-widest mb-6 opacity-40">Activité récente</h4>
            <ActivityFeed
              items={feedItems}
              maxItems={5}
              title=""
            />
          </div>

          <div className="rounded-[2.5rem] p-8 bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
            <h4 className="font-black text-xl mb-2 relative z-10">Webgenx Pro</h4>
            <p className="text-sm opacity-80 mb-6 relative z-10">Bientôt : domaines personnalisés, SEO avancé et analytics temps réel.</p>
            <button className="w-full bg-white text-emerald-600 py-3 rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg hover:scale-[1.02] transition-transform">
              En savoir plus
            </button>
          </div>
        </aside>

      </div>
    </div>
  );
}
