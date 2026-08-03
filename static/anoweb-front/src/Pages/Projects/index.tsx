import { useContext } from "react";
import { useProjectData } from "./useProjectData";
import { ProjectDetails } from "./ProjectDetails";
import { PostsGrid } from "./PostsGrid";
import CreateProjectModal from "./CreateProjectModal";
import CreatePostModal from "./CreatePostModal";
import { FanContext } from "../../Contexts/fan_context";
import { useEditMode } from "../../Contexts/edit_mode_context";
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <h1
          className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-wide"
          style={{ fontFamily: "'Bebas Neue', sans-serif", color: "var(--gb-fg)" }}
        >
          PROJECTS
        </h1>
        {showAdminFeatures && (
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-sm transition-colors"
            style={{ background: "var(--gb-fg)", color: "var(--gb-bg)" }}
          >
            <span aria-hidden>+</span>
            New
          </button>
        )}
      </div>

      {/* Project selector — horizontal grid */}
      {isLoadingProjects ? (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex-shrink-0 w-36 h-24 rounded-xl animate-pulse"
              style={{ background: "var(--gb-bg-soft)" }}
            />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div
          className="text-center py-10 rounded-2xl"
          style={{ boxShadow: "var(--gb-shadow-inset)", background: "var(--gb-bg-soft)", color: "var(--gb-fg-muted)" }}
        >
          No projects yet.
        </div>
      ) : (
        <div className="flex gap-2 flex-wrap">
          {projects.map((p) => {
            const isSelected = p.id === selectedProjectId;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedProjectId(p.id)}
                className="flex items-center gap-2 rounded-full pl-1 pr-3.5 py-1 text-sm font-medium transition-all duration-200 hover:shadow-md active:scale-[0.97]"
                style={{
                  background: isSelected ? "var(--gb-accent)" : "var(--gb-bg-soft)",
                  color: isSelected ? "var(--gb-bg)" : "var(--gb-fg)",
                  boxShadow: "var(--gb-shadow-card)",
                }}
              >
                {p.image_url ? (
                  <img
                    src={p.image_url}
                    alt=""
                    className="w-7 h-7 rounded-full object-cover"
                  />
                ) : (
                  <span
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: isSelected ? "rgba(255,255,255,0.2)" : "var(--gb-bg-muted)", color: isSelected ? "var(--gb-bg)" : "var(--gb-fg-muted)" }}
                  >
                    {p.name.charAt(0)}
                  </span>
                )}
                {p.name}
              </button>
            );
          })}
        </div>
      )}

      {/* Selected project detail + posts */}
      {selectedProject ? (
        <div className="space-y-6">
          <ProjectDetails project={selectedProject} onProjectUpdate={refreshProjects} />
          <PostsGrid
            posts={posts}
            isLoading={isLoadingPosts}
            onViewPost={handleViewPost}
            onOpenCreateModal={openCreatePostModal}
            onDeletePost={handleDeletePost}
          />
        </div>
      ) : (
        !isLoadingProjects && projects.length > 0 && (
          <p className="text-sm" style={{ color: "var(--gb-fg-muted)" }}>
            Select a project above.
          </p>
        )
      )}

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
  );
}
