import { LegalShell, Placeholder } from "@/components/Legal";
export const metadata = { title: "Privacy Policy" };
export default function Page() {
  return (
    <LegalShell title="Privacy Policy" updated="January 15, 2026">
      <p>This policy explains what personal data StatCheck processes, why, and what rights you have under the EU General Data Protection Regulation (GDPR).</p>
      <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
        Controller details are filled in except the postal address (a c/o forwarding address is fine) — see the placeholder below.
      </div>
      <h2>1. Controller</h2>
      <p>The data controller is coolehu, <Placeholder>[c/o service name, street, ZIP city]</Placeholder>, Germany, contactable at <a href="mailto:contact@statcheck.com" className="underline">contact@statcheck.com</a>.</p>
      <h2>2. Data we process</h2>
      <p><strong>Account data:</strong> name, email, password hash. Legal basis: Art. 6(1)(b) GDPR (contract). <strong>Billing data:</strong> none — no payments are currently processed (see Legal Notice). <strong>Monitoring configuration and results:</strong> endpoints you add, check settings, check results, incidents, and status-page content you publish. Legal basis: Art. 6(1)(b) GDPR (contract). <strong>Technical protection:</strong> rate limiting is enforced in memory and not stored; we keep no persistent access or IP logs.</p>
      <h2>3. Purposes</h2>
      <p>We process data to provide the service, prevent abuse, and improve reliability. We do not sell personal data and do not use it for third-party advertising.</p>
      <h2>4. Processors and transfers</h2>
      <p>There are currently no sub-processors: no email delivery, payment, or analytics providers are connected. StatCheck is self-hosted by the operator in Germany. If processors are added, they will be engaged under Art. 28 GDPR data-processing agreements, and transfers outside the EEA will occur only with appropriate safeguards (adequacy decision or Standard Contractual Clauses).</p>
      <h2>5. Retention</h2>
      <p>Account data is kept while your account exists. Check history is capped at the 1,000 most recent checks per monitor; there is currently no time-based auto-deletion. Encrypted operator backups may exist (AES-256-GCM, pruned automatically); restores overwrite the live database. Deleting your account (dashboard → Settings → Danger zone) immediately and permanently removes your monitors, checks, incidents, and status pages.</p>
      <h2>6. Your rights</h2>
      <p>You have the rights to access (Art. 15), rectification (Art. 16), erasure (Art. 17), restriction (Art. 18), data portability (Art. 20), and objection (Art. 21) GDPR. Contact <a href="mailto:contact@statcheck.com" className="underline">contact@statcheck.com</a> to exercise them. You may also lodge a complaint with your supervisory authority (Art. 77 GDPR).</p>
      <h2>7. Security</h2>
      <p>Data is encrypted in transit (TLS). Passwords are hashed with scrypt and never stored in plain text. Each account can only access its own monitors, incidents, and pages (server-side session checks). There are currently no API tokens. We notify affected users of personal-data breaches as required by Art. 33–34 GDPR.</p>
    </LegalShell>
  );
}
