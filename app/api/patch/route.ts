import { NextRequest } from "next/server";
import type { SiteTheme, SitePage } from "@/app/store/siteStore";

const ANTHROPIC_API = "https://api.anthropic.com/v1/messages";
const MODEL         = "claude-haiku-4-5-20251001";

/* ── Prompts ─────────────────────────────────────────────────── */

function buildCtx(body: {
  sectionKey?:  string;
  currentData?: Record<string, unknown>;
  page?:        SitePage;
  theme:        SiteTheme;
  instruction:  string;
  pageMode?:    boolean;
}) {
  const { sectionKey, currentData, page, theme, instruction, pageMode } = body;

  if (!pageMode && sectionKey && currentData) {
    const displayData    = Object.fromEntries(
      Object.entries(currentData).filter(([k]) => !k.startsWith("_"))
    );
    const internalData   = Object.fromEntries(
      Object.entries(currentData).filter(([k]) => k.startsWith("_"))
    );
    return {
      kind:         "section" as const,
      internalData,
      maxTokens:    2048,
      prompt: `Tu modifies une section de site web.
Retourne UNIQUEMENT un objet JSON valide, sans markdown, sans commentaire, sans explication.

Section : "${sectionKey}"
Thème : ${JSON.stringify(theme)}
Données actuelles : ${JSON.stringify(displayData, null, 2)}
Instruction : "${instruction}"

Règles :
- UNIQUEMENT un objet JSON valide
- Ne modifie que ce que l'instruction demande
- Garde la même structure et les mêmes clés
- Pour les tableaux tu peux ajouter/modifier/supprimer des éléments`,
    };
  }

  if (pageMode && page) {
    return {
      kind:         "page" as const,
      internalData: {},
      maxTokens:    4096,
      prompt: `Tu modifies une page de site web.
Retourne UNIQUEMENT un objet JSON, sans markdown.

Thème : ${JSON.stringify(theme)}
Page : ${JSON.stringify({ sections: page.sections, data: page.data }, null, 2)}
Instruction : "${instruction}"

Règles :
- Retourne exactement { "sections": [...], "data": {...} }
- Tu peux modifier données, ordre, ajouter/supprimer des sections
- Préserve les clés commençant par "_"`,
    };
  }

  return null;
}

/* ── Route POST /api/patch ───────────────────────────────────── */
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
    return new Response(JSON.stringify({ error: "Instruction manquante" }),
      { status: 400, headers: { "Content-Type": "application/json" } });
  }

  const ctx = buildCtx(body);
  if (!ctx) {
    return new Response(JSON.stringify({ error: "Paramètres invalides" }),
      { status: 400, headers: { "Content-Type": "application/json" } });
  }

  /* ── Anthropic streaming request ── */
  const anthropicRes = await fetch(ANTHROPIC_API, {
    method:  "POST",
    headers: {
      "Content-Type":      "application/json",
      "x-api-key":         process.env.ANTHROPIC_API_KEY ?? "",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model:      MODEL,
      max_tokens: ctx.maxTokens,
      stream:     true,
      messages:   [{ role: "user", content: ctx.prompt }],
    }),
  });

  if (!anthropicRes.ok || !anthropicRes.body) {
    const err = await anthropicRes.text();
    return new Response(JSON.stringify({ error: `Anthropic ${anthropicRes.status}: ${err}` }),
      { status: 500, headers: { "Content-Type": "application/json" } });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (evt: Record<string, unknown>) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(evt)}\n\n`));

      const reader = anthropicRes.body!.getReader();
      const dec    = new TextDecoder();
      let   buf    = "";

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
            if (!raw || raw === "[DONE]") continue;
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
                send({ t: "d", v: evt.delta.text }); // delta
              }
            } catch { /* malformed line */ }
          }
        }

        // Stream finished — signal done with internalData (small object, safe to send)
        send({ t: "z", internalData: ctx.internalData, kind: ctx.kind });

      } catch (err) {
        send({ t: "e", message: String(err) });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type":  "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
