import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Capital = {
  available_cash: number;
  invested: number;
  current_value: number;
  pnl_total: number;
  pnl_pct: number;
  holdings_count: number;
  total_portfolio_value: number;
};

type Holding = {
  symbol: string;
  quantity: number;
  avg_buy_price: number;
  last_price: number | null;
  pnl: number | null;
};

type DashData = { capital: Capital; holdings: Holding[] };

function CapitalCard({
  label,
  value,
  delta,
  color,
}: {
  label: string;
  value: string;
  delta?: string;
  color?: string;
}) {
  return (
    <div
      className="bg-surface-container-low border rounded-xl p-5"
      style={{ borderColor: "var(--md-outline-variant)" }}
    >
      <div className="text-[12px] text-on-surface-variant mb-2">{label}</div>
      <span
        className="md-headline-medium"
        style={{ fontWeight: 500, fontSize: 26, color: color || undefined }}
      >
        {value}
      </span>
      {delta && (
        <span
          className="text-[14px] font-semibold ml-1.5"
          style={{ color: color || undefined }}
        >
          {delta}
        </span>
      )}
    </div>
  );
}

export function Dashboard() {
  const [d, setD] = useState<DashData | null>(null);
  useEffect(() => {
    api<DashData>("/admin/dashboard").then((r) => setD(r.data));
  }, []);

  const fmtINR = (v: number) => `₹${Math.round(v).toLocaleString("en-IN")}`;
  const accent = "var(--md-primary)";
  const accentContainer = "var(--md-primary-container)";
  const gain = "var(--md-success)";
  const loss = "var(--md-error)";

  if (!d) {
    return (
      <div className="max-w-[1100px] mx-auto px-8 py-10 text-on-surface-variant">Loading…</div>
    );
  }

  const totalInvested = d.holdings.reduce(
    (s, h) => s + h.quantity * h.avg_buy_price,
    0,
  );
  const pnlColor = d.capital.pnl_total >= 0 ? gain : loss;

  return (
    <div className="max-w-[1100px] mx-auto px-8 py-10 pb-20 animate-view-in">
      <div className="flex items-center gap-2.5 mb-6">
        <span
          className="material-symbols-rounded ms-fill"
          style={{ color: accent, fontSize: 28 }}
        >
          shield_person
        </span>
        <h1 className="md-headline-large m-0">Owner dashboard</h1>
        <span
          className="px-2.5 py-1 rounded-full text-[11.5px] font-semibold"
          style={{ background: accentContainer, color: accent }}
        >
          INR · private
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
        <CapitalCard label="Cash" value={fmtINR(d.capital.available_cash)} />
        <CapitalCard label="Invested" value={fmtINR(d.capital.invested)} />
        <CapitalCard label="Current value" value={fmtINR(d.capital.current_value)} />
        <CapitalCard
          label="Total P&L"
          value={`${d.capital.pnl_total >= 0 ? "+" : ""}${fmtINR(d.capital.pnl_total)}`}
          delta={`${d.capital.pnl_pct >= 0 ? "+" : ""}${d.capital.pnl_pct.toFixed(2)}%`}
          color={pnlColor}
        />
      </div>

      <div
        className="bg-surface-container-low border rounded-2xl overflow-hidden shadow-card"
        style={{ borderColor: "var(--md-outline-variant)" }}
      >
        <div
          className="grid gap-3 px-6 py-3.5 text-[11.5px] font-semibold uppercase tracking-wide text-on-surface-variant"
          style={{
            gridTemplateColumns: "1.2fr 2fr 0.8fr 1fr 1fr 1.1fr",
            background: "var(--md-surface-container)",
          }}
        >
          <span>Symbol</span>
          <span>Allocation</span>
          <span className="text-right">Qty</span>
          <span className="text-right">Avg buy</span>
          <span className="text-right">Last</span>
          <span className="text-right">P&L</span>
        </div>
        {d.holdings.length === 0 && (
          <div className="px-6 py-10 text-center text-on-surface-variant">No open holdings.</div>
        )}
        {d.holdings.map((h, i) => {
          const cost = h.quantity * h.avg_buy_price;
          const allocPct = totalInvested > 0 ? (cost / totalInvested) * 100 : 0;
          const pnlColor = (h.pnl ?? 0) >= 0 ? gain : loss;
          return (
            <div
              key={h.symbol}
              className="grid gap-3 px-6 py-3.5 border-t items-center hover:bg-surface-container-high transition-colors animate-row-in"
              style={{
                gridTemplateColumns: "1.2fr 2fr 0.8fr 1fr 1fr 1.1fr",
                borderColor: "var(--md-outline-variant)",
                animationDelay: `${i * 30}ms`,
              }}
            >
              <span className="font-mono text-[14.5px] font-medium">{h.symbol}</span>
              <div className="flex items-center gap-2.5">
                <div className="flex-1 h-[7px] rounded-full bg-surface-container-high overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${allocPct}%`, background: accent }}
                  />
                </div>
                <span className="text-[12.5px] text-on-surface-variant w-9 text-right">
                  {allocPct.toFixed(0)}%
                </span>
              </div>
              <span className="text-right font-mono text-[13.5px]">{h.quantity}</span>
              <span className="text-right font-mono text-[13.5px]">
                {h.avg_buy_price.toFixed(2)}
              </span>
              <span className="text-right font-mono text-[13.5px]">
                {h.last_price?.toFixed(2) ?? "—"}
              </span>
              <span
                className="text-right font-mono text-[13.5px] font-semibold"
                style={{ color: pnlColor }}
              >
                {h.pnl != null
                  ? `${h.pnl >= 0 ? "+" : ""}${fmtINR(h.pnl)}`
                  : "—"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
