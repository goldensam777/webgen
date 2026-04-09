// app/page.tsx — Landing page Webgen (Refined Pro & Theme Adaptive)
"use client";
import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/app/store/authStore";
import { useHydrated } from "@/lib/use-hydrated";
import { Logo } from "@/components/ui/Logo";

/* ── Icons ──────────────── */
const Icons = {
  Sparkles: () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  ),
  Palette: () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.53 16.122a3 3 0 00-3.012 3.011 3.375 3.375 0 01-3.375-3.375c0-1.864 1.512-3.375 3.375-3.375 1.864 0 3.375 1.511 3.375 3.375a3.375 3.375 0 01-3.375 3.375M16.122 9.53a3 3 0 01-3.011-3.011 3.375 3.375 0 00-3.375 3.375c0 1.864 1.511 3.375 3.375 3.375 1.864 0 3.375-1.511 3.375-3.375A3.375 3.375 0 0016.122 9.53zM16.122 9.53a3 3 0 003.011-3.011 3.375 3.375 0 013.375 3.375c0 1.864-1.511 3.375-3.375 3.375-1.864 0-3.375-1.511-3.375-3.375a3.375 3.375 0 013.375-3.375M9.53 16.122a3 3 0 013.011 3.011 3.375 3.375 0 003.375-3.375c0-1.864-1.511-3.375-3.375-3.375-1.864 0-3.375 1.511-3.375 3.375a3.375 3.375 0 003.375 3.375" />
    </svg>
  ),
  Lightning: () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  ),
  Rocket: () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 0012 3.75a14.98 14.98 0 00-9.75 3.75 14.98 14.98 0 006.16 12.12m5.84-2.58a14.98 14.98 0 016.16-12.12A14.98 14.98 0 0112 3.75a14.98 14.98 0 01-9.75 3.75 14.98 14.98 0 016.16 12.12m5.84-2.58V10.5a3.375 3.375 0 00-3.375-3.375h-1.5a3.375 3.375 0 00-3.375 3.375v1.875m5.84 2.25l-5.84 2.25m5.84-2.25v2.25" />
    </svg>
  ),
};

/* ── Smart CTA ─────────── */
function SmartCTA({ label, className }: { label: string; className?: string }) {
  const hydrated = useHydrated();
  const { user } = useAuthStore();
  const href = hydrated && user ? "/dashboard" : "/auth";
  return (
    <Link href={href} className={className}>
      {label}
    </Link>
  );
}

/* ══════════════════════════════════════════════════════════════
   Carousel — Substantial sites mockup
══════════════════════════════════════════════════════════════ */
interface Slide {
  name:     string;
  category: string;
  primary:  string;
  dark:     string;
  bg:       string;
}

const SLIDES: Slide[] = [
  { name: "Boulangerie du Coin", category: "Commerce",  primary: "#f59e0b", dark: "#d97706", bg: "#fffdf7" },
  { name: "Studio Visuelle",    category: "Créatif",    primary: "#8b5cf6", dark: "#6d28d9", bg: "#faf5ff" },
  { name: "Clinique Santé+",    category: "Médical",    primary: "#10b981", dark: "#059669", bg: "#f0fdf9" },
  { name: "Cabinet Juridique",  category: "Juridique",  primary: "#2563eb", dark: "#1d4ed8", bg: "#eff6ff" },
  { name: "Agence Digitale",    category: "Tech",       primary: "#ef4444", dark: "#dc2626", bg: "#fff5f5" },
];

