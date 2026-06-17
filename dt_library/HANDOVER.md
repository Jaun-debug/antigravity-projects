# Namibia Rates — Project Handover Prompt

> Paste this whole file into a new Cowork/Claude session to bring the assistant up to speed before doing any work. It is written **to the assistant**. Keep it updated as the project changes.

---

## 0. How to start a session (read this first)

You are picking up an in-progress web project called **Namibia Rates** — a per-agent trade rate portal for Namibian lodges. Before touching anything:

1. Ask for (or confirm) access to the project folder: **`~/Desktop/AG Projects/dt_library`** on the user's Mac. The session sandbox loses access between sessions, so you will usually need to reconnect to it.
2. The user (Jaun) is **non-technical**. Explain things plainly, avoid jargon, and never paste raw code at them unless asked.
3. **Nothing you change is live until the user commits and pushes.** All edits are local files; the user deploys by opening **GitHub Desktop → Commit → Push origin**, which triggers a Vercel redeploy of **namibiarates.com**. Always end a change by telling them to push.
4. Because each page embeds its own JS/CSS inline, the browser aggressively caches. If the user "still sees the old version" after pushing, tell them to **hard-refresh (⌘⇧R)** or open a **private window**.

---

## 1. What the project is

A trade-only ("STO" = Sale-To-Operator net rates) website where Namibian lodges are shown two ways:

- **Public rack pages** — what anyone (and Google) sees: rack rates only, indexable, lead generation.
- **Agent STO sheets** — what a signed-in travel agent uses: net rates + a booking workflow.

Brand name is **Namibia Rates**. (The business behind it is Desert Tracks, but visible "Desert Tracks" branding has been removed from the site — see §6.)

---

## 2. Where everything lives

- **Project root (local):** `~/Desktop/AG Projects/dt_library`
- **Git remote:** `https://github.com/Jaun-debug/antigravity-projects.git`, branch **`main`**
- **Hosting:** Vercel → **https://namibiarates.com**
- **Source rate library (separate, not deployed):** `~/Desktop/AG Projects/_Desert Tracks/dt_library/single lodges` — the master HTML files for every lodge/collection, organised into region folders and underscore-prefixed collection folders (e.g. `_Gondwana`, `_NWR`). This is where real rate data comes from when building pages.

### Key files
| File | Purpose |
|---|---|
| `namibia_agent_portal.html` | The homepage / master agent portal (search, region grid, agent sign-in modal, header). Large file. |
| `middleware.js` | Edge gate that protects `/ratesheets/*`. Currently **disabled**. |
| `api/sto.js` | Serverless endpoint: agent login + the `STO_DB` net-rate data for the "inline" lodges. |
| `vercel.json` | URL redirects (old `/accommodation/...` → new region paths). |
| `assets/enquiry-wizard.js` / `.css` | Shared lodge **enquiry wizard** (loaded on lodge pages). |
| `supplier-portal/index.html` | **Supplier Portal** (lodge owners): register + login + rate-tier + agent assignment demo. |
| `list-your-property/index.html` | Older standalone listing enquiry (now unlinked; kept as fallback). |
| `<region>-accommodation/<slug>/index.html` | Public rack page for each lodge. |
| `ratesheets/*.html` | The gated agent STO sheets (single-lodge + group/collection). |

---

## 3. Current state (counts)

- **212** public lodge pages across **17** regions: botswana, caprivi, central-namibia, damaraland, east-etosha, epupa, fish-river-canyon, kalahari, kaokoland, luderitz, opuwo, skeleton-coast, sossusvlei, south-etosha, swakopmund, west-etosha, windhoek. (West Etosha and Botswana are placeholders with no lodges.)
- **218** files in `/ratesheets` (~71 single-lodge `*_ratesheet_v3.html` + the collection sheets + an index that now redirects home).
- **22** group/collection sheets listed in the **Group Lodges** dropdown.
- Every region page has a **search box + filterable lodge-card grid**.

---

## 4. The two rate models (important)

A signed-in agent always ends up on a bookable STO sheet, but lodges reach it two ways:

1. **Inline lodges (~independent single properties).** Net rates live server-side in `api/sto.js` (`STO_DB`, keyed by slug). The public page fetches them via `/api/sto` when signed in.
2. **Group/collection lodges.** Net rates live in a shared collection sheet (`ratesheets/<group>_ratesheet_v3.html`). The lodge's "View STO rate" button / signed-in redirect points there, sometimes with `?lodge=KEY`.

**Signed-in behaviour:** opening a public lodge page while signed in redirects to that lodge's single-lodge STO design (or its group sheet). Public/Google still see the rack page (redirect only fires when the agent token is present).

Each single-lodge STO page has a **"← Back to [Region] Lodges"** link.

