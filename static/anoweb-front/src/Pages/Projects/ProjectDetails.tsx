// src/components/ProjectPage/ProjectDetails.tsx

import { useState, useContext, useEffect } from "react";
import { FanContext } from "../../Contexts/fan_context";
import { useEditMode } from "../../Contexts/edit_mode_context";
import { apiFetch } from "../../lib/api";
import { type Project } from "./types";

type ProjectDetailsProps = {
  project: Project;
  onProjectUpdate: () => void; // Callback to refresh the project list
};

export function ProjectDetails({ project, onProjectUpdate }: ProjectDetailsProps) {
  const { isAdmin } = useContext(FanContext);
  const { editMode } = useEditMode();
  const showAdminFeatures = isAdmin && editMode;
  const [isEditing, setIsEditing] = useState(false);

  // State to hold form data during editing
  const [formData, setFormData] = useState({ ...project });
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  // When the selected project changes, reset the form data
  useEffect(() => {
    setFormData({ ...project });
    setIsEditing(false); // Exit edit mode if another project is selected
    setIsDescriptionExpanded(false); // Reset expand state
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
      if (!response.ok) throw new Error("Image upload failed");
      const url = await response.text();
      setFormData((prev) => ({ ...prev, image_url: url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await apiFetch("/project", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData }),
      });
      if (!response.ok) throw new Error("Failed to update project");

      onProjectUpdate(); // Refresh the main project list to show changes
      setIsEditing(false); // Exit edit mode
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render the editable form when in edit mode
  if (isEditing) {
    return (
      <section className="flex-1 rounded-3xl backdrop-blur-lg overflow-hidden flex flex-col p-4 sm:p-6 md:p-8 mb-6 min-h-0 shadow-lg" style={{ background: 'var(--gb-bg)', border: '1px solid var(--gb-primary)' }}>
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-6 md:gap-8 h-full">
          {/* Left side: Image Upload */}
          <div className="w-full md:w-1/3 flex flex-col items-center gap-4">
            <img src={formData.image_url} alt="Project preview" className="w-full h-auto max-h-64 sm:max-h-96 object-contain rounded-2xl shadow-md" />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={isUploading}
              className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold w-full"
              style={{ color: 'var(--gb-fg-muted)' }}
            />
            {isUploading && <p className="text-sm" style={{ color: 'var(--gb-fg-muted)' }}>Uploading...</p>}
          </div>

          {/* Right side: Text Fields and Buttons */}
          <div className="flex-1 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
            <div>
              <label htmlFor="name" className="block text-sm font-medium" style={{ color: 'var(--gb-fg-soft)' }}>Name</label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md shadow-sm p-2 focus:outline-none"
                style={{ background: 'var(--gb-bg-soft)', border: '1px solid var(--gb-border)', color: 'var(--gb-fg)' }}
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium" style={{ color: 'var(--gb-fg-soft)' }}>Description</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={5}
                className="mt-1 block w-full rounded-md shadow-sm p-2 focus:outline-none"
                style={{ background: 'var(--gb-bg-soft)', border: '1px solid var(--gb-border)', color: 'var(--gb-fg)' }}
              />
            </div>
            <div>
              <label htmlFor="link" className="block text-sm font-medium" style={{ color: 'var(--gb-fg-soft)' }}>Link</label>
              <input
                type="url"
                id="link"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                className="mt-1 block w-full rounded-md shadow-sm p-2 focus:outline-none"
                style={{ background: 'var(--gb-bg-soft)', border: '1px solid var(--gb-border)', color: 'var(--gb-fg)' }}
              />
            </div>
            {error && <p className="text-sm" style={{ color: 'var(--gb-error)' }}>{error}</p>}
            <div className="flex flex-col-reverse sm:flex-row justify-end items-stretch sm:items-center gap-3 sm:gap-4 mt-auto pt-4">
              <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 rounded-md text-sm font-medium" style={{ background: 'var(--gb-bg-soft)', color: 'var(--gb-fg-soft)' }}>Cancel</button>
              <button type="submit" disabled={isSubmitting || isUploading} className="px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50" style={{ background: 'var(--gb-primary)', color: 'var(--gb-bg)' }}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      </section>
    );
  }

  // Default: Render the static view
  // Check if description is long enough to need expansion
  const descriptionNeedsExpansion = project.description.length > 400; // rough character count

  return (
    <section className="flex-1 rounded-3xl backdrop-blur-lg overflow-hidden flex flex-col md:flex-row gap-6 md:gap-8 p-4 sm:p-6 md:p-8 mb-6 min-h-0 shadow-lg relative" style={{ background: 'var(--gb-bg)', border: '1px solid var(--gb-border)' }}>
      {/* Edit button for admins */}
      {showAdminFeatures && (
        <button
          onClick={() => setIsEditing(true)}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 font-semibold py-1.5 px-3 sm:py-2 sm:px-4 rounded-lg shadow text-xs sm:text-sm transition-colors z-10"
          style={{ background: 'var(--gb-bg-soft)', color: 'var(--gb-fg-soft)' }}
        >
          Edit
        </button>
      )}
      <div className="w-full md:w-1/3 flex-shrink-0">
        <img
          src={project.image_url}
          alt={project.name}
          className="w-full h-auto max-h-64 sm:max-h-96 object-contain rounded-2xl shadow-md"
        />
      </div>
      <div className="overflow-y-auto custom-scrollbar flex-1 min-w-0">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 pr-16 md:pr-0" style={{ color: 'var(--gb-fg)' }}>{project.name}</h2>
        <div className="relative mb-4">
          <div
            className={`whitespace-pre-wrap leading-relaxed overflow-hidden transition-all duration-300 ${
              isDescriptionExpanded ? 'max-h-none' : 'max-h-[300px]'
            }`}
            style={{
              color: 'var(--gb-fg-soft)',
              maskImage: !isDescriptionExpanded && descriptionNeedsExpansion
                ? 'linear-gradient(to bottom, black 60%, transparent 100%)'
                : 'none',
              WebkitMaskImage: !isDescriptionExpanded && descriptionNeedsExpansion
                ? 'linear-gradient(to bottom, black 60%, transparent 100%)'
                : 'none'
            }}
          >
            {project.description}
          </div>
          {descriptionNeedsExpansion && (
            <button
              onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
              className="mt-2 font-semibold text-sm transition-colors flex items-center gap-1"
              style={{ color: 'var(--gb-primary)' }}
            >
              {isDescriptionExpanded ? (
                <>
                  Show less
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </>
              ) : (
                <>
                  Show more
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </>
              )}
            </button>
          )}
        </div>
        <a href={project.link} target="_blank" rel="noopener noreferrer" className="font-semibold transition-colors" style={{ color: 'var(--gb-primary)' }}>
          Visit Project →
        </a>
      </div>
    </section>
  );
}
