import { NextRequest } from "next/server";
import type { SiteTheme, SitePage } from "@/app/store/siteStore";

const GEMINI_API = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const MODEL = "gemini-2.0-flash";

/* ── Tool definitions ─────────────────────────────────────────── */

const SECTION_TOOLS = [
  {
    name: "set_fields",
    description:
      "Modifie un ou plusieurs champs simples de la section (title, subtitle, description, logo, ctaLabel, etc.). " +
      "Ne pas utiliser pour des tableaux (items, plans, links) — utiliser set_items, patch_item, add_item ou remove_item.",
    input_schema: {
      type: "object",
      properties: {
        changes: {
          type: "object",
          description: 'Paires clé-valeur à modifier. Ex: { "title": "Nouveau titre", "ctaLabel": "Commencer" }',
        },
      },
      required: ["changes"],
    },
  },
  {
    name: "set_items",
    description:
      "Remplace entièrement le tableau principal de la section. " +
      "Utiliser quand plusieurs éléments changent ou que la structure est refaite.",
    input_schema: {
      type: "object",
      properties: {
        field: {
          type: "string",
          description: "Nom du tableau : 'items', 'plans', 'links', 'linkGroups'",
        },
        items: {
          type: "array",
          description: "Nouveau tableau complet, chaque élément respecte le schéma de la section.",
        },
      },
      required: ["field", "items"],
    },
  },
  {
    name: "patch_item",
    description: "Modifie certains champs d'un élément existant dans un tableau, sans toucher aux autres.",
    input_schema: {
      type: "object",
      properties: {
        field:   { type: "string",  description: "Nom du tableau : 'items', 'plans', 'links'" },
        index:   { type: "integer", description: "Index (0-based) de l'élément à modifier" },
        changes: { type: "object",  description: "Champs à modifier sur cet élément" },
      },
      required: ["field", "index", "changes"],
    },
  },
  {
    name: "add_item",
    description: "Ajoute un nouvel élément à la fin d'un tableau.",
    input_schema: {
      type: "object",
      properties: {
        field: { type: "string", description: "Nom du tableau : 'items', 'plans', 'links'" },
        item:  { type: "object", description: "Nouvel élément à ajouter" },
      },
      required: ["field", "item"],
    },
  },
  {
    name: "remove_item",
    description: "Supprime un élément d'un tableau par son index.",
    input_schema: {
      type: "object",
      properties: {
        field: { type: "string",  description: "Nom du tableau" },
        index: { type: "integer", description: "Index (0-based) de l'élément à supprimer" },
      },
      required: ["field", "index"],
    },
  },
];

const PAGE_TOOLS = [
  {
    name: "update_section",
    description: "Modifie les données d'une section existante (merge — les champs non mentionnés sont préservés).",
    input_schema: {
      type: "object",
      properties: {
        key:     { type: "string", description: "Clé de section : hero, features, pricing, faq, etc." },
        changes: { type: "object", description: "Champs à modifier dans la section" },
      },
      required: ["key", "changes"],
    },
  },
  {
    name: "add_section",
    description: "Ajoute une nouvelle section à la page avec ses données initiales.",
    input_schema: {
      type: "object",
      properties: {
        key:      { type: "string",  description: "Clé : testimonials, faq, cta, stats, pricing, blog, chatwidget" },
        data:     { type: "object",  description: "Données initiales complètes de la section" },
        position: { type: "integer", description: "Index d'insertion dans la liste de sections (optionnel, défaut : avant footer)" },
      },
      required: ["key", "data"],
    },
  },
  {
    name: "remove_section",
    description: "Supprime une section de la page (ne pas supprimer navbar ni footer).",
    input_schema: {
      type: "object",
      properties: {
        key: { type: "string", description: "Clé de la section à supprimer" },
      },
      required: ["key"],
    },
  },
  {
    name: "reorder_sections",
    description: "Réordonne les sections de la page.",
    input_schema: {
      type: "object",
      properties: {
        sections: {
          type: "array",
          items: { type: "string" },
          description: "Liste ordonnée complète de toutes les sections de la page",
        },
      },
      required: ["sections"],
    },
  },
];

/* ── Schema hints ─────────────────────────────────────────────── */

const SECTION_SCHEMA_HINTS: Record<string, string> = {
  navbar:       "logo, links:[{label,href}], ctaLabel, ctaHref, bgColor, textColor, logoColor, borderColor",
  hero:         "title, subtitle, description, badgeLabel, ctaLabel, ctaHref, secondaryCtaLabel, secondaryCtaHref, imageSrc, imageAlt, align:'left'|'center', bgColor, titleColor, subtitleColor, descriptionColor",
  features:     "title, subtitle, items:[{title,description}], bgColor, titleColor, subtitleColor, itemTitleColor, itemDescColor",
  stats:        "title, subtitle, items:[{value,label,description}], bgColor, titleColor, subtitleColor, valueColor, labelColor, descriptionColor",
  testimonials: "title, subtitle, items:[{quote,name,role,avatarSrc}], bgColor, titleColor, subtitleColor, quoteColor, nameColor, roleColor",
  pricing:      "title, subtitle, plans:[{name,price,period,description,features:[],ctaLabel,ctaHref,highlighted:bool,badgeLabel}], bgColor, titleColor, subtitleColor",
  faq:          "title, subtitle, items:[{title,content}], bgColor, titleColor, subtitleColor",
  cta:          "title, description, ctaLabel, ctaHref, secondaryCtaLabel, secondaryCtaHref, bgColor, titleColor, descriptionColor",
  contact:      "title, subtitle, email, phone, address, ctaLabel, bgColor, titleColor, subtitleColor",
  footer:       "logo, description, copyright, linkGroups:[{section,items:[{label,href}]}], bgColor, textColor, logoColor, descriptionColor, sectionTitleColor, linkColor, copyrightColor, borderColor",
  blog:         "title, subtitle, ctaLabel, bgColor, titleColor",
  chatwidget:   "title, subtitle, greeting, placeholder, buttonLabel, bgColor",
};

