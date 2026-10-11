import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { normalizeTarget, validateTarget } from "@/lib/monitor/check";
import { createMonitor, listMonitors } from "@/lib/monitor/monitors";
import { setOnboardingDone } from "@/lib/monitor/content";
import { rateLimit } from "@/lib/auth/ratelimit";

const VALID_TYPES = ["https", "http", "tcp"];
const VALID_INTERVALS = [60, 300, 900];

export async function GET() {
  const user = getSessionUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  return NextResponse.json({ monitors: listMonitors(user.id) });
}

export async function POST(req: Request) {
  const user = getSessionUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  let body: { name?: string; type?: string; target?: string; intervalSeconds?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const limited = rateLimit(`monitors-create:${user.id}`, 30, 60 * 60 * 1000);
  if (limited > 0) return NextResponse.json({ error: "Too many monitors created. Try again later." }, { status: 429 });

  const name = (body.name ?? "").trim();
  const type = (body.type ?? "").trim().toLowerCase();
  const target = (body.target ?? "").trim();
  const interval = Number(body.intervalSeconds ?? 300);

  if (name.length < 2 || name.length > 80) return NextResponse.json({ error: "Name must be 2–80 characters." }, { status: 400 });
  if (!VALID_TYPES.includes(type)) return NextResponse.json({ error: "Type must be HTTPS, HTTP, or TCP." }, { status: 400 });
  const targetError = validateTarget(type, target);
  if (targetError) return NextResponse.json({ error: targetError }, { status: 400 });
  if (!VALID_INTERVALS.includes(interval)) return NextResponse.json({ error: "Invalid check interval." }, { status: 400 });

  const monitor = createMonitor({ userId: user.id, name, type, target: normalizeTarget(type, target), intervalSeconds: interval });
  setOnboardingDone(user.id);
  return NextResponse.json({ monitor }, { status: 201 });
}
