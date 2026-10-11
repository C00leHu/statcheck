"use client";
import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/DashboardShell";
import { Panel, Button } from "@/components/ui";
import { StatusDot } from "@/components/Status";
import { cn } from "@/lib/utils";

const STATES = ["investigating", "identified", "monitoring", "resolved"] as const;

interface Update {
  id: number;
  status: string;
  message: string;
  createdAt: string;
}

interface Incident {
  id: string;
  title: string;
  description: string;
  status: string;
  monitorIds: string[];
  createdAt: string;
  updatedAt: string;
  updates: Update[];
}

interface MonitorOpt {
  id: string;
  name: string;
}

const input =
  "w-full rounded-lg border border-white/10 bg-zinc-950 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/15";

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [monitors, setMonitors] = useState<MonitorOpt[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [status, setStatus] = useState<(typeof STATES)[number]>("investigating");
  const [services, setServices] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [openComposer, setOpenComposer] = useState<string | null>(null);
  const [updStatus, setUpdStatus] = useState<(typeof STATES)[number]>("monitoring");
  const [updMsg, setUpdMsg] = useState("");
  const [updError, setUpdError] = useState("");

  const load = async () => {
    const [ir, mr] = await Promise.all([fetch("/api/incidents"), fetch("/api/monitors")]);
    if (ir.ok) {
      const d = await ir.json();
      setIncidents(d.incidents ?? []);
    }
    if (mr.ok) {
      const d = await mr.json();
      setMonitors((d.monitors ?? []).map((m: { id: string; name: string }) => ({ id: m.id, name: m.name })));
    }
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const toggle = (id: string) => setServices((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), description: desc.trim(), status, monitorIds: services }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Couldn't create the incident.");
        return;
      }
      setIncidents((p) => [data.incident, ...p]);
      setTitle("");
      setDesc("");
      setStatus("investigating");
      setServices([]);
    } finally {
      setSaving(false);
    }
  };

  const postUpdate = async (incidentId: string) => {
    setUpdError("");
    const res = await fetch(`/api/incidents/${incidentId}/updates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: updStatus, message: updMsg.trim() }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setUpdError(typeof data.error === "string" ? data.error : "Couldn't post the update.");
      return;
    }
    setIncidents((p) => p.map((i) => (i.id === incidentId ? data.incident : i)));
    setOpenComposer(null);
    setUpdMsg("");
  };

  const list = incidents.filter((i) => filter === "all" || i.status === filter);
  const nameOf = (id: string) => monitors.find((m) => m.id === id)?.name ?? "Removed monitor";

  return (
    <DashboardShell title="Incidents" sub="Open incidents, post updates, and keep a public timeline.">
      {loading ? (
        <div className="space-y-4">
          {[0, 1].map((i) => (
            <Panel key={i} className="animate-pulse p-5"><div className="h-4 w-1/3 rounded bg-white/10" /><div className="mt-3 h-3 w-full rounded bg-white/5" /></Panel>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
          <div>
            <div className="mb-3 flex flex-wrap gap-2">
              {["all", ...STATES].map((s) => (
                <button key={s} onClick={() => setFilter(s)} className={cn("rounded-full border px-3 py-1.5 text-[13px] font-medium capitalize transition-colors", filter === s ? "border-white bg-white text-zinc-950" : "border-white/10 bg-transparent text-zinc-400 hover:border-white/25 hover:text-white")}>{s === "all" ? "All" : s}</button>
              ))}
            </div>
            {list.length === 0 ? (
              <Panel className="p-10 text-center">
                <p className="font-medium text-white">{incidents.length === 0 ? "No incidents yet" : "Nothing with this status"}</p>
                <p className="mx-auto mt-1 max-w-sm text-sm text-zinc-500">
                  {incidents.length === 0
                    ? "When something breaks, open an incident here. It appears on your status pages instantly."
                    : "Incidents with other statuses are hidden by the filter."}
                </p>
              </Panel>
            ) : (
              <div className="space-y-4">
                {list.map((inc) => (
                  <Panel key={inc.id} className="p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium capitalize", inc.status === "resolved" ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300" : "border-amber-500/25 bg-amber-500/10 text-amber-300")}>
                        <StatusDot status={inc.status === "resolved" ? "operational" : "degraded"} size="sm" pulse={false} />{inc.status}
                      </span>
                      <h2 className="text-[15px] font-semibold text-white">{inc.title}</h2>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-400">{inc.description}</p>
                    {inc.monitorIds.length > 0 && (
                      <p className="mt-2 font-mono text-xs text-zinc-600">Affected: {inc.monitorIds.map(nameOf).join(", ")}</p>
                    )}
                    <div className="ml-1 mt-4 space-y-4 border-l-2 border-white/10">
                      {inc.updates.map((u) => (
                        <div key={u.id} className="relative pl-5">
                          <span className={cn("absolute -left-[5px] top-1.5 h-2 w-2 rounded-full", u.status === "resolved" ? "bg-emerald-400" : "bg-amber-400")} />
                          <p className="text-[13px] font-semibold capitalize text-zinc-200">{u.status} <span className="ml-1 font-normal text-zinc-500">{new Date(u.createdAt).toUTCString()}</span></p>
                          <p className="mt-0.5 text-[13px] text-zinc-400">{u.message}</p>
                        </div>
                      ))}
                    </div>
                    {openComposer === inc.id ? (
                      <div className="mt-4 space-y-3 rounded-xl bg-white/[0.03] p-4">
                        <div className="flex flex-wrap gap-2">
                          {STATES.map((s) => (
                            <button key={s} type="button" onClick={() => setUpdStatus(s)} className={cn("rounded-lg border px-3 py-1.5 text-[13px] capitalize", updStatus === s ? "border-white bg-white text-zinc-950" : "border-white/10 text-zinc-400 hover:text-white")}>{s}</button>
                          ))}
                        </div>
                        <textarea value={updMsg} onChange={(e) => setUpdMsg(e.target.value)} rows={3} placeholder="What changed? What should users expect next?" className={input} />
                        {updError && <p className="text-[13px] text-red-300" role="alert">{updError}</p>}
                        <div className="flex gap-2">
                          <Button size="sm" variant="light" onClick={() => void postUpdate(inc.id)}>Post update</Button>
                          <Button size="sm" variant="outlineDark" onClick={() => setOpenComposer(null)}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4">
                        <Button size="sm" variant="outlineDark" onClick={() => { setOpenComposer(inc.id); setUpdStatus(inc.status === "resolved" ? "monitoring" : (inc.status as (typeof STATES)[number])); setUpdMsg(""); setUpdError(""); }}>
                          Post an update
                        </Button>
                      </div>
                    )}
                  </Panel>
                ))}
              </div>
            )}
          </div>
          <div>
            <Panel className="p-5 lg:sticky lg:top-20">
              <h2 className="text-[15px] font-semibold text-white">New incident</h2>
              <p className="mt-1 text-[13px] text-zinc-500">Opens immediately and appears on your status pages.</p>
              <form onSubmit={submit} className="mt-4 space-y-4" noValidate>
                <label className="block">
                  <span className="mb-1.5 block text-[13px] font-medium text-zinc-300">Title</span>
                  <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Elevated API error rate" className={input} />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[13px] font-medium text-zinc-300">Description</span>
                  <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={4} placeholder="What is happening, who is affected, what are you doing about it?" className={input} />
                </label>
                <div>
                  <span className="mb-1.5 block text-[13px] font-medium text-zinc-300">Affected services</span>
                  {monitors.length === 0 ? (
                    <p className="text-[13px] text-zinc-500">No monitors yet — the incident will list no affected services.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {monitors.map((m) => (
                        <button type="button" key={m.id} onClick={() => toggle(m.id)} aria-pressed={services.includes(m.id)} className={cn("rounded-lg border px-3 py-1.5 text-[13px] transition-colors", services.includes(m.id) ? "border-white bg-white text-zinc-950" : "border-white/10 text-zinc-400 hover:border-white/25 hover:text-white")}>{m.name}</button>
                      ))}
                    </div>
                  )}
                </div>
                <label className="block">
                  <span className="mb-1.5 block text-[13px] font-medium text-zinc-300">Status</span>
                  <select value={status} onChange={(e) => setStatus(e.target.value as (typeof STATES)[number])} className="w-full rounded-lg border border-white/10 bg-zinc-950 px-3.5 py-2.5 text-sm capitalize text-white focus:border-emerald-400 focus:outline-none">
                    {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </label>
                {error && <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-[13px] text-red-300" role="alert">{error}</p>}
                <Button type="submit" loading={saving} variant="light" className="w-full">{saving ? "Creating…" : "Create incident"}</Button>
              </form>
            </Panel>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