/* ── Context builder ──────────────────────────────────────────── */

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
    const displayData = Object.fromEntries(
      Object.entries(currentData).filter(([k]) => !k.startsWith("_"))
    );
    return {
      tools:     SECTION_TOOLS,
      maxTokens: 2048,
      prompt: `Tu modifies la section "${sectionKey}" d'un site web.
Utilise les outils disponibles — tu peux en appeler plusieurs pour des modifications atomiques.

Thème : ${JSON.stringify(theme)}
Données actuelles : ${JSON.stringify(displayData, null, 2)}
Instruction : "${instruction}"
Champs disponibles : ${SECTION_SCHEMA_HINTS[sectionKey] ?? "champs libres"}

Règles :
- set_fields pour les scalaires (strings, booleans), jamais pour des tableaux
- set_items / patch_item / add_item / remove_item pour tous les tableaux
- Ne touche pas aux clés commençant par "_"
- Préserve les href internes existants
- Pour changer la couleur de fond, utilise set_fields avec { "bgColor": "#rrggbb" ou "nom CSS valide" }
- Pour changer la couleur du texte, utilise set_fields avec le prop approprié : titleColor, subtitleColor, descriptionColor, textColor, logoColor, linkColor, etc. (voir champs disponibles de la section)
- Tous ces props sont des valeurs CSS directes (#rrggbb, "white", "var(--color-text)", etc.)`,
    };
  }

  if (pageMode && page) {
    const safeData = Object.fromEntries(
      page.sections.map(k => [
        k,
        Object.fromEntries(
          Object.entries(page.data[k] ?? {}).filter(([f]) => !f.startsWith("_"))
        ),
      ])
    );
    return {
      tools:     PAGE_TOOLS,
      maxTokens: 4096,
      prompt: `Tu modifies la page "${page.name || "Accueil"}" d'un site web.
Utilise les outils pour modifier, ajouter, supprimer ou réordonner des sections.

Thème : ${JSON.stringify(theme)}
Sections actuelles : ${JSON.stringify(page.sections)}
Données : ${JSON.stringify(safeData, null, 2)}
Instruction : "${instruction}"

Sections disponibles : navbar, hero, features, stats, testimonials, pricing, faq, cta, contact, footer, blog, chatwidget
Règles :
- Ne supprime jamais navbar ni footer
- Ne touche pas aux clés commençant par "_"`,
    };
  }

  return null;
}

/* ── POST /api/patch ──────────────────────────────────────────── */

export async function POST(req: NextRequest) {
  const body = await req.json() as Parameters<typeof buildCtx>[0];

  if (!body.instruction?.trim()) {
    return new Response(JSON.stringify({ error: "Instruction manquante" }),
      { status: 400, headers: { "Content-Type": "application/json" } });
  }

  const ctx = buildCtx(body);
  if (!ctx) {
    return new Response(JSON.stringify({ error: "Paramètres invalides" }),
      { status: 400, headers: { "Content-Type": "application/json" } });
  }

  const geminiRes = await fetch(`${GEMINI_API}?key=${process.env.GEMINI_API_KEY ?? ""}`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: ctx.prompt }] },
      contents: [{ role: "user", parts: [{ text: ctx.prompt }] }],
      generationConfig: { maxOutputTokens: ctx.maxTokens },
    }),
  });

  if (!geminiRes.ok) {
    const err = await geminiRes.text();
    return new Response(JSON.stringify({ error: `Gemini ${geminiRes.status}: ${err}` }),
      { status: 500, headers: { "Content-Type": "application/json" } });
  }

  const geminiData = await geminiRes.json() as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
  };
  const responseText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  if (!responseText) {
    return new Response(JSON.stringify({ error: "Réponse Gemini vide" }),
      { status: 500, headers: { "Content-Type": "application/json" } });
  }

  // Extraire les tool_calls du JSON retourné
  let toolCalls: Array<{ name: string; input: Record<string, unknown> }> = [];
  try {
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)```/) || responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      toolCalls = parsed.tool_calls || parsed.tools || [parsed];
      if (!Array.isArray(toolCalls)) toolCalls = [toolCalls];
    }
  } catch {
    // Fallback: essayer de parser toute la réponse comme JSON
    try {
      const parsed = JSON.parse(responseText);
      toolCalls = parsed.tool_calls || parsed.tools || [parsed];
      if (!Array.isArray(toolCalls)) toolCalls = [toolCalls];
    } catch { /* ignore */ }
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (evt: Record<string, unknown>) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(evt)}\n\n`));

      try {
        for (const call of toolCalls) {
          if (call.name && call.input) {
            send({ t: "tool_call", name: call.name, input: call.input });
          }
        }
        send({ t: "z" });
      } catch (err) {
        send({ t: "e", message: String(err) });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type":      "text/event-stream",
      "Cache-Control":     "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
