function Step({
  num,
  icon,
  title,
  children,
}: {
  num: number;
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-5">
      <div className="flex flex-col items-center flex-none">
        <div
          className="grid place-items-center w-9 h-9 rounded-full text-[14px] font-bold flex-none"
          style={{ background: "var(--md-primary)", color: "var(--md-on-primary)" }}
        >
          {num}
        </div>
        <div className="flex-1 w-px mt-2" style={{ background: "var(--md-outline-variant)" }} />
      </div>
      <div className="pb-8">
        <div className="flex items-center gap-2 mb-2">
          <span
            className="grid place-items-center w-8 h-8 rounded-lg"
            style={{
              background: "var(--md-surface-container-high)",
              color: "var(--md-on-surface-variant)",
            }}
          >
            <span className="material-symbols-rounded" style={{ fontSize: 18 }}>{icon}</span>
          </span>
          <span className="md-title-small font-semibold">{title}</span>
        </div>
        <div className="md-body-medium text-on-surface-variant" style={{ lineHeight: 1.7 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export function Subscribe() {
  const topic = "whatibought-picks";

  return (
    <div className="max-w-[680px] mx-auto px-8 py-10 pb-20 animate-view-in">
      <div className="flex items-center gap-3 mb-2">
        <span
          className="grid place-items-center w-11 h-11 rounded-xl flex-none"
          style={{ background: "var(--md-primary-container)", color: "var(--md-on-primary-container)" }}
        >
          <span className="material-symbols-rounded">notifications_active</span>
        </span>
        <h1 className="md-headline-large m-0">Get notified</h1>
      </div>
      <p className="md-body-large m-0 mb-8 text-on-surface-variant" style={{ lineHeight: 1.7 }}>
        Every morning when the system publishes new picks, a push notification goes out.
        No account needed — just the free ntfy app.
      </p>

      {/* How it works callout */}
      <div
        className="flex items-start gap-3 px-5 py-4 rounded-xl border mb-8 text-[13.5px]"
        style={{
          borderColor: "var(--md-outline-variant)",
          background: "var(--md-surface-container)",
          lineHeight: 1.6,
        }}
      >
        <span className="material-symbols-rounded flex-none mt-0.5" style={{ fontSize: 18, color: "var(--md-primary)" }}>
          info
        </span>
        <span className="text-on-surface-variant">
          This uses <strong className="text-on-surface">ntfy.sh</strong> — an open-source push
          notification service. Free, no sign-up, no tracking. The backend sends a message to
          the topic; your phone receives it.
        </span>
      </div>

      {/* Steps */}
      <div>
        <Step num={1} icon="download" title="Install ntfy">
          Download the ntfy app:{" "}
          <a
            href="https://apps.apple.com/app/ntfy/id1625396347"
            target="_blank"
            rel="noreferrer"
            className="underline"
            style={{ color: "var(--md-primary)" }}
          >
            iOS (App Store)
          </a>
          {" · "}
          <a
            href="https://play.google.com/store/apps/details?id=io.heckel.ntfy"
            target="_blank"
            rel="noreferrer"
            className="underline"
            style={{ color: "var(--md-primary)" }}
          >
            Android (Play Store)
          </a>
          . It's free and open source.
        </Step>

        <Step num={2} icon="add_circle" title="Subscribe to the topic">
          Open ntfy → tap <strong className="text-on-surface">+</strong> →{" "}
          <strong className="text-on-surface">Subscribe to topic</strong>. Enter:
          <div
            className="mt-3 flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{ background: "var(--md-surface-container-high)" }}
          >
            <code className="font-mono text-[16px] font-semibold flex-1">{topic}</code>
            <button
              onClick={() => navigator.clipboard?.writeText(topic)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[13px] font-medium transition-all hover:bg-surface-container"
              style={{ color: "var(--md-primary)" }}
            >
              <span className="material-symbols-rounded" style={{ fontSize: 16 }}>content_copy</span>
              Copy
            </button>
          </div>
          <div className="mt-2 text-[12.5px]">
            Server: leave as <code className="font-mono">ntfy.sh</code> (default).
          </div>
        </Step>

        <Step num={3} icon="check_circle" title="Done — you'll get notified">
          That's it. When picks are published (typically 09:00–09:15 IST on trading days),
          your phone will show a notification. Sign in here to see the full list with rationale.
        </Step>
      </div>

      {/* Or open directly */}
      <div
        className="bg-surface-container-low border rounded-2xl p-5 mb-6"
        style={{ borderColor: "var(--md-outline-variant)" }}
      >
        <div className="text-[12px] font-semibold uppercase tracking-widest text-on-surface-variant mb-3">
          Or open directly in a browser
        </div>
        <a
          href={`https://ntfy.sh/${topic}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-[14px] font-medium underline"
          style={{ color: "var(--md-primary)" }}
        >
          ntfy.sh/{topic}
          <span className="material-symbols-rounded" style={{ fontSize: 16 }}>open_in_new</span>
        </a>
        <p className="text-[12.5px] text-on-surface-variant mt-2 mb-0">
          Shows the notification history in the browser. The ntfy app delivers them in real time.
        </p>
      </div>

      <p className="text-[12px] text-on-surface-variant leading-relaxed m-0">
        Notifications are sent only when the pipeline finds picks — typically on trading days.
        On weekends, holidays, or when the regime filter says "no trades today", nothing is sent.
      </p>
    </div>
  );
}
