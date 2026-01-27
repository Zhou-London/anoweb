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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-4xl md:text-5xl font-bold tracking-wide text-slate-900" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
          BLOGS
        </h1>
        {showAdminFeatures && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 text-white px-4 py-2 text-sm font-semibold shadow-sm hover:bg-slate-800 transition-colors"
          >
            <span aria-hidden>+</span>
            New
          </button>
        )}
      </div>

      {/* Blog Grid */}
      <section className="rounded-3xl bg-white/90 border border-slate-200 shadow-lg p-4 sm:p-6 md:p-8">
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl bg-slate-100 animate-pulse">
                <div className="aspect-video bg-slate-200 rounded-t-2xl" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-dashed border-slate-300 bg-slate-50/50">
            <div className="mx-auto w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-4">
              <span className="text-3xl">📝</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No blogs yet</h3>
            <p className="text-slate-600">
              {showAdminFeatures
                ? 'Click "New blog" above to create your first blog post!'
                : "Check back later for new content."}
            </p>
          </div>
        ) : (
          <motion.div
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
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
