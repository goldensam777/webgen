// components/dashboard/SiteCard.tsx
"use client";
import { StatusBadge } from "@/components/ui/StatusBadge";

interface SiteCardProps {
  title:       string;
  slug:        string;
  url:         string;
  publishedAt: string;
  onEdit:      () => void;
  isResuming:  boolean;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

export function SiteCard({ title, slug, url, publishedAt, onEdit, isResuming }: SiteCardProps) {
  return (
    <div
      className="group relative flex flex-col rounded-3xl border overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
      style={{ backgroundColor: "var(--wg-bg-2)", borderColor: "var(--wg-border)" }}
    >
      {/* Visual Preview (Stylized Mockup) */}
      <div className="relative h-44 bg-slate-100 dark:bg-slate-800 overflow-hidden border-b" style={{ borderColor: "var(--wg-border)" }}>
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent" />
        
        {/* Fake site structure */}
        <div className="absolute top-6 left-6 right-6 bottom-0 rounded-t-xl bg-white dark:bg-slate-900 border-x border-t shadow-sm opacity-40 group-hover:opacity-100 transition-opacity duration-500">
          <div className="h-4 border-b flex items-center px-2 gap-1" style={{ borderColor: "var(--wg-border)" }}>
            <div className="w-1.5 h-1.5 rounded-full bg-red-400/20" />
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400/20" />
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/20" />
          </div>
          <div className="p-3">
            <div className="h-2 w-1/2 bg-slate-200 dark:bg-slate-700 rounded-full mb-2" />
            <div className="h-1.5 w-1/3 bg-slate-100 dark:bg-slate-800 rounded-full mb-4" />
            <div className="grid grid-cols-2 gap-2">
              <div className="h-8 bg-slate-50 dark:bg-slate-800/50 rounded-lg" />
              <div className="h-8 bg-slate-50 dark:bg-slate-800/50 rounded-lg" />
            </div>
          </div>
        </div>

        {/* Hover Actions Overlay */}
        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
          <button
            onClick={onEdit}
            disabled={isResuming}
            className="btn-green px-4 py-2 rounded-xl text-xs font-bold shadow-lg"
          >
            {isResuming ? "Chargement..." : "✏ Modifier"}
          </button>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-slate-900 px-4 py-2 rounded-xl text-xs font-bold shadow-lg hover:bg-slate-50"
          >
            Voir →
          </a>
        </div>
      </div>

      {/* Info */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-bold text-sm truncate pr-2" style={{ color: "var(--wg-text)" }}>
            {title || slug}
          </h3>
          <StatusBadge status="success" label="Publié" size="sm" />
        </div>
        <p className="text-[10px] mb-4 opacity-50 font-medium">/{slug}</p>
        
        <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: "var(--wg-border)" }}>
          <span className="text-[10px] font-medium opacity-40">
            Mis à jour le {formatDate(publishedAt)}
          </span>
          <div className="flex -space-x-2">
            {[1, 2].map(i => (
              <div key={i} className="w-5 h-5 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[8px] font-bold">
                {i === 1 ? "AI" : "+"}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
