// app/page.tsx — Landing page Webgen
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "@/app/store/authStore";

/* ── Smart CTA : dashboard si connecté, sinon auth ─────────── */
function SmartCTA({ label, className }: { label: string; className?: string }) {
  const [mounted, setMounted] = useState(false);
  const { user } = useAuthStore();
  useEffect(() => { setMounted(true); }, []);
  const href = mounted && user ? "/dashboard" : "/auth";
  return (
    <Link href={href} className={className}>
      {label}
    </Link>
  );
}

/* ══════════════════════════════════════════════════════════════
   Carousel — sites mockup 3D
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
      className="w-56 h-[320px] rounded-2xl overflow-hidden border relative"
      style={{
        backgroundColor: slide.bg,
        borderColor:     `${slide.primary}22`,
        boxShadow: active
          ? `0 28px 60px rgba(0,0,0,0.22), 0 0 0 1px ${slide.primary}30`
          : "0 8px 24px rgba(0,0,0,0.10)",
      }}
    >
      {/* Navbar */}
      <div
        className="h-10 flex items-center px-3 gap-2"
        style={{ background: `linear-gradient(135deg, ${slide.primary}, ${slide.dark})` }}
      >
        <span className="font-bold text-white text-xs truncate flex-1">{slide.name}</span>
        <div className="flex gap-1">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-5 h-1.5 rounded-full bg-white/30" />
          ))}
        </div>
      </div>

      {/* Hero area */}
      <div className="p-4">
        <span
          className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold mb-3"
          style={{ background: `${slide.primary}18`, color: slide.primary }}
        >
          {slide.category}
        </span>
        <div className="space-y-1.5 mb-4">
          <div className="h-4 rounded w-4/5"  style={{ backgroundColor: slide.dark, opacity: 0.7 }} />
          <div className="h-2.5 rounded w-2/3" style={{ backgroundColor: slide.dark, opacity: 0.25 }} />
          <div className="h-2.5 rounded w-1/2" style={{ backgroundColor: slide.dark, opacity: 0.18 }} />
        </div>
        <div
          className="h-8 w-24 rounded-lg"
          style={{ background: `linear-gradient(135deg, ${slide.primary}, ${slide.dark})` }}
        />
      </div>

      {/* Feature cards row */}
      <div className="flex gap-1.5 px-4 mb-4">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="flex-1 rounded-xl p-2 border"
            style={{
              backgroundColor: "rgba(255,255,255,0.7)",
              borderColor:     `${slide.primary}18`,
            }}
          >
            <div className="w-5 h-5 rounded-lg mb-1.5" style={{ background: `${slide.primary}25` }} />
            <div className="h-1.5 rounded mb-1"   style={{ backgroundColor: slide.dark, opacity: 0.28 }} />
            <div className="h-1.5 rounded w-3/4"  style={{ backgroundColor: slide.dark, opacity: 0.18 }} />
          </div>
        ))}
      </div>

      {/* Testimonial strip */}
      <div className="px-4">
        <div
          className="rounded-xl p-2.5 border"
          style={{ backgroundColor: "rgba(255,255,255,0.6)", borderColor: `${slide.primary}15` }}
        >
          <div className="flex gap-2 items-center mb-1.5">
            <div className="w-6 h-6 rounded-full shrink-0" style={{ backgroundColor: `${slide.primary}35` }} />
            <div className="h-2 rounded flex-1" style={{ backgroundColor: slide.dark, opacity: 0.28 }} />
          </div>
          <div className="h-1.5 rounded mb-1"  style={{ backgroundColor: slide.dark, opacity: 0.18 }} />
          <div className="h-1.5 rounded w-4/5" style={{ backgroundColor: slide.dark, opacity: 0.13 }} />
        </div>
      </div>

      {/* Bottom accent */}
      <div
        className="absolute bottom-0 inset-x-0 h-0.5"
        style={{ backgroundColor: slide.primary }}
      />
    </div>
  );
}

