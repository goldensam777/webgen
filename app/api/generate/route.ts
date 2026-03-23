import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `Tu es un générateur de sites web professionnel.
L'utilisateur décrit son site en langage naturel.
Tu dois retourner UNIQUEMENT un objet JSON valide, sans markdown, sans backticks, sans explication.

Structure JSON attendue :
{
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
    "align": "center" | "left"
  },
  "features": {
    "title": "string",
    "subtitle": "string",
    "items": [{ "title": "string", "description": "string" }]
  },
  "pricing": {
    "title": "string",
    "subtitle": "string",
    "plans": [{
      "name": "string",
      "price": number | "string",
      "period": "string",
      "description": "string",
      "features": ["string"],
      "ctaLabel": "string",
      "highlighted": boolean
    }]
  },
  "faq": {
    "title": "string",
    "items": [{ "title": "string", "content": "string" }]
  },
  "footer": {
    "logo": "string",
    "description": "string",
    "copyright": "string"
  },
  "theme": {
    "primary":    "#hexcolor",
    "secondary":  "#hexcolor",
    "background": "#hexcolor",
    "surface":    "#hexcolor",
    "text":       "#hexcolor",
    "textMuted":  "#hexcolor",
    "border":     "#hexcolor"
  },
  "sections": ["navbar", "hero", "features", "pricing", "faq", "footer"]
}

Règles pour le thème :
- Choisis des couleurs cohérentes avec le secteur et le style décrits par l'utilisateur
- "primary" : couleur d'action principale (boutons, accents) — doit être suffisamment saturée
- "secondary" : couleur complémentaire ou d'accentuation
- "background" : fond général de la page (clair ou sombre selon le style)
- "surface" : fond des cartes et panneaux (légèrement différent du background)
- "text" : couleur du texte principal — doit être lisible sur background
- "textMuted" : texte secondaire, plus discret
- "border" : couleur des bordures et séparateurs

Génère des contenus réalistes et professionnels adaptés à la description.
Inclure uniquement les sections pertinentes dans "sections".`;

export async function POST(req: NextRequest) {
  const { description } = await req.json();

  if (!description?.trim()) {
    return NextResponse.json({ error: "Description requise" }, { status: 400 });
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
      "anthropic-version": "2023-06-01",
     },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: description }],
    }),
  });

  const data = await response.json();
  const text = data.content?.[0]?.text ?? "";

  try {
    const clean = text.replace(/```json|```/g, "").trim();
    const config = JSON.parse(clean);
    return NextResponse.json({ config });
  } catch {
    return NextResponse.json({ error: "Parsing JSON échoué", raw: text }, { status: 500 });
  }
}