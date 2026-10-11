import { Reveal } from "@/components/Reveal";
import { Card } from "@/components/ui";

export default function Page() {
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-14 sm:py-20">
      <Reveal><h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Contact</h1><p className="mt-3 text-zinc-600">Questions about plans, migrations, or status pages? Write to us directly.</p></Reveal>
      <Reveal delay={100}>
        <Card className="mt-8 p-6 sm:p-8 text-center">
          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-zinc-900 text-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" /></svg>
          </span>
          <p className="mt-4 font-mono text-lg font-medium">coolehu@gmail.com</p>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-zinc-600">
            There is no contact form — your mail client opens with the address filled in, so nothing gets lost in between.
            We reply within one business day.
          </p>
          <a
            href="mailto:coolehu@gmail.com?subject=StatCheck%20question"
            className="mt-6 inline-flex items-center justify-center rounded-lg bg-zinc-900 px-6 py-3 text-[15px] font-medium text-white transition-all hover:bg-zinc-700 active:scale-[0.98]"
          >
            Write an email
          </a>
        </Card>
      </Reveal>
    </div>
  );
}
