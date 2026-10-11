import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { createWebhook, listWebhooks } from "@/lib/monitor/webhooks";
import { rateLimit } from "@/lib/auth/ratelimit";

export async function GET() {
  const user = getSessionUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  return NextResponse.json({ endpoints: listWebhooks(user.id) });
}

export async function POST(req: Request) {
  const user = getSessionUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  let body: { name?: string; url?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const limited = rateLimit(`webhooks:${user.id}`, 30, 60 * 60 * 1000);
  if (limited > 0) return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });

  const created = createWebhook(user.id, body.name ?? "", body.url ?? "");
  if (!created.endpoint) return NextResponse.json({ error: created.error ?? "Couldn't add the webhook." }, { status: 400 });
  const endpoints = listWebhooks(user.id);
  return NextResponse.json({ endpoint: endpoints.find((e) => e.id === created.endpoint!.id) }, { status: 201 });
}
