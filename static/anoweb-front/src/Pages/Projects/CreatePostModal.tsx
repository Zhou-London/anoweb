// src/components/ProjectPage/CreatePostModal.tsx

import { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";

type CreatePostModalProps = {
  onClose: () => void;
  onSuccess: () => void;
  parentId: number;
};

export default function CreatePostModal({
  onClose,
  onSuccess,
  parentId,
}: CreatePostModalProps) {
  const [name, setName] = useState("");
  const [contentMD, setContentMD] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/static/upload-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Image upload failed");
      }

      const imageUrl = await response.text();
      const markdownImage = `![alt text](${imageUrl})`;

      // Inject the markdown image link at the current cursor position
      if (textAreaRef.current) {
        const { selectionStart, selectionEnd } = textAreaRef.current;
        const newContent =
          contentMD.substring(0, selectionStart) +
          markdownImage +
          contentMD.substring(selectionEnd);
        setContentMD(newContent);
      } else {
        setContentMD((prev) => `${prev}\n${markdownImage}`);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred."
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !contentMD) {
      setError("Post Name and Content are required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/project/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parent_id: parentId,
          name,
          content_md: contentMD,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create post");
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred."
      );
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
        className="bg-white rounded-2xl p-8 max-w-4xl w-full flex gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit} className="space-y-4 flex-1">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-slate-700"
            >
              Post Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <div className="flex justify-between items-center">
              <label
                htmlFor="content_md"
                className="block text-sm font-medium text-slate-700"
              >
                Content (Markdown)
              </label>
              <label className="text-sm text-slate-500 file:mr-4 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer">
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>
            </div>
            <textarea
              id="content_md"
              ref={textAreaRef}
              value={contentMD}
              onChange={(e) => setContentMD(e.target.value)}
              rows={15}
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 caret-blue-500 p-2"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {isUploading && (
            <p className="text-sm text-slate-500">Uploading image...</p>
          )}

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300"
            >
              {isSubmitting ? "Creating..." : "Create Post"}
            </button>
          </div>
        </form>
        <div className="flex-1 overflow-auto prose">
          <ReactMarkdown>{contentMD}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}