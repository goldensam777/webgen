import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { supabase } from "@/lib/supabase";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "webgen-dev-secret-change-in-prod"
);

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email?.trim() || !password) {
    return NextResponse.json({ error: "E-mail et mot de passe requis." }, { status: 400 });
  }

  const { data: user } = await supabase
    .from("users")
    .select("id, email, name, password_hash")
    .eq("email", email.toLowerCase())
    .single();

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return NextResponse.json({ error: "E-mail ou mot de passe incorrect." }, { status: 401 });
  }

  const token = await new SignJWT({ sub: user.id, email: user.email, name: user.name })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(JWT_SECRET);

  const res = NextResponse.json({
    user:  { id: user.id, email: user.email, name: user.name },
    token,
  });
  res.cookies.set("webgen-token", token, {
    httpOnly: true,
    sameSite: "lax",
    path:     "/",
    maxAge:   30 * 24 * 60 * 60,
    secure:   process.env.NODE_ENV === "production",
  });
  return res;
}
