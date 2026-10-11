import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { getMonitor, performCheckAndStore } from "@/lib/monitor/monitors";
import { rateLimit } from "@/lib/auth/ratelimit";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const user = getSessionUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const limited = rateLimit(`monitors-check:${user.id}`, 60, 60 * 60 * 1000);
  if (limited > 0) return NextResponse.json({ error: "Too many manual checks. Try again later." }, { status: 429 });

  const monitor = getMonitor(params.id, user.id);
  if (!monitor) return NextResponse.json({ error: "Monitor not found." }, { status: 404 });
  const check = await performCheckAndStore(monitor);
  return NextResponse.json({ check });
}
