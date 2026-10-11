import { NextResponse } from "next/server";
import { getSessionUser, publicUser } from "@/lib/auth/session";

export async function GET() {
  const user = getSessionUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  return NextResponse.json({ user: publicUser(user) });
}
