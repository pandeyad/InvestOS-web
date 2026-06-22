import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Disclaimer } from "@/components/Disclaimer";

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

export function Leaderboard() {
  const [perStock, setPerStock] = useState<PerStock[] | null>(null);
  const [agg, setAgg] = useState<Aggregate | null>(null);

  useEffect(() => {
    api<PerStock[]>("/public/leaderboard/per-stock").then((r) => setPerStock(r.data));
    api<Aggregate>("/public/leaderboard/aggregate").then((r) => setAgg(r.data));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Leaderboard</h1>
      <Disclaimer />

      {agg && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Stat label="Total leads" value={agg.lead_count} />
          <Stat label="Closed" value={agg.closed_count} />
          <Stat label="Win rate" value={agg.win_rate != null ? `${agg.win_rate}%` : "—"} />
          <Stat label="Avg return" value={agg.avg_return_pct != null ? `${agg.avg_return_pct}%` : "—"} />
          <Stat label="Best" value={agg.best_return_pct != null ? `+${agg.best_return_pct}%` : "—"} />
          <Stat label="Worst" value={agg.worst_return_pct != null ? `${agg.worst_return_pct}%` : "—"} />
          <Stat label="Max drawdown" value={agg.max_drawdown_pct != null ? `${agg.max_drawdown_pct}%` : "—"} />
          <Stat label="Avg hold" value={agg.avg_hold_days != null ? `${agg.avg_hold_days}d` : "—"} />
        </div>
      )}

      <h2 className="text-lg font-semibold mb-2">Per-stock</h2>
      {perStock === null && <p className="text-zinc-500">Loading…</p>}
      {perStock && perStock.length === 0 && <p className="text-zinc-500">No closed trades yet.</p>}
      {perStock && perStock.length > 0 && (
        <table className="w-full text-sm">
          <thead className="text-zinc-400 border-b border-zinc-800">
            <tr>
              <th className="text-left py-2">Symbol</th>
              <th className="text-right">Trades</th>
              <th className="text-right">Wins</th>
              <th className="text-right">Losses</th>
              <th className="text-right">Win rate</th>
              <th className="text-right">Avg %</th>
              <th className="text-right">Best %</th>
              <th className="text-right">Worst %</th>
            </tr>
          </thead>
          <tbody>
            {perStock.map((p) => (
              <tr key={p.symbol} className="border-b border-zinc-900">
                <td className="py-2 font-medium">{p.symbol}</td>
                <td className="text-right">{p.trades}</td>
                <td className="text-right text-emerald-400">{p.wins}</td>
                <td className="text-right text-red-400">{p.losses}</td>
                <td className="text-right">{p.win_rate != null ? `${p.win_rate}%` : "—"}</td>
                <td className="text-right">{p.avg_return_pct != null ? `${p.avg_return_pct}%` : "—"}</td>
                <td className="text-right text-emerald-400">{p.best_return_pct != null ? `+${p.best_return_pct}%` : "—"}</td>
                <td className="text-right text-red-400">{p.worst_return_pct != null ? `${p.worst_return_pct}%` : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border border-zinc-800 rounded p-3">
      <div className="text-xs text-zinc-500">{label}</div>
      <div className="text-lg font-medium mt-1">{value}</div>
    </div>
  );
}
