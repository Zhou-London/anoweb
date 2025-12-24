import { createContext, useState, useEffect, type ReactNode } from "react";
import { apiJson } from "../lib/api";

interface UserContextType {
  isAdmin: boolean;
  setIsAdmin: (value: boolean) => void;
}

export const UserContext = createContext<UserContextType>({
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
    <UserContext.Provider value={{ isAdmin, setIsAdmin }}>
      {children}
    </UserContext.Provider>
  );
}
