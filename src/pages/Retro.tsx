import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Mover = { symbol: string; ret_pct: number };
type MissedWinner = {
  symbol: string;
  ret_pct: number;
  bucket: string;
  verdict: string | null;
  tsm_pass: boolean | null;
};
type SectorRet = { sector: string; ret_pct: number; n: number };
type ScoreWindow = {
  score_date: string;
  picks_avg: number | null;
  picks_n: number;
  rejects_avg: number | null;
  rejects_n: number;
  edge: number | null;
};

type Retro = {
  retro_date: string;
  regime: string | null;
  nifty_ret_pct: number | null;
  advancers: number | null;
  decliners: number | null;
  breadth_pct: number | null;
  pct_above_50dma: number | null;
  sector_rotation: SectorRet[] | null;
  leaders: Mover[] | null;
  laggards: Mover[] | null;
  book_ret_pct: number | null;
  excess_vs_benchmark_pct: number | null;
  posture: string | null;
  missed_winners: MissedWinner[] | null;
  missed_winner_count: number | null;
  gated_out_count: number | null;
  selection_scorecard: Record<string, ScoreWindow> | null;
  narrative: string | null;
  system_lesson: string | null;
};

const pct = (v: number | null | undefined, digits = 2) =>
  v === null || v === undefined ? "—" : `${v > 0 ? "+" : ""}${v.toFixed(digits)}%`;

const toneColor = (v: number | null | undefined) =>
  v === null || v === undefined
    ? "var(--md-on-surface-variant)"
    : v > 0
    ? "var(--md-primary)"
    : v < 0
    ? "var(--md-error)"
    : "var(--md-on-surface-variant)";

const BUCKET_META: Record<string, { label: string; color: string; bg: string }> = {
  gated_out: {
    label: "gated out",
    color: "var(--md-error)",
    bg: "var(--md-error-container)",
  },
  shortlisted_skip: {
    label: "we skipped",
    color: "var(--md-tertiary)",
    bg: "var(--md-tertiary-container)",
  },
  picked_not_held: {
    label: "picked, not held",
    color: "var(--md-on-surface-variant)",
    bg: "var(--md-surface-container-high)",
  },
};

function Card({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <div
      className="bg-surface-container-low border rounded-2xl p-6 mb-4.5 shadow-card animate-card-in"
      style={{ borderColor: "var(--md-outline-variant)", animationDelay: `${delay}ms`, marginBottom: 18 }}
    >
      {children}
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <div className="text-[12px] text-on-surface-variant mb-0.5">{label}</div>
      <div className="md-title-medium" style={{ color: color || "var(--md-on-surface)" }}>
        {value}
      </div>
    </div>
  );
}

