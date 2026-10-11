"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Overview", icon: "M3 12l9-9 9 9M5 10v10a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V10" },
  { href: "/dashboard/monitors", label: "Monitors", icon: "M3 12a9 9 0 1018 0 9 9 0 00-18 0zm9-4v4l3 2" },
  { href: "/dashboard/pages", label: "Status Pages", icon: "M3 12h18M12 3v18" },
  { href: "/dashboard/incidents", label: "Incidents", icon: "M12 9v4m0 4h.01M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" },
  { href: "/dashboard/notifications", label: "Notifications", icon: "M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 00-4-5.7V5a2 2 0 10-4 0v.3A6 6 0 006 11v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" },
  { href: "/dashboard/team", label: "Team", icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m22 0v-2a4 4 0 00-3-3.9M16 3.1a4 4 0 010 7.8M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
  { href: "/dashboard/settings", label: "Settings", icon: "M4 21v-7m0-4V3m8 18v-9m0-4V3m8 18v-5m0-4V3M1 14h6m2-6h6m2 8h6" },
];

export function DashboardShell({ children, title, sub }: { children: React.ReactNode; title: string; sub?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.user) setUser(d.user);
      })
      .catch(() => {});
  }, []);

  const signOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6">
        {/* Top bar */}
        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-zinc-900/60 px-4 py-3">
          <Link href="/" className="md:hidden"><Logo dark compact /></Link>
          <button className="md:hidden rounded-lg p-1.5 text-zinc-400 hover:bg-white/5 hover:text-white" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle dashboard menu">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <div className="hidden md:block"><Logo dark /></div>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/status/demo" className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-[13px] text-zinc-400 transition-colors hover:border-white/25 hover:text-white">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> View status page
            </Link>
            <span
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-xs font-semibold text-zinc-950"
              title={user ? `${user.name} (${user.email})` : "Your account"}
            >
              {user ? user.name.charAt(0).toUpperCase() : "–"}
            </span>
            <button
              onClick={signOut}
              title="Sign out"
              aria-label="Sign out"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-white/5 hover:text-white"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" /></svg>
            </button>
          </div>
        </div>
        <div className="mt-4 grid gap-5 md:grid-cols-[220px_1fr]">
          {/* Sidebar */}
          <aside className={cn("md:block", mobileOpen ? "block" : "hidden")}>
            <nav className="rounded-xl border border-white/10 bg-zinc-900/60 p-2 md:sticky md:top-20" aria-label="Dashboard">
              {nav.map((n) => {
                const active = pathname === n.href || (n.href !== "/dashboard" && pathname?.startsWith(n.href));
                return (
                  <Link
                    key={n.href}
                    href={n.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors",
                      active ? "bg-white font-medium text-zinc-950" : "text-zinc-400 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={n.icon} /></svg>
                    {n.label}
                  </Link>
                );
              })}
              <div className="mt-2 border-t border-white/10 p-3">
                <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-zinc-600">Workspace</p>
                <p className="mt-1 inline-flex rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-300">Beta · free</p>
                {user && <p className="mt-2 truncate font-mono text-xs text-zinc-500" title={user.email}>{user.email}</p>}
              </div>
            </nav>
          </aside>
          {/* Content */}
          <div className="min-w-0">
            <div className="mb-4">
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">{title}</h1>
              {sub && <p className="mt-1 text-sm text-zinc-500">{sub}</p>}
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
