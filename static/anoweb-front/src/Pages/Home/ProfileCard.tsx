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

      const res = await apiFetch("/profile/upload-image", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) throw new Error("Image upload failed");
      setImageKey(Date.now());
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  if (!profile) {
    return (
      <div className="rounded-3xl shadow-lg p-6 w-full animate-pulse h-[420px]" style={{ background: 'var(--gb-bg)', boxShadow: 'var(--gb-shadow-card)' }} />
    );
  }

  return (
    <article className="relative overflow-hidden rounded-3xl shadow-lg p-6 md:p-8" style={{ background: 'var(--gb-bg)', boxShadow: 'var(--gb-shadow-card)' }}>
      <div className="flex items-start gap-6">
        <div className="shrink-0 relative group/img">
          <img
            src={`/image/profile-img.png?v=${imageKey}`}
            alt="Profile"
            className="w-36 h-36 md:w-40 md:h-40 rounded-2xl object-cover shadow-sm"
            style={{ boxShadow: 'var(--gb-shadow-card)' }}
          />
          {showAdminFeatures && (
            <label className="absolute inset-0 flex items-center justify-center rounded-2xl opacity-0 group-hover/img:opacity-100 transition-opacity cursor-pointer" style={{ background: 'var(--gb-overlay)' }}>
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
        <div className="min-w-0 space-y-4 flex-1">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold" style={{ color: 'var(--gb-fg)' }}>{profile.name}</h2>
            <p className="leading-relaxed whitespace-pre-line" style={{ color: 'var(--gb-fg-soft)' }}>{profile.bio}</p>
          </div>

          <div className="flex items-center gap-2 pt-2">
            {fields.map((field) => {
              const value = profile[field.key];
              const href = value ? field.buildHref(value) : undefined;
              const isDisabled = !href;

              return (
                <button
                  key={field.key}
                  type="button"
                  className="inline-flex items-center justify-center px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200"
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
