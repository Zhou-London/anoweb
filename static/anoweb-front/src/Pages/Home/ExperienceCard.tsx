import { useContext, useMemo, useState } from "react";
import { UserContext } from "../../Contexts/user_context";
import { useErrorNotifier } from "../../Contexts/error_context";
import { useEditMode } from "../../Contexts/edit_mode_context";
import { apiFetch } from "../../lib/api";
import type { Experience } from "./types";

type ExperienceCardProps = {
  experience: Experience[];
  setExperience: React.Dispatch<React.SetStateAction<Experience[]>>;
};

export default function ExperienceCard({ experience, setExperience }: ExperienceCardProps) {
  const { isAdmin } = useContext(UserContext);
  const { editMode } = useEditMode();
  const showAdminFeatures = isAdmin && editMode;
  const notifyError = useErrorNotifier();

  const ordered = useMemo(() => experience.slice().sort((a, b) => a.order_index - b.order_index), [experience]);
  const [bulletDrafts, setBulletDrafts] = useState<Record<number, string[]>>({});
  const [newBulletText, setNewBulletText] = useState<Record<number, string>>({});
  const [savingBullets, setSavingBullets] = useState<Record<number, boolean>>({});
  const [bulletErrors, setBulletErrors] = useState<Record<number, string | null>>({});
  const [descriptionDrafts, setDescriptionDrafts] = useState<Record<number, string>>({});
  const [savingDescription, setSavingDescription] = useState<Record<number, boolean>>({});
  const [descriptionErrors, setDescriptionErrors] = useState<Record<number, string | null>>({});

  const cleanDate = (value: string) => {
    if (!value) return "";
    const base = value.includes("T") ? value.split("T")[0] : value.split(" ")[0];
    const parsed = new Date(base);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString(undefined, { year: "numeric", month: "short" });
    }
    return base;
  };

  const handleDrop = (fromIndex: number, toIndex: number) => {
    if (!showAdminFeatures || fromIndex === toIndex || Number.isNaN(fromIndex) || Number.isNaN(toIndex)) return;
    const previous = ordered.map((item) => ({ ...item }));
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
    }).catch((err) => {
      notifyError(err instanceof Error ? err.message : "Failed to update order");
      setExperience(previous);
    });
  };

  const getDraftList = (exp: Experience) => bulletDrafts[exp.id] ?? [...(exp.bullet_points ?? [])];

  const updateDraftList = (exp: Experience, nextList: string[]) => {
    setBulletDrafts((prev) => ({ ...prev, [exp.id]: nextList }));
  };

  const handleBulletChange = (exp: Experience, index: number, value: string) => {
    const list = getDraftList(exp).slice();
    list[index] = value;
    updateDraftList(exp, list);
  };

  const handleAddBullet = (exp: Experience) => {
    const text = (newBulletText[exp.id] || "").trim();
    if (!text) {
      notifyError("Bullet text cannot be empty.");
      return;
    }
    updateDraftList(exp, [...getDraftList(exp), text]);
    setNewBulletText((prev) => ({ ...prev, [exp.id]: "" }));
  };

  const handleRemoveBullet = (exp: Experience, index: number) => {
    const list = getDraftList(exp).filter((_, idx) => idx !== index);
    updateDraftList(exp, list);
  };

  const getDescriptionDraft = (exp: Experience) => descriptionDrafts[exp.id] ?? (exp.description ?? "");

  const handleDescriptionChange = (exp: Experience, value: string) => {
    setDescriptionDrafts((prev) => ({ ...prev, [exp.id]: value }));
  };

  const handleSaveDescription = async (exp: Experience) => {
    const description = getDescriptionDraft(exp).trim();
    setSavingDescription((prev) => ({ ...prev, [exp.id]: true }));
    setDescriptionErrors((prev) => ({ ...prev, [exp.id]: null }));
    try {
      await apiFetch("/experience", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: exp.id, description }),
      });
      setExperience((prev) => prev.map((item) => (item.id === exp.id ? { ...item, description } : item)));
      setDescriptionDrafts((prev) => ({ ...prev, [exp.id]: description }));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Save failed";
      setDescriptionErrors((prev) => ({ ...prev, [exp.id]: message }));
      notifyError(message);
    } finally {
      setSavingDescription((prev) => ({ ...prev, [exp.id]: false }));
    }
  };

  const handleSaveBullets = async (exp: Experience) => {
    const bulletPoints = getDraftList(exp).map((line) => line.trim()).filter(Boolean);

    setSavingBullets((prev) => ({ ...prev, [exp.id]: true }));
    setBulletErrors((prev) => ({ ...prev, [exp.id]: null }));
    try {
      await apiFetch("/experience", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: exp.id, bullet_points: bulletPoints }),
      });
      setExperience((prev) => prev.map((item) => (item.id === exp.id ? { ...item, bullet_points: bulletPoints } : item)));
      updateDraftList(exp, bulletPoints);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Save failed";
      setBulletErrors((prev) => ({
        ...prev,
        [exp.id]: message,
      }));
      notifyError(message);
    } finally {
      setSavingBullets((prev) => ({ ...prev, [exp.id]: false }));
    }
  };

  if (!Array.isArray(experience) || experience.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-6 text-sm text-slate-600">
        No career entries yet.
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {ordered.map((exp, index) => {
        const endDisplay = exp.present ? "Present" : exp.end_date;
        const range = `${cleanDate(exp.start_date)} – ${exp.present ? "Present" : cleanDate(endDisplay)}`;
        const draftBullets = getDraftList(exp);
        return (
          <li
            key={exp.id}
            draggable={showAdminFeatures}
            onDragStart={(e) => showAdminFeatures && e.dataTransfer.setData("text/plain", String(index))}
            onDragOver={(e) => showAdminFeatures && e.preventDefault()}
            onDrop={(e) => {
              if (!showAdminFeatures) return;
              const fromIndex = Number(e.dataTransfer.getData("text/plain"));
              handleDrop(fromIndex, index);
            }}
            className={`group relative overflow-hidden rounded-2xl border border-slate-200 bg-white/95 p-4 transition-all duration-200 shadow-sm hover:shadow-md ${
              showAdminFeatures ? "cursor-grab" : "cursor-default"
            }`}
          >
            <div className="hidden sm:absolute sm:left-4 sm:top-4 sm:bottom-4 sm:w-px sm:bg-slate-200/80" aria-hidden />
            <div className="flex flex-col gap-4 sm:grid sm:grid-cols-[auto_1fr_auto] sm:items-start sm:gap-4">
              <div className="flex items-center gap-3 text-[11px] text-slate-600 sm:flex-col sm:items-center sm:gap-2">
                <span className="h-8 w-8 rounded-full bg-blue-50 text-blue-700 border border-blue-100 grid place-items-center font-semibold shadow-sm">
                  {index + 1}
                </span>
                {exp.present && <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-1">Current</span>}
              </div>
              <div className="flex items-start gap-4 sm:col-auto">
                <img
                  src={exp.image_url}
                  alt={exp.company}
                  className="w-14 h-14 rounded-xl object-cover shadow-sm border border-slate-200"
                />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-base font-semibold text-slate-900 truncate">{exp.company}</p>
                    {showAdminFeatures && <span className="text-xs font-medium text-blue-600 bg-blue-50 border border-blue-100 rounded-full px-2 py-0.5">Drag</span>}
                  </div>
                  <p className="text-xs text-slate-600 truncate">{exp.position}</p>
                  {!showAdminFeatures && exp.description && <p className="text-sm text-slate-700 leading-snug">{exp.description}</p>}
                  {showAdminFeatures && (
                    <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50/70 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <label className="text-xs font-medium text-slate-700" htmlFor={`description-${exp.id}`}>
                          Description
                        </label>
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 border border-amber-100">
                          Admin edit
                        </span>
                      </div>
                      <textarea
                        id={`description-${exp.id}`}
                        className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                        rows={3}
                        value={getDescriptionDraft(exp)}
                        onChange={(e) => handleDescriptionChange(exp, e.target.value)}
                        placeholder="Add a short description"
                      />
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleSaveDescription(exp)}
                          disabled={savingDescription[exp.id]}
                          className="rounded-full bg-blue-600 text-white px-3 py-1.5 text-xs font-semibold shadow-sm hover:bg-blue-700 disabled:bg-blue-300"
                        >
                          {savingDescription[exp.id] ? "Saving…" : "Save description"}
                        </button>
                        {descriptionErrors[exp.id] && <span className="text-xs text-rose-600">{descriptionErrors[exp.id]}</span>}
                      </div>
                    </div>
                  )}
                  {Array.isArray(exp.bullet_points) && exp.bullet_points.length > 0 && (
                    <ul className="mt-2 space-y-1 text-sm text-slate-800 list-disc list-inside">
                      {exp.bullet_points.map((point, idx) => (
                        <li key={idx} className="leading-snug">{point}</li>
                      ))}
                    </ul>
                  )}
                  {showAdminFeatures && (
                    <div className="mt-3 space-y-3 rounded-lg border border-slate-200 bg-slate-50/70 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <label className="text-xs font-medium text-slate-700" htmlFor={`bullets-${exp.id}`}>
                          Bullet points
                        </label>
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700 border border-blue-100">
                          Editable
                        </span>
                      </div>
                      <div className="space-y-2">
                        {draftBullets.length === 0 && <p className="text-xs text-slate-500">No bullet points yet.</p>}
                        {draftBullets.map((point, idx) => (
                          <div key={`${exp.id}-bullet-${idx}`} className="flex items-center gap-2">
                            <input
                              id={`bullets-${exp.id}-${idx}`}
                              className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm focus:border-blue-500 focus:ring-blue-500"
                              value={point}
                              onChange={(e) => handleBulletChange(exp, idx, e.target.value)}
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveBullet(exp, idx)}
                              className="rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                            >
                              Delete
                            </button>
                          </div>
                        ))}
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <input
                            className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm focus:border-blue-500 focus:ring-blue-500"
                            value={newBulletText[exp.id] ?? ""}
                            placeholder="Add bullet point"
                            onChange={(e) => setNewBulletText((prev) => ({ ...prev, [exp.id]: e.target.value }))}
                          />
                          <button
                            type="button"
                            onClick={() => handleAddBullet(exp)}
                            className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleSaveBullets(exp)}
                          disabled={savingBullets[exp.id]}
                          className="rounded-full bg-blue-600 text-white px-3 py-1.5 text-xs font-semibold shadow-sm hover:bg-blue-700 disabled:bg-blue-300"
                        >
                          {savingBullets[exp.id] ? "Saving…" : "Save bullets"}
                        </button>
                        {bulletErrors[exp.id] && <span className="text-xs text-rose-600">{bulletErrors[exp.id]}</span>}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-start gap-2 text-left sm:items-end sm:text-right sm:min-w-[140px]">
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                  <span className="rounded-full bg-slate-50 border border-slate-200 px-2 py-1">{range}</span>
                </div>
                {exp.present && <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-1 text-[11px]">Active</span>}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
