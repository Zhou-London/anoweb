// src/components/ProjectPage/PostsGrid.tsx

import { useMemo, useContext } from "react";
import { motion } from "framer-motion";
import { type PostShort } from "./types";
import { FanContext } from "../../Contexts/fan_context";
import { useEditMode } from "../../Contexts/edit_mode_context";
import { formatRelativeDate } from "../../lib/dateFormat";

type PostsGridProps = {
  posts: PostShort[];
  isLoading: boolean;
  onViewPost: (postId: number) => void;
  onOpenCreateModal: () => void;
  onDeletePost: (postId: number) => void;
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const defaultEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: defaultEase } },
};

export function PostsGrid({
  posts,
  isLoading,
  onViewPost,
  onOpenCreateModal,
  onDeletePost,
}: PostsGridProps) {
  const { isAdmin } = useContext(FanContext);
  const { editMode } = useEditMode();
  const showAdminFeatures = isAdmin && editMode;

  const sortedPosts = useMemo(() => {
    return [...posts].sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  }, [posts]);

  return (
    <section className="rounded-3xl shadow-lg p-4 sm:p-6 md:p-8" style={{ background: 'var(--gb-bg)', boxShadow: 'var(--gb-shadow-card)' }}>
      <div className="flex items-center justify-between gap-4 mb-5">
        <h3 className="text-lg font-bold" style={{ color: 'var(--gb-fg)' }}>Posts</h3>
        {showAdminFeatures && (
          <button
            onClick={onOpenCreateModal}
            className="flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm hover:scale-105 active:scale-95 transition-all duration-200"
            style={{ background: 'var(--gb-fg)', color: 'var(--gb-bg)' }}
          >
            + New
          </button>
        )}
      </div>

      {isLoading ? (
        <p className="text-center py-12" style={{ color: 'var(--gb-fg-muted)' }}>Loading posts...</p>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 rounded-2xl" style={{ boxShadow: 'var(--gb-shadow-inset)', background: 'var(--gb-bg-soft)' }}>
          <p style={{ color: 'var(--gb-fg-muted)' }}>No posts found for this project.</p>
        </div>
      ) : (
        <motion.div
          className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {sortedPosts.map((post) => (
            <motion.div
              key={post.id}
              variants={itemVariants}
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <PostGridCard
                post={post}
                onViewPost={onViewPost}
                onDeletePost={onDeletePost}
                showAdminFeatures={showAdminFeatures}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </section>
  );
}

type PostGridCardProps = {
  post: PostShort;
  onViewPost: (postId: number) => void;
  onDeletePost: (postId: number) => void;
  showAdminFeatures: boolean;
};

function PostGridCard({ post, onViewPost, onDeletePost, showAdminFeatures }: PostGridCardProps) {
  const handleClick = () => {
    onViewPost(post.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeletePost(post.id);
  };

  return (
    <div
      onClick={handleClick}
      className="group rounded-xl p-4 cursor-pointer hover:shadow-lg transition-all duration-200"
      style={{ background: 'var(--gb-bg-soft)', boxShadow: 'var(--gb-shadow-card)' }}
    >
      <p
        className="text-sm font-semibold leading-snug transition-colors"
        style={{
          color: 'var(--gb-fg)',
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          wordBreak: "break-word",
        }}
        title={post.name}
      >
        {post.name}
      </p>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs" style={{ color: 'var(--gb-fg-muted)' }}>{formatRelativeDate(post.updated_at)}</span>
        {showAdminFeatures && (
          <button
            onClick={handleDelete}
            className="font-medium text-xs transition-colors opacity-0 group-hover:opacity-100"
            style={{ color: 'var(--gb-error)' }}
            aria-label="Delete post"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
