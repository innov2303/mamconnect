import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

interface ParentAuthData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface ParentAuthContextType {
  token: string | null;
  parent: ParentAuthData | null;
  isLoggedIn: boolean;
  login: (token: string, parent: ParentAuthData) => void;
  logout: () => void;
}

const ParentAuthContext = createContext<ParentAuthContextType | null>(null);

const STORAGE_TOKEN_KEY = "parent_token";
const STORAGE_PARENT_KEY = "parent_data";

export function ParentAuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_TOKEN_KEY);
  });
  const [parent, setParent] = useState<ParentAuthData | null>(() => {
    const stored = localStorage.getItem(STORAGE_PARENT_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  });

  const clearAuth = useCallback(() => {
    setToken(null);
    setParent(null);
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_PARENT_KEY);
  }, []);

  useEffect(() => {
    if (!token) return;

    fetch("/api/parents/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) {
          clearAuth();
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) {
          const authData = { id: data.id, firstName: data.firstName, lastName: data.lastName, email: data.email };
          setParent(authData);
          localStorage.setItem(STORAGE_PARENT_KEY, JSON.stringify(authData));
        }
      })
      .catch(() => {
        clearAuth();
      });
  }, [token, clearAuth]);

  const login = useCallback((newToken: string, parentData: ParentAuthData) => {
    setToken(newToken);
    const authData = { id: parentData.id, firstName: parentData.firstName, lastName: parentData.lastName, email: parentData.email };
    setParent(authData);
    localStorage.setItem(STORAGE_TOKEN_KEY, newToken);
    localStorage.setItem(STORAGE_PARENT_KEY, JSON.stringify(authData));
  }, []);

  const logout = useCallback(() => {
    clearAuth();
  }, [clearAuth]);

  return (
    <ParentAuthContext.Provider value={{ token, parent, isLoggedIn: !!token && !!parent, login, logout }}>
      {children}
    </ParentAuthContext.Provider>
  );
}

export function useParentAuth() {
  const context = useContext(ParentAuthContext);
  if (!context) {
    throw new Error("useParentAuth must be used within a ParentAuthProvider");
  }
  return context;
}
