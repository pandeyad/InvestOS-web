import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";

type Status = {
  broker_mode: string;
  broker_name: string;
  kite_authed: boolean;
  kite_api_key_configured: boolean;
  auto_login_enabled: boolean;
};

type Row = { k: string; v: string; ok: boolean };

function buildRows(s: Status): Row[] {
  return [
    { k: "Broker", v: s.broker_name, ok: true },
    { k: "Mode", v: s.broker_mode, ok: s.broker_mode === "live" },
    { k: "Kite session", v: s.kite_authed ? "Connected" : "Disconnected", ok: s.kite_authed },
    {
      k: "API key configured",
      v: s.kite_api_key_configured ? "Yes" : "No",
      ok: s.kite_api_key_configured,
    },
    {
      k: "Auto login (TOTP)",
      v: s.auto_login_enabled ? "Enabled" : "Disabled",
      ok: s.auto_login_enabled,
    },
  ];
}

export function Broker() {
  const [s, setS] = useState<Status | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const reload = useCallback(() => {
    api<Status>("/admin/broker/status").then((r) => setS(r.data));
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  async function refresh() {
    setBusy(true);
    setMsg("Refreshing token via TOTP…");
    try {
      await api("/admin/broker/refresh-token", { method: "POST" });
      setMsg("Token refreshed.");
      reload();
    } catch (e) {
      setMsg(`Failed: ${e}`);
    } finally {
      setBusy(false);
    }
  }

  const accent = "var(--md-primary)";

  if (!s) {
    return (
      <div className="max-w-[720px] mx-auto px-4 md:px-8 py-6 md:py-10 text-on-surface-variant">Loading…</div>
    );
  }

  return (
    <div className="max-w-[720px] mx-auto px-4 md:px-8 py-6 md:py-10 pb-28 md:pb-20 animate-view-in">
      <div className="flex items-center gap-2.5 mb-6">
        <span
          className="material-symbols-rounded ms-fill"
          style={{ color: accent, fontSize: 28 }}
        >
          hub
        </span>
        <h1 className="md-headline-large m-0">Broker</h1>
      </div>

      <div
        className="bg-surface-container-low border rounded-2xl px-6 shadow-card"
        style={{ borderColor: "var(--md-outline-variant)" }}
      >
        {buildRows(s).map((row, i, arr) => (
          <div
            key={row.k}
            className="flex items-center justify-between py-4"
            style={
              i < arr.length - 1
                ? { borderBottom: "1px solid var(--md-outline-variant)" }
                : undefined
            }
          >
            <span className="text-[14px] text-on-surface-variant">{row.k}</span>
            <span className="flex items-center gap-2 text-[14px] font-medium">
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: row.ok ? "var(--md-success)" : "var(--md-error)" }}
              />
              {row.v}
            </span>
          </div>
        ))}
      </div>

      <p className="text-[12.5px] text-on-surface-variant mt-4 mb-5 flex items-center gap-1.5">
        <span className="material-symbols-rounded" style={{ fontSize: 17 }}>
          lock
        </span>
        The access token is never returned — only the connection status.
      </p>

      <button
        onClick={refresh}
        disabled={busy}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-medium text-[14px] transition-all disabled:opacity-50 hover:brightness-105"
        style={{ background: "var(--md-secondary-container)", color: "var(--md-on-secondary-container)" }}
      >
        <span className="material-symbols-rounded">refresh</span>
        Refresh token via TOTP
      </button>

      {msg && (
        <p
          className="mt-4 text-[13px]"
          style={{ color: msg.startsWith("Failed") ? "var(--md-error)" : accent }}
        >
          {msg}
        </p>
      )}
    </div>
  );
}
