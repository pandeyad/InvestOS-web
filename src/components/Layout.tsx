import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { loginUrl, logout } from "@/lib/api";
import { useTheme } from "@/lib/theme";

type NavItem = { to: string; label: string; icon: string };

const NAV_PUBLIC: NavItem[] = [
  { to: "/today", label: "Today", icon: "today" },
  { to: "/history", label: "History", icon: "history" },
  { to: "/leaderboard", label: "Leaderboard", icon: "leaderboard" },
  { to: "/subscribe", label: "Notifications", icon: "notifications_active" },
  { to: "/tip-jar", label: "Support", icon: "volunteer_activism" },
  { to: "/about", label: "About", icon: "info" },
];

const NAV_ADMIN: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: "shield_person" },
  { to: "/admin/postmortems", label: "Post-mortems", icon: "fact_check" },
  { to: "/admin/broker", label: "Broker", icon: "hub" },
  { to: "/admin/control", label: "Control", icon: "tune" },
  { to: "/lessons", label: "Lessons", icon: "menu_book" },
];

// Desktop pill nav item
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

// Mobile bottom nav tab
function BottomTab({
  item,
  active,
  onClick,
}: {
  item: NavItem;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      to={item.to}
      onClick={onClick}
      className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-h-[56px]"
    >
      <span
        className={`material-symbols-rounded transition-colors ${
          active ? "ms-fill" : ""
        }`}
        style={{
          fontSize: 24,
          color: active ? "var(--md-primary)" : "var(--md-on-surface-variant)",
        }}
      >
        {item.icon}
      </span>
      <span
        className="text-[10.5px] font-medium tracking-tight"
        style={{ color: active ? "var(--md-primary)" : "var(--md-on-surface-variant)" }}
      >
        {item.label}
      </span>
    </Link>
  );
}

// More sheet drawer (mobile)
function MoreSheet({
  open,
  onClose,
  extraItems,
  role,
  user,
  theme,
  onToggleTheme,
}: {
  open: boolean;
  onClose: () => void;
  extraItems: NavItem[];
  role: string | null;
  user: { email: string; name: string | null } | null;
  theme: string;
  onToggleTheme: () => void;
}) {
  if (!open) return null;
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={onClose}
      />
      {/* Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl py-3"
        style={{ background: "var(--md-surface-container-low)" }}
      >
        {/* Handle */}
        <div className="mx-auto mb-4 w-10 h-1 rounded-full bg-surface-container-high" />

        {user && (
          <div
            className="mx-4 mb-3 px-4 py-3 rounded-2xl flex items-center gap-3"
            style={{ background: "var(--md-surface-container)" }}
          >
            <span
              className="grid place-items-center w-9 h-9 rounded-full text-on-primary text-[14px] font-bold flex-none"
              style={{ background: "var(--md-primary)" }}
            >
              {(user.name || user.email)[0].toUpperCase()}
            </span>
            <div className="min-w-0">
              <div className="text-[13.5px] font-medium truncate">{user.name || "Me"}</div>
              <div className="text-[11.5px] text-on-surface-variant truncate">{user.email}</div>
            </div>
            {role && (
              <span
                className="ml-auto text-[11px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide flex-none"
                style={{
                  background: role === "admin" ? "var(--md-primary-container)" : "var(--md-surface-container-high)",
                  color: role === "admin" ? "var(--md-on-primary-container)" : "var(--md-on-surface-variant)",
                }}
              >
                {role}
              </span>
            )}
          </div>
        )}

        <div className="px-4 pb-1">
          {extraItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={onClose}
              className="flex items-center gap-3.5 px-2 py-3 rounded-xl transition-colors hover:bg-surface-container"
            >
              <span
                className="material-symbols-rounded text-on-surface-variant"
                style={{ fontSize: 22 }}
              >
                {item.icon}
              </span>
              <span className="text-[14.5px] font-medium">{item.label}</span>
            </Link>
          ))}

          {role === "admin" && (
            <>
              <div
                className="my-2 h-px"
                style={{ background: "var(--md-outline-variant)" }}
              />
              <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-[1px] text-on-surface-variant mb-1 flex items-center gap-1.5">
                <span className="material-symbols-rounded" style={{ fontSize: 14 }}>shield_person</span>
                Owner
              </div>
              {NAV_ADMIN.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className="flex items-center gap-3.5 px-2 py-3 rounded-xl transition-colors hover:bg-surface-container"
                >
                  <span
                    className="material-symbols-rounded text-on-surface-variant"
                    style={{ fontSize: 22 }}
                  >
                    {item.icon}
                  </span>
                  <span className="text-[14.5px] font-medium">{item.label}</span>
                </Link>
              ))}
            </>
          )}

          <div
            className="my-2 h-px"
            style={{ background: "var(--md-outline-variant)" }}
          />

          {/* Theme toggle row */}
          <button
            onClick={() => { onToggleTheme(); }}
            className="w-full flex items-center gap-3.5 px-2 py-3 rounded-xl transition-colors hover:bg-surface-container"
          >
            <span
              className="material-symbols-rounded text-on-surface-variant"
              style={{ fontSize: 22 }}
            >
              {theme === "dark" ? "light_mode" : "dark_mode"}
            </span>
            <span className="text-[14.5px] font-medium">
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </span>
          </button>

          {user && (
            <button
              onClick={async () => {
                onClose();
                try { await logout(); } catch { /* already logged out */ }
                window.location.href = "/";
              }}
              className="w-full flex items-center gap-3.5 px-2 py-3 rounded-xl transition-colors hover:bg-surface-container"
            >
              <span
                className="material-symbols-rounded"
                style={{ fontSize: 22, color: "var(--md-error)" }}
              >
                logout
              </span>
              <span className="text-[14.5px] font-medium" style={{ color: "var(--md-error)" }}>
                Sign out
              </span>
            </button>
          )}
        </div>

        {/* Safe area spacer */}
        <div style={{ height: "env(safe-area-inset-bottom, 0px)" }} />
      </div>
    </>
  );
}

