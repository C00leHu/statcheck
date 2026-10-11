import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { sendTest } from "@/lib/monitor/webhooks";
import { rateLimit } from "@/lib/auth/ratelimit";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const user = getSessionUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const limited = rateLimit(`webhooks-test:${user.id}`, 30, 60 * 60 * 1000);
  if (limited > 0) return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });

  const r = await sendTest(user.id, params.id);
  if (r.error && !r.statusCode) return NextResponse.json({ error: r.error }, { status: 404 });
  return NextResponse.json({ delivery: { ok: r.ok, statusCode: r.statusCode, error: r.error } });
}
