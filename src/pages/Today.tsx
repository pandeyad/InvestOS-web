import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";

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

      {visible.length > 0 && (
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
