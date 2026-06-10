# Phase 1 Setup — Supabase Foundations

This is the one part only you can do (creating the account + holding the keys).
~15 minutes. After this, I wire the front end and we test Camp Kwando end-to-end.

## Step 1 — Create the Supabase project (free)
1. Go to **supabase.com** → sign up (free) → **New project**.
2. Name it `namibia-rates`, pick a region near your users (e.g. EU/London), set a database password (save it).
3. Wait ~2 min for it to provision.

## Step 2 — Create the database
1. In the project → **SQL Editor** → **New query**.
2. Paste the whole of **`schema.sql`** → **Run**. (Creates the tables + security rules.)
3. New query → paste **`seed_camp_kwando.sql`** → **Run**. (Loads Camp Kwando's rates.)

## Step 3 — Get your keys
1. Project → **Settings → API**.
2. Copy two things:
   - **Project URL** — looks like `https://xxxx.supabase.co` *(public, safe to share)*
   - **anon public** key *(public, protected by the row-level security we set up)*
   - Leave the **service_role** key alone — it's secret; we don't need it.

## Step 4 — Add the keys to Vercel
1. Vercel → **dt_library** project → **Settings → Environment Variables**.
2. Add:
   - `SUPABASE_URL` = your Project URL
   - `SUPABASE_ANON_KEY` = your anon public key

## Step 5 — Tell me you're done
Send me the **Project URL** (the public `https://xxxx.supabase.co` one). That's all I need —
I never need your secret key or your password.

## Then I do (Phase 2):
- Add `@supabase/supabase-js` (a `package.json` so Vercel installs it for the functions).
- Deploy `api/agent-rates.js` (the rate engine).
- Build the **agent register + single sign-in** on the homepage (session carries across pages).
- Wire the Camp Kwando page: logged-out → rack; logged-in + assigned + signed → net STO; assigned-not-signed → contract prompt; not assigned → "Ratesheet update to follow — contact supplier".
- We create a test agent, drag them into a tier box, sign the contract, and watch the rate appear.

---

### Files in this folder
- `schema.sql` — the database (run once).
- `seed_camp_kwando.sql` — Camp Kwando's rates (run once).
- `api_agent-rates.js` — the rate engine (I deploy this).
- `SETUP.md` — this file.
