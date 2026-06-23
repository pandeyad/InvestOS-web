import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type ChaseStats = {
  ticks_seen?: number;
  trailing_updates?: number;
  gtt_modifies?: number;
  gtt_missing_triggers?: number;
};

type ChaseStatus = {
  running: boolean;
  connected: boolean;
  degraded: boolean;
  subscribed_count: number;
  stats?: ChaseStats;
};

type Status = {
  region: string;
  region_source: string;
  live_execution_allowed: boolean;
  broker_mode: string;
  broker_name: string;
  broker_authed: boolean;
  llm_providers_available: string[];
  open_positions: number;
  available_capital: number;
  last_pipeline_run: unknown;
  last_gtt_reconcile: unknown;
  holdings_without_gtt: string[];
  chase: ChaseStatus | null;
};

function ActionCard({
  icon,
  containerColor,
  containerFg,
  title,
  subtitle,
  msg,
  children,
}: {
  icon: string;
  containerColor: string;
  containerFg: string;
  title: string;
  subtitle: string;
  msg?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="bg-surface-container-low border rounded-xl p-5"
      style={{ borderColor: "var(--md-outline-variant)" }}
    >
      <div className="flex items-center gap-3 mb-1.5">
        <span
          className="grid place-items-center w-10 h-10 rounded-xl flex-none"
          style={{ background: containerColor, color: containerFg }}
        >
          <span className="material-symbols-rounded">{icon}</span>
        </span>
        <div className="flex-1 min-w-0">
          <div className="md-title-medium">{title}</div>
          <div className="text-[12.5px] text-on-surface-variant">{subtitle}</div>
        </div>
        <div className="ml-auto flex gap-2 flex-none">{children}</div>
      </div>
      <div
        className="text-[12.5px] pl-[52px] min-h-[18px]"
        style={{ color: "var(--md-primary)" }}
      >
        {msg}
      </div>
    </div>
  );
}

function ActionBtn({
  onClick,
  variant,
  icon,
  label,
  disabled,
}: {
  onClick: () => void;
  variant: "filled" | "tonal" | "outlined";
  icon: string;
  label: string;
  disabled?: boolean;
}) {
  const styles: Record<string, React.CSSProperties> = {
    filled: { background: "var(--md-primary)", color: "var(--md-on-primary)" },
    tonal: {
      background: "var(--md-secondary-container)",
      color: "var(--md-on-secondary-container)",
    },
    outlined: {
      background: "transparent",
      color: "var(--md-on-surface)",
      border: "1px solid var(--md-outline)",
    },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13.5px] font-medium transition-all disabled:opacity-50 hover:brightness-105"
      style={styles[variant]}
    >
      <span className="material-symbols-rounded" style={{ fontSize: 18 }}>
        {icon}
      </span>
      {label}
    </button>
  );
}

