"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteMonitorButton({ monitorId, monitorName }: { monitorId: string; monitorName: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const remove = async () => {
    setDeleting(true);
    const res = await fetch(`/api/monitors/${monitorId}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/dashboard/monitors");
      router.refresh();
    } else {
      setDeleting(false);
      setConfirming(false);
    }
  };

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="rounded-lg border border-red-500/30 px-3.5 py-2 text-[13px] font-medium text-red-300 transition-colors hover:bg-red-500/10"
      >
        Delete
      </button>
    );
  }
  return (
    <span className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-[13px]">
      <span className="text-red-200">Delete “{monitorName}” and its history?</span>
      <button onClick={remove} disabled={deleting} className="font-semibold text-red-300 underline underline-offset-2 disabled:opacity-60">
        {deleting ? "Deleting…" : "Yes, delete"}
      </button>
      <button onClick={() => setConfirming(false)} className="text-red-300 hover:underline">Cancel</button>
    </span>
  );
}
