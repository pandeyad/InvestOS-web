import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { loginUrl } from "@/lib/api";

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center px-6 py-4">
      <span
        className="text-[26px] font-bold font-mono tracking-tight"
        style={{ color: "var(--md-primary)" }}
      >
        {value}
      </span>
      <span className="text-[12px] text-on-surface-variant mt-0.5">{label}</span>
    </div>
  );
}

export function Landing() {
  const { user, loading } = useAuth();
  if (!loading && user) return <Navigate to="/today" replace />;

  return (
    <div className="relative overflow-hidden animate-view-in">
      {/* ember glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(900px 500px at 75% -5%, rgba(168,58,29,0.14), transparent 65%)",
        }}
      />

      {/* Hero */}
      <div className="relative max-w-[1100px] mx-auto px-4 sm:px-6 md:px-8 pt-20 pb-12">
        <div
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-[12.5px] font-semibold tracking-wide mb-6"
          style={{
            background: "var(--md-surface-container)",
            borderColor: "var(--md-outline-variant)",
            color: "var(--md-primary)",
          }}
        >
          <span className="w-2 h-2 rounded-full animate-pulse-dot" style={{ background: "var(--md-success)" }} />
          NSE equities · ETFs · automated · live
        </div>

        <h1
          className="md-display-large m-0 mb-5 max-w-[22ch] sm:max-w-[18ch]"
          style={{ letterSpacing: "-1px", fontWeight: 500 }}
        >
          My market picks —{" "}
          <span style={{ color: "var(--md-primary)" }}>open for anyone to follow.</span>
        </h1>

        <p
          className="md-body-large m-0 mb-8 text-on-surface-variant"
          style={{ maxWidth: "58ch", lineHeight: 1.7 }}
        >
          Every morning a quantitative screen picks from a universe of 300+ NSE equities
          (NIFTY 200, Midcap 100) and index ETFs. Orders go in at the open. You see every
          pick, every outcome, the full track record — nothing cherry-picked.
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <a
            href={loginUrl("/today")}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-[15px] text-on-primary hover:brightness-105 transition-all shadow-md"
            style={{ background: "var(--md-primary)" }}
          >
            <span className="material-symbols-rounded">login</span>
            Sign in to follow
          </a>
        </div>
      </div>

      {/* Stats strip */}
      <div className="relative max-w-[1100px] mx-auto px-4 sm:px-6 md:px-8 mb-10">
        <div
          className="flex flex-wrap divide-x rounded-2xl border overflow-hidden bg-surface-container"
          style={{ borderColor: "var(--md-outline-variant)" }}
        >
          <StatPill label="Win rate" value="—" />
          <StatPill label="Closed trades" value="—" />
          <StatPill label="Avg return" value="—%" />
          <StatPill label="Avg hold" value="— days" />
          <StatPill label="Running since" value="Jun '26" />
        </div>
      </div>

      {/* Feature cards */}
      <div className="relative max-w-[1100px] mx-auto px-4 sm:px-6 md:px-8 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[18px]">
          {[
            {
              icon: "filter_alt",
              bg: "var(--md-primary-container)",
              fg: "var(--md-on-primary-container)",
              title: "Pre-market funnel",
              desc: "A deterministic screen ranks the universe to a shortlist, then reasoning picks the day's leads at 08:30.",
              delay: "60ms",
            },
            {
              icon: "stairs",
              bg: "var(--md-tertiary-container)",
              fg: "var(--md-on-tertiary-container)",
              title: "Trailing-stop exits",
              desc: "Positions ride a chase loop intraday — stops trail winners and cut losers mechanically, no second-guessing.",
              delay: "140ms",
            },
            {
              icon: "history_edu",
              bg: "var(--md-secondary-container)",
              fg: "var(--md-on-secondary-container)",
              title: "Honest track record",
              desc: "Wins and losses, hold times, and the lessons distilled from closed trades — nothing cherry-picked.",
              delay: "220ms",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="bg-surface-container-low border rounded-[18px] p-6 shadow-card animate-card-in"
              style={{ borderColor: "var(--md-outline-variant)", animationDelay: f.delay }}
            >
              <span
                className="grid place-items-center w-11 h-11 rounded-[13px] mb-3.5"
                style={{ background: f.bg, color: f.fg }}
              >
                <span className="material-symbols-rounded">{f.icon}</span>
              </span>
              <div className="md-title-medium mb-1.5">{f.title}</div>
              <p className="md-body-medium m-0 text-on-surface-variant leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="relative max-w-[1100px] mx-auto px-4 sm:px-6 md:px-8 py-8 mt-4">
        <p
          className="text-[12px] text-on-surface-variant leading-relaxed"
          style={{ maxWidth: "72ch" }}
        >
          <span className="material-symbols-rounded align-text-bottom mr-1" style={{ fontSize: 15 }}>
            gavel
          </span>
          This is a personal automated trading system. I am not a SEBI-registered investment
          adviser. Nothing here is a recommendation. Past performance does not guarantee future
          results. Act on this at your own risk.
        </p>
      </div>
    </div>
  );
}
