import { useState } from "react";
import { apiFetch, getErrorMessage } from "../../lib/api";
import type { VBookWithProgress } from "./types";

type Props = {
  vbook: VBookWithProgress;
  onClose: () => void;
  onSuccess: () => void;
};

export default function EditVBookModal({ vbook, onClose, onSuccess }: Props) {
  const [title, setTitle] = useState(vbook.title);
  const [description, setDescription] = useState(vbook.description);
  const [imageUrl, setImageUrl] = useState(vbook.cover_image_url);
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
        credentials: "include",
      });
      const url = await response.text();
      setImageUrl(url);
    } catch (err) {
      setError(getErrorMessage(err, "Image upload failed"));
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await apiFetch("/vbook", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          id: vbook.id,
          title,
          description,
          cover_image_url: imageUrl,
        }),
      });
      onSuccess();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to update vBook"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="rounded-2xl p-6 md:p-8 max-w-lg w-full shadow-xl"
        style={{ background: "var(--gb-bg)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold" style={{ color: "var(--gb-fg)" }}>
            Edit vBook
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 transition-colors"
            style={{ color: "var(--gb-fg-soft)" }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="vbook-title"
              className="block text-sm font-medium"
              style={{ color: "var(--gb-fg-soft)" }}
            >
              Title *
            </label>
            <input
              type="text"
              id="vbook-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="vBook title"
              className="mt-1 block w-full rounded-lg px-4 py-2 shadow-sm transition-colors focus:outline-none"
              style={{
                background: "var(--gb-bg-soft)",
                boxShadow: "var(--gb-shadow-inset)",
                color: "var(--gb-fg)",
              }}
            />
          </div>

          <div>
            <label
              htmlFor="vbook-description"
              className="block text-sm font-medium"
              style={{ color: "var(--gb-fg-soft)" }}
            >
              Description
            </label>
            <textarea
              id="vbook-description"
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this vBook about?"
              className="mt-1 block w-full rounded-lg px-4 py-2 shadow-sm transition-colors focus:outline-none resize-y"
              style={{
                background: "var(--gb-bg-soft)",
                boxShadow: "var(--gb-shadow-inset)",
                color: "var(--gb-fg)",
              }}
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium"
              style={{ color: "var(--gb-fg-soft)" }}
            >
              Cover image
            </label>
            <div className="mt-1 flex items-center gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="block w-full text-sm"
                style={{ color: "var(--gb-fg-muted)" }}
              />
              {isUploading && (
                <p className="text-sm" style={{ color: "var(--gb-fg-muted)" }}>
                  Uploading...
                </p>
              )}
            </div>
            {imageUrl && (
              <img
                src={imageUrl}
                alt="Preview"
                className="mt-4 rounded-lg h-32 w-auto object-cover"
              />
            )}
          </div>

          {error && (
            <p className="text-sm" style={{ color: "var(--gb-error)" }}>
              {error}
            </p>
          )}

          <div
            className="flex justify-end gap-3 pt-4"
            style={{ boxShadow: "inset 0 1px 0 var(--gb-shadow)" }}
          >
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{ background: "var(--gb-bg-soft)", color: "var(--gb-fg-soft)" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || isSubmitting}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              style={{ background: "var(--gb-accent)", color: "var(--gb-bg)" }}
            >
              {isSubmitting ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
