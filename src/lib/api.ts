// Backend client. Frontend holds zero secrets — just the base URL.
// Backend handles all auth via HttpOnly cookies; we send credentials: include
// and echo the csrf_token cookie as X-CSRF-Token on writes.

const BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

function getCookie(name: string): string | undefined {
  const match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : undefined;
}

export type Envelope<T> = {
  data: T;
  disclaimer: string;
  as_of: string;
  role: "viewer" | "admin" | null;
  error?: string;
};

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<Envelope<T>> {
  const method = (init.method || "GET").toUpperCase();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((init.headers as Record<string, string>) || {}),
  };
  if (method !== "GET" && method !== "HEAD") {
    const csrf = getCookie("csrf_token");
    if (csrf) headers["X-CSRF-Token"] = csrf;
  }

  const res = await fetch(`${BASE}${path}`, {
    ...init,
    method,
    credentials: "include",
    headers,
  });

  if (res.status === 401) {
    // Redirect to backend OAuth flow; come back to current page.
    const returnTo = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `${BASE}/auth/google/login?return_to=${returnTo}`;
    throw new HttpError(401, "redirecting to login");
  }
  if (!res.ok) {
    throw new HttpError(res.status, await res.text());
  }
  if (res.status === 204 || res.headers.get("content-length") === "0") {
    return { data: null as T, disclaimer: "", as_of: "", role: null };
  }
  return res.json() as Promise<Envelope<T>>;
}

export function loginUrl(returnTo = "/"): string {
  return `${BASE}/auth/google/login?return_to=${encodeURIComponent(returnTo)}`;
}

export async function logout(): Promise<void> {
  await api("/auth/logout", { method: "POST" });
}
