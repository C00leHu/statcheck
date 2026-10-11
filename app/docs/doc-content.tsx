import { DocH1, DocH2, DocP } from "@/components/DocsChrome";
import { InlineCode } from "@/components/CodeBlock";

const pages: Record<string, { title: string; sub: string; body: React.ReactNode }> = {
  monitors: {
    title: "Monitors", sub: "HTTPS, HTTP, and TCP checks with honest statuses.",
    body: (<>
      <DocH2>Check types</DocH2>
      <DocP><InlineCode>HTTPS / HTTP</InlineCode> — StatCheck requests the URL and records the status code and response time. Any <InlineCode>2xx</InlineCode> or <InlineCode>3xx</InlineCode> status counts as up; <InlineCode>4xx</InlineCode> and <InlineCode>5xx</InlineCode> count as down. <InlineCode>TCP</InlineCode> — StatCheck opens a socket to <InlineCode>host:port</InlineCode> and times the connection, ideal for game servers and databases.</DocP>
      <DocH2>Intervals and scheduling</DocH2>
      <DocP>Choose <InlineCode>1</InlineCode>, <InlineCode>5</InlineCode>, or <InlineCode>15</InlineCode> minutes per monitor. Automated checks run whenever your scheduler calls <InlineCode>POST /api/cron/check</InlineCode> — monitors whose interval has elapsed since their last check get checked, up to 25 per run. Until a scheduler is configured, use <InlineCode>Run check now</InlineCode> on any monitor.</DocP>
      <DocH2>Statuses</DocH2>
      <DocP><InlineCode>Operational</InlineCode> — the last check passed. <InlineCode>Degraded</InlineCode> — the last check failed once. <InlineCode>Outage</InlineCode> — the last two checks failed in a row. <InlineCode>Unknown</InlineCode> — no checks recorded yet. Uptime percentages and daily bars are computed from recorded checks only; days without checks show gray.</DocP>
      <DocH2>History</DocH2>
      <DocP>The 1,000 most recent checks per monitor are kept. Older entries are pruned automatically.</DocP>
    </>),
  },
  "status-pages": {
    title: "Status Pages", sub: "Publish a public page at your own /s/ URL.",
    body: (<>
      <DocH2>Creating a page</DocH2>
      <DocP>Create a page from <InlineCode>Status Pages → New status page</InlineCode>: pick a name, a URL slug (3–40 lowercase letters, numbers, or dashes), and the monitors to display. The page is instantly live at <InlineCode>/s/your-slug</InlineCode> — no sign-in required to view it.</DocP>
      <DocH2>What visitors see</DocH2>
      <DocP>Overall status, per-service status with 90-day uptime bars and average response times, and recent incidents affecting the page&apos;s monitors. Deleting a page takes it offline immediately.</DocP>
    </>),
  },
  incidents: {
    title: "Incidents", sub: "Open incidents, post structured updates, and resolve transparently.",
    body: (<>
      <DocH2>Lifecycle</DocH2>
      <DocP>Incidents move through <InlineCode>Investigating → Identified → Monitoring → Resolved</InlineCode>. Every update you post is timestamped, appears in the incident timeline, and moves the incident to the update&apos;s status. Open incidents appear on every public status page that includes one of their affected monitors.</DocP>
      <DocH2>Affected services are optional</DocH2>
      <DocP>Attach monitors so the incident shows on the right pages, or leave the list empty for general announcements — those appear on all of your pages.</DocP>
      <DocH2>Writing good updates</DocH2>
      <DocP>State what is affected, what users should do (usually: nothing), and when the next update lands. Avoid jargon — “API requests are slow” beats “p99 latency elevated on edge workers”.</DocP>
    </>),
  },
  notifications: {
    title: "Notifications", sub: "Alert webhooks that fire for real, email preference saved for later.",
    body: (<>
      <DocH2>Alert webhooks</DocH2>
      <DocP>Add Discord, Slack, or generic webhook URLs under <InlineCode>Notifications</InlineCode>. StatCheck fires on confirmed outages, recoveries, and incident updates — Discord and Slack get native formatting, everything else gets a JSON event. Use the <InlineCode>Test</InlineCode> button to prove delivery, and watch the per-endpoint dot for the last result. Webhook URLs are secret credentials: they are stored server-side, displayed masked, and never returned by the API.</DocP>
      <DocH2>Email preference</DocH2>
      <DocP>The email toggle on the same page is saved to your account and takes effect automatically once sending is connected. Nothing is emailed today.</DocP>
    </>),
  },
  troubleshooting: {
    title: "Troubleshooting", sub: "Fix the most common monitoring setup issues.",
    body: (<>
      <DocH2>Monitor shows down but the site loads</DocH2>
      <DocP>StatCheck follows redirects and treats <InlineCode>2xx–3xx</InlineCode> as up. A down result on a working site usually means the endpoint returned <InlineCode>4xx/5xx</InlineCode> to the checker — bot protection, geo-blocking, or an error page served to non-browser clients. Check the error text on the failed check row.</DocP>
      <DocH2>Nothing is checked automatically</DocH2>
      <DocP>Automated checks only run when your scheduler calls <InlineCode>POST /api/cron/check</InlineCode> with your <InlineCode>CRON_SECRET</InlineCode>. Until then, use <InlineCode>Run check now</InlineCode>. A <InlineCode>401</InlineCode> from the cron endpoint means the secret is missing or wrong; a <InlineCode>503</InlineCode> in production means it isn&apos;t configured at all.</DocP>
      <DocH2>Status page slug is taken</DocH2>
      <DocP>Slugs are unique across all accounts (<InlineCode>3–40</InlineCode> lowercase letters, numbers, dashes). If yours is taken, add a suffix like <InlineCode>acme-status-2</InlineCode>.</DocP>
      <DocH2>Gray days in uptime bars</DocH2>
      <DocP>Gray means no checks were recorded that day — not downtime. Run checks (manually or via scheduler) and the bars fill in.</DocP>
    </>),
  },
};

export function DocGeneric({ slug }: { slug: string }) {
  const p = pages[slug];
  if (!p) return null;
  return (
    <div>
      <DocH1 sub={p.sub}>{p.title}</DocH1>
      {p.body}
    </div>
  );
}
