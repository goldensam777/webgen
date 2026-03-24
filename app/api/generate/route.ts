import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `Tu es un générateur de sites web professionnel multi-pages.
L'utilisateur décrit son site en langage naturel.
Tu dois retourner UNIQUEMENT un objet JSON valide, sans markdown, sans backticks, sans explication.

Structure JSON attendue :
{
  "pages": [
    {
      "name": "Accueil",
      "slug": "",
      "sections": ["navbar", "hero", "features", "cta", "footer"],
      "navbar": {
        "logo": "string",
        "links": [{ "label": "string", "href": "string" }],
        "ctaLabel": "string",
        "ctaHref": "string"
      },
      "hero": {
        "title": "string",
        "subtitle": "string",
        "description": "string",
        "badgeLabel": "string",
        "ctaLabel": "string",
        "ctaHref": "string",
        "secondaryCtaLabel": "string",
        "secondaryCtaHref": "string",
        "align": "center"
      },
      "features": {
        "title": "string",
        "subtitle": "string",
        "items": [{ "title": "string", "description": "string" }]
      },
      "cta": {
        "title": "string",
        "subtitle": "string",
        "primaryCta": "string",
        "secondaryCta": "string"
      },
      "footer": {
        "logo": "string",
        "description": "string",
        "copyright": "string"
      }
    },
    {
      "name": "Services",
      "slug": "services",
      "sections": ["navbar", "features", "pricing", "footer"],
      "navbar": { "...": "identique à la page accueil" },
      "features": { "title": "string", "subtitle": "string", "items": [] },
      "pricing": {
        "title": "string",
        "subtitle": "string",
        "plans": [{
          "name": "string",
          "price": "string",
          "period": "string",
          "description": "string",
          "features": ["string"],
          "ctaLabel": "string",
          "highlighted": false
        }]
      },
      "footer": { "...": "identique à la page accueil" }
    }
  ],
  "theme": {
    "primary":    "#hexcolor",
    "secondary":  "#hexcolor",
    "background": "#hexcolor",
    "surface":    "#hexcolor",
    "text":       "#hexcolor",
    "textMuted":  "#hexcolor",
    "border":     "#hexcolor"
  }
}

Règles générales :
- La première page a toujours slug="" (c'est la page d'accueil)
- Les autres pages ont un slug en minuscules sans accents (ex: "services", "contact", "a-propos")
- Chaque page est indépendante et complète (navbar + contenu + footer)
- Génère 2 à 4 pages selon la description. Toujours inclure Accueil et une page Contact ou FAQ.
- Le navbar de chaque page doit avoir des liens cohérents vers toutes les pages du site

Règles pour le thème :
- Choisis des couleurs cohérentes avec le secteur et le style décrits
- "primary" : couleur d'action principale (boutons, accents) — suffisamment saturée
- "secondary" : couleur complémentaire
- "background" : fond général (clair ou sombre selon le style)
- "surface" : fond des cartes (légèrement différent du background)
- "text" : texte principal lisible sur background
- "textMuted" : texte secondaire discret
- "border" : bordures et séparateurs

Sections disponibles : navbar, hero, features, stats, testimonials, pricing, faq, cta, contact, footer
Génère des contenus réalistes et professionnels adaptés à la description.`;

export async function POST(req: NextRequest) {
  const { description } = await req.json();

  if (!description?.trim()) {
    return NextResponse.json({ error: "Description requise" }, { status: 400 });
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model:      "claude-sonnet-4-20250514",
      max_tokens: 6000,
      system:     SYSTEM_PROMPT,
      messages:   [{ role: "user", content: description }],
    }),
  });

  const data = await response.json();
  const text = data.content?.[0]?.text ?? "";

  try {
    const clean  = text.replace(/```json|```/g, "").trim();
    const config = JSON.parse(clean);
    return NextResponse.json({ config });
  } catch {
    return NextResponse.json({ error: "Parsing JSON échoué", raw: text }, { status: 500 });
  }
}
