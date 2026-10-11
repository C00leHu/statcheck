import { LegalShell, Placeholder } from "@/components/Legal";
export const metadata = { title: "Terms of Service" };
export default function Page() {
  return (
    <LegalShell title="Terms of Service" updated="October 5, 2026">
      <p>These Terms govern your use of StatCheck, an uptime monitoring and status-page service. By creating an account or using the service, you agree to these Terms.</p>
      <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
        Operator details are filled in. A postal address (c/o is fine) is still required in the Legal Notice for full German compliance.
      </div>
      <h2>1. Service description</h2>
      <p>StatCheck provides website, API, and TCP monitoring, public status pages, and incident management. The service is operated by coolehu. Feature availability per plan (Free, Pro, Business) is described on the pricing page; until paid operation begins, everything available is free.</p>
      <h2>2. Accounts and acceptable use</h2>
      <p>You must provide accurate account information and keep credentials confidential. You agree not to misuse the service — including probing third-party systems without authorization, sending spam through notification channels, or interfering with other customers' monitoring.</p>
      <h2>3. Plans, billing, and cancellation</h2>
      <p>No payments are currently processed: all available features are free and no billing relationship exists yet. The plans on the pricing page describe intended future offerings. Once paid operation begins, paid plans will renew as described there until cancelled, and you may cancel at any time from the dashboard.</p>
      <h2>4. Uptime and support</h2>
      <p>We work to keep StatCheck available and accurate, but monitoring results depend on network conditions outside our control. The service is provided “as is” without guarantees of uninterrupted operation. Support levels (community, standard, priority) depend on your plan.</p>
      <h2>5. Data and privacy</h2>
      <p>Our handling of personal data is described in the Privacy Policy. You remain responsible for the content you publish on public status pages and for ensuring you have the right to monitor the endpoints you add.</p>
      <h2>6. Termination</h2>
      <p>Either party may terminate the agreement at any time. Deleting your account (dashboard → Settings → Danger zone) immediately and permanently removes your monitors, checks, incidents, and status pages, except where longer retention is required by law.</p>
      <h2>7. Liability</h2>
      <p>To the maximum extent permitted by law, StatCheck's liability is limited to the fees paid in the 12 months preceding the claim. Nothing in these Terms limits liability that cannot be limited under applicable law.</p>
      <h2>8. Changes and contact</h2>
      <p>We may update these Terms and will announce material changes by in-product notice. Continued use after the effective date constitutes acceptance.</p>
    </LegalShell>
  );
}
