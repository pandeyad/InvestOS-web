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

const ACTION_META: Record<string, { label: string; bg: string; fg: string; dot: string }> = {
  buy: {
    label: "Buy",
    bg: "var(--md-primary-container)",
    fg: "var(--md-on-primary-container)",
    dot: "var(--md-primary)",
  },
  watch: {
    label: "Watch",
    bg: "var(--md-tertiary-container)",
    fg: "var(--md-on-tertiary-container)",
    dot: "var(--md-tertiary)",
  },
  avoid: {
    label: "Skip",
    bg: "var(--md-surface-container-high)",
    fg: "var(--md-on-surface-variant)",
    dot: "var(--md-outline)",
  },
};

function ActionBadge({ action }: { action: string | null }) {
  const key = action?.toLowerCase() ?? "avoid";
  const meta = ACTION_META[key] ?? ACTION_META.avoid;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-semibold whitespace-nowrap"
      style={{ background: meta.bg, color: meta.fg }}
    >
      <span
        className="w-[6px] h-[6px] rounded-full flex-none"
        style={{ background: meta.dot }}
      />
      {meta.label}
    </span>
  );
}

function pct(v: number | null, sign = false) {
  if (v == null) return "—";
  return `${sign && v > 0 ? "+" : ""}${v.toFixed(1)}%`;
}

function score(v: number | null) {
  if (v == null) return "—";
  return v.toFixed(0);
}

