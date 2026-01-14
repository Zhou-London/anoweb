// src/components/ProjectPage/index.tsx

import { useContext } from "react";
import { useProjectData } from "./useProjectData";
import ProjectList from "./ProjectList";
import { ProjectDetails } from "./ProjectDetails";
import { PostsGrid } from "./PostsGrid";
import CreateProjectModal from "./CreateProjectModal";
import CreatePostModal from "./CreatePostModal";
import { FanContext } from "../../Contexts/fan_context";
import { useEditMode } from "../../Contexts/edit_mode_context";

const styles = `
  .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(0, 0, 0, 0.2); border-radius: 10px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(0, 0, 0, 0.4); }
  .custom-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(0, 0, 0, 0.2) transparent; }
  .prose { max-width: 100%; }
  .prose h1, .prose h2, .prose h3 { color: #334155; }
  .prose a { color: #2563eb; }
  .prose a:hover { color: #1d4ed8; }
  .focused-card { box-shadow: 0 0 18px rgba(66, 133, 244, 0.35); }
`;

export default function ProjectPage() {
  const {
    projects,
    posts,
    selectedProjectId,
    selectedProject,
    isLoadingProjects,
    isLoadingPosts,
    setSelectedProjectId,
    handleViewPost,
    isCreateModalOpen,
    openCreateModal,
    closeCreateModal,
    refreshProjects,
    isCreatePostModalOpen,
    openCreatePostModal,
    closeCreatePostModal,
    refreshPosts,
    handleDeletePost,
  } = useProjectData();
  const { isAdmin } = useContext(FanContext);
  const { editMode } = useEditMode();
  const showAdminFeatures = isAdmin && editMode;

  return (
    <>
      <style>{styles}</style>
      <div className="space-y-6">
        <section className="rounded-3xl bg-white/90 border border-slate-200 shadow-lg overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#e8f0fe] via-white to-[#e6f4ea]" aria-hidden />
          <div className="relative p-6 md:p-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-slate-900">Projects</h1>
              <p className="text-slate-700 mt-1">Browse my works.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 text-xs font-semibold">
                {projects.length} projects
              </span>
              <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1 text-xs font-semibold">
                {posts.length} posts
              </span>
              {showAdminFeatures && (
                <button
                  onClick={openCreateModal}
                  className="inline-flex items-center gap-2 rounded-full bg-blue-600 text-white px-4 py-2 text-sm font-semibold shadow-sm hover:bg-blue-700"
                >
                  <span aria-hidden>＋</span>
                  New project
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Mobile Project Selector - horizontal scrollable chips */}
        <div className="lg:hidden">
          <div className="rounded-2xl bg-white/90 border border-slate-200 shadow-lg p-4">
            <p className="text-sm font-semibold text-slate-700 mb-3">Select a project</p>
            {isLoadingProjects ? (
              <p className="text-slate-500 text-sm">Loading...</p>
            ) : projects.length === 0 ? (
              <p className="text-slate-500 text-sm">No projects yet.</p>
            ) : (
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 custom-scrollbar">
                {projects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProjectId(p.id)}
                    className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                      p.id === selectedProjectId
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr] items-start">
          {/* Sidebar - hidden on mobile, visible on lg+ */}
          <div className="hidden lg:block">
            <ProjectList
              projects={projects}
              selectedProjectId={selectedProjectId}
              isLoading={isLoadingProjects}
              onSelectProject={setSelectedProjectId}
            />
          </div>

          <div className="space-y-6">
            {selectedProject ? (
              <>
                <ProjectDetails project={selectedProject} onProjectUpdate={refreshProjects} />
                <PostsGrid
                  posts={posts}
                  isLoading={isLoadingPosts}
                  onViewPost={handleViewPost}
                  onOpenCreateModal={openCreatePostModal}
                  onDeletePost={handleDeletePost}
                />
              </>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white/80 shadow-inner p-10 text-center text-slate-500">
                {isLoadingProjects ? "Loading projects..." : "Select a project above to view details."}
              </div>
            )}
          </div>
        </div>

        {isCreateModalOpen && (
          <CreateProjectModal
            onClose={closeCreateModal}
            onSuccess={() => {
              refreshProjects();
              closeCreateModal();
            }}
          />
        )}

        {isCreatePostModalOpen && selectedProjectId && (
          <CreatePostModal
            onClose={closeCreatePostModal}
            onSuccess={() => {
              refreshPosts();
              closeCreatePostModal();
            }}
            parentId={selectedProjectId}
          />
        )}
      </div>
    </>
  );
}