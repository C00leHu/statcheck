import Link from "next/link";
import { DocH1, DocH2, DocP } from "@/components/DocsChrome";
import { CodeBlock, InlineCode } from "@/components/CodeBlock";

export const metadata = { title: "Getting Started" };

export default function DocsHome() {
  return (
    <div>
      <DocH1 sub="Create your first monitor and publish a status page in under five minutes.">Getting Started</DocH1>
      <DocH2>1. Create an account</DocH2>
      <DocP>
        Sign up with your name, email, and password. New accounts land on a short setup wizard — or skip it and explore
        the empty dashboard first.
      </DocP>
      <DocH2>2. Add your first monitor</DocH2>
      <DocP>
        Go to <InlineCode>Monitors → New monitor</InlineCode>, pick <InlineCode>HTTPS</InlineCode>, <InlineCode>HTTP</InlineCode>,
        or <InlineCode>TCP</InlineCode>, and enter what to watch — a URL like <InlineCode>https://api.example.com/health</InlineCode> or{" "}
        <InlineCode>host:port</InlineCode> for TCP. Press <InlineCode>Run check now</InlineCode> to see a real result in seconds.
      </DocP>
      <DocH2>3. Schedule automatic checks</DocH2>
      <DocP>
        Manual checks prove the setup works; a scheduler keeps it running. Call the cron endpoint every minute with your{" "}
        <InlineCode>CRON_SECRET</InlineCode> — every monitor whose interval has elapsed gets checked automatically.
      </DocP>
      <CodeBlock
        title="Schedule checks every minute"
        language="bash"
        code={`curl -X POST https://YOUR-DOMAIN/api/cron/check \\
  -H "Authorization: Bearer $CRON_SECRET"`}
      />
      <DocH2>4. Publish a status page</DocH2>
      <DocP>
        Open <InlineCode>Status Pages → New status page</InlineCode>, choose a name and URL slug, tick the monitors to
        display, and publish. Your page is instantly live at <InlineCode>/s/your-slug</InlineCode> — no sign-in needed to view it.
      </DocP>
      <DocH2>Next steps</DocH2>
      <DocP>
        Open a test incident to see the timeline in action, set your notification preference under{" "}
        <InlineCode>Notifications</InlineCode>, and read the <Link href="/docs/api" className="underline">API reference</Link> to
        automate everything the dashboard can do.
      </DocP>
    </div>
  );
}
