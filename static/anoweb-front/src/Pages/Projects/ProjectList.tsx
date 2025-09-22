// src/components/ProjectPage/ProjectList.tsx

import { useRef, useContext } from "react";
import { type Project } from "./types";
import { AdminContext } from "../../Contexts/admin_context";

type ProjectListProps = {
  projects: Project[];
  selectedProjectId: number | null;
  isLoading: boolean;
  onSelectProject: (id: number) => void;
  isOpen: boolean;
  onOpenCreateModal: () => void;
};

export default function ProjectList({
  projects,
  selectedProjectId,
  isLoading,
  onSelectProject,
  isOpen,
  onOpenCreateModal,
}: ProjectListProps) {
  const leftRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const { isAdmin } = useContext(AdminContext);

  return (
    <aside
      ref={leftRef}
      className={`
        w-72 h-full flex flex-col items-stretch pt-10 px-4 custom-scrollbar
        transition-transform duration-300 ease-in-out 
        md:flex md:static md:translate-x-0 md:bg-transparent md:border-none md:shadow-none md:w-72
        fixed top-0 left-0 z-40 bg-white/80 backdrop-blur-lg border-r border-gray-200 shadow-xl
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
    >
      {isAdmin && (
        <div className="px-4 pb-6 border-b border-slate-200/80">
          <button
            onClick={onOpenCreateModal}
            className="w-full bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-600 transition-colors"
          >
            + New Project
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="h-1/2" />
        {isLoading ? (
          <p className="text-center text-slate-500">Loading Projects...</p>
        ) : (
          projects.map((p) => (
            <div
              key={p.id}
              ref={(el) => {
                itemRefs.current[p.id] = el;
              }}
              onClick={() => onSelectProject(p.id)}
              className={[
                "snap-center my-3 py-3 cursor-pointer text-center transition-all duration-300 mx-auto w-full text-lg",
                p.id === selectedProjectId
                  ? "font-bold scale-110 text-blue-400"
                  : "font-normal text-slate-600 hover:text-blue-300",
              ].join(" ")}
            >
              {p.name}
            </div>
          ))
        )}
        <div className="h-1/2" />
      </div>
    </aside>
  );
}
