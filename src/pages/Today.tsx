import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { spark } from "@/lib/spark";

type StockScore = {
  symbol: string;
  name: string | null;
  sector: string | null;
  composite_score: number | null;
  pctile_rank: number | null;
  rsi_14: number | null;
  mom_12_1: number | null;
  mom_3m: number | null;
  pe: number | null;
  roe: number | null;
  action: string | null; // "buy" | "watch" | "avoid" | null
  conviction: number | null;
  rationale: string | null;
  entry_price: number | null;
  stop_price: number | null;
  target_price: number | null;
  stop_pct: number | null;
  target_pct: number | null;
  lead_status: string | null;
};

type ScreenData = {
  run_date: string | null;
  scores: StockScore[];
};

const STATUS_STYLES: Record<string, { bg: string; fg: string; label: string }> = {
  placed: { bg: "var(--md-primary-container)", fg: "var(--md-on-primary-container)", label: "Placed" },
  filled: { bg: "var(--md-success-container)", fg: "var(--md-success)", label: "Filled" },
  rejected: { bg: "var(--md-error-container)", fg: "var(--md-on-error-container)", label: "Rejected" },
  cancelled: { bg: "var(--md-surface-container-high)", fg: "var(--md-on-surface-variant)", label: "Cancelled" },
  pending: { bg: "var(--md-secondary-container)", fg: "var(--md-on-secondary-container)", label: "Pending" },
};

export function Today() {
  const navigate = useNavigate();
  const [data, setData] = useState<ScreenData | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    api<ScreenData>("/public/screen/today")
      .then((r) => setData(r.data))
      .catch((e) => setErr(String(e)));
  }, []);

  const dateStr = new Date().toLocaleDateString("en-IN", {
    weekday: "long", month: "long", day: "numeric",
  });

  const scores = data?.scores ?? [];
  const buys = scores.filter((s) => s.action === "buy").length;
  const watches = scores.filter((s) => s.action === "watch").length;

  const leads = scores.filter((s) => s.action === "buy");

  const runDate = data?.run_date;
  const isStale = runDate && runDate < new Date().toISOString().slice(0, 10);

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-6 md:py-10 pb-28 md:pb-20 animate-view-in">
      {/* Header */}
      <div className="flex items-end justify-between gap-5 flex-wrap mb-5">
        <div>
          <h1 className="md-headline-large m-0">Today's screen</h1>
          <div className="flex items-center gap-3 text-on-surface-variant text-[13.5px] mt-1">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-rounded" style={{ fontSize: 16 }}>calendar_today</span>
              {dateStr}
            </span>
            {runDate && (
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-rounded" style={{ fontSize: 16 }}>
                  {isStale ? "history" : "check_circle"}
                </span>
                {isStale ? `Last run ${runDate}` : `Run ${runDate}`}
              </span>
            )}
          </div>
        </div>

        {/* Summary counts + link to the full universe */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <SummaryPill value={buys} label="Buy" color="var(--md-primary)" />
          <SummaryPill value={watches} label="Watch" color="var(--md-tertiary)" />
          <button
            onClick={() => navigate("/universe")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-semibold transition-all hover:brightness-105"
            style={{ background: "var(--md-secondary-container)", color: "var(--md-on-secondary-container)" }}
          >
            Browse universe
            <span className="material-symbols-rounded" style={{ fontSize: 17 }}>arrow_forward</span>
          </button>
        </div>
      </div>

      {err && (
        <div className="rounded-2xl p-4 mb-5 text-[13.5px]"
          style={{ background: "var(--md-error-container)", color: "var(--md-on-error-container)" }}>
          {err}
        </div>
      )}

      {data === null && !err && (
        <div className="text-on-surface-variant text-[14px]">Loading…</div>
      )}

      {data && scores.length === 0 && (
        <EmptyState
          icon="search_off"
          title="No screen data yet"
          subtitle="The premarket pipeline runs at 08:30 IST Mon–Fri"
        />
      )}

      {/* Lead cards */}
      {leads.length > 0 && (
        <div className="mb-8">
          <h2 className="md-title-large m-0 mb-4 font-medium">Today's picks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[18px]">
            {leads.map((s, i) => (
              <LeadCard key={s.symbol} s={s} i={i} onClick={() => navigate(`/stock/${s.symbol}?from=today`)} />
            ))}
          </div>
        </div>
      )}

      {leads.length === 0 && scores.length > 0 && (
        <div
          className="bg-surface-container-lowest border rounded-2xl p-8 text-center"
          style={{ borderColor: "var(--md-outline-variant)" }}
        >
          <div className="md-title-medium mb-1">No buy signals today</div>
          <div className="text-[13px] text-on-surface-variant mb-4 max-w-md mx-auto">
            The screen ran but flagged nothing as a buy. Browse the full ranked
            universe to see everything it looked at.
          </div>
          <button
            onClick={() => navigate("/universe")}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-semibold"
            style={{ background: "var(--md-secondary-container)", color: "var(--md-on-secondary-container)" }}
          >
            Browse universe
            <span className="material-symbols-rounded" style={{ fontSize: 17 }}>arrow_forward</span>
          </button>
        </div>
      )}

      <p className="text-[11.5px] text-on-surface-variant mt-5 leading-relaxed">
        Tap any pick to see the full analysis, 200-day chart, and rationale.
        This is a personal trading journal — not investment advice.
      </p>
    </div>
  );
}

function SummaryPill({ value, label, color }: { value: number; label: string; color?: string }) {
  return (
    <span
      className="flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold"
      style={{ background: "var(--md-surface-container)", color: color ?? "var(--md-on-surface-variant)" }}
    >
      <span className="font-mono text-[15px]">{value}</span>
      {label}
    </span>
  );
}

