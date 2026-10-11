import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusDot, StatusBadge } from "@/components/Status";
import { UptimeBars } from "@/components/charts";
import { getStatusPageBySlug, listIncidents } from "@/lib/monitor/content";
import { getDailyBuckets, getMonitorWithStats } from "@/lib/monitor/monitors";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const page = getStatusPageBySlug(params.slug);
  return { title: page ? `${page.name} — Status` : "Status" };
}

export default function PublicStatusPage({ params }: { params: { slug: string } }) {
  const page = getStatusPageBySlug(params.slug);
  if (!page) notFound();

  const services = page.monitorIds
    .map((id) => {
      const m = getMonitorWithStats(id, page.userId);
      if (!m) return null;
      return { monitor: m, daily: getDailyBuckets(id, 90) };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const statuses = services.map((s) => s.monitor.stats.status);
  const overall = statuses.includes("outage")
    ? "outage"
    : statuses.includes("degraded")
      ? "degraded"
      : statuses.length > 0 && statuses.every((s) => s === "unknown")
        ? "unknown"
        : "operational";

  const allIncidents = listIncidents(page.userId).filter(
    (inc) => inc.monitorIds.length === 0 || inc.monitorIds.some((id) => page.monitorIds.includes(id))
  );
  const open = allIncidents.filter((i) => i.status !== "resolved");
  const recent = allIncidents.slice(0, 5);

  const banner =
    overall === "operational"
      ? "border-emerald-500/25 bg-emerald-500/10"
      : overall === "outage"
        ? "border-red-500/25 bg-red-500/10"
        : overall === "degraded"
          ? "border-amber-500/25 bg-amber-500/10"
          : "border-white/10 bg-white/[0.03]";
  const bannerText =
    overall === "operational" ? "text-emerald-300" : overall === "outage" ? "text-red-300" : overall === "degraded" ? "text-amber-300" : "text-white";

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 sm:py-16">
        <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sm font-semibold text-zinc-950">
              {page.name.charAt(0).toUpperCase()}
            </span>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-white">{page.name}</h1>
              {page.description
                ? <p className="text-[13px] text-zinc-500">{page.description}</p>
                : <p className="font-mono text-xs text-zinc-600">/s/{page.slug}</p>}
            </div>
            <Link href="/" className="ml-auto hidden font-mono text-xs text-zinc-600 transition-colors hover:text-white sm:block">STATCHECK →</Link>
          </div>
          <div className={`mt-6 flex items-center gap-3 rounded-xl border px-4 py-3.5 ${banner}`}>
            <StatusDot status={overall} />
            <div>
              <p className={`text-[15px] font-semibold ${bannerText}`}>
                {overall === "operational"
                  ? "All systems operational"
                  : overall === "outage"
                    ? "Major outage in progress"
                    : overall === "degraded"
                      ? "Some systems degraded"
                      : "Collecting monitoring data"}
              </p>
              <p className="font-mono text-xs text-zinc-500">
                {new Date().toUTCString().slice(0, 25)}
                {open.length > 0 && ` · ${open.length} open ${open.length === 1 ? "incident" : "incidents"}`}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/60">
          <div className="border-b border-white/10 px-5 py-3.5 font-mono text-xs uppercase tracking-[0.12em] text-zinc-500">Services</div>
          {services.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-zinc-500">No services published on this page yet.</p>
          ) : (
            <div className="divide-y divide-white/5">
              {services.map(({ monitor, daily }) => (
                <div key={monitor.id} className="px-5 py-4">
                  <div className="flex items-center gap-2.5">
                    <StatusDot status={monitor.stats.status} size="sm" />
                    <p className="text-[15px] font-medium text-white">{monitor.name}</p>
                    <span className="ml-auto">
                      <StatusBadge status={monitor.stats.status} />
                    </span>
                  </div>
                  <div className="mt-2.5 pl-5"><UptimeBars days={daily} height={28} /></div>
                  <div className="mt-1.5 flex justify-between pl-5 font-mono text-xs text-zinc-600">
                    <span>90 days ago</span>
                    <span>{monitor.stats.uptime90 == null ? "No data yet" : `${monitor.stats.uptime90}% uptime`}{monitor.stats.avgMs != null && ` · ${monitor.stats.avgMs} ms avg`}</span>
                    <span>Today</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 rounded-2xl border border-white/10 bg-zinc-900/60 p-5 sm:p-6">
          <h2 className="font-mono text-xs uppercase tracking-[0.12em] text-zinc-500">Recent incidents</h2>
          {recent.length === 0 ? (
            <p className="mt-2 text-sm text-zinc-500">No incidents recorded. That&apos;s a good sign.</p>
          ) : (
            <div className="mt-4 space-y-4">
              {recent.map((inc) => (
                <article key={inc.id} className="rounded-xl border border-white/10 bg-zinc-950/60 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${inc.status === "resolved" ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300" : "border-amber-500/25 bg-amber-500/10 text-amber-300"}`}>
                      {inc.status}
                    </span>
                    <h3 className="text-sm font-semibold text-white">{inc.title}</h3>
                  </div>
                  <p className="mt-2 text-[13px] leading-relaxed text-zinc-400">{inc.description}</p>
                  <div className="mt-3 space-y-2.5 border-t border-white/10 pt-3">
                    {inc.updates.slice(-2).map((u) => (
                      <div key={u.id} className="text-[13px]">
                        <p className="font-medium capitalize text-zinc-300">{u.status} <span className="ml-1 font-mono font-normal text-zinc-600">{new Date(u.createdAt).toUTCString()}</span></p>
                        <p className="mt-0.5 text-zinc-400">{u.message}</p>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <p className="mt-6 text-center font-mono text-xs text-zinc-600">POWERED BY <span className="font-semibold text-zinc-400">STATCHECK</span></p>
      </div>
    </div>
  );
}
