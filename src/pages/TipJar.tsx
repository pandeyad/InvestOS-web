import { useEffect, useState } from "react";
import { Disclaimer } from "@/components/Disclaimer";

type TipJarData = { upi: string; buy_me_a_coffee: string; note: string };

export function TipJar() {
  const [data, setData] = useState<TipJarData | null>(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE || "http://localhost:8000"}/public/tip-jar`)
      .then((r) => r.json())
      .then((b) => setData(b.data));
  }, []);

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold mb-4">Tip jar</h1>
      <Disclaimer />
      {!data && <p className="text-zinc-500">Loading…</p>}
      {data && (
        <div className="border border-zinc-800 rounded p-6">
          <p className="text-zinc-300 mb-4">{data.note}</p>
          <div className="space-y-2">
            <div>
              <div className="text-xs text-zinc-500">UPI</div>
              <code className="text-zinc-100">{data.upi}</code>
            </div>
            <div>
              <a
                href={data.buy_me_a_coffee}
                target="_blank"
                rel="noreferrer"
                className="text-amber-400 hover:text-amber-300 underline"
              >
                Buy me a coffee ↗
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
