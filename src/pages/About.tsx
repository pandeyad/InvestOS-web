function TimelineCard({
  icon,
  containerColor,
  containerFg,
  title,
  body,
}: {
  icon: string;
  containerColor: string;
  containerFg: string;
  title: string;
  body: string;
}) {
  return (
    <div
      className="bg-surface-container-low border rounded-2xl p-5 text-center"
      style={{ borderColor: "var(--md-outline-variant)" }}
    >
      <span
        className="inline-grid place-items-center w-11 h-11 rounded-xl mb-2.5"
        style={{ background: containerColor, color: containerFg }}
      >
        <span className="material-symbols-rounded">{icon}</span>
      </span>
      <div className="md-title-small font-semibold">{title}</div>
      <div className="text-[12.5px] text-on-surface-variant mt-1">{body}</div>
    </div>
  );
}

export function About() {
  return (
    <div className="max-w-[820px] mx-auto px-8 py-10 pb-20 animate-view-in">
      <h1 className="md-headline-large m-0 mb-5">About</h1>
      <p className="md-body-large m-0 mb-4" style={{ lineHeight: 1.65 }}>
        This is my personal trading journal. I run a NIFTY-100 equity-rotation system that picks
        trades pre-market, places them at the open, and manages exits with trailing stops. I publish
        the same trades I take, with the reasoning behind each one, so anyone curious can follow
        along.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 my-7">
        <TimelineCard
          icon="wb_twilight"
          containerColor="var(--md-primary-container)"
          containerFg="var(--md-on-primary-container)"
          title="08:30 — pick"
          body="Funnel ranks the universe; reasoning selects the day's leads."
        />
        <TimelineCard
          icon="flag"
          containerColor="var(--md-tertiary-container)"
          containerFg="var(--md-on-tertiary-container)"
          title="09:15 — place"
          body="Orders go in at the open with stops and targets attached."
        />
        <TimelineCard
          icon="trending_down"
          containerColor="var(--md-secondary-container)"
          containerFg="var(--md-on-secondary-container)"
          title="15:30 — manage"
          body="A chase loop trails stops intraday until the close."
        />
      </div>

      <p className="md-body-large m-0 mb-4 text-on-surface-variant" style={{ lineHeight: 1.65 }}>
        I am not a SEBI-registered investment adviser or research analyst. Nothing here is a
        recommendation. If you choose to act on anything you read here, that is your decision and
        your risk.
      </p>

      <h2 className="md-title-large mt-7 mb-2" style={{ fontWeight: 500 }}>
        Contact
      </h2>
      <p className="md-body-medium m-0 text-on-surface-variant">
        pandeyad22 [at] gmail [dot] com
      </p>
    </div>
  );
}
