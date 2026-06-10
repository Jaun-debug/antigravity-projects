# Namibia Rates — Trade Platform Architecture & Build Plan

*Prepared for: namibiarates.com · Version 1.0*

---

## 1. The goal in one sentence

A **public, SEO-friendly accommodation site** (rack rates, indexable, lead-generating) sitting on top of a **private, multi-agent trade engine** where each agent signs in once and sees the specific net STO rate a lodge owner has assigned them — or a "contact supplier" message if no rate is set.

---

## 2. Two layers, one site

**Layer A — Public (static, indexed by Google)**
- `/accommodation/<lodge-slug>/` — one page per lodge, showing **rack rates**, photos, description, "Enquire" CTA.
- `/<region>-accommodation/` — region landing pages (`/etosha-accommodation/`, `/sossusvlei-accommodation/`, …).
- Pure static HTML on Vercel's CDN. Fast, cheap, crawlable. No net rates ever live here.

**Layer B — Private (the trade engine)**
- Agent logs in **once** on the homepage → a session carries across every page.
- On a lodge page, the agent sees **their assigned tier's STO rate**, fetched live from the backend.
- Lodge owners assign agents to tiers (drag-drop) and the rates resolve per agent, per lodge.

---

## 3. Recommended stack (cost-optimised)

| Concern | Choice | Why | Cost |
|---|---|---|---|
| Hosting + static pages | **Vercel** (existing Pro) | Already in use, CDN-served static pages are near-free | Existing $20/mo |
| Serverless API | **Vercel Functions** (`/api/*`) | Runs only on logged-in actions | Included in Pro |
| Auth (agent logins/sessions) | **Supabase Auth** | Handles passwords, sessions, email verification | Free tier |
| Database | **Supabase Postgres** | Stores agents, assignments, rates, contracts | Free tier |
| Page generation | **Node build script** | Generates 300–1000 pages from your data | One-off / on data change |

**Cost ceiling:** **$0 additional to start.** Supabase free tier covers 500 MB DB, ~50k monthly users, 5 GB bandwidth — far beyond a trade audience. If you outgrow it, Supabase Pro is **$25/mo**. So realistic ceiling ≈ **$25/mo on top of your existing Vercel Pro**, and only at real scale.

---

## 4. Database schema (Supabase / Postgres)

**`agents`** *(extends Supabase Auth users)*
| field | notes |
|---|---|
| id | = Supabase auth user id |
| email | login |
| company_name | agency / tour operator |
| contact_name, phone | profile |
| status | `pending` / `active` |
| created_at | |

**`lodges`**
| field | notes |
|---|---|
| id | |
| slug | `camp-kwando` (URL) |
| name, region | |
| owner_id | → lodge_owner |
| rack rates | via `rates` table |

**`lodge_owners`** *(also Supabase Auth users, role = owner)* — id, company, email.

**`rates`** — the base sheet per lodge.
| field | notes |
|---|---|
| lodge_id | |
| room_type | "Tented River Chalet — Double" |
| board | BB / DBB |
| season | low / high / single-season |
| rack_price | the published rack rate |

> Tier prices are **computed**: `tier_price = rack × (1 − tier%)`. So 20% STO = `rack × 0.80`. Owners only maintain rack (or we derive rack from an STO sheet once). One number to update, all tiers follow.

**`assignments`** — the "drag agent into a box" data (the heart of it).
| field | notes |
|---|---|
| lodge_id | |
| agent_id | |
| tier | `15` / `20` / `25` / `30` |
| assigned_by | owner id |
| assigned_at | |

**`contracts`** — proof of signed lodge–agent agreement.
| field | notes |
|---|---|
| lodge_id, agent_id | |
| template_version | which contract text |
| signed_name, signed_at, ip | audit trail |

**`contract_templates`** — id, lodge_id (or global), version, body/url.

*Row-Level Security (RLS):* an agent can only read **their own** assignments, contracts and resolved rates. Owners can only manage **their own** lodges. Enforced at the database, so even a direct API poke can't leak another agent's rates.

---

## 5. Core flows

**5.1 Agent self-registration**
1. Agent signs up (email + password) via Supabase Auth → lands in the global agent pool with `status = pending`.
2. They appear in lodge owners' workspaces as an available agent card.

