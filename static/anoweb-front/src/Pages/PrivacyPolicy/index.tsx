import { Link } from "react-router";

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-0">
      <div
        className="rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8"
        style={{ background: "var(--gb-bg)", boxShadow: "var(--gb-shadow-card)" }}
      >
        <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: "var(--gb-fg)" }}>
          Privacy Policy
        </h1>
        <p className="text-sm mb-6" style={{ color: "var(--gb-fg-muted)" }}>
          Last updated: 23 March 2026
        </p>

        <div className="space-y-6 text-sm leading-relaxed" style={{ color: "var(--gb-fg-soft)" }}>
          <section>
            <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--gb-fg)" }}>
              1. Data Controller
            </h2>
            <p>
              This website, <strong>zhouzhouzhang.co.uk</strong>, is operated by Zhouzhou (JoJo) Zhang.
              If you have any questions about this privacy policy or your personal data, please contact
              me at the email address provided on this site.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--gb-fg)" }}>
              2. What Data We Collect
            </h2>
            <p>We collect the following personal data:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>
                <strong>Account information:</strong> Username, email address, and password (stored as
                a secure hash) when you register an account.
              </li>
              <li>
                <strong>Profile information:</strong> Bio and profile photo, if you choose to provide
                them.
              </li>
              <li>
                <strong>Google OAuth data:</strong> If you sign in with Google, we receive your name,
                email address, and profile picture from Google.
              </li>
              <li>
                <strong>Session tracking data:</strong> For authenticated users who consent, we record
                session start time, end time, and duration to display your session history.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--gb-fg)" }}>
              3. Legal Basis for Processing (GDPR Art. 6)
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Consent (Art. 6(1)(a)):</strong> Session tracking and non-essential cookies are
                only activated with your explicit consent.
              </li>
              <li>
                <strong>Contract (Art. 6(1)(b)):</strong> Processing your account data is necessary to
                provide you with the services you signed up for.
              </li>
              <li>
                <strong>Legitimate interest (Art. 6(1)(f)):</strong> Essential cookies required for
                authentication and basic site functionality.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--gb-fg)" }}>
              4. Cookies and Local Storage
            </h2>
            <p>We use the following storage mechanisms:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>
                <strong>session_token</strong> (cookie, essential) — Keeps you logged in. HTTP-only,
                expires after 7 days.
              </li>
              <li>
                <strong>cookie_consent</strong> (localStorage, essential) — Remembers your cookie
                consent choice.
              </li>
              <li>
                <strong>tracking_session_id</strong> (sessionStorage, requires consent) — Used for
                session duration tracking.
              </li>
              <li>
                <strong>guest_popup_dismissed</strong> (sessionStorage, functional) — Prevents the
                guest popup from reappearing during a session.
              </li>
              <li>
                <strong>announcement_last_read_id</strong> (localStorage, functional) — Remembers
                which announcements you have read.
              </li>
              <li>
                <strong>theme</strong> (localStorage, functional) — Remembers your light/dark mode
                preference.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--gb-fg)" }}>
              5. Third-Party Services
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Google OAuth:</strong> Used for sign-in. Google receives data according to
                their own{" "}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--gb-primary)" }}
                >
                  Privacy Policy
                </a>
                .
              </li>
              <li>
                <strong>Google Fonts:</strong> We load the Bebas Neue font from Google Fonts. Google
                may receive your IP address when the font is loaded. See{" "}
                <a
                  href="https://developers.google.com/fonts/faq/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--gb-primary)" }}
                >
                  Google Fonts Privacy
                </a>
                .
              </li>
              <li>
                <strong>Gmail SMTP:</strong> Used to send verification emails to your registered email
                address.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--gb-fg)" }}>
              6. Data Retention
            </h2>
            <p>
              Your account data is retained for as long as your account is active. Session tracking
              records are retained for up to 12 months. You may request deletion of your account and
              all associated data at any time from your{" "}
              <Link to="/account" style={{ color: "var(--gb-primary)" }}>
                Account Settings
              </Link>{" "}
              page.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--gb-fg)" }}>
              7. Your Rights (GDPR)
            </h2>
            <p>Under the General Data Protection Regulation, you have the right to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>
                <strong>Access</strong> — Request a copy of the personal data we hold about you.
              </li>
              <li>
                <strong>Rectification</strong> — Correct inaccurate personal data.
              </li>
              <li>
                <strong>Erasure</strong> — Request deletion of your account and personal data ("right
                to be forgotten").
              </li>
              <li>
                <strong>Restrict processing</strong> — Ask us to limit how we use your data.
              </li>
              <li>
                <strong>Data portability</strong> — Receive your data in a structured, machine-readable
                format.
              </li>
              <li>
                <strong>Object</strong> — Object to processing based on legitimate interest.
              </li>
              <li>
                <strong>Withdraw consent</strong> — Withdraw consent at any time for consent-based
                processing.
              </li>
            </ul>
            <p className="mt-2">
              To exercise any of these rights, please contact me or use the account deletion feature
              in your Account Settings.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--gb-fg)" }}>
              8. Data Security
            </h2>
            <p>
              We take reasonable measures to protect your personal data. Passwords are stored using
              secure one-way hashing. Session tokens are HTTP-only cookies to prevent XSS attacks.
              However, no method of transmission over the internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--gb-fg)" }}>
              9. International Data Transfers
            </h2>
            <p>
              By using Google OAuth and Google Fonts, some data may be transferred to servers outside
              the European Economic Area (EEA). Google participates in data protection frameworks to
              ensure adequate protection of your data.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--gb-fg)" }}>
              10. Changes to This Policy
            </h2>
            <p>
              We may update this privacy policy from time to time. Any changes will be posted on this
              page with an updated "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--gb-fg)" }}>
              11. Complaints
            </h2>
            <p>
              If you believe your data protection rights have been violated, you have the right to
              lodge a complaint with the UK Information Commissioner's Office (ICO) at{" "}
              <a
                href="https://ico.org.uk"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--gb-primary)" }}
              >
                ico.org.uk
              </a>{" "}
              or with your local EU data protection authority.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
