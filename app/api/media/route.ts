import { NextResponse } from "next/server";
import { readdir, stat } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const EXT_MAP: Record<string, string> = {
  ".jpg": "image", ".jpeg": "image", ".png": "image",
  ".gif": "image", ".webp": "image", ".svg": "image",
  ".mp4": "video", ".webm": "video", ".mov": "video",
  ".mp3": "audio", ".ogg": "audio", ".wav": "audio", ".aac": "audio",
  ".pdf": "pdf",
};

export async function GET() {
  const dir = path.join(process.cwd(), "public", "uploads");
  if (!existsSync(dir)) return NextResponse.json({ files: [] });

  try {
    const names = (await readdir(dir)).filter(f => !f.startsWith("."));
    const files = await Promise.all(
      names.map(async (filename) => {
        const s = await stat(path.join(dir, filename));
        const ext = path.extname(filename).toLowerCase();
        return {
          filename,
          url:        `/uploads/${filename}`,
          type:       EXT_MAP[ext] ?? "other",
          size:       s.size,
          uploadedAt: s.mtime.toISOString(),
        };
      })
    );
    return NextResponse.json({
      files: files.sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt)),
    });
  } catch {
    return NextResponse.json({ files: [] });
  }
}
