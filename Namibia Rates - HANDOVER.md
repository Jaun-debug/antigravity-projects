# Namibia Rates — Project Handover

*Paste this into a new chat to resume. Last updated: 12 June 2026.*

---

## 0. How to use this
You're continuing the build of the **per-agent trade rate engine** on namibiarates.com.
Read §3 (Architecture), §5 (Status) and §6 (Next steps), then ask me where to continue.
Repo: `~/Desktop/AG Projects` (branch `main`, GitHub: Jaun-debug/antigravity-projects).
The live trade portal deploys from the **`dt_library`** folder (Vercel project `dt_library`,
Root Directory `dt_library`, serves namibiarates.com + dtlibrary.vercel.app).

> ⚠️ **The whole site is currently in "under construction" mode: the rates shown are
> FICTITIOUS sample rates, and the STO gate is TEMPORARILY DISABLED** (see §3.2). Re-enable
> the gate before real rates go live.

## 1. The goal (what the engine does)
Two views of every lodge:
- **Public (no login):** RACK rates only. Net STO must never appear in public page source.
- **Agent (login required):** signs in ONCE on the homepage; from then on every lodge they
  have a contract with opens the BOOKABLE sheet at their net STO rate. Lodges with no
  contract show a "contact the supplier for your special contracted rate" notice.
- Right now there is ONE agent: **Desert Tracks (Jaun)**, contracted with every lodge that has
  a rate sheet. Credentials: username `desert tracks`, password `passme9cops`.

## 2. Rate math (VERIFIED — important)
- **rack = STO ÷ (1 − STO%)**. Confirmed on sheets printing both: Wolwedans STO 11,920 vs
  Rack 14,900 (= ÷0.80); Chiwani ÷0.85. For 20% STO, rack = STO ÷ 0.8 = ×1.25.
- The numbers originally on the site were **STO (net)**, NOT rack — confirmed.
- User's chosen fallback for lodges that state **no %**: **STO × 1.20** ("+20%").
- Oddballs to confirm: Africa Safari Lodge ("STO 40% non-commissionable" → ×1.667, probably
  wrong), NWR ("at NWR discretion", rack-based), Belvedere ("rack less 10%").

## 3. ARCHITECTURE — how it's built (source of truth)
Safe model chosen: **gate the existing bookable STO sheets; serve separate public rack pages.**
Net STO numbers were NOT edited inside the 61 sheets (no mispricing risk) — the sheets are
simply locked, and rack pages are generated separately. Key files (under `dt_library/`):

### 3.1
1. **`api/sto.js`** — serverless function. Issues a session token =
   `sha256('nr-agent-session|' + AGENT_PASS)` (40 hex chars). Accepts `{username,password}` →
   `{ok,token}`; or `{token,lodge}` → `{ok,token,lodge,rates}`. Validates against env vars.
   (Holds Camp Kwando STO as legacy demo data; real STO for other lodges lives in the gated sheets.)

2. **`middleware.js`** — Vercel Edge Middleware gating `/ratesheets/:path*`. Reads cookie
   `nr_session`, recomputes the expected token from `AGENT_PASS` and compares. Valid → allow;
   else → redirect to `/?agent=1`. **Fails closed.**

3. **`namibia_agent_portal.html`** — the live portal:
   - `accommodationPageMap` = **108 entries** (lodge → `/accommodation/<slug>/`). `openLogin()`
     checks it first, so a lodge click routes to its public rack page.
   - `submitAgentLogin()` secure bridge: POSTs creds to `/api/sto`; on success sets
     `localStorage['nr_agent_token']` + cookie `nr_session`. Login is QUIET (toast, no workspace
     popup); redirects to a pending lodge if any.
   - `logoutAgent()` clears token + cookie. On load, opens sign-in if URL has `#agent`/`?agent=1`.
   - `openLogin()` fallthrough ignores legacy non-deployed `individual_rates.html` /
     `vehicle_rates.html` and calls `showContactSupplier(lodgeName)` (a modal).
   - Camp Kwando repointed to `/accommodation/camp-kwando/`.

4. **`accommodation/<slug>/index.html`** — 108 public RACK pages (slug = kebab of name):
   - 49 single-lodge (rack from extracted STO: stated % → ÷(1−%); unknown → ×1.20).
   - Camp Kwando — bespoke (real Wetu photos; contact card: Lodge tel +264 81 209 9033,
     Reservations +264 81 149 1435, P.O. Box 8016 Kongola; inline STO via /api/sto when logged in).
   - 58 group lodges: **17 "lifted"** (real embedded rack tables from the sheet's JS `DB` object,
     e.g. O&L/Strand) + **41 "+20%"** (STO × 1.20).
   - Each page: rack table(s) + "Rack Rates" badge + CTA → "View & book your STO rate →"
     (links to gated `/ratesheets/<file>`) when a session token exists.

