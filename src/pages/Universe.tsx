import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { spark } from "@/lib/spark";

type UniverseStock = {
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
  score_date: string | null;
  in_latest_run: boolean;
};

type UniverseData = {
  run_date: string | null;
  stocks: UniverseStock[];
};

const ACTION_META: Record<string, { label: string; bg: string; fg: string; dot: string }> = {
  buy: { label: "Buy", bg: "var(--md-primary-container)", fg: "var(--md-on-primary-container)", dot: "var(--md-primary)" },
  watch: { label: "Watch", bg: "var(--md-tertiary-container)", fg: "var(--md-on-tertiary-container)", dot: "var(--md-tertiary)" },
  avoid: { label: "Skip", bg: "var(--md-surface-container-high)", fg: "var(--md-on-surface-variant)", dot: "var(--md-outline)" },
};

type VerdictFilter = "all" | "buy" | "watch" | "avoid";
type SortKey = "score" | "alpha" | "sector";

function actionKey(a: string | null): string {
  return a?.toLowerCase() ?? "avoid";
}

export function Universe() {
  const navigate = useNavigate();
  const [data, setData] = useState<UniverseData | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<VerdictFilter>("all");
  const [sector, setSector] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("score");

  useEffect(() => {
    api<UniverseData>("/public/universe")
      .then((r) => setData(r.data))
      .catch((e) => setErr(String(e)));
  }, []);

  const stocks = data?.stocks ?? [];

  const sectors = useMemo(() => {
    const set = new Set<string>();
    for (const s of stocks) if (s.sector) set.add(s.sector);
    return Array.from(set).sort();
  }, [stocks]);

  const visible = useMemo(() => {
    let list = stocks;
    if (verdict !== "all") list = list.filter((s) => actionKey(s.action) === verdict);
    if (sector !== "all") list = list.filter((s) => s.sector === sector);
    const sorted = [...list];
    if (sort === "alpha") {
      sorted.sort((a, b) => a.symbol.localeCompare(b.symbol));
    } else if (sort === "sector") {
      sorted.sort((a, b) => (a.sector ?? "~").localeCompare(b.sector ?? "~") || a.symbol.localeCompare(b.symbol));
    } else {
      sorted.sort((a, b) => (b.composite_score ?? -1) - (a.composite_score ?? -1) || a.symbol.localeCompare(b.symbol));
    }
    return sorted;
  }, [stocks, verdict, sector, sort]);

  const counts = useMemo(() => ({
    all: stocks.length,
    buy: stocks.filter((s) => actionKey(s.action) === "buy").length,
    watch: stocks.filter((s) => actionKey(s.action) === "watch").length,
  }), [stocks]);

  return (
    <div className="max-w-[1300px] mx-auto px-4 md:px-8 py-6 md:py-10 pb-28 md:pb-20 animate-view-in">
      {/* Header */}
      <div className="flex items-end justify-between gap-5 flex-wrap mb-5">
        <div>
          <h1 className="md-headline-large m-0">Universe</h1>
          <div className="flex items-center gap-3 text-on-surface-variant text-[13.5px] mt-1">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-rounded" style={{ fontSize: 16 }}>hub</span>
              {stocks.length} stocks
            </span>
            {data?.run_date && (
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-rounded" style={{ fontSize: 16 }}>check_circle</span>
                Latest run {data.run_date}
              </span>
            )}
          </div>
        </div>

        {/* Verdict filter pills */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <FilterPill value={counts.all} label="All" active={verdict === "all"} onClick={() => setVerdict("all")} />
          <FilterPill value={counts.buy} label="Buy" active={verdict === "buy"} onClick={() => setVerdict("buy")} color="var(--md-primary)" />
          <FilterPill value={counts.watch} label="Watch" active={verdict === "watch"} onClick={() => setVerdict("watch")} color="var(--md-tertiary)" />
        </div>
      </div>

      {/* Sector + sort row */}
      {stocks.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap mb-6">
          <label className="flex items-center gap-2 text-[12.5px] text-on-surface-variant">
            <span className="material-symbols-rounded" style={{ fontSize: 16 }}>category</span>
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="bg-surface-container border rounded-full px-3 py-1.5 text-[13px] text-on-surface cursor-pointer"
              style={{ borderColor: "var(--md-outline-variant)" }}
            >
              <option value="all">All sectors</option>
              {sectors.map((sec) => <option key={sec} value={sec}>{sec}</option>)}
            </select>
          </label>
          <label className="flex items-center gap-2 text-[12.5px] text-on-surface-variant">
            <span className="material-symbols-rounded" style={{ fontSize: 16 }}>sort</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="bg-surface-container border rounded-full px-3 py-1.5 text-[13px] text-on-surface cursor-pointer"
              style={{ borderColor: "var(--md-outline-variant)" }}
            >
              <option value="score">Score (high → low)</option>
              <option value="alpha">Symbol (A → Z)</option>
              <option value="sector">Sector</option>
            </select>
          </label>
          <span className="text-[12.5px] text-on-surface-variant ml-auto">{visible.length} shown</span>
        </div>
      )}

      {err && (
        <div className="rounded-2xl p-4 mb-5 text-[13.5px]"
          style={{ background: "var(--md-error-container)", color: "var(--md-on-error-container)" }}>
          {err}
        </div>
      )}

      {data === null && !err && (
        <div className="text-on-surface-variant text-[14px]">Loading…</div>
      )}

      {data && stocks.length === 0 && (
        <div className="bg-surface-container-low border rounded-2xl p-12 text-center"
          style={{ borderColor: "var(--md-outline-variant)" }}>
          <span className="material-symbols-rounded mb-3 text-on-surface-variant" style={{ fontSize: 48 }}>hub</span>
          <div className="md-title-medium mb-1">No universe yet</div>
          <div className="text-[13px] text-on-surface-variant">The premarket pipeline seeds the universe at 08:30 IST Mon–Fri</div>
        </div>
      )}

      {/* Card grid */}
      {visible.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[14px]">
          {visible.map((s, i) => (
            <UniverseCard key={s.symbol} s={s} i={i} onClick={() => navigate(`/stock/${s.symbol}?from=universe`)} />
          ))}
        </div>
      )}

      <p className="text-[11.5px] text-on-surface-variant mt-6 leading-relaxed">
        The full screened universe — every member carries its most recent analysis, even if it
        dropped out of the latest run. Tap any card for the full detail and 200-day chart.
        This is a personal trading journal — not investment advice.
      </p>
    </div>
  );
}

