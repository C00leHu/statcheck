import { Reveal } from "@/components/Reveal";
import { Button, Card } from "@/components/ui";

export const metadata = { title: "Pricing" };

const freeFeats = [
  "Status pages on your own /s/ URLs",
  "HTTPS, HTTP & TCP monitors",
  "Check intervals from 1 minute",
  "90-day uptime bars from recorded checks",
  "Incidents with public timelines",
  "Everything included — no credit card",
];

const faqs = [
  { q: "Is it really free?", a: "Yes. StatCheck is free while the project is being structured — no credit card, no trial expiry, no feature gates. See the Legal Notice for details." },
  { q: "What happens when paid plans launch?", a: "We'll announce paid plans in advance. Your monitors, history, and status pages carry over — nothing gets deleted or locked behind a paywall overnight." },
  { q: "What counts as a monitor?", a: "One monitor is one check on one endpoint, for example HTTPS on api.example.com every few minutes." },
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14 sm:py-20">
      <Reveal>
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-emerald-700">Pricing</p>
          <h1 className="mt-2 text-3xl sm:text-5xl font-semibold tracking-tight">Free <em className="font-display font-normal italic">while we get started.</em></h1>
          <p className="mt-4 text-base sm:text-lg text-zinc-600">Every feature is free during the beta. Paid plans arrive later for custom domains, teams, and longer history.</p>
        </div>
      </Reveal>

      <Reveal className="mx-auto mt-12 max-w-xl">
        <Card className="relative border-zinc-900 p-8 shadow-card">
          <span className="absolute -top-3 left-8 rounded-full bg-zinc-900 px-3 py-1 text-xs font-medium text-white">Current plan</span>
          <h2 className="text-[15px] font-semibold">Free</h2>
          <p className="mt-3 flex items-baseline gap-2">
            <span className="text-5xl font-semibold tracking-tight">€0</span>
          </p>
          <p className="mt-1 text-[13px] text-zinc-500">free during the beta</p>
          <div className="mt-6"><Button href="/signup" className="w-full">Get started</Button></div>
          <ul className="mt-6 space-y-2.5 border-t border-zinc-100 pt-6">
            {freeFeats.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-zinc-700">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.4" className="mt-0.5 shrink-0"><path d="M20 6L9 17l-5-5" /></svg>{f}
              </li>
            ))}
          </ul>
        </Card>
      </Reveal>

      <Reveal className="mt-12">
        <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-3">
          {faqs.map((f) => (
            <Card key={f.q} className="p-5"><h3 className="text-[15px] font-semibold">{f.q}</h3><p className="mt-2 text-sm leading-relaxed text-zinc-600">{f.a}</p></Card>
          ))}
        </div>
      </Reveal>
    </div>
  );
}
