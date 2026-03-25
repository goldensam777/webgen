import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getUserId } from "@/lib/auth";

const BUCKET = "assets";

export async function GET(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .list(userId, { sortBy: { column: "created_at", order: "desc" } });

  if (error) {
    return NextResponse.json({ files: [] });
  }

  const files = (data ?? [])
    .filter(f => f.name !== ".emptyFolderPlaceholder")
    .map(f => {
      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(`${userId}/${f.name}`);
      return {
        filename:   f.name,
        url:        publicUrl,
        size:       f.metadata?.size ?? 0,
        type:       f.metadata?.mimetype ?? "image/*",
        uploadedAt: f.created_at ?? "",
      };
    });

  return NextResponse.json({ files });
}
