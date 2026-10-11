import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth/crypto";
import { consumeRecoveryCode, findUserByEmail, normalizeEmail, resetPassword } from "@/lib/auth/store";
import { isValidEmail, rateLimit } from "@/lib/auth/ratelimit";

/**
 * Password reset with a recovery code. No session required.
 * Heavily rate-limited: codes are single-use and high-entropy.
 */
export async function POST(req: Request) {
  let body: { email?: string; code?: string; newPassword?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const email = normalizeEmail(body.email ?? "");
  const code = (body.code ?? "").trim();
  const newPassword = body.newPassword ?? "";

  if (!isValidEmail(email) || !code) {
    return NextResponse.json({ error: "Enter your email and recovery code." }, { status: 400 });
  }
  if (newPassword.length < 8) {
    return NextResponse.json({ error: "New password must be at least 8 characters." }, { status: 400 });
  }

  const limited = rateLimit(`reset:${email}`, 5, 15 * 60 * 1000);
  if (limited > 0) return NextResponse.json({ error: "Too many attempts. Try again in a few minutes." }, { status: 429 });

  const user = findUserByEmail(email);
  if (!user || !consumeRecoveryCode(user.id, code)) {
    return NextResponse.json({ error: "Invalid email or recovery code." }, { status: 400 });
  }

  resetPassword(user.id, await hashPassword(newPassword));
  return NextResponse.json({ ok: true });
}
