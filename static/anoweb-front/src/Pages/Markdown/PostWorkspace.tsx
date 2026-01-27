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

const MAX_CONTENT_LENGTH = 7500;

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
  // Default to "preview" for non-admin fans, "split" for admin fans
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

  const isOverLimit = stats.chars > MAX_CONTENT_LENGTH;

  const handleSave = async () => {
    if (!postId) return;
    if (isOverLimit) {
      notifyError(`Content exceeds ${MAX_CONTENT_LENGTH.toLocaleString()} character limit`);
      return;
    }
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
        <a {...props} target="_blank" rel="noreferrer" style={{ color: 'var(--gb-primary)' }} className="hover:underline">
          {children}
        </a>
      ),
      table: (props: any) => (
        <div className="overflow-auto rounded-xl shadow-sm" style={{ background: 'var(--gb-bg)', boxShadow: 'var(--gb-shadow-card)' }}>
          <table className="min-w-full text-sm [&_th]:text-left [&_th]:font-semibold [&_th]:px-3 [&_th]:py-2 [&_td]:px-3 [&_td]:py-2" style={{ color: 'var(--gb-fg)' }} {...props} />
        </div>
      ),
      img: ({ alt, ...props }: any) => (
        <img alt={alt} className="rounded-xl shadow-sm" style={{ boxShadow: 'var(--gb-shadow-soft)' }} loading="lazy" {...props} />
      ),
      pre: ({ children }: any) => <div className="relative group markdown-pre">{children}</div>,
      code: ({ node, inline, className, children, ...props }: any) => {
        const language = className?.replace("language-", "");
        const blockId = `${language}-${String(children).length}-${String(children).slice(0, 8)}`;
        if (inline) {
          return (
            <code className={`${className || ""} rounded-md px-1.5 py-0.5`} style={{ background: 'var(--gb-bg-soft)' }} {...props}>
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
        <div className="h-10 w-48 rounded-xl animate-pulse" style={{ background: 'var(--gb-bg-soft)', boxShadow: 'var(--gb-shadow-soft)' }} />
        <div className="h-96 rounded-3xl animate-pulse" style={{ background: 'var(--gb-bg-soft)', boxShadow: 'var(--gb-shadow-soft)' }} />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="rounded-3xl p-6 space-y-3" style={{ background: 'var(--gb-bg)', boxShadow: 'var(--gb-shadow-card)', color: 'var(--gb-fg-soft)' }}>
        <p className="font-semibold">Post not found.</p>
        <Link to="/projects" className="underline text-sm" style={{ color: 'var(--gb-primary)' }}>Back to projects</Link>
        {error && <p className="text-sm" style={{ color: 'var(--gb-error)' }}>{error}</p>}
      </div>
    );
  }

  const tabButton = (value: EditorMode, label: string) => (
    <button
      type="button"
      onClick={() => setMode(value)}
      className="px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
      style={{
        background: mode === value ? 'var(--gb-primary)' : 'transparent',
        color: mode === value ? 'var(--gb-bg)' : 'var(--gb-fg-soft)'
      }}
    >
      {label}
    </button>
  );

  const toolbarActions = [
    { label: "Heading", icon: "#", onClick: () => prefixLines("## ", "Heading") },
    { label: "Bold", icon: "B", onClick: () => surroundSelection("**", "**", "bold text") },
    { label: "Italic", icon: "I", onClick: () => surroundSelection("*", "*", "italic text") },
    { label: "Code", icon: "</>", onClick: insertCodeBlock },
    { label: "Quote", icon: "\"", onClick: () => prefixLines("> ", "Quote") },
    { label: "List", icon: "-", onClick: () => prefixLines("- ", "List item") },
    { label: "Task", icon: "[]", onClick: () => prefixLines("- [ ] ", "Task item") },
    { label: "Link", icon: "Lk", onClick: insertLink },
    { label: "Table", icon: "||", onClick: insertTable },
    { label: "Math", icon: "fx", onClick: insertMathBlock },
  ];

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <Link
            to="/projects"
            className="group inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
            style={{ background: 'var(--gb-accent)', color: 'var(--gb-bg)' }}
          >
            <svg className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-semibold" style={{ color: 'var(--gb-fg)' }}>{name}</h1>
            {updatedAt && <p className="text-xs mt-0.5" style={{ color: 'var(--gb-fg-muted)' }}>Updated {updatedAt}</p>}
          </div>
        </div>
        {showAdminFeatures && (
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: 'var(--gb-fg-muted)' }}>{stats.chars.toLocaleString()} / {MAX_CONTENT_LENGTH.toLocaleString()}</span>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || isOverLimit}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-sm disabled:opacity-50"
              style={{ background: 'var(--gb-fg)', color: 'var(--gb-bg)' }}
            >
              {isSaving ? "Saving…" : "Save"}
            </button>
          </div>
        )}
      </header>

      {showAdminFeatures ? (
        <div className="rounded-2xl shadow-sm overflow-hidden" style={{ background: 'var(--gb-bg)', boxShadow: 'var(--gb-shadow-card)' }}>
          <div className="flex items-center gap-2 px-4 py-2" style={{ boxShadow: 'inset 0 -1px 0 var(--gb-shadow)' }} role="tablist">
            {tabButton("write", "Write")}
            {tabButton("preview", "Preview")}
            {tabButton("split", "Split")}
          </div>

          <div className={`grid ${mode === "split" ? "md:grid-cols-2" : "grid-cols-1"}`}>
            {mode !== "preview" && (
              <div className="p-4 space-y-3" style={{ boxShadow: mode === "split" ? 'inset -1px 0 0 var(--gb-shadow)' : 'inset 0 -1px 0 var(--gb-shadow)' }}>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Title"
                  className="w-full rounded-md px-3 py-2 text-sm focus:outline-none"
                  style={{ background: 'var(--gb-bg-soft)', boxShadow: 'var(--gb-shadow-inset)', color: 'var(--gb-fg)' }}
                />
                <div className="flex flex-wrap items-center gap-1 text-xs">
                  {toolbarActions.map((action) => (
                    <button
                      key={action.label}
                      type="button"
                      onClick={action.onClick}
                      className="btn-sm"
                      title={action.label}
                    >
                      {action.icon}
                    </button>
                  ))}
                </div>
                <MDEditor
                  value={content}
                  onChange={(value) => setContent(value || "")}
                  preview="edit"
                  height={mode === "split" ? 480 : 520}
                  textareaProps={{
                    id: "post-workspace-editor",
                    onKeyDown: handleTabKey,
                    placeholder: "Write Markdown...",
                  }}
                  previewOptions={{
                    remarkPlugins: [remarkGfm, remarkMath],
                    rehypePlugins: [rehypeKatex, [rehypeHighlight, { ignoreMissing: true }]],
                    components: markdownComponents,
                  }}
                />
              </div>
            )}

            {mode !== "write" && (
              <div className="max-h-[70vh] overflow-auto p-4" ref={previewRef}>
                <MDEditor.Markdown
                  source={content || "_Nothing to preview._"}
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeKatex, [rehypeHighlight, { ignoreMissing: true }]]}
                  components={markdownComponents}
                  className="markdown-body"
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl shadow-sm p-6 max-h-[80vh] overflow-auto" style={{ background: 'var(--gb-bg)', boxShadow: 'var(--gb-shadow-card)' }} ref={previewRef}>
          <MDEditor.Markdown
            source={content || "_No content._"}
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex, [rehypeHighlight, { ignoreMissing: true }]]}
            components={markdownComponents}
            className="markdown-body"
          />
        </div>
      )}
      {error && <p className="text-sm" style={{ color: 'var(--gb-error)' }}>{error}</p>}
    </div>
  );
}
