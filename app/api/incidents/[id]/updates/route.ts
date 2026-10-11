import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { addIncidentUpdate, isIncidentStatus } from "@/lib/monitor/content";
import { rateLimit } from "@/lib/auth/ratelimit";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = getSessionUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  let body: { status?: string; message?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const limited = rateLimit(`incident-updates:${user.id}`, 60, 60 * 60 * 1000);
  if (limited > 0) return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });

  const status = (body.status ?? "").trim();
  const message = (body.message ?? "").trim();
  if (!isIncidentStatus(status)) return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  if (message.length < 5 || message.length > 2000) return NextResponse.json({ error: "Update must be 5–2000 characters." }, { status: 400 });

  const incident = addIncidentUpdate(params.id, user.id, status, message);
  if (!incident) return NextResponse.json({ error: "Incident not found." }, { status: 404 });
  return NextResponse.json({ incident }, { status: 201 });
}
