import { NextRequest, NextResponse } from "next/server";
import { readdir, readFile } from "fs/promises";
import path from "path";
import { jwtVerify } from "jose";

const SITES_DIR  = path.join(process.cwd(), "data", "sites");
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "webgen-dev-secret-change-in-prod"
);

export async function GET(req: NextRequest) {
  // Verify token
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

  // Read all site files and filter by userId
  let files: string[] = [];
  try {
    files = await readdir(SITES_DIR);
  } catch {
    return NextResponse.json({ sites: [] });
  }

  const sites = (
    await Promise.all(
      files
        .filter(f => f.endsWith(".json"))
        .map(async f => {
          try {
            const raw  = await readFile(path.join(SITES_DIR, f), "utf-8");
            const data = JSON.parse(raw);
            // Only return sites belonging to this user
            if (data.userId !== userId) return null;
            const slug  = f.replace(".json", "");
            const title = (data.config?.data?.navbar?.logo as string)
                       || (data.config?.data?.hero?.title as string)
                       || slug;
            return {
              slug,
              publishedAt: data.publishedAt,
              title,
              url: `https://${slug}.webgen.app`,
            };
          } catch {
            return null;
          }
        })
    )
  ).filter(Boolean);

  // Sort newest first
  sites.sort((a, b) =>
    new Date(b!.publishedAt).getTime() - new Date(a!.publishedAt).getTime()
  );

  return NextResponse.json({ sites });
}
