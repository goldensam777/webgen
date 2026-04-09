import { NextRequest, NextResponse } from "next/server";
import { normalizeSitePayload } from "@/lib/site-schema";

/* ── Palettes concrètes ───────────────────────────────────────── */

const PALETTES = [
  { name: "Nuit violette",    primary:"#7c3aed", secondary:"#a855f7", background:"#0d0a1a", surface:"#1a1330", text:"#f1f0ff", textMuted:"#9b8fc4", border:"#2e2650", font:"Space Grotesk" },
  { name: "Cyan tech",        primary:"#06b6d4", secondary:"#0ea5e9", background:"#0a0f1a", surface:"#0f1929", text:"#e0f7ff", textMuted:"#7bb8cc", border:"#1a3040", font:"DM Sans" },
  { name: "Crème artisan",    primary:"#b45309", secondary:"#d97706", background:"#faf7f0", surface:"#ffffff", text:"#1c1209", textMuted:"#7c6650", border:"#e8ddc8", font:"Merriweather" },
  { name: "Vert forêt",       primary:"#059669", secondary:"#10b981", background:"#f0fdf4", surface:"#ffffff", text:"#052e16", textMuted:"#4b7a5e", border:"#d1fae5", font:"Nunito" },
  { name: "Rouge passion",    primary:"#dc2626", secondary:"#ef4444", background:"#0a0a0a", surface:"#181818", text:"#fafafa", textMuted:"#a3a3a3", border:"#262626", font:"Montserrat" },
  { name: "Marine premium",   primary:"#1e40af", secondary:"#2563eb", background:"#f8faff", surface:"#ffffff", text:"#0f172a", textMuted:"#475569", border:"#dbeafe", font:"Inter" },
  { name: "Rose lifestyle",   primary:"#db2777", secondary:"#ec4899", background:"#fff7fb", surface:"#ffffff", text:"#1a0010", textMuted:"#9d4d7a", border:"#fce7f3", font:"Raleway" },
  { name: "Ardoise corporate",primary:"#334155", secondary:"#475569", background:"#f8fafc", surface:"#ffffff", text:"#0f172a", textMuted:"#64748b", border:"#e2e8f0", font:"Roboto" },
  { name: "Or luxe",          primary:"#b45309", secondary:"#92400e", background:"#fafaf9", surface:"#ffffff", text:"#1c1917", textMuted:"#78716c", border:"#e7e5e4", font:"Playfair Display" },
  { name: "Indigo éducation", primary:"#4f46e5", secondary:"#6366f1", background:"#ffffff", surface:"#f5f3ff", text:"#1e1b4b", textMuted:"#6b7280", border:"#e0e7ff", font:"Poppins" },
  { name: "Sable chaud",      primary:"#c2410c", secondary:"#ea580c", background:"#fffbf7", surface:"#ffffff", text:"#1c0a00", textMuted:"#9a6548", border:"#fed7aa", font:"Lato" },
  { name: "Nuit bleue",       primary:"#0369a1", secondary:"#0284c7", background:"#020617", surface:"#0c1a2e", text:"#e0f2fe", textMuted:"#7ba8cc", border:"#1e3a5f", font:"Open Sans" },
  { name: "Émeraude sombre",  primary:"#10b981", secondary:"#34d399", background:"#021310", surface:"#061f1a", text:"#ecfdf5", textMuted:"#6ee7b7", border:"#064e3b", font:"DM Sans" },
  { name: "Brique moderne",   primary:"#be123c", secondary:"#e11d48", background:"#fff1f2", surface:"#ffffff", text:"#0a0304", textMuted:"#9f1239", border:"#fecdd3", font:"Space Grotesk" },
  { name: "Taupe minimaliste",primary:"#6b7280", secondary:"#374151", background:"#ffffff", surface:"#f9fafb", text:"#111827", textMuted:"#6b7280", border:"#e5e7eb", font:"Inter" },
  { name: "Aubergine créatif",primary:"#7e22ce", secondary:"#9333ea", background:"#1a0526", surface:"#2d0d40", text:"#f5e6ff", textMuted:"#c084fc", border:"#3b0764", font:"Space Grotesk" },
] as const;

const CONTENT_TONES = [
  "direct et confiant",
  "expert mais accessible",
  "chaleureux et humain",
  "haut de gamme et sobre",
  "pédagogique et rassurant",
  "énergique et orienté résultats",
] as const;

const VISUAL_DIRECTIONS = [
  "minimaliste et épuré",
  "moderne et technologique",
  "chaleureux et artisanal",
  "sombre et premium",
  "vibrant et créatif",
  "institutionnel et rassurant",
] as const;

const SECTION_RHYTHMS = [
  "alternance standard (clair/gris)",
  "fort contraste (couleurs vives)",
  "élégance fluide (unifié)",
] as const;