5. **Bookable STO sheets** = `ratesheets/*.html` (61 files, unchanged), gated by middleware.
   Group files hold multiple properties keyed by `?lodge=KEY` (see `groupRateSheetMap`).

### 3.2 ⚠️ GATE CURRENTLY DISABLED
`middleware.js` now has `const ENABLE_GATE = false;` at the top and returns early, so
**/ratesheets/ STO pages are openly accessible right now** (intentional — sample/fictitious
rates during construction). To re-enable privacy: set `ENABLE_GATE = true` (the full gated
logic is still in the file below that line).

## 4. Vercel config (DONE)
- Project `dt_library`, Root Directory `dt_library`, Production = namibiarates.com.
- Env vars SET in Production: `AGENT_USER = desert tracks`, `AGENT_PASS = passme9cops`.
  (Redeploy after any env change.)

## 5. CURRENT STATUS
**Live (pushed):** middleware.js (now gate-disabled), api/sto.js, portal w/ the 50-entry map,
49 single-lodge rack pages, Camp Kwando. Gate was confirmed working earlier before being disabled.

**Built locally, may still need pushing — confirm with `git status`:**
- `namibia_agent_portal.html` with the 108-entry map + Beach-Lodge fix + contact-supplier modal.
- the 58 group rack pages under `accommodation/`.

**Held back — do NOT push (expose STO):** `dt_library/vehicle_rates.html`,
`dt_library/activity_rates.html` (restored from vault, parked).

**Review artifact:** `Namibia_Rate_Review.xlsx` (AG Projects root) — Summary + All-rates tabs,
779 rows, rack as a live formula. User to double-check numbers.

## 6. NEXT STEPS (pick up here)
1. **Push the latest batch** (108-map portal + 58 group pages). Test: Strand → rack page;
   Beach Lodge → "contact supplier" modal.
2. **5 Natural Selection lodges** uncovered (`natural_selection_ratesheet_v1_4.html` keys:
   hoanibvalley, shipwreck, hoanibel, kwessidunes, nkasalinyanti) — different structure, need a
   dedicated extractor → rack pages. Until then they show "contact supplier".
3. **Rate verification** — review `Namibia_Rate_Review.xlsx`. The 41 "+20%" group pages are
   marginally low where a real tier is stated (e.g. Gondwana 20/25% should be ÷0.8 / ÷0.75).
4. **Confirm oddballs:** Africa Safari (40%), NWR (discretion), Belvedere (10%).
5. **vehicle_rates.html / activity_rates.html** — decide: gate, convert to rack, or drop.
6. **Re-enable the gate** (§3.2) once real rates replace the sample rates.
7. **Legacy cleanup (optional):** the portal's old client-side `agentCredentials` prototype
   still defaults a blank login to 'ultimate' and the sign-in modal shows tester logins
   ("Ultimate Safaris / Sense of Africa / Discover Africa / Admin Console"). Only the real
   `desert tracks` / `passme9cops` login sets the secure cookie. Consider removing the testers.

## 7. Working rules / how I operate
- I edit files in the repo; **you push via GitHub Desktop** (commit → Push origin → auto-deploys).
- I cannot run git push or operate Vercel — I give exact steps, you click.
- Net STO stays server-side / behind the gate, never in public page source (once gate re-enabled).
- The workspace bash mount **cannot delete files** — overwrite instead; Read/Write/Edit work fine.
- Slug convention: lodge name → lowercased, non-alphanumeric → hyphen ("Strand Hotel Swakopmund"
  → `strand-hotel-swakopmund`).

## 8. Quick test script (after deploy)
1. (With gate ENABLED) Incognito: open `namibiarates.com/ratesheets/camp_kwando_ratesheet_v3.html`
   → should REDIRECT to `/?agent=1`, NOT show STO. ✅ = gate works. (Currently gate is OFF, so it
   will just show the sheet.)
2. Click a lodge (Epako, Strand) → public RACK page.
3. Homepage → Agent Sign In → `desert tracks` / `passme9cops` → "Signed in" toast (no popup).
4. Re-open the `/ratesheets/...` URL → loads the bookable STO sheet.
5. Sign out → (with gate on) sheet is gated again.
