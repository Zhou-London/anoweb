import { createContext, useState, useEffect, type ReactNode } from "react";
import { apiJson } from "../lib/api";

export interface User {
  id: number;
  username: string;
  email: string;
  is_admin: boolean;
  profile_photo: string;
  bio: string;
  created_at: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  refreshUser: () => Promise<void>;
}

export const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  isAuthenticated: false,
  isAdmin: false,
  refreshUser: async () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const refreshUser = async () => {
    try {
      const data = await apiJson<User>("/auth/me", { credentials: "include" });
      setUser(data);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const contextValue: UserContextType = {
    user,
    setUser,
    isAuthenticated: !!user,
    isAdmin: user?.is_admin || false,
    refreshUser,
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
}
