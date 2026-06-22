function TechRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="flex items-start gap-3 py-3 border-b last:border-0"
      style={{ borderColor: "var(--md-outline-variant)" }}
    >
      <span className="text-[12.5px] font-semibold text-on-surface-variant flex-none w-36 pt-0.5">
        {label}
      </span>
      <span className="md-body-medium text-on-surface flex-1">{value}</span>
    </div>
  );
}

function FactCard({
  icon,
  title,
  body,
}: {
  icon: string;
  title: string;
  body: string;
}) {
  return (
    <div
      className="bg-surface-container-low border rounded-2xl p-5"
      style={{ borderColor: "var(--md-outline-variant)" }}
    >
      <span
        className="inline-grid place-items-center w-10 h-10 rounded-xl mb-3"
        style={{
          background: "var(--md-primary-container)",
          color: "var(--md-on-primary-container)",
        }}
      >
        <span className="material-symbols-rounded">{icon}</span>
      </span>
      <div className="md-title-small font-semibold mb-1">{title}</div>
      <p className="md-body-medium m-0 text-on-surface-variant">{body}</p>
    </div>
  );
}

export function About() {
  return (
    <div className="max-w-[860px] mx-auto px-8 py-10 pb-20 animate-view-in">
      <h1 className="md-headline-large m-0 mb-5">About</h1>

      {/* What this is */}
      <p className="md-body-large m-0 mb-4" style={{ lineHeight: 1.7 }}>
        I built a fully automated equity system that runs premarket across 300+ NSE
        equities (NIFTY 200, Midcap 100, index ETFs), picks stocks, places orders at the
        open, and manages exits with trailing stop-loss GTTs — all without manual
        intervention. This site publishes every pick I take and its outcome, in real time.
      </p>
      <p className="md-body-large m-0 mb-8 text-on-surface-variant" style={{ lineHeight: 1.7 }}>
        The system is not a newsletter, not a Telegram group, not a "course". It's an
        autonomous quant pipeline that I happen to make public.
      </p>

      {/* What was built */}
      <h2 className="md-title-large mb-4" style={{ fontWeight: 500 }}>
        What's under the hood
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <FactCard
          icon="filter_alt"
          title="6-factor quantitative ranker"
          body="Momentum, trend strength, volatility-adjusted return, price vs. 52-week high, volume profile, and a regime filter cut a 300+ symbol universe (NIFTY 200 + Midcap 100 + ETFs) to a 10–15 stock shortlist every morning."
        />
        <FactCard
          icon="psychology"
          title="LLM reasoning layer"
          body="An LLM reads fundamentals (PE/ROE/D-E from Screener), FII/DII flows, MMI sentiment, and overnight global signals on the shortlist. It scores each stock 0–100 with a written rationale and selects the day's picks."
        />
        <FactCard
          icon="account_tree"
          title="Broker integration"
          body="Orders go through Kite Connect (Zerodha). GTTs are placed immediately on fill — every holding has an active trailing stop-loss at all times. Reconciliation runs every 2 minutes during market hours."
        />
        <FactCard
          icon="model_training"
          title="Self-improving feedback loop"
          body="Every closed trade generates an LLM post-mortem. After every 10 post-mortems, the system consolidates the lessons into a rulebook that gets injected into the next premarket screen. The system learns from its own mistakes."
        />
      </div>

      {/* Tech stack */}
      <h2 className="md-title-large mb-4" style={{ fontWeight: 500 }}>
        Technology
      </h2>
      <div
        className="bg-surface-container-low border rounded-2xl px-5 mb-8"
        style={{ borderColor: "var(--md-outline-variant)" }}
      >
        <TechRow label="Backend" value="Python · FastAPI · SQLAlchemy async · SQLite" />
        <TechRow label="Scheduling" value="APScheduler · Asia/Kolkata timezone" />
        <TechRow label="Market data" value="NSE bhavcopy · NSE indices archive · Screener.in · Tickertape" />
        <TechRow label="Broker" value="Kite Connect (Zerodha) · KiteConnect Python SDK" />
        <TechRow label="LLM" value="Gemini (default) · Claude · provider-agnostic CLI router" />
        <TechRow label="Frontend" value="React 19 · Vite · Tailwind · react-router-dom v7" />
        <TechRow label="Auth" value="Google OAuth 2.0 · HttpOnly cookies · no stored passwords" />
        <TechRow label="Hosting" value="Vercel (frontend) · VPS Mumbai (backend) · DuckDNS + Caddy" />
      </div>

      {/* GitHub */}
      <h2 className="md-title-large mb-3" style={{ fontWeight: 500 }}>
        Source code
      </h2>
      <a
        href="https://github.com/pandeyad/InvestOS-web"
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl border font-medium text-[14px] transition-colors hover:bg-surface-container-high mb-8"
        style={{ borderColor: "var(--md-outline-variant)" }}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
        </svg>
        pandeyad/InvestOS-web
        <span className="material-symbols-rounded" style={{ fontSize: 16, color: "var(--md-on-surface-variant)" }}>
          open_in_new
        </span>
      </a>

      {/* Disclaimer */}
      <div
        className="flex items-start gap-3 px-5 py-4 rounded-xl border text-[12.5px] text-on-surface-variant"
        style={{ borderColor: "var(--md-outline-variant)", background: "var(--md-surface-container)" }}
      >
        <span className="material-symbols-rounded flex-none mt-0.5" style={{ fontSize: 18 }}>
          gavel
        </span>
        <p className="m-0 leading-relaxed">
          I am not a SEBI-registered investment adviser or research analyst. Nothing published here
          is a recommendation. I show my own trades — what I actually do with my own money. If you
          choose to follow along, the decisions and the risk are entirely yours.
        </p>
      </div>
    </div>
  );
}
