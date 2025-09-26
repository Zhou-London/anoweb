import { type Post } from "./types";
import { Link } from "react-router-dom";

type LatestPostCardProps = {
  post: Post | null;
};

export default function LatestPostCard({ post }: LatestPostCardProps) {
  if (!post) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 w-full h-full transition-transform duration-200 ease-in-out transform hover:scale-105 hover:shadow-xl">
      <h2 className="text-lg font-semibold text-gray-800 mb-3">
        Latest Post
      </h2>
      <Link to={`/projects`}>
        <div className="flex flex-col">
          <p className="text-sm font-medium text-gray-800">{post.name}</p>
          <p className="text-xs text-gray-500">
            Updated: {new Date(post.UpdatedAt).toLocaleDateString()}
          </p>
        </div>
      </Link>
    </div>
  );
}