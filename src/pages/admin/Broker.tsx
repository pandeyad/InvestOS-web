import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Status = {
  broker_mode: string;
  broker_name: string;
  kite_authed: boolean;
  kite_api_key_configured: boolean;
  auto_login_enabled: boolean;
};

export function Broker() {
  const [s, setS] = useState<Status | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  function reload() {
    api<Status>("/admin/broker/status").then((r) => setS(r.data));
  }
  useEffect(reload, []);

  async function refresh() {
    setMsg("Refreshing…");
    try {
      await api("/admin/broker/refresh-token", { method: "POST" });
      setMsg("Token refreshed.");
      reload();
    } catch (e) {
      setMsg(`Failed: ${e}`);
    }
  }

  if (!s) return <p className="text-zinc-500">Loading…</p>;
  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold mb-4 text-amber-300">Broker</h1>
      <table className="text-sm w-full mb-4">
        <tbody>
          <Row k="Mode" v={s.broker_mode} />
          <Row k="Broker" v={s.broker_name} />
          <Row k="Kite authed" v={s.kite_authed ? "✓" : "—"} />
          <Row k="API key configured" v={s.kite_api_key_configured ? "✓" : "—"} />
          <Row k="Auto login (TOTP)" v={s.auto_login_enabled ? "✓" : "—"} />
        </tbody>
      </table>
      <p className="text-xs text-zinc-500 mb-3">
        The access token itself is never returned — only the connection status.
      </p>
      <button
        onClick={refresh}
        className="px-3 py-1.5 rounded bg-zinc-100 text-zinc-900 hover:bg-white"
      >
        Refresh token via TOTP
      </button>
      {msg && <p className="mt-3 text-sm text-zinc-300">{msg}</p>}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <tr className="border-b border-zinc-900">
      <td className="py-2 text-zinc-500">{k}</td>
      <td className="text-right text-zinc-100">{v}</td>
    </tr>
  );
}
