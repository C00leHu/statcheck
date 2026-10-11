import Link from "next/link";
import { LegalShell, Placeholder } from "@/components/Legal";

export const metadata = { title: "Legal Notice" };

export default function Page() {
  return (
    <LegalShell title="Legal Notice" updated="October 5, 2026">
      <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
        Operator, contact, and hosting details are filled in. Still required for full German compliance before public
        launch: a valid postal address — a c/o forwarding address is fine, it just has to actually reach you. Fill the
        placeholder below once you have one.
      </div>

      <h2>1. Service publisher</h2>
      <p>
        StatCheck is an uptime-monitoring and status-page service operated by coolehu, <Placeholder>[c/o service name, street, ZIP city]</Placeholder>,
        Germany.
      </p>
      <p>Contact email: <a href="mailto:contact@statcheck.com" className="underline">contact@statcheck.com</a></p>

      <h2>2. Status</h2>
      <p>
        StatCheck is an independent project that is currently being structured. It is not yet formally registered as a
        company or association.
      </p>
      <p>
        Until that status is official, <strong>no paid services are sold through the platform</strong>. The plans shown on
        the pricing page describe intended future offerings to finance infrastructure and keep the project sustainable;
        everything available today is free and no payment is processed.
      </p>

      <h2>3. Why this service exists</h2>
      <p>
        StatCheck was built to give developers, startups, communities, and small teams free, honest visibility into
        their uptime — the kind of transparency every service should offer its users. Paid plans may one day help cover
        infrastructure costs and support the project long-term; until then, the service remains free.
      </p>

      <h2>4. Hosting</h2>
      <p>
        StatCheck is self-hosted: the application runs on infrastructure operated by the publisher (coolehu) in Germany.
      </p>

      <h2>5. Data and privacy</h2>
      <p>In short, StatCheck stores only what the service needs to function:</p>
      <p>
        <strong>Accounts:</strong> name, email address, and password hash. Passwords are hashed (scrypt) and never stored
        or logged in plain text. <strong>Monitoring data:</strong> the endpoints you configure, check results, incidents,
        and status pages you create. <strong>Cookies:</strong> a strictly-necessary session cookie and your stored
        consent choice — no advertising trackers, no cross-site tracking.
      </p>
      <p>
        You can delete your account at any time in the dashboard (Settings → Danger zone); deletion immediately and
        permanently removes your monitors, checks, incidents, and status pages. Full details, legal bases, and your GDPR
        rights are described in the <Link href="/privacy" className="underline">Privacy Policy</Link> and{" "}
        <Link href="/cookies" className="underline">Cookie Policy</Link>.
      </p>

      <h2>6. Monitoring and security checks</h2>
      <p>
        StatCheck performs automated availability checks <strong>only against endpoints you configure</strong>. These are
        plain HTTP(S) and TCP requests that verify reachability, status codes, and response times.
      </p>
      <p>
        These checks do not bypass authentication, do not collect passwords, API keys, or other credentials, and do not
        copy application code. Reviews by the service administration focus on abuse prevention and service integrity only.
      </p>
      <p>
        Only monitor endpoints you own or are explicitly authorized to monitor. Probing third-party systems without
        authorization is prohibited (see Terms of Service). Services that violate third-party terms of service are not
        permitted on the platform.
      </p>

      <h2>7. Contact</h2>
      <p>
        For legal or compliance questions, contact <a href="mailto:contact@statcheck.com" className="underline">contact@statcheck.com</a> or use the{" "}
        <Link href="/contact" className="underline">contact page</Link>.
      </p>
    </LegalShell>
  );
}
