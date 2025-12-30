import { createContext, useState, useEffect, type ReactNode } from "react";
import { apiJson } from "../lib/api";

interface FanContextType {
  isAdmin: boolean;
  setIsAdmin: (value: boolean) => void;
}

export const FanContext = createContext<FanContextType>({
  isAdmin: false,
  setIsAdmin: () => {},
});

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    apiJson<{ isAdmin: boolean }>("/admin/status", { credentials: "include" })
      .then((data) => setIsAdmin(!!data.isAdmin))
      .catch(() => setIsAdmin(false));
  }, []);

  return (
    <FanContext.Provider value={{ isAdmin, setIsAdmin }}>
      {children}
    </FanContext.Provider>
  );
}
