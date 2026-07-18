# Self-Serve Rack Rates — Scope

**Goal:** Owner (Jaun) loads rack rates once in the `/owner/` admin; they appear
live on the lodge pages automatically, no redeploy. STO net rates stay
agent-gated and are loaded by Jaun via Claude (manual). Single owner — no
per-supplier logins.

## Roles
- **Rack rates** — owner self-loads via `/owner/` admin → auto-publishes to lodge pages.
- **STO rates** — remain in gated `/ratesheets/`; owner supplies them to Claude to add.
- **Access** — one owner password (`OWNER_PASS`), owner-only. No supplier accounts.

## Already built (works, no build needed)
- **Database** — Upstash Redis via `api/_ratesdb.js`. Model:
  `rates:rack:<slug>`, `rates:sto:<slug>`, `rates:index`.
- **Admin UI** — `/owner/index.html`: login, pick lodge, enter rack/STO sections, Save/Delete.
- **Write API** — `api/owner-rates.js` (owner-authed: login/list/get/save/delete).
- **Public read API** — `api/rack.js` (`GET /api/rack?slug=…`), already consumed
  live by the Itinerary Builder → pipeline proven end to end.

## The one missing link
- Lodge pages don't read `/api/rack`. They show static "Rate to follow."
  Everything upstream of the lodge page is done.

## Work to do
1. **Prerequisites (owner action in Vercel — blocking):**
   - Provision the Upstash Redis database (Vercel → Storage) and connect it to the
     project. Auto-injects the connection env vars the code reads.
   - Add `OWNER_PASS` env var (Production) = a private password Jaun chooses.
   - Status at scoping: `/api/rack` returns empty and `OWNER_PASS` not visible in
     env vars → both appear to still need doing.
2. **Wire the lodge pages (core, ~200 files, scriptable):**
   - Each page has its slug (`var LODGE='<slug>'`). On load, fetch
     `/api/rack?slug=<slug>` (or a sectioned variant to preserve seasons).
   - If rates exist → render into the Rates section; else keep "Rate to follow."
   - Leave STO redirect/logic untouched.
   - Note: `/api/rack` currently flattens (loses season sections). Decide whether
     to render flat, or add a sectioned read so Low/High Season structure is kept.
3. **Admin polish:** verify full loop; improve lodge selection (dropdown vs typing slug).
4. **Test:** load one rate in `/owner/`, confirm it appears live on the lodge page
   with no redeploy.

## Effort
Medium. Backend ≈ done. Real work = lodge-page wiring + enabling DB/`OWNER_PASS`
+ light admin polish.

## Phase 2 (optional, later)
Supplier self-service (each supplier logs in, restricted to their own lodges).
Bigger: per-supplier accounts + permissions. Ties to the privacy/trust discussion.
