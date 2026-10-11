import { LegalShell } from "@/components/Legal";
import { CookieSettingsButton } from "@/components/CookieConsent";
import { InlineCode } from "@/components/CodeBlock";
export const metadata = { title: "Cookie Policy" };
export default function Page() {
  return (
    <LegalShell title="Cookie Policy" updated="January 15, 2026">
      <p>StatCheck uses a minimal set of cookies and similar storage. We do not use third-party advertising or cross-site tracking cookies.</p>
      <h2>1. Strictly necessary (no consent required)</h2>
      <p><strong>Session / authentication</strong> (<InlineCode>sc_session</InlineCode>) — keeps you signed in (legal basis: Art. 6(1)(b) GDPR). <strong>Security (rate limiting)</strong> — protects forms and the API against abuse (Art. 6(1)(f) GDPR). <strong>Consent preferences</strong> — remembers your cookie choice on your device until you clear it.</p>
      <h2>2. Preferences and analytics (consent-based)</h2>
      <p>We only set analytics or preference cookies beyond the strictly-necessary set with your prior consent via the cookie banner (Art. 6(1)(a) GDPR, § 25 TDDDG). Current deployment sets no optional cookies by default.</p>
      <h2>3. Managing cookies</h2>
      <p>You can change your choice at any time using the button below, the cookie badge in the bottom-left corner, or through your browser settings. Blocking strictly-necessary cookies may prevent sign-in.</p>
      <p><CookieSettingsButton /></p>
      <h2>4. Contact</h2>
      <p>Questions about cookies: <a href="mailto:contact@statcheck.com" className="underline">contact@statcheck.com</a>.</p>
    </LegalShell>
  );
}
