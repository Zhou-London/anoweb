import { createContext, useState, useEffect, type ReactNode } from "react";
import { apiJson } from "../lib/api";

export interface Fan {
  id: number;
  username: string;
  email: string;
  is_admin: boolean;
  profile_photo: string;
  bio: string;
  created_at: string;
}

interface FanContextType {
  fan: Fan | null;
  setFan: (fan: Fan | null) => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  refreshFan: () => Promise<void>;
}

export const FanContext = createContext<FanContextType>({
  fan: null,
  setFan: () => {},
  isAuthenticated: false,
  isAdmin: false,
  refreshFan: async () => {},
});

export function FanProvider({ children }: { children: ReactNode }) {
  const [fan, setFan] = useState<Fan | null>(null);

  const refreshFan = async () => {
    try {
      const data = await apiJson<Fan>("/auth/me", { credentials: "include" });
      setFan(data);
    } catch {
      setFan(null);
    }
  };

  useEffect(() => {
    refreshFan();
  }, []);

  const contextValue: FanContextType = {
    fan,
    setFan,
    isAuthenticated: !!fan,
    isAdmin: fan?.is_admin || false,
    refreshFan,
  };

  return (
    <FanContext.Provider value={contextValue}>
      {children}
    </FanContext.Provider>
  );
}
