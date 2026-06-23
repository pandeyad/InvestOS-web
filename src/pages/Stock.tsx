import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/auth";

type PriceBar = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

type Verdict = {
  action: string | null;
  conviction: number | null;
  score: number | null;
  pctile_rank: number | null;
  rsi_14: number | null;
  mom_12_1: number | null;
  mom_3m: number | null;
  rationale: string | null;
  run_date: string | null;
  entry_price: number | null;
  stop_price: number | null;
  target_price: number | null;
  stop_pct: number | null;
  target_pct: number | null;
};

type LeadHistoryRow = {
  date: string | null;
  conviction: number | null;
  entry_price: number | null;
  stop_pct: number | null;
  target_pct: number | null;
  status: string;
};

type Holding = {
  trailing_high: number | null;
  current_stop_price: number | null;
  gtt_trigger_id: string | null;
  drastic_drop_flagged: boolean;
  held_since: string | null;
};

type Postmortem = {
  entry_date: string | null;
  exit_date: string | null;
  entry_price: number | null;
  exit_price: number | null;
  return_pct: number | null;
  max_favorable_pct: number | null;
  max_adverse_pct: number | null;
  outcome: string;
  hold_days: number | null;
};

type StockDetail = {
  symbol: string;
  name: string | null;
  sector: string | null;
  industry: string | null;
  current_price: number | null;
  price_52w_high: number | null;
  price_52w_low: number | null;
  dma_200: number | null;
  prices: PriceBar[];
  verdict: Verdict | null;
  lead_history: LeadHistoryRow[];
  holding: Holding | null;
  postmortem: Postmortem | null;
};

const ACTION_META: Record<string, { label: string; bg: string; fg: string }> = {
  buy: { label: "Buy", bg: "var(--md-primary)", fg: "var(--md-on-primary)" },
  watch: { label: "Watch", bg: "var(--md-tertiary)", fg: "var(--md-on-tertiary)" },
  avoid: { label: "Skip", bg: "var(--md-surface-container-high)", fg: "var(--md-on-surface-variant)" },
};

const STATUS_STYLES: Record<string, { bg: string; fg: string; label: string }> = {
  placed: { bg: "var(--md-primary-container)", fg: "var(--md-on-primary-container)", label: "Placed" },
  filled: { bg: "var(--md-success-container)", fg: "var(--md-success)", label: "Filled" },
  rejected: { bg: "var(--md-error-container)", fg: "var(--md-on-error-container)", label: "Rejected" },
  cancelled: { bg: "var(--md-surface-container-high)", fg: "var(--md-on-surface-variant)", label: "Cancelled" },
  pending: { bg: "var(--md-secondary-container)", fg: "var(--md-on-secondary-container)", label: "Pending" },
};

function fmt(v: number | null, decimals = 2) {
  if (v == null) return "—";
  return v.toFixed(decimals);
}

function pct(v: number | null, sign = false) {
  if (v == null) return "—";
  return `${sign && v > 0 ? "+" : ""}${v.toFixed(2)}%`;
}

