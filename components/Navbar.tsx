"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { Button } from "./ui";
import { cn } from "@/lib/utils";

const productLinks = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/status/demo", label: "Live demo" },
  { href: "/docs", label: "Docs" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");
  if (isDashboard) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/85 backdrop-blur-md">
      <nav className="mx-auto flex h-[60px] max-w-6xl items-center justify-between px-4 sm:px-6" aria-label="Main">
        <Logo />
        <div className="hidden items-center gap-1 md:flex">
          <div className="group relative">
            <button className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900">
              Product
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform duration-200 group-hover:rotate-180"><path d="M6 9l6 6 6-6" /></svg>
            </button>
            <div className="invisible absolute left-0 top-full w-64 translate-y-1 rounded-xl border border-zinc-200 bg-white p-2 opacity-0 shadow-pop transition-all duration-200 group-hover:visible group-hover:translate-y-2 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-2 group-focus-within:opacity-100">
              {[
                { href: "/features", t: "Features", d: "Monitoring, incidents & status pages" },
                { href: "/pricing", t: "Pricing", d: "Plans for every stage" },
                { href: "/status/demo", t: "Live status page", d: "See a real public page" },
                { href: "/dashboard", t: "Dashboard", d: "Preview the app" },
              ].map((l) => (
                <Link key={l.href} href={l.href} className="block rounded-lg px-3 py-2.5 transition-colors hover:bg-zinc-50">
                  <span className="block text-sm font-medium text-zinc-900">{l.t}</span>
                  <span className="block text-[13px] text-zinc-500">{l.d}</span>
                </Link>
              ))}
            </div>
          </div>
          {productLinks.map((l) => (
            <Link key={l.href} href={l.href} className="rounded-lg px-3 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900">
              {l.label}
            </Link>
          ))}
        </div>
        <div className="hidden items-center gap-2 md:flex">
          <Link href="/login" className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900">
            Sign in
          </Link>
          <Button href="/signup" size="sm">Get started</Button>
        </div>
        <button
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-zinc-700 hover:bg-zinc-100 md:hidden"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label="Toggle menu"
        >
          <span className="relative block h-4 w-5">
            <span className={cn("absolute left-0 top-0 h-[1.8px] w-full bg-current transition-all duration-300", open && "top-[7px] rotate-45")} />
            <span className={cn("absolute left-0 top-[7px] h-[1.8px] w-full bg-current transition-all duration-300", open && "opacity-0")} />
            <span className={cn("absolute left-0 top-[14px] h-[1.8px] w-full bg-current transition-all duration-300", open && "top-[7px] -rotate-45")} />
          </span>
        </button>
      </nav>
      <div className={cn("grid overflow-hidden transition-all duration-300 md:hidden", open ? "grid-rows-[1fr] border-t border-zinc-100" : "grid-rows-[0fr]")}>
        <div className="min-h-0 overflow-hidden">
          <div className="space-y-1 px-4 py-4">
            {[ { href: "/features", label: "Features" }, { href: "/pricing", label: "Pricing" }, { href: "/status/demo", label: "Live demo" }, { href: "/docs", label: "Docs" }, { href: "/login", label: "Sign in" } ].map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 text-[15px] text-zinc-700 hover:bg-zinc-50">
                {l.label}
              </Link>
            ))}
            <div className="pt-2"><Button href="/signup" className="w-full">Get started</Button></div>
          </div>
        </div>
      </div>
    </header>
  );
}
