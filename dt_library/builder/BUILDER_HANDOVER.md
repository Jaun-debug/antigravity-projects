# Namibia Rates — Itinerary Builder Handover
Paste this into the project, start a fresh chat, and say: "Read builder/BUILDER_HANDOVER.md and let's continue."
Last updated: 27 June 2026.

> ⚠️ This is the **Namibia Rates** builder (namibiarates.com), NOT the Desert Tracks
> Costing Engine. Different app, different repo. The DT costing engine handover lives at
> `/_Desert Tracks/costing-app/HANDOVER.md`. Don't confuse the two.

## 0. Quick-start
You're working on the Namibia Rates **Itinerary Builder**: a single-file vanilla-JS app at
`/AG Projects/dt_library/builder/index.html` (~490 lines, plain JS — NOT Vue). It fetches lodge
rates from `/assets/rates-index.json` and lets an agent build a costed itinerary. First action:
request folder access to `~/Desktop/AG Projects/dt_library`. Read `builder/index.html` before editing.
After ANY change to the inline `<script>`, validate JS (see §6).

## 1. File locations
| What | Path |
|---|---|
| The builder app (source = deployed) | `dt_library/builder/index.html` |
| Lodge + rate data | `dt_library/assets/rates-index.json` (197 lodges) |
| Rate sheets (one HTML per lodge) | `dt_library/ratesheets/<file>.html` |
| Index rebuild tool | `dt_library/tools/rebuild_rates_index.py` |
| Builder backups | `dt_library/builder/index.html.bak_*` |
| JSON backups | `dt_library/assets/rates-index.json.bak_*` |

## 2. How the builder prices a lodge row (current design)
Each lodge row in **Lodges & Accommodation** has:
- **Region & Lodge** selectors.
- **Rooms & rates**: a Room/rate dropdown (lists every rate for the lodge) + three quantity boxes:
  **PP Sharing**, **Single**, **Child**. Each box shows the matched rate name + price next to it.
- Per-night = `qSharing × sharingRate + qSingle × singleRate + qChild × childRate`; Subtotal = per-night × nights.

Key behaviour:
- The **dropdown** sets which rate the **PP Sharing** box uses (`d.roomIdx`). On lodge select it auto-fills
  to the best sharing rate (see §3). The agent can override to any rate.
- **Single** and **Child** boxes auto-grab the lodge's cheapest matching single / child rate (live, not stored).
- Row state shape: `{ region, lodgeIdx, roomIdx, qShare, qSingle, qChild, nights, name, cap, … }`.
  Defaults: `qShare = adults`, `qChild = children`, `qSingle = 0`.
- **Back-compat**: old saved quotes only have `d.pax`; `qShareOf()` falls back to `pax` so they still price.
- Rows built from "Cost this itinerary" with captured rooms (`d.cap`) price straight from `cap` and ignore the boxes.

## 3. Rate-matching logic (the fiddly part — read before touching)
All in the helpers block of `builder/index.html` (search `function nonRoom`). Rates are messy free-text,
so matching is layered:
- `nonRoom(s)` — **HARD** non-room services that are NEVER a guest rate even if they say "Room"/"Sharing":
  guide, driver, pilot, game/night drives, transfers, airstrip, fees, activities-by-name (cruise, walk, spa…).
- `softNonRoom(s)` — meals/inclusions (breakfast, lunch, dinner, beverages, "activities"): only disqualifying
  when there is NO room noun (so "PP Sharing — DBB incl. meals" stays a room rate).
- `hasRoomNoun(s)` — positive lodging signal: sharing/single/room/chalet/tent/suite/villa/DBB/FI/per person/etc.
- `notRoomService(s)` = `nonRoom || (softNonRoom && !hasRoomNoun)`.
- `rateExcluded(s)` — excludes child/age/unit/camping + `notRoomService` from the sharing/single matchers.
- `rateMatches(n,mode)` — `sharing` = `/sharing|per person|\bpps\b/`; `single` = `/single/`; both gated by `rateExcluded`.
- `bestRoomIdx(L,mode)` — cheapest priced rate matching the mode.
- `bestChildIdx(L)` — cheapest child rate that is NOT a `notRoomService` line (so "child game drive" is ignored).
- `bestAccommIdx(L)` — cheapest genuine room rate of ANY wording (fallback); excludes services, single, child,
  additional/supplement, and camping unless nothing else exists (two-pass: rooms first, then camping).
- `bestShareIdx(L)` = `bestRoomIdx(L,'sharing')` else `bestAccommIdx(L)`. **This is what the lodge-select handler
  and `catInfo().sh` use**, so PP Sharing is never blank when the lodge has any real room rate.
- `catInfo(d)` returns `{sh,sg,ch}` (each `{p,n}` or null) used by both the render and `rowPerNight`.

