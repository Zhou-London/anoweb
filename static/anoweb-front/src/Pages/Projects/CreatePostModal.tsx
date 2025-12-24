// src/components/ProjectPage/CreatePostModal.tsx
import { useRef, useState } from "react";
import MarkdownViewer from "../../Components/Markdown/MarkdownViewer";
import { apiFetch } from "../../lib/api";

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
  const [tab, setTab] = useState<"write" | "preview">("write");

  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const insertAround = (left: string, right = left) => {
    const ta = textAreaRef.current;
    if (!ta) return;
    const { selectionStart: s, selectionEnd: e } = ta;
    const selected = contentMD.slice(s, e);
    const out = contentMD.slice(0, s) + left + selected + right + contentMD.slice(e);
    setContentMD(out);
    requestAnimationFrame(() => {
      const caret = s + left.length + selected.length + right.length;
      ta.focus();
      ta.setSelectionRange(caret, caret);
    });
  };
  const insertAtLineStart = (prefix: string) => {
    const ta = textAreaRef.current;
    if (!ta) return;
    const { selectionStart: s } = ta;
    const startOfLine = contentMD.lastIndexOf("\n", s - 1) + 1;
    const out = contentMD.slice(0, startOfLine) + prefix + contentMD.slice(startOfLine);
    setContentMD(out);
    requestAnimationFrame(() => {
      const pos = s + prefix.length;
      ta.focus();
      ta.setSelectionRange(pos, pos);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await apiFetch("/static/upload-image", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Image upload failed");
      const url = await res.text();
      const md = `![alt text](${url})`;
      const ta = textAreaRef.current;
      if (ta) {
        const { selectionStart, selectionEnd } = ta;
        const out = contentMD.slice(0, selectionStart) + md + contentMD.slice(selectionEnd);
        setContentMD(out);
      } else setContentMD((p) => `${p}\n${md}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload error");
    } finally {
      setIsUploading(false);
      e.currentTarget.value = "";
    }
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!name || !contentMD) {
      setError("Post Name and Content are required.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await apiFetch("/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parent_id: parentId, name, content_md: contentMD }),
      });
      if (!res.ok) throw new Error("Failed to create post");
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm p-4 flex items-center justify-center" onClick={onClose}>
      <div
        className="w-full max-w-5xl bg-white rounded-2xl shadow-xl ring-1 ring-black/5 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">Create Post</h2>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-black/5 hover:bg-black/10 text-black/60"
            aria-label="Close"
            title="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700">Post Name</label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 w-full rounded-md border border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" className="btn-sm" onClick={() => insertAround("**")}>Bold</button>
            <button type="button" className="btn-sm" onClick={() => insertAtLineStart("## ")}>H2</button>
            <button type="button" className="btn-sm" onClick={() => insertAround("`")}>Code</button>
            <label className="btn-sm cursor-pointer ml-auto">
              📷 Image
              <input type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading} className="hidden" />
            </label>
          </div>

          {/* Mobile tabs */}
          <div className="md:hidden flex rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setTab("write")}
              className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium ${tab === "write" ? "bg-white shadow text-slate-900" : "text-slate-600"}`}
            >
              ✍️ Write
            </button>
            <button
              type="button"
              onClick={() => setTab("preview")}
              className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium ${tab === "preview" ? "bg-white shadow text-slate-900" : "text-slate-600"}`}
            >
              👀 Preview
            </button>
          </div>

          {/* Editor / Preview */}
          <div className="md:grid md:grid-cols-2 md:gap-4">
            {/* Write */}
            <div className={`${tab === "write" ? "block" : "hidden"} md:block`}>
              <textarea
                ref={textAreaRef}
                id="content_md"
                value={contentMD}
                onChange={(e) => setContentMD(e.target.value)}
                placeholder="Write Markdown… (GFM, math $x^2$, code blocks)"
                className="h-[55vh] w-full rounded-xl border border-slate-200 p-3 sm:p-4 resize-none outline-none caret-blue-600 scrollbar-clear"
              />
            </div>

            {/* Preview */}
            <div className={`${tab === "preview" ? "block" : "hidden"} md:block`}>
              <div className="h-[55vh] overflow-auto rounded-xl border border-slate-200 bg-white p-3 sm:p-4 scrollbar-clear">
                <MarkdownViewer source={contentMD} />
              </div>
            </div>
          </div>

          {/* Status + Actions */}
          {error && <p className="text-sm text-red-600">{error}</p>}
          {isUploading && <p className="text-sm text-slate-500">Uploading image…</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting || isUploading} className="px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300">
              {isSubmitting ? "Creating…" : "Create Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
