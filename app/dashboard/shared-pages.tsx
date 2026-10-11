"use client";
import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/DashboardShell";
import { Panel, Button } from "@/components/ui";

function Shell({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return <DashboardShell title={title} sub={sub}><Panel className="p-6">{children}</Panel></DashboardShell>;
}

export function NotificationsPage() {
  const [email, setEmail] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.settings) {
          setEmail(d.settings.email);
          setEnabled(d.settings.alertEmail);
        }
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  const toggle = async () => {
    const next = !enabled;
    setEnabled(next);
    setSaved(false);
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alertEmail: next }),
    });
    if (res.ok) setSaved(true);
  };

  if (!loaded) {
    return <Shell title="Notifications" sub="Where alerts will go."><p className="text-sm text-zinc-500">Loading…</p></Shell>;
  }
  return (
    <Shell title="Notifications" sub="Where alerts will go.">
      <div className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-[13px] leading-relaxed text-zinc-400">
        Alert sending isn&apos;t connected yet — nothing is emailed today. Your preference below is saved and takes effect automatically once sending launches.
      </div>
      <div className="mt-4 flex items-center gap-3">
        <span className={`h-2 w-2 rounded-full ${enabled ? "bg-emerald-400" : "bg-zinc-600"}`} />
        <div>
          <p className="text-sm font-medium text-white">Email alerts</p>
          <p className="font-mono text-xs text-zinc-500">{email || "your account email"}</p>
        </div>
        <button
          onClick={toggle}
          role="switch"
          aria-checked={enabled}
          aria-label="Email alerts"
          className={`ml-auto flex h-6 w-11 items-center rounded-full p-0.5 transition-colors ${enabled ? "bg-emerald-500" : "bg-zinc-700"}`}
        >
          <span className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${enabled ? "translate-x-5" : "translate-x-0"}`} />
        </button>
      </div>
      {saved && <p className="mt-3 text-[13px] text-emerald-300" role="status">Preference saved — applies once sending launches.</p>}
      <div className="mt-6 border-t border-white/10 pt-5">
        <WebhooksManager />
      </div>
    </Shell>
  );
}

interface WebhookItem {
  id: string;
  name: string;
  urlMasked: string;
  createdAt: string;
  lastDelivery: { event: string; ok: boolean; at: string } | null;
}

function WebhooksManager() {
  const [items, setItems] = useState<WebhookItem[]>([]);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [testMsg, setTestMsg] = useState<{ id: string; ok: boolean; text: string } | null>(null);

  const load = async () => {
    const r = await fetch("/api/webhooks");
    if (r.ok) {
      const d = await r.json();
      setItems(d.endpoints ?? []);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), url: url.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Couldn't add the webhook.");
        return;
      }
      setName("");
      setUrl("");
      await load();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    await fetch(`/api/webhooks/${id}`, { method: "DELETE" });
    setItems((p) => p.filter((w) => w.id !== id));
  };

  const test = async (id: string) => {
    setTesting(id);
    setTestMsg(null);
    try {
      const res = await fetch(`/api/webhooks/${id}/test`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      const d = data.delivery ?? {};
      setTestMsg({
        id,
        ok: res.ok && d.ok === true,
        text: res.ok && d.ok === true
          ? `Delivered (HTTP ${d.statusCode}). Check the channel.`
          : `Failed: ${typeof d.error === "string" ? d.error : typeof data.error === "string" ? data.error : `HTTP ${d.statusCode ?? "?"}`}`,
      });
      await load();
    } finally {
      setTesting(null);
    }
  };

  const input =
    "w-full rounded-lg border border-white/10 bg-zinc-950 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-emerald-400 focus:outline-none";

  return (
    <div>
      <p className="text-sm font-medium text-white">Alert webhooks</p>
      <p className="mt-1 text-[13px] leading-relaxed text-zinc-500">
        Discord, Slack, or any URL that accepts JSON. Fires on confirmed outages, recoveries, and incident updates —
        Discord and Slack get native formatting, everything else gets JSON.
      </p>
      {items.length > 0 && (
        <ul className="mt-4 space-y-2">
          {items.map((w) => (
            <li key={w.id} className="rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <span className={`h-2 w-2 shrink-0 rounded-full ${!w.lastDelivery ? "bg-zinc-600" : w.lastDelivery.ok ? "bg-emerald-400" : "bg-red-400"}`} title={w.lastDelivery ? `Last: ${w.lastDelivery.event} · ${w.lastDelivery.ok ? "delivered" : "failed"}` : "Never fired"} />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white">{w.name}</p>
                  <p className="truncate font-mono text-xs text-zinc-500">{w.urlMasked}</p>
                </div>
                <span className="ml-auto flex shrink-0 gap-2">
                  <button onClick={() => void test(w.id)} disabled={testing === w.id} className="rounded-lg border border-white/10 px-3 py-1.5 text-[13px] text-zinc-300 transition-colors hover:border-white/25 hover:text-white disabled:opacity-60">
                    {testing === w.id ? "Sending…" : "Test"}
                  </button>
                  <button onClick={() => void remove(w.id)} className="rounded-lg border border-white/10 px-3 py-1.5 text-[13px] text-zinc-400 transition-colors hover:border-red-500/40 hover:text-red-300">
                    Delete
                  </button>
                </span>
              </div>
              {testMsg?.id === w.id && (
                <p className={`mt-2 text-[13px] ${testMsg.ok ? "text-emerald-300" : "text-red-300"}`} role="status">{testMsg.text}</p>
              )}
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={add} className="mt-4 space-y-3" noValidate>
        <div className="grid gap-3 sm:grid-cols-[180px_1fr]">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name — e.g. alerts" aria-label="Webhook name" className={input} />
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://discord.com/api/webhooks/… or https://hooks.slack.com/…" aria-label="Webhook URL" inputMode="url" spellCheck={false} className={`${input} font-mono`} />
        </div>
        {error && <p className="text-[13px] text-red-300" role="alert">{error}</p>}
        <Button type="submit" size="sm" variant="outlineDark" loading={saving}>{saving ? "Adding…" : "Add webhook"}</Button>
      </form>
    </div>
  );
}

export function TeamPage() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.user && setUser(d.user))
      .catch(() => {});
  }, []);

  return (
    <Shell title="Team" sub="Who has access to this account.">
      {user && (
        <div className="flex items-center gap-3 border-b border-white/10 py-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-xs font-semibold text-zinc-950">
            {user.name.charAt(0).toUpperCase()}
          </span>
          <div>
            <p className="text-sm font-medium text-white">{user.name}</p>
            <p className="font-mono text-xs text-zinc-500">{user.email}</p>
          </div>
          <span className="ml-auto rounded-full border border-white/10 px-2.5 py-1 font-mono text-xs text-zinc-400">OWNER</span>
        </div>
      )}
      <p className="mt-4 text-[13px] text-zinc-500">You&apos;re the only person on this account.</p>
    </Shell>
  );
}

export function SettingsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [freshCodes, setFreshCodes] = useState<string[] | null>(null);
  const [regenLoading, setRegenLoading] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.settings) {
          setName(d.settings.name);
          setEmail(d.settings.email);
        }
      })
      .catch(() => {});
    fetch("/api/auth/recovery-codes")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d && typeof d.remaining === "number") setRemaining(d.remaining);
      })
      .catch(() => {});
  }, []);

  const regenerate = async () => {
    setRegenLoading(true);
    try {
      const res = await fetch("/api/auth/recovery-codes", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (res.ok && Array.isArray(data.recoveryCodes)) {
        setFreshCodes(data.recoveryCodes as string[]);
        setRemaining(data.recoveryCodes.length);
      }
    } finally {
      setRegenLoading(false);
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaved(false);
    if (name.trim().length < 2) {
      setError("Name must be at least 2 characters.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) {
        setError("Couldn't save changes.");
        return;
      }
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    setDeleting(true);
    await fetch("/api/account", { method: "DELETE" });
    window.location.href = "/";
  };

  return (
    <DashboardShell title="Settings" sub="Account settings.">
      <div className="grid gap-4">
        <Panel className="p-6">
          <h2 className="text-[15px] font-semibold text-white">Profile</h2>
          <form onSubmit={save} className="mt-4 max-w-md space-y-4" noValidate>
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-medium text-zinc-300">Name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-white/10 bg-zinc-950 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-emerald-400 focus:outline-none" />
            </label>
            <div>
              <span className="mb-1.5 block text-[13px] font-medium text-zinc-300">Email</span>
              <p className="rounded-lg bg-white/[0.03] px-3.5 py-2.5 font-mono text-sm text-zinc-500">{email || "…"}</p>
              <p className="mt-1 font-mono text-xs text-zinc-600">Email cannot be changed after registration.</p>
            </div>
            {error && <p className="text-[13px] text-red-300" role="alert">{error}</p>}
            {saved && <p className="text-[13px] text-emerald-300" role="status">Saved.</p>}
            <Button type="submit" size="sm" variant="light" loading={saving}>{saving ? "Saving…" : "Save changes"}</Button>
          </form>
        </Panel>
        <Panel className="p-6">
          <h2 className="text-[15px] font-semibold text-white">Recovery codes</h2>
          {freshCodes ? (
            <div className="mt-4 max-w-md">
              <p className="text-[13px] text-zinc-400">Your old codes no longer work. Save these now — they won&apos;t be shown again.</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {freshCodes.map((c) => (
                  <code key={c} className="rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-center font-mono text-sm tracking-wider text-white">{c}</code>
                ))}
              </div>
              <div className="mt-3"><Button size="sm" variant="outlineDark" onClick={() => setFreshCodes(null)}>Done — I&apos;ve saved them</Button></div>
            </div>
          ) : (
            <>
              <p className="mt-1 max-w-md text-[13px] text-zinc-500">
                {remaining == null ? "Loading…" : `${remaining} unused ${remaining === 1 ? "code" : "codes"} left.`} Each code resets
                your password once. Regenerating burns all existing codes.
              </p>
              <div className="mt-4"><Button size="sm" variant="outlineDark" loading={regenLoading} onClick={regenerate}>{regenLoading ? "Generating…" : "Generate new codes"}</Button></div>
            </>
          )}
        </Panel>
        <Panel className="border-red-500/25 p-6">
          <h2 className="text-[15px] font-semibold text-red-300">Danger zone</h2>
          <p className="mt-1 max-w-md text-[13px] text-zinc-500">Deleting your account permanently removes your monitors, checks, incidents, and status pages.</p>
          {!confirmingDelete ? (
            <div className="mt-4"><Button variant="outlineDark" size="sm" onClick={() => setConfirmingDelete(true)}>Delete account…</Button></div>
          ) : (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-[13px] font-medium text-red-200">This cannot be undone. Delete everything?</span>
              <button onClick={remove} disabled={deleting} className="rounded-lg bg-red-500 px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-red-400 disabled:opacity-60">
                {deleting ? "Deleting…" : "Yes, delete everything"}
              </button>
              <button onClick={() => setConfirmingDelete(false)} className="rounded-lg border border-white/10 px-3.5 py-2 text-[13px] text-zinc-300">Cancel</button>
            </div>
          )}
        </Panel>
      </div>
    </DashboardShell>
  );
}
