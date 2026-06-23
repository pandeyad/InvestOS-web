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
  max_favorable_pct: number | null;
  max_adverse_pct: number | null;
  outcome: string;
  thesis_held: boolean | null;
  what_worked: string | null;
  what_failed: string | null;
  lesson: string | null;
};

const OUTCOME_STYLES: Record<string, { bg: string; fg: string; label: string }> = {
  win: { bg: "var(--md-success-container)", fg: "var(--md-success)", label: "Win" },
  loss: { bg: "var(--md-error-container)", fg: "var(--md-on-error-container)", label: "Loss" },
  target_hit: {
    bg: "var(--md-success-container)",
    fg: "var(--md-success)",
    label: "Target hit",
  },
  stop_hit: {
    bg: "var(--md-error-container)",
    fg: "var(--md-on-error-container)",
    label: "Stop hit",
  },
  manual_close: {
    bg: "var(--md-surface-container-high)",
    fg: "var(--md-on-surface-variant)",
    label: "Manual close",
  },
  unknown: {
    bg: "var(--md-surface-container-high)",
    fg: "var(--md-on-surface-variant)",
    label: "Unknown",
  },
};

export function Postmortems() {
  const [rows, setRows] = useState<Pm[] | null>(null);

  useEffect(() => {
    api<Pm[]>("/admin/postmortems").then((r) => setRows(r.data));
  }, []);

  const accent = "var(--md-primary)";
  const accentContainer = "var(--md-primary-container)";
  const gain = "var(--md-success)";
  const loss = "var(--md-error)";

  if (!rows) {
    return (
      <div className="max-w-[900px] mx-auto px-4 md:px-8 py-6 md:py-10 text-on-surface-variant">Loading…</div>
    );
  }

  return (
    <div className="max-w-[900px] mx-auto px-4 md:px-8 py-6 md:py-10 pb-28 md:pb-20 animate-view-in">
      <div className="flex items-center gap-2.5 mb-6">
        <span
          className="material-symbols-rounded ms-fill"
          style={{ color: accent, fontSize: 28 }}
        >
          fact_check
        </span>
        <h1 className="md-headline-large m-0">Post-mortems</h1>
      </div>

      {rows.length === 0 && (
        <div
          className="bg-surface-container-low border rounded-2xl p-10 text-center text-on-surface-variant"
          style={{ borderColor: "var(--md-outline-variant)" }}
        >
          No post-mortems yet.
        </div>
      )}

      {rows.map((pm, i) => {
        const outcome = OUTCOME_STYLES[pm.outcome] ?? OUTCOME_STYLES.unknown;
        const retColor = (pm.return_pct ?? 0) >= 0 ? gain : loss;
        const mfe = pm.max_favorable_pct ?? 0;
        const mae = Math.abs(pm.max_adverse_pct ?? 0);
        const maxBar = Math.max(mfe, mae, 1);
        return (
          <div
            key={pm.id}
            className="bg-surface-container-low border rounded-2xl p-6 mb-4 shadow-card animate-card-in"
            style={{
              borderColor: "var(--md-outline-variant)",
              animationDelay: `${i * 70}ms`,
            }}
          >
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <span className="font-mono text-[19px] font-medium">{pm.symbol}</span>
              <span className="text-[12.5px] text-on-surface-variant">
                {pm.entry_date} → {pm.exit_date}
              </span>
              <span
                className="px-2.5 py-1 rounded-full text-[11.5px] font-semibold"
                style={{ background: outcome.bg, color: outcome.fg }}
              >
                {outcome.label}
              </span>
              <span
                className="ml-auto font-mono text-[18px] font-semibold"
                style={{ color: retColor }}
              >
                {pm.return_pct != null
                  ? `${pm.return_pct >= 0 ? "+" : ""}${pm.return_pct.toFixed(2)}%`
                  : "—"}
              </span>
            </div>

            <div className="flex gap-4.5 mb-4" style={{ gap: 18 }}>
              <div className="flex-1">
                <div className="flex justify-between text-[11.5px] text-on-surface-variant mb-1.5">
                  <span>Max favorable</span>
                  <span style={{ color: gain, fontWeight: 600 }}>+{mfe.toFixed(1)}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-surface-container-high overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${(mfe / maxBar) * 100}%`, background: gain }}
                  />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-[11.5px] text-on-surface-variant mb-1.5">
                  <span>Max adverse</span>
                  <span style={{ color: loss, fontWeight: 600 }}>-{mae.toFixed(1)}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-surface-container-high overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${(mae / maxBar) * 100}%`, background: loss }}
                  />
                </div>
              </div>
            </div>

            {pm.what_worked && (
              <div className="flex gap-2.5 mb-2">
                <span
                  className="material-symbols-rounded flex-none"
                  style={{ fontSize: 18, color: gain }}
                >
                  add_circle
                </span>
                <span className="text-[13.5px]" style={{ lineHeight: 1.55 }}>
                  <span className="text-on-surface-variant">Worked — </span>
                  {pm.what_worked}
                </span>
              </div>
            )}
            {pm.what_failed && (
              <div className="flex gap-2.5 mb-2">
                <span
                  className="material-symbols-rounded flex-none"
                  style={{ fontSize: 18, color: loss }}
                >
                  remove_circle
                </span>
                <span className="text-[13.5px]" style={{ lineHeight: 1.55 }}>
                  <span className="text-on-surface-variant">Failed — </span>
                  {pm.what_failed}
                </span>
              </div>
            )}
            {pm.lesson && (
              <div
                className="flex gap-2.5 px-3.5 py-3 rounded-xl mt-2.5"
                style={{ background: accentContainer }}
              >
                <span
                  className="material-symbols-rounded ms-fill flex-none"
                  style={{ fontSize: 18, color: accent }}
                >
                  lightbulb
                </span>
                <span
                  className="text-[13.5px] font-medium"
                  style={{ lineHeight: 1.55, color: accent }}
                >
                  {pm.lesson}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
