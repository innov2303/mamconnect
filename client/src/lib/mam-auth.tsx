import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

interface MamAuthData {
  id: string;
  slug: string;
  name: string;
  email: string;
}

interface MamAuthContextType {
  token: string | null;
  mam: MamAuthData | null;
  isLoggedIn: boolean;
  login: (token: string, mam: MamAuthData) => void;
  logout: () => void;
}

const MamAuthContext = createContext<MamAuthContextType | null>(null);

const STORAGE_TOKEN_KEY = "mam_token";
const STORAGE_MAM_KEY = "mam_data";

export function MamAuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_TOKEN_KEY);
  });
  const [mam, setMam] = useState<MamAuthData | null>(() => {
    const stored = localStorage.getItem(STORAGE_MAM_KEY);
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
    setMam(null);
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_MAM_KEY);
  }, []);

  useEffect(() => {
    if (!token) return;

    fetch("/api/mams/me", {
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
          setMam({ id: data.id, slug: data.slug, name: data.name, email: data.email });
          localStorage.setItem(
            STORAGE_MAM_KEY,
            JSON.stringify({ id: data.id, slug: data.slug, name: data.name, email: data.email })
          );
        }
      })
      .catch(() => {
        clearAuth();
      });
  }, [token, clearAuth]);

  const login = useCallback((newToken: string, mamData: MamAuthData) => {
    setToken(newToken);
    const authData = { id: mamData.id, slug: mamData.slug, name: mamData.name, email: mamData.email };
    setMam(authData);
    localStorage.setItem(STORAGE_TOKEN_KEY, newToken);
    localStorage.setItem(STORAGE_MAM_KEY, JSON.stringify(authData));
  }, []);

  const logout = useCallback(() => {
    clearAuth();
  }, [clearAuth]);

  return (
    <MamAuthContext.Provider value={{ token, mam, isLoggedIn: !!token && !!mam, login, logout }}>
      {children}
    </MamAuthContext.Provider>
  );
}

export function useMamAuth() {
  const context = useContext(MamAuthContext);
  if (!context) {
    throw new Error("useMamAuth must be used within a MamAuthProvider");
  }
  return context;
}
