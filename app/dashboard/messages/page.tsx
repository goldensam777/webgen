// app/dashboard/messages/page.tsx — Pro CRM View
"use client";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/app/store/authStore";
import { useHydrated } from "@/lib/use-hydrated";
import { StatusBadge } from "@/components/ui/StatusBadge";

interface Lead {
  id:             string;
  site_slug:      string;
  customer_name:  string;
  customer_email: string;
  message:        string;
  created_at:     string;
}

export default function MessagesPage() {
  const { user, token } = useAuthStore();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const hydrated = useHydrated();

  useEffect(() => {
    if (!hydrated || !user) return;

    fetch("/api/dashboard/leads", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => { setLeads(d.leads ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [hydrated, user, token]);

  if (!hydrated) return null;

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto">
      <header className="px-8 pt-8 pb-6 border-b sticky top-0 z-20 backdrop-blur-md"
        style={{ backgroundColor: "rgba(var(--wg-bg-rgb), 0.8)", borderColor: "var(--wg-border)" }}>
        <h1 className="text-2xl font-black tracking-tight">Messages & Leads</h1>
        <p className="text-sm opacity-50 font-medium">Retrouvez tous les messages envoyés via vos formulaires de contact.</p>
      </header>

      <div className="p-8">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-24 rounded-2xl animate-pulse bg-slate-100 dark:bg-white/5" />)}
          </div>
        ) : leads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center glass rounded-[3rem] border-dashed border-2"
            style={{ borderColor: "var(--wg-border)" }}>
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 flex items-center justify-center mb-6 text-emerald-500 text-2xl">✉️</div>
            <h3 className="text-xl font-bold mb-2">Aucun message pour l&apos;instant</h3>
            <p className="text-sm opacity-50 max-w-xs mx-auto">Dès qu&apos;un visiteur vous contactera via l&apos;un de vos sites, il apparaîtra ici.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {leads.map(lead => (
              <div key={lead.id} className="p-6 rounded-[2rem] border glass flex flex-col md:flex-row gap-6 items-start transition-all hover:shadow-xl"
                style={{ borderColor: "var(--wg-border)" }}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-black text-lg truncate">{lead.customer_name}</h4>
                    <StatusBadge status="info" label={lead.site_slug} size="sm" />
                  </div>
                  <p className="text-xs font-bold text-emerald-500 mb-4">{lead.customer_email}</p>
                  <p className="text-sm opacity-70 leading-relaxed bg-slate-50 dark:bg-black/20 p-4 rounded-xl border border-white/5">{lead.message}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-4">
                    Reçu le {new Date(lead.created_at).toLocaleDateString("fr-FR", { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <a href={`mailto:${lead.customer_email}`} className="btn-green px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg">Répondre</a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
