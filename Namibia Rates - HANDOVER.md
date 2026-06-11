# Namibia Rates — Project Handover

*Paste this into a new chat to resume. Last updated: 10 June 2026.*

---

## 0. How to use this
You're continuing work on the **Namibia Rates** trade website and its sibling sites. Read the
"Current status" and "Next steps" sections, then ask me where I'd like to continue. The most
load-bearing section is **§3 Infrastructure** — getting a Vercel Root Directory wrong took several
sites offline once already, so treat that map as the source of truth.

---

## 1. What this project is
- **namibiarates.com** — a B2B trade portal for Namibian lodges, vehicles & activities. Single-page
  app (`namibia_agent_portal.html`) with region cards, lodge search, and per-lodge rate-sheets.
- It lives inside a **monorepo** (`github.com/Jaun-debug/antigravity-projects`, branch `main`) that
  also holds several *other* sites (a "vault" of tools, a guest-registration app, etc.). Each site is
  a separate Vercel project pointed at its own folder in that one repo.

## 2. What's DONE and LIVE (namibiarates.com)
- Full redesign: editorial **grid** (replaced the carousel), bigger region tiles with centred names,
  sticky header, premium footer (info@namibiarates.com, no "Desert Tracks"), SEO meta + OG tags.
- **Regions cleaned to 17** (removed "Etosha National Park"; kept West/South/East Etosha). Accommodation
  dropdown rebuilt to match (no duplicate Waterberg/Kalahari).
- **Real photos** wired from the Wetu JSON: 263 lodges show their own photo; rest use a varied region
  photo (no duplicates, no wrong-lodge photos). Region tiles use real destination photos.
- **Live lodge search** dropdown (substring match, any part of the name).
- **Rate-sheets connected:** 50 single-lodge sheets + 11 group sheets (with `?lodge=KEY` deep-linking)
  copied into `dt_library/ratesheets/` and wired via `singleRateSheetMap` / `groupRateSheetMap`. ~113
  lodges open a real rate-sheet.
- **Logo = home button**, vehicle/activity links fixed.
- Everything is pushed to `main` and auto-deploys (see §3).

## 3. INFRASTRUCTURE — the source of truth (read this!)
Monorepo: **github.com/Jaun-debug/antigravity-projects**, branch **main**.
The fix that made namibiarates.com deploy: we **connected the repo to Vercel** + set the **Root
Directory** per project. THE GOLDEN RULE: **each Vercel project's Root Directory must point at its own
folder in the repo.** Wrong root = wrong site or 404.

| URL | Vercel project | Root Directory | In git? |
|---|---|---|---|
| **namibiarates.com** | `dt_library` | `dt_library` | yes |
| **www.namibiarates.com** + `antigravity-projects-eight.vercel.app` | `antigravity-projects` | repo root | yes |
| **website-codes-vert.vercel.app** (Master Library / invoice gens / costing) | `website-vault` | `_Desert Tracks/dt_library/_DT Tools & Apps` | yes |
| **desert-tracks-welcome.com** (guest booking reg) | `dt-guest-registration` | *(see §5 — in progress)* | the Next.js app is **gitignored**; static `dt_booking_reg.html` lives in the vault folder |