Coverage today: PP-Sharing resolves for **196/197** lodges (138 strict sharing + fallback), single 121, child 80.
**Do not "simplify" these regexes without re-running the audit (§6)** — every term was added to fix a real mis-pick
(e.g. "Guide Room", "Night Drives", "Airfield Passenger Fee", child "Feeding").

## 4. The rates-index.json data fix (already done — context)
Many sheets render their rate tables with runtime JS (`<input data-name="'+label+'">`). Whatever first
generated `rates-index.json` read the static HTML and captured the literal `'+label+'`, so **142/197 lodges
had a bogus `{"n":"'+label+'","p":0}`**. Fixed by re-parsing each sheet's static `<table>` (room name + STO/net
price) and rebuilding only the broken lodges (the 55 already-good ones were left untouched). All 197 now have rates.

To regenerate after sheets change (prevents the bug returning):
```
cd "~/Desktop/AG Projects/dt_library"
python3 tools/rebuild_rates_index.py            # repair broken lodges only (safe)
python3 tools/rebuild_rates_index.py --all      # re-parse every lodge
python3 tools/rebuild_rates_index.py --dry-run  # report only
```
It backs up the JSON first and preserves the lodge list/regions (NEW lodges/regions still added by hand).
Requires `pip install beautifulsoup4`.

## 5. Preview locally
The app uses an absolute fetch (`/assets/rates-index.json`), so `file://` shows EMPTY dropdowns and Chrome
blocks `file://` fetches anyway. You MUST serve over http from the `dt_library` root:
```
cd "~/Desktop/AG Projects/dt_library"
python3 -m http.server 8000     # leave running; Ctrl+C to stop
```
Then open **http://localhost:8000/builder/index.html** and hard-refresh (⌘⇧R) — Chrome caches the JSON hard.

## 6. Working rules / validation (non-negotiable)
- Edit `builder/index.html` directly. Keep the design tokens (`--gold #B8956A`, `--green #87a996`, bone bg, etc.).
- **Never change pricing maths unless asked.** It's a financial tool. Sanity-check on-screen totals.
- After any inline-script change, validate JS: extract the inline `<script>` to a temp file and `node --check` it.
- For any matcher change, re-run the **audit** (extract the real functions from the file and run them over
  `rates-index.json`, flagging picks that look like services/fees/activities, and lodges with no PP-Sharing).
  The session's audit script pattern lives in the chat history; rebuild it if needed.
- The bash mount can throw "Resource deadlock avoided" on a file — use the Read/Write/Edit tools, or read via
  `node -e 'fs.readFileSync(...)'` (that worked when `cp` deadlocked).

## 7. Deployment
Namibia Rates deploys via **GitHub Desktop → Commit → Push** on repo `Jaun-debug/antigravity-projects`.
Both `builder/index.html` and `assets/rates-index.json` ship together in one push. Hard-refresh after deploy.
(No root/subfolder gotcha here — that's the DT costing engine, a different repo.)

## 8. Outstanding / known issues
- **White Sands Lodge** — its rate sheet contains ONLY activities (game drives, cruise, fishing), no
  accommodation rate, so PP Sharing is blank. Needs an accommodation table added to
  `ratesheets/white_sands_lodge.html`, then `rebuild_rates_index.py`.
- **Per-room vs per-person** — some lodges (city hotels, "per room/night max 2 pax", "Per Double Unit") are
  priced PER ROOM, but the boxes multiply per person. The matched rate NAME is shown next to each box so the
  agent can set the quantity correctly (e.g. qty 1 for a whole-room rate). Not auto-detected.
- **Sossus Oasis / campsites** — PP Sharing may show a campsite/ablution per-person rate; that's the genuine
  cheapest rate for those properties.
- A handful of lodges use "PPS" or bare "Per person" wording — covered by the matcher, but verify new sheets.

## 8b. Owner Rates area (added 01 Jul 2026)
A private, password-gated owner area now manages **rack** and **net STO** rates in a
Redis (Upstash) database, feeding the live site. The builder overlays live rack rates from
`/api/rack` on top of `rates-index.json` (matched by lodge **name**; new lodges appended).
Full setup + architecture: see `/OWNER_AREA.md` at the repo root. Requires the Vercel Redis
store + an `OWNER_PASS` env var. If either is missing, the builder falls back to the static
JSON unchanged.

## 9. What changed this session (27 Jun 2026)
1. Fixed `rates-index.json` (142 lodges) via a new static-table parser; added `tools/rebuild_rates_index.py`.
2. Added cheapest-rate auto-grab + (initially) a Sharing/Single toggle.
3. Replaced the Pax field/toggle with **PP Sharing / Single / Child quantity boxes** that show the matched
   rate name+price; rewired `rowPerNight`, row defaults, handlers, table header (dropped the Pax column).
4. Built the layered matcher (`nonRoom`/`softNonRoom`/`hasRoomNoun`/`notRoomService`) + `bestAccommIdx`
   fallback so PP Sharing is populated for 196/197 lodges with no service/fee mis-picks.
