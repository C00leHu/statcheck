import { cookies } from "next/headers";
import { signSessionToken, verifySessionToken } from "./crypto";
import { getUserById, type User } from "./store";

export const SESSION_COOKIE = "sc_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export function setSessionCookie(userId: string, version = 0): void {
  const token = signSessionToken(userId, SESSION_MAX_AGE, version);
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export function clearSessionCookie(): void {
  cookies().delete(SESSION_COOKIE);
}

export function getSessionUser(): User | null {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = verifySessionToken(token);
  if (!session) return null;
  const user = getUserById(session.userId);
  // Password resets bump sessionVersion, killing all older sessions.
  if (!user || user.sessionVersion !== session.version) return null;
  return user;
}

export function publicUser(user: User): { id: string; name: string; email: string } {
  return { id: user.id, name: user.name, email: user.email };
}
