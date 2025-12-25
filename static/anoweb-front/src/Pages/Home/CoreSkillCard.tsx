import { useState } from "react";
import type { CoreSkill } from "./types";
import { useEditMode } from "../../Contexts/edit_mode_context";
import { useContext } from "react";
import { UserContext } from "../../Contexts/user_context";

interface CoreSkillCardProps {
  skill: CoreSkill;
  onDragStart?: (e: React.DragEvent, skill: CoreSkill) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, skill: CoreSkill) => void;
  onDelete?: (id: number) => void;
  onEdit?: (skill: CoreSkill) => void;
}

export default function CoreSkillCard({
  skill,
  onDragStart,
  onDragOver,
  onDrop,
  onDelete,
  onEdit,
}: CoreSkillCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { editMode } = useEditMode();
  const { isAdmin } = useContext(UserContext);
  const showAdminFeatures = isAdmin && editMode;

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      className={`group relative rounded-2xl bg-white/90 border-2 shadow-md transition-all ${
        showAdminFeatures ? "cursor-move hover:shadow-xl hover:scale-105" : ""
      } ${isExpanded ? "border-blue-300" : "border-slate-200"}`}
      draggable={showAdminFeatures}
      onDragStart={onDragStart ? (e) => onDragStart(e, skill) : undefined}
      onDragOver={onDragOver}
      onDrop={onDrop ? (e) => onDrop(e, skill) : undefined}
    >
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-slate-900 mb-3">{skill.name}</h3>

            {skill.bullet_points && skill.bullet_points.length > 0 && (
              <div className="space-y-2">
                <ul className="list-none space-y-2">
                  {(isExpanded ? skill.bullet_points : skill.bullet_points.slice(0, 2)).map(
                    (point, index) => (
                      <li key={index} className="flex items-start gap-2 text-slate-700">
                        <span className="text-blue-600 font-bold mt-1">•</span>
                        <span className="flex-1 text-sm leading-relaxed">{point}</span>
                      </li>
                    )
                  )}
                </ul>

                {skill.bullet_points.length > 2 && (
                  <button
                    onClick={handleToggleExpand}
                    className="text-blue-600 hover:text-blue-700 text-sm font-semibold mt-2 flex items-center gap-1 transition-colors"
                  >
                    {isExpanded ? (
                      <>
                        <span>Show less</span>
                        <svg
                          className="w-4 h-4 transition-transform"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 15l7-7 7 7"
                          />
                        </svg>
                      </>
                    ) : (
                      <>
                        <span>Show {skill.bullet_points.length - 2} more</span>
                        <svg
                          className="w-4 h-4 transition-transform"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>

          {showAdminFeatures && (
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {onEdit && (
                <button
                  onClick={() => onEdit(skill)}
                  className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                  title="Edit skill"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(skill.id)}
                  className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                  title="Delete skill"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
