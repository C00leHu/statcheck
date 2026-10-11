import { NextResponse } from "next/server";
import { generateRecoveryCodes, hashPassword } from "@/lib/auth/crypto";
import { consumeRecoveryCode, countUnusedRecoveryCodes, createUser, findUserByEmail, normalizeEmail, replaceRecoveryCodes, resetPassword } from "@/lib/auth/store";
import { publicUser, setSessionCookie } from "@/lib/auth/session";
import { isValidEmail, rateLimit } from "@/lib/auth/ratelimit";

export async function POST(req: Request) {
  let body: { name?: string; email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const name = (body.name ?? "").trim();
  const email = normalizeEmail(body.email ?? "");
  const password = body.password ?? "";

  if (name.length < 2) return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  if (!isValidEmail(email)) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  if (password.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });

  const limited = rateLimit(`register:${email}`, 10, 60 * 60 * 1000);
  if (limited > 0) return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });

  if (findUserByEmail(email)) {
    return NextResponse.json(
      { error: "An account with this email already exists. Sign in instead.", code: "ALREADY_REGISTERED" },
      { status: 409 }
    );
  }
  const user = createUser({ name, email, passwordHash: await hashPassword(password) });
  if (!user) {
    return NextResponse.json(
      { error: "An account with this email already exists. Sign in instead.", code: "ALREADY_REGISTERED" },
      { status: 409 }
    );
  }

  setSessionCookie(user.id, user.sessionVersion);
  // Recovery codes are shown once, right after signup. Only hashes are stored.
  const recoveryCodes = generateRecoveryCodes(8);
  replaceRecoveryCodes(user.id, recoveryCodes);
  return NextResponse.json({ ok: true, user: publicUser(user), recoveryCodes });
}
