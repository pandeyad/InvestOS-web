# InvestOS-web

Public read-only frontend for the InvestOS algorithmic trading journal. Vite + React 19 + Tailwind + Material Symbols. Deployed to Vercel (free tier).

**Zero secrets in this repo.** All auth (Google OAuth + session cookie) lives on the InvestOS backend, reached via Vercel's same-origin rewrite proxy.

---

## Architecture (₹0/yr)

```
Browser → https://investos.vercel.app           (this app, Vercel Hobby)
              │
              │ same-origin /api/*
              ▼
        Vercel rewrites internally
              │
              ▼
        https://investos.duckdns.org            (Caddy, Let's Encrypt, free)
              │
              ▼
        Contabo VPS Mumbai :8000 (FastAPI + Kite + APScheduler)
```

The browser only ever sees `investos.vercel.app`. Same-origin cookies, no CORS preflight, no `SameSite=None`.

```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://investos.duckdns.org/:path*" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## Pages & access tiers

| Route | Auth | What it shows |
|---|---|---|
| `/` | Public | Landing page + Google sign-in |
| `/today` | Viewer + Admin | Today's leads — direction, conviction, stop %, target % (no rupee amounts) |
| `/history` | Viewer + Admin | Lead history with 7 / 30 / 90 / 365 day windows, equity curve, per-lead cards |
| `/leaderboard` | Viewer + Admin | Win rate gauge, per-stock return stats, aggregate performance |
| `/lessons` | Viewer + Admin | LLM-distilled trading rules extracted from closed trades |
| `/tip-jar` | Public | UPI QR + buy-me-a-coffee |
| `/about` | Public | System journey, disclaimer, tech stack |
| `/subscribe` | Public | How to get read access |
| `/admin` | Admin only | Portfolio dashboard — capital breakdown, live holdings, open GTTs |
| `/admin/postmortems` | Admin only | Raw LLM post-mortems per trade |
| `/admin/broker` | Admin only | Kite connection status, manual token refresh |
| `/admin/control` | Admin only | Manual pipeline trigger, chase start/stop, system status |

**Auth tiers:**
- **Public**: no login needed
- **Viewer**: any Google account allowlisted via `INVESTOS_VIEWER_EMAILS`
- **Admin**: Google accounts in `INVESTOS_ADMIN_EMAILS` — sees full INR amounts, quantities, and admin routes

---

## Features

### Viewer-facing (anonymized — no INR amounts or quantities)
- **Today's leads** — real-time view of each day's shortlist: direction (LONG/SHORT), conviction score (0-100), stop % and target %, status (pending / executed / skipped). Prices and sizes never shown.
- **Equity curve** — SVG chart of cumulative returns over time, responsive across all screen sizes via `viewBox`.
- **Lead history** — filterable by time window; expandable cards with regime context, LLM verdict summary, and outcome.
- **Leaderboard** — win rate gauge, 3-column per-stock stats table (avg return, win %, trades), best/worst trade.
- **Lessons** — numbered rulebook distilled by the LLM from post-mortems of closed trades. Updated after each losing trade.

### Admin-only (full context)
- **Capital breakdown** — live INR values from Kite: available cash, invested, current value, P&L %, total portfolio.
- **Holdings table** — all open positions with qty, avg buy price, last price, allocation %.
- **GTT status** — open GTTs with stop/target prices and status.
- **Post-mortems** — raw per-trade LLM analysis with entry rationale, what went wrong, rule update.
- **Broker status** — Kite API health, access token age, auto-login status.
- **Manual triggers** — run premarket pipeline on demand, start/stop the intraday trailing-stop chase loop.

---

## Design system

**Ember Material** — custom Tailwind + Material Symbols theme:
- CSS variables for all colors: `--color-primary`, `--color-surface-*`, `--color-on-surface`, `--color-success`, `--color-error`
- Material Symbols Outlined icon font (variable: `wght 300`, `opsz 20`)
- Card-level animations: `animate-card-in`, `animate-row-in` with staggered delays
- Typography: Inter (variable) for body, `font-display` for hero headings

**Responsive breakpoints** (Tailwind defaults):
- `sm:` 640px — 2-column card grids, wider padding
- `md:` 768px — full table columns, multi-column layouts, sidebar grids
- `lg:` 1024px — 4-column capital card grid

Tables collapse to 2-column (symbol + key metric) on mobile and expand to full columns at `md:`.

---

## Guardrails for design changes

When using Claude Design or any AI tool to update this UI, follow these rules:

1. **Never expose INR amounts or position sizes to non-admin routes.** The anonymization boundary is `role === "admin"` — viewer routes show only percentages and direction.
2. **Color system is via CSS variables only** — never hardcode hex colors. Use `text-on-surface`, `bg-surface-1`, `bg-surface-2`, `text-primary` etc. from `index.css`.
3. **Icons must use Material Symbols** (`<span className="material-symbols-outlined">`). Do not introduce Heroicons, Lucide, or other icon libraries.
4. **No new external dependencies** unless discussed. The app intentionally has minimal deps: React, Tailwind, Vite, react-router-dom.
5. **Table collapse pattern**: on mobile, show Symbol + one key metric; hide other columns with `hidden md:block`. Do not use horizontal scroll for data tables.
6. **SVG charts**: always set `viewBox` + `width="100%"` for responsiveness. Never hardcode pixel widths without a `viewBox`.
7. **Auth gates stay**: every admin page wraps in an `isAdmin` check. Never remove or relax these.
8. **No state management library** — all server state is fetched directly with `useState` + `useEffect`. Keep it simple.
9. **`/api/*` prefix** for all backend calls — the Vercel rewrite depends on this. Never hardcode `http://localhost:8000` in production paths; use `import.meta.env.VITE_API_BASE`.
10. **Stick to existing page structure** — the Layout, nav, and route definitions in `App.tsx` are the contract. New pages must register in `App.tsx` and appear in `Layout.tsx` nav for the appropriate role.

---

## Dev setup

```bash
npm install
cp .env.example .env
# Set VITE_API_BASE=http://localhost:8000 (bypass the Vercel rewrite for local dev)
npm run dev    # → http://localhost:5173
```

Backend must run locally on `:8000` with:
```
INVESTOS_FRONTEND_ORIGINS=http://localhost:5173
INVESTOS_GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback
INVESTOS_COOKIE_SECURE=false
```

---

## Vercel deploy

```bash
npm install -g vercel
vercel login
vercel link

# Production env: relative path → triggers rewrite
vercel env add VITE_API_BASE production
# → enter: /api

vercel deploy --prod
```

Edit `vercel.json` if your DuckDNS subdomain changes.

---

## Companion

Backend: [InvestOS](../InvestOS) — FastAPI + Kite Connect + APScheduler on Contabo Mumbai, fronted by Caddy.
