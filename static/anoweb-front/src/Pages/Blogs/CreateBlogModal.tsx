import { useState } from "react";
import { apiFetch } from "../../lib/api";

type CreateBlogModalProps = {
  onClose: () => void;
  onSuccess: () => void;
};

export default function CreateBlogModal({ onClose, onSuccess }: CreateBlogModalProps) {
  const [title, setTitle] = useState("");
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
        credentials: "include",
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
    if (!title) {
      setError("Blog title is required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await apiFetch("/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title, content_md: "", image_url: imageUrl }),
      });

      if (!response.ok) {
        throw new Error("Failed to create blog");
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
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
        style={{ background: 'var(--gb-bg)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold" style={{ color: 'var(--gb-fg)' }}>Create New Blog</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 transition-colors"
            style={{ color: 'var(--gb-fg-soft)' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium" style={{ color: 'var(--gb-fg-soft)' }}>
              Blog Title *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Enter your blog title"
              className="mt-1 block w-full rounded-lg px-4 py-2 shadow-sm transition-colors focus:outline-none"
              style={{ background: 'var(--gb-bg-soft)', border: '1px solid var(--gb-border)', color: 'var(--gb-fg)' }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium" style={{ color: 'var(--gb-fg-soft)' }}>Cover Image (optional)</label>
            <div className="mt-1 flex items-center gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="block w-full text-sm"
                style={{ color: 'var(--gb-fg-muted)' }}
              />
              {isUploading && <p className="text-sm" style={{ color: 'var(--gb-fg-muted)' }}>Uploading...</p>}
            </div>
            {imageUrl && (
              <img src={imageUrl} alt="Preview" className="mt-4 rounded-lg h-32 w-auto object-cover" />
            )}
          </div>

          {error && <p className="text-sm" style={{ color: 'var(--gb-error)' }}>{error}</p>}

          <div className="flex justify-end gap-3 pt-4" style={{ borderTop: '1px solid var(--gb-border)' }}>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{ background: 'var(--gb-bg-soft)', color: 'var(--gb-fg-soft)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || isSubmitting}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              style={{ background: 'var(--gb-accent)', color: 'var(--gb-bg)' }}
            >
              {isSubmitting ? "Creating..." : "Create Blog"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
