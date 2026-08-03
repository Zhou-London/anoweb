import { useState, useContext, useEffect } from "react";
import { FanContext } from "../../Contexts/fan_context";
import { useEditMode } from "../../Contexts/edit_mode_context";
import { apiFetch, getErrorMessage } from "../../lib/api";
import { type Project } from "./types";
import AsyncImage from "../../Components/async_image";

type ProjectDetailsProps = {
  project: Project;
  onProjectUpdate: () => void;
};

export function ProjectDetails({ project, onProjectUpdate }: ProjectDetailsProps) {
  const { isAdmin } = useContext(FanContext);
  const { editMode } = useEditMode();
  const showAdminFeatures = isAdmin && editMode;
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({ ...project });
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  useEffect(() => {
    setFormData({ ...project });
    setIsEditing(false);
    setIsDescriptionExpanded(false);
  }, [project]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setError(null);
    const data = new FormData();
    data.append("file", file);
    try {
      const response = await apiFetch("/static/upload-image", { method: "POST", body: data });
      const url = await response.text();
      setFormData((prev) => ({ ...prev, image_url: url }));
    } catch (err) {
      setError(getErrorMessage(err, "Upload failed"));
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await apiFetch("/project", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData }),
      });
      onProjectUpdate();
      setIsEditing(false);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to update project"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEditing) {
    return (
      <section
        className="rounded-2xl p-4 sm:p-6"
        style={{ background: "var(--gb-bg)", boxShadow: "var(--gb-shadow-card)" }}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="sm:w-48 flex-shrink-0 space-y-2">
              {formData.image_url && (
                <img src={formData.image_url} alt="Preview" className="w-full h-auto rounded-xl object-cover" />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUploading}
                className="text-xs w-full"
                style={{ color: "var(--gb-fg-muted)" }}
              />
              {isUploading && <p className="text-xs" style={{ color: "var(--gb-fg-muted)" }}>Uploading...</p>}
            </div>
            <div className="flex-1 space-y-3">
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Project name"
                className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
                style={{ background: "var(--gb-bg-soft)", boxShadow: "var(--gb-shadow-inset)", color: "var(--gb-fg)" }}
              />
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description"
                rows={4}
                className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
                style={{ background: "var(--gb-bg-soft)", boxShadow: "var(--gb-shadow-inset)", color: "var(--gb-fg)" }}
              />
              <input
                type="url"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                placeholder="https://..."
                className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
                style={{ background: "var(--gb-bg-soft)", boxShadow: "var(--gb-shadow-inset)", color: "var(--gb-fg)" }}
              />
            </div>
          </div>
          {error && <p className="text-sm" style={{ color: "var(--gb-error)" }}>{error}</p>}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-lg text-sm font-medium"
              style={{ background: "var(--gb-bg-soft)", color: "var(--gb-fg-soft)" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
              style={{ background: "var(--gb-primary)", color: "var(--gb-bg)" }}
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </section>
    );
  }

  const descriptionNeedsExpansion = project.description.length > 400;

  return (
    <section className="content-enter">
      {project.image_url && (
        <AsyncImage
          src={project.image_url}
          alt={project.name}
          className="w-full max-w-md rounded-2xl object-cover"
        />
      )}
      <div>
        <div className="flex items-center gap-3">
          <h2
            className="text-xl sm:text-2xl font-bold leading-tight"
            style={{ color: "var(--gb-fg)" }}
          >
            {project.name}
          </h2>
          {project.link && (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium flex-shrink-0 transition-colors"
              style={{ color: "var(--gb-primary)" }}
            >
              Visit →
            </a>
          )}
          {showAdminFeatures && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ml-auto"
              style={{ background: "var(--gb-bg-soft)", color: "var(--gb-fg-soft)" }}
            >
              Edit
            </button>
          )}
        </div>
        {project.description && (
          <div className="mt-2">
            <div
              className={`text-sm leading-relaxed whitespace-pre-wrap overflow-hidden transition-all duration-300 ${
                isDescriptionExpanded ? "max-h-none" : "max-h-[100px]"
              }`}
              style={{
                color: "var(--gb-fg-soft)",
                maskImage: !isDescriptionExpanded && descriptionNeedsExpansion
                  ? "linear-gradient(to bottom, black 50%, transparent 100%)"
                  : "none",
                WebkitMaskImage: !isDescriptionExpanded && descriptionNeedsExpansion
                  ? "linear-gradient(to bottom, black 50%, transparent 100%)"
                  : "none",
              }}
            >
              {project.description}
            </div>
            {descriptionNeedsExpansion && (
              <button
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                className="text-xs font-semibold transition-colors"
                style={{ color: "var(--gb-primary)" }}
              >
                {isDescriptionExpanded ? "Show less" : "Show more"}
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
