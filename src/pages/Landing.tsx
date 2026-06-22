import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { loginUrl } from "@/lib/api";
import { Disclaimer } from "@/components/Disclaimer";

function FeatureCard({
  icon,
  containerColor,
  containerFg,
  title,
  body,
  delay,
}: {
  icon: string;
  containerColor: string;
  containerFg: string;
  title: string;
  body: string;
  delay: number;
}) {
  return (
    <div
      className="bg-surface-container-low border rounded-2xl p-6 shadow-card animate-card-in"
      style={{
        borderColor: "var(--md-outline-variant)",
        animationDelay: `${delay}ms`,
      }}
    >
      <span
        className="grid place-items-center w-11 h-11 rounded-xl mb-3.5"
        style={{ background: containerColor, color: containerFg }}
      >
        <span className="material-symbols-rounded">{icon}</span>
      </span>
      <div className="md-title-medium mb-1.5">{title}</div>
      <p className="md-body-medium m-0 text-on-surface-variant">{body}</p>
    </div>
  );
}

function Stat({ value, label, accent }: { value: string; label: string; accent?: boolean }) {
  return (
    <div>
      <div className="md-display-small" style={accent ? { color: "var(--md-primary)" } : undefined}>
        {value}
      </div>
      <div className="md-label-large text-on-surface-variant">{label}</div>
    </div>
  );
}

export function Landing() {
  const { user, loading } = useAuth();
  if (!loading && user) return <Navigate to="/today" replace />;

  return (
    <div className="relative overflow-hidden animate-view-in">
      {/* radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(900px 480px at 78% -8%, rgba(168,58,29,0.13), transparent 60%)",
        }}
      />

      <div className="relative max-w-[1100px] mx-auto px-8 pt-20 pb-10">
        <div
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-[13px] font-medium text-on-surface-variant mb-6"
          style={{
            background: "var(--md-surface-container)",
            borderColor: "var(--md-outline-variant)",
          }}
        >
          <span
            className="material-symbols-rounded"
            style={{ fontSize: 17, color: "var(--md-primary)" }}
          >
            trending_up
          </span>
          NIFTY-100 equity rotation
        </div>

        <h1
          className="md-display-large m-0 max-w-[18ch]"
          style={{ letterSpacing: "-1px", fontWeight: 500 }}
        >
          What I'm buying today{" "}
          <span style={{ color: "var(--md-primary)" }}>— and why.</span>
        </h1>

        <p className="md-body-large max-w-[60ch] my-6 text-on-surface-variant">
          A transparent record of every trade my system takes. Picks made pre-market, placed at the
          open, exits managed by trailing stops. Sign in to follow along — the same trades, the same
          reasoning, the full track record.
        </p>

        <div className="flex items-center gap-5 flex-wrap">
          <a
            href={loginUrl("/today")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-on-primary font-medium text-[15px] hover:brightness-105 transition-all"
            style={{ background: "var(--md-primary)" }}
          >
            <span className="material-symbols-rounded">login</span>
            Sign in with Google
          </a>
          <span className="text-[13.5px] text-on-surface-variant">
            It's free to follow along · no advice, just my journal
          </span>
        </div>
      </div>

      {/* feature cards */}
      <div className="relative max-w-[1100px] mx-auto px-8 pt-6 grid grid-cols-1 md:grid-cols-3 gap-4.5" style={{ gap: 18 }}>
        <FeatureCard
          icon="filter_alt"
          containerColor="var(--md-primary-container)"
          containerFg="var(--md-on-primary-container)"
          title="Pre-market funnel"
          body="A deterministic screen ranks the universe to a shortlist, then reasoning picks the day's leads at 08:30."
          delay={60}
        />
        <FeatureCard
          icon="stairs"
          containerColor="var(--md-tertiary-container)"
          containerFg="var(--md-on-tertiary-container)"
          title="Trailing-stop exits"
          body="Positions ride a chase loop intraday — stops trail winners and cut losers mechanically, no second-guessing."
          delay={140}
        />
        <FeatureCard
          icon="history_edu"
          containerColor="var(--md-secondary-container)"
          containerFg="var(--md-on-secondary-container)"
          title="Honest track record"
          body="Wins and losses, hold times, and the lessons distilled from closed trades — nothing cherry-picked."
          delay={220}
        />
      </div>

      {/* stats strip */}
      <div className="relative max-w-[1100px] mx-auto mt-9 px-8">
        <div
          className="flex flex-wrap gap-10 px-8 py-7 rounded-2xl border bg-surface-container"
          style={{ borderColor: "var(--md-outline-variant)" }}
        >
          <Stat value="—" label="Win rate" accent />
          <div className="w-px self-stretch" style={{ background: "var(--md-outline-variant)" }} />
          <Stat value="—" label="Trades logged" />
          <div className="w-px self-stretch" style={{ background: "var(--md-outline-variant)" }} />
          <Stat value="—" label="Avg return" />
          <div className="w-px self-stretch" style={{ background: "var(--md-outline-variant)" }} />
          <Stat value="—" label="Avg hold" />
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto mt-6 px-8 pb-16">
        <Disclaimer />
      </div>
    </div>
  );
}
