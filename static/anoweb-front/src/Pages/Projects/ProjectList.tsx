// src/components/ProjectPage/ProjectList.tsx

import { useContext } from "react";
import { type Project } from "./types";
import { AdminContext } from "../../Contexts/admin_context";

type ProjectListProps = {
  projects: Project[];
  selectedProjectId: number | null;
  isLoading: boolean;
  onSelectProject: (id: number) => void;
};

export default function ProjectList({
  projects,
  selectedProjectId,
  isLoading,
  onSelectProject,
}: ProjectListProps) {
  const { isAdmin } = useContext(AdminContext);

  return (
    <aside className="rounded-3xl bg-white/90 border border-slate-200 shadow-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Projects</p>
          <h2 className="text-lg font-semibold text-slate-900">Navigation rail</h2>
        </div>
        {isAdmin && (
          <span className="rounded-full bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 text-[11px] font-semibold">
            Admin tools
          </span>
        )}
      </div>

      <div className="space-y-2 max-h-[520px] overflow-auto custom-scrollbar pr-1">
        {isLoading ? (
          <p className="text-center text-slate-500">Loading projects...</p>
        ) : projects.length === 0 ? (
          <p className="text-center text-slate-500">No projects yet.</p>
        ) : (
          projects.map((p) => (
            <button
              key={p.id}
              onClick={() => onSelectProject(p.id)}
              className={`w-full text-left rounded-2xl border px-4 py-3 transition-all duration-200 shadow-sm hover:shadow-md ${
                p.id === selectedProjectId
                  ? "border-blue-200 bg-blue-50 text-blue-900"
                  : "border-slate-200 bg-white/80 text-slate-800 hover:bg-slate-50"
              }`}
            >
              <p className="text-sm font-semibold leading-tight">{p.name}</p>
              <p
                className="text-[12px] text-slate-600"
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
