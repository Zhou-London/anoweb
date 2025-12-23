import { type Post } from "./types";
import { Link } from "react-router-dom";

type LatestPostCardProps = {
  post: Post | null;
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
  if (!post) return null;

  const titleLines = size === "compact" ? 2 : 4;
  const previewLines = size === "compact" ? 3 : 5;
  const pad = size === "compact" ? "p-4" : "p-5";
  const previewText = stripMarkdown(post.content_md || "");

  const updatedStr = new Date(post.updated_at).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="relative w-full overflow-hidden rounded-2xl shadow-lg ring-1 ring-black/5 bg-white/90">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-fuchsia-500/10" aria-hidden />
      <Link
        to="/projects"
        className={`relative block w-full h-full ${pad} space-y-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-2xl`}
        aria-label={`Open latest post: ${post.name}`}
      >
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold bg-white/80 text-indigo-700 ring-1 ring-indigo-100 shadow-sm">
            <span aria-hidden>🆕</span>
            Latest Post
          </span>
          <span className="text-[11px] text-slate-600">Updated {updatedStr}</span>
        </div>

        <div className="relative z-10">
          <h3
            className="text-[15px] sm:text-base font-semibold text-gray-900 leading-5 sm:leading-6 tracking-tight"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: titleLines,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              wordBreak: "break-word",
              whiteSpace: "normal",
            }}
            title={post.name}
          >
            {post.name}
          </h3>
        </div>

        <div className="relative min-h-0 overflow-hidden">
          <p
            className="text-[13px] sm:text-sm text-gray-700 leading-6"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: previewLines,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              wordBreak: "break-word",
              whiteSpace: "normal",
            }}
          >
            {previewText}
          </p>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white/90 to-transparent z-0" />
        </div>

        <div className="pt-1.5">
          <p className="text-[11px] sm:text-xs text-slate-600 inline-flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-blue-500" aria-hidden />
            Read inside Projects
          </p>
        </div>
      </Link>
    </div>
  );
}
