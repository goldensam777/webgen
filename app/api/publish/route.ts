import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { supabase } from "@/lib/supabase";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "webgen-dev-secret-change-in-prod"
);

async function getUserId(req: NextRequest): Promise<string | null> {
  const auth  = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return (payload.sub as string) ?? null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const { slug, config } = await req.json();
  const userId = await getUserId(req);

  if (!slug || !config) {
    return NextResponse.json({ error: "slug et config requis" }, { status: 400 });
  }
  if (!/^[a-z0-9-]{2,40}$/.test(slug)) {
    return NextResponse.json(
      { error: "Slug invalide (2-40 caractères : lettres minuscules, chiffres, tirets)" },
      { status: 400 }
    );
  }
  if (!userId) {
    return NextResponse.json({ error: "Connexion requise pour publier." }, { status: 401 });
  }

  const title = (config.pages?.[0]?.data?.navbar?.logo as string)
             || (config.pages?.[0]?.data?.hero?.title as string)
             || slug;

  // Vérifier si le slug est pris par un autre utilisateur
  const { data: existing } = await supabase
    .from("sites")
    .select("id, user_id")
    .eq("slug", slug)
    .single();

  if (existing && existing.user_id !== userId) {
    return NextResponse.json({ error: "Ce nom est déjà pris." }, { status: 409 });
  }

  const { error } = await supabase.from("sites").upsert(
    { slug, user_id: userId, config, title, published_at: new Date().toISOString() },
    { onConflict: "slug" }
  );

  if (error) {
    return NextResponse.json({ error: "Erreur lors de la publication." }, { status: 500 });
  }

  return NextResponse.json({ url: `https://${slug}.webgenx.app` });
}
