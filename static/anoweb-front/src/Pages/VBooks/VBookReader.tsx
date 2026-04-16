import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
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
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(FanContext);
  const notifyError = useErrorNotifier();

  const [vbook, setVBook] = useState<VBookWithProgress | null>(null);
  const [completed, setCompleted] = useState<Record<string, Set<string>>>({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [navOpen, setNavOpen] = useState(false);

  const chapter = useMemo(() => chapters.find((c) => c.id === chapterId), [chapterId]);
  const chapterIdx = useMemo(() => chapters.findIndex((c) => c.id === chapterId), [chapterId]);
  const sections = chapter?.sections ?? [];
  const current = sections[currentIdx];

  const saveRef = useRef({ vbookId, chapterId, sectionId: current?.id });
  saveRef.current = { vbookId, chapterId, sectionId: current?.id };

  const navRef = useRef<HTMLDivElement>(null);
  const initialSectionApplied = useRef(false);

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

  // Restore section from ?s= query param on chapter change
  useEffect(() => {
    const sParam = searchParams.get("s");
    if (sParam && chapter) {
      const idx = chapter.sections.findIndex((s) => s.id === sParam);
      if (idx >= 0) {
        setCurrentIdx(idx);
        setSearchParams({}, { replace: true });
        initialSectionApplied.current = true;
        return;
      }
    }
    if (!initialSectionApplied.current) {
      setCurrentIdx(0);
    }
    initialSectionApplied.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterId]);

  // Send last-read on mount/chapter change
  useEffect(() => {
    if (!vbookId || !isAuthenticated || !chapter) return;
    const sectionId = sections[0]?.id;
    if (!sectionId) return;
    apiFetch(`/vbook/${vbookId}/last-read`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ chapter_id: chapterId, section_id: sectionId }),
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vbookId, chapterId, isAuthenticated]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      if (e.key === "ArrowRight") go(Math.min(currentIdx + 1, sections.length - 1));
      if (e.key === "ArrowLeft") go(Math.max(currentIdx - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIdx, chapterId, sections.length]);

  // Close nav on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setNavOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

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

  const toggleCompleted = async (sectionId: string, chId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const set = completed[chId] ?? new Set<string>();
    const isDone = set.has(sectionId);
    if (isDone) {
      setCompleted((prev) => {
        const next = { ...prev };
        const s = new Set(next[chId] ?? []);
        s.delete(sectionId);
        next[chId] = s;
        return next;
      });
      if (!vbookId) return;
      try {
        await apiFetch(`/vbook/${vbookId}/progress/${chId}/${sectionId}`, {
          method: "DELETE",
          credentials: "include",
        });
      } catch {
        setCompleted((prev) => {
          const next = { ...prev };
          const s = new Set(next[chId] ?? []);
          s.add(sectionId);
          next[chId] = s;
          return next;
        });
      }
    } else {
      setCompleted((prev) => {
        const next = { ...prev };
        const s = new Set(next[chId] ?? []);
        s.add(sectionId);
        next[chId] = s;
        return next;
      });
      if (!vbookId) return;
      try {
        await apiFetch(`/vbook/${vbookId}/progress`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ chapter_id: chId, section_id: sectionId }),
        });
      } catch {
        // silent
      }
    }
  };

  const go = (idx: number) => {
    if (idx < 0 || idx >= sections.length) return;
    if (sections[currentIdx]) {
      void markCompleted(sections[currentIdx].id);
    }
    setCurrentIdx(idx);
    setNavOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const jumpTo = (chId: string, sectionId: string, sectionIdx: number) => {
    setNavOpen(false);
    if (chId === chapterId) {
      go(sectionIdx);
    } else {
      if (sections[currentIdx]) {
        void markCompleted(sections[currentIdx].id);
      }
      navigate(`/vbooks/${vbookId}/${chId}?s=${sectionId}`);
    }
  };

  const switchChapter = (newId: string) => {
    if (newId === chapterId) return;
    navigate(`/vbooks/${vbookId}/${newId}`);
  };

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
      <header className="flex items-center gap-3">
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </Link>
        {vbook && (
          <h1 className="flex-1 text-lg md:text-xl font-semibold truncate min-w-0" style={{ color: "var(--gb-fg)" }}>
            {vbook.title}
          </h1>
        )}
      </header>

      {/* Content */}
      <div className="qi-learn-content">
        <div className="ql-main" style={{ padding: 0 }}>
          <div key={`${chapterId}-${current.id}`} className="ql-section-wrap content-enter">
            <Body data={data} onStart={() => go(1)} />
          </div>

          {/* End-of-chapter prompt */}
          {currentIdx === sections.length - 1 && chapterIdx < chapters.length - 1 && (
            <div className="flex justify-center pt-8 pb-4">
              <button
                type="button"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:shadow-lg hover:scale-105 active:scale-95"
                style={{ background: "var(--gb-accent)", color: "var(--gb-bg)" }}
                onClick={() => {
                  void markCompleted(sections[currentIdx].id);
                  switchChapter(chapters[chapterIdx + 1].id);
                }}
              >
                Next Chapter
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Backdrop */}
      {navOpen && (
        <div
          className="fixed inset-0 z-30 backdrop-enter"
          style={{ background: "rgba(0,0,0,0.2)" }}
          onClick={() => setNavOpen(false)}
        />
      )}

      {/* Floating menu */}
      <div className="fixed bottom-4 left-4 z-40" ref={navRef} style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        {navOpen && (
          <div
            className="absolute bottom-14 left-0 mb-1 rounded-2xl overflow-hidden flex flex-col popover-enter-up"
            style={{
              background: "var(--gb-bg)",
              boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
              width: "min(320px, calc(100vw - 2rem))",
              maxHeight: "min(70vh, 480px)",
            }}
          >
            {/* Prev / Next bar */}
            <div
              className="flex items-center border-b flex-shrink-0"
              style={{ borderColor: "var(--gb-bg-muted)" }}
            >
              <button
                type="button"
                onClick={() => go(currentIdx - 1)}
                disabled={currentIdx === 0}
                className="flex-1 py-3 text-xs font-medium transition-colors active:bg-black/5 disabled:opacity-25 flex items-center justify-center gap-1.5"
                style={{ color: "var(--gb-fg-soft)" }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Prev
              </button>
              <div
                className="text-xs font-semibold tabular-nums px-3"
                style={{ color: "var(--gb-fg-muted)" }}
              >
                {currentIdx + 1} / {sections.length}
              </div>
              <button
                type="button"
                onClick={() => go(currentIdx + 1)}
                disabled={currentIdx >= sections.length - 1}
                className="flex-1 py-3 text-xs font-medium transition-colors active:bg-black/5 disabled:opacity-25 flex items-center justify-center gap-1.5"
                style={{ color: "var(--gb-fg-soft)" }}
              >
                Next
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* TOC */}
            <div className="overflow-y-auto overscroll-contain py-1">
              {chapters.map((ch) => {
                const chSet = completed[ch.id] ?? new Set<string>();
                const chDone = chSet.size;
                const chTotal = ch.sections.length;
                const isCurrent = ch.id === chapterId;
                return (
                  <div key={ch.id}>
                    <div
                      className="px-4 pt-3 pb-1 flex items-center gap-2"
                      style={{ color: isCurrent ? "var(--gb-accent)" : "var(--gb-fg)" }}
                    >
                      <span className="text-xs font-bold uppercase tracking-wider flex-1 truncate">
                        {ch.label}: {ch.title}
                      </span>
                      <span
                        className="text-[10px] font-semibold tabular-nums flex-shrink-0"
                        style={{ color: chDone >= chTotal && chTotal > 0 ? "var(--gb-success)" : "var(--gb-fg-muted)" }}
                      >
                        {chDone}/{chTotal}
                      </span>
                    </div>
                    {ch.sections.map((s, sIdx) => {
                      const isActive = isCurrent && sIdx === currentIdx;
                      const isDone = chSet.has(s.id);
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => jumpTo(ch.id, s.id, sIdx)}
                          className="w-full text-left pl-7 pr-4 min-h-[44px] py-2.5 text-sm transition-colors flex items-center gap-2.5"
                          style={{
                            color: isActive ? "var(--gb-accent)" : "var(--gb-fg-soft)",
                            background: isActive ? "color-mix(in srgb, var(--gb-accent) 8%, transparent)" : "transparent",
                            fontWeight: isActive ? 600 : 400,
                          }}
                        >
                          <span className="flex-shrink-0 text-xs">{s.emoji}</span>
                          <span className="flex-1 truncate">{s.label}</span>
                          {isAuthenticated && isDone && (
                            <span
                              className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-[10px] cursor-pointer"
                              style={{ color: "var(--gb-success)" }}
                              onClick={(e) => toggleCompleted(s.id, ch.id, e)}
                              title="Click to unmark"
                            >
                              ✓
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
              {!isAuthenticated && (
                <div
                  className="px-4 pt-3 pb-2 text-[11px] border-t mt-1"
                  style={{ color: "var(--gb-fg-muted)", borderColor: "var(--gb-bg-muted)" }}
                >
                  Log in to save progress across sessions
                </div>
              )}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setNavOpen((v) => !v)}
          className="w-12 h-12 rounded-full flex items-center justify-center fab-enter transition-all hover:scale-105 active:scale-95"
          style={{ background: "var(--gb-accent)", color: "var(--gb-bg)", boxShadow: "0 2px 16px rgba(0,0,0,0.2)" }}
          aria-label="Open navigation"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {navOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>
    </div>
  );
}
