"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/DashboardShell";
import { Panel, Button } from "@/components/ui";

const input =
  "w-full rounded-lg border border-white/10 bg-zinc-950 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-emerald-400 focus:outline-none";

export default function NewStatusPage() {
  const router = useRouter();
  const [monitors, setMonitors] = useState<{ id: string; name: string; target: string }[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/monitors")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const list = (d?.monitors ?? []).map((m: { id: string; name: string; target: string }) => ({ id: m.id, name: m.name, target: m.target }));
        setMonitors(list);
        setSelected(list.map((m: { id: string }) => m.id));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!slugTouched) setSlug(name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40));
  }, [name, slugTouched]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/status-pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), slug, description: "", monitorIds: selected }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Couldn't create the page.");
        return;
      }
      router.push(`/s/${data.page.slug}`);
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardShell title="New status page" sub="Publish a public page for your services.">
      <Panel className="max-w-xl p-6">
        <form onSubmit={submit} className="space-y-4" noValidate>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-zinc-300">Page name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Acme Status" className={input} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-zinc-300">Public URL</span>
            <span className="flex items-center overflow-hidden rounded-lg border border-white/10 bg-zinc-950 focus-within:border-emerald-400">
              <span className="bg-white/[0.04] px-3 py-2.5 font-mono text-sm text-zinc-500">/s/</span>
              <input value={slug} onChange={(e) => { setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")); setSlugTouched(true); }} placeholder="acme-status" className="w-full bg-transparent px-3 py-2.5 font-mono text-sm text-white placeholder:text-zinc-600 focus:outline-none" />
            </span>
          </label>
          <div>
            <span className="mb-1.5 block text-[13px] font-medium text-zinc-300">Monitors to display</span>
            {monitors.length === 0 ? (
              <p className="text-sm text-zinc-500">No monitors yet — create one first, then come back.</p>
            ) : (
              <div className="space-y-2">
                {monitors.map((m) => (
                  <label key={m.id} className="flex cursor-pointer items-center gap-3 rounded-lg border border-white/10 bg-zinc-950/60 px-3.5 py-2.5 text-sm transition-colors hover:border-white/25">
                    <input type="checkbox" checked={selected.includes(m.id)} onChange={() => setSelected((p) => (p.includes(m.id) ? p.filter((x) => x !== m.id) : [...p, m.id]))} className="h-4 w-4 accent-emerald-400" />
                    <span className="font-medium text-zinc-100">{m.name}</span>
                    <span className="ml-auto font-mono text-xs text-zinc-500">{m.target}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          {error && <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-[13px] text-red-300" role="alert">{error}</p>}
          <Button type="submit" loading={saving} variant="light">{saving ? "Publishing…" : "Publish status page"}</Button>
        </form>
      </Panel>
    </DashboardShell>
  );
}
