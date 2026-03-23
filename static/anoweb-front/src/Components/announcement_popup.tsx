import { useEffect, useState, useCallback } from "react";
import MDEditor from "@uiw/react-md-editor";
import { apiJson } from "../lib/api";

interface AnnouncementData {
  id: number;
  title: string;
  content_md: string;
  image_url: string;
  created_at: string;
}

interface AnnouncementPopupProps {
  /** If provided, show this specific announcement instead of fetching latest */
  announcement?: AnnouncementData | null;
  onClose?: () => void;
}

export default function AnnouncementPopup({ announcement: propAnnouncement, onClose }: AnnouncementPopupProps) {
  const [data, setData] = useState<AnnouncementData | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [animState, setAnimState] = useState<"entering" | "visible" | "exiting" | "hidden">("hidden");

  useEffect(() => {
    if (propAnnouncement) {
      setData(propAnnouncement);
      setIsVisible(true);
      return;
    }

    const lastReadId = parseInt(localStorage.getItem("announcement_last_read_id") || "0", 10);

    const fetchLatest = async () => {
      try {
        const res = await apiJson<{ announcement: AnnouncementData }>("/announcement/latest", {
          credentials: "include",
        });
        const a = res.announcement;
        if (!a || a.id <= lastReadId) return;

        const waitForGuestPopup = () => {
          const guestDismissed = sessionStorage.getItem("guest_popup_dismissed");
          if (guestDismissed || guestDismissed === null) {
            setTimeout(() => {
              setData(a);
              setIsVisible(true);
            }, 2500);
          } else {
            setTimeout(waitForGuestPopup, 500);
          }
        };
        waitForGuestPopup();
      } catch {
        // No announcements
      }
    };

    fetchLatest();
  }, [propAnnouncement]);

  // Drive enter animation
  useEffect(() => {
    if (isVisible && data) {
      setAnimState("entering");
      const t = requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimState("visible"));
      });
      return () => cancelAnimationFrame(t);
    }
  }, [isVisible, data]);

  const handleClose = useCallback(() => {
    setAnimState("exiting");
    setTimeout(() => {
      setAnimState("hidden");
      setIsVisible(false);
      if (data) {
        const currentLastRead = parseInt(localStorage.getItem("announcement_last_read_id") || "0", 10);
        if (data.id > currentLastRead) {
          localStorage.setItem("announcement_last_read_id", String(data.id));
        }
      }
      onClose?.();
    }, 280);
  }, [data, onClose]);

  if (animState === "hidden" || !data) return null;

  const backdropStyle: React.CSSProperties = {
    background: 'var(--gb-overlay)',
    opacity: animState === "visible" ? 1 : 0,
    transition: 'opacity 0.28s cubic-bezier(0.22, 1, 0.36, 1)',
  };

  const cardStyle: React.CSSProperties = {
    background: 'var(--gb-bg)',
    opacity: animState === "visible" ? 1 : 0,
    transform: animState === "visible" ? 'scale(1) translateY(0)' : 'scale(0.92) translateY(24px)',
    transition: 'opacity 0.28s cubic-bezier(0.22, 1, 0.36, 1), transform 0.28s cubic-bezier(0.22, 1, 0.36, 1)',
  };

  return (
    <>
      <div
        className="fixed inset-0 backdrop-blur-sm z-40"
        style={backdropStyle}
        onClick={handleClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="relative rounded-3xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto pointer-events-auto"
          style={cardStyle}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 transition-colors rounded-full p-1"
            style={{ color: 'var(--gb-fg-muted)' }}
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="p-6 sm:p-8 space-y-4">
            {/* Title */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--gb-accent)' }}>Announcement</p>
              <h2 className="text-xl sm:text-2xl font-bold pr-8" style={{ color: 'var(--gb-fg)' }}>{data.title}</h2>
              <p className="text-xs mt-1" style={{ color: 'var(--gb-fg-muted)' }}>
                {new Date(data.created_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>

            {/* Markdown Content */}
            <div data-color-mode="light">
              <MDEditor.Markdown
                source={data.content_md}
                style={{ background: 'transparent', color: 'var(--gb-fg)' }}
              />
            </div>

            {/* Image */}
            {data.image_url && (
              <img
                src={data.image_url}
                alt={data.title}
                className="w-full rounded-xl object-cover"
                style={{ maxHeight: 300 }}
              />
            )}

            {/* Dismiss */}
            <button
              onClick={handleClose}
              className="w-full rounded-full px-6 py-3 font-semibold text-sm shadow-sm transition-all hover:shadow-md"
              style={{ background: 'var(--gb-primary)', color: 'var(--gb-bg)' }}
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
