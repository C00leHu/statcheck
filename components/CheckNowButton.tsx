"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function CheckNowButton({ monitorId, label = "Run check now" }: { monitorId: string; label?: string }) {
  const router = useRouter();
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");

  const run = async () => {
    setError("");
    setRunning(true);
    try {
      const res = await fetch(`/api/monitors/${monitorId}/check`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(typeof data.error === "string" ? data.error : "Check failed.");
        return;
      }
      router.refresh();
    } finally {
      setRunning(false);
    }
  };

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button
        onClick={run}
        disabled={running}
        className="inline-flex items-center gap-2 rounded-lg bg-white px-3.5 py-2 text-[13px] font-semibold text-zinc-950 transition-all hover:bg-emerald-100 active:scale-[0.98] disabled:opacity-60"
      >
        {running && (
          <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
            <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        )}
        {running ? "Checking…" : label}
      </button>
      {error && <span className="text-xs text-red-600" role="alert">{error}</span>}
    </span>
  );
}