**5.2 Lodge owner assigns (drag-drop, your 4 boxes)**
1. Owner opens their workspace → sees 4 tier boxes: **15% · 20% · 25% · 30%**, plus a pool of agents.
2. Owner drags an agent card into a tier box → creates an `assignments` row.
3. (Auto path) If an agent is *already* in a box for a lodge, access is granted automatically — no manual step.

**5.3 Contract signing (part of access)**
1. When an assigned agent first opens a lodge they can price, they're prompted to **sign the lodge–agent contract**.
2. On agreement → a `contracts` row is written (name, timestamp, IP, version).
3. Rates only display **after** the contract is signed. No signature → no rates.

**5.4 Single sign-in + session**
1. Agent logs in **once** on the homepage. Supabase issues a secure session (cookie/JWT).
2. Every page reads that session — no re-login per lodge.

**5.5 Rate resolution (what an agent sees on a lodge page)**
On opening `/accommodation/<slug>/`, the page calls `/api/rates?lodge=<slug>` with the session. The backend resolves, in order:
- **Not logged in** → show **rack rates** (public).
- **Logged in, not assigned to this lodge** → *"Ratesheet update to follow — contact supplier."*
- **Assigned, contract not signed** → prompt to sign the contract.
- **Assigned + signed** → compute and return **their tier's STO rate** (rack × (1 − tier%)), shown with a "Net STO · X%" badge.

Net rates are computed and returned **server-side, only for that agent** — never embedded in any public page.

---

## 6. SEO layer (ties in the earlier work)

- Every page: **unique title ≤60 chars, description ≤160 chars**, Open Graph, canonical, and `schema.org LodgingBusiness` markup (validated by the generator on every page).
- `/accommodation/<slug>/` and `/<region>-accommodation/` generated from your **Wetu JSON** (names, descriptions, photos) + the rate data.
- `sitemap.xml` + `robots.txt` listing all clean URLs.
- The portal's region nav and lodge clicks repoint to the clean URLs; the old `#region/...` hash routing and `/ratesheets/*.html` links are retired.
- The internal agent rate-sheets get `noindex` (trade content, not for Google).

---

## 7. Build roadmap (phased — each phase shippable)

- **Phase 0 — DONE.** Static prototype: Camp Kwando page, Caprivi region page, privacy concept proven.
- **Phase 1 — Foundations.** Stand up Supabase (schema, RLS), connect to Vercel.
- **Phase 2 — Auth.** Agent self-register, login, homepage single sign-in + session across pages.
- **Phase 3 — Owner workspace → live data.** Wire the 4-box drag-drop assignment UI to the `assignments` table (replacing today's localStorage).
- **Phase 4 — Contracts.** Sign-on-first-access flow + audit trail.
- **Phase 5 — Rate engine.** `/api/rates` resolution (rack / tier / "contact supplier").
- **Phase 6 — Generate the site.** All `/accommodation/` + region pages from data, wired to the rate engine.
- **Phase 7 — SEO finish.** Sitemap, robots, repoint portal, retire old URLs, submit to Google.

---

## 8. Open decisions (need your input before/within build)

1. **Contract text** — who supplies the legal wording for the lodge–agent agreement? (Per-lodge, or one master template you provide.)
2. **Rack source** — owners enter rack directly, or we derive rack from the existing STO sheets (÷ discount) as a one-time seed, then owners maintain it?
3. **Agent approval** — purely automatic once dragged into a box, or do you want a final "approve" toggle per agent?
4. **Owner accounts** — do lodge owners log in to manage their own assignments now, or do you (admin) manage on their behalf to start?

---

## 9. What this is — and isn't — costing you

- **Cheap to run:** static SEO pages on CDN + a light backend + a small database. ~$0 extra to start, ~$25/mo ceiling at scale.
- **The real investment is build effort:** this is the largest piece of the project (auth, database, contract flow, owner UI wired to live data, page generation). It's worth phasing so each step ships and is testable.

*Next step on approval: begin Phase 1 (Supabase foundations) and bring Camp Kwando through the real engine end-to-end as the reference implementation before generating the rest.*
