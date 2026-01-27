import { useContext, useMemo, useState } from "react";
import { FanContext } from "../../Contexts/fan_context";
import { useErrorNotifier } from "../../Contexts/error_context";
import { useEditMode } from "../../Contexts/edit_mode_context";
import { apiFetch } from "../../lib/api";
import type { Experience } from "./types";

type ExperienceCardProps = {
  experience: Experience[];
  setExperience: React.Dispatch<React.SetStateAction<Experience[]>>;
};

export default function ExperienceCard({ experience, setExperience }: ExperienceCardProps) {
  const { isAdmin } = useContext(FanContext);
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
  const [uploadingImage, setUploadingImage] = useState<Record<number, boolean>>({});
  const [imageErrors, setImageErrors] = useState<Record<number, string | null>>({});

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

  const handleImageUpload = async (exp: Experience, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage((prev) => ({ ...prev, [exp.id]: true }));
    setImageErrors((prev) => ({ ...prev, [exp.id]: null }));

    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await apiFetch("/experience/upload-experience-img", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!uploadRes.ok) throw new Error("Image upload failed");
      const { img_path } = await uploadRes.json();

      await apiFetch("/experience", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: exp.id, image_url: img_path }),
      });

      setExperience((prev) => prev.map((item) => (item.id === exp.id ? { ...item, image_url: img_path } : item)));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setImageErrors((prev) => ({ ...prev, [exp.id]: message }));
      notifyError(message);
    } finally {
      setUploadingImage((prev) => ({ ...prev, [exp.id]: false }));
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
      <div className="rounded-2xl p-6 text-sm" style={{ border: '1px dashed var(--gb-border)', background: 'var(--gb-bg-soft)', color: 'var(--gb-fg-soft)' }}>
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
            className={`group relative overflow-hidden rounded-2xl p-4 transition-all duration-200 shadow-sm hover:shadow-md ${
              showAdminFeatures ? "cursor-grab" : "cursor-default"
            }`}
            style={{ background: 'var(--gb-bg)', border: '1px solid var(--gb-border)' }}
          >
            <div className="hidden sm:absolute sm:left-4 sm:top-4 sm:bottom-4 sm:w-px" style={{ background: 'var(--gb-border)' }} aria-hidden />
            <div className="flex flex-col gap-4 sm:grid sm:grid-cols-[auto_1fr_auto] sm:items-start sm:gap-4">
              <div className="flex items-center gap-3 text-sm sm:flex-col sm:items-center sm:gap-2" style={{ color: 'var(--gb-fg-soft)' }}>
                <span className="h-8 w-8 rounded-full grid place-items-center font-semibold shadow-sm" style={{ background: 'var(--gb-bg-soft)', color: 'var(--gb-primary)', border: '1px solid var(--gb-primary)' }}>
                  {index + 1}
                </span>
                {exp.present && <span className="rounded-full px-2 py-1" style={{ background: 'var(--gb-success)', color: 'var(--gb-bg)' }}>Current</span>}
              </div>
              <div className="flex items-start gap-4 sm:col-auto">
                <div className="relative group/img">
                  <img
                    src={exp.image_url}
                    alt={exp.company}
                    className="w-14 h-14 rounded-xl object-cover shadow-sm"
                    style={{ border: '1px solid var(--gb-border)' }}
                  />
                  {showAdminFeatures && (
                    <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl opacity-0 group-hover/img:opacity-100 transition-opacity cursor-pointer">
                      <span className="text-white text-xs font-medium">{uploadingImage[exp.id] ? "..." : "Edit"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingImage[exp.id]}
                        onChange={(e) => handleImageUpload(exp, e)}
                      />
                    </label>
                  )}
                  {imageErrors[exp.id] && (
                    <span className="absolute -bottom-5 left-0 text-xs whitespace-nowrap" style={{ color: 'var(--gb-error)' }}>{imageErrors[exp.id]}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-base font-semibold truncate" style={{ color: 'var(--gb-fg)' }}>{exp.company}</p>
                    {showAdminFeatures && <span className="text-xs font-medium rounded-full px-2 py-0.5" style={{ background: 'var(--gb-primary)', color: 'var(--gb-bg)' }}>Drag</span>}
                  </div>
                  <p className="text-xs truncate" style={{ color: 'var(--gb-fg-soft)' }}>{exp.position}</p>
                  {!showAdminFeatures && exp.description && <p className="text-sm leading-snug" style={{ color: 'var(--gb-fg-soft)' }}>{exp.description}</p>}
                  {showAdminFeatures && (
                    <div className="space-y-2 rounded-lg p-3" style={{ background: 'var(--gb-bg-soft)', border: '1px solid var(--gb-border)' }}>
                      <div className="flex items-center justify-between gap-2">
                        <label className="text-xs font-medium" style={{ color: 'var(--gb-fg-soft)' }} htmlFor={`description-${exp.id}`}>
                          Description
                        </label>
                        <span className="rounded-full px-2 py-0.5 text-xs font-semibold" style={{ background: 'var(--gb-warning)', color: 'var(--gb-bg)' }}>
                          Admin edit
                        </span>
                      </div>
                      <textarea
                        id={`description-${exp.id}`}
                        className="w-full rounded-md px-3 py-2 text-sm focus:outline-none"
                        style={{ background: 'var(--gb-bg)', border: '1px solid var(--gb-border)', color: 'var(--gb-fg)' }}
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
                          className="rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm disabled:opacity-50"
                          style={{ background: 'var(--gb-primary)', color: 'var(--gb-bg)' }}
                        >
                          {savingDescription[exp.id] ? "Saving…" : "Save description"}
                        </button>
                        {descriptionErrors[exp.id] && <span className="text-xs" style={{ color: 'var(--gb-error)' }}>{descriptionErrors[exp.id]}</span>}
                      </div>
                    </div>
                  )}
                  {Array.isArray(exp.bullet_points) && exp.bullet_points.length > 0 && (
                    <ul className="mt-2 space-y-1 text-sm list-disc list-inside" style={{ color: 'var(--gb-fg)' }}>
                      {exp.bullet_points.map((point, idx) => (
                        <li key={idx} className="leading-snug">{point}</li>
                      ))}
                    </ul>
                  )}
                  {showAdminFeatures && (
                    <div className="mt-3 space-y-3 rounded-lg p-3" style={{ background: 'var(--gb-bg-soft)', border: '1px solid var(--gb-border)' }}>
                      <div className="flex items-center justify-between gap-2">
                        <label className="text-xs font-medium" style={{ color: 'var(--gb-fg-soft)' }} htmlFor={`bullets-${exp.id}`}>
                          Bullet points
                        </label>
                        <span className="rounded-full px-2 py-0.5 text-xs font-semibold" style={{ background: 'var(--gb-primary)', color: 'var(--gb-bg)' }}>
                          Editable
                        </span>
                      </div>
                      <div className="space-y-2">
                        {draftBullets.length === 0 && <p className="text-xs" style={{ color: 'var(--gb-fg-muted)' }}>No bullet points yet.</p>}
                        {draftBullets.map((point, idx) => (
                          <div key={`${exp.id}-bullet-${idx}`} className="flex items-center gap-2">
                            <input
                              id={`bullets-${exp.id}-${idx}`}
                              className="w-full rounded-md px-2 py-1.5 text-sm focus:outline-none"
                              style={{ background: 'var(--gb-bg)', border: '1px solid var(--gb-border)', color: 'var(--gb-fg)' }}
                              value={point}
                              onChange={(e) => handleBulletChange(exp, idx, e.target.value)}
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveBullet(exp, idx)}
                              className="rounded-md px-2 py-1 text-xs font-semibold"
                              style={{ background: 'var(--gb-bg-soft)', border: '1px solid var(--gb-error)', color: 'var(--gb-error)' }}
                            >
                              Delete
                            </button>
                          </div>
                        ))}
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <input
                            className="w-full rounded-md px-2 py-1.5 text-sm focus:outline-none"
                            style={{ background: 'var(--gb-bg)', border: '1px solid var(--gb-border)', color: 'var(--gb-fg)' }}
                            value={newBulletText[exp.id] ?? ""}
                            placeholder="Add bullet point"
                            onChange={(e) => setNewBulletText((prev) => ({ ...prev, [exp.id]: e.target.value }))}
                          />
                          <button
                            type="button"
                            onClick={() => handleAddBullet(exp)}
                            className="rounded-md px-3 py-1.5 text-xs font-semibold shadow-sm"
                            style={{ background: 'var(--gb-success)', color: 'var(--gb-bg)' }}
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
                          className="rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm disabled:opacity-50"
                          style={{ background: 'var(--gb-primary)', color: 'var(--gb-bg)' }}
                        >
                          {savingBullets[exp.id] ? "Saving…" : "Save bullets"}
                        </button>
                        {bulletErrors[exp.id] && <span className="text-xs" style={{ color: 'var(--gb-error)' }}>{bulletErrors[exp.id]}</span>}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-start gap-2 text-left sm:items-end sm:text-right sm:min-w-[140px]">
                <div className="flex flex-wrap items-center gap-2 text-sm" style={{ color: 'var(--gb-fg-soft)' }}>
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: 'var(--gb-primary)' }} />
                  <span className="rounded-full px-2 py-1" style={{ background: 'var(--gb-bg-soft)', border: '1px solid var(--gb-border)' }}>{range}</span>
                </div>
                {exp.present && <span className="rounded-full px-2 py-1 text-xs" style={{ background: 'var(--gb-success)', color: 'var(--gb-bg)' }}>Active</span>}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
