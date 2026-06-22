import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type PerStock = {
  symbol: string;
  trades: number;
  wins: number;
  losses: number;
  win_rate: number | null;
  avg_return_pct: number | null;
  best_return_pct: number | null;
  worst_return_pct: number | null;
};

type Aggregate = {
  lead_count: number;
  closed_count: number;
  win_rate: number | null;
  avg_return_pct: number | null;
  best_return_pct: number | null;
  worst_return_pct: number | null;
  max_drawdown_pct: number | null;
  avg_hold_days: number | null;
};

function Gauge({ pct, accent }: { pct: number | null; accent: string }) {
  const radius = 54;
  const circ = 2 * Math.PI * radius;
  const offset = pct == null ? circ : circ - (Math.max(0, Math.min(100, pct)) / 100) * circ;
  return (
    <div className="relative" style={{ width: 160, height: 160 }}>
      <svg width="160" height="160" viewBox="0 0 140 140" style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="var(--md-surface-container-highest)"
          strokeWidth="13"
        />
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke={accent}
          strokeWidth="13"
          strokeLinecap="round"
          style={{
            strokeDasharray: circ,
            strokeDashoffset: offset,
            transition: "stroke-dashoffset 1.25s cubic-bezier(.2,.8,.2,1)",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="md-display-small font-semibold"
          style={{ color: accent }}
        >
          {pct != null ? `${pct.toFixed(1)}%` : "—"}
        </span>
      </div>
    </div>
  );
}

function StatTile({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div
      className="bg-surface-container-low border rounded-xl p-4.5"
      style={{ borderColor: "var(--md-outline-variant)", padding: 18 }}
    >
      <div className="text-[12px] text-on-surface-variant mb-1.5">{label}</div>
      <span
        className="md-headline-medium font-medium"
        style={color ? { color, fontSize: 28 } : { fontSize: 28 }}
      >
        {value}
      </span>
    </div>
  );
}

export function Leaderboard() {
  const [perStock, setPerStock] = useState<PerStock[] | null>(null);
  const [agg, setAgg] = useState<Aggregate | null>(null);

  useEffect(() => {
    api<PerStock[]>("/public/leaderboard/per-stock").then((r) => setPerStock(r.data));
    api<Aggregate>("/public/leaderboard/aggregate").then((r) => setAgg(r.data));
  }, []);

  const accent = "var(--md-primary)";
  const gain = "var(--md-success)";
  const loss = "var(--md-error)";
  const fmtPct = (v: number | null, sign?: boolean) =>
    v == null ? "—" : `${sign && v > 0 ? "+" : ""}${v.toFixed(1)}%`;

  return (
    <div className="max-w-[1100px] mx-auto px-8 py-10 pb-20 animate-view-in">
      <h1 className="md-headline-large m-0 mb-6">Leaderboard</h1>

      <div className="grid gap-4.5 mb-4.5" style={{ gridTemplateColumns: "300px 1fr", gap: 18 }}>
        {/* Gauge card */}
        <div
          className="bg-surface-container-low border rounded-2xl p-6 flex flex-col items-center justify-center shadow-card"
          style={{ borderColor: "var(--md-outline-variant)" }}
        >
          <Gauge pct={agg?.win_rate ?? null} accent={accent} />
          <div className="md-title-medium mt-2">Win rate</div>
          <div className="text-[13px] text-on-surface-variant">
            across {agg?.closed_count ?? 0} closed trades
          </div>
        </div>

        {/* Stat grid */}
        <div
          className="grid"
          style={{ gridTemplateColumns: "repeat(3, 1fr)", gridTemplateRows: "1fr 1fr", gap: 14 }}
        >
          <StatTile label="Trades logged" value={String(agg?.lead_count ?? 0)} />
          <StatTile label="Avg return" value={fmtPct(agg?.avg_return_pct ?? null, true)} color={gain} />
          <StatTile
            label="Avg hold"
            value={agg?.avg_hold_days != null ? `${agg.avg_hold_days.toFixed(1)}d` : "—"}
          />
          <StatTile label="Best trade" value={fmtPct(agg?.best_return_pct ?? null, true)} color={gain} />
          <StatTile label="Worst trade" value={fmtPct(agg?.worst_return_pct ?? null)} color={loss} />
          <StatTile label="Max drawdown" value={fmtPct(agg?.max_drawdown_pct ?? null)} color={loss} />
        </div>
      </div>

      <div
        className="bg-surface-container-low border rounded-2xl overflow-hidden shadow-card"
        style={{ borderColor: "var(--md-outline-variant)" }}
      >
        <div
          className="grid gap-3 px-6 py-3.5 text-[11.5px] font-semibold uppercase tracking-wide text-on-surface-variant"
          style={{
            gridTemplateColumns: "1.3fr 2fr 0.8fr 0.9fr 0.9fr 0.9fr",
            background: "var(--md-surface-container)",
          }}
        >
          <span>Symbol</span>
          <span>Win rate</span>
          <span className="text-right">Trades</span>
          <span className="text-right">Avg</span>
          <span className="text-right">Best</span>
          <span className="text-right">Worst</span>
        </div>
        {perStock?.length ? (
          perStock.map((p, i) => (
            <div
              key={p.symbol}
              className="grid gap-3 px-6 py-3.5 border-t items-center transition-colors hover:bg-surface-container-high animate-row-in"
              style={{
                gridTemplateColumns: "1.3fr 2fr 0.8fr 0.9fr 0.9fr 0.9fr",
                borderColor: "var(--md-outline-variant)",
                animationDelay: `${i * 30}ms`,
              }}
            >
              <span className="font-mono text-[14.5px] font-medium">{p.symbol}</span>
              <div className="flex items-center gap-2.5">
                <div className="flex-1 h-[7px] rounded-full bg-surface-container-high overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.max(0, Math.min(100, p.win_rate ?? 0))}%`,
                      background: accent,
                    }}
                  />
                </div>
                <span className="text-[13px] font-semibold w-9 text-on-surface-variant">
                  {p.win_rate != null ? `${p.win_rate.toFixed(0)}%` : "—"}
                </span>
              </div>
              <span className="text-right text-[13.5px]">{p.trades}</span>
              <span className="text-right font-mono text-[13.5px]">
                {fmtPct(p.avg_return_pct, true)}
              </span>
              <span
                className="text-right font-mono text-[13.5px]"
                style={{ color: gain }}
              >
                {fmtPct(p.best_return_pct, true)}
              </span>
              <span
                className="text-right font-mono text-[13.5px]"
                style={{ color: loss }}
              >
                {fmtPct(p.worst_return_pct)}
              </span>
            </div>
          ))
        ) : (
          <div className="px-6 py-10 text-center text-on-surface-variant">
            {perStock === null ? "Loading…" : "No closed trades yet."}
          </div>
        )}
      </div>
    </div>
  );
}
