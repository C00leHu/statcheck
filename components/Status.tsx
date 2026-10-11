import { cn } from "@/lib/utils";
import type { MonitorStatus } from "@/lib/mock-data";

const map: Record<MonitorStatus, { dot: string; ring: string; label: string; text: string; bg: string; border: string }> = {
  operational: { dot: "bg-emerald-500", ring: "bg-emerald-500", label: "Operational", text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
  degraded: { dot: "bg-amber-500", ring: "bg-amber-500", label: "Degraded", text: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
  outage: { dot: "bg-red-500", ring: "bg-red-500", label: "Major outage", text: "text-red-700", bg: "bg-red-50", border: "border-red-200" },
  unknown: { dot: "bg-zinc-400", ring: "bg-zinc-400", label: "Unknown", text: "text-zinc-600", bg: "bg-zinc-100", border: "border-zinc-200" },
  maintenance: { dot: "bg-blue-500", ring: "bg-blue-500", label: "Maintenance", text: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" },
};

export function StatusDot({ status, pulse = true, size = "md" }: { status: MonitorStatus; pulse?: boolean; size?: "sm" | "md" | "lg" }) {
  const c = map[status];
  const sz = size === "sm" ? "h-1.5 w-1.5" : size === "lg" ? "h-3 w-3" : "h-2 w-2";
  return (
    <span className="relative flex shrink-0" aria-hidden="true">
      {pulse && <span className={cn("absolute inline-flex h-full w-full rounded-full opacity-40 animate-pingSoft", c.ring, sz)} />}
      <span className={cn("relative inline-flex rounded-full animate-pulseDot", c.dot, sz)} />
    </span>
  );
}

export function StatusBadge({ status, className }: { status: MonitorStatus; className?: string }) {
  const c = map[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium", c.bg, c.border, c.text, className)}>
      <StatusDot status={status} size="sm" pulse={false} />
      {c.label}
    </span>
  );
}

export function statusLabel(s: MonitorStatus) {
  return map[s].label;
}
