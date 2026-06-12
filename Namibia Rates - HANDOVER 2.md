# Namibia Rates — Trade Engine Handover (Session 2)

Paste this into a new chat to resume. Last updated: 12 June 2026.

## 0. How to use this
You're continuing the build of the **per-agent trade rate engine** on namibiarates.com.
Read §3 (Architecture) and §5 (Status) and §6 (Next steps), then ask me where to continue.
The repo is `~/Desktop/AG Projects` (branch `main`, GitHub: Jaun-debug/antigravity-projects).
The live trade portal deploys from the **`dt_library`** folder (Vercel project `dt_library`,
Root Directory `dt_library`, serves namibiarates.com + dtlibrary.vercel.app).

## 1. The goal (what the engine does)
Two views of every lodge:
- **Public (no login):** RACK rates only. Net STO must never appear in public page source.
- **Agent (login required):** signs in ONCE on the homepage; from then on every lodge they
  have a contract with opens the BOOKABLE sheet at their net STO rate. Lodges with no
  contract show a "contact the supplier for your special contracted rate" notice.
- Right now there is ONE agent: **Desert Tracks (Jaun)**, contracted with every lodge that
  has a rate sheet. Credentials: username `desert tracks`, password `passme9cops`.

## 2. Rate math (VERIFIED — important)
- **rack = STO ÷ (1 − STO%)**. Confirmed against sheets that print both: Wolwedans
  STO 11,920 vs Rack 14,900 (= ÷0.80); Chiwani ÷0.85. For 20% STO, rack = STO ÷ 0.8 = ×1.25.
- The numbers currently/originally on the site were **STO (net)**, NOT rack — confirmed.
- User's chosen fallback for lodges that state **no %**: just **STO × 1.20** ("+20%").
- Oddballs still to confirm: Africa Safari Lodge ("STO 40% non-commissionable" → ×1.667,
  probably wrong), NWR ("at NWR discretion", rack-based), Belvedere ("rack less 10%").

## 3. ARCHITECTURE — how it's built (source of truth)
The safe model chosen: **gate the existing bookable STO sheets; serve separate public rack pages.**
Net STO numbers were NOT edited inside the 61 sheets (no mispricing risk) — the sheets are
simply locked, and rack pages are generated separately.

Key files (all under `dt_library/`):

1. **`api/sto.js`** — Vercel serverless function. Issues a session token =
   `sha256('nr-agent-session|' + AGENT_PASS)` sliced to 40 hex chars. Accepts
   `{username,password}` → `{ok,token}`; or `{token, lodge}` → `{ok,token,lodge,rates}`.
   Validates against env vars. (Holds Camp Kwando STO as legacy demo data; the real STO for
   all other lodges lives inside the gated sheets, not here.)

2. **`middleware.js`** — Vercel Edge Middleware. `config.matcher = '/ratesheets/:path*'`.
   Reads cookie `nr_session`, recomputes the expected token from `AGENT_PASS` (Web Crypto
   sha256) and compares. Valid → allow the sheet to load; otherwise → redirect to `/?agent=1`
   (homepage sign-in). **Fails closed** (missing AGENT_PASS → deny, never leak).

3. **`namibia_agent_portal.html`** — the live portal. Changes made:
   - `accommodationPageMap` now has **108 entries** (lodge name → `/accommodation/<slug>/`).
     `openLogin()` checks this FIRST, so a lodge click routes to its public rack page.
   - `submitAgentLogin()` "secure bridge": POSTs the entered creds to `/api/sto`; on success
     stores `localStorage['nr_agent_token']` AND sets cookie `nr_session` (so middleware
     unlocks the sheets). Login is now QUIET — it no longer auto-opens the old workspace; it
     shows a toast, and if a lodge was pending it redirects there.
   - `logoutAgent()` clears the token + cookie.
   - On load, opens the sign-in modal if URL has `#agent` or `?agent=1`.
   - `openLogin()` fallthrough now ignores the legacy non-deployed `individual_rates.html` /
     `vehicle_rates.html` and calls `showContactSupplier(lodgeName)` (a small modal).
   - Camp Kwando repointed to `/accommodation/camp-kwando/`.

