import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ dark = false, compact = false }: { dark?: boolean; compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5 group" aria-label="StatCheck home">
      <span className="relative flex h-7 w-7 items-center justify-center rounded-[9px] bg-zinc-950 transition-transform duration-300 group-hover:scale-[1.06] group-hover:rotate-[-4deg]">
        <svg width="17" height="17" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path
            d="M1.5 10.5 H5 L6.8 10.5 L8 6 L9.6 14 L11 10.5 H12.4 L13.4 8.2 L14.4 10.5 H16.5"
            stroke="#34d399"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="13.4" cy="8.2" r="1.5" fill="#34d399" />
          <circle cx="13.4" cy="8.2" r="1.5" fill="#34d399" opacity="0.4">
            <animate attributeName="r" values="1.5;3.4" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;0" dur="2s" repeatCount="indefinite" />
          </circle>
        </svg>
      </span>
      {!compact && (
        <span className={cn("text-[17px] font-semibold tracking-[-0.01em]", dark ? "text-white" : "text-zinc-900")}>
          StatCheck
        </span>
      )}
    </Link>
  );
}
