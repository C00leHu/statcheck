import Link from "next/link";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/DashboardShell";
import { Panel, Button } from "@/components/ui";
import { StatusBadge } from "@/components/Status";
import { getSessionUser } from "@/lib/auth/session";
import { listMonitors } from "@/lib/monitor/monitors";

export const metadata = { title: "Monitors" };
export const dynamic = "force-dynamic";

export default function MonitorsPage() {
  const user = getSessionUser();
  if (!user) redirect("/login");
  const monitors = listMonitors(user.id);

  return (
    <DashboardShell title="Monitors" sub={monitors.length === 0 ? "Nothing tracked yet." : `${monitors.length} ${monitors.length === 1 ? "monitor" : "monitors"} tracked.`}>
      <Panel className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5">
          <p className="font-mono text-xs uppercase tracking-[0.12em] text-zinc-500">All monitors</p>
          <Button href="/dashboard/monitors/new" size="sm" variant="light">New monitor</Button>
        </div>
        {monitors.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm font-medium text-white">No monitors yet</p>
            <p className="mx-auto mt-1 max-w-sm text-[13px] text-zinc-500">Add a website, API, or server and StatCheck will watch it for you.</p>
            <div className="mt-4"><Button href="/dashboard/monitors/new" size="sm" variant="light">Create your first monitor</Button></div>
          </div>
        ) : (
          <ul className="divide-y divide-white/5">
            {monitors.map((m) => (
              <li key={m.id}>
                <Link href={`/dashboard/monitors/${m.id}`} className="flex items-center gap-3 px-5 py-4 transition-colors hover:bg-white/[0.03]">
                  <StatusBadge status={m.stats.status === "operational" ? "operational" : m.stats.status === "unknown" ? "unknown" : m.stats.status === "outage" ? "outage" : "degraded"} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white">{m.name}</p>
                    <p className="truncate font-mono text-xs text-zinc-500">{m.type.toUpperCase()} · {m.target} · every {m.interval_seconds >= 60 ? `${m.interval_seconds / 60} min` : `${m.interval_seconds}s`}</p>
                  </div>
                  <span className="ml-auto hidden font-mono text-[13px] tabular-nums text-zinc-400 sm:block">
                    {m.stats.uptime90 == null ? "—" : `${m.stats.uptime90}%`} · {m.stats.avgMs == null ? "—" : `${m.stats.avgMs} ms`}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </DashboardShell>
  );
}
