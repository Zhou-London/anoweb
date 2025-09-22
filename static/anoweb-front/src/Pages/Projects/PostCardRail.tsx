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

  const sortedPosts = useMemo(() => {
    return [...posts].sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  }, [posts]);

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

          const delta = cardCenterX - railCenterX;

          const rotation = delta * 0.05;

          const scale = Math.max(1 - Math.abs(delta) / 2000, 0.9);

          card.style.transform = `perspective(1000px) rotateY(${rotation}deg) scale(${scale})`;
        }
      }
    };

    let animationFrameId: number;
    const onScroll = () => {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(handleScroll);
    };

    handleScroll();

    rail.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(animationFrameId);
      rail.removeEventListener("scroll", onScroll);
    };
  }, [sortedPosts]);

  return (
    <section className="h-60 shrink-0">
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
