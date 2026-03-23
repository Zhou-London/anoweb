import { useContext, useState } from "react";
import { FanContext } from "../../Contexts/fan_context";
import { useEditMode } from "../../Contexts/edit_mode_context";
import { useErrorNotifier } from "../../Contexts/error_context";
import { apiFetch, getErrorMessage } from "../../lib/api";
import type { Education } from "./types";

type EducationCardProps = {
  education: Education[];
  setEducation: React.Dispatch<React.SetStateAction<Education[]>>;
};

function formatRange(start: string, end: string) {
  const normalize = (value: string) => value?.split("T")[0] || "";
  if (!start && !end) return "Date not provided";
  return `${normalize(start)} – ${normalize(end) || "Present"}`;
}

type EducationRowProps = {
  edu: Education;
  showAdminFeatures: boolean;
  onImageUpload: (edu: Education, e: React.ChangeEvent<HTMLInputElement>) => void;
  uploadingImage: boolean;
  imageError: string | null;
};

function EducationRow({ edu, showAdminFeatures, onImageUpload, uploadingImage, imageError }: EducationRowProps) {
  return (
    <li className="group relative overflow-hidden rounded-2xl p-4 transition-all duration-200" style={{ background: 'var(--gb-bg)', boxShadow: 'var(--gb-shadow-card)' }}>
      <div className="flex items-start gap-4">
        <div className="shrink-0 relative group/img">
          <img
            src={edu.image_url}
            alt={edu.school}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "https://via.placeholder.com/64?text=Edu";
            }}
            className="w-12 h-12 rounded-lg object-cover shadow-sm"
            style={{ background: 'var(--gb-bg)', boxShadow: 'var(--gb-shadow-card)' }}
          />
          {showAdminFeatures && (
            <label className="absolute inset-0 flex items-center justify-center rounded-lg opacity-0 group-hover/img:opacity-100 transition-opacity cursor-pointer" style={{ background: 'var(--gb-overlay)' }}>
              <span className="text-xs font-medium" style={{ color: 'var(--gb-bg)' }}>{uploadingImage ? "..." : "Edit"}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploadingImage}
                onChange={(e) => onImageUpload(edu, e)}
              />
            </label>
          )}
          {imageError && (
            <span className="absolute -bottom-5 left-0 text-xs whitespace-nowrap" style={{ color: 'var(--gb-error)' }}>{imageError}</span>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold truncate" style={{ color: 'var(--gb-fg)' }}>{edu.school}</p>
            <span className="rounded-full text-xs px-2 py-0.5" style={{ background: 'var(--gb-bg)', boxShadow: 'var(--gb-shadow-soft)', color: 'var(--gb-fg-soft)' }}>
              {formatRange(edu.start_date, edu.end_date)}
            </span>
          </div>
          <p className="text-xs truncate" style={{ color: 'var(--gb-fg-muted)' }}>{edu.degree}</p>
          <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--gb-fg-muted)' }}>
            {edu.link ? (
              <a
                href={edu.link}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-semibold"
                style={{ color: 'var(--gb-primary)' }}
              >
                View credential
                <span aria-hidden>↗</span>
              </a>
            ) : (
              <span className="inline-flex items-center gap-1" style={{ color: 'var(--gb-fg-faint)' }}>
                <span className="h-2 w-2 rounded-full" aria-hidden style={{ background: 'var(--gb-bg-muted)' }} />
                No link provided
              </span>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}

export default function EducationCard({ education, setEducation }: EducationCardProps) {
  const { isAdmin } = useContext(FanContext);
  const { editMode } = useEditMode();
  const showAdminFeatures = isAdmin && editMode;
  const notifyError = useErrorNotifier();
  const [uploadingImage, setUploadingImage] = useState<Record<number, boolean>>({});
  const [imageErrors, setImageErrors] = useState<Record<number, string | null>>({});

  const handleImageUpload = async (edu: Education, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage((prev) => ({ ...prev, [edu.id]: true }));
    setImageErrors((prev) => ({ ...prev, [edu.id]: null }));

    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await apiFetch("/education/upload-image", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const img_path = await uploadRes.text();

      await apiFetch("/education/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: edu.id, image_url: img_path }),
      });

      setEducation((prev) => prev.map((item) => (item.id === edu.id ? { ...item, image_url: img_path } : item)));
    } catch (err) {
      const message = getErrorMessage(err, "Upload failed");
      setImageErrors((prev) => ({ ...prev, [edu.id]: message }));
      notifyError(err, "Upload failed");
    } finally {
      setUploadingImage((prev) => ({ ...prev, [edu.id]: false }));
    }
  };

  return (
    <article className="rounded-3xl shadow-lg p-6 md:p-8 h-full flex flex-col gap-4" style={{ background: 'var(--gb-bg)', boxShadow: 'var(--gb-shadow-card)' }}>
      <h2 className="text-2xl font-bold" style={{ color: 'var(--gb-fg)' }}>Education</h2>
      {education.length === 0 ? (
        <div className="flex-1 rounded-2xl grid place-items-center text-sm px-4 py-10" style={{ boxShadow: 'var(--gb-shadow-inset)', background: 'var(--gb-bg-soft)', color: 'var(--gb-fg-muted)' }}>
          No education added yet.
        </div>
      ) : (
        <ul className="space-y-3 flex-1 overflow-auto scrollbar-clear" aria-label="Education history">
          {education.map((edu) => (
            <EducationRow
              key={edu.id}
              edu={edu}
              showAdminFeatures={showAdminFeatures}
              onImageUpload={handleImageUpload}
              uploadingImage={uploadingImage[edu.id] || false}
              imageError={imageErrors[edu.id] || null}
            />
          ))}
        </ul>
      )}
    </article>
  );
}