function LeadCard({ s, i, onClick }: { s: StockScore; i: number; onClick: () => void }) {
  const conv = s.conviction != null ? Math.round(s.conviction * 100) : null;
  const statusStyle = s.lead_status ? (STATUS_STYLES[s.lead_status] ?? null) : null;
  return (
    <div
      onClick={onClick}
      className="cursor-pointer bg-surface-container-low border rounded-[18px] p-[22px] shadow-card transition-all duration-250 animate-card-in"
      style={{ borderColor: "var(--md-outline-variant)", animationDelay: `${i * 60}ms` }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = "0 10px 24px rgba(60,28,16,.16)";
        e.currentTarget.style.borderColor = "var(--md-primary)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "";
        e.currentTarget.style.boxShadow = "";
        e.currentTarget.style.borderColor = "var(--md-outline-variant)";
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-3.5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-[21px] font-medium tracking-tight">{s.symbol}</span>
            <span
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
              style={{ background: "var(--md-surface-container-high)", color: "var(--md-on-surface-variant)" }}
            >
              <span className="material-symbols-rounded" style={{ fontSize: 13 }}>north_east</span>Long
            </span>
          </div>
          <div className="text-[12.5px] text-on-surface-variant mt-0.5 flex items-center gap-2">
            <span>{s.sector ?? "—"}</span>
            {s.pe != null && <span className="opacity-70">· PE {s.pe.toFixed(0)}</span>}
            {s.roe != null && <span className="opacity-70">· ROE {s.roe.toFixed(0)}%</span>}
          </div>
        </div>
        {statusStyle && (
          <span className="px-3 py-1 rounded-full text-[12px] font-semibold flex-none"
            style={{ background: statusStyle.bg, color: statusStyle.fg }}>
            {statusStyle.label}
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2.5 mb-4">
        <div className="text-center px-2 py-2.5 rounded-xl" style={{ background: "var(--md-surface-container-high)" }}>
          <div className="text-[11px] text-on-surface-variant mb-1">Entry</div>
          <div className="font-mono text-[14px] font-medium">{s.entry_price != null ? `₹${s.entry_price.toFixed(0)}` : "—"}</div>
        </div>
        <div className="text-center px-2 py-2.5 rounded-xl" style={{ background: "var(--md-surface-container-high)" }}>
          <div className="text-[11px] text-on-surface-variant mb-1">Stop</div>
          <div className="font-mono text-[14px] font-medium" style={{ color: "var(--md-error)" }}>{s.stop_price != null ? `₹${s.stop_price.toFixed(0)}` : "—"}</div>
          <div className="font-mono text-[11px]" style={{ color: "var(--md-error)" }}>{s.stop_pct != null ? `${s.stop_pct.toFixed(1)}%` : ""}</div>
        </div>
        <div className="text-center px-2 py-2.5 rounded-xl" style={{ background: "var(--md-surface-container-high)" }}>
          <div className="text-[11px] text-on-surface-variant mb-1">Target</div>
          <div className="font-mono text-[14px] font-medium" style={{ color: "var(--md-success)" }}>{s.target_price != null ? `₹${s.target_price.toFixed(0)}` : "—"}</div>
          <div className="font-mono text-[11px]" style={{ color: "var(--md-success)" }}>{s.target_pct != null ? `+${s.target_pct.toFixed(1)}%` : ""}</div>
        </div>
      </div>

      {(s.lead_status === "placed" || s.lead_status === "filled") && (
        <div className="flex items-center gap-1.5 mb-3.5 px-3 py-2 rounded-xl text-[12px] font-medium"
          style={{ background: "var(--md-success-container)", color: "var(--md-success)" }}>
          <span className="material-symbols-rounded" style={{ fontSize: 16 }}>verified_user</span>
          Order {s.lead_status} · stop-loss &amp; target GTT active
        </div>
      )}

      <div className="flex items-center gap-2.5 mb-3.5">
        <span className="text-[12px] text-on-surface-variant whitespace-nowrap">Conviction</span>
        <div className="flex-1 h-[7px] rounded-full overflow-hidden" style={{ background: "var(--md-surface-container-high)" }}>
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${conv ?? 0}%`, background: "var(--md-primary)" }} />
        </div>
        <span className="font-mono text-[13px] font-semibold" style={{ color: "var(--md-primary)" }}>{conv != null ? `${conv}%` : "—"}</span>
      </div>

      {s.rationale && (
        <p className="text-[13px] leading-[1.55] text-on-surface-variant mb-3.5 line-clamp-3 m-0">{s.rationale}</p>
      )}

      <div className="flex items-center gap-3 pt-3.5 border-t" style={{ borderColor: "var(--md-outline-variant)" }}>
        <svg viewBox="0 0 120 32" preserveAspectRatio="none" style={{ width: 120, height: 32, flexShrink: 0, overflow: "visible" }}>
          <polyline points={spark(s.mom_12_1, s.rsi_14)} fill="none" stroke="var(--md-primary)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-[12px] text-on-surface-variant">20-day trend</span>
        <span className="ml-auto inline-flex items-center gap-1 text-[12.5px] font-semibold" style={{ color: "var(--md-primary)" }}>
          Details<span className="material-symbols-rounded" style={{ fontSize: 16 }}>arrow_forward</span>
        </span>
      </div>
    </div>
  );
}

function EmptyState({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) {
  return (
    <div
      className="bg-surface-container-low border rounded-2xl p-12 text-center"
      style={{ borderColor: "var(--md-outline-variant)" }}
    >
      <span className="material-symbols-rounded mb-3 text-on-surface-variant" style={{ fontSize: 48 }}>
        {icon}
      </span>
      <div className="md-title-medium mb-1">{title}</div>
      <div className="text-[13px] text-on-surface-variant">{subtitle}</div>
    </div>
  );
}

