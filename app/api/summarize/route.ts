import { NextRequest, NextResponse } from "next/server";

/* ── Prompts ──────────────────────────────────────────────────── */

const PDF_PROMPT = `Tu analyses un document pour aider à créer un site web professionnel.
Extrais et résume les informations clés : identité, titre/poste, spécialités, expériences, réalisations, services proposés, chiffres marquants, citations, coordonnées.
Réponds en français, structuré et concis (350 mots max).
Ne génère pas de site — uniquement le résumé du contenu utile.`;

const IMAGE_PROMPT = `Décris cette image de façon utile pour la création d'un site web : contenu principal, style visuel, couleurs dominantes, ambiance générale, ce qu'elle représente.
Réponds en 2-3 phrases concises en français.`;

/* ── Types ─────────────────────────────────────────────────────── */

type ContentBlock =
  | { type: "text"; text: string }
  | { type: "image"; source: { type: "base64"; media_type: string; data: string } };

/* ── Extraction texte PDF ───────────────────────────────────────── */

async function extractPdfText(buffer: Buffer): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdf = require("pdf-parse");
  const result = await pdf(buffer);
  // Limite raisonnable pour le contexte du résumé (~20 000 chars ≈ 5 000 tokens)
  return result.text.slice(0, 20_000).trim();
}

/* ── Appel Claude ───────────────────────────────────────────────── */

async function callClaude(content: ContentBlock[]): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type":      "application/json",
      "x-api-key":         process.env.ANTHROPIC_API_KEY ?? "",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model:      "claude-haiku-4-5-20251001",  // rapide + économique pour résumer
      max_tokens: 1000,
      messages:   [{ role: "user", content }],
    }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`Anthropic ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  return (data.content as Array<{ type: string; text?: string }>)?.[0]?.text ?? "";
}

/* ── Route POST ─────────────────────────────────────────────────── */

export async function POST(req: NextRequest) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Requête invalide (multipart attendu)" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "Aucun fichier reçu" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    /* ── PDF ── */
    if (file.type === "application/pdf") {
      const rawText = await extractPdfText(buffer);
      if (!rawText) {
        return NextResponse.json({ error: "PDF vide ou non lisible" }, { status: 422 });
      }
      const summary = await callClaude([
        { type: "text", text: rawText },
        { type: "text", text: PDF_PROMPT },
      ]);
      return NextResponse.json({ summary, type: "pdf", filename: file.name });
    }

    /* ── Image ── */
    if (file.type.startsWith("image/")) {
      const summary = await callClaude([
        { type: "image", source: { type: "base64", media_type: file.type, data: buffer.toString("base64") } },
        { type: "text", text: IMAGE_PROMPT },
      ]);
      return NextResponse.json({ summary, type: "image", filename: file.name });
    }

    return NextResponse.json({ error: `Type non supporté : ${file.type}` }, { status: 415 });

  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