---

## 5. Auth, gate & passwords (current demo settings)

- **Gate:** `middleware.js` → `const ENABLE_GATE = false;`. The STO sheets are currently **open to everyone** (construction phase, sample rates). Flip to `true` to enforce the login gate.
- **Passwords: DISABLED for the demo.** `api/sto.js` currently accepts **any** username/password (even blank) and always issues a session token. The real credential check is commented out with a note — re-enable by uncommenting that block.
- Valid logins (still work, but not required while passwords are disabled): **`ol` / `ol`** and **`desert tracks` / `passme9cops`** (the latter overridable via Vercel env vars `AGENT_USER` / `AGENT_PASS`).
- **Session scope:** token stored in `sessionStorage` + a session cookie, so closing the browser signs the agent out.

---

## 6. What was done in recent sessions

- **Rates rebuild:** all public lodge pages standardised to the **Camp Kwando golden design** (hero → rates → gallery → info grid → enquire). Rack rates derived as **STO × 1.20** where only net existed. Phone + email pulled into the contact card.
- **Brand cleanup:** visible "Desert Tracks" replaced with **"Namibia Rates"** (header "Trade Portal" label, booking-email tags, etc.). **Kept** the functional `@desert-tracks.com` email addresses and the login username.
- **Construction banner** changed sitewide to: *"⚠ Development Version. Rates displayed on this site are illustrative examples only and do not represent actual lodge rates, availability, or bookable inventory. Please contact the property directly for current pricing and availability."*
- **Mobile hamburger menu** (Desert-Tracks-style left slide-in, accordion sections that start closed) added to homepage, lodge/region pages, and all ratesheets. Agent Sign In lives inside it.
- **Enquiry wizard** (`assets/`): recoloured from the old dark theme to the **light sand/gold/green palette** (gold `#a48256`, green `#87a996`, Cinzel + Jost), **budget step removed** (now 5 steps), Desert Tracks branding removed.
- **Supplier Portal** built (`/supplier-portal/`): header button **"Supplier Portal"** replaced "List Your Property" sitewide. Two paths: **List Your Business** (single-step register → emails `jaun@desert-tracks.com`) and **Login** (account → **4 rate-tier boxes 15/20/25/30%** → **drag agents into % bands** with a live sign-in preview). It is a **front-end demo only** — assignments don't persist and the agent sign-in doesn't yet read them (that's Phase 2).
- **Duplicate cleanup:** removed two group-leaking duplicate lodge cards (Le Mirage Resort & Spa; Namushasha River Camping2go) — their old folders are now redirect stubs to the correct single page.

---

## 7. Open items / TODO

1. **Phase 2 backend (the big one).** The Supplier Portal and per-agent rates need a real database + auth (e.g. Supabase): real lodge accounts, persisted rate-tier uploads, and the agent sign-in automatically showing the % band the supplier assigned them. Today it's all front-end demo.
2. **Shared header refactor (parked).** Every page has its own copy of the header/menu, so header changes touch 200–300 files. A single shared header (`/header.html` injected by JS) would make future changes a one-file edit. The user chose to defer this.
3. **Five group-member lodges open the group sheet, not a single page:** Halali, Khorixas, Namutoni, Popa Falls (NWR) and Wolwedans Dunes Lodge. They have no standalone STO sheet. Could build single sheets if wanted.
4. **Lodges with no STO sheet at all:** Beach Lodge & Beach Hotel Swakopmund. A few inline-only with no separate sheet: Bahnhof Hotel Aus, Hansa Hotel, Midgard.
5. **Go-live checklist:** load **real** rates, set `ENABLE_GATE = true`, re-enable the password check in `api/sto.js`, set strong `AGENT_USER`/`AGENT_PASS` in Vercel, and replace the "Development Version" banner.
6. **Label tidy:** "Wilderness / Natural Selection" vs the separate Wilderness collection.

---

## 8. Gotchas (save yourself time)

- **Deploy = GitHub Desktop → Commit → Push origin.** Then wait ~1 min for Vercel + hard-refresh.
- **The sandbox cannot delete files** on the iCloud-synced Desktop ("Operation not permitted"). To remove a page, either overwrite it with a redirect stub or have the user delete it in Finder. Editing/creating files works fine.
- **Header/menu/branding edits are bulk operations** across hundreds of files — script them with care and always re-verify counts afterward.
- **Validate before declaring done:** run the inline `<script>` through `node -e "new Function(...)"`, check HTML balance, and confirm the user can see it live (offer to open it in Chrome).
- Keep `@desert-tracks.com` emails and the login username intact — they're functional, not branding.

---

*Last updated: handover generated mid-build. Update §3, §5, §6 and §7 whenever the state changes.*