function inr(v: number | null) {
  if (v == null) return "—";
  return `₹${v.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Custom tooltip for the price chart
function PriceTooltip({ active, payload, label }: Record<string, unknown>) {
  if (!active || !payload || !(payload as unknown[]).length) return null;
  const d = (payload as { value: number }[])[0];
  return (
    <div
      className="rounded-xl px-3 py-2 shadow-lg text-[12px]"
      style={{
        background: "var(--md-surface-container-highest)",
        border: "1px solid var(--md-outline-variant)",
        color: "var(--md-on-surface)",
      }}
    >
      <div className="font-semibold mb-0.5">{label as string}</div>
      <div className="font-mono" style={{ color: "var(--md-primary)" }}>
        ₹{(d?.value ?? 0).toFixed(2)}
      </div>
    </div>
  );
}

export function Stock() {
  const { symbol } = useParams<{ symbol: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { role } = useAuth();
  const [detail, setDetail] = useState<StockDetail | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const from = searchParams.get("from") ?? "today";

  useEffect(() => {
    if (!symbol) return;
    api<StockDetail>(`/public/stock/${symbol}`)
      .then((r) => setDetail(r.data))
      .catch((e) => setErr(String(e)));
  }, [symbol]);

  if (err) {
    return (
      <div className="max-w-[900px] mx-auto px-4 py-10">
        <div className="rounded-2xl p-6" style={{ background: "var(--md-error-container)", color: "var(--md-on-error-container)" }}>
          {err}
        </div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="max-w-[900px] mx-auto px-4 py-10 text-on-surface-variant">Loading…</div>
    );
  }

  const { verdict, holding, postmortem } = detail;
  const actionMeta = ACTION_META[(verdict?.action ?? "avoid").toLowerCase()] ?? ACTION_META.avoid;
  const isHeld = !!holding;
  const isClosed = !!postmortem && !isHeld;

  // Build reference lines for held/closed positions
  const buyDate = postmortem?.entry_date ?? holding?.held_since?.slice(0, 10) ?? null;
  const sellDate = postmortem?.exit_date ?? null;

  // Price chart: downsample to max 100 points for mobile performance
  const prices = detail.prices;
  const step = prices.length > 100 ? Math.floor(prices.length / 100) : 1;
  const chartData = prices.filter((_, i) => i % step === 0 || i === prices.length - 1);

  const priceAbove200 = detail.current_price != null && detail.dma_200 != null
    ? ((detail.current_price - detail.dma_200) / detail.dma_200) * 100
    : null;

  return (
    <div className="max-w-[960px] mx-auto px-4 md:px-8 py-6 md:py-10 pb-28 md:pb-20 animate-view-in">
      {/* Back button */}
      <button
        onClick={() => navigate(from === "history" ? "/history" : "/today")}
        className="flex items-center gap-1.5 text-[13px] font-medium mb-6 transition-colors"
        style={{ color: "var(--md-on-surface-variant)" }}
      >
        <span className="material-symbols-rounded" style={{ fontSize: 18 }}>arrow_back</span>
        Back to {from === "history" ? "history" : "today"}
      </button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-2 flex-wrap">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="md-headline-large m-0 font-mono">{detail.symbol}</h1>
            {verdict?.action && (
              <span
                className="px-3 py-1 rounded-full text-[13px] font-semibold"
                style={{ background: actionMeta.bg, color: actionMeta.fg }}
              >
                {actionMeta.label}
              </span>
            )}
            {isHeld && (
              <span
                className="px-2.5 py-1 rounded-full text-[12px] font-semibold"
                style={{ background: "var(--md-success-container)", color: "var(--md-success)" }}
              >
                Holding
              </span>
            )}
            {isClosed && (
              <span
                className="px-2.5 py-1 rounded-full text-[12px] font-semibold"
                style={{ background: "var(--md-surface-container-high)", color: "var(--md-on-surface-variant)" }}
              >
                Closed
              </span>
            )}
          </div>
          <div className="text-[13.5px] text-on-surface-variant mt-1">
            {detail.name && <span>{detail.name}</span>}
            {detail.sector && <span className="ml-2 opacity-60">· {detail.sector}</span>}
          </div>
        </div>
        <div className="text-right">
          {detail.current_price != null && (
            <div className="font-mono text-[26px] font-semibold" style={{ color: "var(--md-primary)" }}>
              {inr(detail.current_price)}
            </div>
          )}
        </div>
      </div>

      {/* Price stats */}
      <div className="flex items-center gap-4 flex-wrap mb-6 text-[12.5px] text-on-surface-variant">
        {detail.price_52w_high && <span>52W H: <b className="text-on-surface">{inr(detail.price_52w_high)}</b></span>}
        {detail.price_52w_low && <span>52W L: <b className="text-on-surface">{inr(detail.price_52w_low)}</b></span>}
        {detail.dma_200 && (
          <span>
            200DMA: <b className="text-on-surface">{inr(detail.dma_200)}</b>
            {priceAbove200 != null && (
              <span
                className="ml-1"
                style={{ color: priceAbove200 >= 0 ? "var(--md-success)" : "var(--md-error)" }}
              >
                ({priceAbove200 >= 0 ? "+" : ""}{priceAbove200.toFixed(1)}%)
              </span>
            )}
          </span>
        )}
      </div>

      {/* Price chart */}
      {chartData.length > 1 && (
        <div
          className="bg-surface-container-low border rounded-2xl p-4 mb-6"
          style={{ borderColor: "var(--md-outline-variant)" }}
        >
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <span className="text-[12.5px] font-semibold text-on-surface-variant uppercase tracking-wide">
              200-day price history
            </span>
            <div className="flex items-center gap-4 text-[11.5px] text-on-surface-variant">
              {buyDate && <span className="flex items-center gap-1.5"><span className="inline-block w-4 h-0 border-t-2 border-dashed" style={{ borderColor: "var(--md-success)" }} />Bought</span>}
              {sellDate && <span className="flex items-center gap-1.5"><span className="inline-block w-4 h-0 border-t-2 border-dashed" style={{ borderColor: "var(--md-error)" }} />Sold</span>}
              {verdict?.run_date && <span>As of {verdict.run_date}</span>}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--md-primary)" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="var(--md-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--md-outline-variant)" strokeOpacity={0.6} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "var(--md-on-surface-variant)" }}
                tickFormatter={(d: string) => d.slice(5)}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={["auto", "auto"]}
                tick={{ fontSize: 10, fill: "var(--md-on-surface-variant)" }}
                tickLine={false}
                axisLine={false}
                width={56}
                tickFormatter={(v: number) => `₹${(v / 1000).toFixed(1)}k`}
              />
              <Tooltip content={<PriceTooltip />} />
              {buyDate && (
                <ReferenceLine
                  x={buyDate}
                  stroke="var(--md-success)"
                  strokeDasharray="4 3"
                  strokeWidth={1.5}
                  label={{ value: "Bought", fill: "var(--md-success)", fontSize: 10, position: "top" }}
                />
              )}
              {sellDate && (
                <ReferenceLine
                  x={sellDate}
                  stroke="var(--md-error)"
                  strokeDasharray="4 3"
                  strokeWidth={1.5}
                  label={{ value: "Sold", fill: "var(--md-error)", fontSize: 10, position: "top" }}
                />
              )}
              <Area
                type="monotone"
                dataKey="close"
                stroke="var(--md-primary)"
                strokeWidth={2}
                fill="url(#priceGrad)"
                dot={false}
                activeDot={{ r: 4, fill: "var(--md-primary)" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        <div className="flex flex-col gap-5">
          {/* Verdict card */}
          {verdict && (
            <Section title="Today's verdict" icon="psychology">
              <div className="flex items-center gap-3 mb-4">
                <span
                  className="px-4 py-1.5 rounded-full text-[14px] font-semibold"
                  style={{ background: actionMeta.bg, color: actionMeta.fg }}
                >
                  {actionMeta.label}
                </span>
                {verdict.conviction != null && (
                  <div className="flex items-center gap-2 flex-1">
                    <div
                      className="flex-1 h-2 rounded-full overflow-hidden"
                      style={{ background: "var(--md-surface-container-high)" }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.round(verdict.conviction * 100)}%`,
                          background: "var(--md-primary)",
                        }}
                      />
                    </div>
                    <span className="font-mono text-[13px] font-semibold" style={{ color: "var(--md-primary)" }}>
                      {Math.round(verdict.conviction * 100)}%
                    </span>
                    <span className="text-[12px] text-on-surface-variant">conviction</span>
                  </div>
                )}
              </div>

              {/* Price targets */}
              {verdict.entry_price && (
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <PriceCell label="Entry" value={inr(verdict.entry_price)} />
                  <PriceCell label="Stop" value={inr(verdict.stop_price)} sub={pct(verdict.stop_pct)} subColor="var(--md-error)" />
                  <PriceCell label="Target" value={inr(verdict.target_price)} sub={pct(verdict.target_pct, true)} subColor="var(--md-success)" />
                </div>
              )}

              {/* Rationale */}
              {verdict.rationale && (
                <div
                  className="rounded-xl p-4 text-[13.5px] leading-relaxed"
                  style={{ background: "var(--md-surface-container)", color: "var(--md-on-surface)" }}
                >
                  {verdict.rationale}
                </div>
              )}
            </Section>
          )}

          {/* Holding details */}
          {isHeld && (
            <Section title="Current position" icon="account_balance_wallet">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <StatCell label="Held since" value={holding.held_since?.slice(0, 10) ?? "—"} />
                <StatCell
                  label="Trailing high"
                  value={inr(holding.trailing_high)}
                />
                <StatCell
                  label="Current stop"
                  value={inr(holding.current_stop_price)}
                  valueColor="var(--md-error)"
                />
                {holding.gtt_trigger_id && (
                  <StatCell label="GTT ID" value={holding.gtt_trigger_id} mono />
                )}
                {holding.drastic_drop_flagged && (
                  <div
                    className="col-span-full flex items-center gap-2 rounded-xl px-3 py-2.5 text-[13px] font-medium"
                    style={{ background: "var(--md-error-container)", color: "var(--md-on-error-container)" }}
                  >
                    <span className="material-symbols-rounded" style={{ fontSize: 18 }}>warning</span>
                    Drastic intraday drop flagged
                  </div>
                )}
              </div>
              {role !== "admin" && (
                <p className="text-[11.5px] text-on-surface-variant mt-3">
                  Quantity and cost details are visible to account holders only.
                </p>
              )}
            </Section>
          )}

          {/* Postmortem */}
          {postmortem && (
            <Section title="Trade outcome" icon="assessment">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <StatCell label="Bought" value={postmortem.entry_date ?? "—"} />
                <StatCell label="Sold" value={postmortem.exit_date ?? "—"} />
                <StatCell label="Hold" value={postmortem.hold_days != null ? `${postmortem.hold_days}d` : "—"} />
                <StatCell
                  label="Return"
                  value={pct(postmortem.return_pct, true)}
                  valueColor={(postmortem.return_pct ?? 0) >= 0 ? "var(--md-success)" : "var(--md-error)"}
                />
              </div>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <StatCell label="Entry" value={inr(postmortem.entry_price)} />
                <StatCell label="Exit" value={inr(postmortem.exit_price)} />
                <StatCell
                  label="Outcome"
                  value={postmortem.outcome.replace(/_/g, " ")}
                  valueColor={postmortem.outcome === "win" || postmortem.outcome === "target_hit"
                    ? "var(--md-success)" : "var(--md-on-surface-variant)"}
                />
              </div>
              {postmortem.max_favorable_pct != null && (
                <div className="flex gap-4 text-[12.5px] text-on-surface-variant">
                  <span>Peak: <b style={{ color: "var(--md-success)" }}>+{postmortem.max_favorable_pct.toFixed(2)}%</b></span>
                  {postmortem.max_adverse_pct != null && (
                    <span>Trough: <b style={{ color: "var(--md-error)" }}>{postmortem.max_adverse_pct.toFixed(2)}%</b></span>
                  )}
                </div>
              )}
            </Section>
          )}
        </div>

        {/* Right sidebar */}
        <div className="flex flex-col gap-5">
          {/* Factor scores */}
          {verdict && (
            <Section title="Factor scores" icon="bar_chart">
              <div className="flex flex-col gap-2.5">
                <FactorRow label="Composite score" value={`${fmt(verdict.score, 0)}/100`} bar={verdict.score} barMax={100} />
                <FactorRow label="Percentile rank" value={verdict.pctile_rank != null ? `${verdict.pctile_rank}th` : "—"} bar={verdict.pctile_rank} barMax={100} />
                <FactorRow label="12M momentum" value={pct(verdict.mom_12_1, true)} bar={verdict.mom_12_1 != null ? Math.min(verdict.mom_12_1 + 50, 100) : null} barMax={100} barColor={verdict.mom_12_1 != null && verdict.mom_12_1 < 0 ? "var(--md-error)" : "var(--md-success)"} />
                <FactorRow label="3M momentum" value={pct(verdict.mom_3m, true)} bar={verdict.mom_3m != null ? Math.min(verdict.mom_3m + 50, 100) : null} barMax={100} barColor={verdict.mom_3m != null && verdict.mom_3m < 0 ? "var(--md-error)" : "var(--md-success)"} />
                <FactorRow label="RSI (14)" value={fmt(verdict.rsi_14, 0)} bar={verdict.rsi_14} barMax={100} barColor={verdict.rsi_14 != null && verdict.rsi_14 > 70 ? "var(--md-error)" : "var(--md-primary)"} />
              </div>
            </Section>
          )}

          {/* 52W range visual */}
          {detail.price_52w_high != null && detail.price_52w_low != null && detail.current_price != null && (
            <Section title="52-week range" icon="linear_scale">
              <RangeBar
                low={detail.price_52w_low}
                high={detail.price_52w_high}
                current={detail.current_price}
              />
            </Section>
          )}

          {/* Lead history */}
          {detail.lead_history.length > 0 && (
            <Section title="System history" icon="history">
              <div className="flex flex-col gap-0">
                {detail.lead_history.slice(0, 8).map((l, i) => {
                  const st = STATUS_STYLES[l.status] ?? STATUS_STYLES.pending;
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-3 py-2.5"
                      style={i > 0 ? { borderTop: "1px solid var(--md-outline-variant)" } : undefined}
                    >
                      <span className="text-[12px] text-on-surface-variant font-mono w-[80px] flex-none">{l.date ?? "—"}</span>
                      <span
                        className="px-2 py-0.5 rounded-full text-[11px] font-semibold"
                        style={{ background: st.bg, color: st.fg }}
                      >
                        {st.label}
                      </span>
                      {l.entry_price != null && (
                        <span className="font-mono text-[12px] ml-auto">{inr(l.entry_price)}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div
      className="bg-surface-container-lowest border rounded-2xl p-5"
      style={{ borderColor: "var(--md-outline-variant)" }}
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-rounded text-on-surface-variant" style={{ fontSize: 18 }}>{icon}</span>
        <span className="text-[12.5px] font-semibold uppercase tracking-wide text-on-surface-variant">{title}</span>
      </div>
      {children}
    </div>
  );
}

function PriceCell({ label, value, sub, subColor }: { label: string; value: string; sub?: string; subColor?: string }) {
  return (
    <div
      className="text-center px-3 py-3 rounded-xl"
      style={{ background: "var(--md-surface-container)" }}
    >
      <div className="text-[11px] text-on-surface-variant mb-0.5">{label}</div>
      <div className="font-mono text-[14.5px] font-semibold">{value}</div>
      {sub && <div className="text-[11.5px] mt-0.5 font-mono" style={{ color: subColor }}>{sub}</div>}
    </div>
  );
}

function StatCell({ label, value, valueColor, mono }: { label: string; value: string; valueColor?: string; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] text-on-surface-variant">{label}</span>
      <span
        className={`text-[13.5px] font-semibold ${mono ? "font-mono" : ""}`}
        style={valueColor ? { color: valueColor } : undefined}
      >
        {value}
      </span>
    </div>
  );
}

function FactorRow({
  label, value, bar, barMax = 100, barColor,
}: {
  label: string; value: string; bar: number | null; barMax?: number; barColor?: string;
}) {
  const pct = bar != null ? Math.max(0, Math.min(100, (bar / barMax) * 100)) : 0;
  return (
    <div className="grid items-center gap-2" style={{ gridTemplateColumns: "1fr auto 80px" }}>
      <span className="text-[12.5px] text-on-surface-variant">{label}</span>
      <span className="font-mono text-[12.5px] font-semibold text-right w-[60px]">{value}</span>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--md-surface-container-high)" }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: barColor ?? "var(--md-primary)" }}
        />
      </div>
    </div>
  );
}

function RangeBar({ low, high, current }: { low: number; high: number; current: number }) {
  const range = high - low || 1;
  const pos = Math.max(0, Math.min(100, ((current - low) / range) * 100));
  return (
    <div>
      <div className="relative h-2 rounded-full mb-2" style={{ background: "var(--md-surface-container-high)" }}>
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 shadow"
          style={{
            left: `${pos}%`,
            transform: "translate(-50%, -50%)",
            background: "var(--md-primary)",
            borderColor: "var(--md-surface-container-lowest)",
          }}
        />
      </div>
      <div className="flex justify-between text-[11.5px] text-on-surface-variant">
        <span>₹{low.toLocaleString("en-IN")}</span>
        <span style={{ color: "var(--md-primary)", fontWeight: 600 }}>
          ₹{current.toLocaleString("en-IN")}
        </span>
        <span>₹{high.toLocaleString("en-IN")}</span>
      </div>
    </div>
  );
}
