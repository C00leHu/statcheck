"use client";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/DashboardShell";
import { Panel } from "@/components/ui";
import { MonitorForm } from "@/components/MonitorForm";

export default function NewMonitorPage() {
  const router = useRouter();

  const create = async (v: { name: string; type: string; target: string; intervalSeconds: number }): Promise<string | null> => {
    const res = await fetch("/api/monitors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(v),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return typeof data.error === "string" ? data.error : "Couldn't create the monitor.";
    router.push(`/dashboard/monitors/${data.monitor.id}`);
    router.refresh();
    return null;
  };

  return (
    <DashboardShell title="New monitor" sub="Add a website, API, or server to watch.">
      <Panel className="max-w-xl p-6">
        <MonitorForm dark submitLabel="Create monitor" onSubmit={create} />
      </Panel>
    </DashboardShell>
  );
}
