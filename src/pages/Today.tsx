import { useEffect, useState } from "react";
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

const STATUS_STYLES: Record<string, { bg: string; fg: string; label: string }> = {
  placed: {
    bg: "var(--md-primary-container)",
    fg: "var(--md-on-primary-container)",
    label: "Placed",
  },
  filled: {
    bg: "var(--md-success-container)",
    fg: "var(--md-success)",
    label: "Filled",
  },
  rejected: {
    bg: "var(--md-error-container)",
    fg: "var(--md-on-error-container)",
    label: "Rejected",
  },
  cancelled: {
    bg: "var(--md-surface-container-high)",
    fg: "var(--md-on-surface-variant)",
    label: "Cancelled",
  },
  pending: {
    bg: "var(--md-secondary-container)",
    fg: "var(--md-on-secondary-container)",
    label: "Pending",
  },
};

function LeadCard({ lead, delay }: { lead: Lead; delay: number }) {
  const status = STATUS_STYLES[lead.status] ?? STATUS_STYLES.pending;
  const lossColor = "var(--md-error)";
  const gainColor = "var(--md-success)";
  const meterPct = Math.max(0, Math.min(100, (lead.conviction ?? 0) * 10));

  return (
    <div
      className="bg-surface-container-low border rounded-2xl p-5 shadow-card card-hover animate-card-in"
      style={{ borderColor: "var(--md-outline-variant)", animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between gap-3 mb-3.5">
        <div>
          <div className="flex items-center gap-2.5">
            <span
              className="font-mono text-[21px] font-medium"
              style={{ letterSpacing: "-0.3px" }}
            >
              {lead.symbol}
            </span>
            <span
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-on-surface-variant"
              style={{ background: "var(--md-surface-container-high)" }}
            >
              <span className="material-symbols-rounded" style={{ fontSize: 14 }}>
                {lead.direction === "short" ? "south_east" : "north_east"}
              </span>
              {lead.direction === "short" ? "Short" : "Long"}
            </span>
          </div>
        </div>
        <span
          className="px-3 py-1 rounded-full text-[12px] font-semibold"
          style={{ background: status.bg, color: status.fg }}
        >
          {status.label}
        </span>
      </div>

      <div className="flex gap-2.5 mb-4">
        <PriceCell label="Entry" value={lead.entry_price} />
        <PriceCell label="Stop" value={lead.stop_price} color={lossColor} pct={lead.stop_pct} />
        <PriceCell label="Target" value={lead.target_price} color={gainColor} pct={lead.target_pct} signed />
      </div>

      <div className="flex items-center gap-2.5 mb-3">
        <span className="text-[12px] text-on-surface-variant whitespace-nowrap">Conviction</span>
        <div className="flex-1 h-[7px] rounded-full bg-surface-container-high overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${meterPct}%`, background: "var(--md-primary)" }}
          />
        </div>
        <span
          className="font-mono text-[13px] font-semibold"
          style={{ color: "var(--md-primary)" }}
        >
          {lead.conviction?.toFixed(1) ?? "—"}
        </span>
      </div>
    </div>
  );
}

function PriceCell({
  label,
  value,
  color,
  pct,
  signed,
}: {
  label: string;
  value: number | null;
  color?: string;
  pct?: number | null;
  signed?: boolean;
}) {
  return (
    <div className="flex-1 text-center px-1.5 py-2.5 rounded-xl bg-surface-container-high">
      <div className="text-[11px] text-on-surface-variant mb-0.5">{label}</div>
      <div className="font-mono text-[15px] font-medium" style={color ? { color } : undefined}>
        {value != null ? value.toFixed(2) : "—"}
      </div>
      {pct != null && (
        <div className="text-[11px]" style={color ? { color } : undefined}>
          {signed && pct > 0 ? "+" : ""}
          {pct.toFixed(2)}%
        </div>
      )}
    </div>
  );
}

function StatBlock({ value, label, accent }: { value: string; label: string; accent?: boolean }) {
  return (
    <div className="text-center px-4 py-2.5 rounded-xl bg-surface-container">
      <div
        className="md-title-large font-semibold"
        style={accent ? { color: "var(--md-primary)" } : undefined}
      >
        {value}
      </div>
      <div className="text-[11px] text-on-surface-variant uppercase tracking-wider">{label}</div>
    </div>
  );
}

export function Today() {
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    api<Lead[]>("/public/leads/today")
      .then((r) => setLeads(r.data))
      .catch((e) => setErr(String(e)));
  }, []);

  const dateStr = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="max-w-[1100px] mx-auto px-8 py-10 pb-20 animate-view-in">
      <div className="flex items-end justify-between gap-5 flex-wrap mb-7">
        <div>
          <h1 className="md-headline-large m-0">Today's trades</h1>
          <div className="flex items-center gap-4 text-on-surface-variant text-[14px] mt-1.5">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-rounded" style={{ fontSize: 18 }}>
                calendar_today
              </span>
              {dateStr}
            </span>
          </div>
        </div>
        <div className="flex gap-2.5">
          <StatBlock value={leads ? String(leads.length) : "—"} label="Placed" />
        </div>
      </div>

      {err && (
        <div
          className="rounded-2xl border p-4 mb-4"
          style={{ borderColor: "var(--md-outline-variant)", background: "var(--md-error-container)", color: "var(--md-on-error-container)" }}
        >
          {err}
        </div>
      )}

      {leads === null && !err && <p className="text-on-surface-variant">Loading…</p>}

      {leads && leads.length === 0 && (
        <div
          className="bg-surface-container-low border rounded-2xl p-10 text-center"
          style={{ borderColor: "var(--md-outline-variant)" }}
        >
          <span
            className="material-symbols-rounded mb-3 text-on-surface-variant"
            style={{ fontSize: 48 }}
          >
            inbox
          </span>
          <div className="md-title-medium mb-1">No trades today (yet)</div>
          <div className="text-[13px] text-on-surface-variant">
            The premarket pipeline runs at 08:30 IST Mon-Fri.
          </div>
        </div>
      )}

      {leads && leads.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5" style={{ gap: 18 }}>
          {leads.map((lead, i) => (
            <LeadCard key={lead.id} lead={lead} delay={60 + i * 70} />
          ))}
        </div>
      )}
    </div>
  );
}