4. **`accommodation/<slug>/index.html`** — 108 public RACK pages (slug = kebab of lodge name):
   - 49 single-lodge (from `singleRateSheetMap`) — rack computed from extracted STO
     (stated % → ÷(1−%); unknown % → ×1.20).
   - Camp Kwando — bespoke page: real Wetu photos, contact card (Lodge tel +264 81 209 9033,
     Reservations +264 81 149 1435, P.O. Box 8016 Kongola), inline STO via /api/sto when logged in.
   - 58 group lodges (from `groupRateSheetMap`): **17 "lifted"** (real embedded rack tables
     pulled from the sheet's JS `DB` object, e.g. O&L/Strand), **41 "+20%"** (STO × 1.20).
   - Each page: rack table(s) + "Rack Rates" badge + a CTA that, when a session token exists,
     becomes "View & book your STO rate →" linking to the gated `/ratesheets/<file>`.

5. **Bookable STO sheets** = `ratesheets/*.html` (61 files, unchanged). Now gated by middleware.
   Group files hold multiple properties keyed by `?lodge=KEY` (see `groupRateSheetMap`).

## 4. Vercel config (DONE)
- Project `dt_library`, Root Directory `dt_library`, Production serves namibiarates.com.
- Environment Variables SET in Production: `AGENT_USER = desert tracks`,
  `AGENT_PASS = passme9cops`. (Redeploy needed after any env change.)

## 5. CURRENT STATUS
**Deployed & live (first batch was pushed; gate confirmed via incognito test → /?agent=1):**
- middleware.js, api/sto.js, portal with the 50-entry map, 49 single-lodge rack pages, Camp Kwando.

**Built locally but NOT YET PUSHED (push these next):**
- `namibia_agent_portal.html` — 108-entry accommodationPageMap + Beach-Lodge fix + contact-supplier modal.
- the 58 new group rack pages under `accommodation/`.

**Held back — do NOT push (these expose STO):**
- `dt_library/vehicle_rates.html`, `dt_library/activity_rates.html` (restored from the vault,
  parked pending a decision).

**Review artifact:** `Namibia_Rate_Review.xlsx` (in AG Projects root) — Summary + All-rates tabs,
779 rows, rack as a live formula. User to double-check the numbers.

## 6. NEXT STEPS (pick up here)
1. **Push the latest batch** (108-map portal + 58 group pages). Test: Strand → rack page (4,397…);
   Beach Lodge → "contact supplier" modal.
2. **5 Natural Selection lodges** still uncovered (file `natural_selection_ratesheet_v1_4.html`,
   keys: hoanibvalley, shipwreck, hoanibel, kwessidunes, nkasalinyanti). Different data
   structure — need a dedicated extractor → rack pages. Until then they show "contact supplier".
3. **Rate verification** — user reviews `Namibia_Rate_Review.xlsx`. Note the 41 "+20%" group
   pages are marginally low where a real tier is stated (e.g. Gondwana 20/25% should be ÷0.8/÷0.75).
4. **Confirm oddballs:** Africa Safari (40%), NWR (discretion), Belvedere (10%).
5. **vehicle_rates.html / activity_rates.html** — decide: gate them, convert to rack, or drop.
6. **Legacy cleanup (optional):** the portal's old client-side `agentCredentials` prototype
   still defaults a blank login to 'ultimate' and the sign-in modal still shows "Quick tester
   logins (no password needed): Ultimate Safaris / Sense of Africa / Discover Africa / Admin
   Console". Only the real `desert tracks` / `passme9cops` login sets the secure cookie — the
   tester logins do NOT unlock real STO. Consider removing them to avoid confusion.

## 7. Working rules / how I operate
- I edit files in the repo; **you push via GitHub Desktop** (commit → Push origin → auto-deploys).
- I cannot run git push or operate Vercel — I give exact steps, you click.
- Net STO stays server-side / behind the gate, never in public page source.
- The workspace bash mount **cannot delete files** (deletes are blocked) — overwrite instead;
  the Read/Write/Edit tools work fine on the connected folder.
- Slug convention: lodge name → lowercased, non-alphanumeric → hyphen (e.g. "Strand Hotel
  Swakopmund" → `strand-hotel-swakopmund`).

## 8. Quick test script (after deploy)
1. Incognito (logged out): open `namibiarates.com/ratesheets/camp_kwando_ratesheet_v3.html` →
   should REDIRECT to `/?agent=1` (sign-in), NOT show STO. ✅ = gate works.
2. Click a lodge (e.g. Epako, Strand) → public RACK page.
3. Homepage → Agent Sign In → `desert tracks` / `passme9cops` → "Signed in" toast (no workspace popup).
4. Re-open the same `/ratesheets/...` URL → now LOADS the bookable STO sheet.
5. Sign out → sheet is gated again.
