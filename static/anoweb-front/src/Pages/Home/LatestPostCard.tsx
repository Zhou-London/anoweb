import { type Post } from "./types";
import { Link } from "react-router-dom";
import { formatRelativeDate } from "../../lib/dateFormat";

type LatestPostCardProps = {
  post: Post;
  size?: "compact" | "default";
};

function stripMarkdown(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]*`/g, "")
    .replace(/!\[[^\]]*]\([^)]*\)/g, "")
    .replace(/\[[^\]]*]\([^)]*\)/g, (m) => m.replace(/\[|\]|\([^)]*\)/g, ""))
    .replace(/[#>*_\-\+]+/g, "")
    .replace(/\r?\n+/g, " ")
    .trim();
}

export default function LatestPostCard({ post, size = "compact" }: LatestPostCardProps) {
  const titleLines = size === "compact" ? 2 : 4;
  const previewLines = size === "compact" ? 3 : 5;
  const pad = size === "compact" ? "p-4" : "p-5";
  const previewText = stripMarkdown(post.content_md || "");

  const updatedStr = formatRelativeDate(post.updated_at);

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl shadow-lg"
      style={{ background: 'var(--gb-bg)', border: '1px solid var(--gb-border)' }}
    >
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to bottom right, var(--gb-primary-10), var(--gb-accent-10))' }}
        aria-hidden
      />
      <Link
        to={`/markdown/${post.id}`}
        target="_blank"
        rel="noreferrer"
        className={`relative block w-full h-full ${pad} space-y-3 focus:outline-none rounded-2xl`}
        style={{ outlineColor: 'var(--gb-primary)' }}
        aria-label={`Open post: ${post.name}`}
      >
        <div className="relative z-10">
          <h3
            className="text-[15px] sm:text-base font-semibold leading-5 sm:leading-6 tracking-tight"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: titleLines,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              wordBreak: "break-word",
              whiteSpace: "normal",
              color: 'var(--gb-fg)',
            }}
            title={post.name}
          >
            {post.name}
          </h3>
        </div>

        <div className="relative min-h-0 overflow-hidden">
          <p
            className="text-[13px] sm:text-sm leading-6"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: previewLines,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              wordBreak: "break-word",
              whiteSpace: "normal",
              color: 'var(--gb-fg-soft)',
            }}
          >
            {previewText}
          </p>
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-8 z-0"
            style={{ background: 'linear-gradient(to top, var(--gb-bg), transparent)' }}
          />
        </div>

        <div className="pt-1.5">
          <p className="text-xs sm:text-sm inline-flex items-center gap-1" style={{ color: 'var(--gb-fg-muted)' }}>
            <span className="inline-block h-2 w-2 rounded-full" style={{ background: 'var(--gb-primary)' }} aria-hidden />
            {updatedStr}
          </p>
        </div>
      </Link>
    </div>
  );
}
