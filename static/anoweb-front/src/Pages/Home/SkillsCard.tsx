import { useContext, useMemo, useState } from "react";
import { UserContext } from "../../Contexts/user_context";
import { useErrorNotifier } from "../../Contexts/error_context";
import { useSuccessNotifier } from "../../Contexts/success_context";
import { useEditMode } from "../../Contexts/edit_mode_context";
import { apiFetch } from "../../lib/api";
import type { Skill } from "./types";

type SkillsCardProps = {
  skills: Skill[];
  setSkills: React.Dispatch<React.SetStateAction<Skill[]>>;
};

export default function SkillsCard({ skills, setSkills }: SkillsCardProps) {
  const { isAdmin } = useContext(UserContext);
  const { editMode } = useEditMode();
  const showAdminFeatures = isAdmin && editMode;
  const notifyError = useErrorNotifier();
  const notifySuccess = useSuccessNotifier();

  const ordered = useMemo(() => skills.slice().sort((a, b) => a.order_index - b.order_index), [skills]);

  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillCategory, setNewSkillCategory] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("");

  const groupedSkills = useMemo(() => {
    const groups: Record<string, Skill[]> = {};
    ordered.forEach((skill) => {
      const category = skill.category || "Other";
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(skill);
    });
    return groups;
  }, [ordered]);

  const handleAddSkill = async () => {
    const name = newSkillName.trim();
    const category = newSkillCategory.trim();

    if (!name) {
      notifyError("Skill name cannot be empty.");
      return;
    }
    if (!category) {
      notifyError("Category cannot be empty.");
      return;
    }

    setAdding(true);
    try {
      const newSkill = await apiFetch("/skill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name,
          category,
          order_index: skills.length,
        }),
      }).then((res) => res.json());

      setSkills((prev) => [...prev, newSkill]);
      setNewSkillName("");
      setNewSkillCategory("");
      notifySuccess("Skill added successfully!");
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "Failed to add skill");
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteSkill = async (skillId: number) => {
    try {
      await apiFetch(`/skill/${skillId}`, {
        method: "DELETE",
        credentials: "include",
      });
      setSkills((prev) => prev.filter((s) => s.id !== skillId));
      notifySuccess("Skill deleted successfully!");
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "Failed to delete skill");
    }
  };

  const handleStartEdit = (skill: Skill) => {
    setEditingId(skill.id);
    setEditName(skill.name);
    setEditCategory(skill.category);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditCategory("");
  };

  const handleSaveEdit = async (skillId: number) => {
    const name = editName.trim();
    const category = editCategory.trim();

    if (!name) {
      notifyError("Skill name cannot be empty.");
      return;
    }
    if (!category) {
      notifyError("Category cannot be empty.");
      return;
    }

    try {
      const updated = await apiFetch("/skill", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: skillId, name, category }),
      }).then((res) => res.json());

      setSkills((prev) => prev.map((s) => (s.id === skillId ? updated : s)));
      setEditingId(null);
      setEditName("");
      setEditCategory("");
      notifySuccess("Skill updated successfully!");
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "Failed to update skill");
    }
  };

  const handleDrop = (fromIndex: number, toIndex: number) => {
    if (!showAdminFeatures || fromIndex === toIndex || Number.isNaN(fromIndex) || Number.isNaN(toIndex)) return;
    const previous = ordered.map((item) => ({ ...item }));
    const current = ordered.slice();
    const [moved] = current.splice(fromIndex, 1);
    current.splice(toIndex, 0, moved);
    const reindexed = current.map((item, idx) => ({ ...item, order_index: idx }));
    setSkills(reindexed);
    apiFetch("/skill/order", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reindexed.map((it, idx) => ({ id: it.id, order_index: idx }))),
      credentials: "include",
    }).catch((err) => {
      notifyError(err instanceof Error ? err.message : "Failed to update order");
      setSkills(previous);
    });
  };

  return (
    <article className="bg-white/90 rounded-3xl shadow-lg border border-slate-200 p-6 md:p-8 h-full flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Skills</p>
          <h2 className="text-xl font-semibold text-slate-900">Core Skills</h2>
        </div>
        <span className="rounded-full bg-blue-50 text-blue-700 px-3 py-1 text-xs font-semibold border border-blue-100">
          {skills.length} {skills.length === 1 ? "skill" : "skills"}
        </span>
      </div>

      {skills.length === 0 && !showAdminFeatures ? (
        <div className="flex-1 rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 text-slate-600 grid place-items-center text-sm px-4 py-10">
          No skills added yet.
        </div>
      ) : (
        <div className="flex-1 space-y-4 overflow-auto scrollbar-clear">
          {Object.entries(groupedSkills).map(([category, categorySkills]) => (
            <div key={category} className="space-y-2">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">{category}</h3>
              <div className="flex flex-wrap gap-2">
                {categorySkills.map((skill) => (
                  <div
                    key={skill.id}
                    draggable={showAdminFeatures && editingId !== skill.id}
                    onDragStart={(e) => {
                      if (showAdminFeatures && editingId !== skill.id) {
                        e.dataTransfer.setData("text/plain", String(ordered.indexOf(skill)));
                      }
                    }}
                    onDragOver={(e) => showAdminFeatures && editingId !== skill.id && e.preventDefault()}
                    onDrop={(e) => {
                      if (!showAdminFeatures || editingId === skill.id) return;
                      const fromIndex = Number(e.dataTransfer.getData("text/plain"));
                      const toIndex = ordered.indexOf(skill);
                      handleDrop(fromIndex, toIndex);
                    }}
                    className={`group relative ${
                      showAdminFeatures && editingId !== skill.id ? "cursor-grab" : "cursor-default"
                    }`}
                  >
                    {editingId === skill.id ? (
                      <div className="flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5">
                        <input
                          className="w-24 rounded-md border border-slate-200 px-2 py-0.5 text-xs"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Name"
                        />
                        <input
                          className="w-20 rounded-md border border-slate-200 px-2 py-0.5 text-xs"
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value)}
                          placeholder="Category"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(skill.id)}
                          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="text-xs font-semibold text-slate-600 hover:text-slate-700"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 transition hover:bg-blue-100">
                        {skill.name}
                        {showAdminFeatures && (
                          <span className="ml-2 space-x-1">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(skill)}
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteSkill(skill.id)}
                              className="text-xs text-rose-600 hover:text-rose-800"
                            >
                              Delete
                            </button>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {showAdminFeatures && (
            <div className="mt-4 space-y-3 rounded-lg border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-medium text-slate-700">Add New Skill</label>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-100">
                  Admin
                </span>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  className="flex-1 rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                  value={newSkillName}
                  placeholder="Skill name (e.g., React)"
                  onChange={(e) => setNewSkillName(e.target.value)}
                />
                <input
                  className="w-full sm:w-40 rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                  value={newSkillCategory}
                  placeholder="Category (e.g., Frontend)"
                  onChange={(e) => setNewSkillCategory(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  disabled={adding}
                  className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:bg-emerald-300"
                >
                  {adding ? "Adding…" : "Add"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
