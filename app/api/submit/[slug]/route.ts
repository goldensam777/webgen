import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { name, email, message } = await req.json();

  if (!email && !message) {
    return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
  }

  const { error } = await supabase.from("submissions").insert({
    site_slug: slug,
    name:      name    ?? null,
    email:     email   ?? null,
    message:   message ?? null,
  });

  if (error) {
    console.error("submit error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
