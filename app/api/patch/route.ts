import { NextRequest, NextResponse } from "next/server";
import type { SiteTheme, SitePage } from "@/app/store/siteStore";

const ANTHROPIC_API = "https://api.anthropic.com/v1/messages";

async function callClaude(prompt: string, maxTokens = 2048): Promise<string> {
  const res = await fetch(ANTHROPIC_API, {
    method:  "POST",
    headers: {
      "Content-Type":      "application/json",
      "x-api-key":         process.env.ANTHROPIC_API_KEY ?? "",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model:      "claude-opus-4-6",
      max_tokens: maxTokens,
      messages:   [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic ${res.status}: ${err}`);
  }

  const data = await res.json() as { content: { text: string }[] };
  return data.content[0].text.trim();
}

function extractJSON(raw: string): unknown {
  const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  return JSON.parse(match ? match[1].trim() : raw);
}

/* ── Route POST /api/patch ──────────────────────────────────── */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      sectionKey?: string;
      currentData?: Record<string, unknown>;
      page?: SitePage;
      theme: SiteTheme;
      instruction: string;
      pageMode?: boolean;
    };

    const { sectionKey, currentData, page, theme, instruction, pageMode } = body;

    if (!instruction?.trim()) {
      return NextResponse.json({ error: "Instruction manquante" }, { status: 400 });
    }

    /* ── Patch section ciblée ── */
    if (!pageMode && sectionKey && currentData) {
      const internalKeys = Object.keys(currentData).filter(k => k.startsWith("_"));
      const displayData  = Object.fromEntries(
        Object.entries(currentData).filter(([k]) => !k.startsWith("_"))
      );

      const prompt = `Tu modifies une section de site web. Retourne UNIQUEMENT le JSON mis à jour, sans markdown, sans explication.

Section : "${sectionKey}"
Thème du site : ${JSON.stringify(theme)}

Données actuelles :
${JSON.stringify(displayData, null, 2)}

Instruction : "${instruction}"

Règles :
- Retourne UNIQUEMENT un objet JSON valide
- Ne modifie que ce que l'instruction demande
- Garde la même structure et les mêmes clés
- Pour les tableaux (items, features, plans...), tu peux en ajouter, modifier ou supprimer
- Adapte le contenu au contexte et au thème`;

      const raw = await callClaude(prompt, 2048);
      let updatedData: Record<string, unknown>;
      try {
        updatedData = extractJSON(raw) as Record<string, unknown>;
      } catch {
        return NextResponse.json({ error: "Réponse IA invalide", raw }, { status: 500 });
      }

      // Re-attacher les champs internes (_styles, _elStyles, etc.)
      for (const k of internalKeys) updatedData[k] = currentData[k];

      return NextResponse.json({ updatedData });
    }

    /* ── Patch page entière ── */
    if (pageMode && page) {
      const prompt = `Tu modifies une page de site web. Retourne UNIQUEMENT le JSON mis à jour, sans markdown.

Thème : ${JSON.stringify(theme)}

Données de la page :
${JSON.stringify({ sections: page.sections, data: page.data }, null, 2)}

Instruction : "${instruction}"

Règles :
- Retourne un objet JSON avec exactement les clés "sections" (tableau) et "data" (objet)
- Tu peux modifier les données, l'ordre, ou ajouter/supprimer des sections
- Préserve les clés commençant par "_" dans chaque section data
- Retourne UNIQUEMENT le JSON`;

      const raw = await callClaude(prompt, 4096);
      let updatedPage: { sections: string[]; data: Record<string, unknown> };
      try {
        updatedPage = extractJSON(raw) as typeof updatedPage;
      } catch {
        return NextResponse.json({ error: "Réponse IA invalide", raw }, { status: 500 });
      }

      return NextResponse.json({ updatedPage });
    }

    return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 });
  } catch (err) {
    console.error("patch error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
