import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { deleteMonitor, getDailyBuckets, getMonitorWithStats, getRecentChecks } from "@/lib/monitor/monitors";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const user = getSessionUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const monitor = getMonitorWithStats(params.id, user.id);
  if (!monitor) return NextResponse.json({ error: "Monitor not found." }, { status: 404 });
  return NextResponse.json({
    monitor,
    checks: getRecentChecks(params.id, 50),
    daily: getDailyBuckets(params.id, 90),
  });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = getSessionUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const ok = deleteMonitor(params.id, user.id);
  if (!ok) return NextResponse.json({ error: "Monitor not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
