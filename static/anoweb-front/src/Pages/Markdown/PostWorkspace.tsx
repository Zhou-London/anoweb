import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import MDEditor from "@uiw/react-md-editor";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import { useErrorNotifier } from "../../Contexts/error_context";
import { FanContext } from "../../Contexts/fan_context";
import { useEditMode } from "../../Contexts/edit_mode_context";
import { apiFetch, apiJson } from "../../lib/api";
import type { Post } from "../Projects/types";

type EditorMode = "write" | "preview" | "split";

const demoMarkdown = [
  "# Markdown playground",
  "Welcome to the GitHub-style editor. Try headings, tables, code fences, math, and task lists.",
  "",
  "## Syntax buffet",
  "- [x] Task list",
  "- **Bold**, _italic_, ~~strike~~, and `inline code`.",
  "- Links like [react.dev](https://react.dev) and images: ![Placeholder](https://via.placeholder.com/120x80.png)",
  "- Math: $E=mc^2$ and block math below.",
  "",
  "> Quote blocks stay neat with proper spacing.",
  "",
  "```ts",
  "function greet(name: string) {",
  "  return \"Hello, ${name}!\";",
  "}",
  "```",
  "",
  "| Column | Details |",
  "| --- | --- |",
  "| Table support | Aligns like GitHub |",
  "| Highlights | Uses highlight.js |",
  "",
  "$$",
  "\\\\frac{\\nabla f(x)}{\\partial x} = 0",
  "$$",
].join("\n");

