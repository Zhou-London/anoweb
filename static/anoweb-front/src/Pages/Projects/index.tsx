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
  .custom-scrollbar::-webkit-scrollbar-thumb { background-color: var(--gb-border); border-radius: 10px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: var(--gb-fg-muted); }
  .custom-scrollbar { scrollbar-width: thin; scrollbar-color: var(--gb-border) transparent; }
  .prose { max-width: 100%; }
  .prose h1, .prose h2, .prose h3 { color: var(--gb-fg); }
  .prose a { color: var(--gb-primary); }
  .prose a:hover { color: var(--gb-primary-bright); }
  .focused-card { box-shadow: 0 0 18px rgba(69, 133, 136, 0.35); }
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
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-wide" style={{ fontFamily: "'Bebas Neue', sans-serif", color: 'var(--gb-fg)' }}>
            PROJECTS
          </h1>
          {showAdminFeatures && (
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-sm transition-colors"
              style={{ background: 'var(--gb-fg)', color: 'var(--gb-bg)' }}
            >
              <span aria-hidden>+</span>
              New
            </button>
          )}
        </div>

        {/* Mobile Project Selector - horizontal scrollable chips */}
        <div className="lg:hidden">
          <div className="rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4" style={{ background: 'var(--gb-bg)', boxShadow: 'var(--gb-shadow-card)' }}>
            <p className="text-xs sm:text-sm font-semibold mb-2 sm:mb-3" style={{ color: 'var(--gb-fg-soft)' }}>Select a project</p>
            {isLoadingProjects ? (
              <p className="text-sm" style={{ color: 'var(--gb-fg-muted)' }}>Loading...</p>
            ) : projects.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--gb-fg-muted)' }}>No projects yet.</p>
            ) : (
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 custom-scrollbar">
                {projects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProjectId(p.id)}
                    className="flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all"
                    style={{
                      background: p.id === selectedProjectId ? 'var(--gb-primary)' : 'var(--gb-bg-soft)',
                      color: p.id === selectedProjectId ? 'var(--gb-bg)' : 'var(--gb-fg-soft)',
                    }}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-[280px_1fr] xl:grid-cols-[320px_1fr] items-start">
          {/* Sidebar - hidden on mobile, visible on lg+ */}
          <div className="hidden lg:block">
            <ProjectList
              projects={projects}
              selectedProjectId={selectedProjectId}
              isLoading={isLoadingProjects}
              onSelectProject={setSelectedProjectId}
            />
          </div>

          <div className="space-y-4 sm:space-y-6">
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
              <div className="rounded-2xl sm:rounded-3xl shadow-inner p-6 sm:p-10 text-center text-sm sm:text-base" style={{ boxShadow: 'var(--gb-shadow-inset)', background: 'var(--gb-bg-soft)', color: 'var(--gb-fg-muted)' }}>
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
