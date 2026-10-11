import { Card, SectionHeading, Button } from "@/components/ui";
import { Reveal } from "@/components/Reveal";
import { StatusDot, StatusBadge } from "@/components/Status";
import { UptimeBars, ResponseChart } from "@/components/charts";
import { CodeBlock } from "@/components/CodeBlock";
import { generateUptimeDays, generateResponseSeries } from "@/lib/mock-data";

export const metadata = { title: "Features" };

function FeatureShell({ eyebrow, title, sub, children, flip = false }: { eyebrow: string; title: string; sub: string; children: React.ReactNode; flip?: boolean }) {
  return (
    <div className={`grid items-center gap-8 lg:grid-cols-2 ${flip ? "lg:[&>*:first-child]:order-2" : ""}`}>
      <Reveal>
        <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-emerald-700">{eyebrow}</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-zinc-600">{sub}</p>
      </Reveal>
      <Reveal delay={100}>{children}</Reveal>
    </div>
  );
}

function Coming({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-3 font-mono text-xs text-zinc-500">
      <span className="rounded border border-zinc-300 px-1.5 py-0.5 text-[11px]">ROADMAP</span> {children}
    </p>
  );
}

export default function FeaturesPage() {
  const days = generateUptimeDays(11, 60);
  const resp = generateResponseSeries(48, 132);
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14 sm:py-20">
      <Reveal>
        <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-emerald-700">Features</p>
        <h1 className="mt-2 max-w-2xl text-3xl sm:text-5xl font-semibold tracking-tight">Monitoring and communication, <em className="font-display font-normal italic">built as one.</em></h1>
        <p className="mt-4 max-w-2xl text-base sm:text-lg text-zinc-600 leading-relaxed">Every check, incident update, and status page in StatCheck works from the same data — so what you see internally is what your users see. Below is what exists today; roadmap items are marked as such.</p>
        <div className="mt-6 flex gap-3"><Button href="/signup">Get started</Button><Button href="/pricing" variant="secondary">See pricing</Button></div>
      </Reveal>

      <div className="mt-16 space-y-16 sm:space-y-24">
        <FeatureShell eyebrow="Monitoring" title="HTTP, HTTPS, and TCP checks" sub="Add a URL or a host:port, pick a 1, 5, or 15-minute interval, and run a live check immediately. HTTPS and HTTP pass on 2xx–3xx; TCP passes when the connection opens.">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[13px] text-zinc-700">GET https://api.example.com/health</span>
              <StatusBadge status="operational" />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              {[["200", "Status"], ["142 ms", "Latency"], ["60 s", "Interval"]].map(([v, l]) => (
                <div key={l} className="rounded-lg bg-zinc-50 border border-zinc-100 py-3"><p className="font-mono text-sm font-semibold">{v}</p><p className="text-xs text-zinc-500">{l}</p></div>
              ))}
            </div>
            <p className="mt-3 font-mono text-xs text-zinc-500">Checked just now · stored to history</p>
          </Card>
        </FeatureShell>

        <FeatureShell flip eyebrow="Uptime & latency" title="Uptime tracking with response-time history" sub="Every check records status and latency. Statuses escalate honestly: a first failure degrades, consecutive failures mean outage, and days without checks stay gray instead of pretending.">
          <Card className="p-5">
            <div className="flex items-center justify-between text-sm"><span className="font-medium">API · response time</span><span className="font-mono text-xs text-zinc-500">recorded checks</span></div>
            <div className="mt-3"><ResponseChart data={resp} height={130} /></div>
            <div className="mt-3 flex gap-4 text-[13px] text-zinc-600"><span><strong className="text-zinc-900">99.98%</strong> 90-day uptime</span><span><strong className="text-zinc-900">142 ms</strong> avg</span><span><strong className="text-zinc-900">1,000</strong> checks kept</span></div>
          </Card>
        </FeatureShell>

        <FeatureShell eyebrow="Incidents" title="Incident creation with structured updates" sub="Open an incident in seconds, attach affected monitors (or none, for general announcements), and post updates through Investigating → Identified → Monitoring → Resolved. Every update is timestamped and appears on linked status pages.">
          <Card className="p-5">
            <div className="flex items-center gap-2.5"><StatusDot status="degraded" /><p className="text-sm font-semibold">Elevated API response times</p></div>
            <div className="mt-4 space-y-0 border-l-2 border-zinc-200 ml-2">
              {[["Investigating", "14:08", true], ["Identified", "14:21", true], ["Monitoring", "14:35", true], ["Resolved", "14:47", false]].map(([s, t, done]) => (
                <div key={s as string} className="relative pl-5 pb-4 last:pb-0">
                  <span className={`absolute -left-[5px] top-1 h-2 w-2 rounded-full ${done ? "bg-emerald-500" : "bg-zinc-300"}`} />
                  <p className="text-[13px] font-medium">{s} <span className="ml-1 font-normal text-zinc-500">{t} UTC</span></p>
                </div>
              ))}
            </div>
          </Card>
        </FeatureShell>

        <FeatureShell flip eyebrow="Alert webhooks" title="Outage and recovery alerts where you work" sub="Add Discord, Slack, or generic webhook URLs. StatCheck fires on confirmed outages, recoveries, and incident updates — Discord and Slack get native formatting, everything else gets JSON. Every delivery is logged per endpoint, and a test button proves it works.">
          <Card className="space-y-2 p-4">
            {[["Discord · #alerts", "Outage: API failed checks"], ["Slack · #ops", "Recovered: API · 141 ms"], ["JSON · pager", "incident.updated → monitoring"]].map(([ch, msg]) => (
              <div key={ch} className="flex items-center gap-3 rounded-lg border border-zinc-100 px-3 py-2.5 text-[13px]">
                <span className="rounded-md bg-zinc-100 px-2 py-0.5 font-mono text-xs">{ch}</span><span className="text-zinc-700">{msg}</span>
                <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" title="Delivered" />
              </div>
            ))}
          </Card>
        </FeatureShell>

        <FeatureShell eyebrow="Status pages" title="Public pages at your own URLs" sub="Pick a name, a /s/ slug, and the monitors to display. Visitors get overall status, 90-day uptime bars, response times, and recent incidents — no sign-in required. Deleting a page takes it offline immediately.">
          <Card className="divide-y divide-zinc-100">
            {[["Website", "99.99%"], ["API", "99.98%"], ["Dashboard", "99.97%"]].map(([n, u]) => (
              <div key={n} className="flex items-center gap-2.5 px-4 py-3">
                <StatusDot status="operational" size="sm" /><span className="text-sm font-medium">{n}</span>
                <span className="ml-auto font-mono text-xs text-zinc-500">{u}</span>
              </div>
            ))}
            <div className="px-4 py-3"><UptimeBars days={days} height={30} /></div>
          </Card>
        </FeatureShell>

        <FeatureShell flip eyebrow="Scheduling" title="Checks on your schedule" sub="StatCheck runs checks when your scheduler calls the check endpoint — every monitor whose interval elapsed gets checked. Until then, Run check now does the same thing on demand.">
          <div className="space-y-3">
            <CodeBlock title="Run due checks every minute (cron)" language="bash" code={`curl -X POST https://YOUR-DOMAIN/api/cron/check \\
  -H "Authorization: Bearer $CRON_SECRET"`} />
            <Card className="flex items-center gap-2.5 px-4 py-3 text-sm"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg><span>Secret-protected · up to 25 monitors per run</span></Card>
          </div>
        </FeatureShell>

        <FeatureShell eyebrow="API-first" title="Everything the dashboard does, over JSON" sub="Monitors, checks, incidents, updates, status pages, and settings all run through the same session-authenticated JSON API the UI uses. Automate from scripts with a cookie jar — token auth is on the roadmap.">
          <CodeBlock title="POST /api/monitors (session cookie)" language="bash" code={`curl -b jar.txt -X POST http://localhost:3000/api/monitors \\
  -H "Content-Type: application/json" \\
  -d '{"name":"API","type":"https","target":"https://api.example.com/health","intervalSeconds":60}'`} />
        </FeatureShell>

        <FeatureShell flip eyebrow="Self-hosted & private" title="Your data stays on your box" sub="SQLite storage, owner-only file permissions, AES-256 encrypted backups, scrypt-hashed passwords, no advertising trackers — and one-click account deletion that wipes everything immediately.">
          <Card className="space-y-2 p-4">
            {[["SQLite", "one file, WAL mode, yours"], ["Backups", "encrypted, auto-pruned"], ["Cookies", "session + consent only"]].map(([ch, msg]) => (
              <div key={ch} className="flex items-center gap-3 rounded-lg border border-zinc-100 px-3 py-2.5 text-[13px]">
                <span className="rounded-md bg-zinc-100 px-2 py-0.5 font-mono text-xs">{ch}</span><span className="text-zinc-700">{msg}</span>
              </div>
            ))}
          </Card>
        </FeatureShell>

        <FeatureShell eyebrow="Projects" title="Multiple pages, one account" sub="Run a status page per product, per game, or per client from a single account — everything included while in beta.">
          <Card className="divide-y divide-zinc-100">
            {[["acme-status", "3 monitors · Operational"], ["side-project", "2 monitors · Operational"], ["game-server", "1 monitor · Degraded"]].map(([n, d], i) => (
              <div key={n} className="flex items-center gap-2.5 px-4 py-3">
                <StatusDot status={i === 2 ? "degraded" : "operational"} size="sm" />
                <span className="font-mono text-[13px] font-medium">/s/{n}</span>
                <span className="ml-auto text-xs text-zinc-500">{d}</span>
              </div>
            ))}
          </Card>
        </FeatureShell>
      </div>

      <div className="mt-20 rounded-2xl border border-zinc-200 bg-zinc-50 px-6 py-10">
        <SectionHeading title="On the roadmap" sub="Custom domains, API tokens, team seats, and longer history. Nothing here is sold or gated today — it ships when it's real." />
        <div className="mt-5 flex justify-center gap-3"><Button href="/status/demo" variant="secondary">View demo</Button><Button href="/signup">Get started</Button></div>
      </div>
    </div>
  );
}
