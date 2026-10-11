import Link from "next/link";
import { StatusDot, StatusBadge } from "@/components/Status";
import { UptimeBars } from "@/components/charts";
import { Reveal } from "@/components/Reveal";
import { generateUptimeDays, incidents } from "@/lib/mock-data";

export const metadata = { title: "StatCheck Demo — Status" };

const services = [
  { n: "Website", d: "Marketing site and docs · 212 ms avg", id: "website", uptime: "99.99%" },
  { n: "API", d: "api.example.com · 142 ms avg", id: "example-api", uptime: "99.98%" },
  { n: "Dashboard", d: "app.example.com · 188 ms avg", id: "dashboard", uptime: "99.97%" },
  { n: "Discord Integration", d: "Webhooks and bot gateway · 174 ms avg", id: "discord-integration", uptime: "99.99%" },
];

const seeds: Record<string, number> = { website: 3, "example-api": 7, dashboard: 12, "discord-integration": 44 };

export default function StatusDemoPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 sm:py-16">
        <Reveal>
          <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sm font-semibold text-zinc-950">S</span>
              <div>
                <h1 className="text-xl font-semibold tracking-tight text-white">StatCheck Demo</h1>
                <p className="font-mono text-xs text-zinc-600">status.example.com · example data</p>
              </div>
              <Link href="/" className="ml-auto hidden font-mono text-xs text-zinc-600 transition-colors hover:text-white sm:block">STATCHECK →</Link>
            </div>
            <div className="mt-6 flex items-center gap-3 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3.5">
              <StatusDot status="operational" />
              <div>
                <p className="text-[15px] font-semibold text-emerald-300">All systems operational</p>
                <p className="font-mono text-xs text-zinc-500">Last updated Oct 3, 2026 at 12:00 UTC · 38 seconds ago</p>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/60">
            <div className="border-b border-white/10 px-5 py-3.5 font-mono text-xs uppercase tracking-[0.12em] text-zinc-500">Services</div>
            <div className="divide-y divide-white/5">
              {services.map((s) => (
                <div key={s.id} className="px-5 py-4">
                  <div className="flex items-center gap-2.5">
                    <StatusDot status="operational" size="sm" />
                    <p className="text-[15px] font-medium text-white">{s.n}</p>
                    <span className="ml-auto"><StatusBadge status="operational" /></span>
                  </div>
                  <p className="mt-0.5 pl-5 font-mono text-xs text-zinc-600">{s.d}</p>
                  <div className="mt-2.5 pl-5"><UptimeBars days={generateUptimeDays(seeds[s.id] ?? 5, 90)} height={28} /></div>
                  <div className="mt-1.5 flex justify-between pl-5 font-mono text-xs text-zinc-600"><span>90 days ago</span><span>{s.uptime} uptime</span><span>Today</span></div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="mt-4 rounded-2xl border border-white/10 bg-zinc-900/60 p-5 sm:p-6">
            <h2 className="font-mono text-xs uppercase tracking-[0.12em] text-zinc-500">Scheduled maintenance</h2>
            <div className="mt-3 rounded-xl border border-blue-500/25 bg-blue-500/10 px-4 py-3">
              <p className="text-sm font-medium text-white">Database upgrade — Oct 12, 02:00–02:30 UTC</p>
              <p className="mt-1 text-[13px] text-zinc-400">Dashboard and API may be briefly unavailable during failover. We expect less than 90 seconds of downtime.</p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={160}>
          <div className="mt-4 rounded-2xl border border-white/10 bg-zinc-900/60 p-5 sm:p-6">
            <h2 className="font-mono text-xs uppercase tracking-[0.12em] text-zinc-500">Recent incidents</h2>
            <div className="mt-4 space-y-4">
              {incidents.map((inc) => (
                <article key={inc.id} className="rounded-xl border border-white/10 bg-zinc-950/60 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status="operational" />
                    <h3 className="text-sm font-semibold text-white">{inc.title}</h3>
                  </div>
                  <p className="mt-2 text-[13px] leading-relaxed text-zinc-400">{inc.description}</p>
                  <div className="mt-3 space-y-2.5 border-t border-white/10 pt-3">
                    {inc.updates.slice(-2).map((u) => (
                      <div key={u.id} className="text-[13px]">
                        <p className="font-medium capitalize text-zinc-300">{u.status} <span className="ml-1 font-mono font-normal text-zinc-600">{u.timestamp}</span></p>
                        <p className="mt-0.5 text-zinc-400">{u.message}</p>
                      </div>
                    ))}
                  </div>
                  <p className="mt-2 font-mono text-xs text-zinc-600">Affected: {inc.affected.join(", ")}</p>
                </article>
              ))}
            </div>
          </div>
        </Reveal>

        <div className="mt-8 rounded-2xl border border-white/10 bg-zinc-900/60 px-6 py-6 text-center">
          <p className="text-sm font-medium text-white">This is a demo with example data.</p>
          <p className="mt-1 text-[13px] text-zinc-500">Create an account to publish a live page like this for your own services.</p>
          <Link href="/signup" className="mt-4 inline-flex items-center justify-center rounded-xl bg-white px-6 py-2.5 text-sm font-semibold text-zinc-950 transition-all hover:bg-emerald-100 active:scale-[0.98]">Get started</Link>
        </div>
      </div>
    </div>
  );
}
