import { SignJWT } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "webgen-dev-secret-change-in-prod"
);

export interface JwtUserPayload {
  id: string;
  email: string;
  name: string;
}

export async function signUserToken(user: JwtUserPayload): Promise<string> {
  return new SignJWT({ sub: user.id, email: user.email, name: user.name })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(JWT_SECRET);
}
