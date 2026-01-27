import { useContext } from "react";
import { FanContext } from "../Contexts/fan_context";
import { useEditMode } from "../Contexts/edit_mode_context";

export default function EditModeToggle() {
  const { isAdmin } = useContext(FanContext);
  const { editMode, toggleEditMode } = useEditMode();

  if (!isAdmin) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={toggleEditMode}
        className="flex items-center gap-3 px-6 py-3 rounded-full shadow-2xl font-semibold transition-all hover:scale-105"
        style={{
          background: editMode ? 'var(--gb-success)' : 'var(--gb-bg)',
          color: editMode ? 'var(--gb-bg)' : 'var(--gb-fg-soft)',
          border: editMode ? 'none' : '2px solid var(--gb-border)',
        }}
        aria-label={editMode ? "Disable edit mode" : "Enable edit mode"}
      >
        <div className="relative">
          <div
            className="w-12 h-6 rounded-full transition-colors"
            style={{ background: editMode ? 'var(--gb-success-bright)' : 'var(--gb-bg-muted)' }}
          >
            <div
              className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full shadow-md transition-transform"
              style={{
                background: 'var(--gb-bg)',
                transform: editMode ? 'translateX(1.5rem)' : 'translateX(0)',
              }}
            />
          </div>
        </div>
        <span>{editMode ? "Edit Mode ON" : "Edit Mode OFF"}</span>
        {editMode && (
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs"
            style={{ background: 'rgba(251, 241, 199, 0.2)' }}
          >
            <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: 'var(--gb-bg)' }} /> Active
          </span>
        )}
      </button>
    </div>
  );
}
