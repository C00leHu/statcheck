import { randomBytes } from "crypto";
import { productDb } from "./db";
import { newMonitorId, runCheck, type CheckResult, type MonitorRow, type MonitorStatus } from "./check";

export type { MonitorRow, MonitorStatus };

export interface MonitorStats {
  status: MonitorStatus;
  uptime90: number | null;
  uptime30: number | null;
  avgMs: number | null;
  lastCheckedAt: string | null;
  checkCount: number;
}

export interface MonitorWithStats extends MonitorRow {
  stats: MonitorStats;
}

export interface DayBucket {
  date: string;
  status: "operational" | "degraded" | "outage" | "unknown";
  uptime: number;
  avgMs: number;
}

export interface CheckRow {
  id: number;
  ok: boolean;
  statusCode: number | null;
  ms: number | null;
  error: string | null;
  checkedAt: string;
}

function rowToCheck(r: { id: number; ok: number; status_code: number | null; response_ms: number | null; error: string | null; checked_at: string }): CheckRow {
  return { id: r.id, ok: r.ok === 1, statusCode: r.status_code, ms: r.response_ms, error: r.error, checkedAt: r.checked_at };
}

export function createMonitor(input: {
  userId: string;
  name: string;
  type: string;
  target: string;
  intervalSeconds: number;
}): MonitorRow {
  const now = new Date().toISOString();
  const row: MonitorRow = {
    id: newMonitorId(),
    user_id: input.userId,
    name: input.name.trim().slice(0, 80),
    type: input.type,
    target: input.target.trim(),
    interval_seconds: input.intervalSeconds,
    timeout_seconds: 10,
    status: "unknown",
    created_at: now,
  };
  productDb()
    .prepare("INSERT INTO monitors (id, user_id, name, type, target, interval_seconds, timeout_seconds, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .run(row.id, row.user_id, row.name, row.type, row.target, row.interval_seconds, row.timeout_seconds, row.status, row.created_at);
  return row;
}

export function getMonitor(id: string, userId: string): MonitorRow | null {
  const row = productDb()
    .prepare("SELECT * FROM monitors WHERE id = ? AND user_id = ?")
    .get(id, userId) as MonitorRow | undefined;
  return row ?? null;
}

export function deleteMonitor(id: string, userId: string): boolean {
  const db = productDb();
  const res = db.prepare("DELETE FROM monitors WHERE id = ? AND user_id = ?").run(id, userId);
  db.prepare("DELETE FROM checks WHERE monitor_id = ?").run(id);
  return res.changes > 0;
}

function uptimeFor(monitorId: string, sinceIso: string): number | null {
  const rows = productDb()
    .prepare("SELECT ok FROM checks WHERE monitor_id = ? AND checked_at >= ?")
    .all(monitorId, sinceIso) as { ok: number }[];
  if (rows.length === 0) return null;
  const ok = rows.filter((r) => r.ok === 1).length;
  return Math.round((ok / rows.length) * 10000) / 100;
}

function avgFor(monitorId: string, sinceIso: string): number | null {
  const row = productDb()
    .prepare("SELECT AVG(response_ms) AS avg FROM checks WHERE monitor_id = ? AND checked_at >= ? AND response_ms IS NOT NULL")
    .get(monitorId, sinceIso) as { avg: number | null };
  return row.avg == null ? null : Math.round(row.avg);
}

function withStats(row: MonitorRow): MonitorWithStats {
  const now = Date.now();
  const last = productDb()
    .prepare("SELECT id, ok, status_code, response_ms, error, checked_at FROM checks WHERE monitor_id = ? ORDER BY checked_at DESC LIMIT 2")
    .all(row.id) as { id: number; ok: number; status_code: number | null; response_ms: number | null; error: string | null; checked_at: string }[];
  const count = (productDb().prepare("SELECT COUNT(*) AS c FROM checks WHERE monitor_id = ?").get(row.id) as { c: number }).c;
  let status: MonitorStatus = "unknown";
  let lastCheckedAt: string | null = null;
  if (last.length > 0) {
    lastCheckedAt = last[0].checked_at;
    if (last[0].ok === 1) status = "operational";
    else if (last.length > 1 && last[1].ok === 0) status = "outage";
    else status = "degraded";
  }
  return {
    ...row,
    status,
    stats: {
      status,
      uptime90: uptimeFor(row.id, new Date(now - 90 * 86400000).toISOString()),
      uptime30: uptimeFor(row.id, new Date(now - 30 * 86400000).toISOString()),
      avgMs: avgFor(row.id, new Date(now - 24 * 3600000).toISOString()),
      lastCheckedAt,
      checkCount: count,
    },
  };
}

export function listMonitors(userId: string): MonitorWithStats[] {
  const rows = productDb()
    .prepare("SELECT * FROM monitors WHERE user_id = ? ORDER BY created_at ASC")
    .all(userId) as unknown as MonitorRow[];
  return rows.map(withStats);
}

export function getMonitorWithStats(id: string, userId: string): MonitorWithStats | null {
  const row = getMonitor(id, userId);
  return row ? withStats(row) : null;
}

/** Run a live check, store it, prune history, and refresh the monitor status. */
export async function performCheckAndStore(monitor: MonitorRow): Promise<CheckRow> {
  const prevStatus = monitor.status;
  const result: CheckResult = await runCheck(monitor);
  const at = new Date().toISOString();
  const db = productDb();
  const res = db
    .prepare("INSERT INTO checks (monitor_id, ok, status_code, response_ms, error, checked_at) VALUES (?, ?, ?, ?, ?, ?)")
    .run(monitor.id, result.ok ? 1 : 0, result.statusCode, result.ms, result.error, at);
  db.prepare("DELETE FROM checks WHERE monitor_id = ? AND id NOT IN (SELECT id FROM checks WHERE monitor_id = ? ORDER BY checked_at DESC LIMIT 1000)").run(monitor.id, monitor.id);
  const stats = withStats({ ...monitor });
  db.prepare("UPDATE monitors SET status = ? WHERE id = ?").run(stats.status, monitor.id);
  const saved = db.prepare("SELECT id, ok, status_code, response_ms, error, checked_at FROM checks WHERE id = ?").get(res.lastInsertRowid) as {
    id: number; ok: number; status_code: number | null; response_ms: number | null; error: string | null; checked_at: string;
  };
  const check = rowToCheck(saved);
  // Alert on transitions only: confirmed outage, or recovery back to operational.
  if (stats.status !== prevStatus) {
    const { fireEvent } = await import("./webhooks");
    const data = {
      monitor: { id: monitor.id, name: monitor.name, type: monitor.type, target: monitor.target },
      check: { ok: check.ok, statusCode: check.statusCode, ms: check.ms, error: check.error },
    };
    if (stats.status === "outage") {
      await fireEvent(monitor.user_id, "monitor.down", data);
    } else if (stats.status === "operational" && (prevStatus === "outage" || prevStatus === "degraded")) {
      await fireEvent(monitor.user_id, "monitor.recovered", data);
    }
  }
  return check;
}

export function getRecentChecks(monitorId: string, limit = 50): CheckRow[] {
  const rows = productDb()
    .prepare("SELECT id, ok, status_code, response_ms, error, checked_at FROM checks WHERE monitor_id = ? ORDER BY checked_at DESC LIMIT ?")
    .all(monitorId, limit) as { id: number; ok: number; status_code: number | null; response_ms: number | null; error: string | null; checked_at: string }[];
  return rows.map(rowToCheck);
}

export function getRecentChecksForUser(userId: string, limit = 10): (CheckRow & { monitorName: string; monitorId: string })[] {
  const rows = productDb()
    .prepare(
      `SELECT c.id, c.ok, c.status_code, c.response_ms, c.error, c.checked_at, m.name AS monitor_name, m.id AS monitor_id
       FROM checks c JOIN monitors m ON m.id = c.monitor_id
       WHERE m.user_id = ? ORDER BY c.checked_at DESC LIMIT ?`
    )
    .all(userId, limit) as { id: number; ok: number; status_code: number | null; response_ms: number | null; error: string | null; checked_at: string; monitor_name: string; monitor_id: string }[];
  return rows.map((r) => ({ ...rowToCheck(r), monitorName: r.monitor_name, monitorId: r.monitor_id }));
}

/** Bucket checks into per-day status for uptime bars. Days without checks are "unknown". */
export function getDailyBuckets(monitorId: string, days = 90): DayBucket[] {
  const since = new Date(Date.now() - (days - 1) * 86400000);
  since.setUTCHours(0, 0, 0, 0);
  const rows = productDb()
    .prepare("SELECT ok, response_ms, checked_at FROM checks WHERE monitor_id = ? AND checked_at >= ?")
    .all(monitorId, since.toISOString()) as { ok: number; response_ms: number | null; checked_at: string }[];
  const byDay = new Map<string, { ok: number; total: number; ms: number[] }>();
  for (const r of rows) {
    const day = r.checked_at.slice(0, 10);
    const e = byDay.get(day) ?? { ok: 0, total: 0, ms: [] };
    e.total += 1;
    if (r.ok === 1) e.ok += 1;
    if (r.response_ms != null) e.ms.push(r.response_ms);
    byDay.set(day, e);
  }
  const out: DayBucket[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const key = d.toISOString().slice(0, 10);
    const e = byDay.get(key);
    if (!e) {
      out.push({ date: key, status: "unknown", uptime: 0, avgMs: 0 });
      continue;
    }
    const uptime = Math.round((e.ok / e.total) * 10000) / 100;
    const status = uptime === 100 ? "operational" : uptime >= 95 ? "degraded" : "outage";
    const avgMs = e.ms.length ? Math.round(e.ms.reduce((a, b) => a + b, 0) / e.ms.length) : 0;
    out.push({ date: key, status, uptime, avgMs });
  }
  return out;
}

export function newIncidentId(prefix: string): string {
  return `${prefix}_${randomBytes(6).toString("hex")}`;
}

export function countMonitors(userId: string): number {
  return (productDb().prepare("SELECT COUNT(*) AS c FROM monitors WHERE user_id = ?").get(userId) as { c: number }).c;
}