export function Retro() {
  const [retro, setRetro] = useState<Retro | null | undefined>(undefined);

  useEffect(() => {
    api<Retro | null>("/public/retro").then((r) => setRetro(r.data));
  }, []);

  if (retro === undefined)
    return <div className="max-w-[880px] mx-auto px-4 md:px-8 py-10 text-on-surface-variant">Loading…</div>;

  const accent = "var(--md-primary)";
  const accentContainer = "var(--md-primary-container)";

  return (
    <div className="max-w-[880px] mx-auto px-4 md:px-8 py-6 md:py-10 pb-28 md:pb-20 animate-view-in">
      <h1 className="md-headline-large m-0 mb-1.5">Retrospective</h1>
      <p className="md-body-medium text-on-surface-variant mb-6 m-0">
        The system grading itself each day — what the market did, what we held vs. what ran,
        and what we missed.
      </p>

      {!retro && (
        <div
          className="bg-surface-container-low border rounded-2xl p-10 text-center"
          style={{ borderColor: "var(--md-outline-variant)" }}
        >
          <span className="material-symbols-rounded mb-3 text-on-surface-variant" style={{ fontSize: 48 }}>
            insights
          </span>
          <div className="md-title-medium mb-1">No retrospective yet</div>
          <div className="text-[13px] text-on-surface-variant">
            The first one lands after the next post-close run.
          </div>
        </div>
      )}

      {retro && (
        <>
          {/* Header + market report card */}
          <Card>
            <div className="flex items-center gap-2.5 mb-4">
              <span
                className="grid place-items-center w-9 h-9 rounded-xl"
                style={{ background: accentContainer, color: accent }}
              >
                <span className="material-symbols-rounded ms-fill">insights</span>
              </span>
              <div>
                <div className="md-title-medium">{retro.retro_date}</div>
                <div className="text-[12.5px] text-on-surface-variant capitalize">
                  {retro.regime || "—"} · NIFTY {pct(retro.nifty_ret_pct)}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Stat label="Breadth (up)" value={retro.breadth_pct != null ? `${retro.breadth_pct}%` : "—"} />
              <Stat label="Above 50DMA" value={retro.pct_above_50dma != null ? `${retro.pct_above_50dma}%` : "—"} />
              <Stat
                label="Advancers"
                value={`${retro.advancers ?? "—"} / ${retro.decliners ?? "—"}`}
              />
              <Stat
                label="Book vs NIFTY"
                value={pct(retro.excess_vs_benchmark_pct)}
                color={toneColor(retro.excess_vs_benchmark_pct)}
              />
            </div>

            {retro.sector_rotation && retro.sector_rotation.length > 0 && (
              <div className="mt-5">
                <div className="text-[12px] text-on-surface-variant mb-2">Sector rotation</div>
                <div className="flex flex-wrap gap-2">
                  {retro.sector_rotation.slice(0, 8).map((s) => (
                    <span
                      key={s.sector}
                      className="text-[12.5px] px-2.5 py-1 rounded-lg"
                      style={{ background: "var(--md-surface-container-high)", color: toneColor(s.ret_pct) }}
                    >
                      {s.sector} {pct(s.ret_pct, 1)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Narrative + system lesson */}
          {(retro.narrative || retro.system_lesson) && (
            <Card delay={80}>
              {retro.narrative && (
                <p className="md-body-large m-0" style={{ lineHeight: 1.6 }}>
                  {retro.narrative}
                </p>
              )}
              {retro.system_lesson && (
                <div
                  className="mt-4 flex gap-3 p-3.5 rounded-xl"
                  style={{ background: accentContainer, color: "var(--md-on-primary-container)" }}
                >
                  <span className="material-symbols-rounded flex-none" style={{ fontSize: 20 }}>
                    lightbulb
                  </span>
                  <span className="md-body-medium" style={{ lineHeight: 1.5 }}>
                    {retro.system_lesson}
                  </span>
                </div>
              )}
            </Card>
          )}

          {/* Selection scorecard */}
          {retro.selection_scorecard && Object.keys(retro.selection_scorecard).length > 0 && (
            <Card delay={140}>
              <div className="md-title-medium mb-1">Selection edge</div>
              <div className="text-[12.5px] text-on-surface-variant mb-4">
                Forward return of our picks vs. the names we rejected. Positive edge = we're
                picking the right ones.
              </div>
              <div className="grid grid-cols-3 gap-4">
                {["w5", "w10", "w20"].map((k) => {
                  const w = retro.selection_scorecard?.[k];
                  const n = k.slice(1);
                  return (
                    <div key={k} className="text-center">
                      <div className="text-[12px] text-on-surface-variant mb-1">{n}-day</div>
                      <div className="md-title-large" style={{ color: toneColor(w?.edge) }}>
                        {w ? pct(w.edge) : "—"}
                      </div>
                      {w && (
                        <div className="text-[11.5px] text-on-surface-variant mt-1">
                          picks {pct(w.picks_avg, 1)} · rej {pct(w.rejects_avg, 1)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Missed winners */}
          {retro.missed_winners && retro.missed_winners.length > 0 && (
            <Card delay={200}>
              <div className="md-title-medium mb-1">
                Missed winners{" "}
                <span className="text-on-surface-variant font-normal">
                  ({retro.gated_out_count ?? 0} gated out)
                </span>
              </div>
              <div className="text-[12.5px] text-on-surface-variant mb-3">
                Movers we didn't hold. "Gated out" = the momentum gate dropped it before the
                screen ever saw it.
              </div>
              {retro.missed_winners.map((m, j) => {
                const meta = BUCKET_META[m.bucket] || BUCKET_META.picked_not_held;
                return (
                  <div
                    key={m.symbol}
                    className="flex items-center gap-3 py-2.5 border-t"
                    style={{ borderColor: "var(--md-outline-variant)", animationDelay: `${j * 50}ms` }}
                  >
                    <span className="md-body-large flex-1 font-medium">{m.symbol}</span>
                    <span
                      className="text-[11.5px] px-2 py-0.5 rounded-md"
                      style={{ background: meta.bg, color: meta.color }}
                    >
                      {meta.label}
                    </span>
                    <span className="md-title-medium tabular-nums" style={{ color: toneColor(m.ret_pct) }}>
                      {pct(m.ret_pct)}
                    </span>
                  </div>
                );
              })}
            </Card>
          )}
        </>
      )}
    </div>
  );
}
