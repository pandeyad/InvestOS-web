import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { loginUrl, logout } from "@/lib/api";
import { useTheme } from "@/lib/theme";

type NavItem = { to: string; label: string; icon: string };

const NAV_PUBLIC: NavItem[] = [
  { to: "/today", label: "Today", icon: "today" },
  { to: "/history", label: "History", icon: "history" },
  { to: "/leaderboard", label: "Leaderboard", icon: "leaderboard" },
  { to: "/lessons", label: "Lessons", icon: "menu_book" },
  { to: "/tip-jar", label: "Tip jar", icon: "local_cafe" },
  { to: "/about", label: "About", icon: "info" },
];

const NAV_ADMIN: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: "shield_person" },
  { to: "/admin/postmortems", label: "Post-mortems", icon: "fact_check" },
  { to: "/admin/broker", label: "Broker", icon: "hub" },
  { to: "/admin/control", label: "Control", icon: "tune" },
];

function Pill({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      to={item.to}
      className={`flex-none flex items-center gap-1.5 px-3 py-2 rounded-full text-[13.5px] font-medium tracking-tight transition-colors ${
        active
          ? "bg-surface-container-high text-on-surface"
          : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
      }`}
    >
      <span className="material-symbols-rounded" style={{ fontSize: 18 }}>
        {item.icon}
      </span>
      {item.label}
    </Link>
  );
}

export function Layout() {
  const { user, role, loading } = useAuth();
  const { theme, toggle } = useTheme();
  const loc = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface">
      {/* ── Top app bar ─────────────────────────────────────── */}
      <header
        className="sticky top-0 z-20 flex items-center gap-5 px-7 py-3 bg-surface-container-low border-b"
        style={{ borderColor: "var(--md-outline-variant)" }}
      >
        <Link to="/" className="flex items-center gap-3 flex-none">
          <span
            className="grid place-items-center w-[38px] h-[38px] rounded-xl text-on-primary"
            style={{ background: "var(--md-primary)", boxShadow: "0 2px 6px rgba(168,58,29,.35)" }}
          >
            <span className="material-symbols-rounded ms-fill" style={{ fontSize: 22 }}>
              local_fire_department
            </span>
          </span>
          <div className="leading-[1.05]">
            <div className="text-[18px] font-bold tracking-tight">InvestOS</div>
            <div className="text-[11px] text-on-surface-variant tracking-wide">trading journal</div>
          </div>
        </Link>

        {user && (
          <nav
            className="flex items-center gap-[3px] overflow-x-auto flex-1"
            style={{ scrollbarWidth: "none" }}
          >
            {NAV_PUBLIC.map((it) => (
              <Pill key={it.to} item={it} active={loc.pathname === it.to} />
            ))}
            {role === "admin" && (
              <>
                <span
                  className="flex-none w-px h-[22px] mx-1.5"
                  style={{ background: "var(--md-outline-variant)" }}
                />
                <span
                  className="flex-none flex items-center gap-1 text-[10.5px] font-semibold uppercase tracking-[1px] mr-1"
                  style={{ color: "var(--md-primary)" }}
                >
                  <span className="material-symbols-rounded" style={{ fontSize: 15 }}>
                    shield_person
                  </span>
                  Owner
                </span>
                {NAV_ADMIN.map((it) => (
                  <Pill key={it.to} item={it} active={loc.pathname === it.to} />
                ))}
              </>
            )}
          </nav>
        )}

        <div className="ml-auto flex items-center gap-3 flex-none">
          {/* Live indicator */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-high">
            <span
              className="w-2 h-2 rounded-full animate-pulse-dot"
              style={{ background: "var(--md-success)", color: "var(--md-success)" }}
            />
            <span className="text-[12.5px] font-medium text-on-surface-variant whitespace-nowrap">
              Live
            </span>
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggle}
            aria-label="toggle theme"
            className="grid place-items-center w-11 h-11 rounded-full hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-rounded text-on-surface-variant">
              {theme === "dark" ? "light_mode" : "dark_mode"}
            </span>
          </button>

          {/* Auth */}
          {loading ? null : user ? (
            <div className="flex items-center gap-2">
              <span className="hidden md:inline text-[13px] text-on-surface-variant">
                {user.email}
              </span>
              <span
                className="text-[11px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide"
                style={{
                  background: role === "admin" ? "var(--md-primary-container)" : "var(--md-surface-container-high)",
                  color: role === "admin" ? "var(--md-on-primary-container)" : "var(--md-on-surface-variant)",
                }}
              >
                {role}
              </span>
              <button
                onClick={async () => {
                  try { await logout(); } catch { /* already logged out */ }
                  window.location.href = "/";
                }}
                className="text-[13px] text-on-surface-variant hover:text-on-surface px-3 py-1.5 rounded-full hover:bg-surface-container-high transition-colors"
              >
                Sign out
              </button>
            </div>
          ) : (
            <a
              href={loginUrl(loc.pathname === "/" ? "/today" : loc.pathname)}
              className="flex items-center gap-2 px-4 py-2 rounded-full font-medium text-[14px] text-on-primary hover:brightness-105 transition-all"
              style={{ background: "var(--md-primary)" }}
            >
              <span className="material-symbols-rounded" style={{ fontSize: 18 }}>
                login
              </span>
              Sign in with Google
            </a>
          )}
        </div>
      </header>

      {/* ── Main ────────────────────────────────────────────── */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer
        className="border-t px-7 py-5 text-[12px] text-on-surface-variant"
        style={{ borderColor: "var(--md-outline-variant)" }}
      >
        <div className="max-w-[1100px] mx-auto flex items-start gap-2.5">
          <span className="material-symbols-rounded flex-none" style={{ fontSize: 18 }}>
            gavel
          </span>
          <span className="leading-relaxed">
            Personal trading journal. Not investment advice. Past performance does not guarantee
            future results.
          </span>
        </div>
      </footer>
    </div>
  );
}
