import { Reveal } from "@/components/Reveal";
import { Card, Button } from "@/components/ui";

export const metadata = { title: "About" };
export default function Page() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-14 sm:py-20">
      <Reveal><p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-emerald-700">About</p>
      <h1 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight">Status pages without the enterprise sales call.</h1>
      <p className="mt-4 text-base text-zinc-600 leading-relaxed">StatCheck started from a simple frustration: small teams need the same transparency as large platforms, but existing tools are either too basic or priced for enterprises. We build monitoring that a solo developer can set up in minutes — and that still holds up when that side project becomes a business.</p></Reveal>
      <Reveal delay={100}><Card className="mt-8 p-6"><h2 className="font-semibold">What we believe</h2><ul className="mt-3 space-y-2 text-sm text-zinc-600"><li>· Downtime happens. How you communicate it defines trust.</li><li>· Status pages should show real data, not marketing.</li><li>· Developers should be able to automate everything via API.</li></ul></Card></Reveal>
      <Reveal delay={150}><div className="mt-8 flex gap-3"><Button href="/signup">Get started</Button><Button href="/contact" variant="secondary">Contact us</Button></div></Reveal>
    </div>
  );
}
