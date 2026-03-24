import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

const ALLOWED: Set<string> = new Set([
  "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml",
  "video/mp4", "video/webm", "video/quicktime",
  "audio/mpeg", "audio/ogg", "audio/wav", "audio/aac",
  "application/pdf",
]);

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;

    if (!file)              return NextResponse.json({ error: "Aucun fichier" }, { status: 400 });
    if (file.size > MAX_SIZE) return NextResponse.json({ error: "Fichier trop grand (max 10 MB)" }, { status: 400 });
    if (!ALLOWED.has(file.type)) return NextResponse.json({ error: "Type non supporté" }, { status: 400 });

    const ext  = path.extname(file.name).toLowerCase();
    const base = path.basename(file.name, ext)
      .replace(/[^a-z0-9]/gi, "-").toLowerCase().slice(0, 40);
    const filename = `${base}-${Date.now()}${ext}`;

    const dir = path.join(process.cwd(), "public", "uploads");
    if (!existsSync(dir)) await mkdir(dir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(dir, filename), buffer);

    return NextResponse.json({ url: `/uploads/${filename}`, filename, type: file.type, size: file.size });
  } catch (err) {
    console.error("upload error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
