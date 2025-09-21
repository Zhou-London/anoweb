// src/components/ProjectPage/PostCardRail.tsx

import { useRef, useEffect, useMemo } from "react";
import { type PostShort } from "./types";

type PostCardRailProps = {
  posts: PostShort[];
  isLoading: boolean;
  onViewPost: (postId: number) => void;
};

export function PostCardRail({
  posts,
  isLoading,
  onViewPost,
}: PostCardRailProps) {
  const railRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // 1. ✨ 按日期降序排列帖子
  const sortedPosts = useMemo(() => {
    return [...posts].sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  }, [posts]);

  // 2. ✨ 动态滚动效果的 useEffect
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    const handleScroll = () => {
      const railRect = rail.getBoundingClientRect();
      const railCenterX = railRect.left + railRect.width / 2;

      for (const post of sortedPosts) {
        const card = cardRefs.current[post.id];
        if (card) {
          const cardRect = card.getBoundingClientRect();
          const cardCenterX = cardRect.left + cardRect.width / 2;

          // 计算卡片中心与容器中心的距离
          const delta = cardCenterX - railCenterX;

          // 根据距离计算旋转角度 (可以微调 0.05 这个系数来改变灵敏度)
          const rotation = delta * 0.05;

          // 根据距离计算缩放比例 (离中心越远越小)
          const scale = Math.max(1 - Math.abs(delta) / 2000, 0.9);

          // 应用 3D transform 样式
          card.style.transform = `perspective(1000px) rotateY(${rotation}deg) scale(${scale})`;
        }
      }
    };

    let animationFrameId: number;
    const onScroll = () => {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(handleScroll);
    };

    // 初始化时执行一次，以设置初始卡片位置
    handleScroll();

    rail.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(animationFrameId);
      rail.removeEventListener("scroll", onScroll);
    };
  }, [sortedPosts]); // 当帖子列表变化时，重新设置效果

  return (
    <section className="h-60 shrink-0">
      {/* 3. ✨ 为容器添加 perspective 以激活 3D 效果 */}
      <div
        ref={railRef}
        style={{ perspective: "1000px" }}
        className="h-full flex items-center gap-6 overflow-x-auto snap-x snap-mandatory custom-scrollbar py-2"
      >
        <div className="shrink-0 basis-[calc(50%-8rem)]" />
        {isLoading ? (
          <p className="text-slate-500">Loading Posts...</p>
        ) : posts.length > 0 ? (
          sortedPosts.map((post) => (
            <div
              key={post.id}
              ref={(el) => {
                cardRefs.current[post.id] = el;
              }}
              onClick={() => onViewPost(post.id)}
              className="
                  shrink-0 w-64 h-52 snap-center rounded-2xl p-6 cursor-pointer
                  bg-white/80 hover:bg-white/95 backdrop-blur-md border border-blue-200/50
                  shadow-md flex flex-col justify-between
                  transition-shadow duration-300 hover:shadow-lg hover:shadow-blue-200/60
                "
              // 4. ✨ 移除了基于 state 的 transform 类，现在由 JS 直接控制
            >
              <h3 className="font-semibold text-slate-800 line-clamp-4 text-base">
                {post.name}
              </h3>
              <p className="text-xs text-slate-500 mt-2">
                Updated: {new Date(post.updated_at).toLocaleDateString()}
              </p>
            </div>
          ))
        ) : (
          <div className="text-center w-full text-slate-500">
            No posts found for this project.
          </div>
        )}
        <div className="shrink-0 basis-[calc(50%-8rem)]" />
      </div>
    </section>
  );
}
