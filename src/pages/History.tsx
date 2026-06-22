import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Disclaimer } from "@/components/Disclaimer";

type Lead = {
  id: number;
  symbol: string;
  direction: string;
  entry_price: number | null;
  stop_pct: number | null;
  target_pct: number | null;
  status: string;
  created_at: string;
};

export function History() {
  const [days, setDays] = useState(30);
  const [leads, setLeads] = useState<Lead[] | null>(null);

  useEffect(() => {
    api<Lead[]>(`/public/leads/history?days=${days}`).then((r) => setLeads(r.data));
  }, [days]);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">History</h1>
      <Disclaimer />
      <div className="mb-4 flex gap-2 text-sm">
        {[7, 30, 90, 365].map((d) => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`px-3 py-1 rounded ${days === d ? "bg-zinc-100 text-zinc-900" : "bg-zinc-800 text-zinc-300"}`}
          >
            {d}d
          </button>
        ))}
      </div>
      {leads === null && <p className="text-zinc-500">Loading…</p>}
      {leads && leads.length === 0 && <p className="text-zinc-500">No trades in this window.</p>}
      {leads && leads.length > 0 && (
        <table className="w-full text-sm">
          <thead className="text-zinc-400 border-b border-zinc-800">
            <tr>
              <th className="text-left py-2">Date</th>
              <th className="text-left">Symbol</th>
              <th className="text-left">Direction</th>
              <th className="text-right">Entry</th>
              <th className="text-right">Stop %</th>
              <th className="text-right">Target %</th>
              <th className="text-left pl-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id} className="border-b border-zinc-900">
                <td className="py-2 text-zinc-500">{l.created_at.slice(0, 10)}</td>
                <td className="font-medium">{l.symbol}</td>
                <td>{l.direction}</td>
                <td className="text-right">{l.entry_price?.toFixed(2)}</td>
                <td className="text-right text-red-400">{l.stop_pct?.toFixed(2)}%</td>
                <td className="text-right text-emerald-400">+{l.target_pct?.toFixed(2)}%</td>
                <td className="pl-4 text-zinc-400">{l.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