function MockCard({ slide, active }: { slide: Slide; active: boolean }) {
  return (
    <div
      className="w-64 h-[22rem] rounded-[2.5rem] overflow-hidden border relative flex flex-col transition-shadow duration-500"
      style={{
        backgroundColor: slide.bg,
        borderColor:     `${slide.primary}33`,
        boxShadow: active
          ? `0 40px 80px -20px rgba(0,0,0,0.35), 0 0 0 1px ${slide.primary}40`
          : "0 12px 32px rgba(0,0,0,0.12)",
      }}
    >
      <div className="h-10 flex items-center px-5 gap-3 shrink-0" style={{ background: `linear-gradient(135deg, ${slide.primary}, ${slide.dark})` }}>
        <div className="w-2.5 h-2.5 rounded-full bg-white/40" />
        <span className="font-bold text-white text-[11px] tracking-tight truncate flex-1">{slide.name}</span>
        <div className="flex gap-1">
          {[0, 1].map(i => <div key={i} className="w-4 h-1 rounded-full bg-white/20" />)}
        </div>
      </div>
      <div className="p-6 pb-4">
        <div className="flex flex-col gap-2">
          <div className="h-4 rounded-full w-4/5" style={{ backgroundColor: slide.dark, opacity: 0.15 }} />
          <div className="h-4 rounded-full w-2/3" style={{ backgroundColor: slide.dark, opacity: 0.15 }} />
        </div>
        <div className="mt-4 flex gap-2">
          <div className="h-7 w-20 rounded-xl" style={{ backgroundColor: slide.primary }} />
          <div className="h-7 w-20 rounded-xl border" style={{ borderColor: `${slide.primary}44` }} />
        </div>
      </div>
      <div className="px-6 grid grid-cols-2 gap-3 mb-6">
        {[0, 1].map(i => (
          <div key={i} className="h-20 rounded-2xl border flex flex-col p-3 gap-2" style={{ backgroundColor: "white", borderColor: `${slide.primary}15` }}>
            <div className="w-6 h-6 rounded-lg" style={{ backgroundColor: `${slide.primary}20` }} />
            <div className="h-2 rounded-full w-full" style={{ backgroundColor: slide.dark, opacity: 0.08 }} />
          </div>
        ))}
      </div>
      <div className="mt-auto p-4 px-6 border-t" style={{ borderColor: `${slide.primary}10` }}>
        <div className="h-3 rounded-full w-1/2" style={{ backgroundColor: slide.dark, opacity: 0.05 }} />
      </div>
    </div>
  );
}

