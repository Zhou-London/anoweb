// src/components/ProjectPage/PostCardRail.tsx

import { useRef, useEffect, useMemo, useState, useContext } from "react";
import { type PostShort } from "./types";
import { AdminContext } from "../../Contexts/admin_context";

type PostCardRailProps = {
  posts: PostShort[];
  isLoading: boolean;
  onViewPost: (postId: number) => void;
  onOpenCreateModal: () => void;
};

export function PostCardRail({
  posts,
  isLoading,
  onViewPost,
  onOpenCreateModal,
}: PostCardRailProps) {
  const railRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const [focusedPostId, setFocusedPostId] = useState<number | null>(null);
  const { isAdmin } = useContext(AdminContext);

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

          const scale = Math.max(1 - Math.abs(delta) / 1000, 0.85);
          const opacity = Math.max(1 - Math.abs(delta) / 500, 0.4);

          card.style.transform = `perspective(1000px) scale(${scale})`;
          card.style.opacity = `${opacity}`;
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

  const handleCardClick = (post: PostShort) => {
    setFocusedPostId(post.id);
    onViewPost(post.id);

    const cardElement = cardRefs.current[post.id];
    if (cardElement) {
      cardElement.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  };

  return (
    <section className="h-60 shrink-0" style={{ perspective: "1500px" }}>
      <div
        ref={railRef}
        className="h-full flex items-center gap-6 overflow-x-auto snap-x snap-mandatory custom-scrollbar py-2"
      >
        <div className="shrink-0 basis-[calc(50%-8rem)]" />
        {isAdmin && (
          <button
            onClick={onOpenCreateModal}
            className="shrink-0 w-64 h-52 snap-center rounded-2xl p-6 cursor-pointer bg-blue-500/80 hover:bg-blue-500/95 text-white flex items-center justify-center text-2xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-blue-200/60"
          >
            + New Post
          </button>
        )}
        {isLoading ? (
          <p className="text-slate-500">Loading Posts...</p>
        ) : posts.length > 0 ? (
          sortedPosts.map((post) => (
            <div
              key={post.id}
              ref={(el) => {
                cardRefs.current[post.id] = el;
              }}
              onClick={() => handleCardClick(post)}
              className={`
                  shrink-0 w-64 h-52 snap-center rounded-2xl p-6 cursor-pointer
                  bg-white/80 hover:bg-white/95 backdrop-blur-md border border-blue-200/50
                  shadow-md flex flex-col justify-between
                  transition-shadow duration-300 hover:shadow-lg hover:shadow-blue-200/60
                  ${focusedPostId === post.id ? "focused-card" : ""}
                `}
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