import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";

  // Sous-domaine webgen.app → /s/[slug]
  // ex: "dr-yevi.webgen.app" → rewrite vers /s/dr-yevi
  const match = host.match(/^([a-z0-9-]+)\.webgen\.app$/);
  if (match && match[1] !== "www") {
    const slug = match[1];
    const url  = request.nextUrl.clone();
    url.pathname = `/s/${slug}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/:path*",
};
