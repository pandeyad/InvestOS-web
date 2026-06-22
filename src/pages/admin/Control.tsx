import { useState } from "react";
import { api } from "@/lib/api";

export function Control() {
  const [msg, setMsg] = useState<string | null>(null);

  async function call(path: string, label: string) {
    setMsg(`${label}…`);
    try {
      await api(path, { method: "POST" });
      setMsg(`${label} ✓`);
    } catch (e) {
      setMsg(`${label} failed: ${e}`);
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold mb-4 text-amber-300">Control</h1>
      <div className="grid gap-3">
        <Action
          label="Trigger premarket pipeline"
          onClick={() => call("/admin/pipeline/run", "Pipeline")}
        />
        <Action
          label="Start chase loop"
          onClick={() => call("/admin/chase/start", "Chase start")}
        />
        <Action
          label="Stop chase loop"
          onClick={() => call("/admin/chase/stop", "Chase stop")}
        />
      </div>
      {msg && <p className="mt-4 text-sm text-zinc-300">{msg}</p>}
    </div>
  );
}

function Action({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-2 rounded border border-zinc-800 text-left hover:bg-zinc-900"
    >
      {label}
    </button>
  );
}
