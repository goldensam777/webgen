import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "webgen-dev-secret-change-in-prod"
);

/** Lit le JWT depuis le cookie httpOnly ou le header Authorization Bearer */
export async function getUserId(req: NextRequest): Promise<string | null> {
  const fromCookie = req.cookies.get("webgenx-token")?.value ?? null;
  const fromHeader = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/, "") || null;
  const token = fromCookie ?? fromHeader;

  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return (payload.sub as string) ?? null;
  } catch {
    return null;
  }
}
