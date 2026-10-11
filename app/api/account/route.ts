import { NextResponse } from "next/server";
import { getSessionUser, clearSessionCookie } from "@/lib/auth/session";
import { deleteUserAccount } from "@/lib/auth/store";

export async function DELETE() {
  const user = getSessionUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  deleteUserAccount(user.id);
  clearSessionCookie();
  return NextResponse.json({ ok: true });
}
