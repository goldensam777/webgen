import { NextRequest } from "next/server";
import type { SiteTheme, SitePage } from "@/app/store/siteStore";

const ANTHROPIC_API = "https://api.anthropic.com/v1/messages";

function buildPrompt(body: {
  sectionKey?: string;
  currentData?: Record<string, unknown>;
  page?: SitePage;
  theme: SiteTheme;
  instruction: string;
  pageMode?: boolean;
}) {
  const { sectionKey, currentData, page, theme, instruction, pageMode } = body;

  if (!pageMode && sectionKey && currentData) {
    const displayData = Object.fromEntries(
      Object.entries(currentData).filter(([k]) => !k.startsWith("_"))
    );
    return {
      kind:      "section" as const,
      internalKeys: Object.keys(currentData).filter(k => k.startsWith("_")),
      currentData,
      prompt: `Tu modifies une section de site web. Retourne UNIQUEMENT le JSON mis à jour, sans markdown, sans explication.

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
- Adapte le contenu au contexte et au thème`,
      maxTokens: 2048,
    };
  }

  if (pageMode && page) {
    return {
      kind:      "page" as const,
      prompt: `Tu modifies une page de site web. Retourne UNIQUEMENT le JSON mis à jour, sans markdown.

Thème : ${JSON.stringify(theme)}

Données de la page :
${JSON.stringify({ sections: page.sections, data: page.data }, null, 2)}

Instruction : "${instruction}"

Règles :
- Retourne un objet JSON avec exactement les clés "sections" (tableau) et "data" (objet)
- Tu peux modifier les données, l'ordre, ou ajouter/supprimer des sections
- Préserve les clés commençant par "_" dans chaque section data
- Retourne UNIQUEMENT le JSON`,
      maxTokens: 4096,
    };
  }

  return null;
}

function extractJSON(raw: string): unknown {
  const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  return JSON.parse(match ? match[1].trim() : raw.trim());
}

/* ── Route POST /api/patch — streaming SSE ──────────────────── */
export async function POST(req: NextRequest) {
  const body = await req.json() as {
    sectionKey?:  string;
    currentData?: Record<string, unknown>;
    page?:        SitePage;
    theme:        SiteTheme;
    instruction:  string;
    pageMode?:    boolean;
  };

  if (!body.instruction?.trim()) {
    return new Response(
      JSON.stringify({ error: "Instruction manquante" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const ctx = buildPrompt(body);
  if (!ctx) {
    return new Response(
      JSON.stringify({ error: "Paramètres invalides" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  /* ── Hit Anthropic with stream:true ── */
  const anthropicRes = await fetch(ANTHROPIC_API, {
    method: "POST",
    headers: {
      "Content-Type":      "application/json",
      "x-api-key":         process.env.ANTHROPIC_API_KEY ?? "",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model:      "claude-haiku-4-5-20251001",
      max_tokens: ctx.maxTokens,
      stream:     true,
      messages:   [{ role: "user", content: ctx.prompt }],
    }),
  });

  if (!anthropicRes.ok || !anthropicRes.body) {
    const err = await anthropicRes.text();
    return new Response(
      JSON.stringify({ error: `Anthropic ${anthropicRes.status}: ${err}` }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  /* ── Transform Anthropic SSE → our SSE format ── */
  const encoder = new TextEncoder();
  let   fullText = "";

  const stream = new ReadableStream({
    async start(controller) {
      const reader = anthropicRes.body!.getReader();
      const dec    = new TextDecoder();
      let   buf    = "";

      const send = (event: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buf += dec.decode(value, { stream: true });
          const lines = buf.split("\n");
          buf = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const raw = line.slice(6).trim();
            if (raw === "[DONE]") continue;

            try {
              const evt = JSON.parse(raw) as {
                type: string;
                delta?: { type: string; text?: string };
              };

              if (
                evt.type === "content_block_delta" &&
                evt.delta?.type === "text_delta" &&
                evt.delta.text
              ) {
                fullText += evt.delta.text;
                send({ type: "delta", text: evt.delta.text });
              }
            } catch { /* skip malformed */ }
          }
        }

        // Stream complete — parse JSON and emit result
        try {
          if (ctx.kind === "section") {
            const updatedData = extractJSON(fullText) as Record<string, unknown>;
            // Re-attach internal keys
            for (const k of ctx.internalKeys) updatedData[k] = ctx.currentData![k];
            send({ type: "done", updatedData });
          } else {
            const updatedPage = extractJSON(fullText) as {
              sections: string[];
              data: Record<string, unknown>;
            };
            send({ type: "done", updatedPage });
          }
        } catch {
          send({ type: "error", message: "Réponse IA invalide", raw: fullText });
        }
      } catch (err) {
        send({ type: "error", message: String(err) });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type":  "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection":    "keep-alive",
    },
  });
}
