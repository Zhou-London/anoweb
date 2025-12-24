import { useContext } from "react";
import { AdminContext } from "../../Contexts/admin_context";
import { apiFetch } from "../../lib/api";
import type { Experience } from "./types";

type ExperienceCardProps = {
  experience: Experience[];
  setExperience: React.Dispatch<React.SetStateAction<Experience[]>>;
};

export default function ExperienceCard({ experience, setExperience }: ExperienceCardProps) {
  const { isAdmin } = useContext(AdminContext);
  if (!Array.isArray(experience) || experience.length === 0) return null;

  const ordered = experience.slice().sort((a, b) => a.order_index - b.order_index);

  const handleDrop = (fromIndex: number, toIndex: number) => {
    if (!isAdmin || fromIndex === toIndex || Number.isNaN(fromIndex) || Number.isNaN(toIndex)) return;
    const current = ordered.slice();
    const [moved] = current.splice(fromIndex, 1);
    current.splice(toIndex, 0, moved);
    const reindexed = current.map((item, idx) => ({ ...item, order_index: idx }));
    setExperience(reindexed);
    apiFetch("/experience/order", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reindexed.map((it, idx) => ({ id: it.id, order_index: idx }))),
      credentials: "include",
    }).catch(() => {});
  };

  return (
    <ul className="space-y-3">
      {ordered.map((exp, index) => {
        const endDisplay = exp.present ? "Present" : exp.end_date;
        return (
          <li
            key={exp.id}
            draggable={isAdmin}
            onDragStart={(e) => isAdmin && e.dataTransfer.setData("text/plain", String(index))}
            onDragOver={(e) => isAdmin && e.preventDefault()}
            onDrop={(e) => {
              if (!isAdmin) return;
              const fromIndex = Number(e.dataTransfer.getData("text/plain"));
              handleDrop(fromIndex, index);
            }}
            className={`group relative overflow-hidden rounded-2xl border border-slate-200 bg-white/90 p-4 transition-all duration-200 shadow-sm hover:shadow-md ${
              isAdmin ? "cursor-grab" : "cursor-default"
            }`}
          >
            <div className="absolute left-3 top-0 bottom-0 w-[2px] bg-gradient-to-b from-blue-500/30 via-blue-400/30 to-indigo-400/30" aria-hidden />
            <div className="flex items-start gap-4">
              <img src={exp.image_url} alt={exp.company} className="w-12 h-12 rounded-xl object-cover shadow-sm border border-slate-200" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-slate-900 truncate">{exp.company}</p>
                  {isAdmin && <span className="text-[10px] uppercase tracking-[0.12em] text-blue-600 bg-blue-50 border border-blue-100 rounded-full px-2 py-0.5">draggable</span>}
                </div>
                <p className="text-xs text-slate-600 truncate">{exp.position}</p>
                <p className="text-xs text-slate-500">{exp.start_date} – {endDisplay}</p>
                {exp.description && (
                  <p
                    className="mt-2 text-sm text-slate-700 leading-relaxed"
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {exp.description}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-600">
              <span className="rounded-full bg-slate-50 border border-slate-200 px-2 py-1">Order {index + 1}</span>
              {exp.present && <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-1">Present</span>}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
