import { Reveal } from "@/components/Reveal";

export function LegalShell({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-14 sm:py-20">
      <Reveal>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-zinc-500">Last updated: {updated}</p>
      </Reveal>
      <Reveal delay={80}>
        <div className="mt-8 space-y-6 text-[15px] leading-relaxed text-zinc-700 [&>h2]:text-lg [&>h2]:font-semibold [&>h2]:tracking-tight [&>h2]:text-zinc-900 [&>h2]:pt-2">
          {children}
        </div>
      </Reveal>
    </div>
  );
}

export function Placeholder({ children }: { children: React.ReactNode }) {
  return <span className="rounded-md border border-dashed border-amber-400 bg-amber-50 px-1.5 py-0.5 text-[13px] font-medium text-amber-800">{children}</span>;
}
