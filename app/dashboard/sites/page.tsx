// app/dashboard/sites/page.tsx — Pro Management View
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/store/authStore";
import { useSiteStore, apiConfigToSiteConfig } from "@/app/store/siteStore";
import { SiteCard }     from "@/components/dashboard/SiteCard";
import { useHydrated } from "@/lib/use-hydrated";

interface Site {
  slug:        string;
  title?:      string;
  publishedAt: string;
  url:         string;
}

type ViewMode = "grid" | "list";
type SortOption = "recent" | "oldest" | "alpha";

export default function SitesManagementPage() {
  const { user, token } = useAuthStore();
  const { setConfig, clearConfig } = useSiteStore();
  const router = useRouter();

  const [sites,    setSites]    = useState<Site[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [resuming, setResuming] = useState<string | null>(null);
  const [search,   setSearch]   = useState("");
  const [view,     setView]     = useState<ViewMode>("grid");
  const [sort,     setSort]     = useState<SortOption>("recent");
  
  const hydrated = useHydrated();

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

  // Filtering & Sorting
  const processedSites = sites
    .filter(s => (s.title || s.slug).toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === "recent") return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      if (sort === "oldest") return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
      if (sort === "alpha")  return (a.title || a.slug).localeCompare(b.title || b.slug);
      return 0;
    });

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto">
      
      {/* ── Page Header ── */}
      <header className="px-8 pt-8 pb-6 border-b sticky top-0 z-20 backdrop-blur-md flex flex-col gap-6"
        style={{ backgroundColor: "rgba(var(--wg-bg-rgb), 0.8)", borderColor: "var(--wg-border)" }}>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight">Mes Sites</h1>
            <p className="text-sm opacity-50 font-medium">Gérez l&apos;ensemble de vos projets publiés.</p>
          </div>
          <button
            onClick={() => { clearConfig(); router.push("/create"); }}
            className="btn-green px-6 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2 shadow-lg"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Nouveau site
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text"
              placeholder="Rechercher par nom ou slug..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-2xl border text-sm focus:outline-none transition-all focus:ring-2 focus:ring-emerald-500/20"
              style={{ backgroundColor: "var(--wg-bg)", borderColor: "var(--wg-border)" }}
            />
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <select 
              value={sort}
              onChange={e => setSort(e.target.value as SortOption)}
              className="px-4 py-2.5 rounded-2xl border text-xs font-bold focus:outline-none bg-transparent"
              style={{ borderColor: "var(--wg-border)" }}
            >
              <option value="recent">Plus récents</option>
              <option value="oldest">Plus anciens</option>
              <option value="alpha">Alphabétique</option>
            </select>

            <div className="flex items-center border rounded-2xl p-1" style={{ borderColor: "var(--wg-border)" }}>
              <button 
                onClick={() => setView("grid")}
                className={`p-1.5 rounded-xl transition-all ${view === "grid" ? "bg-emerald-500 text-white shadow-md" : "opacity-40"}`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button 
                onClick={() => setView("list")}
                className={`p-1.5 rounded-xl transition-all ${view === "list" ? "bg-emerald-500 text-white shadow-md" : "opacity-40"}`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 p-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-72 rounded-[2.5rem] animate-pulse"
                style={{ backgroundColor: "var(--wg-bg-2)" }} />
            ))}
          </div>
        ) : processedSites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center glass rounded-[3rem] border-dashed border-2"
            style={{ borderColor: "var(--wg-border)" }}>
            <h3 className="text-xl font-bold mb-2">Aucun site ne correspond</h3>
            <p className="text-sm opacity-50">Réessayez avec d&apos;autres mots-clés ou créez un nouveau projet.</p>
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {processedSites.map(site => (
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
        ) : (
          /* List View */
          <div className="glass rounded-[2rem] border overflow-hidden" style={{ borderColor: "var(--wg-border)" }}>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: "var(--wg-border)", backgroundColor: "var(--wg-bg-2)" }}>
                  <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] opacity-40">Nom du site</th>
                  <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] opacity-40">Slug</th>
                  <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] opacity-40">Dernière mise à jour</th>
                  <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] opacity-40 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ dividerColor: "var(--wg-border)" }}>
                {processedSites.map(site => (
                  <tr key={site.slug} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4 font-bold">{site.title || site.slug}</td>
                    <td className="px-6 py-4 opacity-50 font-mono text-xs">/{site.slug}</td>
                    <td className="px-6 py-4 opacity-50">
                      {new Date(site.publishedAt).toLocaleDateString("fr-FR", { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleEdit(site.slug)}
                          className="p-2 rounded-lg hover:bg-emerald-500/10 text-emerald-500 transition-all"
                          title="Modifier"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                        <a 
                          href={site.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg hover:bg-blue-500/10 text-blue-500 transition-all"
                          title="Voir"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
