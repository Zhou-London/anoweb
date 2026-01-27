import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { apiFetch } from "../lib/api";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link");
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await apiFetch(`/auth/verify-email?token=${token}`, {
          credentials: "include",
        });
        const data = await response.json();
        setStatus("success");
        setMessage(data.message || "Email verified successfully!");
      } catch (err) {
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "Failed to verify email");
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--gb-bg)' }}>
      <div className="rounded-2xl shadow-xl max-w-md w-full p-8" style={{ background: 'var(--gb-bg-soft)', border: '1px solid var(--gb-border)' }}>
        {status === "verifying" && (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 mb-4" style={{ border: '4px solid var(--gb-primary)', borderTopColor: 'transparent' }}></div>
            <h2 className="text-2xl font-semibold mb-2" style={{ color: 'var(--gb-fg)' }}>Verifying Email...</h2>
            <p style={{ color: 'var(--gb-fg-soft)' }}>Please wait while we verify your email address.</p>
          </div>
        )}

        {status === "success" && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ background: 'var(--gb-success)', color: 'var(--gb-bg)' }}>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-2" style={{ color: 'var(--gb-fg)' }}>Email Verified!</h2>
            <p className="mb-6" style={{ color: 'var(--gb-fg-soft)' }}>{message}</p>
            <Link
              to="/"
              className="inline-block px-6 py-3 rounded-lg font-medium transition-colors"
              style={{ background: 'var(--gb-primary)', color: 'var(--gb-bg)' }}
            >
              Go to Home
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ background: 'var(--gb-error)', color: 'var(--gb-bg)' }}>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-2" style={{ color: 'var(--gb-fg)' }}>Verification Failed</h2>
            <p className="mb-6" style={{ color: 'var(--gb-fg-soft)' }}>{message}</p>
            <Link
              to="/"
              className="inline-block px-6 py-3 rounded-lg font-medium transition-colors"
              style={{ background: 'var(--gb-primary)', color: 'var(--gb-bg)' }}
            >
              Go to Home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
