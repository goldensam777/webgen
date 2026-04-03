import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabase";
import { signUserToken } from "@/lib/jwt";

function fallbackNameFromEmail(email: string): string {
  return email.split("@")[0] || "Utilisateur";
}

export async function POST(req: NextRequest) {
  const { accessToken } = await req.json();
  if (!accessToken || typeof accessToken !== "string") {
    return NextResponse.json({ error: "Token Google invalide." }, { status: 400 });
  }

  const { data: authData, error: authError } = await supabase.auth.getUser(accessToken);
  if (authError || !authData.user) {
    return NextResponse.json({ error: "Session Google invalide ou expirée." }, { status: 401 });
  }

  const oauthUser = authData.user;
  const email = oauthUser.email?.toLowerCase();
  if (!email) {
    return NextResponse.json({ error: "Aucun e-mail trouvé pour ce compte Google." }, { status: 400 });
  }

  const displayName =
    oauthUser.user_metadata?.full_name ||
    oauthUser.user_metadata?.name ||
    fallbackNameFromEmail(email);

  const { data: existingUser } = await supabase
    .from("users")
    .select("id, email, name")
    .eq("email", email)
    .single();

  let appUser = existingUser;

  if (!appUser) {
    // Ensure compatibility if password_hash is required by DB schema.
    const password_hash = await bcrypt.hash(crypto.randomUUID(), 10);
    const { data: inserted, error: insertError } = await supabase
      .from("users")
      .insert({ email, name: String(displayName).trim(), password_hash })
      .select("id, email, name")
      .single();

    if (insertError || !inserted) {
      return NextResponse.json({ error: "Impossible de créer le compte Google." }, { status: 500 });
    }
    appUser = inserted;
  }

  const token = await signUserToken({
    id: appUser.id,
    email: appUser.email,
    name: appUser.name,
  });

  const res = NextResponse.json({
    user: { id: appUser.id, email: appUser.email, name: appUser.name },
    token,
  });
  res.cookies.set("webgenx-token", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