function buildDemoPost(id?: string): Post {
  return {
    id: Number(id) || 0,
    parent_id: 0,
    parent_type: "project",
    name: "Sample markdown playground",
    content_md: demoMarkdown,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export default function PostWorkspace() {
  const { postId } = useParams<{ postId: string }>();
  const { isAdmin } = useContext(FanContext);
  const { editMode } = useEditMode();
  const showAdminFeatures = isAdmin && editMode;
  const allowMock = Boolean((import.meta as any)?.env?.DEV) && (import.meta as any)?.env?.VITE_ENABLE_DEV_MOCKS !== "false";
  const demoPost = useMemo(() => buildDemoPost(postId), [postId]);

  const [post, setPost] = useState<Post | null>(null);
  const [content, setContent] = useState("");
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  // Default to "preview" for non-admin fan?s, "split" for admin fan?s
  const [mode, setMode] = useState<EditorMode>("preview");
  const [error, setError] = useState<string | null>(null);
  const [copiedBlock, setCopiedBlock] = useState<string | null>(null);

  const notifyError = useErrorNotifier();
  const textRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Update mode when admin status and edit mode changes
  useEffect(() => {
    if (showAdminFeatures) {
      setMode("split");
    } else {
      setMode("preview");
    }
  }, [showAdminFeatures]);

  useEffect(() => {
    textRef.current = document.getElementById("post-workspace-editor") as HTMLTextAreaElement | null;
  }, []);

  useEffect(() => {
    if (!postId) return;
    setIsLoading(true);
    setError(null);

    apiJson<Post>(`/post/${postId}`)
      .then((data) => {
        setPost(data);
        setContent(data.content_md || "");
        setName(data.name);
      })
      .catch((err) => {
        const message = err instanceof Error ? err.message : "Failed to load post";
        const detail = allowMock ? `${message}. Showing demo content because the API is unavailable.` : message;
        if (allowMock) {
          setPost(demoPost);
          setContent(demoPost.content_md || "");
          setName(demoPost.name);
          setError(detail);
          notifyError(detail);
        } else {
          setError(detail);
          notifyError(detail);
        }
      })
      .finally(() => setIsLoading(false));
  }, [postId, allowMock, demoPost, notifyError]);

  const updatedAt = useMemo(() => {
    if (!post?.updated_at) return "";
    const date = new Date(post.updated_at);
    if (Number.isNaN(date.getTime())) return post.updated_at;
    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [post]);

  const stats = useMemo(() => {
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    const lines = content.split(/\n/).length;
    return { words, lines, chars: content.length };
  }, [content]);

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
      const message = err instanceof Error ? err.message : "Save failed";
      setError(message);
      notifyError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const surroundSelection = (before: string, after: string, placeholder = "") => {
    const textarea = textRef.current;
    if (!textarea) return;

    const { selectionStart, selectionEnd, value } = textarea;
    const selectedText = value.slice(selectionStart, selectionEnd) || placeholder;
    const next = `${value.slice(0, selectionStart)}${before}${selectedText}${after}${value.slice(selectionEnd)}`;
    setContent(next);

    const nextCursor = selectionStart + before.length + selectedText.length;
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(nextCursor, nextCursor);
    });
  };

  const prefixLines = (prefix: string, placeholder: string) => {
    const textarea = textRef.current;
    if (!textarea) return;
    const { selectionStart, selectionEnd, value } = textarea;
    const selection = value.slice(selectionStart, selectionEnd) || placeholder;
    const updatedSelection = selection
      .split("\n")
      .map((line) => `${prefix}${line}`)
      .join("\n");

    const next = `${value.slice(0, selectionStart)}${updatedSelection}${value.slice(selectionEnd)}`;
    setContent(next);

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(selectionStart, selectionStart + updatedSelection.length);
    });
  };

  const insertTable = () => {
    surroundSelection(
      "| Column | Column |\n| --- | --- |\n| Row 1 | Row 1 |\n| Row 2 | Row 2 |\n",
      "",
      ""
    );
  };

  const insertLink = () => surroundSelection("[", "](https://)", "link text");
  const insertCodeBlock = () => surroundSelection("```ts\n", "\n```\n", "console.log('Hello world');");
  const insertMathBlock = () => surroundSelection("$$\n", "\n$$\n", "\\frac{a}{b} = c");

  const handleTabKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      surroundSelection("  ", "");
    }
  };

  const markdownComponents = useMemo(
    () => ({
      a: ({ children, ...props }: any) => (
        <a {...props} target="_blank" rel="noreferrer" className="text-blue-700 hover:underline">
          {children}
        </a>
      ),
      table: (props: any) => (
        <div className="overflow-auto rounded-xl border border-slate-200 bg-white/70 shadow-sm">
          <table className="min-w-full text-sm text-slate-800 [&_th]:bg-slate-50/80 [&_th]:text-left [&_th]:font-semibold [&_th]:px-3 [&_th]:py-2 [&_td]:px-3 [&_td]:py-2" {...props} />
        </div>
      ),
      img: ({ alt, ...props }: any) => (
        <img alt={alt} className="rounded-xl border border-slate-200 shadow-sm" loading="lazy" {...props} />
      ),
      pre: ({ children }: any) => <div className="relative group markdown-pre">{children}</div>,
      code: ({ node, inline, className, children, ...props }: any) => {
        const language = className?.replace("language-", "");
        const blockId = `${language}-${String(children).length}-${String(children).slice(0, 8)}`;
        if (inline) {
          return (
            <code className={`${className || ""} rounded-md bg-slate-100 px-1.5 py-0.5`} {...props}>
              {children}
            </code>
          );
        }

        const codeText = String(children || "").replace(/\n$/, "");
        return (
          <div className="group relative">
            <button
              type="button"
              className="copy-chip"
              onClick={() => {
                navigator.clipboard.writeText(codeText).then(() => {
                  setCopiedBlock(blockId);
                  setTimeout(() => setCopiedBlock(null), 1200);
                });
              }}
            >
              {copiedBlock === blockId ? "Copied" : "Copy"}
            </button>
            <pre className="markdown-pre" data-language={language}>
              <code className={className} {...props}>
                {codeText}
              </code>
            </pre>
          </div>
        );
      },
    }),
    [copiedBlock]
  );

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

  const tabButton = (value: EditorMode, label: string) => (
    <button
      type="button"
      onClick={() => setMode(value)}
      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
        mode === value ? "bg-blue-50 text-blue-700 shadow-inner" : "text-slate-700 hover:bg-slate-100"
      }`}
    >
      {label}
    </button>
  );

  const toolbarActions = [
    { label: "Heading", icon: "#", onClick: () => prefixLines("## ", "Heading") },
    { label: "Bold", icon: "B", onClick: () => surroundSelection("**", "**", "bold text") },
    { label: "Italic", icon: "I", onClick: () => surroundSelection("*", "*", "italic text") },
    { label: "Code", icon: "</>", onClick: insertCodeBlock },
    { label: "Quote", icon: "❝", onClick: () => prefixLines("> ", "Quote") },
    { label: "List", icon: "•", onClick: () => prefixLines("- ", "List item") },
    { label: "Task", icon: "☑", onClick: () => prefixLines("- [ ] ", "Task item") },
    { label: "Link", icon: "🔗", onClick: insertLink },
    { label: "Table", icon: "⌗", onClick: insertTable },
    { label: "Math", icon: "∑", onClick: insertMathBlock },
  ];

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-slate-700">Markdown</p>
          <h1 className="text-2xl font-semibold text-slate-900">{name}</h1>
          {updatedAt && <p className="text-xs text-slate-600">Updated {updatedAt}</p>}
        </div>
        <div className="flex items-center gap-2">
          <Link to="/projects" className="chip-soft">Back</Link>
          {showAdminFeatures && (
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 text-white px-4 py-2 text-sm font-semibold shadow-sm hover:bg-blue-700 disabled:bg-blue-300"
            >
              {isSaving ? "Saving…" : "Save"}
            </button>
          )}
        </div>
      </header>

      <div className="rounded-3xl border border-slate-200 bg-white/90 shadow-lg overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-2">
          <div className="flex items-center gap-2" role="tablist" aria-label="Editor view modes">
            {showAdminFeatures && tabButton("write", "Write")}
            {tabButton("preview", "Preview")}
            {showAdminFeatures && tabButton("split", "Split")}
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-1 border border-slate-200">{stats.words} words</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-1 border border-slate-200">{stats.lines} lines</span>
            <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-1 border border-slate-200">{stats.chars} chars</span>
          </div>
        </div>

        <div className={`grid ${mode === "split" ? "md:grid-cols-2" : "grid-cols-1"}`}>
          {mode !== "preview" && isAdmin && (
            <div className="border-b md:border-b-0 md:border-r border-slate-200">
              <div className="p-4 space-y-4">
                <label className="block text-sm font-medium text-slate-700">
                  Title
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 w-full rounded-md border border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </label>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 shadow-inner">
                  <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 px-3 py-2">
                    {toolbarActions.map((action) => (
                      <button
                        key={action.label}
                        type="button"
                        onClick={action.onClick}
                        className="btn-sm"
                        title={action.label}
                      >
                        <span>{action.icon}</span>
                        <span className="hidden sm:inline">{action.label}</span>
                      </button>
                    ))}
                    <span className="text-xs text-slate-600 ml-auto">Supports GitHub flavored markdown + math.</span>
                  </div>
                  <div className="overflow-hidden rounded-b-2xl">
                    <MDEditor
                      value={content}
                      onChange={(value) => setContent(value || "")}
                      preview="edit"
                      height={mode === "split" ? 520 : 560}
                      textareaProps={{
                        id: "post-workspace-editor",
                        onKeyDown: handleTabKey,
                        placeholder: "Write Markdown with GitHub shortcuts. Use the toolbar or keyboard (Cmd/Ctrl + B/I).",
                      }}
                      previewOptions={{
                        remarkPlugins: [remarkGfm, remarkMath],
                        rehypePlugins: [rehypeKatex, [rehypeHighlight, { ignoreMissing: true }]],
                        components: markdownComponents,
                      }}
                      data-color-mode="light"
                      className="bg-white/90"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {mode !== "write" && (
            <div className="bg-slate-50/60">
              <div className="h-full max-h-[76vh] overflow-auto p-4 scrollbar-clear" ref={previewRef}>
                <MDEditor.Markdown
                  source={content || "_Nothing to preview yet. Start typing in the editor to see the GitHub-style preview here._"}
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeKatex, [rehypeHighlight, { ignoreMissing: true }]]}
                  components={markdownComponents}
                  className="markdown-body"
                  data-color-mode="light"
                />
              </div>
            </div>
          )}
        </div>
      </div>
      {error && <p className="text-sm text-rose-600">{error}</p>}
    </div>
  );
}
