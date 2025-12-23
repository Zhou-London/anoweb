import React from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";

function getStringChildren(children: React.ReactNode): string {
  const parts = React.Children.toArray(children).filter((c): c is string => typeof c === "string");
  return parts.join("");
}

const components: Components = {
  code: (({ className, children, ...props }) => {
    const isBlock = /\blanguage-/.test(className ?? "");

    if (!isBlock) {
      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }

    const text = getStringChildren(children);
    return (
      <div className="relative group">
        <pre className="not-prose markdown-pre">
          <code className={className} {...props}>
            {children}
          </code>
        </pre>
        {text && (
          <button
            type="button"
            onClick={() => navigator.clipboard?.writeText(text)}
            className="copy-chip"
            aria-label="Copy code"
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
      <a href={href} {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})} {...props}>
        {children}
      </a>
    );
  }) as Components["a"],
};

export default function MarkdownViewer({ source }: { source: string }) {
  return (
    <article className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex, [rehypeHighlight, { ignoreMissing: true }]]}
        components={components}
      >
        {source}
      </ReactMarkdown>
    </article>
  );
}
