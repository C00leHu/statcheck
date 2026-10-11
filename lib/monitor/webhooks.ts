import { randomBytes } from "crypto";
import { productDb } from "./db";

export type WebhookEvent = "monitor.down" | "monitor.recovered" | "incident.created" | "incident.updated" | "test";

export interface WebhookEndpoint {
  id: string;
  name: string;
  urlMasked: string;
  createdAt: string;
  lastDelivery: { event: WebhookEvent; ok: boolean; at: string } | null;
}

export interface DeliveryResult {
  ok: boolean;
  statusCode: number | null;
  error: string | null;
}

const FETCH_TIMEOUT_MS = 5000;
const MAX_ENDPOINTS_PER_USER = 10;

function newWebhookId(): string {
  return `wh_${randomBytes(8).toString("hex")}`;
}

/** Mask a webhook URL: host stays visible, secret path is hidden. */
export function maskUrl(url: string): string {
  try {
    const u = new URL(url);
    const tail = u.pathname.length > 5 ? u.pathname.slice(-4) : "····";
    return `${u.protocol}//${u.host}/…${tail}`;
  } catch {
    return "invalid-url";
  }
}

function isBlockedHost(host: string): boolean {
  const h = host.toLowerCase();
  if (h === "localhost" || h === "metadata.google.internal") return true;
  if (h.endsWith(".local") || h.endsWith(".internal") || h.endsWith(".localhost")) return true;
  if (/^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|0\.0\.0\.0|::1|169\.254\.)/.test(h)) return true;
  return false;
}

/**
 * Validate a webhook target. In production, private/loopback/link-local hosts
 * are rejected (SSRF guard). Localhost is allowed in development for testing.
 */
export function validateWebhookUrl(url: string): string | null {
  let u: URL;
  try {
    u = new URL(url.trim());
  } catch {
    return "Enter a valid http(s) URL.";
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") return "URL must start with http:// or https://.";
  if (url.length > 2000) return "URL is too long.";
  if (process.env.NODE_ENV === "production" && isBlockedHost(u.hostname)) {
    return "Internal, private, and loopback addresses are not allowed.";
  }
  return null;
}

type Provider = "discord" | "slack" | "generic";

function detectProvider(url: string): Provider {
  if (url.includes("discord.com/api/webhooks")) return "discord";
  if (url.includes("hooks.slack.com")) return "slack";
  return "generic";
}

export interface EventData {
  monitor?: { id: string; name: string; type: string; target: string };
  check?: { ok: boolean; statusCode: number | null; ms: number | null; error: string | null };
  incident?: { id: string; title: string; status: string };
  message?: string;
}

function buildBody(provider: Provider, event: WebhookEvent, d: EventData): unknown {
  const titles: Record<WebhookEvent, string> = {
    "monitor.down": `Outage: ${d.monitor?.name ?? "monitor"}`,
    "monitor.recovered": `Recovered: ${d.monitor?.name ?? "monitor"}`,
    "incident.created": `Incident opened: ${d.incident?.title ?? ""}`,
    "incident.updated": `Incident update: ${d.incident?.title ?? ""}`,
    test: "StatCheck test event",
  };
  const lines: Record<WebhookEvent, string> = {
    "monitor.down": `${d.monitor?.name} (${d.monitor?.target}) failed checks.${d.check?.error ? ` Error: ${d.check.error}` : ""}`,
    "monitor.recovered": `${d.monitor?.name} (${d.monitor?.target}) is reachable again${d.check?.ms != null ? ` · ${d.check.ms} ms` : ""}.`,
    "incident.created": `${d.incident?.title} — status: ${d.incident?.status}`,
    "incident.updated": `${d.incident?.title} — now ${d.incident?.status}${d.message ? `: ${d.message}` : ""}`,
    test: d.message ?? "If you see this, StatCheck webhooks work.",
  };
  if (provider === "discord") {
    const colors: Record<WebhookEvent, number> = {
      "monitor.down": 15548997,
      "monitor.recovered": 5763719,
      "incident.created": 15105570,
      "incident.updated": 15105570,
      test: 5793266,
    };
    return {
      embeds: [{
        title: titles[event],
        description: lines[event],
        color: colors[event],
        timestamp: new Date().toISOString(),
      }],
    };
  }
  if (provider === "slack") {
    return { text: `*${titles[event]}*\n${lines[event]}` };
  }
  return { event, at: new Date().toISOString(), ...d };
}

async function postJson(url: string, body: unknown): Promise<DeliveryResult> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "User-Agent": "StatCheck/1.0 (+webhooks)" },
      body: JSON.stringify(body),
      signal: ctrl.signal,
      redirect: "manual",
    });
    // Drain without keeping: we only care about the status.
    await res.arrayBuffer().catch(() => {});
    const ok = res.status >= 200 && res.status < 300;
    return { ok, statusCode: res.status, error: ok ? null : `HTTP ${res.status}` };
  } catch (err) {
    const msg = err instanceof Error ? (err.name === "AbortError" ? "Request timed out" : err.message) : "Request failed";
    return { ok: false, statusCode: null, error: msg.slice(0, 200) };
  } finally {
    clearTimeout(timer);
  }
}

