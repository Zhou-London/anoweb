import { type Post } from "./types";
import { Link } from "react-router-dom";

type LatestPostCardProps = {
  post: Post | null;
  size?: "compact" | "default"; // optional
};

export default function LatestPostCard({ post, size = "compact" }: LatestPostCardProps) {
  if (!post) return null;

  const wrapper =
    "bg-white rounded-2xl shadow-lg transition-transform duration-200 hover:scale-[1.01] hover:shadow-xl";
  const pad = "p-4 sm:p-6";
  const sizing = size === "compact" ? "min-h-[120px] w-full" : "w-full";

  return (
    <div className={`${wrapper} ${pad} ${sizing}`}>
      <h2 className="text-lg font-semibold text-gray-800 mb-2">Latest Post</h2>
      <Link to="/projects" className="block">
        <div className="flex flex-col">
          <p className="text-sm font-medium text-gray-800 truncate">{post.name}</p>
          <p className="text-xs text-gray-500 mt-1">
            Updated: {new Date(post.updated_at).toLocaleDateString()}
          </p>
        </div>
      </Link>
    </div>
  );
}
