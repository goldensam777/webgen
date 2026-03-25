import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getUserId } from "@/lib/auth";
import path from "path";

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

const ALLOWED = new Set([
  "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml",
  "video/mp4", "video/webm", "video/quicktime",
]);

const BUCKET = "assets";

async function ensureBucket() {
  const { error } = await supabase.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: MAX_SIZE,
    allowedMimeTypes: [...ALLOWED],
  });
  // Ignorer si le bucket existe déjà
  if (error && !error.message.includes("already exists")) throw error;
}

export async function POST(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const file = form.get("file") as File | null;
  if (!file)               return NextResponse.json({ error: "Aucun fichier." }, { status: 400 });
  if (file.size > MAX_SIZE) return NextResponse.json({ error: "Fichier trop grand (max 10 Mo)." }, { status: 400 });
  if (!ALLOWED.has(file.type)) return NextResponse.json({ error: "Type non supporté." }, { status: 415 });

  await ensureBucket();

  const ext      = path.extname(file.name).toLowerCase();
  const base     = path.basename(file.name, ext).replace(/[^a-z0-9]/gi, "-").toLowerCase().slice(0, 40);
  const filename = `${userId}/${base}-${Date.now()}${ext}`;
  const buffer   = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filename, buffer, { contentType: file.type, upsert: false });

  if (error) {
    return NextResponse.json({ error: "Erreur lors de l'upload." }, { status: 500 });
  }

  const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(filename);

  return NextResponse.json({ url: publicUrl, filename, type: file.type, size: file.size });
}