const CTA_STYLES = [
  "prise de rendez-vous",
  "demande de devis",
  "appel découverte",
  "essai gratuit",
  "contact direct",
  "réservation",
] as const;

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function buildVariationPack() {
  const palette = pickRandom(PALETTES);
  return {
    palette,
    directionVisuelle: pickRandom(VISUAL_DIRECTIONS),
    tonEditorial:      pickRandom(CONTENT_TONES),
    rythmeDePage:      pickRandom(SECTION_RHYTHMS),
    styleDeCTA:        pickRandom(CTA_STYLES),
  };
}

/* ── System prompt dynamique ─────────────────────────────────── */

function buildSystemPrompt(variation: ReturnType<typeof buildVariationPack>): string {
  return `Tu es un générateur de sites web professionnel multi-pages.
L'utilisateur décrit son site en langage naturel.
Tu dois retourner UNIQUEMENT un objet JSON valide, sans markdown, sans backticks, sans explication.

══════════════════════════════════════════════
DIRECTIVE DE GÉNÉRATION ACTIVE — PRIORITÉ ABSOLUE
══════════════════════════════════════════════
Pour ce site précis, tu DOIS impérativement appliquer ces directives :
- Direction visuelle : ${variation.directionVisuelle}
- Ton éditorial      : ${variation.tonEditorial}
- Rythme de page     : ${variation.rythmeDePage}
- Style de CTA       : ${variation.styleDeCTA}

══════════════════════════════════════════════
PALETTE ET POLICE — IMPOSÉES, NON NÉGOCIABLES
══════════════════════════════════════════════
Le message utilisateur contient une palette de couleurs et une police IMPOSÉES.
Tu DOIS utiliser exactement ces valeurs dans le champ "theme" du JSON.
N'invente pas d'autres couleurs. N'ajuste pas les hex. Copie-les tels quels.

══════════════════════════════════════════════
LANGUE DU SITE
══════════════════════════════════════════════
Tu DOIS impérativement détecter la langue utilisée par l'utilisateur dans sa description.
Tout le contenu textuel (titres, descriptions, liens, menus, etc.) doit être rédigé dans cette langue.
Si l'utilisateur écrit en anglais, le site est en anglais. S'il écrit en français, le site est en français.

RÈGLES DE VARIÉTÉ DE CONTENU :
- Varie la forme des titres : bénéfice, promesse, preuve, question, formulation éditoriale.
- Évite les phrases génériques du type "Des solutions innovantes pour votre croissance".
- Varie le rythme des sections, la densité des blocs et le ton rédactionnel.
- Donne des détails crédibles propres au secteur au lieu de formulations vagues.

HERO ALIGNMENT :
- Utilise "left" pour les sites pro/tech/B2B. Utilise "center" pour food/beauté/lifestyle/éducation.

══════════════════════════════════════════════
RÈGLES DE SÉLECTION DES SECTIONS
══════════════════════════════════════════════
Sections disponibles : navbar, hero, features, stats, testimonials, pricing, faq, cta, contact, blog, footer, chatwidget

Choisis les sections en fonction du secteur et du contenu :
- SaaS / Produit tech : navbar, hero, features, stats, pricing, testimonials, faq, cta, chatwidget, footer
- Service local / artisan : navbar, hero, features, testimonials, contact, chatwidget, footer
- Restaurant : navbar, hero, features (menu/spécialités), stats, testimonials, contact, footer
- Formation / coaching : navbar, hero, features, pricing, testimonials, faq, cta, blog, footer
- Blog / portfolio : navbar, hero, features, blog, cta, footer
- Page Contact / À propos : navbar, hero, contact, footer (max 4 sections)
N'inclus jamais une section vide ou artificielle. Ajoute "stats" uniquement si des chiffres réels ont du sens.
Ajoute "chatwidget" si un support client ou une interaction directe est pertinente.

══════════════════════════════════════════════
STRUCTURE JSON ATTENDUE
══════════════════════════════════════════════
{
  "pages": [
    {
      "name": "Accueil",
      "slug": "",
      "sections": ["navbar", "hero", "features", "cta", "footer"],
      ... (navbar, hero, features, stats, testimonials, pricing, faq, cta, contact schémas) ...
      "blog": {
        "title": "string",
        "subtitle": "string",
        "ctaLabel": "string",
        "posts": [
          {
            "title": "string",
            "excerpt": "string",
            "date": "string (ex: 12 Mars 2026)",
            "imageSrc": "url unsplash optimisée",
            "slug": "string"
          }
        ],
        "bgColor": "string",
        "titleColor": "string"
      },
      "chatwidget": {
        "greeting": "string (ex: Bonjour ! Comment puis-je vous aider ?)",
        "placeholder": "string (ex: Posez votre question...)",
        "buttonLabel": "string (ex: Support, Chat, Aide)",
        "bgColor": "string (hex)"
      },
      "footer": {
        ...
      }
    }
  ],
  "theme": {
    "primary":    "#hexcolor",
    "secondary":  "#hexcolor",
    "background": "#hexcolor",
    "surface":    "#hexcolor",
    "text":       "#hexcolor",
    "textMuted":  "#hexcolor",
    "border":     "#hexcolor",
    "font":       "string"
  }
}

══════════════════════════════════════════════
RÈGLES GÉNÉRALES
══════════════════════════════════════════════
- La première page a toujours slug="" (c'est la page d'accueil)
- Les autres pages ont un slug pur en minuscules sans accents (ex: "services", "contact", "a-propos"). JAMAIS de slash "/" au début du slug.
- Chaque page est indépendante et complète (navbar + contenu + footer)
- Génère 2 à 4 pages selon la description. Toujours inclure Accueil et une page Contact ou FAQ.
- Le navbar de chaque page doit avoir des liens cohérents vers toutes les pages du site.
- Pour les liens de pages internes (href), utilise UNIQUEMENT le slug pur de la cible :
    * Accueil -> ""
    * Page Contact -> "contact"
    * Page Services -> "services"
- N'utilise JAMAIS de slash "/" au début d'un lien interne.
- Le champ "font" dans theme doit toujours être renseigné avec une police de la liste ci-dessus.
- Génère des contenus réalistes, précis et professionnels. Pas de lorem ipsum. Textes adaptés au vrai secteur.
- Les titres hero doivent être percutants (max 8 mots), les descriptions concises (max 2 phrases).
- Tous les liens et CTA doivent être utiles et cohérents. N'utilise "#" qu'en dernier recours absolu.
- Pour les ancres internes, utilise seulement ces ids si la section existe sur la page: "#features", "#pricing", "#faq", "#contact", "#blog", "#testimonials", "#stats".
- Les boutons principaux doivent pointer vers une destination crédible: prise de contact, FAQ, tarifs, blog, réservation, devis, essai, page contact.
- Ne mélange jamais plusieurs schémas de clés pour une même section.`;
}

