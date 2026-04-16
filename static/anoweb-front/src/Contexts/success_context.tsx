import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type SuccessContextValue = {
  notifySuccess: (message: string) => void;
};

type SuccessItem = {
  id: number;
  message: string;
};

export const SuccessContext = createContext<SuccessContextValue>({
  notifySuccess: () => {},
});

export function SuccessProvider({ children }: { children: ReactNode }) {
  const [successes, setSuccesses] = useState<SuccessItem[]>([]);

  const dismissSuccess = useCallback((id: number) => {
    setSuccesses((prev) => prev.filter((success) => success.id !== id));
  }, []);

  const notifySuccess = useCallback(
    (message: string) => {
      if (!message) return;
      const id = Date.now() + Math.random();
      setSuccesses((prev) => [...prev, { id, message }]);
      window.setTimeout(() => dismissSuccess(id), 4000);
    },
    [dismissSuccess]
  );

  const value = useMemo(() => ({ notifySuccess }), [notifySuccess]);

  return (
    <SuccessContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex max-w-full flex-col gap-3 md:right-6">
        {successes.map((success) => (
          <div
            key={success.id}
            role="alert"
            className="toast-enter flex w-[min(360px,calc(100vw-2rem))] items-start gap-3 rounded-xl px-4 py-3 text-sm backdrop-blur"
            style={{
              background: 'var(--gb-bg)',
              boxShadow: 'var(--gb-shadow-card-hover), inset 0 0 0 2px var(--gb-success)',
              color: 'var(--gb-success)',
            }}
          >
            <span aria-hidden className="text-lg">
              +
            </span>
            <div className="flex-1 space-y-0.5">
              <p className="font-semibold" style={{ color: 'var(--gb-success)' }}>Success</p>
              <p className="leading-snug" style={{ color: 'var(--gb-fg-soft)' }}>{success.message}</p>
            </div>
            <button
              type="button"
              onClick={() => dismissSuccess(success.id)}
              className="rounded-full px-2 py-1 text-xs font-semibold transition"
              style={{ color: 'var(--gb-success)' }}
            >
              x
            </button>
          </div>
        ))}
      </div>
    </SuccessContext.Provider>
  );
}

export function useSuccessNotifier() {
  const { notifySuccess } = useContext(SuccessContext);
  return notifySuccess;
}
