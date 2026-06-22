# InvestOS-web

Public read-only frontend for the InvestOS trading journal. Vite + React 19 + Tailwind. Deployed to Vercel.

**Zero secrets in this repo.** All auth (Google OAuth + JWT session cookie) lives on the InvestOS backend, reached via Vercel's same-origin rewrite proxy.

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
        Contabo VPS:8000 (FastAPI backend)
```

The browser only ever sees `investos.vercel.app`. The rewrite is configured in `vercel.json`:

```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://investos.duckdns.org/:path*" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Same-origin means cookies, auth, and CSRF all work cleanly without `SameSite=None` (which breaks in Safari/Brave) and without CORS preflight.

## Dev

```bash
npm install
cp .env.example .env
# Set VITE_API_BASE=http://localhost:8000 (direct to local backend, no rewrite)
npm run dev    # → http://localhost:5173
```

Make sure the backend is running locally on `:8000` with:

```
INVESTOS_FRONTEND_ORIGINS=http://localhost:5173
INVESTOS_GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback
INVESTOS_COOKIE_SECURE=false
```

## Deploy to Vercel

```bash
npm install -g vercel
vercel login
vercel link            # connect this repo to a Vercel project

# Set production env: relative path → triggers the rewrite
vercel env add VITE_API_BASE production
# → enter: /api

vercel deploy --prod
```

The Vercel-assigned URL (e.g. `https://investos-web.vercel.app`) is your production frontend. No DNS to configure — Vercel handles its own subdomain.

Edit `vercel.json` if your DuckDNS subdomain isn't `investos.duckdns.org`.

## Pages

| Route | Visible to | What it shows |
|---|---|---|
| `/` | Anyone | Landing + sign-in |
| `/today` | Viewer + Admin | Today's trades (anonymized: prices and % only) |
| `/history` | Viewer + Admin | Lead history (7/30/90/365 day windows) |
| `/leaderboard` | Viewer + Admin | Per-stock + aggregate stats |
| `/lessons` | Viewer + Admin | Distilled trading rules |
| `/tip-jar` | Anyone | UPI + buy-me-a-coffee |
| `/about` | Anyone | Journey + legal disclaimer |
| `/admin` | Admin only | Owner dashboard (INR + qty) |
| `/admin/postmortems` | Admin only | Raw post-mortems |
| `/admin/broker` | Admin only | Kite connection status + manual token refresh |
| `/admin/control` | Admin only | Pipeline / chase start-stop |

## Companion repo

Backend: [InvestOS](../InvestOS) — FastAPI on Contabo Mumbai, fronted by Caddy at `investos.duckdns.org`.

Deployment runbook: `~/quant/InvestOS/docs/plans/2026-06-21-deploy-runbook.md`
