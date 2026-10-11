"use client";
import { useEffect, useState } from "react";
import { LiveClock } from "./Pulse";

const REGIONS = [
  { id: "FRA", base: 12, className: "" },
  { id: "AMS", base: 18, className: "" },
  { id: "IAD", base: 86, className: "hidden md:inline" },
  { id: "SIN", base: 164, className: "hidden lg:inline" },
];

/** Mission-control status strip: live region latencies, clock, nominal indicator. */
export function TelemetryBar() {
  const [ms, setMs] = useState(REGIONS.map((r) => r.base));

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      setMs(REGIONS.map((r) => Math.max(4, Math.round(r.base + (Math.random() * 10 - 5)))));
    }, 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative border-b border-white/10">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 sm:px-6 py-2 font-mono text-[11px] tracking-wider text-zinc-500">
        <span className="inline-flex items-center gap-1.5 text-emerald-400">
          <span className="animate-blink inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
          SYS.NOMINAL
        </span>
        <span className="hidden sm:inline text-zinc-700">/</span>
        {REGIONS.map((r, i) => (
          <span key={r.id} className={r.className}>
            {r.id} <span className="text-zinc-300 tabular-nums">{ms[i]}ms</span>
          </span>
        ))}
        <span className="ml-auto text-zinc-500">
          <LiveClock />
        </span>
      </div>
    </div>
  );
}