function logDelivery(endpointId: string, event: WebhookEvent, r: DeliveryResult): void {
  const db = productDb();
  db.prepare("INSERT INTO webhook_deliveries (endpoint_id, event, ok, status_code, error, created_at) VALUES (?, ?, ?, ?, ?, ?)")
    .run(endpointId, event, r.ok ? 1 : 0, r.statusCode, r.error, new Date().toISOString());
  db.prepare("DELETE FROM webhook_deliveries WHERE endpoint_id = ? AND id NOT IN (SELECT id FROM webhook_deliveries WHERE endpoint_id = ? ORDER BY created_at DESC LIMIT 100)")
    .run(endpointId, endpointId);
}

export function listWebhooks(userId: string): WebhookEndpoint[] {
  const rows = productDb()
    .prepare("SELECT id, name, url, created_at FROM webhook_endpoints WHERE user_id = ? ORDER BY created_at ASC")
    .all(userId) as unknown as { id: string; name: string; url: string; created_at: string }[];
  return rows.map((r) => {
    const last = productDb()
      .prepare("SELECT event, ok, created_at FROM webhook_deliveries WHERE endpoint_id = ? ORDER BY created_at DESC LIMIT 1")
      .get(r.id) as { event: string; ok: number; created_at: string } | undefined;
    return {
      id: r.id,
      name: r.name,
      urlMasked: maskUrl(r.url),
      createdAt: r.created_at,
      lastDelivery: last ? { event: last.event as WebhookEvent, ok: last.ok === 1, at: last.created_at } : null,
    };
  });
}

export function createWebhook(userId: string, name: string, url: string): { endpoint?: { id: string }; error?: string } {
  const trimmed = url.trim();
  const err = validateWebhookUrl(trimmed);
  if (err) return { error: err };
  if (name.trim().length < 2 || name.trim().length > 60) return { error: "Name must be 2–60 characters." };
  const count = (productDb().prepare("SELECT COUNT(*) AS c FROM webhook_endpoints WHERE user_id = ?").get(userId) as { c: number }).c;
  if (count >= MAX_ENDPOINTS_PER_USER) return { error: `Limit of ${MAX_ENDPOINTS_PER_USER} webhooks reached.` };
  const id = newWebhookId();
  productDb()
    .prepare("INSERT INTO webhook_endpoints (id, user_id, name, url, created_at) VALUES (?, ?, ?, ?, ?)")
    .run(id, userId, name.trim().slice(0, 60), trimmed, new Date().toISOString());
  return { endpoint: { id } };
}

export function deleteWebhook(id: string, userId: string): boolean {
  const db = productDb();
  const res = db.prepare("DELETE FROM webhook_endpoints WHERE id = ? AND user_id = ?").run(id, userId);
  db.prepare("DELETE FROM webhook_deliveries WHERE endpoint_id = ?").run(id);
  return res.changes > 0;
}

/** Deliver one event to all of the user's endpoints. Awaited by callers; failures are logged, never thrown. */
export async function fireEvent(userId: string, event: WebhookEvent, data: EventData): Promise<DeliveryResult[]> {
  const rows = productDb()
    .prepare("SELECT id, url FROM webhook_endpoints WHERE user_id = ?")
    .all(userId) as unknown as { id: string; url: string }[];
  const out: DeliveryResult[] = [];
  for (const ep of rows) {
    try {
      const r = await postJson(ep.url, buildBody(detectProvider(ep.url), event, data));
      logDelivery(ep.id, event, r);
      out.push(r);
    } catch (err) {
      const r: DeliveryResult = { ok: false, statusCode: null, error: (err instanceof Error ? err.message : "failed").slice(0, 200) };
      logDelivery(ep.id, event, r);
      out.push(r);
    }
  }
  return out;
}

/** Send a test event to a single endpoint (must belong to the user). */
export async function sendTest(userId: string, endpointId: string): Promise<DeliveryResult> {
  const ep = productDb()
    .prepare("SELECT id, url FROM webhook_endpoints WHERE id = ? AND user_id = ?")
    .get(endpointId, userId) as unknown as { id: string; url: string } | undefined;
  if (!ep) return { ok: false, statusCode: null, error: "Webhook not found." };
  const r = await postJson(ep.url, buildBody(detectProvider(ep.url), "test", { message: "If you see this, StatCheck webhooks work." }));
  logDelivery(ep.id, "test", r);
  return r;
}
