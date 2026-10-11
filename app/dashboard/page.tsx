import Link from "next/link";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/DashboardShell";
import { Panel, Button } from "@/components/ui";
import { StatusBadge } from "@/components/Status";
import { getSessionUser } from "@/lib/auth/session";
import { getRecentChecksForUser, listMonitors } from "@/lib/monitor/monitors";
import { countOpenIncidents, getOnboardingDone, listIncidents, listStatusPages } from "@/lib/monitor/content";

export const metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

function ago(iso: string): string {
  const s = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function fmtTime(iso: string): string {
  return new Date(iso).toISOString().slice(11, 16) + " UTC";
}

export default function DashboardPage() {
  const user = getSessionUser();
  if (!user) redirect("/login");

  const monitors = listMonitors(user.id);
  // Onboarding shows exactly once: only brand-new accounts with nothing set up are sent there.
  if (monitors.length === 0 && !getOnboardingDone(user.id)) redirect("/dashboard/setup");

  const pages = listStatusPages(user.id);
  const openIncidents = countOpenIncidents(user.id);
  const incidents = listIncidents(user.id).slice(0, 3);
  const recent = getRecentChecksForUser(user.id, 8);
  const operational = monitors.filter((m) => m.stats.status === "operational").length;
  const avgs = monitors.map((m) => m.stats.avgMs).filter((x): x is number => x != null);
  const avgMs = avgs.length ? Math.round(avgs.reduce((a, b) => a + b, 0) / avgs.length) : null;
  const hasChecks = monitors.some((m) => m.stats.checkCount > 0);

  const checklist = [
    { done: true, label: `${monitors.length} ${monitors.length === 1 ? "monitor" : "monitors"} created`, href: "/dashboard/monitors" },
    { done: hasChecks, label: hasChecks ? "First checks recorded" : "Run your first check", href: hasChecks ? "/dashboard/monitors" : monitors.length > 0 ? `/dashboard/monitors/${monitors[0].id}` : "/dashboard/monitors/new" },
    { done: pages.length > 0, label: pages.length > 0 ? `${pages.length} ${pages.length === 1 ? "status page" : "status pages"} live` : "Publish a status page", href: "/dashboard/pages" },
  ];
  const setupComplete = checklist.every((c) => c.done);

  return (
    <DashboardShell title={`Welcome${user.name ? `, ${user.name.split(" ")[0]}` : ""}`} sub="Here's what's happening across your services.">
      {!setupComplete && (
        <Panel className="mb-4 border-emerald-500/25 bg-emerald-500/[0.06] p-5">
          <h2 className="font-mono text-xs uppercase tracking-[0.14em] text-emerald-300">Finish setup</h2>
          <ul className="mt-3 space-y-2">
            {checklist.map((c) => (
              <li key={c.label}>
                <Link href={c.href} className="flex items-center gap-2.5 text-sm text-zinc-300 transition-colors hover:text-white">
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${c.done ? "bg-emerald-400 text-zinc-950" : "border border-white/20 text-transparent"}`}>✓</span>
                  {c.label} {!c.done && <span aria-hidden="true">→</span>}
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { l: "Monitors", v: String(monitors.length), s: `${operational} operational` },
          { l: "Open incidents", v: String(openIncidents), s: openIncidents === 0 ? "All quiet" : "Needs attention" },
          { l: "Status pages", v: String(pages.length), s: pages.length === 0 ? "None published" : "Live" },
          { l: "Avg. response", v: avgMs == null ? "—" : `${avgMs} ms`, s: "Last 24h" },
        ].map((k) => (
          <Panel key={k.l} className="p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-zinc-500">{k.l}</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums text-white">{k.v}</p>
            <p className="mt-0.5 text-xs text-zinc-500">{k.s}</p>
          </Panel>
        ))}
      </div>

      <Panel className="mt-4 overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5">
          <h2 className="text-sm font-semibold text-white">Monitors</h2>
          <Button href="/dashboard/monitors" size="sm" variant="outlineDark">Manage</Button>
        </div>
        {monitors.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm font-medium text-white">No monitors yet</p>
            <p className="mt-1 text-[13px] text-zinc-500">Create your first monitor to start tracking uptime.</p>
            <div className="mt-4"><Button href="/dashboard/setup" size="sm" variant="light">Set up monitoring</Button></div>
          </div>
        ) : (
          <ul className="divide-y divide-white/5">
            {monitors.map((m) => (
              <li key={m.id}>
                <Link href={`/dashboard/monitors/${m.id}`} className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-white/[0.03]">
                  <StatusBadge status={m.stats.status === "operational" ? "operational" : m.stats.status === "unknown" ? "unknown" : m.stats.status === "outage" ? "outage" : "degraded"} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white">{m.name}</p>
                    <p className="truncate font-mono text-xs text-zinc-500">{m.type.toUpperCase()} · {m.target}</p>
                  </div>
                  <div className="ml-auto hidden sm:flex items-center gap-5 text-right">
                    <span><span className="block font-mono text-[13px] font-medium tabular-nums text-zinc-200">{m.stats.uptime90 == null ? "—" : `${m.stats.uptime90}%`}</span><span className="block text-xs text-zinc-500">90d uptime</span></span>
                    <span><span className="block font-mono text-[13px] font-medium tabular-nums text-zinc-200">{m.stats.avgMs == null ? "—" : `${m.stats.avgMs} ms`}</span><span className="block text-xs text-zinc-500">avg</span></span>
                    <span className="w-24 font-mono text-xs text-zinc-500">{m.stats.lastCheckedAt ? ago(m.stats.lastCheckedAt) : "never checked"}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel className="overflow-hidden">
          <div className="border-b border-white/10 px-5 py-3.5">
            <h2 className="text-sm font-semibold text-white">Recent checks</h2>
          </div>
          {recent.length === 0 ? (
            <p className="px-5 py-8 text-center text-[13px] text-zinc-500">No checks recorded yet. Open a monitor and run your first check.</p>
          ) : (
            <ul className="divide-y divide-white/5">
              {recent.map((c) => (
                <li key={c.id} className="flex items-center gap-2.5 px-5 py-2.5 text-[13px]">
                  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${c.ok ? "bg-emerald-400" : "bg-red-400"}`} />
                  <Link href={`/dashboard/monitors/${c.monitorId}`} className="font-medium text-zinc-200 hover:text-white hover:underline">{c.monitorName}</Link>
                  <span className="ml-auto font-mono text-xs tabular-nums text-zinc-500">
                    {c.ok ? (c.statusCode ? `${c.statusCode} · ` : "") + (c.ms != null ? `${c.ms} ms` : "") : (c.error ?? "failed")} · {fmtTime(c.checkedAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5">
            <h2 className="text-sm font-semibold text-white">Incidents</h2>
            <Button href="/dashboard/incidents" size="sm" variant="outlineDark">Manage</Button>
          </div>
          {incidents.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-sm font-medium text-white">No incidents yet</p>
              <p className="mt-1 text-[13px] text-zinc-500">When something breaks, open an incident to keep users informed.</p>
              <div className="mt-4"><Button href="/dashboard/incidents" size="sm" variant="outlineDark">Open an incident</Button></div>
            </div>
          ) : (
            <ul className="divide-y divide-white/5">
              {incidents.map((inc) => (
                <li key={inc.id} className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${inc.status === "resolved" ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300" : "border-amber-500/25 bg-amber-500/10 text-amber-300"}`}>{inc.status}</span>
                    <p className="text-sm font-medium text-white">{inc.title}</p>
                  </div>
                  <p className="mt-1 font-mono text-xs text-zinc-500">{ago(inc.updatedAt)} · {inc.updates.length} {inc.updates.length === 1 ? "update" : "updates"}</p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </DashboardShell>
  );
}
