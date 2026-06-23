/**
 * Deterministic 20-point sparkline path from a stock's momentum + RSI.
 *
 * Pure function of (mom12, rsi) — no Math.random — so the same stock always
 * renders the same shape. Returns a `points` string for an SVG <polyline>
 * sized for a 120×32 viewBox. Shared by Today's lead cards and the Universe grid.
 */
export function spark(mom12: number | null, rsi: number | null): string {
  const n = 20;
  const slope = (mom12 ?? 5) / 100;
  const base = 28 - Math.min(22, Math.max(4, ((rsi ?? 55) / 100) * 22));
  const pts: string[] = [];
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * 120;
    const y = Math.max(2, Math.min(30, base - slope * i * 1.3 + Math.sin(i * 1.7) * 2.5 + Math.cos(i * 2.9) * 1.5));
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return pts.join(" ");
}