function SiteCarousel() {
  const [current, setCurrent] = useState(0);
  const n = SLIDES.length;

  useEffect(() => {
    const t = setInterval(() => setCurrent(c => (c + 1) % n), 3800);
    return () => clearInterval(t);
  }, [n]);

  const offset = (i: number) => {
    const raw = i - current;
    const mod = ((raw % n) + n) % n;
    return mod > n / 2 ? mod - n : mod;
  };

  return (
    <div className="relative h-[26rem] w-full flex items-center justify-center perspective-1000 overflow-visible">
      {SLIDES.map((slide, i) => {
        const off = offset(i);
        const abs = Math.abs(off);
        if (abs > 2) return null;
        return (
          <div
            key={i}
            className="absolute transition-all duration-1000 ease-[cubic-bezier(0.25,0.8,0.25,1)]"
            style={{
              transform: `translateX(${off * 200}px) translateZ(${abs * -150}px) rotateY(${off * -30}deg) scale(${1 - abs * 0.2})`,
              zIndex: 10 - abs,
              opacity: 1 - abs * 0.4,
            }}
          >
            <MockCard slide={slide} active={abs === 0} />
          </div>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   Components
══════════════════════════════════════════════════════════════ */

function BentoCard({ icon: Icon, title, body, className = "" }: { icon: React.ComponentType; title: string; body: string; className?: string }) {
  return (
    <div className={`reveal group p-8 rounded-[2.5rem] border border-white/10 glass hover:bg-white/[0.08] transition-all duration-500 ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-8 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all duration-500">
        <Icon />
      </div>
      <h3 className="text-xl font-bold mb-4 tracking-tight">{title}</h3>
      <p className="leading-relaxed text-sm opacity-60">{body}</p>
    </div>
  );
}

function Accordion({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b py-6" style={{ borderColor: "var(--wg-border)" }}>
      <button 
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-left group"
      >
        <span className="text-lg font-semibold opacity-90 group-hover:text-emerald-500 transition-colors">{question}</span>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 ${open ? 'rotate-45 bg-emerald-500/10 border-emerald-500/30' : 'opacity-30'}`}
          style={{ borderColor: "var(--wg-text)" }}>
          <span className="text-xl">+</span>
        </div>
      </button>
      <div className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${open ? 'max-h-60 mt-4 opacity-100' : 'max-h-0 opacity-0'}`}>
        <p className="text-sm leading-relaxed pb-4 pr-8 opacity-60">{answer}</p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   Page
══════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const featuresId = useId();
  const pricingId  = useId();
  const faqId      = useId();

  return (
    <div className="min-h-screen selection:bg-emerald-500/30 transition-colors duration-500"
      style={{ backgroundColor: "var(--wg-bg)", color: "var(--wg-text)" }}>

      {/* ── Navbar ──────────────────────────────────────── */}
      <nav className="fixed top-8 inset-x-0 mx-auto max-w-4xl h-16 glass rounded-full z-[100] px-8 flex items-center justify-between shadow-2xl border-white/5">
        <div className="flex items-center gap-3">
          <Logo size={28} />
          <span className="font-bold tracking-tighter text-lg">Webgenx</span>
        </div>
        
        <div className="hidden md:flex items-center gap-10 text-sm font-semibold opacity-80">
          <a href={`#${featuresId}`} className="hover:text-emerald-500 transition-colors">Features</a>
          <a href={`#${pricingId}`} className="hover:text-emerald-500 transition-colors">Pricing</a>
          <Link href="/docs/introduction" className="hover:text-emerald-500 transition-colors">Docs</Link>
        </div>

        <SmartCTA label="Commencer" className="btn-green px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-wider" />
      </nav>

      {/* ── Hero ────────────────────────────────────────── */}
      <section className="relative pt-56 pb-32 px-6 overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[30rem] bg-emerald-500/10 blur-[150px] rounded-full -z-10" />

        <div className="max-w-5xl mx-auto text-center flex flex-col items-center">
          <span className="reveal inline-block px-5 py-2 rounded-full glass text-[10px] font-black uppercase tracking-[0.2em] mb-10"
            style={{ color: "var(--wg-text-2)" }}>
            Webgenx Engine v2.0
          </span>
          
          <h1 className="reveal text-7xl md:text-[9rem] font-black tracking-tighter leading-[0.8] mb-12" style={{ animationDelay: '0.1s' }}>
            Des sites web
            <br />
            <span className="text-gradient">en un éclair.</span>
          </h1>

          <p className="reveal text-xl md:text-2xl max-w-2xl leading-relaxed mb-16" 
            style={{ animationDelay: '0.2s', color: "var(--wg-text-2)" }}>
            L&apos;IA qui comprend votre business. Décrivez votre projet, nous générons
            votre présence en ligne en moins de 30 secondes.
          </p>

          <div className="reveal flex flex-col sm:flex-row gap-5" style={{ animationDelay: '0.3s' }}>
            <SmartCTA 
              label="Créer mon site gratuitement →" 
              className="btn-green px-10 py-5 rounded-[2rem] text-base font-black shadow-[0_0_50px_-10px_rgba(16,185,129,0.5)]" 
            />
            <Link href="/docs/introduction" className="glass px-10 py-5 rounded-[2rem] text-base font-bold hover:bg-white/5 transition-colors">
              Voir la doc
            </Link>
          </div>

          {/* Carousel */}
          <div className="reveal mt-32 w-full" style={{ animationDelay: '0.4s' }}>
            <SiteCarousel />
          </div>
        </div>
      </section>

      {/* ── Social Proof ────────────────────────────────── */}
      <section className="py-16 border-y border-white/[0.05]" style={{ backgroundColor: "var(--wg-bg-2)", borderColor: "var(--wg-border)" }}>
        <div className="max-w-5xl mx-auto px-6 flex flex-wrap justify-center items-center gap-16 opacity-30 grayscale">
          {["Next.js", "React 19", "AI Engine", "Supabase", "Tailwind 4"].map(tech => (
            <span key={tech} className="text-xs font-black tracking-[0.3em] uppercase">{tech}</span>
          ))}
        </div>
      </section>

      {/* ── Bento Features ──────────────────────────────── */}
      <section id={featuresId} className="py-40 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-24">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-6">La magie du sans-code.</h2>
            <p className="text-xl max-w-xl" style={{ color: "var(--wg-text-2)" }}>
              Tout ce dont vous avez besoin pour lancer votre projet en un temps record.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-8">
            <BentoCard 
              className="md:col-span-3"
              icon={Icons.Sparkles}
              title="Génération Contextuelle"
              body="Notre IA analyse vos fichiers (PDF, MD, CSV) pour extraire l'essence de votre activité et générer des textes percutants qui vous ressemblent."
            />
            <BentoCard 
              className="md:col-span-3"
              icon={Icons.Palette}
              title="Design System Intelligent"
              body="Fini les sites génériques. L'IA choisit une palette de couleurs et des typographies cohérentes avec votre secteur d'activité."
            />
            <BentoCard 
              className="md:col-span-2"
              icon={Icons.Lightning}
              title="Éditeur Temps Réel"
              body="Modifiez vos textes et styles directement dans l'aperçu. C'est instantané, visuel et sans aucune friction."
            />
            <BentoCard 
              className="md:col-span-4"
              icon={Icons.Rocket}
              title="Publication Instantanée"
              body="Un clic suffit pour mettre votre site en ligne sur un sous-domaine optimisé ou pour télécharger le code source complet."
            />
          </div>
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────── */}
      <section id={pricingId} className="py-40 px-6" style={{ backgroundColor: "var(--wg-bg-2)" }}>
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-20">Un prix simple.</h2>
          
          <div className="w-full p-1 rounded-[3.5rem] bg-gradient-to-tr from-emerald-500/30 via-emerald-500/10 to-transparent shadow-xl">
            <div className="glass rounded-[3.4rem] p-16 flex flex-col items-center">
              <span className="px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest mb-6 border border-emerald-500/20">
                Early Bird Access
              </span>
              <div className="text-8xl md:text-9xl font-black mb-6 tracking-tighter">0€</div>
              <p className="mb-12 max-w-sm text-lg" style={{ color: "var(--wg-text-2)" }}>
                Webgenx est actuellement en beta ouverte. Profitez de toutes les fonctionnalités gratuitement.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-5 text-left mb-16 w-full max-w-lg">
                {["Générations illimitées", "Export HTML/ZIP", "Éditeur visuel", "Sous-domaine offert", "Support 24/7", "Sécurité avancée"].map(f => (
                  <div key={f} className="flex items-center gap-4 text-sm font-medium opacity-80">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-[10px]">✓</div>
                    {f}
                  </div>
                ))}
              </div>
              <SmartCTA label="Rejoindre la beta gratuitement" className="btn-green w-full max-w-sm py-5 rounded-[2rem] font-black uppercase tracking-wider text-sm shadow-xl" />
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────── */}
      <section id={faqId} className="py-40 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-16 text-center">Questions fréquentes</h2>
          <div className="flex flex-col">
            <Accordion 
              question="Puis-je exporter le code ?"
              answer="Oui, absolument. Vous pouvez télécharger votre site sous forme de fichier index.html ou d'archive ZIP incluant tous les assets. Le code est propre, sans dépendances inutiles."
            />
            <Accordion 
              question="Quelles langues sont supportées ?"
              answer="L'IA détecte automatiquement la langue de votre description. Vous pouvez générer des sites complets en français, anglais, espagnol, allemand, etc."
            />
            <Accordion 
              question="Comment fonctionne la personnalisation ?"
              answer="Utilisez l'éditeur visuel pour modifier les textes ou changez le thème global. Pour des changements structurels, demandez simplement à l'IA via le panneau de retouches (Ctrl+I)."
            />
            <Accordion 
              question="Puis-je utiliser mon propre domaine ?"
              answer="Dans la version actuelle, nous proposons des sous-domaines .webgenx.app. Le support des domaines personnalisés est prévu pour la version 1.0."
            />
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────── */}
      <footer className="py-24 px-8 border-t" style={{ borderColor: "var(--wg-border)", backgroundColor: "var(--wg-bg)" }}>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16">
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-8">
              <Logo size={24} />
              <span className="font-bold text-xl tracking-tighter">Webgenx</span>
            </div>
            <p className="text-base max-w-xs leading-relaxed" style={{ color: "var(--wg-text-2)" }}>
              Le futur du développement web est assisté par l&apos;IA. 
              Générez, personnalisez, déployez en quelques secondes.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.2em] opacity-50 mb-8">Produit</h4>
            <div className="flex flex-col gap-5 text-sm font-semibold opacity-70">
              <Link href="/create" className="hover:text-emerald-400 transition-colors">Générateur</Link>
              <Link href="/dashboard" className="hover:text-emerald-400 transition-colors">Dashboard</Link>
              <Link href="/docs/introduction" className="hover:text-emerald-400 transition-colors">Documentation</Link>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.2em] opacity-50 mb-8">Légal</h4>
            <div className="flex flex-col gap-5 text-sm font-semibold opacity-70">
              <Link href="/legal/confidentialite" className="hover:text-emerald-400 transition-colors">Confidentialité</Link>
              <Link href="/legal/cgu" className="hover:text-emerald-400 transition-colors">CGU</Link>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-24 pt-10 border-t flex flex-col md:flex-row justify-between items-center gap-8"
          style={{ borderColor: "var(--wg-border)" }}>
          <p className="text-xs font-medium opacity-50">© 2026 Webgenx. Tous droits réservés.</p>
          <div className="flex items-center gap-10 text-[10px] font-black uppercase tracking-widest opacity-50">
            <span className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-emerald-500" /> Next.js 16</span>
            <span className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-emerald-500" /> Webgen Engine v2</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
