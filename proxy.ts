import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "webgen-dev-secret-change-in-prod"
);

const PROTECTED = ["/create", "/dashboard", "/manage"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  /* ── Sous-domaine webgen.app → /s/[slug] ── */
  const host  = request.headers.get("host") ?? "";
  const match = host.match(/^([a-z0-9-]+)\.webgen\.app$/);
  if (match && match[1] !== "www") {
    if (!pathname.startsWith("/s/")) {
      const url    = request.nextUrl.clone();
      url.pathname = pathname === "/" ? `/s/${match[1]}` : `/s/${match[1]}${pathname}`;
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  /* ── Protection des routes authentifiées ── */
  if (PROTECTED.some(p => pathname.startsWith(p))) {
    const token = request.cookies.get("webgen-token")?.value;
    const authUrl = new URL("/auth", request.url);
    authUrl.searchParams.set("redirect", pathname);

    if (!token) return NextResponse.redirect(authUrl);

    try {
      await jwtVerify(token, JWT_SECRET);
    } catch {
      const res = NextResponse.redirect(authUrl);
      res.cookies.set("webgen-token", "", { maxAge: 0, path: "/" });
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};