/* ── Route POST ─────────────────────────────────────────────── */

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 });
  }

  const description = ((body.description as string) ?? "").trim();
  const summaries   = (body.summaries   as string[]) ?? [];

  if (!description && summaries.length === 0) {
    return NextResponse.json({ error: "Fournissez au moins un fichier ou une description" }, { status: 400 });
  }

  /* ── Variation + system prompt dynamique ── */
  const variationPack = buildVariationPack();
  const systemPrompt  = buildSystemPrompt(variationPack);
  const { palette, tonEditorial, styleDeCTA } = variationPack;

  /* ── Construction du message utilisateur ── */
  const contextBlocks = summaries.map((s) => ({ type: "text" as const, text: s }));
  const userContent = [
    ...contextBlocks,
    {
      type: "text" as const,
      text: `PALETTE IMPOSÉE — utilise exactement ces valeurs dans "theme" :
primary:    "${palette.primary}"
secondary:  "${palette.secondary}"
background: "${palette.background}"
surface:    "${palette.surface}"
text:       "${palette.text}"
textMuted:  "${palette.textMuted}"
border:     "${palette.border}"
font:       "${palette.font}"

Ton éditorial : ${tonEditorial}
Style des CTA : ${styleDeCTA}`,
    },
    ...(description ? [{ type: "text" as const, text: description }] : []),
  ];

  let anthropicRes: Response;
  try {
    anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type":      "application/json",
        "x-api-key":         process.env.ANTHROPIC_API_KEY ?? "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model:      "claude-3-5-sonnet-20240620",
        max_tokens: 8000,
        system:     systemPrompt,
        messages:   [{ role: "user", content: userContent }],
      }),
    });
  } catch (e) {
    return NextResponse.json(
      { error: `Erreur réseau Anthropic : ${(e as Error).message}` },
      { status: 502 }
    );
  }

  if (!anthropicRes.ok) {
    const errBody = await anthropicRes.text().catch(() => "");
    return NextResponse.json(
      { error: `Anthropic ${anthropicRes.status} : ${errBody.slice(0, 200)}` },
      { status: 502 }
    );
  }

  let data: Record<string, unknown>;
  try {
    data = await anthropicRes.json();
  } catch {
    return NextResponse.json({ error: "Réponse Anthropic non-JSON" }, { status: 502 });
  }

  if ((data.stop_reason as string) === "max_tokens") {
    return NextResponse.json(
      { error: "La description est trop longue — le JSON généré a été tronqué. Réduisez le contenu ou simplifiez la demande." },
      { status: 422 }
    );
  }

  const text = (data.content as Array<{ text?: string }>)?.[0]?.text ?? "";

  if (!text) {
    const apiErr = (data.error as Record<string, unknown>)?.message ?? JSON.stringify(data);
    return NextResponse.json({ error: `Réponse vide : ${apiErr}` }, { status: 502 });
  }

  try {
    // Robust extraction: find the first { and the last }
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Aucun bloc JSON trouvé");
    const clean = match[0];
    const config = normalizeSitePayload(JSON.parse(clean));
    return NextResponse.json({ config });
  } catch {
    return NextResponse.json({ error: "L'IA a retourné un format invalide. Réessayez avec une description plus simple.", raw: text.slice(0, 500) }, { status: 500 });
  }
}
