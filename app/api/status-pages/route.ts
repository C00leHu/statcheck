import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { createStatusPage, isValidSlug, listStatusPages } from "@/lib/monitor/content";
import { getMonitor } from "@/lib/monitor/monitors";
import { rateLimit } from "@/lib/auth/ratelimit";

export async function GET() {
  const user = getSessionUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  return NextResponse.json({ pages: listStatusPages(user.id) });
}

export async function POST(req: Request) {
  const user = getSessionUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  let body: { name?: string; slug?: string; description?: string; monitorIds?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const limited = rateLimit(`pages:${user.id}`, 30, 60 * 60 * 1000);
  if (limited > 0) return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });

  const name = (body.name ?? "").trim();
  const slug = (body.slug ?? "").trim().toLowerCase();
  const description = (body.description ?? "").trim();
  const monitorIds = Array.isArray(body.monitorIds) ? body.monitorIds.filter((x): x is string => typeof x === "string") : [];

  if (name.length < 2 || name.length > 80) return NextResponse.json({ error: "Name must be 2–80 characters." }, { status: 400 });
  if (!isValidSlug(slug)) return NextResponse.json({ error: "URL slug must be 3–40 lowercase letters, numbers, or dashes." }, { status: 400 });
  if (description.length > 500) return NextResponse.json({ error: "Description must be under 500 characters." }, { status: 400 });
  if (monitorIds.length === 0) return NextResponse.json({ error: "Select at least one monitor to display." }, { status: 400 });
  for (const id of monitorIds) {
    if (!getMonitor(id, user.id)) return NextResponse.json({ error: "One of the selected monitors does not exist." }, { status: 400 });
  }

  const page = createStatusPage({ userId: user.id, name, slug, description, monitorIds });
  if (!page) return NextResponse.json({ error: "This URL is already taken. Try another." }, { status: 409 });
  return NextResponse.json({ page }, { status: 201 });
}
