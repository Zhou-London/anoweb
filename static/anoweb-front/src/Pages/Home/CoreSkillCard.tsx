import { useContext, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { CoreSkill } from "./types";
import { useEditMode } from "../../Contexts/edit_mode_context";
import { FanContext } from "../../Contexts/fan_context";

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
  const { isAdmin } = useContext(FanContext);
  const showAdminFeatures = isAdmin && editMode;
  const bulletPoints = skill.bullet_points || [];

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <motion.div
      className={`group relative rounded-3xl shadow-md transition-all ${
        showAdminFeatures ? "cursor-move" : "cursor-pointer"
      }`}
      style={{
        background: 'var(--gb-bg)',
        boxShadow: isExpanded ? 'var(--gb-shadow-card), inset 0 0 0 2px var(--gb-primary)' : 'var(--gb-shadow-card)',
      }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.995 }}
      draggable={showAdminFeatures}
      onDragStartCapture={onDragStart ? (e) => onDragStart(e, skill) : undefined}
      onDragOver={onDragOver}
      onDrop={onDrop ? (e) => onDrop(e, skill) : undefined}
      onClick={handleToggleExpand}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleToggleExpand();
        }
      }}
      aria-expanded={isExpanded}
      role="button"
      tabIndex={0}
    >
      <div className="p-6 flex items-start justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-xl font-bold" style={{ color: 'var(--gb-fg)' }}>{skill.name}</h3>
            {bulletPoints.length > 0 && (
              <motion.span
                style={{ color: 'var(--gb-fg-muted)' }}
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] as const }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </motion.span>
            )}
          </div>

          <AnimatePresence initial={false}>
            {isExpanded && bulletPoints.length > 0 && (
              <motion.div
                key="bullet-points"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] as const }}
                className="overflow-hidden"
              >
                <ul className="mt-4 list-none space-y-3">
                  {bulletPoints.map((point, index) => (
                    <li key={index} className="flex items-start gap-3" style={{ color: 'var(--gb-fg-soft)' }}>
                      <span className="font-bold mt-1" style={{ color: 'var(--gb-primary)' }}>*</span>
                      <span className="flex-1 text-sm leading-relaxed">{point}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {showAdminFeatures && (
          <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
            {onEdit && (
              <button
                onClick={() => onEdit(skill)}
                className="p-2 rounded-lg transition-colors"
                style={{ background: 'var(--gb-bg-soft)', color: 'var(--gb-primary)' }}
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
                className="p-2 rounded-lg transition-colors"
                style={{ background: 'var(--gb-bg-soft)', color: 'var(--gb-error)' }}
                title="Delete skill"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
