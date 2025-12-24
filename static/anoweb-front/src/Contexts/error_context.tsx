import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type ErrorContextValue = {
  notifyError: (message: string) => void;
};

type ErrorItem = {
  id: number;
  message: string;
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
    (message: string) => {
      if (!message) return;
      const id = Date.now() + Math.random();
      setErrors((prev) => [...prev, { id, message }]);
      window.setTimeout(() => dismissError(id), 6200);
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
            className="flex w-[min(360px,calc(100vw-2rem))] items-start gap-3 rounded-xl border border-rose-200 bg-white px-4 py-3 text-sm text-rose-800 shadow-lg ring-1 ring-rose-100 backdrop-blur"
          >
            <span aria-hidden className="text-lg">
              ⚠️
            </span>
            <div className="flex-1 space-y-0.5">
              <p className="font-semibold text-rose-700">Error</p>
              <p className="leading-snug">{error.message}</p>
            </div>
            <button
              type="button"
              onClick={() => dismissError(error.id)}
              className="rounded-full px-2 py-1 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
            >
              ✕
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
