import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, readFile } from "fs/promises";
import path from "path";

const SITES_DIR = path.join(process.cwd(), "data", "sites");

export async function POST(req: NextRequest) {
  const { slug, config } = await req.json();

  if (!slug || !config) {
    return NextResponse.json({ error: "slug et config requis" }, { status: 400 });
  }

  // Validation du slug : lettres, chiffres, tirets uniquement
  if (!/^[a-z0-9-]{2,40}$/.test(slug)) {
    return NextResponse.json(
      { error: "Slug invalide (2-40 caractères : lettres minuscules, chiffres, tirets)" },
      { status: 400 }
    );
  }

  await mkdir(SITES_DIR, { recursive: true });

  // Vérifier si le slug est déjà pris
  try {
    await readFile(path.join(SITES_DIR, `${slug}.json`));
    return NextResponse.json({ error: "Ce nom est déjà pris" }, { status: 409 });
  } catch {
    // Slug disponible — on continue
  }

  await writeFile(
    path.join(SITES_DIR, `${slug}.json`),
    JSON.stringify({ config, publishedAt: new Date().toISOString() }, null, 2)
  );

  return NextResponse.json({ url: `https://${slug}.webgen.app` });
}
