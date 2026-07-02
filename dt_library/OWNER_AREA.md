# Owner Rates Area — setup & handover

A private, password-gated area where the site owner manages **rack** rate lists
and **net STO** supplier rates. Rates save to a database instantly and feed the
live site (agent STO pages + itinerary builder). Built July 2026.

> Not linked anywhere public. Reach it at **`/owner/`** (e.g. `https://namibiarates.com/owner/`).
> The page has `noindex` and holds no secrets in its source.

## What was added / changed
| File | Purpose |
|---|---|
| `owner/index.html` | The private admin UI (login + rack/STO editor). |
| `api/owner-rates.js` | Secure CRUD API (login / list / get / save / delete). Writes require the owner password. |
| `api/rack.js` | **Public** read of rack rates (flattened to `{n,p}`) for the builder overlay. Never serves STO. |
| `api/_ratesdb.js` | Shared helper: Redis connection + owner auth + rate storage. (Underscore = not a route.) |
| `api/sto.js` | **Edited** — now reads owner STO rates from the DB first, falls back to the existing inline `STO_DB`. |
| `builder/index.html` | **Edited** — overlays live rack rates from `/api/rack` on top of `/assets/rates-index.json`. |
| `package.json` | **New** — declares the `@upstash/redis` dependency so Vercel installs it. |

## Data model (Redis / Upstash)
- `rates:rack:<slug>` → `{ name, region, currency, validity, note, sections:[{title, rows:[[label, price], …]}] }`
- `rates:sto:<slug>`  → same shape plus `commission`
- `rates:index` → a set of every slug that has a rack and/or STO list
- `<slug>` is derived from the lodge name (e.g. "Camp Kwando" → `camp-kwando`).

## One-time setup (do this once, in order)
1. **Push the code.** In GitHub Desktop → Commit → Push (repo `Jaun-debug/antigravity-projects`).
   Vercel auto-deploys and runs `npm install` (installing `@upstash/redis`).
2. **Add the database.** Vercel dashboard → your project → **Storage** tab →
   **Create Database → Redis** (Upstash) → accept defaults → **Connect** it to the
   project for **all environments**. This auto-adds the connection env vars.
3. **Set your owner password.** Project → **Settings → Environment Variables** →
   add `OWNER_PASS` = *(a strong password you choose)* for Production (and Preview
   if you want). Save.
4. **Redeploy** so the new env vars take effect: Deployments → latest → **⋯ → Redeploy**.
5. Open **`/owner/`**, sign in with `OWNER_PASS`, and start adding rates.

## Safe-by-design fallbacks (nothing breaks before setup)
- No `OWNER_PASS` set → owner login returns a clear "not set up" message; nobody gets in.
- No database connected → login still works, but save/list report "Database not connected".
- `/api/rack` with no DB → returns empty; the builder just uses the static `rates-index.json`.
- `api/sto.js` if the DB is unreachable → silently falls back to the inline `STO_DB`; a valid
  agent login is never blocked.

## How rates flow to the live site
- **STO:** an owner STO list for a lodge overrides that lodge on the agent STO pages
  (via `api/sto.js`). Lodges not yet entered keep using the hardcoded `STO_DB`.
- **Rack:** the builder matches an owner rack list to a builder lodge **by name**
  (case-insensitive) and replaces its rate list. A rack list for a lodge that isn't in
  `rates-index.json` yet is **added** to the builder as a new lodge.
- The builder caches JSON hard — hard-refresh (⌘⇧R) after changes.

## Security notes
- Single owner password (`OWNER_PASS`); the session token is a hash of it, so changing the
  password signs everyone out. This matches the existing agent-auth pattern.
- STO (net/cost) rates are only ever returned by the authenticated `owner-rates` and the
  agent-gated `sto` endpoints — never by the public `rack` endpoint or in page source.
- Optional hardening: gate `/owner` in `middleware.js` too, and add `Disallow: /owner`
  to `robots.txt`.

## Migrating the existing hardcoded STO_DB (optional)
Not required — the site falls back to `STO_DB` automatically. If you want a lodge fully
managed in the owner area, just re-enter it there; your entry then takes precedence.
