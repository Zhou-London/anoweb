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
    apiFetch("/home/experience/order", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reindexed.map((it, idx) => ({ id: it.id, order_index: idx }))),
      credentials: "include",
    }).catch(() => {});
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 w-full h-full flex flex-col">
      <h2 className="text-lg font-semibold text-gray-800 mb-3">Experience</h2>
      <ul className="space-y-3 flex-1 overflow-auto">
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
              className={`flex items-center gap-3 p-3 rounded-xl transition-transform duration-200 hover:scale-[1.01] hover:shadow-md ${
                isAdmin ? "cursor-grab border border-dashed border-gray-300" : "cursor-pointer"
              }`}
            >
              <img src={exp.image_url} alt={exp.company} className="w-12 h-12 rounded-md object-cover shadow-sm" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{exp.company}</p>
                <p className="text-xs text-gray-600 truncate">{exp.position}</p>
                <p className="text-xs text-gray-500">{exp.start_date} – {endDisplay}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
