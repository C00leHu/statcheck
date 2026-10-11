import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { CountUp } from "@/components/CountUp";
import { UptimeBars, ResponseChart } from "@/components/charts";
import { StatusDot, StatusBadge } from "@/components/Status";
import { PulseLine, LiveTicker } from "@/components/Pulse";
import { HeroCanvas } from "@/components/HeroCanvas";
import { TelemetryBar } from "@/components/TelemetryBar";
import { Parallax, Tilt } from "@/components/effects";
import { generateUptimeDays, generateResponseSeries, monitors } from "@/lib/mock-data";

const heroServices = [
  { name: "Website", detail: "example.com", ms: 212 },
  { name: "API", detail: "api.example.com", ms: 142 },
  { name: "Discord Bot", detail: "gateway · TCP", ms: 96 },
  { name: "Game Server", detail: "play.example.com", ms: 41 },
];

function HeroPreviewDark() {
  const days = generateUptimeDays(42, 60);
  return (
    <div className="noise relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/90 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.7)]">
      <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-3.5">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
        </div>
        <span className="rounded-md bg-zinc-800 px-2.5 py-1 font-mono text-xs text-zinc-400">status.example.com</span>
        <span className="w-10" />
      </div>
      <div className="px-5 sm:px-6 py-6">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M20 6L9 17l-5-5" /></svg>
          </span>
          <div>
            <p className="text-[15px] font-semibold text-white">All systems operational</p>
            <p className="font-mono text-xs text-zinc-500">updated 38 seconds ago · 6/6 checks passing</p>
          </div>
          <span className="ml-auto hidden sm:block"><StatusBadge status="operational" /></span>
        </div>
        <div className="mt-5 divide-y divide-zinc-800 rounded-xl border border-zinc-800 bg-zinc-950/60">
          {heroServices.map((s) => (
            <div key={s.name} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-zinc-800/40">
              <StatusDot status="operational" size="sm" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-zinc-100">{s.name}</p>
                <p className="truncate font-mono text-xs text-zinc-500">{s.detail}</p>
              </div>
              <span className="ml-auto text-right">
                <span className="block text-[13px] font-medium text-emerald-400">Operational</span>
                <span className="block font-mono text-xs tabular-nums text-zinc-500">{s.ms} ms</span>
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between font-mono text-xs text-zinc-500">
            <span>90-day uptime</span>
            <span className="font-medium text-zinc-300">99.98%</span>
          </div>
          <UptimeBars days={days} height={34} />
        </div>
      </div>
    </div>
  );
}

const capabilities = [
  { id: "A.01", t: "Uptime monitoring", d: "HTTP, HTTPS, and TCP checks with intervals from 1 minute. Every check records status, latency, and history." },
  { id: "A.02", t: "Public status pages", d: "A clean, hosted status page for every project at your own /s/ URL. Order services your way, share one link." },
  { id: "A.03", t: "Incident management", d: "Create incidents, post structured updates, and keep a permanent timeline your users can trust." },
  { id: "A.04", t: "Uptime history", d: "90-day uptime bars computed from recorded checks. Gray days mean no data yet — never faked." },
  { id: "A.05", t: "Alert webhooks", d: "Outage and recovery alerts via Discord, Slack, or any JSON webhook — with per-endpoint delivery logs." },
  { id: "A.06", t: "Response-time tracking", d: "Every check records latency. Watch per-monitor graphs and averages to spot slowdowns early." },
  { id: "A.07", t: "API-first", d: "Every dashboard action runs through the same JSON API the UI uses — scriptable with your session." },
  { id: "A.08", t: "Multiple services", d: "Group monitors into services, projects, and pages. From one side project to your whole infrastructure." },
];

const steps = [
  { n: "01", t: "Add your services", d: "Websites, APIs, bots, game servers. Pick HTTP, ping, or TCP and an interval — the first check runs in seconds." },
  { n: "02", t: "StatCheck monitors them", d: "Checks run on your schedule — down to every minute via scheduler, or on demand. Webhooks fire the moment status flips." },
  { n: "03", t: "Users see real-time status", d: "Your public page updates instantly — uptime history, response times, incident timelines included." },
];

const specs = [
  { v: "3", l: "check types", s: "HTTPS, HTTP, TCP" },
  { v: "60s", l: "check intervals", s: "from 1 minute up" },
  { v: "90d", l: "uptime history", s: "on every page by default" },
  { v: "5 min", l: "to first page", s: "signup to published status" },
];

export default function Home() {
  const resp = generateResponseSeries(48, 142);
  const marqueeWords = ["UPTIME", "INCIDENTS", "STATUS PAGES", "MONITORING", "TRANSPARENCY"];
  const marquee = [...marqueeWords, ...marqueeWords, ...marqueeWords];
  const telemetryItems = ["API 200 · 142MS · FRA", "WEB 200 · 98MS · AMS", "BOT 200 · 41MS · FRA", "GAME 200 · 22MS · IAD", "CDN 200 · 31MS · SIN", "DB 200 · 9MS · FRA"];
  const telemetry = [...telemetryItems, ...telemetryItems, ...telemetryItems];
  return (
    <div className="bg-zinc-950 text-white">
      {/* ============ HERO ============ */}
      <section className="noise relative flex min-h-[100svh] flex-col overflow-hidden">
        <div className="bg-grid-dark absolute inset-0 [mask-image:radial-gradient(ellipse_80%_65%_at_50%_0%,black_25%,transparent_100%)]" aria-hidden="true" />
        <div className="hero-dots mask-fade-b absolute inset-0 opacity-60" aria-hidden="true" />
        <HeroCanvas className="absolute inset-0 h-full w-full opacity-80" />
        <div className="absolute -top-48 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-emerald-500/[0.13] blur-[130px]" aria-hidden="true" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-zinc-950 to-transparent" aria-hidden="true" />

        <div className="relative">
          <TelemetryBar />
        </div>

        <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-4 sm:px-6 pt-14 pb-10">
          <Reveal>
            <Link href="/status/demo" className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.04] px-4 py-1.5 font-mono text-xs tracking-wide text-zinc-300 backdrop-blur transition-colors hover:border-emerald-400/50 hover:text-white">
              <StatusDot status="operational" size="sm" />
              LIVE — 6/6 SYSTEMS OPERATIONAL
              <span aria-hidden="true" className="text-emerald-400">→</span>
            </Link>
          </Reveal>

          <Reveal delay={90}>
            <Parallax speed={0.06}>
              <h1 className="mt-7 text-[clamp(3.2rem,10vw,8.5rem)] font-semibold leading-[0.95] tracking-[-0.04em]">
                Know when
                <br />
                <em className="font-display font-normal italic tracking-[-0.01em] text-emerald-300">your services</em>
                <br />
                <span className="text-stroke">ARE DOWN.</span>
              </h1>
            </Parallax>
          </Reveal>

          <div className="mt-8 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <Reveal delay={170}>
              <p className="max-w-md text-base sm:text-lg leading-relaxed text-zinc-400">
                Monitor uptime, track incidents, and give your users a clear view of your service health with StatCheck.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Link href="/signup" className="btn-sheen inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-semibold text-zinc-950 transition-all hover:bg-emerald-100 active:scale-[0.98]">
                  Get started
                  <span aria-hidden="true">→</span>
                </Link>
                <Link href="/status/demo" className="inline-flex items-center justify-center rounded-xl border border-white/20 px-8 py-4 text-base font-medium text-white transition-colors hover:border-white/50 hover:bg-white/5">
                  View demo
                </Link>
              </div>
              <p className="mt-4 font-mono text-xs text-zinc-600">free for side projects · no credit card required</p>
            </Reveal>
            <Reveal delay={240}>
              <dl className="grid grid-cols-3 gap-6 border-l border-white/10 pl-6 md:text-right">
                {[
                  ["60s", "intervals"],
                  ["90d", "history"],
                  ["03", "check types"],
                ].map(([v, l]) => (
                  <div key={l}>
                    <dt className="text-2xl sm:text-3xl font-semibold tracking-tight tabular-nums">{v}</dt>
                    <dd className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-500">{l}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>

          <Reveal delay={300}>
            <div className="mt-12 flex items-center gap-3 font-mono text-[11px] tracking-[0.2em] text-zinc-600">
              <span className="h-px w-10 bg-zinc-700" aria-hidden="true" />
              SCROLL
              <span className="inline-block h-8 w-px animate-blink bg-emerald-400" aria-hidden="true" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ LIVE PREVIEW ============ */}
      <section className="relative border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24">
          <Reveal>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-emerald-400">01 — Live product</p>
            <h2 className="mt-3 max-w-2xl text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-[1.05] tracking-[-0.02em]">
              Your status page, <em className="font-display font-normal italic text-emerald-300">breathing.</em>
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
            <Reveal delay={100}>
              <Tilt>
                <HeroPreviewDark />
              </Tilt>
            </Reveal>
            <Reveal delay={180}>
              <div className="h-full rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
                <LiveTicker />
                <div className="mt-4 border-t border-zinc-800 pt-4">
                  <PulseLine className="h-10 w-full" stroke="#34d399" />
                  <p className="mt-2 text-center font-mono text-xs text-zinc-500">median interval · 60s · 3 regions</p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ MARQUEES ============ */}
      <div className="overflow-hidden border-y border-white/10 bg-zinc-950 py-5" aria-hidden="true">
        <div className="marquee-x flex w-max gap-10 hover:[animation-play-state:paused]">
          {marquee.map((word, i) => (
            <span key={i} className="flex items-center gap-10">
              <span className={`text-4xl sm:text-6xl font-semibold tracking-[-0.02em] ${i % 2 === 0 ? "text-transparent" : "text-white/[0.9]"}`} style={i % 2 === 0 ? { WebkitTextStroke: "1px rgba(255,255,255,0.35)" } : undefined}>
                {word}
              </span>
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
            </span>
          ))}
        </div>
      </div>
      <div className="overflow-hidden border-b border-white/10 bg-zinc-950 py-3" aria-hidden="true">
        <div className="marquee-x-rev flex w-max gap-8 hover:[animation-play-state:paused]">
          {telemetry.map((t, i) => (
            <span key={i} className="flex items-center gap-2 font-mono text-xs text-zinc-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500/70" />
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* ============ HOW IT WORKS ============ */}
      <section className="relative">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24">
          <Reveal>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-emerald-400">02 — How it works</p>
            <h2 className="mt-3 max-w-2xl text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-[1.05] tracking-[-0.02em]">
              Endpoint to status page <em className="font-display font-normal italic text-emerald-300">in minutes.</em>
            </h2>
          </Reveal>
          <div className="mt-10 border-t border-white/10">
            {steps.map((s, i) => (
              <Reveal key={s.n} delay={i * 80}>
                <div className="group grid gap-2 border-b border-white/10 py-8 transition-colors duration-300 hover:bg-white/[0.02] sm:grid-cols-[120px_1fr_1.2fr] sm:gap-6 sm:px-4">
                  <span className="font-mono text-sm text-emerald-400">/{s.n}</span>
                  <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight transition-transform duration-300 group-hover:translate-x-1">
                    {s.t}
                  </h3>
                  <p className="max-w-md text-[15px] leading-relaxed text-zinc-400">{s.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CAPABILITIES ============ */}
      <section className="relative border-t border-white/10 bg-zinc-900/40">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24">
          <Reveal>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-emerald-400">03 — Capabilities</p>
            <h2 className="mt-3 max-w-2xl text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-[1.05] tracking-[-0.02em]">
              Everything to <em className="font-display font-normal italic text-emerald-300">stay transparent.</em>
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {capabilities.map((c, i) => (
              <Reveal key={c.id} delay={(i % 4) * 70}>
                <div className="group h-full bg-zinc-950 p-6 transition-colors duration-300 hover:bg-zinc-900">
                  <p className="font-mono text-xs text-zinc-600 transition-colors group-hover:text-emerald-400">{c.id}</p>
                  <h3 className="mt-4 text-lg font-semibold tracking-tight">{c.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">{c.d}</p>
                  <span className="mt-5 block h-[2px] w-8 bg-zinc-800 transition-all duration-300 group-hover:w-full group-hover:bg-emerald-500" aria-hidden="true" />
                </div>
              </Reveal>
            ))}
          </div>
          <p className="mt-6 font-mono text-xs tracking-wide text-zinc-600">
            <span className="text-zinc-500">ON THE ROADMAP —</span> custom domains · API tokens · team seats · longer history · <span className="text-zinc-500">nothing here is sold or gated today</span>
          </p>
        </div>
      </section>

      {/* ============ SPECS ============ */}
      <section className="relative overflow-hidden border-t border-white/10">
        <div className="hero-dots absolute inset-0 opacity-40" aria-hidden="true" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24">
          <Reveal>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-emerald-400">04 — The spec</p>
          </Reveal>
          <div className="mt-8 grid grid-cols-2 gap-y-12 lg:grid-cols-4">
            {specs.map((s, i) => (
              <Reveal key={s.l} delay={i * 80}>
                <div className="border-l border-white/10 pl-6">
                  <p className="text-5xl sm:text-7xl font-semibold tracking-[-0.03em] tabular-nums">
                    <CountUp to={parseInt(s.v)} suffix={s.v.replace(/[0-9]/g, "")} decimals={0} />
                  </p>
                  <p className="mt-3 font-mono text-xs uppercase tracking-[0.16em] text-emerald-400">{s.l}</p>
                  <p className="mt-1 text-sm text-zinc-500">{s.s}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ DASHBOARD ============ */}
      <section className="relative border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <Reveal>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-emerald-400">05 — Dashboard</p>
              <h2 className="mt-3 text-[clamp(2rem,5vw,3.25rem)] font-semibold leading-[1.05] tracking-[-0.02em]">
                A dashboard you&apos;ll <em className="font-display font-normal italic text-emerald-300">actually open.</em>
              </h2>
              <p className="mt-4 max-w-md text-[15px] leading-relaxed text-zinc-400">Overall uptime, response times, active incidents, every monitor — one calm view. No noise, just signal.</p>
              <ul className="mt-6 space-y-3">
                {["Overall uptime with 90-day trend", "Per-monitor response-time graphs", "Incident timeline with status history"].map((t) => (
                  <li key={t} className="flex items-center gap-2.5 font-mono text-[13px] text-zinc-300">
                    <span className="text-emerald-400">▸</span>
                    {t}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-6 py-3 text-[15px] font-medium transition-colors hover:border-emerald-400/60 hover:bg-emerald-500/10">
                  Explore the dashboard <span aria-hidden="true">→</span>
                </Link>
              </div>
            </Reveal>
            <Reveal delay={120}>
              <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/80 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.7)]">
                <div className="border-b border-zinc-800 px-5 py-4">
                  <p className="text-sm font-semibold">Overview</p>
                  <p className="font-mono text-xs text-zinc-500">acme-api · last 24 hours</p>
                </div>
                <div className="grid grid-cols-3 divide-x divide-zinc-800 border-b border-zinc-800">
                  {[
                    { l: "Uptime", v: <CountUp to={99.98} suffix="%" />, s: "Last 90 days" },
                    { l: "Avg. response", v: <>142 ms</>, s: "p50 · 24h" },
                    { l: "Incidents", v: <>1</>, s: "Open now: 0" },
                  ].map((k) => (
                    <div key={k.l} className="px-4 py-4">
                      <p className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">{k.l}</p>
                      <p className="mt-1 text-lg font-semibold tracking-tight tabular-nums text-white">{k.v}</p>
                      <p className="text-xs text-zinc-500">{k.s}</p>
                    </div>
                  ))}
                </div>
                <div className="px-5 py-4">
                  <ResponseChart data={resp} height={130} />
                  <div className="mt-4 space-y-2">
                    {monitors.slice(0, 3).map((m) => (
                      <div key={m.id} className="flex items-center gap-2.5 rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-2.5">
                        <StatusDot status={m.status} size="sm" />
                        <span className="text-[13px] font-medium text-zinc-200">{m.name}</span>
                        <span className="ml-auto font-mono text-xs tabular-nums text-zinc-500">{m.responseTimeMs} ms</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ PRICING ============ */}
      <section className="relative border-t border-white/10 bg-zinc-900/40">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24">
          <Reveal>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-emerald-400">06 — Pricing</p>
            <h2 className="mt-3 max-w-xl text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-[1.05] tracking-[-0.02em]">
              Free <em className="font-display font-normal italic text-emerald-300">while we get started.</em>
            </h2>
            <p className="mt-3 max-w-xl text-[15px] text-zinc-400">Every feature is free during the beta. Paid plans arrive later.</p>
          </Reveal>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <Reveal>
              <div className="relative h-full rounded-2xl border border-emerald-500/60 bg-zinc-900 p-7 shadow-[0_0_60px_-18px_rgba(16,185,129,0.5)]">
                <p className="font-mono text-xs uppercase tracking-[0.16em] text-zinc-500">Free</p>
                <p className="mt-3 text-5xl font-semibold tracking-tight tabular-nums">€0</p>
                <p className="mt-1 text-[13px] text-zinc-500">free during the beta</p>
                <ul className="mt-6 space-y-2.5 border-t border-white/10 pt-6">
                  {["Status pages on your own URLs", "HTTPS, HTTP & TCP monitors", "Intervals from 1 minute", "Incidents with public timelines"].map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-zinc-300">
                      <span className="mt-0.5 text-emerald-400">+</span>{f}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className="btn-sheen mt-7 flex w-full items-center justify-center rounded-xl bg-emerald-400 px-4 py-3 text-[15px] font-medium text-zinc-950 transition-all hover:bg-emerald-300 active:scale-[0.98]">
                  Get started
                </Link>
              </div>
            </Reveal>
            <Reveal delay={100}>
              <div className="h-full rounded-2xl border border-white/10 bg-zinc-950 p-7">
                <p className="font-mono text-xs uppercase tracking-[0.16em] text-zinc-500">Later</p>
                <p className="mt-3 text-5xl font-semibold tracking-tight text-zinc-500">Real tiers</p>
                <p className="mt-1 text-[13px] text-zinc-500">only when they exist — no mock plans</p>
                <ul className="mt-6 space-y-2.5 border-t border-white/10 pt-6">
                  {["Custom domains", "Team members", "Longer history"].map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-zinc-500">
                      <span className="mt-0.5">·</span>{f}
                    </li>
                  ))}
                </ul>
                <Link href="/pricing" className="mt-7 flex w-full items-center justify-center rounded-xl border border-white/20 px-4 py-3 text-[15px] font-medium text-white transition-colors hover:border-white/50 hover:bg-white/5">
                  See what&apos;s planned
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="relative overflow-hidden border-t border-white/10">
        <HeroCanvas className="absolute inset-0 h-full w-full opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-transparent to-zinc-950" aria-hidden="true" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-24 sm:py-36 text-center">
          <Reveal>
            <PulseLine className="mx-auto h-12 w-full max-w-md" stroke="#34d399" />
            <h2 className="mx-auto mt-6 max-w-3xl text-[clamp(2.5rem,7vw,5.5rem)] font-semibold leading-[0.98] tracking-[-0.03em]">
              Give your users a reason to <em className="font-display font-normal italic text-emerald-300">trust your uptime.</em>
            </h2>
            <p className="mx-auto mt-5 max-w-md font-mono text-[13px] leading-relaxed text-zinc-500">first monitor → published page · under five minutes</p>
            <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/signup" className="btn-sheen inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-white px-10 py-4 text-base font-semibold text-zinc-950 transition-all hover:bg-emerald-100 active:scale-[0.98]">Get started</Link>
              <Link href="/status/demo" className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl border border-white/20 px-10 py-4 text-base font-medium text-white transition-colors hover:bg-white/5">View demo</Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
