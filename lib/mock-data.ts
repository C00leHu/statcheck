export type MonitorStatus = "operational" | "degraded" | "outage" | "unknown" | "maintenance";

export interface Monitor {
  id: string;
  name: string;
  url: string;
  type: "HTTPS" | "HTTP" | "Ping" | "TCP";
  status: MonitorStatus;
  uptime90: number;
  uptime30: number;
  responseTimeMs: number;
  lastCheckedSeconds: number;
  intervalSec: number;
}

export interface UptimeDay {
  date: string;
  status: MonitorStatus;
  uptime: number;
  avgMs: number;
}

export interface IncidentUpdate {
  id: string;
  status: "investigating" | "identified" | "monitoring" | "resolved";
  message: string;
  timestamp: string;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  status: "investigating" | "identified" | "monitoring" | "resolved";
  affected: string[];
  startedAt: string;
  updatedAt: string;
  updates: IncidentUpdate[];
}

export const monitors: Monitor[] = [
  { id: "website", name: "Website", url: "https://example.com", type: "HTTPS", status: "operational", uptime90: 99.99, uptime30: 100, responseTimeMs: 212, lastCheckedSeconds: 18, intervalSec: 60 },
  { id: "example-api", name: "API", url: "https://api.example.com", type: "HTTPS", status: "operational", uptime90: 99.98, uptime30: 99.99, responseTimeMs: 142, lastCheckedSeconds: 12, intervalSec: 60 },
  { id: "dashboard", name: "Dashboard", url: "https://app.example.com", type: "HTTPS", status: "operational", uptime90: 99.97, uptime30: 100, responseTimeMs: 188, lastCheckedSeconds: 24, intervalSec: 60 },
  { id: "discord-bot", name: "Discord Bot", url: "gateway.discord.example", type: "TCP", status: "operational", uptime90: 99.95, uptime30: 99.98, responseTimeMs: 96, lastCheckedSeconds: 31, intervalSec: 60 },
  { id: "game-server", name: "Game Server", url: "play.example.com:25565", type: "TCP", status: "operational", uptime90: 99.93, uptime30: 99.96, responseTimeMs: 41, lastCheckedSeconds: 9, intervalSec: 60 },
  { id: "discord-integration", name: "Discord Integration", url: "https://discord.example.com/webhook", type: "HTTPS", status: "operational", uptime90: 99.99, uptime30: 100, responseTimeMs: 174, lastCheckedSeconds: 44, intervalSec: 300 },
];

export const incidents: Incident[] = [
  {
    id: "inc-2026-02-11",
    title: "Elevated API response times",
    description: "We observed elevated p95 response times on the API between 14:02 and 14:47 UTC due to a saturated database connection pool. Traffic was shifted and the pool was scaled. No data loss occurred.",
    status: "resolved",
    affected: ["API"],
    startedAt: "Feb 11, 2026 at 14:02 UTC",
    updatedAt: "Feb 11, 2026 at 14:47 UTC",
    updates: [
      { id: "u1", status: "investigating", message: "We are investigating elevated response times on the API. Some requests may take longer than usual.", timestamp: "Feb 11, 2026 at 14:08 UTC" },
      { id: "u2", status: "identified", message: "Identified a saturated database connection pool as the cause. We are scaling capacity and shifting traffic.", timestamp: "Feb 11, 2026 at 14:21 UTC" },
      { id: "u3", status: "monitoring", message: "Response times have returned to normal. We are monitoring closely to confirm stability.", timestamp: "Feb 11, 2026 at 14:35 UTC" },
      { id: "u4", status: "resolved", message: "This incident is resolved. p95 latency is back to baseline and error rates are normal.", timestamp: "Feb 11, 2026 at 14:47 UTC" },
    ],
  },
  {
    id: "inc-2026-01-28",
    title: "Scheduled database maintenance",
    description: "Routine database maintenance to apply security patches. A brief failover window of approximately 90 seconds was expected.",
    status: "resolved",
    affected: ["Dashboard", "API"],
    startedAt: "Jan 28, 2026 at 02:00 UTC",
    updatedAt: "Jan 28, 2026 at 02:31 UTC",
    updates: [
      { id: "u1", status: "monitoring", message: "Maintenance started. A short failover window is expected.", timestamp: "Jan 28, 2026 at 02:00 UTC" },
      { id: "u2", status: "resolved", message: "Maintenance completed successfully. All systems verified operational.", timestamp: "Jan 28, 2026 at 02:31 UTC" },
    ],
  },
  {
    id: "inc-2026-01-09",
    title: "Game server packet loss in EU region",
    description: "Packet loss affecting EU game server nodes caused by an upstream transit issue. Traffic was rerouted via an alternate provider.",
    status: "resolved",
    affected: ["Game Server"],
    startedAt: "Jan 9, 2026 at 19:14 UTC",
    updatedAt: "Jan 9, 2026 at 20:02 UTC",
    updates: [
      { id: "u1", status: "investigating", message: "Investigating reports of packet loss on EU game server nodes.", timestamp: "Jan 9, 2026 at 19:18 UTC" },
      { id: "u2", status: "identified", message: "Confirmed upstream transit issue. Rerouting traffic via alternate provider.", timestamp: "Jan 9, 2026 at 19:36 UTC" },
      { id: "u3", status: "resolved", message: "Packet loss resolved after reroute. Latency back to normal.", timestamp: "Jan 9, 2026 at 20:02 UTC" },
    ],
  },
];

export function generateUptimeDays(seed: number, days = 90): UptimeDay[] {
  const out: UptimeDay[] = [];
  const now = new Date("2026-10-03T12:00:00Z");
  let s = seed;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const r = rand();
    let status: MonitorStatus = "operational";
    let uptime = 100;
    if (r > 0.985) {
      status = "outage";
      uptime = 92 + rand() * 6;
    } else if (r > 0.955) {
      status = "degraded";
      uptime = 97 + rand() * 2.5;
    }
    out.push({
      date: d.toISOString().slice(0, 10),
      status,
      uptime: Math.round(uptime * 100) / 100,
      avgMs: Math.round(90 + rand() * 140),
    });
  }
  return out;
}

export function generateResponseSeries(points = 48, base = 140): { t: string; ms: number }[] {
  const out: { t: string; ms: number }[] = [];
  let s = base;
  for (let i = 0; i < points; i++) {
    const drift = Math.sin(i / 6) * 18 + (Math.sin(i * 1.7) * 8);
    const noise = ((i * 37) % 23) - 11;
    s = base + drift + noise;
    const hour = String(Math.floor(i / 2)).padStart(2, "0");
    const min = i % 2 === 0 ? "00" : "30";
    out.push({ t: `${hour}:${min}`, ms: Math.max(28, Math.round(s)) });
  }
  return out;
}

export function generateChecks(count = 12) {
  const checks = [];
  const base = new Date("2026-10-03T11:58:00Z").getTime();
  for (let i = 0; i < count; i++) {
    const t = new Date(base - i * 60 * 1000);
    const ms = 118 + Math.round(Math.sin(i / 2.5) * 22 + ((i * 13) % 17));
    checks.push({
      id: `chk-${i}`,
      time: t.toISOString(),
      timeLabel: t.toUTCString().slice(17, 22) + " UTC",
      statusCode: 200,
      ms,
      location: ["Frankfurt", "Amsterdam", "Virginia", "Tokyo"][i % 4],
      ok: i !== 7,
    });
  }
  return checks;
}