function FilterPill({
  value, label, active, onClick, color,
}: {
  value: number; label: string; active: boolean; onClick: () => void; color?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold transition-all cursor-pointer"
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

function UniverseCard({ s, i, onClick }: { s: UniverseStock; i: number; onClick: () => void }) {
  const meta = ACTION_META[actionKey(s.action)] ?? ACTION_META.avoid;
  const conv = s.conviction != null ? Math.round(s.conviction * 100) : null;
  return (
    <div
      onClick={onClick}
      className="cursor-pointer bg-surface-container-low border rounded-[16px] p-4 shadow-card transition-all duration-200 animate-card-in"
      style={{ borderColor: "var(--md-outline-variant)", animationDelay: `${Math.min(i, 24) * 25}ms` }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 8px 20px rgba(60,28,16,.14)";
        e.currentTarget.style.borderColor = "var(--md-primary)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "";
        e.currentTarget.style.boxShadow = "";
        e.currentTarget.style.borderColor = "var(--md-outline-variant)";
      }}
    >
      {/* Top row: symbol + verdict + freshness dot */}
      <div className="flex items-start justify-between gap-2 mb-1">
        <span className="font-mono text-[16px] font-semibold tracking-tight truncate">{s.symbol}</span>
        <div className="flex items-center gap-1.5 flex-none">
          {s.action && (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold"
              style={{ background: meta.bg, color: meta.fg }}
            >
              <span className="w-[5px] h-[5px] rounded-full" style={{ background: meta.dot }} />
              {meta.label}
            </span>
          )}
          <span
            className="w-2 h-2 rounded-full"
            title={s.in_latest_run ? "In latest run" : "From an earlier run"}
            style={{ background: s.in_latest_run ? "var(--md-success)" : "var(--md-outline-variant)" }}
          />
        </div>
      </div>

      {/* Sector / name */}
      <div className="text-[11.5px] text-on-surface-variant truncate mb-2.5">
        {s.sector ?? s.name ?? "—"}
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-3 text-[11.5px] mb-2.5">
        <span className="flex items-center gap-1">
          <span className="text-on-surface-variant">Score</span>
          <span className="font-mono font-semibold">{s.composite_score?.toFixed(0) ?? "—"}</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="text-on-surface-variant">RSI</span>
          <span className="font-mono font-semibold" style={{ color: rsiColor(s.rsi_14) }}>{s.rsi_14?.toFixed(0) ?? "—"}</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="text-on-surface-variant">Mom</span>
          <span
            className="font-mono font-semibold"
            style={{ color: s.mom_12_1 != null ? (s.mom_12_1 > 0 ? "var(--md-success)" : "var(--md-error)") : undefined }}
          >
            {s.mom_12_1 != null ? `${s.mom_12_1 > 0 ? "+" : ""}${s.mom_12_1.toFixed(0)}` : "—"}
          </span>
        </span>
      </div>

      {/* Sparkline */}
      <svg viewBox="0 0 120 32" preserveAspectRatio="none" style={{ width: "100%", height: 28, overflow: "visible" }}>
        <polyline
          points={spark(s.mom_12_1, s.rsi_14)}
          fill="none"
          stroke={s.in_latest_run ? "var(--md-primary)" : "var(--md-outline)"}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Conviction bar (only when scored as a lead) */}
      {conv != null ? (
        <div className="flex items-center gap-2 mt-2.5">
          <span className="text-[11px] text-on-surface-variant whitespace-nowrap">Conv</span>
          <div className="flex-1 h-[5px] rounded-full overflow-hidden" style={{ background: "var(--md-surface-container-high)" }}>
            <div className="h-full rounded-full" style={{ width: `${conv}%`, background: "var(--md-primary)" }} />
          </div>
          <span className="font-mono text-[11.5px] font-semibold" style={{ color: "var(--md-primary)" }}>{conv}%</span>
        </div>
      ) : (
        !s.in_latest_run && s.score_date && (
          <div className="text-[10.5px] text-on-surface-variant mt-2.5">Last analysed {s.score_date}</div>
        )
      )}
    </div>
  );
}

function rsiColor(v: number | null): string {
  if (v == null) return "var(--md-on-surface-variant)";
  if (v > 70) return "var(--md-error)";
  if (v < 40) return "var(--md-tertiary)";
  return "var(--md-on-surface)";
}
