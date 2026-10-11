"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeletePageButton({ pageId, pageName }: { pageId: string; pageName: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const remove = async () => {
    setDeleting(true);
    const res = await fetch(`/api/status-pages/${pageId}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/dashboard/pages");
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
        className="rounded-lg border border-white/10 px-3 py-1.5 text-[13px] text-zinc-400 transition-colors hover:border-red-500/40 hover:text-red-300"
      >
        Delete
      </button>
    );
  }
  return (
    <span className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-[13px]">
      <span className="text-red-800">Take “{pageName}” offline?</span>
      <button onClick={remove} disabled={deleting} className="font-semibold text-red-700 underline underline-offset-2 disabled:opacity-60">
        {deleting ? "Deleting…" : "Yes"}
      </button>
      <button onClick={() => setConfirming(false)} className="text-red-700 hover:underline">Cancel</button>
    </span>
  );
}