**Folders that ARE in git:** `dt_library`, `_Desert Tracks/Desert_Tracks_App`,
`_Desert Tracks/desert-tracks-dashboard`, `_Desert Tracks/dt_library` (incl. `_DT Tools & Apps`).
**Folders that are GITIGNORED (CLI-deployed only):** `dt-guest-registration`, `costing-app`,
`desert-dinner-netlify`, `dt-enquiry-wizard`. For these, git builds FAIL ("root directory does not
exist") — fix them with **Instant Rollback + Disconnect Git**, not a Root Directory.

## 4. The Vercel incident (context, now ~resolved)
Connecting the shared repo to Git made *every* project that touches it auto-build from `main`. Projects
with the wrong/blank Root Directory then served the wrong site or 404'd. Recovery per project:
- **In-git project, wrong root** → set Root Directory to its folder, redeploy. (Fixed **website-vault**
  this way → `_Desert Tracks/dt_library/_DT Tools & Apps`.)
- **Gitignored/CLI project** → Disconnect Git + Instant Rollback to a pre-incident deployment.

## 5. IN PROGRESS — pick up here
**(a) desert-tracks-welcome.com (guest booking reg):**
The real app is gitignored. Plan agreed: serve the static `dt_booking_reg.html` (which IS in the vault
folder) at that domain. I created `_Desert Tracks/dt_library/_DT Tools & Apps/vercel.json` with a
**host-based rewrite**: requests to desert-tracks-welcome.com → `/dt_booking_reg.html`; the vault's own
URL still shows the Master Library. **To finish:** on the `dt-guest-registration` project → set
**Framework = Other**, **Root Directory = `_Desert Tracks/dt_library/_DT Tools & Apps`**, Save, push the
new vercel.json, Redeploy. (User to confirm whether the page should be `dt_booking_reg.html`,
`safari_b_booking_reg.html`, or `welcome.html`.)

**(b) Still to check:** costing-app, dt-enquiry-wizard, desert-dinner — verify each loads; if broken and
gitignored, use Disconnect Git + Rollback.

## 6. BIGGER ROADMAP (the real direction — not yet built)
Move from the single-page portal to a proper **SEO + multi-agent platform**. Full spec in
**`Namibia Rates - Trade Platform Architecture.md`** (in this folder). Summary:
- **Public SEO pages:** `/accommodation/<lodge-slug>/` (rack rates, schema.org, ≤60-char title /
  ≤160-char description — enforced) and region pages `/<region>-accommodation/`. Generate them from the
  Wetu JSON, don't hand-build. Prototype done: `dt_library/accommodation/camp-kwando/` +
  `dt_library/caprivi-accommodation/`.
- **Private trade engine:** agents **self-register**, lodge owners drag them into one of **4 STO tier
  boxes (15/20/25/30%)**, agent **signs a lodge contract**, then ONE homepage login shows that agent
  their tier rate on every page — or *"Ratesheet update to follow — contact supplier"* if not assigned.
  Rack is public; net STO is server-side & per-agent (genuinely private, not derivable).
- **Stack:** Vercel (have it) + **Supabase free tier** (auth + Postgres). Cost ≈ $0 to start, ~$25/mo
  ceiling at scale. **Phase 1 built**, waiting on user: see `_Namibia_Backend/SETUP.md` (create the
  Supabase project, run `schema.sql` + `seed_camp_kwando.sql`, add `SUPABASE_URL`/`SUPABASE_ANON_KEY`
  in Vercel, set `AGENT_USER`/`AGENT_PASS`, then send me the Project URL).

## 7. Open decisions for the user
1. Region slug convention (`/caprivi-accommodation/` vs `/zambezi-accommodation/`).
2. Contract wording (per-lodge or one master template).
3. Which file desert-tracks-welcome.com should serve (`dt_booking_reg.html` default).
4. Generate all ~300 lodge pages now, or finish the infra/backend first.

## 8. Key files & folders (repo = ~/Desktop/AG Projects)
- `dt_library/namibia_agent_portal.html` — the live portal (deploy file for namibiarates.com).
- `dt_library/ratesheets/` — 50 single + 11 group rate-sheets (deployed).
- `dt_library/accommodation/camp-kwando/`, `dt_library/caprivi-accommodation/` — SEO prototype.
- `dt_library/api/sto.js` — prototype rate backend (will be replaced by Supabase engine).
- `_Namibia_Backend/` — Supabase schema, seed, rate engine, SETUP.md (Phase 1).
- `Namibia Rates - Trade Platform Architecture.md` — full architecture spec.
- `_Desert Tracks/dt_library/_DT Tools & Apps/` — the vault (Master Library, invoice/booking/costing).

## 9. Working rules / how I operate
- I edit files in the repo; **you push via GitHub Desktop** (commit → Push origin). Pushes auto-deploy.
- I can't run `git push` or operate Vercel/Supabase for you (browser/account actions) — I give exact
  steps, you click.
- Net STO rates & passwords stay server-side (env vars / backend), never in public page source.
- Previews are local copies in the outputs folder; nothing goes live until you push.
