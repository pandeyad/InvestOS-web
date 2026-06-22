import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { loginUrl, logout } from "@/lib/api";

const NAV_PUBLIC = [
  { to: "/today", label: "Today" },
  { to: "/history", label: "History" },
  { to: "/leaderboard", label: "Leaderboard" },
  { to: "/lessons", label: "Lessons" },
  { to: "/tip-jar", label: "Tip jar" },
  { to: "/about", label: "About" },
];

const NAV_ADMIN = [
  { to: "/admin", label: "Dashboard" },
  { to: "/admin/postmortems", label: "Post-mortems" },
  { to: "/admin/broker", label: "Broker" },
  { to: "/admin/control", label: "Control" },
];

export function Layout() {
  const { user, role, loading } = useAuth();
  const loc = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-zinc-800 px-4 py-3 flex items-center gap-6">
        <Link to="/" className="font-semibold text-zinc-100">
          InvestOS
        </Link>
        <nav className="flex gap-4 text-sm text-zinc-400">
          {NAV_PUBLIC.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={loc.pathname === n.to ? "text-zinc-100" : "hover:text-zinc-200"}
            >
              {n.label}
            </Link>
          ))}
          {role === "admin" && (
            <span className="border-l border-zinc-800 pl-4 flex gap-4">
              {NAV_ADMIN.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  className={
                    loc.pathname === n.to
                      ? "text-amber-300"
                      : "text-amber-400/70 hover:text-amber-300"
                  }
                >
                  {n.label}
                </Link>
              ))}
            </span>
          )}
        </nav>
        <div className="ml-auto text-sm">
          {loading ? null : user ? (
            <div className="flex items-center gap-3">
              <span className="text-zinc-400">{user.email}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                {role}
              </span>
              <button
                onClick={async () => {
                  await logout();
                  window.location.href = "/";
                }}
                className="text-zinc-400 hover:text-zinc-200"
              >
                Sign out
              </button>
            </div>
          ) : (
            <a
              href={loginUrl(loc.pathname)}
              className="px-3 py-1.5 rounded bg-zinc-100 text-zinc-900 hover:bg-white"
            >
              Sign in with Google
            </a>
          )}
        </div>
      </header>

      <main className="flex-1 px-4 py-6 max-w-6xl w-full mx-auto">
        <Outlet />
      </main>

      <footer className="border-t border-zinc-800 px-4 py-4 text-xs text-zinc-500">
        Personal trading journal. Not investment advice. Past performance does not
        guarantee future results. You are solely responsible for your trading decisions.
      </footer>
    </div>
  );
}
