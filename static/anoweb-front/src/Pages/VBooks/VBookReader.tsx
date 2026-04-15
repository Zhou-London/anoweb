import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FanContext } from "../../Contexts/fan_context";
import { useErrorNotifier } from "../../Contexts/error_context";
import { apiFetch, apiJson } from "../../lib/api";
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

  const chapter = useMemo(() => chapters.find((c) => c.id === chapterId), [chapterId]);
  const sections = chapter?.sections ?? [];
  const current = sections[currentIdx];

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

  // Keyboard navigation
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

  const completedSet = completed[chapterId] ?? new Set<string>();

  const markCompleted = async (sectionId: string) => {
    setCompleted((prev) => {
      const next = { ...prev };
      const s = new Set(next[chapterId] ?? []);
      s.add(sectionId);
      next[chapterId] = s;
      return next;
    });
    if (!isAuthenticated || !vbookId) return;
    try {
      await apiFetch(`/vbook/${vbookId}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ chapter_id: chapterId, section_id: sectionId }),
      });
    } catch {
      // Silently ignore — local state still reflects the click.
    }
  };

  const go = (idx: number) => {
    if (idx < 0 || idx >= sections.length) return;
    if (sections[currentIdx]) {
      void markCompleted(sections[currentIdx].id);
    }
    setCurrentIdx(idx);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const switchChapter = (newId: string) => {
    if (newId === chapterId) return;
    navigate(`/vbooks/${vbookId}/${newId}`);
  };

  const progressPct = useMemo(() => {
    if (sections.length <= 1) return 0;
    return Math.round((currentIdx / (sections.length - 1)) * 100);
  }, [currentIdx, sections.length]);

  if (!chapter || !current) {
    return (
      <div className="rounded-3xl p-6 space-y-3" style={{ background: "var(--gb-bg)", boxShadow: "var(--gb-shadow-card)", color: "var(--gb-fg-soft)" }}>
        <p className="font-semibold">Chapter not found.</p>
        <Link to={`/vbooks/${vbookId}`} className="underline text-sm" style={{ color: "var(--gb-accent)" }}>
          Back to vBook
        </Link>
      </div>
    );
  }

  const Body = current.Component;
  const data = chapter.data;

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <Link
            to={`/vbooks/${vbookId}`}
            className="group inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
            style={{ background: "var(--gb-accent)", color: "var(--gb-bg)" }}
          >
            <svg className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to vBook
          </Link>
          {vbook && (
            <div>
              <h1 className="text-xl md:text-2xl font-semibold" style={{ color: "var(--gb-fg)" }}>
                {vbook.title}
              </h1>
              <div className="text-xs mt-0.5" style={{ color: "var(--gb-fg-muted)" }}>
                {chapter.label}: {chapter.title}
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="qi-learn-content">
        <div className="ql-app">
          <header className="ql-header">
            <div className="ql-header-left">
              <div className="ql-book-icon">📘</div>
              <div>
                <div className="ql-book-title">{chapter.title}</div>
                <div className="ql-book-subtitle">{chapter.label}</div>
              </div>
            </div>
            <div className="chapter-switcher" style={{ display: "flex", gap: 4, padding: 4, background: "var(--ql-bg-elev)", border: "1px solid var(--ql-border)", borderRadius: 999 }}>
              {chapters.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => switchChapter(c.id)}
                  style={{
                    padding: "6px 14px",
                    fontSize: 12,
                    fontWeight: 600,
                    color: chapterId === c.id ? "#1c1c28" : "var(--ql-text-muted)",
                    borderRadius: 999,
                    background:
                      chapterId === c.id
                        ? "linear-gradient(135deg, var(--ql-accent), var(--ql-accent-2))"
                        : "transparent",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <div className="ql-progress-container">
              <div className="ql-progress-bar">
                <div className="ql-progress-fill" style={{ width: `${progressPct}%` }} />
              </div>
              <div className="ql-progress-label">
                {currentIdx + 1} / {sections.length}
              </div>
            </div>
          </header>

          <div className="ql-layout">
            <aside className="ql-sidebar">
              <div className="ql-sidebar-title">{chapter.label} Guide</div>
              <nav className="ql-nav">
                {sections.map((s, idx) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => go(idx)}
                    className={`ql-nav-item ${idx === currentIdx ? "active" : ""} ${completedSet.has(s.id) ? "done" : ""}`}
                  >
                    <span className="ql-nav-emoji">{s.emoji}</span>
                    <span className="ql-nav-label">{s.label}</span>
                    {completedSet.has(s.id) && idx !== currentIdx && (
                      <span className="ql-check">✓</span>
                    )}
                  </button>
                ))}
              </nav>
              <div className="ql-sidebar-footer">
                <div className="ql-hint">💡 Tip: Use ← → to navigate</div>
              </div>
            </aside>

            <main className="ql-main">
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
                      className={`dot ${i === currentIdx ? "active" : ""} ${i < currentIdx ? "done" : ""}`}
                      onClick={() => go(i)}
                      title={s.label}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => go(currentIdx + 1)}
                  disabled={currentIdx === sections.length - 1}
                >
                  Next →
                </button>
              </div>
            </main>
          </div>
        </div>
      </div>

      {!isAuthenticated && (
        <div
          className="rounded-2xl p-4 text-sm flex items-center gap-3"
          style={{ background: "var(--gb-bg-soft)", color: "var(--gb-fg-muted)", boxShadow: "var(--gb-shadow-card)" }}
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