export function Today() {
  const navigate = useNavigate();
  const [data, setData] = useState<ScreenData | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "buy" | "watch">("all");

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

  const visible = filter === "all"
    ? scores
    : scores.filter((s) => s.action === filter);

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

        {/* Summary pills */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <SummaryPill
            value={scores.length}
            label="Screened"
            active={filter === "all"}
            onClick={() => setFilter("all")}
          />
          <SummaryPill
            value={buys}
            label="Buy"
            active={filter === "buy"}
            onClick={() => setFilter("buy")}
            color="var(--md-primary)"
          />
          <SummaryPill
            value={watches}
            label="Watch"
            active={filter === "watch"}
            onClick={() => setFilter("watch")}
            color="var(--md-tertiary)"
          />
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
              <LeadCard key={s.symbol} s={s} i={i} onClick={() => navigate(`/stock/${s.symbol}`)} />
            ))}
          </div>
        </div>
      )}

      {visible.length > 0 && (
        <>
          <div className="flex items-baseline gap-2.5 mb-4">
            <h2 className="md-title-large m-0 font-medium">Universe analysis</h2>
            <span className="text-[13px] text-on-surface-variant">
              {scores.length} stocks ranked by composite score
            </span>
          </div>
        <div
          className="bg-surface-container-lowest border rounded-2xl overflow-hidden shadow-card"
          style={{ borderColor: "var(--md-outline-variant)" }}
        >
          {/* Table header */}
          <div
            className="grid text-[11.5px] font-semibold uppercase tracking-wide text-on-surface-variant px-5 py-3"
            style={{
              background: "var(--md-surface-container)",
              gridTemplateColumns: "1.6fr 1fr 70px 80px 60px 60px 80px 80px",
              gap: "12px",
            }}
          >
            <span>Stock</span>
            <span className="hidden md:block">Sector</span>
            <span className="text-center">Score</span>
            <span className="text-center">Action</span>
            <span className="hidden sm:block text-right">RSI</span>
            <span className="hidden sm:block text-right">Mom 12M</span>
            <span className="hidden lg:block text-right">Stop %</span>
            <span className="hidden lg:block text-right">Target %</span>
          </div>

          {visible.map((s, i) => {
            const isBuy = s.action === "buy";
            return (
              <div
                key={s.symbol}
                className="grid px-5 py-3.5 border-t items-center cursor-pointer animate-row-in transition-colors"
                style={{
                  borderColor: "var(--md-outline-variant)",
                  animationDelay: `${i * 25}ms`,
                  gridTemplateColumns: "1.6fr 1fr 70px 80px 60px 60px 80px 80px",
                  gap: "12px",
                  background: isBuy ? "color-mix(in srgb, var(--md-primary-container) 18%, transparent)" : "transparent",
                }}
                onClick={() => navigate(`/stock/${s.symbol}`)}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--md-surface-container)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = isBuy ? "color-mix(in srgb, var(--md-primary-container) 18%, transparent)" : "transparent")}
              >
                {/* Stock */}
                <div className="min-w-0">
                  <div className="font-mono text-[15px] font-semibold leading-tight">{s.symbol}</div>
                  <div className="text-[11.5px] text-on-surface-variant truncate mt-0.5">
                    {s.name ?? ""}
                  </div>
                </div>

                {/* Sector */}
                <div className="hidden md:block text-[12.5px] text-on-surface-variant truncate">
                  {s.sector ?? "—"}
                </div>

                {/* Score */}
                <div className="text-center">
                  <span
                    className="inline-block font-mono text-[13px] font-semibold px-2 py-0.5 rounded-lg"
                    style={{
                      background: scoreColor(s.composite_score),
                      color: "var(--md-on-surface)",
                    }}
                  >
                    {score(s.composite_score)}
                  </span>
                </div>

                {/* Action badge */}
                <div className="text-center">
                  <ActionBadge action={s.action} />
                </div>

                {/* RSI */}
                <div
                  className="hidden sm:block text-right font-mono text-[13px]"
                  style={{ color: rsiColor(s.rsi_14) }}
                >
                  {s.rsi_14?.toFixed(0) ?? "—"}
                </div>

                {/* 12M Mom */}
                <div
                  className="hidden sm:block text-right font-mono text-[13px]"
                  style={{ color: s.mom_12_1 != null ? (s.mom_12_1 > 0 ? "var(--md-success)" : "var(--md-error)") : undefined }}
                >
                  {pct(s.mom_12_1, true)}
                </div>

                {/* Stop % */}
                <div className="hidden lg:block text-right font-mono text-[13px]" style={{ color: "var(--md-error)" }}>
                  {isBuy ? pct(s.stop_pct) : "—"}
                </div>

                {/* Target % */}
                <div className="hidden lg:block text-right font-mono text-[13px]" style={{ color: "var(--md-success)" }}>
                  {isBuy ? pct(s.target_pct, true) : "—"}
                </div>
              </div>
            );
          })}
        </div>
        </>
      )}

      <p className="text-[11.5px] text-on-surface-variant mt-5 leading-relaxed">
        Tap any row to see the full analysis, 200-day chart, and rationale.
        This is a personal trading journal — not investment advice.
      </p>
    </div>
  );
}

function SummaryPill({
  value, label, active, onClick, color,
}: {
  value: number; label: string; active: boolean; onClick: () => void; color?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold transition-all"
      style={
        active
          ? { background: "var(--md-primary)", color: "var(--md-on-primary)" }
          : { background: "var(--md-surface-container)", color: color ?? "var(--md-on-surface-variant)" }
      }
    >
      <span className="font-mono text-[15px]">{value}</span>
      {label}
    </button>
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
          <div className="text-[12.5px] text-on-surface-variant mt-0.5">{s.sector ?? "—"}</div>
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

function scoreColor(v: number | null): string {
  if (v == null) return "var(--md-surface-container-high)";
  if (v >= 70) return "color-mix(in srgb, var(--md-primary-container) 80%, transparent)";
  if (v >= 50) return "var(--md-surface-container-high)";
  return "var(--md-surface-container-high)";
}

function rsiColor(v: number | null): string {
  if (v == null) return "var(--md-on-surface-variant)";
  if (v > 70) return "var(--md-error)";
  if (v < 40) return "var(--md-tertiary)";
  return "var(--md-on-surface)";
}
