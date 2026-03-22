import { useState } from "react";
import type { Announcement } from "./types";
import AnnouncementPopup from "../../Components/announcement_popup";

type AnnouncementCardProps = {
  announcement: Announcement | null;
};

export default function AnnouncementCard({ announcement }: AnnouncementCardProps) {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <>
      <div
        className="rounded-2xl sm:rounded-3xl shadow-lg p-4 sm:p-6 md:p-8 h-full flex flex-col"
        style={{ background: 'var(--gb-bg)', boxShadow: 'var(--gb-shadow-card)' }}
      >
        <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 flex items-center gap-2" style={{ color: 'var(--gb-fg)' }}>
          <svg className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: 'var(--gb-accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
          Announcement
        </h2>

        {announcement ? (
          <div
            className="flex-1 flex flex-col cursor-pointer group"
            onClick={() => setShowPopup(true)}
          >
            <div className="flex-1 space-y-2">
              <h3 className="text-base sm:text-lg font-semibold group-hover:opacity-80 transition-opacity" style={{ color: 'var(--gb-fg)' }}>
                {announcement.title}
              </h3>
              <p className="text-sm line-clamp-3" style={{ color: 'var(--gb-fg-soft)' }}>
                {announcement.content_md.replace(/[#*_`~>\[\]()!]/g, "").slice(0, 150)}
              </p>
              {announcement.image_url && (
                <img
                  src={announcement.image_url}
                  alt={announcement.title}
                  className="w-full rounded-xl object-cover mt-2"
                  style={{ maxHeight: 120 }}
                />
              )}
            </div>
            <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid var(--gb-border)' }}>
              <p className="text-xs" style={{ color: 'var(--gb-fg-muted)' }}>
                {new Date(announcement.created_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
              </p>
              <span className="text-xs font-semibold group-hover:gap-2 inline-flex items-center gap-1 transition-all" style={{ color: 'var(--gb-accent)' }}>
                Read more
                <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm" style={{ color: 'var(--gb-fg-muted)' }}>No announcements yet.</p>
          </div>
        )}
      </div>

      {showPopup && announcement && (
        <AnnouncementPopup
          announcement={announcement}
          onClose={() => setShowPopup(false)}
        />
      )}
    </>
  );
}
