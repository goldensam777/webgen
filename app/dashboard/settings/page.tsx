// app/dashboard/settings/page.tsx — Pro Redesign
"use client";
import { useState } from "react";
import { useAuthStore } from "@/app/store/authStore";
import { useHydrated } from "@/lib/use-hydrated";
import { useRouter } from "next/navigation";

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col md:flex-row gap-6 py-10 border-b last:border-0" style={{ borderColor: "var(--wg-border)" }}>
      <div className="md:w-1/3">
        <h3 className="font-bold text-lg mb-1">{title}</h3>
      </div>
      <div className="md:w-2/3 max-w-xl flex flex-col gap-6">
        {children}
      </div>
    </section>
  );
}

export default function SettingsPage() {
  const { user, logout } = useAuthStore();
  const hydrated = useHydrated();
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  if (!hydrated) return null;
  if (!user) { router.push("/auth"); return null; }

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 1000); // UI feedback
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto">
      
      {/* ── Page Header ── */}
      <header className="px-8 pt-8 pb-6 border-b sticky top-0 z-20 backdrop-blur-md"
        style={{ backgroundColor: "rgba(var(--wg-bg-rgb), 0.8)", borderColor: "var(--wg-border)" }}>
        <h1 className="text-2xl font-black tracking-tight" style={{ color: "var(--wg-text)" }}>
          Paramètres
        </h1>
        <p className="text-sm opacity-50 font-medium">Gérez vos informations personnelles et vos préférences.</p>
      </header>

      <div className="max-w-4xl px-8 pb-20">
        
        {/* ── Profile ── */}
        <SettingsSection title="Profil">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 font-black text-2xl border-4 border-emerald-500/10 shadow-xl">
              {user.name?.[0] || "U"}
            </div>
            <div>
              <button className="text-xs font-bold px-4 py-2 rounded-xl border hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                style={{ borderColor: "var(--wg-border)" }}>
                Changer l&apos;avatar
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Nom complet</label>
              <input 
                type="text" 
                defaultValue={user.name}
                className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none transition-all focus:ring-2 focus:ring-emerald-500/20"
                style={{ backgroundColor: "var(--wg-bg-2)", borderColor: "var(--wg-border)" }}
              />
            </div>
            <div className="flex flex-col gap-1.5 opacity-60">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Adresse email</label>
              <input 
                type="email" 
                disabled
                defaultValue={user.email}
                className="w-full px-4 py-2.5 rounded-xl border text-sm cursor-not-allowed"
                style={{ backgroundColor: "var(--wg-bg-3)", borderColor: "var(--wg-border)" }}
              />
              <p className="text-[10px] italic">L&apos;email ne peut pas être modifié pour le moment.</p>
            </div>
          </div>
        </SettingsSection>

        {/* ── Appearance ── */}
        <SettingsSection title="Apparence">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between p-4 glass rounded-2xl border" style={{ borderColor: "var(--wg-border)" }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 5a7 7 0 100 14 7 7 0 000-14z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold">Thème automatique</p>
                  <p className="text-[10px] opacity-50">S&apos;adapte aux réglages de votre système.</p>
                </div>
              </div>
              <div className="w-10 h-5 bg-emerald-500 rounded-full relative">
                <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 glass rounded-2xl border" style={{ borderColor: "var(--wg-border)" }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.583a9.992 9.992 0 01-1.508-2.943m3.158 0a10.025 10.025 0 01-2.428 4.741m-6.941-1.973a9.981 9.992 0 003.3 5.48m1.579-1.827A12.984 12.984 0 0012.44 14c.566.007 1.136-.07 1.722-.247M15 21l-2-2m2 2l2-2m-2 2V13" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold">Langue de l&apos;interface</p>
                  <p className="text-[10px] opacity-50">Français (Par défaut)</p>
                </div>
              </div>
              <button className="text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">Changer</button>
            </div>
          </div>
        </SettingsSection>

        {/* ── Billing / Plans ── */}
        <SettingsSection title="Abonnement">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Free Plan */}
            <div className="p-5 rounded-2xl border bg-slate-50 dark:bg-white/[0.02]" style={{ borderColor: user.plan !== "pro" ? "var(--wg-green)" : "var(--wg-border)" }}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Plan actuel</p>
                  <h4 className="text-lg font-black">Gratuit</h4>
                </div>
                {user.plan !== "pro" && <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase">Actif</span>}
              </div>
              <ul className="space-y-2 mb-6">
                {["1 site actif", "Générations IA limitées", "Sous-domaine webgenx.app", "Aide communautaire"].map(f => (
                  <li key={f} className="text-[10px] opacity-60 flex items-center gap-2">✓ {f}</li>
                ))}
              </ul>
            </div>

            {/* Pro Plan */}
            <div className="p-5 rounded-2xl border relative overflow-hidden group transition-all hover:shadow-xl" 
              style={{ borderColor: user.plan === "pro" ? "var(--wg-green)" : "var(--wg-border)", backgroundColor: "var(--wg-bg-2)" }}>
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-2xl -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40 text-emerald-500">Recommandé</p>
                  <h4 className="text-lg font-black text-gradient">Pro</h4>
                </div>
                {user.plan === "pro" && <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase">Actif</span>}
              </div>
              <ul className="space-y-2 mb-6 relative z-10">
                {["Sites illimités", "Générations IA prioritaires", "Domaines personnalisés", "Export code source ZIP", "Support 24/7"].map(f => (
                  <li key={f} className="text-[10px] opacity-80 flex items-center gap-2">✓ {f}</li>
                ))}
              </ul>
              <button className="w-full btn-green py-2 rounded-xl text-[10px] font-black uppercase tracking-widest relative z-10">Passer au Pro</button>
            </div>
          </div>
        </SettingsSection>

        {/* ── Danger Zone ── */}
        <SettingsSection title="Zone de danger">
          <div className="p-6 rounded-[2rem] border-2 border-red-500/10 bg-red-500/[0.02] flex flex-col gap-4">
            <div>
              <p className="text-sm font-bold text-red-500">Supprimer le compte</p>
              <p className="text-xs opacity-50">Une fois supprimé, toutes vos données et tous vos sites seront définitivement effacés.</p>
            </div>
            <button className="w-full bg-red-500 text-white py-3 rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg shadow-red-500/20 hover:bg-red-600 transition-colors">
              Supprimer mon compte Webgenx
            </button>
          </div>
        </SettingsSection>

        {/* ── Footer Actions ── */}
        <div className="mt-12 flex items-center justify-end gap-4">
          <button className="text-sm font-bold opacity-50 hover:opacity-100 transition-opacity px-6">
            Annuler
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="btn-green px-10 py-3 rounded-2xl text-sm font-black shadow-lg shadow-emerald-500/20 disabled:opacity-50 min-w-[160px]"
          >
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>

      </div>
    </div>
  );
}
