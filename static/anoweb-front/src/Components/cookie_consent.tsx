import { useState, useEffect } from "react";
import { Link } from "react-router";

export type CookieConsent = "all" | "essential" | null;

export function getCookieConsent(): CookieConsent {
  const value = localStorage.getItem("cookie_consent");
  if (value === "all" || value === "essential") return value;
  return null;
}

export function hasTrackingConsent(): boolean {
  return getCookieConsent() === "all";
}

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (getCookieConsent() === null) {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const accept = (level: "all" | "essential") => {
    localStorage.setItem("cookie_consent", level);
    setVisible(false);
    if (level === "all") {
      window.dispatchEvent(new Event("cookie-consent-granted"));
    }
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[60] p-4"
      style={{ background: "var(--gb-bg-soft)", boxShadow: "0 -2px 16px var(--gb-shadow-strong)" }}
    >
      <div className="mx-auto max-w-4xl flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1 text-sm" style={{ color: "var(--gb-fg-soft)" }}>
          <p>
            This site uses cookies and similar technologies. Essential cookies are required for
            authentication and basic functionality. Optional cookies are used for session tracking.
            Read our{" "}
            <Link to="/privacy" style={{ color: "var(--gb-primary)", textDecoration: "underline" }}>
              Privacy Policy
            </Link>{" "}
            for more details.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => accept("essential")}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{ background: "var(--gb-bg-muted)", color: "var(--gb-fg-soft)" }}
          >
            Essential Only
          </button>
          <button
            onClick={() => accept("all")}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{ background: "var(--gb-primary)", color: "var(--gb-bg)" }}
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
