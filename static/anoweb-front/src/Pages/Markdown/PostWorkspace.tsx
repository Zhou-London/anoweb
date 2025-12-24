import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import { apiFetch, apiJson } from "../../lib/api";
import type { Post } from "../Projects/types";

export default function PostWorkspace() {
  const { postId } = useParams<{ postId: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [content, setContent] = useState("");
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mode, setMode] = useState<"edit" | "preview">("preview");
  const [error, setError] = useState<string | null>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!postId) return;
    setIsLoading(true);
    apiJson<Post>(`/post/${postId}`)
      .then((data) => {
        setPost(data);
        setContent(data.content_md || "");
        setName(data.name);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load post"))
      .finally(() => setIsLoading(false));
  }, [postId]);

  const updatedAt = useMemo(() => {
    if (!post?.updated_at) return "";
    const date = new Date(post.updated_at);
    if (Number.isNaN(date.getTime())) return post.updated_at;
    return date.toLocaleString(undefined, { year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });
  }, [post]);

  const handleSave = async () => {
    if (!postId) return;
    setIsSaving(true);
    setError(null);
    try {
      const payload = {
        id: Number(postId),
        name,
        content_md: content,
      };
      const res = await apiFetch("/post", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Save failed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-48 bg-white/80 rounded-xl border border-slate-200 animate-pulse" />
        <div className="h-96 bg-white/80 rounded-3xl border border-slate-200 animate-pulse" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 text-slate-700 space-y-3">
        <p className="font-semibold">Post not found.</p>
        <Link to="/projects" className="text-blue-600 hover:text-blue-700 underline text-sm">Back to projects</Link>
        {error && <p className="text-sm text-rose-600">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Markdown</p>
          <h1 className="text-2xl font-semibold text-slate-900">{name}</h1>
          {updatedAt && <p className="text-xs text-slate-600">Updated {updatedAt}</p>}
        </div>
        <div className="flex items-center gap-2">
          <Link to="/projects" className="chip-soft">Back</Link>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 text-white px-4 py-2 text-sm font-semibold shadow-sm hover:bg-blue-700 disabled:bg-blue-300"
          >
            {isSaving ? "Saving…" : "Save"}
          </button>
        </div>
      </header>

      <div className="rounded-3xl border border-slate-200 bg-white/90 shadow-lg overflow-hidden">
        <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-2">
          <button
            type="button"
            onClick={() => setMode("edit")}
            className={`px-3 py-1.5 rounded-full text-sm font-medium ${mode === "edit" ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-100"}`}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => setMode("preview")}
            className={`px-3 py-1.5 rounded-full text-sm font-medium ${mode === "preview" ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-100"}`}
          >
            Preview
          </button>
        </div>
        <div className="grid md:grid-cols-2">
          <div className={`${mode === "edit" ? "block" : "hidden"} md:block border-b md:border-b-0 md:border-r border-slate-200`}>
            <div className="p-4 space-y-3">
              <label className="block text-sm font-medium text-slate-700">
                Title
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </label>
              <textarea
                ref={textRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="h-[60vh] w-full rounded-xl border border-slate-200 p-3 sm:p-4 resize-none outline-none caret-blue-600 scrollbar-clear"
                placeholder="Write Markdown with GFM and math."
              />
            </div>
          </div>
          <div className={`${mode === "preview" ? "block" : "hidden"} md:block`}>
            <div className="h-full max-h-[76vh] overflow-auto p-4">
              <article className="markdown-body">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeKatex, [rehypeHighlight, { ignoreMissing: true }]]}
                >
                  {content}
                </ReactMarkdown>
              </article>
            </div>
          </div>
        </div>
      </div>
      {error && <p className="text-sm text-rose-600">{error}</p>}
    </div>
  );
}
