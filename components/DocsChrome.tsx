"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const docsNav = [
  { group: "Basics", items: [
    { href: "/docs", label: "Getting Started" },
    { href: "/docs/monitors", label: "Monitors" },
    { href: "/docs/status-pages", label: "Status Pages" },
    { href: "/docs/incidents", label: "Incidents" },
  ]},
  { group: "Reference", items: [
    { href: "/docs/api", label: "API" },
    { href: "/docs/notifications", label: "Notifications" },
  ]},
  { group: "Help", items: [
    { href: "/docs/troubleshooting", label: "Troubleshooting" },
  ]},
];

const searchIndex = [
  ...docsNav.flatMap((g) => g.items),
  { href: "/docs/api", label: "Sessions" },
  { href: "/docs/api", label: "Rate limits" },
];

export function DocsChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const results = q.trim() ? searchIndex.filter((i) => i.label.toLowerCase().includes(q.toLowerCase())).slice(0, 6) : [];
  const crumbs = pathname?.split("/").filter(Boolean) ?? [];
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
      <div className="mb-6 flex items-center gap-2 text-[13px] text-zinc-500" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-zinc-900">Home</Link>
        {crumbs.map((c, i) => (
          <span key={i} className="flex items-center gap-2"><span>/</span><span className={i === crumbs.length - 1 ? "text-zinc-900 font-medium capitalize" : "capitalize"}>{c.replace(/-/g, " ")}</span></span>
        ))}
      </div>
      <button onClick={() => setOpen(!open)} className="mb-4 w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-sm text-left md:hidden">Browse docs {open ? "▴" : "▾"}</button>
      <div className="grid gap-8 md:grid-cols-[240px_1fr]">
        <aside className={cn("md:block", open ? "block" : "hidden")}>
          <div className="md:sticky md:top-20 space-y-5">
            <div className="relative">
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search docs…" aria-label="Search docs" className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-sm placeholder:text-zinc-400 focus:border-emerald-600 focus:outline-none" />
              {results.length > 0 && (
                <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-pop">
                  {results.map((r) => <Link key={r.label + r.href} href={r.href} onClick={() => setQ("")} className="block px-3.5 py-2 text-sm hover:bg-zinc-50">{r.label}</Link>)}
                </div>
              )}
            </div>
            {docsNav.map((g) => (
              <div key={g.group}>
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{g.group}</p>
                <ul className="mt-2 space-y-0.5">
                  {g.items.map((it) => (
                    <li key={it.href + it.label}>
                      <Link href={it.href} onClick={() => setOpen(false)} className={cn("block rounded-lg px-3 py-2 text-sm transition-colors", pathname === it.href ? "bg-zinc-900 text-white font-medium" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900")}>{it.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </aside>
        <article className="min-w-0 max-w-none">{children}</article>
      </div>
    </div>
  );
}

export function DocH1({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div className="border-b border-zinc-200 pb-6">
      <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">{children}</h1>
      {sub && <p className="mt-2 text-[15px] leading-relaxed text-zinc-600">{sub}</p>}
    </div>
  );
}

export function DocH2({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-8 text-lg font-semibold tracking-tight">{children}</h2>;
}

export function DocP({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 text-[15px] leading-relaxed text-zinc-700">{children}</p>;
}
