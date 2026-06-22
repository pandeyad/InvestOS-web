import { useEffect, useState } from "react";

type TipJarData = { upi: string; buy_me_a_coffee: string; note: string };

export function TipJar() {
  const [data, setData] = useState<TipJarData | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const base = import.meta.env.VITE_API_BASE || "http://localhost:8000";
    fetch(`${base}/public/tip-jar`)
      .then((r) => r.json())
      .then((b) => setData(b.data));
  }, []);

  const accent = "var(--md-primary)";

  const onCopy = () => {
    if (!data) return;
    navigator.clipboard?.writeText(data.upi).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className="max-w-[680px] mx-auto px-8 py-10 pb-20 animate-view-in">
      <h1 className="md-headline-large m-0 mb-1.5">Tip jar</h1>
      <p className="md-body-medium text-on-surface-variant mb-6 m-0">
        If this journal helps you, a coffee keeps the hosting on. No paywalls, ever.
      </p>

      {!data && <p className="text-on-surface-variant">Loading…</p>}

      {data && (
        <div
          className="bg-surface-container-low border rounded-3xl p-8 shadow-card"
          style={{ borderColor: "var(--md-outline-variant)" }}
        >
          <div className="flex items-center gap-4 mb-7">
            <span
              className="grid place-items-center rounded-2xl flex-none animate-floaty bg-surface-container-high text-on-surface-variant"
              style={{ width: 120, height: 120 }}
            >
              <span className="material-symbols-rounded" style={{ fontSize: 64 }}>
                qr_code_2
              </span>
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-[12px] text-on-surface-variant uppercase tracking-wider mb-1.5">
                UPI
              </div>
              <div
                className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl"
                style={{ background: "var(--md-surface-container-high)" }}
              >
                <code className="font-mono text-[15px] font-medium flex-1 truncate">
                  {data.upi}
                </code>
                <button onClick={onCopy} aria-label="copy UPI">
                  <span
                    className="material-symbols-rounded transition-transform hover:scale-110"
                    style={{ fontSize: 18, color: accent }}
                  >
                    {copied ? "check" : "content_copy"}
                  </span>
                </button>
              </div>
              <div className="text-[12.5px] text-on-surface-variant mt-2">
                {copied ? "Copied!" : "Scan or copy — any amount, no expectations."}
              </div>
            </div>
          </div>

          <a
            href={data.buy_me_a_coffee}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2.5 py-3.5 rounded-2xl font-semibold text-[15px] text-on-primary hover:brightness-105 transition-all"
            style={{ background: accent }}
          >
            <span className="material-symbols-rounded">local_cafe</span>
            Buy me a coffee
          </a>

          <p className="text-[12px] text-on-surface-variant mt-5 mb-0 text-center">
            {data.note}
          </p>
        </div>
      )}
    </div>
  );
}
