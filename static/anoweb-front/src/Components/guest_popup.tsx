import { useEffect, useState, useContext } from "react";
import { FanContext } from "../Contexts/fan_context";
import { apiJson } from "../lib/api";

interface PopupConfig {
  id: number;
  title: string;
  benefits: string; // JSON string array
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
    // Don't show if fan is logged in or popup has already been shown
    if (fan || hasShown) return;

    // Check if fan has dismissed the popup in this session
    const dismissed = sessionStorage.getItem("guest_popup_dismissed");
    if (dismissed) return;

    const fetchConfig = async () => {
      try {
        const data = await apiJson<PopupConfig>("/guest-popup/active", {
          credentials: "include",
        });
        setConfig(data);
        
        // Parse benefits JSON
        try {
          const parsedBenefits = JSON.parse(data.benefits);
          setBenefits(Array.isArray(parsedBenefits) ? parsedBenefits : []);
        } catch {
          setBenefits([]);
        }

        // Show popup after a short delay
        setTimeout(() => {
          setIsVisible(true);
          setHasShown(true);
        }, 2000);
      } catch (err) {
        // If no config found, don't show popup
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
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
        onClick={handleClose}
      />

      {/* Popup */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 md:p-10 animate-in fade-in zoom-in duration-300">
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
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
            <div className="inline-flex h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white items-center justify-center text-4xl shadow-lg">
              ✨
            </div>

            {/* Title */}
            <div>
              <h2 className="text-3xl font-bold text-slate-900">{config.title}</h2>
              <p className="text-slate-600 mt-2">
                Join our community and unlock amazing features!
              </p>
            </div>

            {/* Benefits */}
            {benefits.length > 0 && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 text-left">
                <p className="text-sm font-semibold text-indigo-600 mb-3">
                  What you'll get
                </p>
                <ul className="space-y-2">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold">
                        ✓
                      </span>
                      <span className="text-slate-700 leading-relaxed">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleSignUp}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
              >
                Sign Up Now
              </button>
              <button
                onClick={handleClose}
                className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-full font-semibold hover:bg-slate-200 transition-colors"
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
