import { Reveal } from "@/components/Reveal";
import { Card } from "@/components/ui";
export const metadata = { title: "Changelog" };
const entries = [
  { v: "1.4.0", d: "Sep 28, 2026", items: ["TCP monitoring for game servers and custom ports", "Per-region response-time breakdown on monitor pages", "Faster 90-day uptime bars on public status pages"] },
  { v: "1.3.0", d: "Sep 10, 2026", items: ["Scheduled maintenance windows with subscriber notifications", "Incident update templates", "Discord notification channel"] },
  { v: "1.2.0", d: "Aug 22, 2026", items: ["Custom domains with automatic TLS", "White-label status pages on Business", "API tokens with per-project scopes"] },
  { v: "1.1.0", d: "Aug 02, 2026", items: ["Webhook deliveries with retry and signing", "p95/p99 latency on monitor details", "Improved mobile dashboard navigation"] },
];
export default function Page() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-14 sm:py-20">
      <Reveal><h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Changelog</h1><p className="mt-3 text-zinc-600">What shipped recently in StatCheck.</p></Reveal>
      <div className="mt-8 space-y-4">
        {entries.map((e, i) => (
          <Reveal key={e.v} delay={i * 60}><Card className="p-6"><div className="flex items-baseline gap-3"><span className="font-mono text-sm font-semibold">v{e.v}</span><span className="text-[13px] text-zinc-500">{e.d}</span></div><ul className="mt-3 space-y-1.5">{e.items.map((it) => <li key={it} className="flex gap-2 text-sm text-zinc-700"><span className="text-emerald-600">·</span>{it}</li>)}</ul></Card></Reveal>
        ))}
      </div>
    </div>
  );
}
