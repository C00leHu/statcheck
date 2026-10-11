import { NextResponse } from "next/server";
import { productDb } from "@/lib/monitor/db";
import { performCheckAndStore, type MonitorRow } from "@/lib/monitor/monitors";

/**
 * Runs checks for every monitor that is due. Call this from a scheduler
 * (e.g. every minute). Protected by CRON_SECRET when configured.
 */
export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET;
  const url = new URL(req.url);
  const provided = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || url.searchParams.get("secret") || "";
  if (secret) {
    if (!provided || provided !== secret) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  } else if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "CRON_SECRET is not configured." }, { status: 503 });
  }

  const now = Date.now();
  const monitors = productDb().prepare("SELECT * FROM monitors").all() as unknown as (MonitorRow & { user_id: string })[];
  const due = monitors.filter((m) => {
    const last = productDb()
      .prepare("SELECT checked_at FROM checks WHERE monitor_id = ? ORDER BY checked_at DESC LIMIT 1")
      .get(m.id) as { checked_at: string } | undefined;
    if (!last) return true;
    return now - new Date(last.checked_at).getTime() >= m.interval_seconds * 1000;
  }).slice(0, 25);

  const results: { monitorId: string; ok: boolean }[] = [];
  for (const m of due) {
    try {
      const check = await performCheckAndStore(m);
      results.push({ monitorId: m.id, ok: check.ok });
    } catch {
      results.push({ monitorId: m.id, ok: false });
    }
  }
  return NextResponse.json({ checked: results.length, results });
}
