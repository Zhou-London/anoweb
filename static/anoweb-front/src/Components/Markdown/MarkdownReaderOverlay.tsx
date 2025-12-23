import { useEffect } from "react";
import MarkdownViewer from "./MarkdownViewer";
import type { MarkdownPayload } from "../../Contexts/markdown_reader";

type Props = {
  isOpen: boolean;
  payload: MarkdownPayload | null;
  isLoading: boolean;
  onClose: () => void;
};

export default function MarkdownReaderOverlay({ isOpen, payload, isLoading, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!isOpen || !payload) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="relative w-[94vw] lg:w-[90vw] max-w-6xl max-h-[88vh] bg-white rounded-3xl shadow-xl border border-slate-200/70 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start gap-4 border-b border-slate-200/70 bg-white px-5 py-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs uppercase tracking-[0.15em] text-slate-500 mb-1">Central Markdown Reader</p>
            <h1 className="text-xl md:text-2xl font-semibold text-slate-900 truncate">{payload.title}</h1>
            {payload.updatedAt && (
              <p className="text-xs text-slate-500 mt-1">Updated {new Date(payload.updatedAt).toLocaleString()}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="h-9 w-9 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
            aria-label="Close markdown reader"
          >
            ×
          </button>
        </header>

        <div className="flex-1 overflow-auto bg-[#f6f8fa]">
          <div className="mx-auto max-w-4xl px-5 py-6">
            {isLoading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-6 bg-slate-200 rounded" />
                <div className="h-4 bg-slate-200 rounded w-4/5" />
                <div className="h-64 bg-slate-200/70 rounded" />
              </div>
            ) : (
              <MarkdownViewer source={payload.content ?? ""} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
