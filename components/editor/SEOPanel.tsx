// components/editor/SEOPanel.tsx
"use client";
import { useSiteStore, useActivePage } from "@/app/store/siteStore";

export function SEOPanel() {
  const activePage = useActivePage();
  const { updatePageMetadata } = useSiteStore();

  if (!activePage) return null;

  const meta = activePage.metadata ?? {};

  const handleChange = (field: string, value: string | boolean) => {
    updatePageMetadata(activePage.id, { [field]: value });
  };

  return (
    <div className="flex flex-col gap-6 p-4">
      <div>
        <h3 className="text-xs font-black uppercase tracking-widest opacity-40 mb-4">
          SEO & Visibilité
        </h3>
        <p className="text-[10px] opacity-60 leading-relaxed">
          Configurez comment cette page apparaît dans les moteurs de recherche et sur les réseaux sociaux.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {/* Page Title */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Titre de la page (Meta Title)</label>
          <input 
            type="text"
            value={meta.title ?? ""}
            onChange={(e) => handleChange("title", e.target.value)}
            placeholder={activePage.name}
            className="w-full px-3 py-2 rounded-xl border text-xs focus:outline-none transition-all focus:ring-2 focus:ring-emerald-500/20"
            style={{ backgroundColor: "var(--wg-bg)", borderColor: "var(--wg-border)" }}
          />
          <p className="text-[9px] opacity-40 italic">Recommandé : 50-60 caractères.</p>
        </div>

        {/* Page Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Description (Meta Description)</label>
          <textarea 
            rows={4}
            value={meta.description ?? ""}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Décrivez le contenu de cette page pour les moteurs de recherche..."
            className="w-full px-3 py-2 rounded-xl border text-xs focus:outline-none transition-all focus:ring-2 focus:ring-emerald-500/20 resize-none"
            style={{ backgroundColor: "var(--wg-bg)", borderColor: "var(--wg-border)" }}
          />
          <p className="text-[9px] opacity-40 italic">Recommandé : 120-160 caractères.</p>
        </div>

        {/* Indexing Toggle */}
        <div className="flex items-center justify-between p-3 glass rounded-xl border" style={{ borderColor: "var(--wg-border)" }}>
          <div>
            <p className="text-[10px] font-bold">Masquer des moteurs</p>
            <p className="text-[9px] opacity-50 text-slate-500">Ajouter une balise noindex.</p>
          </div>
          <button 
            onClick={() => handleChange("noIndex", !meta.noIndex)}
            className={`w-8 h-4 rounded-full relative transition-colors ${meta.noIndex ? 'bg-red-500' : 'bg-slate-200 dark:bg-white/10'}`}
          >
            <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${meta.noIndex ? 'right-0.5' : 'left-0.5'}`} />
          </button>
        </div>
      </div>

      {/* Google Preview */}
      <div className="mt-4 p-4 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-white/5 shadow-sm">
        <p className="text-[10px] font-bold text-slate-400 mb-2">Aperçu Google</p>
        <p className="text-[#1a0dab] dark:text-[#8ab4f8] text-sm font-medium truncate mb-0.5">
          {meta.title || activePage.name}
        </p>
        <p className="text-[#006621] dark:text-[#34a853] text-[10px] truncate mb-1">
          https://votre-site.webgenx.app/{activePage.slug}
        </p>
        <p className="text-[#4d5156] dark:text-[#bdc1c6] text-[11px] leading-snug line-clamp-2">
          {meta.description || "Aucune description fournie. Google affichera un extrait du contenu de votre page."}
        </p>
      </div>
    </div>
  );
}
