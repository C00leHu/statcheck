import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { createIncident, isIncidentStatus, listIncidents } from "@/lib/monitor/content";
import { getMonitor } from "@/lib/monitor/monitors";
import { rateLimit } from "@/lib/auth/ratelimit";

export async function GET() {
  const user = getSessionUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  return NextResponse.json({ incidents: listIncidents(user.id) });
}

export async function POST(req: Request) {
  const user = getSessionUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  let body: { title?: string; description?: string; status?: string; monitorIds?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const limited = rateLimit(`incidents:${user.id}`, 30, 60 * 60 * 1000);
  if (limited > 0) return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });

  const title = (body.title ?? "").trim();
  const description = (body.description ?? "").trim();
  const status = (body.status ?? "investigating").trim();
  const monitorIds = Array.isArray(body.monitorIds) ? body.monitorIds.filter((x): x is string => typeof x === "string") : [];

  if (title.length < 8 || title.length > 120) return NextResponse.json({ error: "Title must be 8–120 characters." }, { status: 400 });
  if (description.length < 20 || description.length > 2000) return NextResponse.json({ error: "Description must be 20–2000 characters." }, { status: 400 });
  if (!isIncidentStatus(status)) return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  for (const id of monitorIds) {
    if (!getMonitor(id, user.id)) return NextResponse.json({ error: "One of the selected services does not exist." }, { status: 400 });
  }

  const incident = createIncident({ userId: user.id, title, description, status, monitorIds });
  return NextResponse.json({ incident }, { status: 201 });
}
