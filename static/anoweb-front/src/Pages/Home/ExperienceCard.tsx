import { useContext, useState } from "react";
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
  const [bulletDrafts, setBulletDrafts] = useState<Record<number, string>>({});
  const [savingBullets, setSavingBullets] = useState<Record<number, boolean>>({});
  const [bulletErrors, setBulletErrors] = useState<Record<number, string | null>>({});

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

  const getDraft = (exp: Experience) => bulletDrafts[exp.id] ?? (exp.bullet_points ?? []).join("\n");

  const handleSaveBullets = async (exp: Experience) => {
    const bulletPoints = getDraft(exp)
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

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
      setBulletDrafts((prev) => ({ ...prev, [exp.id]: bulletPoints.join("\n") }));
    } catch (err) {
      setBulletErrors((prev) => ({
        ...prev,
        [exp.id]: err instanceof Error ? err.message : "Save failed",
      }));
    } finally {
      setSavingBullets((prev) => ({ ...prev, [exp.id]: false }));
    }
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
            <div className="absolute right-4 top-3 bottom-3 w-px bg-slate-200/80" aria-hidden />
            <div className="grid grid-cols-[1fr_auto] items-start gap-4">
              <div className="flex items-start gap-4">
                <img src={exp.image_url} alt={exp.company} className="w-12 h-12 rounded-xl object-cover shadow-sm border border-slate-200" />
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900 truncate">{exp.company}</p>
                    {isAdmin && <span className="text-[10px] uppercase tracking-[0.12em] text-blue-600 bg-blue-50 border border-blue-100 rounded-full px-2 py-0.5">drag</span>}
                  </div>
                  <p className="text-xs text-slate-600 truncate">{exp.position}</p>
                  <p className="text-xs text-slate-500">{cleanDate(exp.start_date)} – {exp.present ? "Present" : cleanDate(endDisplay)}</p>
                  {exp.description && <p className="text-sm text-slate-700 line-clamp-2">{exp.description}</p>}
                  {Array.isArray(exp.bullet_points) && exp.bullet_points.length > 0 && (
                    <ul className="mt-2 space-y-1 text-sm text-slate-800 list-disc list-inside">
                      {exp.bullet_points.map((point, idx) => (
                        <li key={idx} className="leading-snug">{point}</li>
                      ))}
                    </ul>
                  )}
                  {isAdmin && (
                    <div className="mt-3 space-y-2 rounded-lg border border-slate-200 bg-slate-50/70 p-3">
                      <label className="text-xs font-medium text-slate-700" htmlFor={`bullets-${exp.id}`}>
                        Bullet points (one per line)
                      </label>
                      <textarea
                        id={`bullets-${exp.id}`}
                        className="w-full rounded-md border border-slate-200 p-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                        rows={3}
                        value={getDraft(exp)}
                        onChange={(e) => setBulletDrafts((prev) => ({ ...prev, [exp.id]: e.target.value }))}
                      />
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
              <div className="flex flex-col items-end gap-2 text-right min-w-[120px]">
                <div className="flex items-center gap-2 text-[11px] text-slate-600">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                  <span className="rounded-full bg-slate-50 border border-slate-200 px-2 py-1">#{index + 1}</span>
                </div>
                {exp.present && <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-1 text-[11px]">Current</span>}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
