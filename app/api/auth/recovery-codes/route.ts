import { NextResponse } from "next/server";
import { generateRecoveryCodes } from "@/lib/auth/crypto";
import { countUnusedRecoveryCodes, replaceRecoveryCodes } from "@/lib/auth/store";
import { getSessionUser } from "@/lib/auth/session";

/** Authenticated: how many unused codes remain. Plaintext codes are never returned. */
export async function GET() {
  const user = getSessionUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  return NextResponse.json({ remaining: countUnusedRecoveryCodes(user.id) });
}

/** Authenticated: burn all existing codes and issue a fresh set (returned once). */
export async function POST() {
  const user = getSessionUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const codes = generateRecoveryCodes(8);
  replaceRecoveryCodes(user.id, codes);
  return NextResponse.json({ recoveryCodes: codes, remaining: codes.length });
}
