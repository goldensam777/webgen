import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { supabase } from "@/lib/supabase";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "webgen-dev-secret-change-in-prod"
);

export async function GET(req: NextRequest) {
  const auth  = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

  if (!token) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  let userId: string;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    userId = payload.sub as string;
  } catch {
    return NextResponse.json({ error: "Token invalide" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("sites")
    .select("slug, title, published_at")
    .eq("user_id", userId)
    .order("published_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Erreur base de données." }, { status: 500 });
  }

  const sites = (data ?? []).map(s => ({
    slug:        s.slug,
    title:       s.title || s.slug,
    publishedAt: s.published_at,
    url:         `https://${s.slug}.webgen.app`,
  }));

  return NextResponse.json({ sites });
}
