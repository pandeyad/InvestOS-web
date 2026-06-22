export function Disclaimer({ text }: { text?: string }) {
  return (
    <div
      className="flex gap-3 px-4 py-3 rounded-2xl bg-surface-container-low border text-[13px] leading-relaxed text-on-surface-variant"
      style={{ borderColor: "var(--md-outline-variant)" }}
    >
      <span className="material-symbols-rounded flex-none" style={{ fontSize: 20 }}>
        gavel
      </span>
      <span>
        {text ||
          "This is a personal trading journal. Not investment advice or a recommendation — I'm sharing what I do with my own capital. Past performance does not guarantee future results."}
      </span>
    </div>
  );
}
