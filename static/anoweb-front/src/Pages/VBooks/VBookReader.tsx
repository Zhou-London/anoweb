import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FanContext } from "../../Contexts/fan_context";
import { useErrorNotifier } from "../../Contexts/error_context";
import { apiFetch, apiJson, apiUrl } from "../../lib/api";
import { chapters } from "./chapters/quant-research";
import "./chapters/quant-research/qi-learn.css";
import type { VBookWithProgress } from "./types";

export default function VBookReader() {
  const params = useParams<{ vbookId: string; chapterId: string }>();
  const vbookId = params.vbookId ?? "";
  const chapterId = params.chapterId ?? "ch1";
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(FanContext);
  const notifyError = useErrorNotifier();

  const [vbook, setVBook] = useState<VBookWithProgress | null>(null);
  const [completed, setCompleted] = useState<Record<string, Set<string>>>({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [sectionsOpen, setSectionsOpen] = useState(false);
  const [chapterMenuOpen, setChapterMenuOpen] = useState(false);

  const chapter = useMemo(() => chapters.find((c) => c.id === chapterId), [chapterId]);
  const chapterIdx = useMemo(() => chapters.findIndex((c) => c.id === chapterId), [chapterId]);
  const sections = chapter?.sections ?? [];
  const current = sections[currentIdx];

  const saveRef = useRef({ vbookId, chapterId, sectionId: current?.id });
  saveRef.current = { vbookId, chapterId, sectionId: current?.id };

  const sectionsRef = useRef<HTMLDivElement>(null);
  const chapterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!vbookId) return;
    apiJson<VBookWithProgress>(`/vbook/${vbookId}`, { credentials: "include" })
      .then((data) => {
        setVBook(data);
        const map: Record<string, Set<string>> = {};
        for (const cp of data.progress || []) {
          map[cp.chapter_id] = new Set(cp.completed_sections);
        }
        setCompleted(map);
      })
      .catch((err) => notifyError(err, "Failed to load vBook"));
  }, [vbookId, notifyError]);

  useEffect(() => {
    setCurrentIdx(0);
  }, [chapterId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA")
      ) {
        return;
      }
      if (e.key === "ArrowRight") go(Math.min(currentIdx + 1, sections.length - 1));
      if (e.key === "ArrowLeft") go(Math.max(currentIdx - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIdx, chapterId, sections.length]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (sectionsRef.current && !sectionsRef.current.contains(e.target as Node)) {
        setSectionsOpen(false);
      }
      if (chapterRef.current && !chapterRef.current.contains(e.target as Node)) {
        setChapterMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const completedSet = completed[chapterId] ?? new Set<string>();

  useEffect(() => {
    return () => {
      const { vbookId: vid, chapterId: cid, sectionId: sid } = saveRef.current;
      if (!sid || !vid) return;
      fetch(apiUrl(`/vbook/${vid}/progress`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ chapter_id: cid, section_id: sid }),
        keepalive: true,
      }).catch(() => {});
    };
  }, []);

  const markCompleted = async (sectionId: string) => {
    setCompleted((prev) => {
      const next = { ...prev };
      const s = new Set(next[chapterId] ?? []);
      s.add(sectionId);
      next[chapterId] = s;
      return next;
    });
    if (!vbookId) return;
    try {
      await apiFetch(`/vbook/${vbookId}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ chapter_id: chapterId, section_id: sectionId }),
      });
    } catch {
      // 401 if not authenticated, caught silently
    }
  };

  const go = (idx: number) => {
    if (idx < 0 || idx >= sections.length) return;
    if (sections[currentIdx]) {
      void markCompleted(sections[currentIdx].id);
    }
    setCurrentIdx(idx);
    setSectionsOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const switchChapter = (newId: string) => {
    if (newId === chapterId) return;
    setChapterMenuOpen(false);
    navigate(`/vbooks/${vbookId}/${newId}`);
  };

  const progressPct = useMemo(() => {
    if (sections.length <= 1) return 0;
    return Math.round((currentIdx / (sections.length - 1)) * 100);
  }, [currentIdx, sections.length]);

  if (!chapter || !current) {
    return (
      <div
        className="rounded-3xl p-6 space-y-3"
        style={{
          background: "var(--gb-bg)",
          boxShadow: "var(--gb-shadow-card)",
          color: "var(--gb-fg-soft)",
        }}
      >
        <p className="font-semibold">Chapter not found.</p>
        <Link
          to={`/vbooks/${vbookId}`}
          className="underline text-sm"
          style={{ color: "var(--gb-accent)" }}
        >
          Back to vBook
        </Link>
      </div>
    );
  }

  const Body = current.Component;
  const data = chapter.data;

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-4 min-w-0">
          <Link
            to={`/vbooks/${vbookId}`}
            className="group inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 flex-shrink-0"
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
            Back
          </Link>
          {vbook && (
            <div className="min-w-0">
              <h1
                className="text-xl md:text-2xl font-semibold truncate"
                style={{ color: "var(--gb-fg)" }}
              >
                {vbook.title}
              </h1>
              <div
                className="text-xs mt-0.5 truncate"
                style={{ color: "var(--gb-fg-muted)" }}
              >
                {chapter.label}: {chapter.title}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Toolbar: chapter nav + section dropdown + progress */}
      <section
        className="rounded-2xl p-3 sm:p-4 flex flex-wrap items-center gap-3 sm:gap-4"
        style={{
          background: "var(--gb-bg)",
          boxShadow: "var(--gb-shadow-card)",
        }}
      >
        {/* Chapter navigator */}
        <div className="relative flex items-center gap-1 flex-shrink-0" ref={chapterRef}>
          <button
            type="button"
            onClick={() => chapterIdx > 0 && switchChapter(chapters[chapterIdx - 1].id)}
            disabled={chapterIdx <= 0}
            className="rounded-lg p-1.5 transition-colors disabled:opacity-30"
            style={{ color: "var(--gb-fg-soft)" }}
            aria-label="Previous chapter"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setChapterMenuOpen((v) => !v)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150"
            style={{
              background: "var(--gb-accent)",
              color: "var(--gb-bg)",
            }}
          >
            {chapter.shortLabel ?? chapter.label}
            <svg className="w-3 h-3 ml-1.5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => chapterIdx < chapters.length - 1 && switchChapter(chapters[chapterIdx + 1].id)}
            disabled={chapterIdx >= chapters.length - 1}
            className="rounded-lg p-1.5 transition-colors disabled:opacity-30"
            style={{ color: "var(--gb-fg-soft)" }}
            aria-label="Next chapter"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {chapterMenuOpen && (
            <div
              className="absolute top-full left-0 mt-2 z-20 rounded-xl py-1 min-w-[200px]"
              style={{ background: "var(--gb-bg)", boxShadow: "var(--gb-shadow-card-hover)" }}
            >
              {chapters.map((c, i) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => switchChapter(c.id)}
                  className="w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-2"
                  style={{
                    color: c.id === chapterId ? "var(--gb-accent)" : "var(--gb-fg-soft)",
                    background: c.id === chapterId ? "color-mix(in srgb, var(--gb-accent) 10%, transparent)" : "transparent",
                    fontWeight: c.id === chapterId ? 600 : 400,
                  }}
                >
                  <span className="text-xs font-bold tabular-nums" style={{ color: "var(--gb-fg-muted)" }}>{i + 1}</span>
                  {c.title}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Section dropdown */}
        <div className="relative flex-shrink-0" ref={sectionsRef}>
          <button
            type="button"
            onClick={() => setSectionsOpen((v) => !v)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-150"
            style={{
              background: "var(--gb-bg-soft)",
              color: "var(--gb-fg-soft)",
              boxShadow: "var(--gb-shadow-inset)",
            }}
          >
            <span>{current.emoji}</span>
            <span className="max-w-[120px] sm:max-w-[180px] truncate">{current.label}</span>
            <svg className={`w-3 h-3 transition-transform duration-150 ${sectionsOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {sectionsOpen && (
            <div
              className="absolute top-full left-0 mt-2 z-20 rounded-xl py-1 min-w-[220px] max-h-[60vh] overflow-y-auto"
              style={{ background: "var(--gb-bg)", boxShadow: "var(--gb-shadow-card-hover)" }}
            >
              {sections.map((s, idx) => {
                const isActive = idx === currentIdx;
                const isDone = completedSet.has(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => go(idx)}
                    className="w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-3"
                    style={{
                      color: isActive ? "var(--gb-accent)" : "var(--gb-fg-soft)",
                      background: isActive ? "color-mix(in srgb, var(--gb-accent) 10%, transparent)" : "transparent",
                      fontWeight: isActive ? 600 : 400,
                    }}
                  >
                    <span className="flex-shrink-0">{s.emoji}</span>
                    <span className="flex-1 truncate">{s.label}</span>
                    {isDone && !isActive && (
                      <span className="text-xs flex-shrink-0" style={{ color: "var(--gb-success)" }}>✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="flex-1 min-w-[100px] flex items-center gap-3">
          <div
            className="flex-1 h-1.5 rounded-full overflow-hidden"
            style={{ background: "var(--gb-bg-muted)" }}
          >
            <div
              className="h-full transition-all duration-500"
              style={{
                width: `${progressPct}%`,
                background:
                  "linear-gradient(90deg, var(--gb-accent), var(--gb-primary))",
              }}
            />
          </div>
          <div
            className="text-xs font-medium tabular-nums whitespace-nowrap"
            style={{ color: "var(--gb-fg-muted)" }}
          >
            {currentIdx + 1} / {sections.length}
          </div>
        </div>
      </section>

      {/* Content (no sidebar, full width) */}
      <section
        className="qi-learn-content rounded-2xl sm:rounded-3xl p-3 sm:p-6 md:p-8 min-h-[70vh]"
        style={{
          background: "var(--gb-bg)",
          boxShadow: "var(--gb-shadow-card)",
        }}
      >
        <div className="ql-main" style={{ padding: 0 }}>
          <div key={`${chapterId}-${current.id}`} className="ql-section-wrap">
            <Body data={data} onStart={() => go(1)} />
          </div>

          <div className="controls">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => go(currentIdx - 1)}
              disabled={currentIdx === 0}
            >
              ← Previous
            </button>
            <div className="step-indicator">
              {sections.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  className={`dot ${i === currentIdx ? "active" : ""} ${
                    i < currentIdx ? "done" : ""
                  }`}
                  onClick={() => go(i)}
                  title={s.label}
                />
              ))}
            </div>
            {currentIdx === sections.length - 1 && chapterIdx < chapters.length - 1 ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  void markCompleted(sections[currentIdx].id);
                  switchChapter(chapters[chapterIdx + 1].id);
                }}
              >
                Next Chapter →
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => go(currentIdx + 1)}
                disabled={currentIdx === sections.length - 1}
              >
                Next →
              </button>
            )}
          </div>
        </div>
      </section>

      {!isAuthenticated && (
        <div
          className="rounded-2xl p-4 text-sm flex items-center gap-3"
          style={{
            background: "var(--gb-bg-soft)",
            color: "var(--gb-fg-muted)",
            boxShadow: "var(--gb-shadow-card)",
          }}
        >
          <span className="text-lg" aria-hidden>
            ℹ️
          </span>
          <span>
            Log in to save your progress across sessions. Right now your progress is
            local to this browser tab.
          </span>
        </div>
      )}
    </div>
  );
}
