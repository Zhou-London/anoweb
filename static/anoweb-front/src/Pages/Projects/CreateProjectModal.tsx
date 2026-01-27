// src/components/ProjectPage/CreateProjectModal.tsx

import { useState } from "react";
import { apiFetch } from "../../lib/api";

type CreateProjectModalProps = {
  onClose: () => void;
  onSuccess: () => void; // Callback to refresh the project list
};

export default function CreateProjectModal({ onClose, onSuccess }: CreateProjectModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await apiFetch("/static/upload-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Image upload failed");
      }

      const url = await response.text();
      setImageUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !imageUrl) {
      setError("Project Name and Image are required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await apiFetch("/project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, link, image_url: imageUrl }),
      });

      if (!response.ok) {
        throw new Error("Failed to create project");
      }

      onSuccess(); // Trigger project list refresh
      onClose();   // Close modal
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="rounded-2xl p-8 max-w-2xl w-full shadow-xl" style={{ background: 'var(--gb-bg)' }} onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--gb-fg)' }}>Create New Project</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium" style={{ color: 'var(--gb-fg-soft)' }}>Project Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 block w-full rounded-md shadow-sm focus:outline-none p-2"
              style={{ background: 'var(--gb-bg-soft)', border: '1px solid var(--gb-border)', color: 'var(--gb-fg)' }}
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium" style={{ color: 'var(--gb-fg-soft)' }}>Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="mt-1 block w-full rounded-md shadow-sm focus:outline-none p-2"
              style={{ background: 'var(--gb-bg-soft)', border: '1px solid var(--gb-border)', color: 'var(--gb-fg)' }}
            />
          </div>
          <div>
            <label htmlFor="link" className="block text-sm font-medium" style={{ color: 'var(--gb-fg-soft)' }}>Project Link</label>
            <input
              type="url"
              id="link"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="mt-1 block w-full rounded-md shadow-sm focus:outline-none p-2"
              style={{ background: 'var(--gb-bg-soft)', border: '1px solid var(--gb-border)', color: 'var(--gb-fg)' }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium" style={{ color: 'var(--gb-fg-soft)' }}>Cover Image</label>
            <div className="mt-1 flex items-center gap-4">
              <input type="file" accept="image/*" onChange={handleImageUpload} className="block w-full text-sm" style={{ color: 'var(--gb-fg-muted)' }} />
              {isUploading && <p className="text-sm" style={{ color: 'var(--gb-fg-muted)' }}>Uploading...</p>}
            </div>
            {imageUrl && <img src={imageUrl} alt="Preview" className="mt-4 rounded-lg h-32 w-auto object-cover" />}
          </div>

          {error && <p className="text-sm" style={{ color: 'var(--gb-error)' }}>{error}</p>}

          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-sm font-medium" style={{ background: 'var(--gb-bg-soft)', color: 'var(--gb-fg-soft)' }}>Cancel</button>
            <button type="submit" disabled={isUploading || isSubmitting} className="px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50" style={{ background: 'var(--gb-primary)', color: 'var(--gb-bg)' }}>
              {isSubmitting ? "Creating..." : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
