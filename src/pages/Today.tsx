import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Disclaimer } from "@/components/Disclaimer";

type Lead = {
  id: number;
  symbol: string;
  direction: string;
  entry_price: number | null;
  stop_price: number | null;
  target_price: number | null;
  stop_pct: number | null;
  target_pct: number | null;
  conviction: number | null;
  status: string;
  created_at: string;
};

export function Today() {
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    api<Lead[]>("/public/leads/today")
      .then((r) => setLeads(r.data))
      .catch((e) => setErr(String(e)));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Today's trades</h1>
      <Disclaimer />
      {err && <p className="text-red-400">{err}</p>}
      {leads === null && !err && <p className="text-zinc-500">Loading…</p>}
      {leads && leads.length === 0 && <p className="text-zinc-500">No trades today (yet).</p>}
      {leads && leads.length > 0 && (
        <table className="w-full text-sm">
          <thead className="text-zinc-400 border-b border-zinc-800">
            <tr>
              <th className="text-left py-2">Symbol</th>
              <th className="text-left">Direction</th>
              <th className="text-right">Entry</th>
              <th className="text-right">Stop</th>
              <th className="text-right">Target</th>
              <th className="text-right">Stop %</th>
              <th className="text-right">Target %</th>
              <th className="text-right">Conviction</th>
              <th className="text-left pl-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id} className="border-b border-zinc-900">
                <td className="py-2 font-medium">{l.symbol}</td>
                <td>{l.direction}</td>
                <td className="text-right">{l.entry_price?.toFixed(2)}</td>
                <td className="text-right">{l.stop_price?.toFixed(2)}</td>
                <td className="text-right">{l.target_price?.toFixed(2)}</td>
                <td className="text-right text-red-400">{l.stop_pct?.toFixed(2)}%</td>
                <td className="text-right text-emerald-400">+{l.target_pct?.toFixed(2)}%</td>
                <td className="text-right">{l.conviction?.toFixed(1)}</td>
                <td className="pl-4 text-zinc-400">{l.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
