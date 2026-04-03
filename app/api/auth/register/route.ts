import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabase";
import { signUserToken } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  const { email, password, name } = await req.json();

  if (!email?.trim() || !password || !name?.trim()) {
    return NextResponse.json({ error: "Tous les champs sont requis." }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Mot de passe : 6 caractères minimum." }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("email", email.toLowerCase())
    .single();

  if (existing) {
    return NextResponse.json({ error: "Un compte existe déjà avec cet e-mail." }, { status: 409 });
  }

  const password_hash = await bcrypt.hash(password, 10);

  const { data: user, error } = await supabase
    .from("users")
    .insert({ email: email.toLowerCase(), name: name.trim(), password_hash })
    .select("id, email, name")
    .single();

  if (error || !user) {
    return NextResponse.json({ error: "Erreur lors de la création du compte." }, { status: 500 });
  }

  const token = await signUserToken({ id: user.id, email: user.email, name: user.name });

  const res = NextResponse.json({ user: { id: user.id, email: user.email, name: user.name }, token });
  res.cookies.set("webgenx-token", token, {
    httpOnly: true,
    sameSite: "lax",
    path:     "/",
    maxAge:   30 * 24 * 60 * 60,
    secure:   process.env.NODE_ENV === "production",
  });
  return res;
}
