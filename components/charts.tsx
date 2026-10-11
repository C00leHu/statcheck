"use client";
import type { UptimeDay } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

function barColor(status: UptimeDay["status"]) {
  if (status === "operational") return "bg-emerald-500";
  if (status === "degraded") return "bg-amber-500";
  if (status === "outage") return "bg-red-500";
  if (status === "maintenance") return "bg-blue-500";
  return "bg-zinc-300";
}

export function UptimeBars({ days, height = 36 }: { days: UptimeDay[]; height?: number }) {
  return (
    <div className="flex items-end gap-[3px]" style={{ height }} role="img" aria-label={`Uptime over last ${days.length} days`}>
      {days.map((d, i) => {
        const h = d.status === "operational" ? 100 : d.status === "unknown" ? 16 : Math.max(30, 35 + (d.uptime - 90) * 6);
        return (
          <div
            key={d.date + i}
            title={`${d.date}: ${d.status === "unknown" ? "no data" : `${d.uptime}% uptime`}`}
            className={cn("uptime-bar w-full min-w-[2px] flex-1 rounded-[3px] transition-transform hover:scale-y-110", barColor(d.status))}
            style={{ height: `${h}%`, animationDelay: `${Math.min(i * 8, 600)}ms` }}
          />
        );
      })}
    </div>
  );
}

export function ResponseChart({ data, height = 140, grid = "#e4e4e7" }: { data: { t: string; ms: number }[]; height?: number; grid?: string }) {
  const max = Math.max(...data.map((d) => d.ms)) * 1.15;
  const min = Math.min(...data.map((d) => d.ms)) * 0.7;
  const W = 600, H = 160;
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((d.ms - min) / (max - min)) * (H - 20) - 10;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const area = `0,${H} ${pts.join(" ")} ${W},${H}`;
  return (
    <div className="w-full overflow-hidden">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }} preserveAspectRatio="none" role="img" aria-label="Response time chart">
        <defs>
          <linearGradient id="respFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#059669" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#059669" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1="0" x2={W} y1={H * f} y2={H * f} stroke={grid} strokeWidth="1" strokeDasharray="3 4" vectorEffect="non-scaling-stroke" />
        ))}
        <polygon points={area} fill="url(#respFill)" />
        <polyline points={pts.join(" ")} fill="none" stroke="#059669" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        <circle cx={W} cy={parseFloat(pts[pts.length - 1].split(",")[1])} r="4" fill="#059669" stroke="white" strokeWidth="2" />
      </svg>
    </div>
  );
}

export function UptimeAreaChart({ days, height = 120 }: { days: UptimeDay[]; height?: number }) {
  const W = 600, H = 140;
  const pts = days.map((d, i) => {
    const x = (i / (days.length - 1)) * W;
    const y = H - ((d.uptime - 90) / 10) * (H - 24) - 12;
    return `${x.toFixed(1)},${Math.max(6, Math.min(H - 4, y)).toFixed(1)}`;
  });
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }} preserveAspectRatio="none" role="img" aria-label="Uptime trend">
      <defs>
        <linearGradient id="upFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#059669" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#059669" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${H} ${pts.join(" ")} ${W},${H}`} fill="url(#upFill)" />
      <polyline points={pts.join(" ")} fill="none" stroke="#059669" strokeWidth="2" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
