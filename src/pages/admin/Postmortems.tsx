import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Pm = {
  id: number;
  symbol: string;
  entry_date: string | null;
  exit_date: string;
  entry_price: number | null;
  exit_price: number | null;
  return_pct: number | null;
  outcome: string;
  thesis_held: boolean | null;
  what_worked: string | null;
  what_failed: string | null;
  lesson: string | null;
};

export function Postmortems() {
  const [rows, setRows] = useState<Pm[] | null>(null);
  useEffect(() => {
    api<Pm[]>("/admin/postmortems").then((r) => setRows(r.data));
  }, []);

  if (!rows) return <p className="text-zinc-500">Loading…</p>;
  if (rows.length === 0) return <p className="text-zinc-500">No post-mortems yet.</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4 text-amber-300">Post-mortems</h1>
      <div className="space-y-4">
        {rows.map((pm) => (
          <div key={pm.id} className="border border-zinc-800 rounded p-4">
            <div className="flex items-baseline gap-3 mb-2">
              <span className="font-medium">{pm.symbol}</span>
              <span className="text-xs text-zinc-500">
                {pm.entry_date} → {pm.exit_date}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-zinc-800">{pm.outcome}</span>
              <span
                className={`text-sm font-medium ${(pm.return_pct || 0) >= 0 ? "text-emerald-400" : "text-red-400"}`}
              >
                {pm.return_pct?.toFixed(2)}%
              </span>
            </div>
            {pm.what_worked && (
              <p className="text-sm text-zinc-300 mb-1">
                <span className="text-zinc-500">Worked:</span> {pm.what_worked}
              </p>
            )}
            {pm.what_failed && (
              <p className="text-sm text-zinc-300 mb-1">
                <span className="text-zinc-500">Failed:</span> {pm.what_failed}
              </p>
            )}
            {pm.lesson && (
              <p className="text-sm text-amber-300 mt-2">
                <span className="text-zinc-500">Lesson:</span> {pm.lesson}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
