import { useEffect, useState } from "react";

type TipJarData = {
  upi: string;
  github: string;
  ntfy_topic: string;
};

function CostRow({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b last:border-0" style={{ borderColor: "var(--md-outline-variant)" }}>
      <span
        className="grid place-items-center w-8 h-8 rounded-lg flex-none"
        style={{ background: "var(--md-surface-container-high)", color: "var(--md-primary)" }}
      >
        <span className="material-symbols-rounded" style={{ fontSize: 17 }}>{icon}</span>
      </span>
      <span className="md-body-medium text-on-surface-variant">{label}</span>
    </div>
  );
}

export function TipJar() {
  const [data, setData] = useState<TipJarData | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const base = import.meta.env.VITE_API_BASE || "http://localhost:8000";
    fetch(`${base}/public/tip-jar`)
      .then((r) => r.json())
      .then((b) => setData(b.data));
  }, []);

  const onCopy = () => {
    if (!data) return;
    navigator.clipboard?.writeText(data.upi).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  return (
    <div className="max-w-[680px] mx-auto px-8 py-10 pb-20 animate-view-in">
      <div className="flex items-center gap-3 mb-2">
        <span
          className="grid place-items-center w-11 h-11 rounded-xl flex-none"
          style={{ background: "var(--md-primary-container)", color: "var(--md-on-primary-container)" }}
        >
          <span className="material-symbols-rounded">volunteer_activism</span>
        </span>
        <h1 className="md-headline-large m-0">Support this project</h1>
      </div>
      <p className="md-body-large m-0 mb-7 text-on-surface-variant" style={{ lineHeight: 1.7 }}>
        This is a personal project — no paywalls, no VC money, no ads. If you've found it useful
        and want to help keep it running, here's how.
      </p>

      {/* What it costs */}
      <div
        className="bg-surface-container-low border rounded-2xl p-5 mb-6"
        style={{ borderColor: "var(--md-outline-variant)" }}
      >
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-rounded text-on-surface-variant" style={{ fontSize: 18 }}>
            receipt_long
          </span>
          <span className="md-title-small font-semibold text-on-surface-variant uppercase tracking-wide text-[12px]">
            What this costs to run
          </span>
        </div>
        <CostRow icon="dns" label="VPS in Mumbai — server that runs the system 24×7" />
        <CostRow icon="hub" label="Kite Connect API — broker access for placing orders" />
        <CostRow icon="psychology" label="LLM calls — reasoning layer that scores each stock" />
        <CostRow icon="code" label="Months of evenings building, debugging, and tuning" />
        <p className="text-[12px] text-on-surface-variant mt-3 mb-0">
          Nothing here is subscription-gated. Any amount helps offset what it costs.
        </p>
      </div>

      {/* UPI */}
      {data && (
        <div
          className="bg-surface-container-low border rounded-2xl p-6 mb-5"
          style={{ borderColor: "var(--md-outline-variant)" }}
        >
          <div className="text-[11.5px] font-semibold uppercase tracking-widest text-on-surface-variant mb-3">
            Pay via UPI
          </div>
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl mb-3"
            style={{ background: "var(--md-surface-container-high)" }}
          >
            <span className="material-symbols-rounded text-on-surface-variant" style={{ fontSize: 20 }}>
              account_balance_wallet
            </span>
            <code className="font-mono text-[16px] font-semibold flex-1">{data.upi}</code>
            <button
              onClick={onCopy}
              aria-label="copy UPI"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all hover:bg-surface-container"
              style={{ color: "var(--md-primary)" }}
            >
              <span className="material-symbols-rounded" style={{ fontSize: 16 }}>
                {copied ? "check" : "content_copy"}
              </span>
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <p className="text-[12.5px] text-on-surface-variant m-0">
            Any amount. No expectations. Open to any UPI app — PhonePe, GPay, Paytm, BHIM.
          </p>
        </div>
      )}

      {/* GitHub */}
      {data && (
        <a
          href={data.github}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 px-5 py-4 rounded-2xl border transition-colors hover:bg-surface-container-high mb-5"
          style={{ borderColor: "var(--md-outline-variant)" }}
        >
          <span
            className="grid place-items-center w-10 h-10 rounded-xl flex-none"
            style={{ background: "var(--md-surface-container-high)", color: "var(--md-on-surface)" }}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </span>
          <div className="flex-1 min-w-0">
            <div className="md-body-medium font-semibold">Star or comment on GitHub</div>
            <div className="text-[12.5px] text-on-surface-variant truncate">{data.github}</div>
          </div>
          <span className="material-symbols-rounded text-on-surface-variant flex-none" style={{ fontSize: 18 }}>
            open_in_new
          </span>
        </a>
      )}

      <p className="text-[12px] text-on-surface-variant leading-relaxed m-0">
        I'm not asking out of pity — if you came this far, you probably understand what's been
        built. Support is welcome from people who get it. No obligation whatsoever.
      </p>
    </div>
  );
}
