"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { MonitorForm } from "@/components/MonitorForm";
import { CodeBlock } from "@/components/CodeBlock";
import { StatusDot } from "@/components/Status";
import { HeroCanvas } from "@/components/HeroCanvas";
import { cn } from "@/lib/utils";

interface CreatedMonitor {
  id: string;
  name: string;
  type: string;
  target: string;
}

const STEPS = ["Welcome", "Add a monitor", "Status page", "Done"];

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-emerald-400">
      <span className="h-px w-6 bg-emerald-500" aria-hidden="true" />
      {children}
    </p>
  );
}

function Concept({ n, t, d }: { n: string; t: string; d: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5">
      <p className="font-mono text-xs text-emerald-400">{n}</p>
      <h3 className="mt-2 text-[16px] font-semibold text-white">{t}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">{d}</p>
    </div>
  );
}

export default function SetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [monitors, setMonitors] = useState<CreatedMonitor[]>([]);
  const [checkingId, setCheckingId] = useState<string | null>(null);
  const [checkResult, setCheckResult] = useState<{ ok: boolean; label: string; hint: string } | null>(null);

  // Status page state
  const [pageName, setPageName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [pageError, setPageError] = useState("");
  const [savingPage, setSavingPage] = useState(false);
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/monitors")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.monitors?.length) {
          setMonitors(d.monitors.map((m: CreatedMonitor) => ({ id: m.id, name: m.name, type: m.type, target: m.target })));
          setSelected(d.monitors.map((m: CreatedMonitor) => m.id));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!slugTouched) {
      setSlug(
        pageName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40)
      );
    }
  }, [pageName, slugTouched]);

  const skip = async () => {
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ onboardingDone: true }),
    }).catch(() => {});
    router.push("/dashboard");
    router.refresh();
  };

  const createMonitor = async (v: { name: string; type: string; target: string; intervalSeconds: number }): Promise<string | null> => {
    const res = await fetch("/api/monitors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(v),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return typeof data.error === "string" ? data.error : "Couldn't create the monitor.";
    const m = data.monitor as CreatedMonitor;
    setMonitors((p) => [...p, m]);
    setSelected((p) => [...p, m.id]);
    // Run the first check immediately so the user sees a real result.
    setCheckingId(m.id);
    setCheckResult(null);
    try {
      const cres = await fetch(`/api/monitors/${m.id}/check`, { method: "POST" });
      const cdata = await cres.json().catch(() => ({}));
      if (cres.ok && cdata.check) {
        const c = cdata.check as { ok: boolean; statusCode: number | null; ms: number | null; error?: string };
        setCheckResult(
          c.ok
            ? {
                ok: true,
                label: `Reachable${c.statusCode ? ` · HTTP ${c.statusCode}` : ""}${c.ms != null ? ` · ${c.ms} ms` : ""}`,
                hint: "This result is now stored as the first entry in this monitor's history. Future checks build the uptime bars and response graphs from here.",
              }
            : {
                ok: false,
                label: `Failed${c.error ? ` · ${c.error}` : ""}`,
                hint: "The target didn't answer. Double-check the URL or host:port above — a failing first check usually means a typo, not an outage.",
              }
        );
      } else {
        setCheckResult({ ok: false, label: "Check failed — verify the target and try again.", hint: "Nothing was stored for this attempt." });
      }
    } finally {
      setCheckingId(null);
    }
    return null;
  };

  const createPage = async (e: React.FormEvent) => {
    e.preventDefault();
    setPageError("");
    if (pageName.trim().length < 2) {
      setPageError("Give the page a name.");
      return;
    }
    if (!/^[a-z0-9-]{3,40}$/.test(slug)) {
      setPageError("URL must be 3–40 lowercase letters, numbers, or dashes.");
      return;
    }
    if (selected.length === 0) {
      setPageError("Select at least one monitor to display.");
      return;
    }
    setSavingPage(true);
    try {
      const res = await fetch("/api/status-pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: pageName.trim(), slug, description: "", monitorIds: selected }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setPageError(typeof data.error === "string" ? data.error : "Couldn't create the page.");
        return;
      }
      setCreatedSlug(slug);
      setStep(3);
      window.scrollTo({ top: 0 });
    } finally {
      setSavingPage(false);
    }
  };

  const go = (n: number) => {
    setStep(n);
    window.scrollTo({ top: 0 });
  };

  const input =
    "w-full rounded-lg border border-white/10 bg-zinc-900 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/15";
  const label = "mb-1.5 block text-[13px] font-medium text-zinc-300";

  return (
    <div className="noise relative min-h-screen overflow-hidden bg-zinc-950 text-white">
      <div className="bg-grid-dark absolute inset-0 [mask-image:radial-gradient(ellipse_75%_60%_at_50%_0%,black_25%,transparent_100%)]" aria-hidden="true" />
      <HeroCanvas className="absolute inset-0 h-full w-full opacity-40" />
      <div className="absolute -top-40 left-1/2 h-96 w-[720px] -translate-x-1/2 rounded-full bg-emerald-500/[0.12] blur-[120px]" aria-hidden="true" />

      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-12">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <Logo dark />
          <button onClick={skip} className="font-mono text-xs tracking-wide text-zinc-500 transition-colors hover:text-white">
            SKIP FOR NOW →
          </button>
        </div>

        {/* Progress */}
        <div className="mt-8 flex items-center gap-2" aria-label={`Step ${step + 1} of ${STEPS.length}`}>
          {STEPS.map((s, i) => (
            <div key={s} className="flex flex-1 flex-col gap-1.5">
              <span className={cn("hidden font-mono text-[11px] sm:block", i <= step ? "text-zinc-200" : "text-zinc-600")}>
                {i + 1}. {s}
              </span>
              <span
                className={cn(
                  "h-1 rounded-full transition-all duration-500",
                  i < step ? "bg-emerald-500" : i === step ? "bg-white" : "bg-white/10"
                )}
              />
            </div>
          ))}
        </div>

        <div key={step} className="step-enter mt-10">
          {step === 0 && (
            <div>
              <Eyebrow>Setup · Welcome</Eyebrow>
              <h1 className="mt-3 text-4xl sm:text-6xl font-semibold tracking-[-0.03em] leading-[1.02]">
                Let&apos;s get you <em className="font-display font-normal italic text-emerald-300">live.</em>
              </h1>
              <p className="mt-4 max-w-xl text-base sm:text-lg leading-relaxed text-zinc-400">
                StatCheck watches your services and shows their health on a public page.
                Three ideas to know — then we&apos;ll set each one up together.
              </p>
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <Concept n="01" t="Monitors" d="One thing you watch: a website, API, or server. Each monitor knows its target, type, and how often to check." />
                <Concept n="02" t="Checks" d="Scheduled requests against your targets. Every result is stored and becomes uptime history, graphs, and status." />
                <Concept n="03" t="Status pages" d="A public page at your own /s/ URL where anyone can see what's up — no sign-in required." />
              </div>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => go(1)}
                  className="btn-sheen inline-flex items-center justify-center rounded-xl bg-white px-8 py-3.5 text-[15px] font-semibold text-zinc-950 transition-all hover:bg-emerald-100 active:scale-[0.98]"
                >
                  Start setup →
                </button>
                <span className="self-center font-mono text-xs text-zinc-600">takes about 2 minutes</span>
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <Eyebrow>Step 2 of 4 · Monitors</Eyebrow>
              <h1 className="mt-3 text-4xl sm:text-5xl font-semibold tracking-[-0.03em] leading-[1.05]">
                What should we <em className="font-display font-normal italic text-emerald-300">watch?</em>
              </h1>
              <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-zinc-400">
                A monitor is a single target plus a schedule. Add your first one below — we&apos;ll run a real check
                immediately so you see exactly what StatCheck does with it.
              </p>

              <div className="mt-6 flex items-center gap-2 overflow-x-auto rounded-xl border border-white/10 bg-zinc-900/60 px-4 py-3 font-mono text-xs text-zinc-400">
                <span className="shrink-0 text-zinc-200">TARGET</span>
                <span aria-hidden="true" className="text-emerald-400">→</span>
                <span className="shrink-0 text-zinc-200">CHECK</span>
                <span aria-hidden="true" className="text-emerald-400">→</span>
                <span className="shrink-0 text-zinc-200">STATUS</span>
                <span className="ml-2 hidden sm:inline text-zinc-600">each result feeds uptime bars, graphs, and pages</span>
              </div>

              {monitors.length > 0 && (
                <div className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                  You already have {monitors.length} {monitors.length === 1 ? "monitor" : "monitors"} — add another, or{" "}
                  <button onClick={() => go(2)} className="font-medium underline underline-offset-2">continue →</button>
                </div>
              )}

              <div className="mt-6 rounded-2xl border border-white/10 bg-zinc-900/60 p-5 sm:p-6">
                <MonitorForm dark submitLabel="Create monitor" onSubmit={createMonitor} />
              </div>

              {(checkingId || checkResult) && (
                <div className="mt-4 rounded-2xl border border-white/10 bg-zinc-900/60 p-5" role="status">
                  {checkingId && (
                    <p className="flex items-center gap-2.5 text-sm text-zinc-300">
                      <svg className="h-4 w-4 animate-spin text-emerald-400" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
                        <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                      Running your first check — actually requesting the target…
                    </p>
                  )}
                  {checkResult && (
                    <div>
                      <div className="flex items-center gap-2.5">
                        <StatusDot status={checkResult.ok ? "operational" : "outage"} />
                        <p className="text-[15px] font-semibold">{checkResult.label}</p>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-zinc-400">{checkResult.hint}</p>
                      <div className="mt-4 flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => go(2)}
                          className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-[15px] font-semibold text-zinc-950 transition-all hover:bg-emerald-100 active:scale-[0.98]"
                        >
                          Continue to status page →
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div>
              <Eyebrow>Step 3 of 4 · Status page</Eyebrow>
              <h1 className="mt-3 text-4xl sm:text-5xl font-semibold tracking-[-0.03em] leading-[1.05]">
                Publish your <em className="font-display font-normal italic text-emerald-300">status page.</em>
              </h1>
              <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-zinc-400">
                One public link where anyone can see your health — no sign-in required. Visitors get overall status,
                per-service uptime bars, response times, and your incident history.
              </p>

              <form onSubmit={createPage} className="mt-6 space-y-4 rounded-2xl border border-white/10 bg-zinc-900/60 p-5 sm:p-6" noValidate>
                <label className="block">
                  <span className={label}>Page name</span>
                  <input value={pageName} onChange={(e) => setPageName(e.target.value)} placeholder="Acme Status" className={input} />
                  <span className="mt-1.5 block text-xs text-zinc-500">Shown as the page title. You can rename it later.</span>
                </label>
                <label className="block">
                  <span className={label}>Public URL</span>
                  <span className="flex items-center overflow-hidden rounded-lg border border-white/10 bg-zinc-950 focus-within:border-emerald-400">
                    <span className="bg-white/[0.04] px-3 py-2.5 font-mono text-sm text-zinc-500">/s/</span>
                    <input value={slug} onChange={(e) => { setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")); setSlugTouched(true); }} placeholder="acme-status" className="w-full bg-transparent px-3 py-2.5 font-mono text-sm text-white placeholder:text-zinc-600 focus:outline-none" />
                  </span>
                  <span className="mt-1.5 block text-xs text-zinc-500">Lowercase letters, numbers, dashes. Unique across StatCheck — first come, first served.</span>
                </label>
                <div>
                  <span className={label}>Monitors to display</span>
                  {monitors.length === 0 ? (
                    <p className="text-sm text-zinc-400">No monitors yet. <button type="button" onClick={() => go(1)} className="underline underline-offset-2">Go back</button> and create one first.</p>
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
                  <span className="mt-1.5 block text-xs text-zinc-500">Only ticked monitors appear publicly. Incidents linked to them show up automatically.</span>
                </div>
                {pageError && <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-[13px] text-red-300" role="alert">{pageError}</p>}
                <div className="flex flex-col sm:flex-row gap-2">
                  <button type="button" onClick={() => go(1)} className="rounded-xl border border-white/20 px-6 py-3 text-[15px] font-medium text-white transition-colors hover:bg-white/5">← Back</button>
                  <button type="submit" disabled={savingPage} className="btn-sheen rounded-xl bg-white px-6 py-3 text-[15px] font-semibold text-zinc-950 transition-all hover:bg-emerald-100 active:scale-[0.98] disabled:opacity-60">
                    {savingPage ? "Publishing…" : "Publish status page"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {step === 3 && (
            <div className="text-center sm:text-left">
              <div className="flex justify-center sm:justify-start">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M20 6L9 17l-5-5" /></svg>
                </span>
              </div>
              <h1 className="mt-5 text-4xl sm:text-5xl font-semibold tracking-[-0.03em] leading-[1.05]">
                You&apos;re <em className="font-display font-normal italic text-emerald-300">live.</em>
              </h1>
              <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-zinc-400 sm:mx-0">
                {createdSlug ? (
                  <>Your status page is public at <Link href={`/s/${createdSlug}`} className="font-mono font-medium text-white underline underline-offset-2">/s/{createdSlug}</Link>. Share it anywhere.</>
                ) : (
                  <>Your monitors are set up.</>
                )}{" "}
                One last concept: checks only repeat on their own once something triggers them on schedule.
              </p>

              <div className="mt-6 rounded-2xl border border-white/10 bg-zinc-900/60 p-5 text-left">
                <p className="font-mono text-xs uppercase tracking-[0.16em] text-emerald-400">Automation · how it works</p>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  StatCheck doesn&apos;t run a background loop by itself. A scheduler calls the check endpoint every
                  minute, and every monitor whose interval has elapsed gets checked. Until then,{" "}
                  <span className="text-zinc-200">Run check now</span> on any monitor does the same thing on demand.
                </p>
                <div className="mt-4">
                  <CodeBlock
                    title="Run due checks every minute (cron)"
                    language="bash"
                    code={`curl -X POST https://YOUR-DOMAIN/api/cron/check \\
  -H "Authorization: Bearer $CRON_SECRET"`}
                  />
                </div>
                <p className="mt-2 font-mono text-xs text-zinc-600">CRON_SECRET lives in your environment. Wrong or missing secret → the endpoint refuses.</p>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => { router.push("/dashboard"); router.refresh(); }}
                  className="btn-sheen rounded-xl bg-white px-8 py-3.5 text-[15px] font-semibold text-zinc-950 transition-all hover:bg-emerald-100 active:scale-[0.98]"
                >
                  Open dashboard
                </button>
                {createdSlug && (
                  <Link href={`/s/${createdSlug}`} className="rounded-xl border border-white/20 px-8 py-3.5 text-center text-[15px] font-medium text-white transition-colors hover:bg-white/5">
                    View public page
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