export function Layout() {
  const { user, role, loading } = useAuth();
  const { theme, toggle } = useTheme();
  const loc = useLocation();
  const [sheetOpen, setSheetOpen] = useState(false);

  // Bottom nav: first 3 public items, then More
  const bottomPrimary = NAV_PUBLIC.slice(0, 3);
  // Extra items in the sheet = remaining public items
  const sheetItems = NAV_PUBLIC.slice(3);

  const activeMain = [...NAV_PUBLIC, ...NAV_ADMIN].some(
    (it) => loc.pathname === it.to,
  );

  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface">
      {/* ── Top app bar ─────────────────────────────────────── */}
      <header
        className="sticky top-0 z-20 flex items-center gap-3 px-4 md:px-7 py-3 bg-surface-container-low border-b"
        style={{ borderColor: "var(--md-outline-variant)" }}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-none">
          <img
            src={theme === "dark" ? "/icon-dark.png" : "/icon-light.png"}
            alt=""
            className="h-[34px] w-[34px] object-contain"
          />
          <span className="text-[17px] font-bold tracking-tight hidden sm:block">What I Bought</span>
        </Link>

        {/* Desktop nav (hidden on mobile) */}
        {user && (
          <nav
            className="hidden md:flex items-center gap-[3px] overflow-x-auto flex-1 whitespace-nowrap"
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

        {/* Desktop right section */}
        <div className="ml-auto flex items-center gap-2 flex-none">
          {/* Live indicator — desktop only */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-high">
            <span
              className="w-2 h-2 rounded-full animate-pulse-dot"
              style={{ background: "var(--md-success)" }}
            />
            <span className="text-[12.5px] font-medium text-on-surface-variant whitespace-nowrap">
              Live
            </span>
          </div>

          {/* Theme toggle — desktop only */}
          <button
            onClick={toggle}
            aria-label="toggle theme"
            className="hidden md:grid place-items-center w-10 h-10 rounded-full hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-rounded text-on-surface-variant">
              {theme === "dark" ? "light_mode" : "dark_mode"}
            </span>
          </button>

          {/* Auth — desktop */}
          {!loading && (
            <>
              {user ? (
                <div className="hidden md:flex items-center gap-2">
                  <span className="hidden lg:inline text-[13px] text-on-surface-variant">
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
                  <span className="hidden sm:inline">Sign in with Google</span>
                  <span className="sm:hidden">Sign in</span>
                </a>
              )}
            </>
          )}
        </div>
      </header>

      {/* ── Main ────────────────────────────────────────────── */}
      <main className="flex-1 pb-[72px] md:pb-0">
        <Outlet />
      </main>

      {/* ── Mobile bottom navigation bar ──────────────────── */}
      {user && (
        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex border-t"
          style={{
            background: "var(--md-surface-container-low)",
            borderColor: "var(--md-outline-variant)",
            paddingBottom: "env(safe-area-inset-bottom, 0px)",
          }}
        >
          {bottomPrimary.map((item) => (
            <BottomTab
              key={item.to}
              item={item}
              active={loc.pathname === item.to}
            />
          ))}
          {/* More button */}
          <button
            onClick={() => setSheetOpen(true)}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-h-[56px]"
          >
            <span
              className="material-symbols-rounded"
              style={{
                fontSize: 24,
                color: !activeMain || !bottomPrimary.some((it) => loc.pathname === it.to)
                  ? "var(--md-primary)"
                  : "var(--md-on-surface-variant)",
              }}
            >
              more_horiz
            </span>
            <span
              className="text-[10.5px] font-medium tracking-tight"
              style={{
                color: !activeMain || !bottomPrimary.some((it) => loc.pathname === it.to)
                  ? "var(--md-primary)"
                  : "var(--md-on-surface-variant)",
              }}
            >
              More
            </span>
          </button>
        </nav>
      )}

      {/* ── More sheet (mobile) ────────────────────────────── */}
      <MoreSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        extraItems={sheetItems}
        role={role}
        user={user}
        theme={theme}
        onToggleTheme={toggle}
      />

      {/* ── Footer (desktop only) ────────────────────────── */}
      <footer
        className="hidden md:block border-t px-7 py-5 text-[12px] text-on-surface-variant"
        style={{ borderColor: "var(--md-outline-variant)" }}
      >
        <div className="max-w-[1100px] mx-auto flex items-start gap-2.5">
          <span className="material-symbols-rounded flex-none" style={{ fontSize: 18 }}>
            gavel
          </span>
          <span className="leading-relaxed">
            Personal automated trading account. Not investment advice. I am not a SEBI-registered
            adviser. Past performance does not guarantee future results.
          </span>
        </div>
      </footer>
    </div>
  );
}
