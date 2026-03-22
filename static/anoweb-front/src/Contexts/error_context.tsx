import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { ApiError, getErrorMessage } from "../lib/api";

type ErrorContextValue = {
  notifyError: (err: unknown, fallback?: string) => void;
};

type ErrorItem = {
  id: number;
  message: string;
  status?: number;
  statusText?: string;
};

export const ErrorContext = createContext<ErrorContextValue>({
  notifyError: () => {},
});

export function ErrorProvider({ children }: { children: ReactNode }) {
  const [errors, setErrors] = useState<ErrorItem[]>([]);

  const dismissError = useCallback((id: number) => {
    setErrors((prev) => prev.filter((error) => error.id !== id));
  }, []);

  const notifyError = useCallback(
    (err: unknown, fallback?: string) => {
      const message = typeof err === "string" ? err : getErrorMessage(err, fallback);
      if (!message) return;

      const item: ErrorItem = {
        id: Date.now() + Math.random(),
        message,
      };

      if (err instanceof ApiError) {
        item.status = err.status;
        item.statusText = err.statusText;
      }

      setErrors((prev) => [...prev, item]);
      window.setTimeout(() => dismissError(item.id), 6200);
    },
    [dismissError]
  );

  const value = useMemo(() => ({ notifyError }), [notifyError]);

  return (
    <ErrorContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex max-w-full flex-col gap-3 md:right-6">
        {errors.map((error) => (
          <div
            key={error.id}
            role="alert"
            className="flex w-[min(360px,calc(100vw-2rem))] items-start gap-3 rounded-xl px-4 py-3 text-sm backdrop-blur"
            style={{
              background: 'var(--gb-bg)',
              boxShadow: 'var(--gb-shadow-card-hover), inset 0 0 0 2px var(--gb-error)',
              color: 'var(--gb-error)',
            }}
          >
            <span aria-hidden className="text-lg">
              !
            </span>
            <div className="flex-1 space-y-0.5">
              <p className="font-semibold" style={{ color: 'var(--gb-error)' }}>
                {error.status ? `Error · ${error.status}` : "Error"}
              </p>
              {error.statusText && (
                <p className="text-xs font-medium" style={{ color: 'var(--gb-error)', opacity: 0.7 }}>
                  {error.statusText}
                </p>
              )}
              <p className="leading-snug" style={{ color: 'var(--gb-fg-soft)' }}>{error.message}</p>
            </div>
            <button
              type="button"
              onClick={() => dismissError(error.id)}
              className="rounded-full px-2 py-1 text-xs font-semibold transition"
              style={{ color: 'var(--gb-error)' }}
            >
              x
            </button>
          </div>
        ))}
      </div>
    </ErrorContext.Provider>
  );
}

export function useErrorNotifier() {
  const { notifyError } = useContext(ErrorContext);
  return notifyError;
}
