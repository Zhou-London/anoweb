import ReactMarkdown from "react-markdown";
import { type Post } from "./types";

type PostDetailModalProps = {
  post: Post;
  isLoading: boolean;
  onClose: () => void;
};

/**
 * 电子读书器风格（极浅白-淡蓝渐变）：
 * - 宽度：设备宽度的 70%（w-[70vw]）
 * - 初始高度：min-h-[640px]，内容增加时整体随之增长（不内滚）
 * - 外层遮罩滚动，保证长文也能完整阅读
 */
export function PostDetailModal({
  post,
  isLoading,
  onClose,
}: PostDetailModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm
                 flex items-start justify-center p-4
                 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="
          relative w-[70vw] min-h-[640px] mx-auto
          bg-gradient-to-br from-white to-blue-50 text-slate-800
          rounded-2xl shadow-xl ring-1 ring-black/5 border border-black/5
          p-6 sm:p-8 select-text
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center
                     rounded-full bg-black/5 hover:bg-black/10 transition
                     text-black/60"
          aria-label="Close"
          title="Close"
        >
          ×
        </button>

        {/* 轻微内阴影/质感（可选） */}
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{
            boxShadow:
              "inset 0 0 0 1px rgba(0,0,0,0.03), inset 0 0 40px rgba(30,64,175,0.03)",
          }}
        />

        {/* 标题 */}
        <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight mb-4">
          {post.name}
        </h1>

        {/* 正文：不内滚，让容器随内容增长 */}
        <div
          className="prose prose-stone max-w-none font-serif
                     leading-8 sm:leading-8 text-[17px] sm:text-[18px]
                     prose-headings:font-semibold prose-h2:mt-8 prose-h3:mt-6
                     prose-img:rounded-xl prose-img:mx-auto prose-pre:bg-zinc-100
                     prose-a:text-blue-700"
          style={{ WebkitFontSmoothing: "antialiased" }}
        >
          {isLoading ? (
            <p className="text-slate-600">Loading content...</p>
          ) : (
            <ReactMarkdown>{post.content_md}</ReactMarkdown>
          )}
        </div>
      </div>
    </div>
  );
}
