import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { apiJson } from "../lib/api";
import type { Post } from "../Pages/Projects/types";
import MarkdownReaderOverlay from "../Components/Markdown/MarkdownReaderOverlay";

export type MarkdownPayload = {
  title?: string;
  content?: string;
  updatedAt?: string;
  sourceId?: number;
};

export type MarkdownReaderContextType = {
  openReader: (payload: MarkdownPayload) => void;
  closeReader: () => void;
};

const MarkdownReaderContext = createContext<MarkdownReaderContextType>({
  openReader: () => {},
  closeReader: () => {},
});

export function MarkdownReaderProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<MarkdownPayload | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const closeReader = useCallback(() => {
    setCurrent(null);
    setIsLoading(false);
  }, []);

  const openReader = useCallback((payload: MarkdownPayload) => {
    setCurrent({ title: payload.title ?? "Untitled", content: payload.content ?? "", updatedAt: payload.updatedAt, sourceId: payload.sourceId });

    if (payload.sourceId) {
      setIsLoading(true);
      apiJson<Post>(`/post/${payload.sourceId}`)
        .then((post) =>
          setCurrent({
            title: post.name,
            content: post.content_md ?? "",
            updatedAt: post.updated_at,
            sourceId: payload.sourceId,
          })
        )
        .catch((err) => {
          setCurrent({
            title: payload.title ?? "Unable to load markdown",
            content: err instanceof Error ? err.message : "Unknown error",
            updatedAt: payload.updatedAt,
          });
        })
        .finally(() => setIsLoading(false));
    }
  }, []);

  const value = useMemo(() => ({ openReader, closeReader }), [openReader, closeReader]);

  return (
    <MarkdownReaderContext.Provider value={value}>
      {children}
      <MarkdownReaderOverlay
        isOpen={!!current}
        payload={current}
        isLoading={isLoading}
        onClose={closeReader}
      />
    </MarkdownReaderContext.Provider>
  );
}

export function useMarkdownReader() {
  return useContext(MarkdownReaderContext);
}
