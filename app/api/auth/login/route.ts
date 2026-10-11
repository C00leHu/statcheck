import { NextResponse } from "next/server";
import { verifyPassword } from "@/lib/auth/crypto";
import { findUserByEmail, normalizeEmail } from "@/lib/auth/store";
import { publicUser, setSessionCookie } from "@/lib/auth/session";
import { isValidEmail, rateLimit } from "@/lib/auth/ratelimit";

export async function POST(req: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const email = normalizeEmail(body.email ?? "");
  const password = body.password ?? "";
  if (!isValidEmail(email) || !password) {
    return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
  }

  const limited = rateLimit(`login:${email}`, 10, 10 * 60 * 1000);
  if (limited > 0) return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });

  const user = findUserByEmail(email);
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
  }

  setSessionCookie(user.id, user.sessionVersion);
  return NextResponse.json({ ok: true, user: publicUser(user) });
}
