import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FanContext } from "../../Contexts/fan_context";
import { useEditMode } from "../../Contexts/edit_mode_context";
import { useErrorNotifier } from "../../Contexts/error_context";
import { useSuccessNotifier } from "../../Contexts/success_context";
import { apiFetch, apiJson } from "../../lib/api";
import { chapters } from "./chapters/quant-research";
import AsyncImage from "../../Components/async_image";
import EditVBookModal from "./EditVBookModal";
import ProgressRing from "./ProgressRing";
import type { VBookWithProgress } from "./types";

function formatRelative(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86_400_000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function VBookDetail() {
  const { vbookId } = useParams<{ vbookId: string }>();
  const { isAdmin, isAuthenticated } = useContext(FanContext);
  const { editMode } = useEditMode();
  const showAdminFeatures = isAdmin && editMode;
  const notifyError = useErrorNotifier();
  const notifySuccess = useSuccessNotifier();

  const [vbook, setVBook] = useState<VBookWithProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [resettingTarget, setResettingTarget] = useState<string | null>(null);

  const fetchVBook = () => {
    if (!vbookId) return;
    setIsLoading(true);
    apiJson<VBookWithProgress>(`/vbook/${vbookId}`, { credentials: "include" })
      .then((data) => setVBook(data))
      .catch((err) => notifyError(err, "Failed to load vBook"))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchVBook();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vbookId]);

  const progressByChapter = useMemo(() => {
    const map: Record<string, number> = {};
    if (!vbook) return map;
    for (const cp of vbook.progress || []) {
      map[cp.chapter_id] = cp.completed_count;
    }
    return map;
  }, [vbook]);

  const completionDateByChapter = useMemo(() => {
    const map: Record<string, string> = {};
    if (!vbook) return map;
    for (const cp of vbook.progress || []) {
      if (cp.last_completed_at) {
        map[cp.chapter_id] = cp.last_completed_at;
      }
    }
    return map;
  }, [vbook]);

  const overallProgress = useMemo(() => {
    const totalSections = chapters.reduce((acc, c) => acc + c.sections.length, 0);
    const done = chapters.reduce(
      (acc, c) => acc + Math.min(progressByChapter[c.id] ?? 0, c.sections.length),
      0
    );
    if (totalSections === 0) return 0;
    return Math.round((done / totalSections) * 100);
  }, [progressByChapter]);

  const totalDone = useMemo(() => {
    return chapters.reduce(
      (acc, c) => acc + Math.min(progressByChapter[c.id] ?? 0, c.sections.length),
      0
    );
  }, [progressByChapter]);

  const totalSections = useMemo(() => {
    return chapters.reduce((acc, c) => acc + c.sections.length, 0);
  }, []);

  // Build "Continue reading" link from last_read
  const continueLink = useMemo(() => {
    if (!vbook?.last_read) return null;
    const lr = vbook.last_read;
    // Find the chapter to make sure it's valid
    const ch = chapters.find((c) => c.id === lr.chapter_id);
    if (!ch) return null;
    const sectionExists = ch.sections.some((s) => s.id === lr.section_id);
    const sParam = sectionExists ? `?s=${lr.section_id}` : "";
    return `/vbooks/${vbookId}/${lr.chapter_id}${sParam}`;
  }, [vbook, vbookId]);

  const handleReset = async (chapterId?: string, e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!vbookId) return;
    const isChapter = !!chapterId;
    if (!confirm(isChapter ? "Reset progress for this chapter?" : "Reset your progress on this vBook?")) return;
    setResettingTarget(chapterId ?? "all");
    try {
      await apiFetch(
        isChapter ? `/vbook/${vbookId}/progress/${chapterId}` : `/vbook/${vbookId}/progress`,
        { method: "DELETE", credentials: "include" },
      );
      notifySuccess(isChapter ? "Chapter progress reset" : "Progress reset");
      fetchVBook();
    } catch (err) {
      notifyError(err, isChapter ? "Failed to reset chapter progress" : "Failed to reset progress");
    } finally {
      setResettingTarget(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div
          className="h-10 w-48 rounded-xl animate-pulse"
          style={{ background: "var(--gb-bg-soft)", boxShadow: "var(--gb-shadow-card)" }}
        />
        <div
          className="h-96 rounded-3xl animate-pulse"
          style={{ background: "var(--gb-bg-soft)", boxShadow: "var(--gb-shadow-card)" }}
        />
      </div>
    );
  }

  if (!vbook) {
    return (
      <div
        className="rounded-3xl p-6 space-y-3"
        style={{
          background: "var(--gb-bg)",
          boxShadow: "var(--gb-shadow-card)",
          color: "var(--gb-fg-soft)",
        }}
      >
        <p className="font-semibold">vBook not found.</p>
        <Link
          to="/vbooks"
          className="underline text-sm"
          style={{ color: "var(--gb-accent)" }}
        >
          Back to vBooks
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/vbooks"
          className="group inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
          style={{ background: "var(--gb-accent)", color: "var(--gb-bg)" }}
        >
          <svg
            className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to vBooks
        </Link>
        {showAdminFeatures && (
          <button
            type="button"
            onClick={() => setIsEditOpen(true)}
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-sm transition-colors"
            style={{ background: "var(--gb-fg)", color: "var(--gb-bg)" }}
          >
            ✎ Edit vBook
          </button>
        )}
      </header>

      <section
        className="rounded-3xl overflow-hidden"
        style={{ background: "var(--gb-bg)", boxShadow: "var(--gb-shadow-card)" }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
          <div
            className="relative aspect-video md:aspect-auto md:min-h-[280px]"
            style={{ background: "var(--gb-bg-muted)" }}
          >
            {vbook.cover_image_url ? (
              <AsyncImage
                src={vbook.cover_image_url}
                alt={vbook.title}
                className="absolute inset-0 w-full h-full"
              />
            ) : (
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ background: "var(--gb-accent)" }}
              >
                <span className="text-7xl" style={{ color: "var(--gb-bg)" }}>
                  📘
                </span>
              </div>
            )}
          </div>
          <div className="md:col-span-2 p-6 md:p-8 space-y-4">
            <div>
              <div
                className="text-xs font-semibold tracking-wider uppercase mb-2"
                style={{ color: "var(--gb-accent)" }}
              >
                vBook
              </div>
              <h1
                className="text-2xl md:text-3xl font-bold leading-tight"
                style={{ color: "var(--gb-fg)" }}
              >
                {vbook.title}
              </h1>
            </div>
            <p
              className="text-sm md:text-base leading-relaxed"
              style={{ color: "var(--gb-fg-soft)" }}
            >
              {vbook.description || "No description yet."}
            </p>

            <div
              className="rounded-2xl p-5 flex items-center gap-5"
              style={{
                background: "var(--gb-bg-soft)",
                boxShadow: "var(--gb-shadow-inset)",
              }}
            >
              <ProgressRing size={96} strokeWidth={7} progress={overallProgress}>
                <span
                  className="text-lg font-bold"
                  style={{ color: "var(--gb-fg)" }}
                >
                  {overallProgress}%
                </span>
              </ProgressRing>
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-2">
                  <span
                    className="text-sm font-semibold"
                    style={{ color: "var(--gb-fg)" }}
                  >
                    {totalDone} / {totalSections} sections
                  </span>
                  {isAuthenticated && overallProgress > 0 && (
                    <button
                      type="button"
                      onClick={() => handleReset()}
                      disabled={resettingTarget === "all"}
                      className="w-5 h-5 rounded-full flex items-center justify-center opacity-30 hover:opacity-100 transition-opacity disabled:opacity-20"
                      style={{ color: "var(--gb-fg-muted)" }}
                      title="Reset all progress"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  )}
                </div>
                <div
                  className="text-xs"
                  style={{ color: "var(--gb-fg-muted)" }}
                >
                  {isAuthenticated ? "Your progress" : "Sign in to save progress"}
                </div>
                {continueLink && (
                  <Link
                    to={continueLink}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all hover:shadow-md hover:scale-105 active:scale-95"
                    style={{ background: "var(--gb-accent)", color: "var(--gb-bg)" }}
                  >
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.84A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.27l9.344-5.891a1.5 1.5 0 000-2.538L6.3 2.841z" />
                    </svg>
                    Continue reading
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className="rounded-3xl p-6 md:p-8 space-y-4"
        style={{ background: "var(--gb-bg)", boxShadow: "var(--gb-shadow-card)" }}
      >
        <h2 className="text-lg md:text-xl font-semibold" style={{ color: "var(--gb-fg)" }}>
          Chapters
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {chapters.map((chapter) => {
            const done = Math.min(
              progressByChapter[chapter.id] ?? 0,
              chapter.sections.length
            );
            const pct = Math.round((done / chapter.sections.length) * 100);
            const isComplete = done >= chapter.sections.length;
            const completionDate = completionDateByChapter[chapter.id];
            const ringColor = isComplete ? "var(--gb-success)" : "var(--gb-accent)";
            return (
              <Link
                key={chapter.id}
                to={`/vbooks/${vbookId}/${chapter.id}`}
                className="group block rounded-2xl p-5 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                style={{
                  background: "var(--gb-bg-soft)",
                  boxShadow: "var(--gb-shadow-card)",
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-xs font-semibold uppercase tracking-wider mb-1"
                      style={{ color: "var(--gb-accent)" }}
                    >
                      {chapter.label}
                    </div>
                    <h3
                      className="text-lg font-semibold leading-snug mb-2"
                      style={{ color: "var(--gb-fg)" }}
                    >
                      {chapter.title}
                    </h3>
                    <div
                      className="text-xs flex items-center gap-2"
                      style={{ color: "var(--gb-fg-muted)" }}
                    >
                      <span>{done} / {chapter.sections.length} sections</span>
                      {isComplete && completionDate && (
                        <>
                          <span>·</span>
                          <span style={{ color: "var(--gb-success)" }}>
                            {formatRelative(completionDate)}
                          </span>
                        </>
                      )}
                      {isAuthenticated && done > 0 && (
                        <button
                          type="button"
                          onClick={(e) => handleReset(chapter.id, e)}
                          disabled={resettingTarget === chapter.id}
                          className="w-4 h-4 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-40 hover:!opacity-100 transition-opacity disabled:!opacity-20"
                          style={{ color: "var(--gb-fg-muted)" }}
                          title="Reset chapter progress"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                  <ProgressRing size={48} strokeWidth={4} progress={pct} color={ringColor}>
                    {isComplete ? (
                      <svg className="w-4 h-4" fill={ringColor} viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <span
                        className="text-xs font-bold"
                        style={{ color: "var(--gb-fg)" }}
                      >
                        {pct}%
                      </span>
                    )}
                  </ProgressRing>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {isEditOpen && (
        <EditVBookModal
          vbook={vbook}
          onClose={() => setIsEditOpen(false)}
          onSuccess={() => {
            setIsEditOpen(false);
            fetchVBook();
          }}
        />
      )}
    </div>
  );
}
