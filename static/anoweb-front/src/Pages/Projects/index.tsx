// src/components/ProjectPage/index.tsx

import { useState } from "react";
import { useProjectData } from "./useProjectData";
import ProjectList from "./ProjectList";
import { ProjectDetails } from "./ProjectDetails";
import { PostCardRail } from "./PostCardRail";
import { PostDetailModal } from "./PostDetailModal";

// ✨ FIX: 恢复为纤细、半透明的滚动条样式
const styles = `
  /* --- Custom Transparent Scrollbar --- */
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 10px;
    transition: background-color 0.2s;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: rgba(0, 0, 0, 0.4);
  }
  /* For Firefox */
  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
  }

  /* --- Markdown Styling --- */
  .prose { max-width: 100%; }
  .prose h1, .prose h2, .prose h3 { color: #334155; }
  .prose a { color: #2563eb; } /* Blue-600 */
  .prose a:hover { color: #1d4ed8; } /* Blue-700 */
`;

// 一个简单的汉堡菜单图标组件
function MenuIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

export default function ProjectPage() {
  const {
    projects,
    posts,
    viewingPost,
    selectedProjectId,
    selectedProject,
    isLoadingProjects,
    isLoadingPosts,
    isLoadingPostDetail,
    setSelectedProjectId,
    setViewingPost,
    handleViewPost,
  } = useProjectData();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      <style>{styles}</style>
      <div className="min-h-screen h-screen w-full overflow-hidden flex relative">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white/70 backdrop-blur-sm rounded-md shadow-md text-slate-700"
          aria-label="Open menu"
        >
          <MenuIcon />
        </button>
        
        {isSidebarOpen && (
          <div 
            className="md:hidden fixed inset-0 bg-black/30 z-30"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        <ProjectList 
          projects={projects}
          selectedProjectId={selectedProjectId}
          isLoading={isLoadingProjects}
          onSelectProject={(id) => {
            setSelectedProjectId(id);
            setIsSidebarOpen(false);
          }}
          isOpen={isSidebarOpen}
        />
        
        <main className="flex-1 flex flex-col p-4 md:p-6 overflow-hidden">
          {selectedProject ? (
            <>
              <ProjectDetails project={selectedProject} />
              <PostCardRail 
                posts={posts}
                isLoading={isLoadingPosts}
                onViewPost={handleViewPost}
              />
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500">
              {isLoadingProjects ? "Loading..." : "Select a project to see details."}
            </div>
          )}
        </main>

        {viewingPost && (
          <PostDetailModal 
            post={viewingPost}
            isLoading={isLoadingPostDetail}
            onClose={() => setViewingPost(null)}
          />
        )}
      </div>
    </>
  );
}