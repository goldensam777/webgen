import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { slug } = await params;

  const { data, error } = await supabase
    .from("sites")
    .select("slug, title, config, published_at")
    .eq("slug", slug)
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Site introuvable" }, { status: 404 });
  }

  return NextResponse.json({
    slug:        data.slug,
    title:       data.title,
    config:      data.config,
    publishedAt: data.published_at,
  });
}