function SiteCarousel() {
  const [current, setCurrent] = useState(0);
  const [auto, setAuto]       = useState(true);
  const n = SLIDES.length;

  useEffect(() => {
    if (!auto) return;
    const t = setInterval(() => setCurrent(c => (c + 1) % n), 3200);
    return () => clearInterval(t);
  }, [auto, n]);

  /* Compute offset (-2..+2) of slide i relative to current */
  const offset = (i: number) => {
    const raw = i - current;
    const mod = ((raw % n) + n) % n;
    return mod > n / 2 ? mod - n : mod;
  };

  return (
    <div className="flex flex-col items-center gap-8 select-none">
      {/* Track */}
      <div
        className="relative h-[360px] w-full max-w-3xl flex items-center justify-center"
        style={{ overflow: "visible" }}
      >
        {SLIDES.map((slide, i) => {
          const off = offset(i);
          const abs = Math.abs(off);
          const sign = Math.sign(off);
          if (abs > 2) return null;

          return (
            <div
              key={i}
              className="absolute cursor-pointer"
              style={{
                transform:  `translateX(${sign * 190}px)`,
                zIndex:     10 - abs,
                transition: "transform 0.75s cubic-bezier(0.25,0.8,0.25,1)",
              }}
              onClick={() => { if (abs > 0) setCurrent(i); }}
            >
              <div
                style={{
                  transform:  `perspective(900px) rotateY(${sign * -30}deg) scale(${abs === 0 ? 1 : abs === 1 ? 0.86 : 0.72})`,
                  opacity:    abs === 0 ? 1 : abs === 1 ? 0.72 : 0.38,
                  transition: "all 0.75s cubic-bezier(0.25,0.8,0.25,1)",
                }}
              >
                <MockCard slide={slide} active={abs === 0} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Controls — style pill inspired by the TikTok reference */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setCurrent(c => (c - 1 + n) % n)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors"
          style={{
            borderColor:     "var(--wg-border)",
            color:           "var(--wg-text-2)",
            backgroundColor: "var(--wg-bg-2)",
          }}
        >
          ◀ Préc
        </button>

        <button
          onClick={() => setAuto(a => !a)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors"
          style={{
            borderColor:     auto ? "var(--wg-green)"       : "var(--wg-border)",
            color:           auto ? "var(--wg-green)"       : "var(--wg-text-2)",
            backgroundColor: auto ? "var(--wg-green-muted)" : "var(--wg-bg-2)",
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full inline-block"
            style={{ backgroundColor: auto ? "var(--wg-green)" : "var(--wg-text-3)" }}
          />
          Auto
        </button>

        <button
          onClick={() => setCurrent(c => (c + 1) % n)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors"
          style={{
            borderColor:     "var(--wg-border)",
            color:           "var(--wg-text-2)",
            backgroundColor: "var(--wg-bg-2)",
          }}
        >
          Suiv ▶
        </button>
      </div>

      {/* Dots */}
      <div className="flex gap-2 items-center">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className="rounded-full transition-all duration-300"
            style={{
              width:           i === current ? "24px" : "8px",
              height:          "8px",
              backgroundColor: i === current ? "var(--wg-green)" : "var(--wg-border)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   Wave SVG
══════════════════════════════════════════════════════════════ */
function GreenWave() {
  // Deux couches qui défilent en sens opposés (option 5)
  // avec easing sinusoïdal (option 4) via calcMode="spline"
  //
  // Chaque path = 1 cycle sinusoïdal COMPLET : même y au départ et à l'arrivée,
  // tangente horizontale aux deux bouts → jointure invisible entre les tiles.
  // Forme : départ au milieu (y=75), pic (y=30), retour milieu, creux (y=112), retour milieu.
  const p1 = "M0,75 C160,75 200,30 360,30 C520,30 560,75 720,75 C880,75 920,112 1080,112 C1240,112 1280,75 1440,75 L1440,120 L0,120 Z";
  // Phase inversée par rapport à p1 : départ au milieu (y=70), creux (y=112), retour, pic (y=22), retour.
  const p2 = "M0,70 C160,70 200,112 360,112 C520,112 560,70 720,70 C880,70 920,22 1080,22 C1240,22 1280,70 1440,70 L1440,120 L0,120 Z";

  return (
    <svg
      className="w-full block"
      viewBox="0 0 1440 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      preserveAspectRatio="none"
      overflow="hidden"
    >
      <defs>
        {/* Gradient étendu sur 2× la largeur pour couvrir le tile */}
        <linearGradient id="wg-g1" x1="0" y1="0" x2="2880" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#10b981" />
          <stop offset="50%"  stopColor="#059669" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
        <linearGradient id="wg-g2" x1="0" y1="0" x2="2880" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#34d399" />
          <stop offset="50%"  stopColor="#10b981" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>
      </defs>

      {/* Couche arrière — défile vers la GAUCHE, 9s, ease-in-out sinusoïdal */}
      <g>
        {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
        {/* @ts-ignore */}
        <animateTransform
          attributeName="transform"
          type="translate"
          from="0 0"
          to="-1440 0"
          dur="9s"
          repeatCount="indefinite"
          calcMode="spline"
          keyTimes="0;1"
          keySplines="0.37 0 0.63 1"
        />
        <path d={p1} fill="url(#wg-g2)" fillOpacity="0.13" />
        <path d={p1} fill="url(#wg-g2)" fillOpacity="0.13" transform="translate(1440, 0)" />
      </g>

      {/* Couche avant — défile vers la DROITE, 7s, ease-in-out sinusoïdal */}
      <g>
        {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
        {/* @ts-ignore */}
        <animateTransform
          attributeName="transform"
          type="translate"
          from="-1440 0"
          to="0 0"
          dur="7s"
          repeatCount="indefinite"
          calcMode="spline"
          keyTimes="0;1"
          keySplines="0.37 0 0.63 1"
        />
        <path d={p2} fill="url(#wg-g1)" fillOpacity="0.22" />
        <path d={p2} fill="url(#wg-g1)" fillOpacity="0.22" transform="translate(1440, 0)" />
      </g>
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════
   Features
══════════════════════════════════════════════════════════════ */
const FEATURES = [
  {
    icon: "✦",
    title: "Décrivez, l'IA crée",
    body: "Tapez votre description en langage naturel. Claude génère le contenu, les textes et une palette de couleurs cohérente avec votre secteur.",
  },
  {
    icon: "◈",
    title: "Éditeur visuel",
    body: "Glissez-déposez les sections, modifiez chaque texte, ajustez les 7 couleurs du thème en temps réel — sans recompilation, sans code.",
  },
  {
    icon: "⬡",
    title: "Publié en un clic",
    body: "Choisissez un slug et publiez sur <strong>votre-slug.webgen.app</strong>. Votre site est en ligne en quelques secondes.",
  },
];

/* ══════════════════════════════════════════════════════════════
   Page
══════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "var(--wg-bg)", color: "var(--wg-text)" }}
    >

      {/* ── Navbar ──────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 px-6 h-14 flex items-center justify-between border-b"
        style={{ backgroundColor: "var(--wg-bg-2)", borderColor: "var(--wg-border)" }}
      >
        <span className="font-bold text-xl" style={{ color: "var(--wg-green)" }}>Webgen</span>
        <SmartCTA label="Commencer" className="btn-green px-4 py-2 rounded-lg text-sm font-semibold" />
      </header>

      {/* ── Hero ────────────────────────────────────────── */}
      <section className="flex flex-col items-center text-center px-6 pt-20 pb-0 overflow-hidden">

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl font-bold leading-tight max-w-3xl tracking-tight">
          Créez votre site web
          <br />
          <span
            style={{
              background:           "var(--wg-grad)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor:  "transparent",
            }}
          >
            en quelques secondes
          </span>
        </h1>

        <p className="mt-6 text-lg max-w-xl leading-relaxed" style={{ color: "var(--wg-text-2)" }}>
          Décrivez votre projet. L&apos;IA génère le contenu, la mise en page et les couleurs.
          Vous personnalisez, vous publiez.
        </p>

        <SmartCTA
          label="Créer mon site gratuitement →"
          className="btn-green mt-8 px-8 py-3 rounded-xl text-base font-semibold inline-block"
        />

        {/* Carousel */}
        <div className="mt-14 w-full">
          <SiteCarousel />
        </div>

      </section>

      {/* Wave — pleine largeur, hors du conteneur centré */}
      <div className="w-full -mt-2 overflow-hidden">
        <GreenWave />
      </div>

      {/* ── Features ────────────────────────────────────── */}
      <section
        className="px-6 py-20"
        style={{ backgroundColor: "var(--wg-bg-3)" }}
      >
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center" style={{ color: "var(--wg-text)" }}>
            Comment ça marche
          </h2>
          <p className="mt-3 text-center text-base max-w-xl mx-auto" style={{ color: "var(--wg-text-2)" }}>
            Trois étapes, zéro friction.
          </p>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="card-3d rounded-2xl p-7 border flex flex-col gap-4"
                style={{ backgroundColor: "var(--wg-bg-2)", borderColor: "var(--wg-border)" }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold"
                  style={{ backgroundColor: "var(--wg-green-muted)", color: "var(--wg-green)" }}
                >
                  {f.icon}
                </div>
                <h3 className="text-lg font-semibold" style={{ color: "var(--wg-text)" }}>
                  {f.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--wg-text-2)" }}
                  dangerouslySetInnerHTML={{ __html: f.body }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ───────────────────────────────────── */}
      <section className="px-6 py-24 flex flex-col items-center text-center">
        <h2 className="text-3xl font-bold max-w-xl" style={{ color: "var(--wg-text)" }}>
          Votre site est à{" "}
          <span
            style={{
              background:           "var(--wg-grad)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor:  "transparent",
            }}
          >
            une description
          </span>{" "}
          de distance.
        </h2>
        <SmartCTA
          label="Commencer maintenant →"
          className="btn-green mt-8 px-8 py-3 rounded-xl text-base font-semibold inline-block"
        />
      </section>

      {/* ── Footer ──────────────────────────────────────── */}
      <footer
        className="mt-auto border-t"
        style={{ borderColor: "var(--wg-border)", backgroundColor: "var(--wg-bg-2)" }}
      >
        <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-2 sm:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1 flex flex-col gap-3">
            <span className="font-bold text-lg" style={{ color: "var(--wg-green)" }}>Webgen</span>
            <p className="text-sm leading-relaxed" style={{ color: "var(--wg-text-2)" }}>
              Plateforme SaaS de génération de sites web propulsée par l&apos;IA.
            </p>
          </div>

          {/* Produit */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--wg-text-3)" }}>
              Produit
            </span>
            {[
              { label: "Créer un site", href: "/create" },
              { label: "Fonctionnalités", href: "#features" },
              { label: "Tarifs", href: "#pricing" },
            ].map(l => (
              <Link
                key={l.label}
                href={l.href}
                className="text-sm transition-colors hover:opacity-80"
                style={{ color: "var(--wg-text-2)" }}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Ressources */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--wg-text-3)" }}>
              Ressources
            </span>
            {[
              { label: "Documentation", href: "/docs/introduction" },
              { label: "Guide IA", href: "/docs/ia-description" },
              { label: "Référence sections", href: "/docs/ref-sections" },
            ].map(l => (
              <Link
                key={l.label}
                href={l.href}
                className="text-sm transition-colors hover:opacity-80"
                style={{ color: "var(--wg-text-2)" }}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Legal */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--wg-text-3)" }}>
              Légal
            </span>
            {[
              { label: "Confidentialité", href: "/legal/confidentialite" },
              { label: "CGU", href: "/legal/cgu" },
            ].map(l => (
              <Link
                key={l.label}
                href={l.href}
                className="text-sm transition-colors hover:opacity-80"
                style={{ color: "var(--wg-text-2)" }}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        <div
          className="border-t px-6 py-4 text-xs text-center"
          style={{ borderColor: "var(--wg-border)", color: "var(--wg-text-3)" }}
        >
          © 2026 Webgen · Propulsé par{" "}
          <span style={{ color: "var(--wg-green)" }}>Premier.js</span> &amp; Claude
        </div>
      </footer>
    </div>
  );
}
