import "server-only";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";
import { env } from "~/env";

const key = new TextEncoder().encode(env.JWT_SECRET as string);

export async function encrypt(payload: JWTPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key);
}

export async function decrypt(session: string | undefined = "") {
  try {
    const { payload } = await jwtVerify(session, key, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch {
    return null;
  }
}

export async function createSession(payload: { userId: string; email: string; name: string }) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const session = await encrypt(payload);
  const cookieStore = await cookies();

  cookieStore.set("session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function verifySession() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  const sessionPayload = await decrypt(session);

  if (!sessionPayload) {
    return null;
  }

  return sessionPayload as { userId: string; email: string; name: string };
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}
