# InvestOS-web

Public read-only frontend for the InvestOS algorithmic trading journal. Vite + React 19 + Tailwind + Material Symbols. Deployed to Vercel (Hobby).

**Zero secrets in this repo.** All auth (Google OAuth + session cookie) lives on the InvestOS backend, reached via Vercel's same-origin rewrite proxy.

---

## Architecture (₹0/yr)

```
Browser → https://whatibought.in                 (this app, Vercel Hobby)
              │
              │ same-origin /api/*
              ▼
        Vercel rewrites internally
              │
              ▼
        https://api.whatibought.in               (Caddy, Let's Encrypt, free)
              │
              ▼
        India VPS :8000 (FastAPI + Kite + APScheduler)
```

The browser only ever sees `whatibought.in`. Same-origin cookies, no CORS preflight, no `SameSite=None`. `investos.duckdns.org` is kept as a fallback for `api`.

In production `VITE_API_BASE=/api`; the `/api/* → https://api.whatibought.in/*`
rewrite (and the SPA fallback to `index.html`) are configured in the Vercel project
settings. In dev, `VITE_API_BASE=http://localhost:8000` talks to FastAPI directly.

---

## Pages & access tiers

| Route | Auth | What it shows |
|---|---|---|
| `/` | Public | Landing page + Google sign-in |
| `/today` | Viewer + Admin | Today's picks — direction, conviction, stop %, target % (no rupee amounts) |
| `/universe` | Viewer + Admin | Full ranked universe with per-stock factors, fundamentals, news |
| `/history` | Viewer + Admin | Pick history with 7 / 30 / 90 / 365 day windows, equity curve, per-pick cards |
| `/leaderboard` | Viewer + Admin | Win rate gauge, per-stock return stats, aggregate performance |
| `/tip-jar` | Public | UPI handle + support links |
| `/about` | Viewer + Admin | System overview, disclaimer, tech stack |
| `/subscribe` | Public | How to get notified of new picks |
| `/admin` | Admin only | Portfolio dashboard — capital breakdown, live holdings, open GTTs |
| `/admin/postmortems` | Admin only | Raw LLM post-mortems per trade |
| `/admin/broker` | Admin only | Kite connection status, manual token refresh |
| `/admin/control` | Admin only | Manual pipeline trigger, chase start/stop, system status |
| `/lessons` | Admin only | LLM-distilled trading rules extracted from closed trades |
| `/retro` | Admin only | Daily system retrospective — market card, selection scorecard, missed winners, LLM narrative |

**Auth tiers** (role derived per request from env — no role stored in the DB):
- **Public**: no login needed
- **Viewer**: any signed-in Google account
- **Admin**: Google accounts in `INVESTOS_ADMIN_EMAILS` — sees full INR amounts, quantities, and admin routes

---

## Features

### Viewer-facing (anonymized — no INR amounts or quantities)
- **Today's picks** — each day's shortlist: direction (LONG/SHORT), conviction (0–1), stop % and target %, status. Prices and sizes never shown.
- **Equity curve** — cumulative % return over time vs. the NIFTY benchmark (recharts).
- **Pick history** — filterable by time window; expandable cards with regime context and outcome.
- **Leaderboard** — win rate gauge, per-stock stats table, best/worst trade.

### Admin-only (full context)
- **Capital breakdown** — live INR values from Kite: available cash, invested, current value, P&L %.
- **Holdings + GTT status** — open positions and their active stop/target GTTs.
- **Post-mortems** — raw per-trade LLM analysis; **Lessons** — the distilled rulebook.
- **Retrospective** — the system grading itself daily (breadth, sector rotation, missed winners, picks-vs-rejects edge, fast-stress + defensive-sleeve stats).
- **Broker status** + **manual triggers** — Kite health, run premarket on demand, start/stop the chase loop.

---

## Design system

**Ember Material** — custom Tailwind + Material Symbols theme:
- CSS variables for all colors (`--md-primary`, `--md-surface-*`, `--md-on-surface`, `--md-error`, …)
- Material Symbols Rounded icon font (`<span className="material-symbols-rounded">`)
- Card-level animations: `animate-card-in`, `animate-row-in` with staggered delays
- Typography: Inter (variable) for body, `md-headline-*` / `md-title-*` / `md-body-*` scale

---

## Guardrails for design changes

1. **Never expose INR amounts or position sizes to non-admin routes.** The anonymization boundary is `role === "admin"`; viewer routes show only percentages and direction. The backend enforces this too via `projections.py` (CI-gated).
2. **Color system is via CSS variables only** — never hardcode hex. Use the `--md-*` tokens.
3. **Icons must use Material Symbols Rounded.** No Heroicons/Lucide/etc.
4. **Keep deps minimal.** Current runtime deps: React, react-router-dom, recharts (charts), `@vercel/analytics`. Discuss before adding more.
5. **SVG/recharts charts**: responsive containers only — never hardcode pixel widths.
6. **Auth gates stay**: every admin page wraps in `RequireAdmin`. Never relax these.
7. **No state management library** — server state via `useState` + `useEffect` through `src/lib/api.ts`.
8. **`/api/*` prefix** for all backend calls (the Vercel rewrite depends on it); use `import.meta.env.VITE_API_BASE`.
9. **Stick to the route contract** — new pages register in `App.tsx` and appear in `Layout.tsx` nav for the right role.

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

## Deploy

Auto-deploys on push to `main` (Vercel Hobby, project linked to this repo). Production
`VITE_API_BASE=/api` so calls go through the same-origin rewrite configured in the
Vercel project settings. Web Analytics is enabled via `@vercel/analytics` (cookieless —
no consent banner).

---

## Companion

Backend: [InvestOS](../InvestOS) — FastAPI + Kite Connect + APScheduler on an India VPS (`ovh1`), MySQL on a Tailscale-only Mumbai host, fronted by Caddy at `api.whatibought.in`.
