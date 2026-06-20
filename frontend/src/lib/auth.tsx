"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";

const TOKEN_KEY = "auth_token";

export type UserRole = "master" | "user";

interface AuthUser {
  id: number;
  email: string;
  username: string;
  role: UserRole;
}

interface AuthContextValue {
  token: string | null;
  user: AuthUser | null;
  hydrated: boolean;
  isLoggedIn: boolean;
  isMaster: boolean;
  setAuth: (token: string, user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  token: null,
  user: null,
  hydrated: false,
  isLoggedIn: false,
  isMaster: false,
  setAuth: () => {},
  logout: () => {},
});

function parseToken(stored: string): AuthUser | null {
  try {
    const payload = JSON.parse(atob(stored.split(".")[1]));
    if (payload.exp * 1000 <= Date.now()) return null;
    return {
      id: payload.user_id,
      email: payload.email,
      username: payload.username ?? payload.email,
      role: (payload.role as UserRole) ?? "user",
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (stored) {
      const parsed = parseToken(stored);
      if (parsed) {
        setToken(stored);
        setUser(parsed);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    }
    setHydrated(true);
  }, []);

  const setAuth = useCallback((t: string, u: AuthUser) => {
    localStorage.setItem(TOKEN_KEY, t);
    setToken(t);
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      token, user, hydrated,
      isLoggedIn: !!token,
      isMaster: user?.role === "master",
      setAuth, logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
