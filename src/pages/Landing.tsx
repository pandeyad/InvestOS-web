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

function StepCard({
  step,
  icon,
  time,
  title,
  body,
  delay,
}: {
  step: number;
  icon: string;
  time: string;
  title: string;
  body: string;
  delay: number;
}) {
  return (
    <div
      className="relative bg-surface-container-low border rounded-2xl p-6 animate-card-in"
      style={{ borderColor: "var(--md-outline-variant)", animationDelay: `${delay}ms` }}
    >
      <div
        className="absolute -top-3 left-5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-widest"
        style={{ background: "var(--md-primary)", color: "var(--md-on-primary)" }}
      >
        STEP {step}
      </div>
      <div className="flex items-center gap-3 mt-2 mb-3">
        <span
          className="grid place-items-center w-10 h-10 rounded-xl flex-none"
          style={{
            background: "var(--md-primary-container)",
            color: "var(--md-on-primary-container)",
          }}
        >
          <span className="material-symbols-rounded">{icon}</span>
        </span>
        <div>
          <div className="md-title-small font-semibold">{title}</div>
          <div
            className="text-[11.5px] font-mono font-medium"
            style={{ color: "var(--md-primary)" }}
          >
            {time}
          </div>
        </div>
      </div>
      <p className="md-body-medium m-0 text-on-surface-variant">{body}</p>
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
      <div className="relative max-w-[1100px] mx-auto px-8 pt-20 pb-12">
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
          className="md-display-large m-0 mb-5"
          style={{ letterSpacing: "-1px", fontWeight: 500, maxWidth: "18ch" }}
        >
          My market picks —{" "}
          <span style={{ color: "var(--md-primary)" }}>open for anyone to follow.</span>
        </h1>

        <p
          className="md-body-large m-0 mb-8 text-on-surface-variant"
          style={{ maxWidth: "58ch", lineHeight: 1.7 }}
        >
          Every morning a quantitative screen + reasoning layer picks from a universe of
          300+ NSE equities (NIFTY 200, Midcap 100) and index ETFs. Orders go in at the
          open. Trailing stops manage the exit. You see every pick, every outcome, the full
          track record — nothing cherry-picked.
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
          <a
            href="/about"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-[14px] font-medium text-on-surface-variant hover:bg-surface-container-high transition-colors border"
            style={{ borderColor: "var(--md-outline-variant)" }}
          >
            How it works
            <span className="material-symbols-rounded" style={{ fontSize: 18 }}>
              arrow_forward
            </span>
          </a>
        </div>
      </div>

      {/* Stats strip */}
      <div className="relative max-w-[1100px] mx-auto px-8 mb-10">
        <div
          className="flex flex-wrap divide-x rounded-2xl border overflow-hidden bg-surface-container"
          style={{
            borderColor: "var(--md-outline-variant)",
            divideColor: "var(--md-outline-variant)",
          }}
        >
          <StatPill label="Win rate" value="—" />
          <StatPill label="Closed trades" value="—" />
          <StatPill label="Avg return" value="—%" />
          <StatPill label="Avg hold" value="— days" />
          <StatPill label="Running since" value="Jun '26" />
        </div>
      </div>

      {/* How it works */}
      <div className="relative max-w-[1100px] mx-auto px-8 pb-4">
        <h2
          className="md-title-large mb-6"
          style={{ fontWeight: 500, color: "var(--md-on-surface-variant)" }}
        >
          The system, step by step
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StepCard
            step={1}
            icon="filter_alt"
            time="08:30 IST"
            title="Quantitative screen"
            body="A 6-factor ranker filters a universe of 300+ NSE equities and ETFs (NIFTY 200, Midcap 100, index ETFs). Momentum, trend, volatility-adjusted return, and regime filter cut it to a shortlist of 10–15."
            delay={60}
          />
          <StepCard
            step={2}
            icon="psychology"
            time="09:00 IST"
            title="Reasoning layer picks"
            body="An LLM reads fundamentals, FII/DII flows, and overnight signals on the shortlist. It scores each stock and selects the day's picks with a written rationale."
            delay={140}
          />
          <StepCard
            step={3}
            icon="sensors"
            time="09:15–15:30"
            title="Trailing-stop exits"
            body="Orders go in at the open. A chase loop monitors intraday prices — trailing the stop as the stock moves up, cutting if it falls. No manual intervention."
            delay={220}
          />
        </div>
      </div>

      {/* Disclaimer */}
      <div className="relative max-w-[1100px] mx-auto px-8 py-8 mt-4">
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
