import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `Tu es un générateur de sites web professionnel multi-pages.
L'utilisateur décrit son site en langage naturel.
Tu dois retourner UNIQUEMENT un objet JSON valide, sans markdown, sans backticks, sans explication.

══════════════════════════════════════════════
RÈGLES DE VARIÉTÉ VISUELLE — OBLIGATOIRES
══════════════════════════════════════════════
Chaque site doit avoir une identité visuelle UNIQUE, adaptée à son secteur.
Ne génère JAMAIS deux fois la même palette ou la même police.

SECTEURS ET STYLES PAR DÉFAUT :
• Tech / SaaS / IA      → fond sombre (#0a0a14 ou #0f1117), accent violet (#7c3aed) ou cyan (#06b6d4), font: "Space Grotesk" ou "DM Sans", hero align: left
• E-commerce / Mode     → fond blanc (#ffffff), accent noir (#111827) ou rose (#ec4899), font: "Raleway" ou "Montserrat", hero align: center
• Artisanat / Food / Bio → fond crème (#faf7f2 ou #fffbf0), tons chauds (ocre, terracotta), font: "Merriweather" ou "Playfair Display", hero align: center
• Santé / Bien-être     → fond très clair (#f0f9ff ou #f8fafc), bleu doux (#3b82f6) ou vert (#10b981), font: "Nunito" ou "Lato", hero align: left
• Finance / Juridique   → fond blanc ou gris froid (#f8fafc), bleu marine (#1e3a5f) ou vert foncé (#064e3b), font: "Inter" ou "Roboto", hero align: left
• Éducation / Formation → fond blanc (#ffffff), orange vif (#f97316) ou indigo (#4f46e5), font: "Poppins" ou "Open Sans", hero align: center
• Restaurant / Café     → fond sombre (#1a1008) ou crème foncé (#2d1b08), dorés (#d97706), font: "Playfair Display" ou "Merriweather", hero align: center
• Sport / Fitness       → fond noir (#0a0a0a) ou blanc, rouge vif (#ef4444) ou jaune (#eab308), font: "Montserrat" ou "Raleway", hero align: left
• Immobilier / Luxe     → fond blanc cassé (#fafaf9), anthracite (#1c1917) ou or (#b45309), font: "Raleway" ou "Playfair Display", hero align: left
• Créatif / Agence      → fond coloré inattendu, palette audacieuse, font: "Space Grotesk" ou "DM Sans", hero align: left ou center au hasard

POLICES DISPONIBLES (champ "font") :
"Inter", "Poppins", "Roboto", "Lato", "Montserrat", "Raleway", "Nunito", "Open Sans", "Playfair Display", "Merriweather", "DM Sans", "Space Grotesk"

RÈGLES COULEURS :
- Varie TOUJOURS. Évite les palettes génériques (#2563eb / #7c3aed sur fond #f9fafb) sauf si explicitement demandé.
- Les fonds sombres ont text="#e2e8f0" ou "#f1f5f9", surface légèrement plus clair que background, border subtil.
- Les fonds clairs ont text="#111827" ou "#1c1917", surface="#ffffff" ou légèrement différent du background.
- Assure-toi que primary est lisible en blanc ou en noir dessus.

HERO ALIGNMENT :
- Utilise "left" pour les sites pro/tech/B2B. Utilise "center" pour food/beauté/lifestyle/éducation.
- Ne mets JAMAIS "center" par défaut pour tout.

══════════════════════════════════════════════
RÈGLES DE SÉLECTION DES SECTIONS
══════════════════════════════════════════════
Sections disponibles : navbar, hero, features, stats, testimonials, pricing, faq, cta, contact, footer

Choisis les sections en fonction du secteur et du contenu :
- SaaS / Produit tech : navbar, hero, features, stats, pricing, testimonials, faq, cta, footer
- Service local / artisan : navbar, hero, features, testimonials, contact, footer
- Restaurant : navbar, hero, features (menu/spécialités), stats, testimonials, contact, footer
- Formation / coaching : navbar, hero, features, pricing, testimonials, faq, cta, footer
- Blog / portfolio : navbar, hero, features, cta, footer (simple)
- Page Contact / À propos : navbar, hero, contact, footer (max 4 sections)
N'inclus jamais une section vide ou artificielle. Ajoute "stats" uniquement si des chiffres réels ont du sens.
Ajoute "testimonials" uniquement si des avis clients sont pertinents.

══════════════════════════════════════════════
STRUCTURE JSON ATTENDUE
══════════════════════════════════════════════
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
        "align": "left"
      },
      "features": {
        "title": "string",
        "subtitle": "string",
        "items": [{ "title": "string", "description": "string" }]
      },
      "stats": {
        "items": [{ "value": "string", "label": "string" }]
      },
      "testimonials": {
        "title": "string",
        "items": [{ "name": "string", "role": "string", "content": "string", "avatar": "" }]
      },
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
      "faq": {
        "title": "string",
        "items": [{ "question": "string", "answer": "string" }]
      },
      "cta": {
        "title": "string",
        "subtitle": "string",
        "primaryCta": "string",
        "secondaryCta": "string"
      },
      "contact": {
        "title": "string",
        "subtitle": "string",
        "email": "string",
        "phone": "string",
        "address": "string"
      },
      "footer": {
        "logo": "string",
        "description": "string",
        "copyright": "string"
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
- Les autres pages ont un slug en minuscules sans accents (ex: "services", "contact", "a-propos")
- Chaque page est indépendante et complète (navbar + contenu + footer)
- Génère 2 à 4 pages selon la description. Toujours inclure Accueil et une page Contact ou FAQ.
- Le navbar de chaque page doit avoir des liens cohérents vers toutes les pages du site
- Le champ "font" dans theme doit toujours être renseigné avec une police de la liste ci-dessus
- Génère des contenus réalistes, précis et professionnels. Pas de lorem ipsum. Textes adaptés au vrai secteur.
- Les titres hero doivent être percutants (max 8 mots), les descriptions concises (max 2 phrases).`;

