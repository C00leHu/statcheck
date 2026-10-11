import { DocH1, DocH2, DocP } from "@/components/DocsChrome";
import { CodeBlock, InlineCode } from "@/components/CodeBlock";
import { Card } from "@/components/ui";

export const metadata = { title: "API Reference" };

const endpoints = [
  { m: "POST", p: "/api/auth/register", d: "Create an account and sign in." },
  { m: "POST", p: "/api/auth/login", d: "Sign in with email + password." },
  { m: "POST", p: "/api/auth/logout", d: "Sign out and clear the session." },
  { m: "GET", p: "/api/auth/me", d: "Current signed-in user." },
  { m: "GET", p: "/api/monitors", d: "List monitors with computed stats." },
  { m: "POST", p: "/api/monitors", d: "Create a monitor." },
  { m: "GET", p: "/api/monitors/:id", d: "Monitor, recent checks, daily buckets." },
  { m: "DELETE", p: "/api/monitors/:id", d: "Delete a monitor and its checks." },
  { m: "POST", p: "/api/monitors/:id/check", d: "Run a live check now." },
  { m: "GET", p: "/api/incidents", d: "List incidents with timelines." },
  { m: "POST", p: "/api/incidents", d: "Open an incident." },
  { m: "POST", p: "/api/incidents/:id/updates", d: "Post a timeline update (moves status)." },
  { m: "GET", p: "/api/status-pages", d: "List your status pages." },
  { m: "POST", p: "/api/status-pages", d: "Publish a status page." },
  { m: "DELETE", p: "/api/status-pages/:id", d: "Take a status page offline." },
  { m: "GET", p: "/api/webhooks", d: "List alert webhooks (URLs masked)." },
  { m: "POST", p: "/api/webhooks", d: "Add a Discord/Slack/JSON webhook." },
  { m: "DELETE", p: "/api/webhooks/:id", d: "Delete a webhook." },
  { m: "POST", p: "/api/webhooks/:id/test", d: "Send a test event." },
  { m: "GET", p: "/api/settings", d: "Profile + notification preference." },
  { m: "PATCH", p: "/api/settings", d: "Update name, alerts, onboarding flag." },
  { m: "DELETE", p: "/api/account", d: "Delete account and all data." },
  { m: "POST", p: "/api/cron/check", d: "Run due checks (secret-protected)." },
];

function Method({ m }: { m: string }) {
  const cls =
    m === "GET" ? "bg-emerald-50 text-emerald-700" : m === "DELETE" ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700";
  return <span className={`inline-flex w-16 shrink-0 justify-center rounded-md px-2 py-0.5 font-mono text-xs font-semibold ${cls}`}>{m}</span>;
}

export default function ApiDocs() {
  return (
    <div>
      <DocH1 sub="Everything the dashboard can do is a JSON endpoint. Same origin, same session — no tokens (yet).">API Reference</DocH1>

      <DocH2>Sessions, not tokens</DocH2>
      <DocP>
        There are no API tokens yet. Sign in with <InlineCode>POST /api/auth/login</InlineCode> and the server sets an{" "}
        <InlineCode>HttpOnly</InlineCode> session cookie (<InlineCode>sc_session</InlineCode>, 30 days). Browsers send it
        automatically; scripts must keep a cookie jar. All dashboard endpoints return <InlineCode>401</InlineCode> without
        a valid session. The only exception is <InlineCode>POST /api/cron/check</InlineCode>, which takes{" "}
        <InlineCode>Authorization: Bearer $CRON_SECRET</InlineCode> instead.
      </DocP>
      <CodeBlock
        title="curl with a cookie jar"
        language="bash"
        code={`# sign in once, keep cookies
curl -c jar.txt -X POST http://localhost:3000/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"you@company.com","password":"correct-horse"}'

# list monitors with computed stats
curl -b jar.txt http://localhost:3000/api/monitors`}
      />

      <DocH2>Endpoints</DocH2>
      <Card className="mt-4 divide-y divide-zinc-100 overflow-hidden">
        {endpoints.map((e) => (
          <div key={e.m + e.p} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 px-4 py-3">
            <Method m={e.m} />
            <code className="font-mono text-[13px]">{e.p}</code>
            <span className="text-[13px] text-zinc-500 sm:ml-auto">{e.d}</span>
          </div>
        ))}
      </Card>

      <DocH2>Create a monitor</DocH2>
      <CodeBlock
        title="POST /api/monitors"
        language="bash"
        code={`curl -b jar.txt -X POST http://localhost:3000/api/monitors \\
  -H "Content-Type: application/json" \\
  -d '{"name":"API","type":"https","target":"https://api.example.com/health","intervalSeconds":60}'`}
      />
      <DocP>
        <InlineCode>type</InlineCode> is <InlineCode>https</InlineCode>, <InlineCode>http</InlineCode>, or <InlineCode>tcp</InlineCode>.{" "}
        <InlineCode>target</InlineCode> is a URL (scheme added automatically) or <InlineCode>host:port</InlineCode> for TCP.{" "}
        <InlineCode>intervalSeconds</InlineCode> is one of <InlineCode>60</InlineCode>, <InlineCode>300</InlineCode>,{" "}
        <InlineCode>900</InlineCode>. Returns <InlineCode>201</InlineCode> with <InlineCode>{"{ monitor }"}</InlineCode>.
      </DocP>

      <DocH2>Run checks on a schedule</DocH2>
      <CodeBlock
        title="POST /api/cron/check"
        language="bash"
        code={`curl -X POST https://YOUR-DOMAIN/api/cron/check \\
  -H "Authorization: Bearer $CRON_SECRET"`}
      />
      <DocP>
        Checks every monitor whose interval elapsed since its last check (max 25 per call). Responds with{" "}
        <InlineCode>{"{ checked, results: [{ monitorId, ok }] }"}</InlineCode>. Requires <InlineCode>CRON_SECRET</InlineCode> when
        configured — without it, production answers <InlineCode>503</InlineCode>.
      </DocP>

      <DocH2>Errors</DocH2>
      <DocP>
        Errors are JSON: <InlineCode>{"{ error }"}</InlineCode>. <InlineCode>400</InlineCode> validation ·{" "}
        <InlineCode>401</InlineCode> missing/invalid session (or bad cron secret) · <InlineCode>404</InlineCode> not found or not
        yours · <InlineCode>409</InlineCode> email taken / slug taken · <InlineCode>429</InlineCode> rate limited (limits are
        per account or per email per hour, e.g. 10 logins per 10 minutes) · <InlineCode>503</InlineCode> cron secret missing.
      </DocP>
    </div>
  );
}
