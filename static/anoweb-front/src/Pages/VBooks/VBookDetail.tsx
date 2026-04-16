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
import type { VBookWithProgress } from "./types";

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
  const [isResetting, setIsResetting] = useState(false);

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

  const overallProgress = useMemo(() => {
    const totalSections = chapters.reduce((acc, c) => acc + c.sections.length, 0);
    const done = chapters.reduce(
      (acc, c) => acc + Math.min(progressByChapter[c.id] ?? 0, c.sections.length),
      0
    );
    if (totalSections === 0) return 0;
    return Math.round((done / totalSections) * 100);
  }, [progressByChapter]);

  const handleResetProgress = async () => {
    if (!vbookId) return;
    if (!confirm("Reset your progress on this vBook?")) return;
    setIsResetting(true);
    try {
      await apiFetch(`/vbook/${vbookId}/progress`, {
        method: "DELETE",
        credentials: "include",
      });
      notifySuccess("Progress reset");
      fetchVBook();
    } catch (err) {
      notifyError(err, "Failed to reset progress");
    } finally {
      setIsResetting(false);
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
              className="rounded-2xl p-4 space-y-3"
              style={{
                background: "var(--gb-bg-soft)",
                boxShadow: "var(--gb-shadow-inset)",
              }}
            >
              <div className="flex items-center justify-between text-sm">
                <span style={{ color: "var(--gb-fg-soft)" }}>
                  {isAuthenticated ? "Your progress" : "Progress (sign in to save)"}
                </span>
                <span
                  className="font-semibold"
                  style={{ color: "var(--gb-fg)" }}
                >
                  {overallProgress}%
                </span>
              </div>
              <div
                className="h-2 rounded-full overflow-hidden"
                style={{ background: "var(--gb-bg-muted)" }}
              >
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${overallProgress}%`,
                    background:
                      "linear-gradient(90deg, var(--gb-accent), var(--gb-primary))",
                  }}
                />
              </div>
              {isAuthenticated && overallProgress > 0 && (
                <button
                  type="button"
                  onClick={handleResetProgress}
                  disabled={isResetting}
                  className="text-xs font-medium hover:underline disabled:opacity-50"
                  style={{ color: "var(--gb-error)" }}
                >
                  {isResetting ? "Resetting..." : "Reset my progress"}
                </button>
              )}
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
            const status = done === 0 ? "Start" : done >= chapter.sections.length ? "Review" : "Continue";
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
                <div className="flex items-start justify-between gap-3">
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
                      className="text-xs"
                      style={{ color: "var(--gb-fg-muted)" }}
                    >
                      {chapter.sections.length} sections
                    </div>
                  </div>
                  <span
                    className="inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-semibold"
                    style={{
                      background: "var(--gb-accent)",
                      color: "var(--gb-bg)",
                    }}
                  >
                    {status}
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  <div
                    className="h-1.5 rounded-full overflow-hidden"
                    style={{ background: "var(--gb-bg-muted)" }}
                  >
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${pct}%`,
                        background: "var(--gb-primary)",
                      }}
                    />
                  </div>
                  <div
                    className="flex items-center justify-between text-xs"
                    style={{ color: "var(--gb-fg-muted)" }}
                  >
                    <span>
                      {done} / {chapter.sections.length} done
                    </span>
                    <span>{pct}%</span>
                  </div>
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
