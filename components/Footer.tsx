"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { StatusDot } from "./Status";
import { LiveClock } from "./Pulse";
import { openCookieSettings } from "./CookieConsent";

const cols = [
  { h: "Product", links: [ ["Features", "/features"], ["Pricing", "/pricing"], ["Status Pages", "/status/demo"], ["API", "/docs/api"] ] },
  { h: "Developers", links: [ ["Documentation", "/docs"], ["API Reference", "/docs/api"], ["Changelog", "/changelog"] ] },
  { h: "Company", links: [ ["About", "/about"], ["Contact", "/contact"] ] },
  { h: "Legal", links: [ ["Terms", "/terms"], ["Privacy", "/privacy"], ["Legal Notice", "/legal-notice"], ["Cookies", "/cookies"] ] },
];

export function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/dashboard")) return null;
  return (
    <footer className="overflow-hidden border-t border-white/10 bg-zinc-950 text-zinc-400">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-14">
        <div className="grid gap-10 md:grid-cols-[1.2fr_2fr]">
          <div>
            <Logo dark />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-zinc-500">
              Uptime monitoring and status pages for developers, startups, and small teams.
            </p>
            <Link href="/status/demo" className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 font-mono text-xs text-zinc-300 transition-colors hover:border-emerald-400/50">
              <StatusDot status="operational" size="sm" />
              ALL SYSTEMS OPERATIONAL · <LiveClock />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {cols.map((c) => (
              <div key={c.h}>
                <h3 className="font-mono text-xs font-medium uppercase tracking-[0.12em] text-zinc-600">{c.h}</h3>
                <ul className="mt-3 space-y-2.5">
                  {c.links.map(([label, href]) => (
                    <li key={href + label}>
                      <Link href={href} className="text-sm text-zinc-400 transition-colors hover:text-white">{label}</Link>
                    </li>
                  ))}
                  {c.h === "Legal" && (
                    <li>
                      <button onClick={openCookieSettings} className="text-sm text-zinc-400 transition-colors hover:text-white">
                        Cookie settings
                      </button>
                    </li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-white/10 pt-6">
          <p className="text-[13px] text-zinc-600">© 2026 StatCheck</p>
          <p className="font-display text-[15px] italic text-zinc-500">Know when your services are down.</p>
        </div>
        <div aria-hidden="true" className="pointer-events-none mt-4 select-none text-center font-semibold leading-[0.85] tracking-[-0.05em] text-white/[0.06] text-[22vw] md:text-[168px]">
          StatCheck
        </div>
      </div>
    </footer>
  );
}
