import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const ANTHROPIC_API = "https://api.anthropic.com/v1/messages";

type Params = { params: Promise<{ siteSlug: string }> };

interface Message {
  role: "user" | "assistant";
  content: string;
}

/* ── POST /api/chat/[siteSlug] ── */
export async function POST(req: NextRequest, { params }: Params) {
  const { siteSlug } = await params;
  const body = await req.json() as { messages: Message[]; sessionId?: string };
  const { messages, sessionId } = body;

  if (!messages?.length) {
    return NextResponse.json({ error: "Messages manquants" }, { status: 400 });
  }

  // Charger la config du site pour le contexte
  const { data: site } = await supabase
    .from("sites")
    .select("config")
    .eq("slug", siteSlug)
    .single();

  // Construire un résumé du site pour le contexte IA
  let siteContext = `Tu es l'assistant virtuel du site "${siteSlug}".`;
  if (site?.config) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const config = site.config as any;
    const pages = Array.isArray(config.pages) ? config.pages : [];
    const homePage = pages[0];
    if (homePage?.data?.hero?.title)       siteContext += ` Le site s'intitule "${homePage.data.hero.title}".`;
    if (homePage?.data?.hero?.description) siteContext += ` Description : "${homePage.data.hero.description}".`;
    if (homePage?.data?.navbar?.logo)      siteContext += ` Nom de la marque : "${homePage.data.navbar.logo}".`;
    const contactData = homePage?.data?.contact;
    if (contactData?.email) siteContext += ` Email de contact : ${contactData.email}.`;
    if (contactData?.phone) siteContext += ` Téléphone : ${contactData.phone}.`;
  }
  siteContext += " Réponds en français, de façon concise et utile. Tu ne connais que ce site.";

  const systemPrompt = siteContext;

  const res = await fetch(ANTHROPIC_API, {
    method:  "POST",
    headers: {
      "Content-Type":      "application/json",
      "x-api-key":         process.env.ANTHROPIC_API_KEY ?? "",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model:      "claude-haiku-4-5-20251001",
      max_tokens: 512,
      system:     systemPrompt,
      messages:   messages.map(m => ({ role: m.role, content: m.content })),
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: `Anthropic ${res.status}: ${err}` }, { status: 500 });
  }

  const aiData = await res.json() as { content: { text: string }[] };
  const reply = aiData.content[0].text.trim();

  // Persister le message (optionnel — pas bloquant)
  if (sessionId) {
    await supabase.from("chat_messages").insert([
      { site_slug: siteSlug, session_id: sessionId, role: "user",      content: messages[messages.length - 1].content },
      { site_slug: siteSlug, session_id: sessionId, role: "assistant", content: reply },
    ]);
  }

  return NextResponse.json({ reply });
}
