import { useContext } from "react";
import { UserContext } from "../Contexts/user_context";
import { useEditMode } from "../Contexts/edit_mode_context";

export default function EditModeToggle() {
  const { isAdmin } = useContext(UserContext);
  const { editMode, toggleEditMode } = useEditMode();

  if (!isAdmin) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={toggleEditMode}
        className={`flex items-center gap-3 px-6 py-3 rounded-full shadow-2xl font-semibold transition-all hover:scale-105 ${
          editMode
            ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
            : "bg-white text-slate-700 border-2 border-slate-300"
        }`}
        aria-label={editMode ? "Disable edit mode" : "Enable edit mode"}
      >
        <div className="relative">
          <div
            className={`w-12 h-6 rounded-full transition-colors ${
              editMode ? "bg-emerald-400" : "bg-slate-300"
            }`}
          >
            <div
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                editMode ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </div>
        </div>
        <span>{editMode ? "Edit Mode ON" : "Edit Mode OFF"}</span>
        {editMode && (
          <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" /> Active
          </span>
        )}
      </button>
    </div>
  );
}
