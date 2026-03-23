import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { randomUUID } from "crypto";

const USERS_FILE = path.join(process.cwd(), "data", "users.json");
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "webgen-dev-secret-change-in-prod"
);

interface StoredUser {
  id:           string;
  email:        string;
  name:         string;
  passwordHash: string;
}

async function readUsers(): Promise<StoredUser[]> {
  try {
    const raw = await readFile(USERS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeUsers(users: StoredUser[]): Promise<void> {
  await writeFile(USERS_FILE, JSON.stringify(users, null, 2));
}

export async function POST(req: NextRequest) {
  const { email, password, name } = await req.json();

  if (!email?.trim() || !password || !name?.trim()) {
    return NextResponse.json({ error: "Tous les champs sont requis." }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ error: "Mot de passe : 6 caractères minimum." }, { status: 400 });
  }

  const users = await readUsers();

  if (users.find(u => u.email === email.toLowerCase())) {
    return NextResponse.json({ error: "Un compte existe déjà avec cet e-mail." }, { status: 409 });
  }

  const id           = randomUUID();
  const passwordHash = await bcrypt.hash(password, 10);
  const user: StoredUser = { id, email: email.toLowerCase(), name: name.trim(), passwordHash };

  await writeUsers([...users, user]);

  const token = await new SignJWT({ sub: id, email: user.email, name: user.name })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(JWT_SECRET);

  return NextResponse.json({ user: { id, email: user.email, name: user.name }, token });
}
