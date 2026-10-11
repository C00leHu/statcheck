import { randomBytes } from "crypto";
import { Socket } from "net";

export type MonitorType = "https" | "http" | "tcp";
export type MonitorStatus = "operational" | "degraded" | "outage" | "unknown";

export interface MonitorRow {
  id: string;
  user_id: string;
  name: string;
  type: string;
  target: string;
  interval_seconds: number;
  timeout_seconds: number;
  status: MonitorStatus;
  created_at: string;
}

export interface CheckResult {
  ok: boolean;
  statusCode: number | null;
  ms: number | null;
  error: string | null;
}

export function newMonitorId(): string {
  return `mon_${randomBytes(8).toString("hex")}`;
}

/** Validate + normalize a monitor target. Returns an error message or null. */
export function validateTarget(type: string, target: string): string | null {
  const t = target.trim();
  if (!t) return "Enter a target to monitor.";
  if (type === "https" || type === "http") {
    let url: URL;
    try {
      url = new URL(t.includes("://") ? t : `${type}://${t}`);
    } catch {
      return "Enter a valid URL, e.g. https://example.com/health.";
    }
    if (url.protocol !== "http:" && url.protocol !== "https:") return "URL must start with http:// or https://.";
    if (!url.hostname) return "Enter a valid URL, e.g. https://example.com/health.";
    return null;
  }
  if (type === "tcp") {
    const m = t.match(/^(?:tcp:\/\/)?([^:/\s]+):(\d{1,5})$/);
    if (!m) return "Enter host and port, e.g. play.example.com:25565.";
    const port = Number(m[2]);
    if (port < 1 || port > 65535) return "Port must be between 1 and 65535.";
    return null;
  }
  return "Unknown monitor type.";
}

export function normalizeTarget(type: string, target: string): string {
  const t = target.trim();
  if (type === "tcp") return t.replace(/^tcp:\/\//, "");
  if (t.includes("://")) return t;
  return `${type}://${t}`;
}

async function checkHttp(url: string, timeoutMs: number): Promise<CheckResult> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  const start = Date.now();
  try {
    const res = await fetch(url, { signal: ctrl.signal, redirect: "follow" });
    // Drain minimal body so timing reflects a real response without downloading everything.
    await res.arrayBuffer().catch(() => {});
    const ms = Date.now() - start;
    return { ok: res.status >= 200 && res.status < 400, statusCode: res.status, ms, error: null };
  } catch (err) {
    const ms = Date.now() - start;
    const msg = err instanceof Error ? err.name === "AbortError" ? "Request timed out" : err.message : "Request failed";
    return { ok: false, statusCode: null, ms, error: msg.slice(0, 200) };
  } finally {
    clearTimeout(timer);
  }
}

function checkTcp(hostport: string, timeoutMs: number): Promise<CheckResult> {
  const [host, portStr] = hostport.split(":");
  const port = Number(portStr);
  const start = Date.now();
  return new Promise((resolve) => {
    const socket = new Socket();
    let done = false;
    const finish = (r: CheckResult) => {
      if (done) return;
      done = true;
      socket.destroy();
      resolve(r);
    };
    socket.setTimeout(timeoutMs);
    socket.on("connect", () => finish({ ok: true, statusCode: null, ms: Date.now() - start, error: null }));
    socket.on("timeout", () => finish({ ok: false, statusCode: null, ms: Date.now() - start, error: "Connection timed out" }));
    socket.on("error", (e) => finish({ ok: false, statusCode: null, ms: Date.now() - start, error: (e.message || "Connection failed").slice(0, 200) }));
    socket.connect(port, host);
  });
}

/** Perform one live check against the monitor target. */
export async function runCheck(monitor: { type: string; target: string; timeout_seconds: number }): Promise<CheckResult> {
  const timeoutMs = Math.min(30000, Math.max(3000, (monitor.timeout_seconds || 10) * 1000));
  if (monitor.type === "tcp") return checkTcp(monitor.target, timeoutMs);
  return checkHttp(monitor.target, timeoutMs);
}