export function Control() {
  const [pipelineMsg, setPipelineMsg] = useState<string>("");
  const [chaseMsg, setChaseMsg] = useState<string>("");
  const [backfillMsg, setBackfillMsg] = useState<string>("");
  const [status, setStatus] = useState<Status | null>(null);

  useEffect(() => {
    const tick = () => {
      api<Status>("/status")
        .then((r) => setStatus(r.data))
        .catch(() => {});
    };
    tick();
    const id = setInterval(tick, 15_000);
    return () => clearInterval(id);
  }, []);

  async function call(path: string, label: string, setter: (s: string) => void) {
    setter(`${label}…`);
    try {
      await api(path, { method: "POST" });
      setter(`${label} ✓`);
    } catch (e) {
      setter(`${label} failed: ${e}`);
    }
  }

  const accent = "var(--md-primary)";
  const okDot = "var(--md-success)";
  const warnDot = "var(--md-error)";

  const sysRows: { icon: string; k: string; v: string; ok?: boolean }[] = [
    { icon: "public", k: "Region", v: `${status?.region ?? "—"} (${status?.region_source ?? "—"})` },
    {
      icon: "verified",
      k: "Live execution",
      v: status?.live_execution_allowed ? "allowed" : "blocked",
      ok: status?.live_execution_allowed,
    },
    {
      icon: "vpn_key",
      k: "Broker",
      v: `${status?.broker_name ?? "—"} (${status?.broker_mode ?? "—"})`,
      ok: status?.broker_authed,
    },
    {
      icon: "psychology",
      k: "LLM providers",
      v: status?.llm_providers_available?.join(", ") || "—",
    },
    {
      icon: "savings",
      k: "Open positions",
      v: String(status?.open_positions ?? "—"),
    },
    {
      icon: "currency_rupee",
      k: "Available capital",
      v: status?.available_capital != null
        ? `₹${Math.round(status.available_capital).toLocaleString("en-IN")}`
        : "—",
    },
    {
      icon: "sensors",
      k: "Chase",
      v: status?.chase?.running
        ? `running · ${status.chase.subscribed_count} symbols`
        : "stopped",
      ok: status?.chase?.running ?? false,
    },
    {
      icon: "warning",
      k: "Unprotected holdings",
      v: status?.holdings_without_gtt?.length
        ? status.holdings_without_gtt.join(", ")
        : "none",
      ok: (status?.holdings_without_gtt?.length ?? 0) === 0,
    },
  ];

  return (
    <div className="max-w-[1100px] mx-auto px-4 md:px-8 py-6 md:py-10 pb-28 md:pb-20 animate-view-in">
      <div className="flex items-center gap-2.5 mb-6">
        <span
          className="material-symbols-rounded ms-fill"
          style={{ color: accent, fontSize: 28 }}
        >
          tune
        </span>
        <h1 className="md-headline-large m-0">Control</h1>
      </div>

      {/* Actions + status: stacked on mobile, side-by-side on md+ */}
      <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-[18px]">
        <div className="flex flex-col gap-3.5">
          <ActionCard
            icon="rocket_launch"
            containerColor="var(--md-primary-container)"
            containerFg="var(--md-on-primary-container)"
            title="Premarket pipeline"
            subtitle="Funnel → shortlist → leads"
            msg={pipelineMsg}
          >
            <ActionBtn
              onClick={() => call("/admin/pipeline/run", "Pipeline", setPipelineMsg)}
              variant="filled"
              icon="play_arrow"
              label="Run now"
            />
          </ActionCard>

          <ActionCard
            icon="sensors"
            containerColor="var(--md-secondary-container)"
            containerFg="var(--md-on-secondary-container)"
            title="Chase loop"
            subtitle="Intraday trailing-stop engine"
            msg={chaseMsg}
          >
            <ActionBtn
              onClick={() => call("/admin/chase/start", "Chase start", setChaseMsg)}
              variant="tonal"
              icon="play_arrow"
              label="Start"
            />
            <ActionBtn
              onClick={() => call("/admin/chase/stop", "Chase stop", setChaseMsg)}
              variant="outlined"
              icon="stop"
              label="Stop"
            />
          </ActionCard>

          <ActionCard
            icon="history"
            containerColor="var(--md-tertiary-container)"
            containerFg="var(--md-on-tertiary-container)"
            title="Price history backfill"
            subtitle="Seed 500 days of bhavcopy + index data — runs in background"
            msg={backfillMsg}
          >
            <ActionBtn
              onClick={() => call("/admin/prices/backfill", "Backfill", setBackfillMsg)}
              variant="tonal"
              icon="download"
              label="Backfill 500 days"
            />
          </ActionCard>
        </div>

        <div
          className="bg-surface-container-low border rounded-xl px-5"
          style={{ borderColor: "var(--md-outline-variant)" }}
        >
          <div className="text-[11.5px] font-semibold uppercase tracking-wide text-on-surface-variant pt-4 pb-1.5">
            System status
          </div>
          {sysRows.map((s, i) => (
            <div
              key={s.k}
              className="flex items-center gap-2.5 py-3"
              style={
                i > 0 ? { borderTop: "1px solid var(--md-outline-variant)" } : undefined
              }
            >
              <span
                className="material-symbols-rounded text-on-surface-variant flex-none"
                style={{ fontSize: 19, color: s.ok === false ? warnDot : s.ok ? okDot : undefined }}
              >
                {s.icon}
              </span>
              <span className="text-[13.5px] text-on-surface-variant flex-1">{s.k}</span>
              <span className="text-[13.5px] font-medium text-right break-all">{s.v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
