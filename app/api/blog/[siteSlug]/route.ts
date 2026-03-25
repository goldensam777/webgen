import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

type Params = { params: Promise<{ siteSlug: string }> };

/* ── GET /api/blog/[siteSlug] — liste des articles ── */
/* ?all=1 pour inclure les brouillons (dashboard manage)   */
export async function GET(req: NextRequest, { params }: Params) {
  const { siteSlug } = await params;
  const all = req.nextUrl.searchParams.get("all") === "1";

  let query = supabase
    .from("posts")
    .select("id, slug, title, excerpt, cover_url, published, published_at, updated_at")
    .eq("site_slug", siteSlug)
    .order("published_at", { ascending: false, nullsFirst: true });

  if (!all) query = query.eq("published", true);

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ posts: data });
}

/* ── POST /api/blog/[siteSlug] — créer un article ── */
export async function POST(req: NextRequest, { params }: Params) {
  const { siteSlug } = await params;
  const body = await req.json() as {
    slug: string;
    title: string;
    excerpt?: string;
    content: string;
    cover_url?: string;
    published?: boolean;
  };

  const { slug, title, excerpt, content, cover_url, published = false } = body;

  if (!slug || !title || !content) {
    return NextResponse.json({ error: "slug, title et content sont requis" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("posts")
    .insert({
      site_slug:    siteSlug,
      slug,
      title,
      excerpt:      excerpt ?? null,
      content,
      cover_url:    cover_url ?? null,
      published,
      published_at: published ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ post: data }, { status: 201 });
}
