import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

type Params = { params: Promise<{ siteSlug: string; postSlug: string }> };

/* ── GET /api/blog/[siteSlug]/[postSlug] ── */
export async function GET(_req: NextRequest, { params }: Params) {
  const { siteSlug, postSlug } = await params;

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("site_slug", siteSlug)
    .eq("slug", postSlug)
    .single();

  if (error || !data) return NextResponse.json({ error: "Article introuvable" }, { status: 404 });
  return NextResponse.json({ post: data });
}

/* ── PUT /api/blog/[siteSlug]/[postSlug] — mise à jour ── */
export async function PUT(req: NextRequest, { params }: Params) {
  const { siteSlug, postSlug } = await params;
  const body = await req.json() as {
    title?: string;
    excerpt?: string;
    content?: string;
    cover_url?: string;
    published?: boolean;
  };

  // Si on publie pour la première fois, on fixe la date
  const extra: Record<string, unknown> = {};
  if (body.published === true) {
    const { data: existing } = await supabase
      .from("posts")
      .select("published, published_at")
      .eq("site_slug", siteSlug)
      .eq("slug", postSlug)
      .single();
    if (existing && !existing.published) {
      extra.published_at = new Date().toISOString();
    }
  }

  const { data, error } = await supabase
    .from("posts")
    .update({ ...body, ...extra, updated_at: new Date().toISOString() })
    .eq("site_slug", siteSlug)
    .eq("slug", postSlug)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ post: data });
}

/* ── DELETE /api/blog/[siteSlug]/[postSlug] ── */
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { siteSlug, postSlug } = await params;

  const { error } = await supabase
    .from("posts")
    .delete()
    .eq("site_slug", siteSlug)
    .eq("slug", postSlug);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
