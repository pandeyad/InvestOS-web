import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { type Envelope } from "@/lib/api";

type User = {
  email: string;
  name: string | null;
  picture_url: string | null;
};

type AuthState = {
  user: User | null;
  role: "viewer" | "admin" | null;
  loading: boolean;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<"viewer" | "admin" | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    try {
      // /auth/me returns 401 if not logged in — the api() wrapper would redirect,
      // so we call fetch directly here to silently accept the 401.
      const base = import.meta.env.VITE_API_BASE || "http://localhost:8000";
      const res = await fetch(`${base}/auth/me`, { credentials: "include" });
      if (res.status === 401) {
        setUser(null);
        setRole(null);
        return;
      }
      const body = (await res.json()) as Envelope<User>;
      setUser(body.data);
      setRole(body.role);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
