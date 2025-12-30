// src/components/ProjectPage/PostsGrid.tsx

import { useMemo, useContext } from "react";
import { motion } from "framer-motion";
import { type PostShort } from "./types";
import { UserContext } from "../../Contexts/user_context";
import { useEditMode } from "../../Contexts/edit_mode_context";

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
  const { isAdmin } = useContext(UserContext);
  const { editMode } = useEditMode();
  const showAdminFeatures = isAdmin && editMode;

  const sortedPosts = useMemo(() => {
    return [...posts].sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  }, [posts]);

  return (
    <section className="rounded-3xl bg-white/90 border border-slate-200 shadow-lg p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Posts</p>
          <h3 className="text-lg font-semibold text-slate-900">Project updates</h3>
        </div>
        {showAdminFeatures && (
          <button
            onClick={onOpenCreateModal}
            className="rounded-full bg-blue-600 text-white px-3 py-1.5 text-xs font-semibold shadow-sm hover:bg-blue-700 transition-colors"
          >
            + New post
          </button>
        )}
      </div>

      {isLoading ? (
        <p className="text-slate-500 text-center py-12">Loading posts...</p>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 rounded-2xl border border-dashed border-slate-300 bg-slate-50/50">
          <p className="text-slate-500">No posts found for this project.</p>
        </div>
      ) : (
        <motion.div
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
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
      className="relative overflow-hidden rounded-2xl bg-white/80 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group h-full"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-purple-500/10" aria-hidden />
      <div className="relative p-4 flex flex-col h-full">
        <div className="flex items-start gap-2 mb-3">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white grid place-items-center text-sm font-semibold shrink-0">
            MD
          </div>
          <div className="min-w-0 flex-1">
            <p
              className="text-sm font-semibold text-slate-900 leading-tight"
              style={{
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
            <p className="text-[11px] text-slate-600 mt-1">
              Updated {new Date(post.updated_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="mt-auto pt-3 flex items-center justify-between border-t border-slate-100">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-blue-500" aria-hidden />
          </span>
          {showAdminFeatures && (
            <button
              onClick={handleDelete}
              className="text-rose-600 hover:text-rose-700 font-semibold text-xs transition-colors"
              aria-label="Delete post"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
