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

  const titleLines   = size === "compact" ? 2 : 4;
  const previewLines = size === "compact" ? 3 : 5;
  const pad          = size === "compact" ? "p-3.5 sm:p-4" : "p-4 sm:p-5";
  const previewText  = stripMarkdown(post.content_md || "");

  const updatedStr = new Date(post.updated_at).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl shadow-lg ring-1 ring-black/5 bg-white
                 transition-transform duration-200 hover:scale-[1.01] hover:shadow-xl"
      style={{ aspectRatio: "1 / 1" }}   // keeps it square
    >
      {/* top accent stripe */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-400 via-indigo-400 to-fuchsia-400 opacity-70" />

      {/* Make the INNER container the grid so rows are guaranteed */}
      <Link
        to="/projects"
        className={`block w-full h-full ${pad} grid min-h-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-2xl`}
        style={{ gridTemplateRows: "auto auto 1fr auto" }}
        aria-label={`Open latest post: ${post.name}`}
      >
        {/* Row 1: badge */}
        <div className="mb-1">
          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold
                           bg-gradient-to-r from-blue-50 to-indigo-50 text-indigo-700 ring-1 ring-indigo-100">
            <span aria-hidden>🆕</span>
            Latest&nbsp;Post
          </span>
        </div>

        {/* Row 2: title (never covered) */}
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

        {/* Row 3: snippet (takes only leftover space) */}
        <div className="relative min-h-0 overflow-hidden mt-1">
          <p
            className="text-[12.5px] sm:text-sm text-gray-700 leading-5"
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
          {/* fade lives inside snippet, low z-index */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-5 sm:h-6 bg-gradient-to-t from-white to-transparent z-0" />
        </div>

        {/* Row 4: footer — ALWAYS visible */}
        <div className="pt-1.5">
          <p className="text-[11px] sm:text-xs text-gray-600 inline-flex items-center gap-1">
            <span aria-hidden>🕒</span>
            <span>Updated: {updatedStr}</span>
          </p>
        </div>
      </Link>
    </div>
  );
}
