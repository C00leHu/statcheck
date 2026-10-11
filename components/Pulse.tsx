"use client";
import { useEffect, useState } from "react";

/** Signature StatCheck heartbeat line. */
export function PulseLine({ className = "", stroke = "#059669", width = 640, height = 48 }: { className?: string; stroke?: string; width?: number; height?: number }) {
  const mid = height / 2;
  const d = `M0 ${mid} L${width * 0.32} ${mid} L${width * 0.4} ${mid} L${width * 0.44} ${height * 0.12} L${width * 0.5} ${height * 0.88} L${width * 0.56} ${mid} L${width * 0.6} ${mid} L${width} ${mid}`;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={className} preserveAspectRatio="none" aria-hidden="true">
      <path d={d} fill="none" stroke={stroke} strokeOpacity="0.25" strokeWidth="1.5" />
      <path d={d} fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" className="pulse-dash" />
    </svg>
  );
}

const feed = [
  { code: "200", ok: true, name: "api.example.com", ms: 138, region: "fra" },
  { code: "200", ok: true, name: "example.com", ms: 214, region: "ams" },
  { code: "200", ok: true, name: "play.example.com", ms: 39, region: "fra" },
  { code: "200", ok: true, name: "app.example.com", ms: 191, region: "iad" },
  { code: "200", ok: true, name: "discord gateway", ms: 94, region: "ams" },
  { code: "200", ok: true, name: "api.example.com", ms: 146, region: "iad" },
  { code: "200", ok: true, name: "example.com", ms: 208, region: "fra" },
  { code: "200", ok: true, name: "status webhook", ms: 172, region: "ams" },
];

/** Live check feed — new rows slide in every couple of seconds. */
export function LiveTicker() {
  const [count, setCount] = useState(5);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setCount((c) => (c >= 40 ? 5 : c + 1)), 2200);
    return () => clearInterval(id);
  }, []);
  const rows = Array.from({ length: count }, (_, i) => {
    const e = feed[(count - i - 1 + feed.length * 10) % feed.length];
    const secs = (count - i - 1) * 2 + 4;
    return { ...e, key: count - i, age: secs < 60 ? `${secs}s ago` : `${Math.floor(secs / 60)}m ago` };
  }).slice(0, 6);
  return (
    <div aria-live="off">
      <div className="mb-3 flex items-center justify-between">
        <p className="font-mono text-xs uppercase tracking-[0.12em] text-zinc-400">Live checks</p>
        <span className="inline-flex items-center gap-1.5 font-mono text-xs text-emerald-400">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute h-full w-full animate-pingSoft rounded-full bg-emerald-400" />
            <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          streaming
        </span>
      </div>
      <ul className="space-y-1.5">
        {rows.map((r, i) => (
          <li
            key={r.key}
            className="ticker-row flex items-center gap-2.5 rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2 font-mono text-xs"
            style={{ opacity: 1 - i * 0.14 }}
          >
            <span className="font-semibold text-emerald-400">{r.code}</span>
            <span className="truncate text-zinc-300">{r.name}</span>
            <span className="ml-auto shrink-0 text-zinc-500">{r.ms}ms · {r.region} · {r.age}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Live UTC clock for footer / status surfaces. */
export function LiveClock() {
  const [now, setNow] = useState<string | null>(null);
  useEffect(() => {
    const fmt = () => {
      const d = new Date();
      setNow(d.toISOString().slice(11, 19) + " UTC");
    };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setNow(new Date().toISOString().slice(11, 19) + " UTC");
      return;
    }
    fmt();
    const id = setInterval(fmt, 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="font-mono tabular-nums">{now ?? "--:--:-- UTC"}</span>;
}
