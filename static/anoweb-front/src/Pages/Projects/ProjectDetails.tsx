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
      <section className="flex-1 rounded-3xl bg-white/80 backdrop-blur-lg overflow-hidden border border-blue-200/50 flex flex-col p-8 mb-6 min-h-0 shadow-lg">
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-8 h-full">
          {/* Left side: Image Upload */}
          <div className="w-full md:w-1/3 flex flex-col items-center gap-4">
            <img src={formData.image_url} alt="Project preview" className="w-full h-auto max-h-96 object-contain rounded-2xl shadow-md" />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={isUploading}
              className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {isUploading && <p className="text-sm text-slate-500">Uploading...</p>}
          </div>

          {/* Right side: Text Fields and Buttons */}
          <div className="flex-1 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700">Name</label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-700">Description</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={5}
                className="mt-1 block w-full rounded-md border border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="link" className="block text-sm font-medium text-slate-700">Link</label>
              <input
                type="url"
                id="link"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                className="mt-1 block w-full rounded-md border border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex justify-end items-center gap-4 mt-auto pt-4">
              <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 rounded-md text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200">Cancel</button>
              <button type="submit" disabled={isSubmitting || isUploading} className="px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300">
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
    <section className="flex-1 rounded-3xl bg-white/70 backdrop-blur-lg overflow-hidden border border-blue-200/50 flex flex-col md:flex-row gap-8 p-8 mb-6 min-h-0 shadow-lg relative">
      {/* Edit button for admins */}
      {showAdminFeatures && (
        <button
          onClick={() => setIsEditing(true)}
          className="absolute top-4 right-4 bg-white/80 hover:bg-white text-slate-600 font-semibold py-2 px-4 rounded-lg shadow text-sm transition-colors"
        >
          Edit Project
        </button>
      )}
      <div className="w-full md:w-1/3 flex-shrink-0">
        <img
          src={project.image_url}
          alt={project.name}
          className="w-full h-auto max-h-96 object-contain rounded-2xl shadow-md"
        />
      </div>
      <div className="overflow-y-auto custom-scrollbar flex-1 min-w-0">
        <h2 className="text-3xl font-bold text-slate-800 mb-4">{project.name}</h2>
        <div className="relative mb-4">
          <div
            className={`text-slate-700 whitespace-pre-wrap leading-relaxed overflow-hidden transition-all duration-300 ${
              isDescriptionExpanded ? 'max-h-none' : 'max-h-[300px]'
            }`}
            style={{
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
              className="mt-2 text-blue-600 hover:text-blue-800 font-semibold text-sm transition-colors flex items-center gap-1"
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
        <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-semibold transition-colors">
          Visit Project →
        </a>
      </div>
    </section>
  );
}