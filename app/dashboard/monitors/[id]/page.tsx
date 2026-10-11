import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/DashboardShell";
import { Panel } from "@/components/ui";
import { StatusBadge } from "@/components/Status";
import { CheckNowButton } from "@/components/CheckNowButton";
import { DeleteMonitorButton } from "@/components/DeleteMonitorButton";
import { UptimeBars, ResponseChart } from "@/components/charts";
import { getSessionUser } from "@/lib/auth/session";
import { getDailyBuckets, getMonitorWithStats, getRecentChecks } from "@/lib/monitor/monitors";

export const metadata = { title: "Monitor" };
export const dynamic = "force-dynamic";

function fmt(iso: string): string {
  const d = new Date(iso);
  return `${d.toISOString().slice(0, 10)} ${d.toISOString().slice(11, 16)} UTC`;
}

export default function MonitorDetailsPage({ params }: { params: { id: string } }) {
  const user = getSessionUser();
  if (!user) redirect("/login");
  const monitor = getMonitorWithStats(params.id, user.id);
  if (!monitor) redirect("/dashboard/monitors");

  const daily = getDailyBuckets(params.id, 90);
  const checks = getRecentChecks(params.id, 48);
  const series = [...checks]
    .reverse()
    .filter((c) => c.ms != null)
    .map((c) => ({ t: c.checkedAt.slice(11, 16), ms: c.ms as number }));
  const { stats } = monitor;

  return (
    <DashboardShell title={monitor.name} sub={`${monitor.type.toUpperCase()} · ${monitor.target} · every ${monitor.interval_seconds / 60} min`}>
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={stats.status === "operational" ? "operational" : stats.status === "unknown" ? "unknown" : stats.status === "outage" ? "outage" : "degraded"} />
        <span className="ml-auto flex flex-wrap gap-2">
          <CheckNowButton monitorId={monitor.id} />
          <DeleteMonitorButton monitorId={monitor.id} monitorName={monitor.name} />
        </span>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-4">
        {[
          ["Uptime (90d)", stats.uptime90 == null ? "—" : `${stats.uptime90}%`],
          ["Uptime (30d)", stats.uptime30 == null ? "—" : `${stats.uptime30}%`],
          ["Avg. response", stats.avgMs == null ? "—" : `${stats.avgMs} ms`],
          ["Checks", String(stats.checkCount)],
        ].map(([l, v]) => (
          <Panel key={l} className="p-4"><p className="font-mono text-[11px] uppercase tracking-[0.12em] text-zinc-500">{l}</p><p className="mt-1 text-xl font-semibold tracking-tight tabular-nums text-white">{v}</p></Panel>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel className="p-5">
          <h2 className="text-sm font-semibold text-white">Uptime history — 90 days</h2>
          <div className="mt-3"><UptimeBars days={daily} height={52} /></div>
          <p className="mt-2 font-mono text-xs text-zinc-600">Gray days have no recorded checks yet.</p>
        </Panel>
        <Panel className="p-5">
          <h2 className="text-sm font-semibold text-white">Response time</h2>
          {series.length === 0 ? (
            <p className="py-10 text-center text-[13px] text-zinc-500">No measurements yet — run your first check above.</p>
          ) : (
            <div className="mt-3"><ResponseChart data={series} height={120} grid="rgba(255,255,255,0.12)" /></div>
          )}
        </Panel>
      </div>

      <Panel className="mt-4 overflow-hidden">
        <div className="border-b border-white/10 px-5 py-3.5 text-sm font-semibold text-white">Recent checks</div>
        {checks.length === 0 ? (
          <p className="px-5 py-8 text-center text-[13px] text-zinc-500">Nothing recorded. Checks appear here automatically once scheduled, or run one now.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead><tr className="border-b border-white/10 font-mono text-[12px] uppercase tracking-wider text-zinc-500">
                <th className="px-5 py-2.5 font-medium">Time</th><th className="px-5 py-2.5 font-medium">Result</th><th className="px-5 py-2.5 font-medium">Latency</th><th className="px-5 py-2.5 font-medium">Detail</th>
              </tr></thead>
              <tbody>
                {checks.map((c) => (
                  <tr key={c.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                    <td className="px-5 py-2.5 font-mono text-[13px] text-zinc-400">{fmt(c.checkedAt)}</td>
                    <td className="px-5 py-2.5">
                      <span className={`inline-flex items-center gap-1.5 text-[13px] font-medium ${c.ok ? "text-emerald-300" : "text-red-300"}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${c.ok ? "bg-emerald-400" : "bg-red-400"}`} />
                        {c.ok ? (c.statusCode ? `${c.statusCode} OK` : "OK") : "Failed"}
                      </span>
                    </td>
                    <td className="px-5 py-2.5 font-mono text-[13px] tabular-nums text-zinc-300">{c.ms == null ? "—" : `${c.ms} ms`}</td>
                    <td className="max-w-[240px] truncate px-5 py-2.5 text-[13px] text-zinc-500">{c.error ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Panel className="mt-4 p-5">
        <h2 className="text-sm font-semibold text-white">Monitoring configuration</h2>
        <dl className="mt-3 space-y-2.5 text-sm">
          {[["Type", monitor.type.toUpperCase()], ["Target", monitor.target], ["Interval", `Every ${monitor.interval_seconds / 60} minute${monitor.interval_seconds === 60 ? "" : "s"}`], ["Timeout", `${monitor.timeout_seconds} seconds`], ["Created", fmt(monitor.created_at)]].map(([k, v]) => (
            <div key={k} className="flex gap-3"><dt className="w-20 shrink-0 text-zinc-500">{k}</dt><dd className="font-mono text-[13px] text-zinc-300">{v}</dd></div>
          ))}
        </dl>
      </Panel>
    </DashboardShell>
  );
}
