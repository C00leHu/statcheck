import Link from "next/link";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/DashboardShell";
import { Panel, Button } from "@/components/ui";
import { StatusDot } from "@/components/Status";
import { DeletePageButton } from "@/components/DeletePageButton";
import { getSessionUser } from "@/lib/auth/session";
import { listStatusPages } from "@/lib/monitor/content";
import { listMonitors } from "@/lib/monitor/monitors";

export const metadata = { title: "Status Pages" };
export const dynamic = "force-dynamic";

export default function PagesPage() {
  const user = getSessionUser();
  if (!user) redirect("/login");
  const pages = listStatusPages(user.id);
  const monitors = listMonitors(user.id);
  const nameOf = (id: string) => monitors.find((m) => m.id === id)?.name ?? "Removed monitor";

  return (
    <DashboardShell title="Status Pages" sub={pages.length === 0 ? "Nothing published yet." : `${pages.length} ${pages.length === 1 ? "page" : "pages"} published.`}>
      <Panel className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5">
          <p className="font-mono text-xs uppercase tracking-[0.12em] text-zinc-500">Public pages</p>
          <Button href="/dashboard/pages/new" size="sm" variant="light">New status page</Button>
        </div>
        {pages.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm font-medium text-white">No status pages yet</p>
            <p className="mx-auto mt-1 max-w-sm text-[13px] text-zinc-500">Publish a page and share one link where users can always see your current status.</p>
            <div className="mt-4"><Button href="/dashboard/pages/new" size="sm" variant="light">Create your first page</Button></div>
          </div>
        ) : (
          <ul className="divide-y divide-white/5">
            {pages.map((p) => (
              <li key={p.id} className="flex items-center gap-3 px-5 py-4">
                <StatusDot status="operational" size="sm" pulse={false} />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white">{p.name}</p>
                  <p className="truncate font-mono text-xs text-zinc-500">/s/{p.slug} · {p.monitorIds.map(nameOf).join(", ") || "no services"}</p>
                </div>
                <span className="ml-auto flex shrink-0 gap-2">
                  <Link href={`/s/${p.slug}`} className="rounded-lg border border-white/10 px-3 py-1.5 text-[13px] text-zinc-300 transition-colors hover:border-white/25 hover:text-white">View live</Link>
                  <DeletePageButton pageId={p.id} pageName={p.name} />
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </DashboardShell>
  );
}
