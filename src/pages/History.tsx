import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";

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

type CurvePoint = {
  date: string;
  portfolio_pct: number;
  nifty_pct: number | null;
  open_positions: number | null;
  regime: string | null;
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

// ── Equity Curve (SVG, kept from original) ───────────────────────────────────

const W = 900;
const H = 220;
const PAD = { top: 20, right: 56, bottom: 32, left: 50 };

function toY(pct: number, minY: number, maxY: number): number {
  const range = maxY - minY || 1;
  return PAD.top + ((maxY - pct) / range) * (H - PAD.top - PAD.bottom);
}

function linePath(pts: [number, number][]): string {
  return pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
}

function EquityCurve({ data }: { data: CurvePoint[] }) {
  if (data.length < 2) return null;

  const n = data.length;
  const xs = data.map((_, i) => PAD.left + (i / (n - 1)) * (W - PAD.left - PAD.right));

  const allPcts: number[] = [0, ...data.map((d) => d.portfolio_pct)];
  data.forEach((d) => { if (d.nifty_pct !== null) allPcts.push(d.nifty_pct); });
  const minY = Math.floor(Math.min(...allPcts)) - 2;
  const maxY = Math.ceil(Math.max(...allPcts)) + 2;

  const portPts: [number, number][] = data.map((d, i) => [xs[i], toY(d.portfolio_pct, minY, maxY)]);
  const niftyPts: [number, number][] = data.flatMap((d, i) =>
    d.nifty_pct !== null ? [[xs[i], toY(d.nifty_pct, minY, maxY)] as [number, number]] : []
  );

  const zeroY = toY(0, minY, maxY);
  const tickStep = (maxY - minY) > 20 ? 10 : (maxY - minY) > 8 ? 5 : 2;
  const ticks: number[] = [];
  for (let v = Math.ceil(minY / tickStep) * tickStep; v <= maxY; v += tickStep) ticks.push(v);

  const xLabelStep = Math.max(1, Math.floor((n - 1) / 4));
  const xLabelIdx = [0, ...Array.from({ length: 4 }, (_, k) => (k + 1) * xLabelStep).filter(i => i < n - 1), n - 1];
  const uniqueXLabels = [...new Set(xLabelIdx)];

  const lastPort = portPts[portPts.length - 1];
  const lastPortVal = data[data.length - 1].portfolio_pct;
  const lastNiftyPt = niftyPts.length > 0 ? niftyPts[niftyPts.length - 1] : null;
  const lastNiftyVal = data[data.length - 1].nifty_pct;

  return (
    <div className="mb-7 bg-surface-container-lowest border rounded-2xl overflow-hidden" style={{ borderColor: "var(--md-outline-variant)" }}>
      <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--md-outline-variant)" }}>
        <div>
          <div className="md-title-small font-semibold">Portfolio vs NIFTY-100</div>
          <div className="text-[12px] text-on-surface-variant mt-0.5">% return indexed to first snapshot · no INR amounts shown</div>
        </div>
        <div className="flex items-center gap-5 text-[12px]">
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-5 h-[2px] rounded-full" style={{ background: "var(--md-primary)" }} />
            <span className="text-on-surface-variant">My portfolio</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-5 h-[2px] rounded-full" style={{ background: "var(--md-outline)" }} />
            <span className="text-on-surface-variant">NIFTY-100</span>
          </div>
        </div>
      </div>

      <div className="px-3 pt-2 pb-1">
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: "100%", height: "auto", display: "block" }}>
          {ticks.map((v) => {
            const y = toY(v, minY, maxY);
            return (
              <g key={v}>
                <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y}
                  stroke="var(--md-outline-variant)" strokeWidth={v === 0 ? 1 : 0.5}
                  strokeDasharray={v === 0 ? undefined : "3,3"} />
                <text x={PAD.left - 6} y={y + 4} textAnchor="end" fontSize={10} fill="var(--md-on-surface-variant)">
                  {v > 0 ? `+${v}` : v}%
                </text>
              </g>
            );
          })}
          {uniqueXLabels.map((i) => (
            <text key={i} x={xs[i]} y={H - 4} textAnchor="middle" fontSize={10} fill="var(--md-on-surface-variant)">
              {data[i].date.slice(5)}
            </text>
          ))}
          {niftyPts.length > 1 && (
            <path d={linePath(niftyPts)} fill="none" stroke="var(--md-outline)" strokeWidth={1.5} strokeLinejoin="round" />
          )}
          <path
            d={`${linePath(portPts)} L${lastPort[0]},${zeroY} L${portPts[0][0]},${zeroY} Z`}
            fill="var(--md-primary)" fillOpacity={0.1}
          />
          <path d={linePath(portPts)} fill="none" stroke="var(--md-primary)" strokeWidth={2} strokeLinejoin="round" />
          <circle cx={lastPort[0]} cy={lastPort[1]} r={3} fill="var(--md-primary)" />
          <text x={lastPort[0] + 6} y={lastPort[1] + 4} fontSize={10} fontWeight={600} fill="var(--md-primary)">
            {lastPortVal > 0 ? `+${lastPortVal.toFixed(1)}` : lastPortVal.toFixed(1)}%
          </text>
          {lastNiftyPt && lastNiftyVal !== null && (
            <>
              <circle cx={lastNiftyPt[0]} cy={lastNiftyPt[1]} r={2.5} fill="var(--md-outline)" />
              <text x={lastNiftyPt[0] + 6} y={lastNiftyPt[1] + 4} fontSize={10} fill="var(--md-on-surface-variant)">
                {lastNiftyVal > 0 ? `+${lastNiftyVal.toFixed(1)}` : lastNiftyVal.toFixed(1)}%
              </text>
            </>
          )}
        </svg>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export function History() {
  const navigate = useNavigate();
  const [days, setDays] = useState(30);
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [curve, setCurve] = useState<CurvePoint[] | null>(null);

  useEffect(() => {
    setLeads(null);
    api<Lead[]>(`/public/leads/history?days=${days}`).then((r) => setLeads(r.data));
  }, [days]);

  useEffect(() => {
    api<CurvePoint[]>("/public/portfolio/curve").then((r) => setCurve(r.data ?? []));
  }, []);

  return (
    <div className="max-w-[1100px] mx-auto px-4 md:px-8 py-6 md:py-10 pb-28 md:pb-20 animate-view-in">
      {curve !== null && curve.length > 1 && <EquityCurve data={curve} />}

      <div className="flex items-end justify-between gap-4 flex-wrap mb-6">
        <div>
          <h1 className="md-headline-large m-0">Trade history</h1>
          <div className="text-[13px] text-on-surface-variant mt-1">
            Stocks the system purchased — tap any row for full analysis
          </div>
        </div>
        <div className="flex rounded-full p-1" style={{ background: "var(--md-surface-container)" }}>
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
        <div className="bg-surface-container-lowest border rounded-2xl p-12 text-center" style={{ borderColor: "var(--md-outline-variant)" }}>
          <span className="material-symbols-rounded mb-3 text-on-surface-variant" style={{ fontSize: 48 }}>receipt_long</span>
          <div className="md-title-medium mb-1">No placed trades in this window</div>
          <div className="text-[13px] text-on-surface-variant">
            Leads become history once the system places an order with the broker.
          </div>
        </div>
      )}

      {leads && leads.length > 0 && (
        <div
          className="bg-surface-container-lowest border rounded-2xl overflow-hidden shadow-card"
          style={{ borderColor: "var(--md-outline-variant)" }}
        >
          {/* Header */}
          <div
            className="grid px-6 py-3 text-[11.5px] font-semibold uppercase tracking-wide text-on-surface-variant"
            style={{
              background: "var(--md-surface-container)",
              gridTemplateColumns: "90px 1.4fr 1fr 1fr 1fr 1.1fr 24px",
              gap: "12px",
            }}
          >
            <span>Date</span>
            <span>Symbol</span>
            <span className="hidden md:block text-right">Entry</span>
            <span className="hidden md:block text-right">Stop %</span>
            <span className="hidden md:block text-right">Target %</span>
            <span className="text-right">Status</span>
            <span />
          </div>

          {leads.map((r, i) => {
            const status = STATUS_STYLES[r.status] ?? STATUS_STYLES.pending;
            const stopPct = r.stop_pct ?? (r.entry_price && r.stop_price
              ? ((r.stop_price - r.entry_price) / r.entry_price) * 100 : null);
            const targetPct = r.target_pct ?? (r.entry_price && r.target_price
              ? ((r.target_price - r.entry_price) / r.entry_price) * 100 : null);
            return (
              <div
                key={r.id}
                className="grid px-6 py-4 border-t items-center cursor-pointer transition-colors animate-row-in"
                style={{
                  borderColor: "var(--md-outline-variant)",
                  animationDelay: `${i * 30}ms`,
                  gridTemplateColumns: "90px 1.4fr 1fr 1fr 1fr 1.1fr 24px",
                  gap: "12px",
                }}
                onClick={() => navigate(`/stock/${r.symbol}?from=history`)}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--md-surface-container)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "")}
              >
                <span className="text-[13px] text-on-surface-variant">{r.created_at.slice(0, 10)}</span>
                <div>
                  <div className="font-mono text-[14.5px] font-semibold">{r.symbol}</div>
                  {r.direction === "short" && (
                    <div className="text-[11px] text-on-surface-variant">Short</div>
                  )}
                </div>
                <span className="hidden md:block text-right font-mono text-[13.5px]">
                  {r.entry_price != null ? `₹${r.entry_price.toFixed(2)}` : "—"}
                </span>
                <span className="hidden md:block text-right font-mono text-[13.5px]" style={{ color: "var(--md-error)" }}>
                  {stopPct != null ? `${stopPct.toFixed(2)}%` : "—"}
                </span>
                <span className="hidden md:block text-right font-mono text-[13.5px]" style={{ color: "var(--md-success)" }}>
                  {targetPct != null && targetPct > 0 ? `+${targetPct.toFixed(2)}%` : targetPct != null ? `${targetPct.toFixed(2)}%` : "—"}
                </span>
                <span className="text-right">
                  <span className="px-2.5 py-1 rounded-full text-[11.5px] font-semibold" style={{ background: status.bg, color: status.fg }}>
                    {status.label}
                  </span>
                </span>
                <span className="material-symbols-rounded text-on-surface-variant" style={{ fontSize: 18 }}>
                  chevron_right
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
