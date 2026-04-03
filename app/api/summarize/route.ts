import { NextRequest, NextResponse } from "next/server";

/* ── Prompts ──────────────────────────────────────────────────── */

const DOCUMENT_PROMPT = `Tu analyses un document pour aider à créer un site web professionnel.
Extrais et résume les informations clés : identité, titre/poste, spécialités, expériences, réalisations, services proposés, chiffres marquants, citations, coordonnées.
Réponds en français, structuré et concis (350 mots max).
Ne génère pas de site — uniquement le résumé du contenu utile.`;

const IMAGE_PROMPT = `Décris cette image de façon utile pour la création d'un site web : contenu principal, style visuel, couleurs dominantes, ambiance générale, ce qu'elle représente.
Réponds en 2-3 phrases concises en français.`;

/* ── Types ─────────────────────────────────────────────────────── */

type ContentBlock =
  | { type: "text"; text: string }
  | { type: "image"; source: { type: "base64"; media_type: string; data: string } };

/* ── Polyfill Node.js : APIs browser requis par pdfjs-dist ─────── */

function ensureBrowserPolyfills() {
  if (typeof globalThis.DOMMatrix === "undefined") {
    class DOMMatrixPolyfill {
      a=1; b=0; c=0; d=1; e=0; f=0;
      m11=1; m12=0; m13=0; m14=0; m21=0; m22=1; m23=0; m24=0;
      m31=0; m32=0; m33=1; m34=0; m41=0; m42=0; m43=0; m44=1;
      is2D=true; isIdentity=true;
      static fromMatrix()         { return new DOMMatrixPolyfill(); }
      static fromFloat32Array()   { return new DOMMatrixPolyfill(); }
      static fromFloat64Array()   { return new DOMMatrixPolyfill(); }
      multiply()                  { return new DOMMatrixPolyfill(); }
      translate()                 { return new DOMMatrixPolyfill(); }
      scale()                     { return new DOMMatrixPolyfill(); }
      scaleNonUniform()           { return new DOMMatrixPolyfill(); }
      rotate()                    { return new DOMMatrixPolyfill(); }
      rotateFromVector()          { return new DOMMatrixPolyfill(); }
      rotateAxisAngle()           { return new DOMMatrixPolyfill(); }
      skewX()                     { return new DOMMatrixPolyfill(); }
      skewY()                     { return new DOMMatrixPolyfill(); }
      flipX()                     { return new DOMMatrixPolyfill(); }
      flipY()                     { return new DOMMatrixPolyfill(); }
      inverse()                   { return new DOMMatrixPolyfill(); }
      transformPoint(p: unknown)  { return p; }
      toFloat32Array()            { return new Float32Array(16); }
      toFloat64Array()            { return new Float64Array(16); }
      toString()                  { return "matrix(1, 0, 0, 1, 0, 0)"; }
    }
    // @ts-expect-error polyfill Node.js
    globalThis.DOMMatrix = DOMMatrixPolyfill;
  }
}

/* ── Extraction texte PDF ───────────────────────────────────────── */

async function extractPdfText(buffer: Buffer): Promise<string> {
  ensureBrowserPolyfills();
  // Import via lib/ pour éviter le test runner qui se déclenche sur require("pdf-parse")
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdf = require("pdf-parse/lib/pdf-parse.js");
  const result = await pdf(buffer);
  // ~20 000 chars ≈ 5 000 tokens — largement suffisant pour un CV
  return result.text.slice(0, 20_000).trim();
}

/* ── Appel Gemini ───────────────────────────────────────────────── */

async function callGemini(textPrompt: string, imageBase64?: string, mediaType?: string): Promise<string> {
  const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];
  
  if (imageBase64 && mediaType) {
    parts.push({ inlineData: { mimeType: mediaType, data: imageBase64 } });
  }
  parts.push({ text: textPrompt });
  
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY ?? ""}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts }],
        generationConfig: { maxOutputTokens: 1000 },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`Gemini ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = await res.json() as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
  };
  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
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

  const TEXT_MIME_TYPES = new Set([
    "text/markdown", "text/plain", "text/csv", "text/html", "text/xml",
    "application/json", "application/xml", "application/x-markdown",
  ]);

  const isTextByName = (name: string) =>
    /\.(md|txt|csv|json|xml|html|htm)$/i.test(name);

  try {
    /* ── PDF ── */
    if (file.type === "application/pdf") {
      const rawText = await extractPdfText(buffer);
      if (!rawText) {
        return NextResponse.json({ error: "PDF vide ou non lisible" }, { status: 422 });
      }
      const summary = await callGemini(
        `${rawText.slice(0, 20_000)}\n\n${DOCUMENT_PROMPT}`
      );
      return NextResponse.json({ summary, type: "pdf", filename: file.name });
    }

    /* ── Image ── */
    if (file.type.startsWith("image/")) {
      const summary = await callGemini(
        IMAGE_PROMPT,
        buffer.toString("base64"),
        file.type
      );
      return NextResponse.json({ summary, type: "image", filename: file.name });
    }

    /* ── Texte (md, txt, csv, json, xml, html…) ── */
    if (TEXT_MIME_TYPES.has(file.type) || isTextByName(file.name)) {
      const rawText = buffer.toString("utf8").slice(0, 20_000).trim();
      if (!rawText) {
        return NextResponse.json({ error: "Fichier texte vide" }, { status: 422 });
      }
      const summary = await callGemini(
        `${rawText}\n\n${DOCUMENT_PROMPT}`
      );
      return NextResponse.json({ summary, type: "text", filename: file.name });
    }

    return NextResponse.json({ error: `Format non supporté : ${file.type || file.name}` }, { status: 415 });

  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
