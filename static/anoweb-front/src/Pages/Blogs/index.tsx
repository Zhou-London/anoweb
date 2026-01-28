import { useContext, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FanContext } from "../../Contexts/fan_context";
import { useEditMode } from "../../Contexts/edit_mode_context";
import { useErrorNotifier } from "../../Contexts/error_context";
import { useSuccessNotifier } from "../../Contexts/success_context";
import { apiJson, apiFetch } from "../../lib/api";
import BlogCard from "./BlogCard";
import CreateBlogModal from "./CreateBlogModal";
import type { BlogShort } from "./types";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

export default function BlogsPage() {
  const { isAdmin } = useContext(FanContext);
  const { editMode } = useEditMode();
  const showAdminFeatures = isAdmin && editMode;
  const notifyError = useErrorNotifier();
  const notifySuccess = useSuccessNotifier();

  const [blogs, setBlogs] = useState<BlogShort[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchBlogs = async () => {
    setIsLoading(true);
    try {
      const data = await apiJson<BlogShort[]>("/blog", { credentials: "include" });
      setBlogs(data);
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "Failed to load blogs");
      setBlogs([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const sortedBlogs = useMemo(() => {
    return [...blogs].sort(
      (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  }, [blogs]);

  const handleDeleteBlog = async (blogId: number) => {
    if (!confirm("Are you sure you want to delete this blog?")) return;

    try {
      const response = await apiFetch(`/blog/${blogId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to delete blog");
      notifySuccess("Blog deleted successfully");
      fetchBlogs();
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "Failed to delete blog");
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-wide" style={{ fontFamily: "'Bebas Neue', sans-serif", color: 'var(--gb-fg)' }}>
          BLOGS
        </h1>
        {showAdminFeatures && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-sm font-semibold shadow-sm transition-colors"
            style={{ background: 'var(--gb-fg)', color: 'var(--gb-bg)' }}
          >
            <span aria-hidden>+</span>
            New
          </button>
        )}
      </div>

      {/* Blog Grid */}
      <section className="rounded-2xl sm:rounded-3xl shadow-lg p-3 sm:p-6 md:p-8" style={{ background: 'var(--gb-bg)', boxShadow: 'var(--gb-shadow-card)' }}>
        {isLoading ? (
          <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl sm:rounded-2xl animate-pulse" style={{ background: 'var(--gb-bg-soft)' }}>
                <div className="aspect-video rounded-t-xl sm:rounded-t-2xl" style={{ background: 'var(--gb-bg-muted)' }} />
                <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                  <div className="h-3 sm:h-4 rounded w-3/4" style={{ background: 'var(--gb-bg-muted)' }} />
                  <div className="h-2 sm:h-3 rounded w-1/2" style={{ background: 'var(--gb-bg-muted)' }} />
                </div>
              </div>
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-10 sm:py-16 rounded-xl sm:rounded-2xl" style={{ boxShadow: 'var(--gb-shadow-inset)', background: 'var(--gb-bg-soft)' }}>
            <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-3 sm:mb-4" style={{ background: 'var(--gb-fg-muted)', color: 'var(--gb-bg)' }}>
              <span className="text-2xl sm:text-3xl">#</span>
            </div>
            <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2" style={{ color: 'var(--gb-fg)' }}>No blogs yet</h3>
            <p className="text-sm" style={{ color: 'var(--gb-fg-muted)' }}>
              {showAdminFeatures
                ? 'Click "New blog" above to create your first blog post!'
                : "Check back later for new content."}
            </p>
          </div>
        ) : (
          <motion.div
            className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {sortedBlogs.map((blog) => (
              <BlogCard
                key={blog.id}
                blog={blog}
                onDelete={showAdminFeatures ? handleDeleteBlog : undefined}
                showAdminFeatures={showAdminFeatures}
              />
            ))}
          </motion.div>
        )}
      </section>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <CreateBlogModal
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            fetchBlogs();
            setIsCreateModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
