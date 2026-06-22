export function Disclaimer({ text }: { text?: string }) {
  return (
    <div className="text-xs text-zinc-500 border border-zinc-800 rounded p-3 mb-4">
      {text ||
        "Personal trading journal. Not investment advice. Past performance does not guarantee future results."}
    </div>
  );
}
