import { useEffect, useState, useContext } from "react";
import { FanContext } from "../Contexts/fan_context";
import { apiJson } from "../lib/api";

interface PopupConfig {
  id: number;
  title: string;
  benefits: string;
  is_active: boolean;
}

interface GuestPopupProps {
  onOpenAuth: () => void;
}

export default function GuestPopup({ onOpenAuth }: GuestPopupProps) {
  const { fan } = useContext(FanContext);
  const [config, setConfig] = useState<PopupConfig | null>(null);
  const [benefits, setBenefits] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    if (fan || hasShown) return;

    const dismissed = sessionStorage.getItem("guest_popup_dismissed");
    if (dismissed) return;

    const fetchConfig = async () => {
      try {
        const data = await apiJson<PopupConfig>("/guest-popup/active", {
          credentials: "include",
        });
        setConfig(data);

        try {
          const parsedBenefits = JSON.parse(data.benefits);
          setBenefits(Array.isArray(parsedBenefits) ? parsedBenefits : []);
        } catch {
          setBenefits([]);
        }

        setTimeout(() => {
          setIsVisible(true);
          setHasShown(true);
        }, 2000);
      } catch (err) {
        console.log("No active guest popup configuration");
      }
    };

    fetchConfig();
  }, [fan, hasShown]);

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem("guest_popup_dismissed", "true");
  };

  const handleSignUp = () => {
    handleClose();
    onOpenAuth();
  };

  if (!isVisible || !config) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 backdrop-blur-sm z-40 transition-opacity"
        style={{ background: 'var(--gb-overlay)' }}
        onClick={handleClose}
      />

      {/* Popup */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="relative rounded-3xl shadow-2xl max-w-lg w-full p-8 md:p-10 animate-in fade-in zoom-in duration-300"
          style={{ background: 'var(--gb-bg)' }}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 transition-colors"
            style={{ color: 'var(--gb-fg-muted)' }}
            aria-label="Close"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Content */}
          <div className="text-center space-y-6">
            {/* Icon */}
            <div
              className="inline-flex h-20 w-20 rounded-full items-center justify-center text-4xl shadow-lg"
              style={{ background: 'var(--gb-yellow)', color: 'var(--gb-bg)' }}
            >
              *
            </div>

            {/* Title */}
            <div>
              <h2 className="text-3xl font-bold" style={{ color: 'var(--gb-fg)' }}>{config.title}</h2>
              <p className="mt-2" style={{ color: 'var(--gb-fg-muted)' }}>
                Join our community and unlock amazing features!
              </p>
            </div>

            {/* Benefits */}
            {benefits.length > 0 && (
              <div
                className="rounded-2xl p-6 text-left"
                style={{ background: 'var(--gb-bg-soft)' }}
              >
                <p className="text-sm font-semibold mb-3" style={{ color: 'var(--gb-accent)' }}>
                  What you'll get
                </p>
                <ul className="space-y-2">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span
                        className="flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center text-sm font-bold"
                        style={{ background: 'var(--gb-success)', color: 'var(--gb-bg)' }}
                      >
                        +
                      </span>
                      <span className="leading-relaxed" style={{ color: 'var(--gb-fg-soft)' }}>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleSignUp}
                className="flex-1 px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                style={{ background: 'var(--gb-primary)', color: 'var(--gb-bg)' }}
              >
                Sign Up Now
              </button>
              <button
                onClick={handleClose}
                className="flex-1 px-6 py-3 rounded-full font-semibold transition-colors"
                style={{ background: 'var(--gb-bg-soft)', color: 'var(--gb-fg-soft)' }}
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
