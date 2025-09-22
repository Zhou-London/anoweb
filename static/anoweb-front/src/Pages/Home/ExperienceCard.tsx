// src/components/Home/ExperienceCard.tsx

import { useContext } from "react";
import { AdminContext } from "../../Contexts/admin_context";
import type { Experience } from "./types";

type ExperienceCardProps = {
  experience: Experience[];
  setExperience: React.Dispatch<React.SetStateAction<Experience[]>>;
};

export default function ExperienceCard({ experience, setExperience }: ExperienceCardProps) {
  const { isAdmin } = useContext(AdminContext);

  const handleDrop = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;

    const updated = [...experience].sort((a, b) => a.order_index - b.order_index);
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);

    const newOrder = updated.map((item, idx) => ({ id: item.id, order_index: idx }));

    setExperience(updated.map((item, idx) => ({ ...item, order_index: idx })));

    fetch("/api/home/experience/order", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newOrder),
      credentials: "include",
    });
  };

  if (experience.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 w-full md:max-w-sm">
      <h2 className="text-lg font-semibold text-gray-800 mb-3">Experience</h2>
      <ul className="space-y-3">
        {experience
          .slice()
          .sort((a, b) => a.order_index - b.order_index)
          .map((exp, index) => {
            const endDisplay = exp.present ? "Present" : exp.end_date;
            return (
              <li
                key={exp.id}
                draggable={isAdmin}
                onDragStart={(e) => e.dataTransfer.setData("text/plain", index.toString())}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  const fromIndex = Number(e.dataTransfer.getData("text/plain"));
                  handleDrop(fromIndex, index);
                }}
                className={`flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition-transform duration-200 ease-in-out transform hover:scale-105 hover:shadow-xl ${isAdmin ? "border border-dashed border-gray-300" : ""}`}
              >
                <img
                  src={exp.image_url}
                  alt={exp.company}
                  className="w-12 h-12 rounded-md object-cover shadow-sm"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{exp.company}</p>
                  <p className="text-xs text-gray-600">{exp.position}</p>
                  <p className="text-xs text-gray-500">
                    {exp.start_date} – {endDisplay}
                  </p>
                </div>
              </li>
            );
          })}
      </ul>
    </div>
  );
}