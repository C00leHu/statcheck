"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";

const TYPES = [
  { id: "https", label: "HTTPS", hint: "https://api.example.com/health", about: "Websites, APIs, anything with a URL." },
  { id: "http", label: "HTTP", hint: "http://192.168.1.10/status", about: "Plain-HTTP endpoints, local services." },
  { id: "tcp", label: "TCP", hint: "play.example.com:25565", about: "Game servers, databases, raw ports." },
];

const INTERVALS = [
  { sec: 60, label: "1 min" },
  { sec: 300, label: "5 min" },
  { sec: 900, label: "15 min" },
];

export interface MonitorFormValue {
  name: string;
  type: string;
  target: string;
  intervalSeconds: number;
}

export function MonitorForm({
  initial,
  submitLabel,
  onSubmit,
  dark = false,
}: {
  initial?: Partial<MonitorFormValue>;
  submitLabel: string;
  onSubmit: (v: MonitorFormValue) => Promise<string | null>;
  dark?: boolean;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [type, setType] = useState(initial?.type ?? "https");
  const [target, setTarget] = useState(initial?.target ?? "");
  const [interval, setInterval] = useState(initial?.intervalSeconds ?? 300);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const activeType = TYPES.find((t) => t.id === type) ?? TYPES[0];

  const label = dark ? "mb-1.5 block text-[13px] font-medium text-zinc-300" : "mb-1.5 block text-[13px] font-medium text-zinc-700";
  const input = dark
    ? "w-full rounded-lg border border-white/10 bg-zinc-900 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/15"
    : "w-full rounded-lg border border-zinc-200 px-3.5 py-2.5 text-sm placeholder:text-zinc-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/15";
  const hint = "mt-1.5 block text-xs text-zinc-500";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (name.trim().length < 2) {
      setError("Give the monitor a name of at least 2 characters.");
      return;
    }
    if (!target.trim()) {
      setError("Enter what to check.");
      return;
    }
    setSaving(true);
    try {
      const err = await onSubmit({ name: name.trim(), type, target: target.trim(), intervalSeconds: interval });
      if (err) setError(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <div>
        <span className={label}>Check type</span>
        <div className="grid grid-cols-3 gap-2">
          {TYPES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setType(t.id)}
              aria-pressed={type === t.id}
              title={t.about}
              className={cn(
                "rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors",
                type === t.id
                  ? dark
                    ? "border-emerald-400/60 bg-emerald-400/10 text-white"
                    : "border-zinc-900 bg-zinc-900 text-white"
                  : dark
                    ? "border-white/10 text-zinc-400 hover:border-white/30 hover:text-white"
                    : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <span className={hint}>{activeType.about}</span>
      </div>
      <label className="block">
        <span className={label}>Name</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Production API"
          className={input}
        />
      </label>
      <label className="block">
        <span className={label}>Target</span>
        <input
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder={activeType.hint}
          inputMode="url"
          className={cn(input, "font-mono")}
        />
        <span className={hint}>
          {type === "tcp" ? "Hostname and port — StatCheck opens a TCP connection." : "Full URL is best — the scheme is added automatically if missing."}
        </span>
      </label>
      <div>
        <span className={label}>Check interval</span>
        <div className="grid grid-cols-3 gap-2">
          {INTERVALS.map((iv) => (
            <button
              key={iv.sec}
              type="button"
              onClick={() => setInterval(iv.sec)}
              aria-pressed={interval === iv.sec}
              className={cn(
                "rounded-lg border px-3 py-2.5 font-mono text-sm transition-colors",
                interval === iv.sec
                  ? dark
                    ? "border-emerald-400/60 bg-emerald-400/10 text-white"
                    : "border-zinc-900 bg-zinc-900 text-white"
                  : dark
                    ? "border-white/10 text-zinc-400 hover:border-white/30 hover:text-white"
                    : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
              )}
            >
              {iv.label}
            </button>
          ))}
        </div>
        <span className={hint}>Automated checks run on this schedule once a scheduler calls the check endpoint.</span>
      </div>
      {error && <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-[13px] text-red-300" role="alert">{error}</p>}
      {dark ? (
        <button
          type="submit"
          disabled={saving}
          className="btn-sheen inline-flex w-full items-center justify-center rounded-xl bg-white px-6 py-3 text-[15px] font-semibold text-zinc-950 transition-all hover:bg-emerald-100 active:scale-[0.98] disabled:opacity-60 sm:w-auto"
        >
          {saving ? "Saving…" : submitLabel}
        </button>
      ) : (
        <button
          type="submit"
          disabled={saving}
          className="inline-flex w-full items-center justify-center rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-zinc-700 active:scale-[0.98] disabled:opacity-60 sm:w-auto"
        >
          {saving ? "Saving…" : submitLabel}
        </button>
      )}
    </form>
  );
}
