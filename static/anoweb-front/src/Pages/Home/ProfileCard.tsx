import { useContext, useState } from "react";
import { FanContext } from "../../Contexts/fan_context";
import { useEditMode } from "../../Contexts/edit_mode_context";
import { useErrorNotifier } from "../../Contexts/error_context";
import { apiFetch } from "../../lib/api";
import type { Profile } from "./types";

type ProfileCardProps = {
  profile: Profile | null;
};

const fields = [
  { label: "Email", key: "email" as const, buildHref: (value: string) => `mailto:${value}` },
  { label: "Github", key: "github" as const, buildHref: (value: string) => value },
  { label: "LinkedIn", key: "linkedin" as const, buildHref: (value: string) => value },
];

export default function ProfileCard({ profile }: ProfileCardProps) {
  const { isAdmin } = useContext(FanContext);
  const { editMode } = useEditMode();
  const showAdminFeatures = isAdmin && editMode;
  const notifyError = useErrorNotifier();
  const [uploading, setUploading] = useState(false);
  const [imageKey, setImageKey] = useState(Date.now());

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      await apiFetch("/profile/upload-image", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      setImageKey(Date.now());
    } catch (err) {
      notifyError(err, "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  if (!profile) {
    return (
      <div className="rounded-2xl sm:rounded-3xl shadow-lg p-4 sm:p-6 w-full animate-pulse h-[300px] sm:h-[420px]" style={{ background: 'var(--gb-bg)', boxShadow: 'var(--gb-shadow-card)' }} />
    );
  }

  return (
    <article className="relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-lg p-4 sm:p-6 md:p-8" style={{ background: 'var(--gb-bg)', boxShadow: 'var(--gb-shadow-card)' }}>
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
        <div className="shrink-0 relative group/img">
          <img
            src={`/image/profile-img.png?v=${imageKey}`}
            alt="Profile"
            className="w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-xl sm:rounded-2xl object-cover shadow-sm"
            style={{ boxShadow: 'var(--gb-shadow-card)' }}
          />
          {showAdminFeatures && (
            <label className="absolute inset-0 flex items-center justify-center rounded-xl sm:rounded-2xl opacity-0 group-hover/img:opacity-100 transition-opacity cursor-pointer" style={{ background: 'var(--gb-overlay)' }}>
              <span className="text-sm font-medium" style={{ color: 'var(--gb-bg)' }}>{uploading ? "Uploading..." : "Edit"}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={handleImageUpload}
              />
            </label>
          )}
        </div>
        <div className="min-w-0 space-y-3 sm:space-y-4 flex-1 text-center sm:text-left">
          <div className="space-y-1 sm:space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--gb-fg)' }}>{profile.name}</h2>
            <p className="text-sm sm:text-base leading-relaxed whitespace-pre-line" style={{ color: 'var(--gb-fg-soft)' }}>{profile.bio}</p>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1 sm:pt-2">
            {fields.map((field) => {
              const value = profile[field.key];
              const href = value ? field.buildHref(value) : undefined;
              const isDisabled = !href;

              return (
                <button
                  key={field.key}
                  type="button"
                  className="inline-flex items-center justify-center px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200"
                  style={{
                    background: isDisabled ? 'var(--gb-bg-muted)' : 'var(--gb-bg-soft)',
                    color: isDisabled ? 'var(--gb-fg-faint)' : 'var(--gb-fg-soft)',
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                  }}
                  onClick={() => href && window.open(href, "_blank", "noopener,noreferrer")}
                  disabled={isDisabled}
                >
                  {field.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </article>
  );
}
