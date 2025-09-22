import ReactMarkdown from "react-markdown";
import { type Post } from "./types";

type PostDetailModalProps = {
  post: Post;
  isLoading: boolean;
  onClose: () => void;
};

export function PostDetailModal({
  post,
  isLoading,
  onClose,
}: PostDetailModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar prose shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h1 className="text-3xl font-bold mb-4 text-slate-800">{post.name}</h1>
        {isLoading ? (
          <p className="text-slate-600">Loading content...</p>
        ) : (
          <ReactMarkdown>{post.content_md}</ReactMarkdown>
        )}
      </div>
    </div>
  );
}
