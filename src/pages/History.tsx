import { useEffect, useState } from "react";
import { api } from "@/lib/api";

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

const DAY_OPTIONS = [
  { d: 7, label: "7d" },
  { d: 30, label: "30d" },
  { d: 90, label: "90d" },
  { d: 365, label: "1y" },
];

const STATUS_STYLES: Record<string, { bg: string; fg: string; label: string }> = {
  placed: { bg: "var(--md-primary-container)", fg: "var(--md-on-primary-container)", label: "Placed" },
  filled: { bg: "var(--md-success-container)", fg: "var(--md-success)", label: "Filled" },
  rejected: { bg: "var(--md-error-container)", fg: "var(--md-on-error-container)", label: "Rejected" },
  cancelled: { bg: "var(--md-surface-container-high)", fg: "var(--md-on-surface-variant)", label: "Cancelled" },
  pending: { bg: "var(--md-secondary-container)", fg: "var(--md-on-secondary-container)", label: "Pending" },
};

export function History() {
  const [days, setDays] = useState(30);
  const [leads, setLeads] = useState<Lead[] | null>(null);

  useEffect(() => {
    setLeads(null);
    api<Lead[]>(`/public/leads/history?days=${days}`).then((r) => setLeads(r.data));
  }, [days]);

  return (
    <div className="max-w-[1100px] mx-auto px-8 py-10 pb-20 animate-view-in">
      <div className="flex items-end justify-between gap-4 flex-wrap mb-6">
        <h1 className="md-headline-large m-0">History</h1>
        <div
          className="flex rounded-full p-1"
          style={{ background: "var(--md-surface-container)" }}
        >
          {DAY_OPTIONS.map((o) => (
            <button
              key={o.d}
              onClick={() => setDays(o.d)}
              className="px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all"
              style={
                days === o.d
                  ? { background: "var(--md-primary)", color: "var(--md-on-primary)" }
                  : { color: "var(--md-on-surface-variant)" }
              }
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {leads === null && <p className="text-on-surface-variant">Loading…</p>}
      {leads && leads.length === 0 && (
        <div
          className="bg-surface-container-low border rounded-2xl p-10 text-center"
          style={{ borderColor: "var(--md-outline-variant)" }}
        >
          <span
            className="material-symbols-rounded mb-3 text-on-surface-variant"
            style={{ fontSize: 48 }}
          >
            history
          </span>
          <div className="md-title-medium">No trades in this window.</div>
        </div>
      )}

      {leads && leads.length > 0 && (
        <div
          className="bg-surface-container-low border rounded-2xl overflow-hidden shadow-card"
          style={{ borderColor: "var(--md-outline-variant)" }}
        >
          <div
            className="grid gap-3 px-6 py-3.5 text-[11.5px] font-semibold uppercase tracking-wide text-on-surface-variant"
            style={{
              gridTemplateColumns: "90px 1.4fr 1fr 1fr 1fr 1.1fr",
              background: "var(--md-surface-container)",
            }}
          >
            <span>Date</span>
            <span>Symbol</span>
            <span className="text-right">Entry</span>
            <span className="text-right">Stop %</span>
            <span className="text-right">Target %</span>
            <span className="text-right">Status</span>
          </div>
          {leads.map((r, i) => {
            const status = STATUS_STYLES[r.status] ?? STATUS_STYLES.pending;
            return (
              <div
                key={r.id}
                className="grid gap-3 px-6 py-4 border-t items-center transition-colors hover:bg-surface-container-high animate-row-in"
                style={{
                  gridTemplateColumns: "90px 1.4fr 1fr 1fr 1fr 1.1fr",
                  borderColor: "var(--md-outline-variant)",
                  animationDelay: `${i * 30}ms`,
                }}
              >
                <span className="text-[13px] text-on-surface-variant">
                  {r.created_at.slice(0, 10)}
                </span>
                <span className="font-mono text-[14.5px] font-medium">{r.symbol}</span>
                <span className="text-right font-mono text-[13.5px]">
                  {r.entry_price?.toFixed(2) ?? "—"}
                </span>
                <span
                  className="text-right font-mono text-[13.5px]"
                  style={{ color: "var(--md-error)" }}
                >
                  {r.stop_pct != null ? `${r.stop_pct.toFixed(2)}%` : "—"}
                </span>
                <span
                  className="text-right font-mono text-[13.5px]"
                  style={{ color: "var(--md-success)" }}
                >
                  {r.target_pct != null ? `+${r.target_pct.toFixed(2)}%` : "—"}
                </span>
                <span className="text-right">
                  <span
                    className="px-2.5 py-1 rounded-full text-[11.5px] font-semibold"
                    style={{ background: status.bg, color: status.fg }}
                  >
                    {status.label}
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
