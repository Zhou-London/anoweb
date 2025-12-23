// src/components/ProjectPage/index.tsx

import { useProjectData } from "./useProjectData";
import ProjectList from "./ProjectList";
import { ProjectDetails } from "./ProjectDetails";
import { PostCardRail } from "./PostCardRail";
import CreateProjectModal from "./CreateProjectModal";
import CreatePostModal from "./CreatePostModal";

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

  return (
    <>
      <style>{styles}</style>
      <div className="space-y-6">
        <section className="rounded-3xl bg-white/90 border border-slate-200 shadow-lg overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#e8f0fe] via-white to-[#e6f4ea]" aria-hidden />
          <div className="relative p-6 md:p-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Projects</p>
              <h1 className="text-3xl font-semibold text-slate-900">Workspace</h1>
              <p className="text-slate-700 mt-1 max-w-3xl">
                Browse all portfolio projects, open detailed posts in the markdown reader, and manage content through the live API.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 text-xs font-semibold">
                {projects.length} projects
              </span>
              <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1 text-xs font-semibold">
                {posts.length} posts
              </span>
              <button
                onClick={openCreateModal}
                className="rounded-full bg-blue-600 text-white px-4 py-2 text-sm font-semibold shadow-sm hover:bg-blue-700"
              >
                New project
              </button>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr] items-start">
          <ProjectList
            projects={projects}
            selectedProjectId={selectedProjectId}
            isLoading={isLoadingProjects}
            onSelectProject={setSelectedProjectId}
            onOpenCreateModal={openCreateModal}
          />

          <div className="space-y-5">
            {selectedProject ? (
              <>
                <ProjectDetails project={selectedProject} onProjectUpdate={refreshProjects} />
                <PostCardRail
                  posts={posts}
                  isLoading={isLoadingPosts}
                  onViewPost={handleViewPost}
                  onOpenCreateModal={openCreatePostModal}
                  onDeletePost={handleDeletePost}
                />
              </>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white/80 shadow-inner p-10 text-center text-slate-500">
                {isLoadingProjects ? "Loading projects..." : "Select a project from the left to view details."}
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