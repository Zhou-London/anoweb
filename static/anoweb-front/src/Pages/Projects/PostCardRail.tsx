// src/components/ProjectPage/PostCardRail.tsx

import { useRef, useEffect, useMemo, useState, useContext } from "react";
import { type PostShort } from "./types";
import { UserContext } from "../../Contexts/user_context";
import { useEditMode } from "../../Contexts/edit_mode_context";

type PostCardRailProps = {
  posts: PostShort[];
  isLoading: boolean;
  onViewPost: (postId: number) => void;
  onOpenCreateModal: () => void;
  onDeletePost: (postId: number) => void;
};

export function PostCardRail({
  posts,
  isLoading,
  onViewPost,
  onOpenCreateModal,
  onDeletePost,
}: PostCardRailProps) {
  const railRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const [focusedPostId, setFocusedPostId] = useState<number | null>(null);
  const { isAdmin } = useContext(UserContext);
  const { editMode } = useEditMode();
  const showAdminFeatures = isAdmin && editMode;

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
    <section className="rounded-3xl bg-white/90 border border-slate-200 shadow-lg p-4">
      <div className="flex items-center justify-between mb-3 px-1">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Posts</p>
          <h3 className="text-lg font-semibold text-slate-900">Project updates</h3>
        </div>
        {showAdminFeatures && (
          <button
            onClick={onOpenCreateModal}
            className="rounded-full bg-blue-600 text-white px-3 py-1.5 text-xs font-semibold shadow-sm hover:bg-blue-700"
          >
            + New post
          </button>
        )}
      </div>
      <div
        ref={railRef}
        className="h-60 flex items-center gap-4 overflow-x-auto snap-x snap-mandatory custom-scrollbar pb-2"
      >
        {isLoading ? (
          <p className="text-slate-500 px-4">Loading Posts...</p>
        ) : posts.length > 0 ? (
          sortedPosts.map((post) => (
            <div
              key={post.id}
              ref={(el) => {
                cardRefs.current[post.id] = el;
              }}
              onClick={() => handleCardClick(post)}
              className={`shrink-0 w-64 h-full snap-start rounded-2xl border p-4 cursor-pointer bg-white/80 shadow-sm hover:shadow-md transition-all duration-200 relative ${
                focusedPostId === post.id ? "focused-card" : "border-slate-200"
              }`}
            >
              <div className="flex items-start gap-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white grid place-items-center text-sm font-semibold">
                  MD
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 line-clamp-3">{post.name}</p>
                  <p className="text-[11px] text-slate-600">Updated {new Date(post.updated_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] text-slate-600">
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  Opens in new tab
                </span>
                {showAdminFeatures && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeletePost(post.id);
                    }}
                    className="text-rose-600 hover:text-rose-700 font-semibold"
                    aria-label="Delete post"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center w-full text-slate-500 px-4">No posts found for this project.</div>
        )}
      </div>
    </section>
  );
}
