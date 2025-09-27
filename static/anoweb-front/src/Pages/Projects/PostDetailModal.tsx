// src/components/Home/PostDetailModal.tsx
import { useEffect } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import { type Post } from "./types";
import * as React from "react";

type PostDetailModalProps = {
  post: Post;
  isLoading: boolean;
  onClose: () => void;
};

// helper: get only string children (avoid [Object, Object])
function getStringChildren(children: React.ReactNode): string {
  const parts = React.Children.toArray(children)
    .filter((c): c is string => typeof c === "string");
  return parts.join("");
}

export function PostDetailModal({ post, isLoading, onClose }: PostDetailModalProps) {
  // Close on Esc
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const updatedStr = new Date((post as any).updated_at).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Ensure markdown input is a string
  const mdSource =
    typeof (post as any).content_md === "string" ? (post as any).content_md : "";

  const mdComponents: Components = {
    code: (({ className, children, ...props }) => {
      // Detect block code by the presence of a language class (rehype-highlight sets this on <code>)
      const isBlock = /\blanguage-/.test(className ?? "");

      if (!isBlock) {
        // Inline code: render as-is, do NOT coerce children to string
        return (
          <code className={className} {...props}>
            {children}
          </code>
        );
      }

      // Block code: keep class on <code> so highlight CSS applies
      const textForCopy = getStringChildren(children);

      return (
        <div className="relative group">
          <pre className="not-prose overflow-x-auto rounded-lg">
            <code className={className} {...props}>
              {children}
            </code>
          </pre>
          {textForCopy && (
            <button
              type="button"
              onClick={() => navigator.clipboard?.writeText(textForCopy)}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition
                         text-xs px-2 py-1 rounded-md bg-slate-800 text-white/90 hover:bg-slate-700"
              aria-label="Copy code"
              title="Copy code"
            >
              Copy
            </button>
          )}
        </div>
      );
    }) as Components["code"],

    a: (({ href, children, ...props }) => {
      const isExternal = !!href && /^(https?:)?\/\//i.test(href);
      return (
        <a
          href={href}
          {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          {...props}
        >
          {children}
        </a>
      );
    }) as Components["a"],
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative w-[92vw] sm:w-[90vw] max-w-5xl max-h-[85vh]
                   bg-gradient-to-br from-white to-blue-50 text-slate-800
                   rounded-2xl shadow-xl ring-1 ring-black/5 border border-black/5
                   flex flex-col"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="post-modal-title"
      >
        {/* Header */}
        <div className="px-5 sm:px-8 pt-5 sm:pt-8 pb-3 border-b border-slate-200/60">
          <h1
            id="post-modal-title"
            className="text-2xl sm:text-3xl font-serif font-bold tracking-tight"
          >
            {post.name}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-500">🕒 Updated: {updatedStr}</p>
        </div>

        {/* Subtle inner texture */}
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{
            boxShadow:
              "inset 0 0 0 1px rgba(0,0,0,.03), inset 0 0 40px rgba(30,64,175,.03)",
          }}
        />

        {/* Content */}
        <div
          className="px-5 sm:px-8 py-5 overflow-y-auto flex-1 scrollbar-clear"
          style={{ WebkitFontSmoothing: "antialiased" }}
        >
          <article
            className="prose prose-stone max-w-none font-serif
                       leading-8 sm:leading-8 text-[17px] sm:text-[18px]
                       prose-headings:font-semibold prose-h2:mt-8 prose-h3:mt-6
                       prose-img:rounded-xl prose-img:mx-auto prose-pre:bg-zinc-100
                       prose-a:text-blue-700"
          >
            {isLoading ? (
              <p className="text-slate-600">Loading content...</p>
            ) : (
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex, [rehypeHighlight, { ignoreMissing: true }]]}
                components={mdComponents}
              >
                {mdSource}
              </ReactMarkdown>
            )}
          </article>
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center
                     rounded-full bg-black/5 hover:bg-black/10 transition
                     text-black/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Close"
          title="Close"
        >
          ×
        </button>
      </div>
    </div>
  );
}