/* ── Types pour les blocs de contenu Claude ─────────────────── */

type TextBlock  = { type: "text"; text: string };
type ImageBlock = { type: "image"; source: { type: "base64"; media_type: string; data: string } };
type ContentBlock = TextBlock | ImageBlock;

/* ── Extraction PDF (server-side) ───────────────────────────── */

async function extractPdfText(buffer: Buffer): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdf = require("pdf-parse");
  const result = await pdf(buffer);
  // Limite à 3000 chars pour ne pas dépasser le contexte
  return result.text.slice(0, 3000).trim();
}

/* ── Route POST ─────────────────────────────────────────────── */

export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") ?? "";
  let description = "";
  const contentBlocks: ContentBlock[] = [];

  if (contentType.includes("multipart/form-data")) {
    /* ── Formulaire avec fichiers ── */
    const formData = await req.formData();
    description = (formData.get("description") as string) ?? "";

    for (const [key, value] of formData.entries()) {
      if (key !== "files") continue;
      const file = value as File;
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      if (file.type === "application/pdf") {
        const text = await extractPdfText(buffer);
        if (text) {
          contentBlocks.push({
            type: "text",
            text: `\n\n[Contenu extrait du PDF "${file.name}"] :\n${text}`,
          });
        }
      } else if (file.type.startsWith("image/")) {
        contentBlocks.push({
          type: "image",
          source: {
            type:       "base64",
            media_type: file.type,
            data:       buffer.toString("base64"),
          },
        });
      }
    }
  } else {
    /* ── JSON simple (rétrocompat) ── */
    const body = await req.json();
    description = body.description ?? "";
  }

  if (!description.trim()) {
    return NextResponse.json({ error: "Description requise" }, { status: 400 });
  }

  /* ── Construction du message utilisateur ── */
  const userContent: ContentBlock[] = [
    ...contentBlocks,
    { type: "text", text: description },
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
        model:      "claude-sonnet-4-6",
        max_tokens: 8000,
        system:     SYSTEM_PROMPT,
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

  // Avertir si la réponse a été coupée par la limite de tokens
  if ((data.stop_reason as string) === "max_tokens") {
    return NextResponse.json(
      { error: "La description est trop longue — le JSON généré a été tronqué. Réduisez le contenu ou simplifiez la demande." },
      { status: 422 }
    );
  }

  const text = (data.content as Array<{ type: string; text?: string }>)?.[0]?.text ?? "";

  if (!text) {
    const apiErr = (data.error as Record<string, unknown>)?.message ?? JSON.stringify(data);
    return NextResponse.json({ error: `Réponse vide : ${apiErr}` }, { status: 502 });
  }

  try {
    const clean  = text.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
    const config = JSON.parse(clean);
    return NextResponse.json({ config });
  } catch {
    return NextResponse.json({ error: "JSON invalide dans la réponse IA", raw: text.slice(0, 500) }, { status: 500 });
  }
}
