import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import type { BlogShort } from "./types";
import { formatRelativeDate } from "../../lib/dateFormat";

type BlogCardProps = {
  blog: BlogShort;
  onDelete?: (blogId: number) => void;
  showAdminFeatures?: boolean;
};

const defaultEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: defaultEase } },
};

export default function BlogCard({ blog, onDelete, showAdminFeatures }: BlogCardProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete(blog.id);
    }
  };

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Link
        to={`/blogs/${blog.id}`}
        className="group block rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-200"
        style={{ background: 'var(--gb-bg-soft)', boxShadow: 'var(--gb-shadow-card)' }}
      >
        {/* Cover Image */}
        <div className="aspect-video overflow-hidden relative" style={{ background: 'var(--gb-bg-muted)' }}>
          {blog.image_url ? (
            <img
              src={blog.image_url}
              alt={blog.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--gb-accent)' }}>
              <span className="text-5xl" style={{ color: 'var(--gb-bg)' }}>#</span>
            </div>
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Content */}
        <div className="p-4">
          <h3
            className="font-semibold leading-tight mb-2"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              wordBreak: "break-word",
              color: 'var(--gb-fg)',
            }}
            title={blog.title}
          >
            {blog.title}
          </h3>

          {/* Stats row */}
          <div className="flex items-center justify-between text-xs" style={{ color: 'var(--gb-fg-muted)' }}>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {blog.views}
              </span>
              <span className="inline-flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                {blog.likes_count}
              </span>
            </div>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" aria-hidden style={{ background: 'var(--gb-accent)' }} />
              {formatRelativeDate(blog.updated_at)}
            </span>
          </div>

          {/* Admin delete button */}
          {showAdminFeatures && (
            <div className="mt-3 pt-3 flex justify-end" style={{ boxShadow: 'inset 0 1px 0 var(--gb-shadow)' }}>
              <button
                onClick={handleDelete}
                className="font-semibold text-xs transition-colors"
                style={{ color: 'var(--gb-error)' }}
                aria-label="Delete blog"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
