// src/components/ProjectPage/ProjectList.tsx

import { useContext, useState, useMemo } from "react";
import { type Project } from "./types";
import { FanContext } from "../../Contexts/fan_context";
import { useEditMode } from "../../Contexts/edit_mode_context";

type ProjectListProps = {
  projects: Project[];
  selectedProjectId: number | null;
  isLoading: boolean;
  onSelectProject: (id: number) => void;
};

type SortOption = "name" | "newest" | "oldest";

export default function ProjectList({
  projects,
  selectedProjectId,
  isLoading,
  onSelectProject,
}: ProjectListProps) {
  const { isAdmin } = useContext(FanContext);
  const { editMode } = useEditMode();
  const showAdminFeatures = isAdmin && editMode;
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [showSortMenu, setShowSortMenu] = useState(false);

  const filteredAndSortedProjects = useMemo(() => {
    let filtered = projects;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = projects.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          (p.description && p.description.toLowerCase().includes(query))
      );
    }
    return [...filtered].sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
      if (sortBy === "newest") return bTime - aTime;
      return aTime - bTime;
    });
  }, [projects, searchQuery, sortBy]);

  return (
    <aside className="rounded-3xl bg-white/90 border border-slate-200 shadow-lg p-4 space-y-3">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowSearch(!showSearch)}
          className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 ${showSearch ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"}`}
          title="Search"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
        <div className="relative">
          <button
            onClick={() => setShowSortMenu(!showSortMenu)}
            className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 ${showSortMenu ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"}`}
            title="Sort"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
          </button>
          {showSortMenu && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 py-1 min-w-[120px]">
              {[
                { value: "newest" as SortOption, label: "Newest" },
                { value: "oldest" as SortOption, label: "Oldest" },
                { value: "name" as SortOption, label: "Name" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => { setSortBy(option.value); setShowSortMenu(false); }}
                  className={`w-full text-left px-3 py-1.5 text-sm transition-colors hover:bg-indigo-50 ${sortBy === option.value ? "text-indigo-600 font-medium bg-indigo-50" : "text-slate-700"}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
        {showAdminFeatures && (
          <span className="ml-auto rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 text-xs font-semibold">
            Admin
          </span>
        )}
      </div>

      {showSearch && (
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search projects..."
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          autoFocus
        />
      )}

      <div className="space-y-2 max-h-[480px] overflow-auto custom-scrollbar pr-1">
        {isLoading ? (
          <p className="text-center text-slate-500">Loading projects...</p>
        ) : filteredAndSortedProjects.length === 0 ? (
          <p className="text-center text-slate-500 py-4">{searchQuery ? "No matching projects." : "No projects yet."}</p>
        ) : (
          filteredAndSortedProjects.map((p) => (
            <button
              key={p.id}
              onClick={() => onSelectProject(p.id)}
              className={`w-full text-left rounded-2xl border px-4 py-3 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] ${
                p.id === selectedProjectId
                  ? "border-indigo-300 bg-indigo-50 text-indigo-900 shadow-md"
                  : "border-slate-200 bg-white text-slate-800 hover:border-indigo-200 hover:bg-indigo-50/50"
              }`}
            >
              <p className="text-sm font-semibold leading-tight">{p.name}</p>
              <p
                className={`text-[12px] mt-0.5 ${p.id === selectedProjectId ? "text-indigo-600" : "text-slate-500"}`}
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {p.description || "No description"}
              </p>
            </button>
          ))
        )}
      </div>
    </aside>
  );
}
