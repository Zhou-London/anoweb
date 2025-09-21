// src/components/ProjectPage/ProjectList.tsx

import { useRef, useEffect } from "react";
import { type Project } from "./types";

type ProjectListProps = {
  projects: Project[];
  selectedProjectId: number | null;
  isLoading: boolean;
  onSelectProject: (id: number) => void;
  isOpen: boolean; // 新增：控制移动端菜单是否打开
};

export default function ProjectList({ projects, selectedProjectId, isLoading, onSelectProject, isOpen }: ProjectListProps) {
  const leftRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // 滚动自动选择的逻辑 (保持不变)
  useEffect(() => {
    // ... 此处的滚动逻辑与之前版本完全相同 ...
    const container = leftRef.current;
    if (!container) return;
    let rafId: number;
    const handleScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const containerRect = container.getBoundingClientRect();
        const containerCenterY = containerRect.top + containerRect.height / 2;
        let bestMatch = { id: -1, dist: Infinity };
        for (const project of projects) {
          const el = itemRefs.current[project.id];
          if (el) {
            const elRect = el.getBoundingClientRect();
            const elCenterY = elRect.top + elRect.height / 2;
            const dist = Math.abs(containerCenterY - elCenterY);
            if (dist < bestMatch.dist) {
              bestMatch = { id: project.id, dist };
            }
          }
        }
        if (bestMatch.id !== -1 && bestMatch.id !== selectedProjectId) {
          onSelectProject(bestMatch.id);
        }
      });
    };
    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [projects, selectedProjectId, onSelectProject]);

  return (
    // ✨ 这是关键的修改部分
    <aside
      ref={leftRef}
      className={`
        w-72 h-full flex-col items-stretch py-10 px-4 custom-scrollbar
        transition-transform duration-300 ease-in-out 
        
        md:flex md:static md:translate-x-0 md:bg-transparent md:border-none md:shadow-none md:w-72
        
        fixed top-0 left-0 z-40 bg-white/80 backdrop-blur-lg border-r border-gray-200 shadow-xl
        
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      <div className="h-1/2 shrink-0 md:flex" />
      {isLoading ? (
        <p className="text-center text-slate-500">Loading Projects...</p>
      ) : (
        projects.map((p) => (
          <div
            key={p.id}
            ref={(el) => { itemRefs.current[p.id] = el; }}
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
      <div className="h-1/2 shrink-0 md:flex" />
    </aside>
  );
}