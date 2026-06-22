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

export function Dashboard() {
  const [d, setD] = useState<DashData | null>(null);
  useEffect(() => {
    api<DashData>("/admin/dashboard").then((r) => setD(r.data));
  }, []);

  if (!d) return <p className="text-zinc-500">Loading…</p>;
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4 text-amber-300">Owner dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Stat label="Cash" value={`₹${d.capital.available_cash.toLocaleString()}`} />
        <Stat label="Invested" value={`₹${d.capital.invested.toLocaleString()}`} />
        <Stat label="Current value" value={`₹${d.capital.current_value.toLocaleString()}`} />
        <Stat
          label="P&L"
          value={`₹${d.capital.pnl_total.toLocaleString()} (${d.capital.pnl_pct.toFixed(2)}%)`}
          tone={d.capital.pnl_total >= 0 ? "good" : "bad"}
        />
      </div>
      <h2 className="text-lg font-semibold mb-2">Holdings</h2>
      <table className="w-full text-sm">
        <thead className="text-zinc-400 border-b border-zinc-800">
          <tr>
            <th className="text-left py-2">Symbol</th>
            <th className="text-right">Qty</th>
            <th className="text-right">Avg buy</th>
            <th className="text-right">Last</th>
            <th className="text-right">P&L</th>
          </tr>
        </thead>
        <tbody>
          {d.holdings.map((h) => (
            <tr key={h.symbol} className="border-b border-zinc-900">
              <td className="py-2 font-medium">{h.symbol}</td>
              <td className="text-right">{h.quantity}</td>
              <td className="text-right">{h.avg_buy_price?.toFixed(2)}</td>
              <td className="text-right">{h.last_price?.toFixed(2) || "—"}</td>
              <td className={`text-right ${(h.pnl || 0) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {h.pnl != null ? `₹${h.pnl.toFixed(2)}` : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "good" | "bad" }) {
  const color = tone === "good" ? "text-emerald-400" : tone === "bad" ? "text-red-400" : "";
  return (
    <div className="border border-zinc-800 rounded p-3">
      <div className="text-xs text-zinc-500">{label}</div>
      <div className={`text-lg font-medium mt-1 ${color}`}>{value}</div>
    </div>
  );
}
