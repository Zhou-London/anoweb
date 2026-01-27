// src/components/ProjectPage/CreatePostModal.tsx
import { useEffect, useRef, useState } from "react";
import MDEditor from "@uiw/react-md-editor";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import { useErrorNotifier } from "../../Contexts/error_context";
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
  const notifyError = useErrorNotifier();

  useEffect(() => {
    textAreaRef.current = document.getElementById("create-post-md") as HTMLTextAreaElement | null;
  }, []);

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
      const message = err instanceof Error ? err.message : "Upload error";
      setError(message);
      notifyError(message);
    } finally {
      setIsUploading(false);
      e.currentTarget.value = "";
    }
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!name || !contentMD) {
      const message = "Post Name and Content are required.";
      setError(message);
      notifyError(message);
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
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      notifyError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm p-4 flex items-center justify-center" onClick={onClose}>
      <div
        className="w-full max-w-5xl rounded-2xl shadow-xl ring-1 ring-black/5 overflow-hidden"
        style={{ background: 'var(--gb-bg)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 flex items-center justify-between" style={{ boxShadow: 'inset 0 -1px 0 var(--gb-border)' }}>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--gb-fg)' }}>Create Post</h2>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full"
            style={{ background: 'var(--gb-bg-soft)', color: 'var(--gb-fg-muted)' }}
            aria-label="Close"
            title="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium" style={{ color: 'var(--gb-fg-soft)' }}>Post Name</label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 w-full rounded-md shadow-sm focus:outline-none p-2"
              style={{ background: 'var(--gb-bg-soft)', boxShadow: 'var(--gb-shadow-inset)', color: 'var(--gb-fg)' }}
            />
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" className="btn-sm" onClick={() => insertAround("**")}>Bold</button>
            <button type="button" className="btn-sm" onClick={() => insertAtLineStart("## ")}>H2</button>
            <button type="button" className="btn-sm" onClick={() => insertAround("`")}>Code</button>
            <label className="btn-sm cursor-pointer ml-auto">
              Image
              <input type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading} className="hidden" />
            </label>
          </div>

          {/* Mobile tabs */}
          <div className="md:hidden flex rounded-lg p-1" style={{ background: 'var(--gb-bg-soft)' }}>
            <button
              type="button"
              onClick={() => setTab("write")}
              className="flex-1 rounded-md px-3 py-1.5 text-sm font-medium"
              style={{
                background: tab === "write" ? 'var(--gb-bg)' : 'transparent',
                color: tab === "write" ? 'var(--gb-fg)' : 'var(--gb-fg-muted)',
                boxShadow: tab === "write" ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              Write
            </button>
            <button
              type="button"
              onClick={() => setTab("preview")}
              className="flex-1 rounded-md px-3 py-1.5 text-sm font-medium"
              style={{
                background: tab === "preview" ? 'var(--gb-bg)' : 'transparent',
                color: tab === "preview" ? 'var(--gb-fg)' : 'var(--gb-fg-muted)',
                boxShadow: tab === "preview" ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              Preview
            </button>
          </div>

          {/* Editor / Preview */}
          <div className="md:grid md:grid-cols-2 md:gap-4">
            {/* Write */}
            <div className={`${tab === "write" ? "block" : "hidden"} md:block`}>
              <MDEditor
                value={contentMD}
                onChange={(value) => setContentMD(value || "")}
                textareaProps={{
                  id: "create-post-md",
                  placeholder: "Write Markdown… (GFM, math $x^2$, code blocks)",
                }}
                height={520}
                preview="edit"
                previewOptions={{
                  remarkPlugins: [remarkGfm, remarkMath],
                  rehypePlugins: [rehypeKatex, [rehypeHighlight, { ignoreMissing: true }]],
                }}
                className="rounded-xl shadow-inner"
                style={{ boxShadow: 'var(--gb-shadow-card)' }}
              />
            </div>

            {/* Preview */}
            <div className={`${tab === "preview" ? "block" : "hidden"} md:block`}>
              <div className="h-[55vh] overflow-auto rounded-xl p-3 sm:p-4 scrollbar-clear" style={{ background: 'var(--gb-bg)', boxShadow: 'var(--gb-shadow-card)' }}>
                <article className="markdown-body">
                  <MDEditor.Markdown
                    source={contentMD || "_Nothing to preview yet._"}
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeKatex, [rehypeHighlight, { ignoreMissing: true }]]}
                  />
                </article>
              </div>
            </div>
          </div>

          {/* Status + Actions */}
          {error && <p className="text-sm" style={{ color: 'var(--gb-error)' }}>{error}</p>}
          {isUploading && <p className="text-sm" style={{ color: 'var(--gb-fg-muted)' }}>Uploading image…</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-sm font-medium" style={{ background: 'var(--gb-bg-soft)', color: 'var(--gb-fg-soft)' }}>
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting || isUploading} className="px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50" style={{ background: 'var(--gb-primary)', color: 'var(--gb-bg)' }}>
              {isSubmitting ? "Creating…" : "Create Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
