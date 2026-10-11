import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "light" | "outlineDark";
type Size = "sm" | "md" | "lg";

export function Button({
  children, href, variant = "primary", size = "md", className, type, disabled, loading, onClick,
}: {
  children: React.ReactNode; href?: string; variant?: Variant; size?: Size; className?: string;
  type?: "button" | "submit"; disabled?: boolean; loading?: boolean; onClick?: () => void;
}) {
  const styles = cn(
    "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 select-none",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600",
    "active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none",
    variant === "primary" && "bg-zinc-900 text-white hover:bg-zinc-800 shadow-soft hover:shadow-card",
    variant === "secondary" && "bg-white text-zinc-900 border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 shadow-soft",
    variant === "ghost" && "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100",
    variant === "outline" && "border border-zinc-300 text-zinc-900 hover:bg-zinc-50",
    variant === "light" && "bg-white text-zinc-950 hover:bg-emerald-100 shadow-soft",
    variant === "outlineDark" && "border border-white/15 text-zinc-200 hover:border-white/30 hover:bg-white/5",
    size === "sm" && "text-[13px] px-3 py-1.5",
    size === "md" && "text-sm px-4 py-2.5",
    size === "lg" && "text-[15px] px-6 py-3",
    className
  );
  const inner = (
    <>
      {loading && (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
          <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      )}
      {children}
    </>
  );
  if (href && !disabled) return <Link href={href} className={styles}>{inner}</Link>;
  return <button type={type} disabled={disabled || loading} onClick={onClick} className={styles}>{inner}</button>;
}

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("rounded-xl border border-zinc-200 bg-white shadow-soft", className)}>{children}</div>;
}

/** Dark surface for dashboard + app views (light pages keep using Card). */
export function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("rounded-2xl border border-white/10 bg-zinc-900/60", className)}>{children}</div>;
}

export function SectionHeading({ eyebrow, title, sub }: { eyebrow?: string; title: string; sub?: string }) {
  return (
    <div className="max-w-2xl">
      {eyebrow && <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-emerald-700">{eyebrow}</p>}
      <h2 className="mt-2 text-2xl sm:text-[32px] font-semibold tracking-tight text-zinc-900 leading-tight">{title}</h2>
      {sub && <p className="mt-3 text-[15px] sm:text-base leading-relaxed text-zinc-600">{sub}</p>}
    </div>
  );
}

export function Input({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-zinc-700">{label}</span>
      <input
        {...props}
        className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 shadow-soft transition-colors hover:border-zinc-300 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/15"
      />
    </label>
  );
}
