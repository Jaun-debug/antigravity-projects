# Desert Tracks — Rates Processing Checklist (STANDING RULE)

When going through supplier emails / rate sheets, **every time**, check, create, and update the
following into the Namibia Rates website — across **all three surfaces**:

- **Public site** (namibiarates.com)
- **STO agent sign-in** (agent portal)
- **Itinerary builder** (`/builder`)

For each supplier, capture and load:

1. **Rates** — STO **and** Rack, for the **current year and next year** (e.g. 2026 **and** 2027).
2. **Activities** — any excursions / activity rates.
3. **Vehicles** — any vehicle hire / transfer rates.
4. **Camping** — any campsite rates.
5. **Photos** — lodge / vehicle / activity images.
6. **Information** — any info about the lodge, vehicle, or activity provider (lead text, facilities, location, contact).

## How the site is structured (READ THIS BEFORE LOADING ANY RATES)

Suppliers send **STO rates only**. That single sheet feeds two different views:

| View | Who sees it | What it shows |
|---|---|---|
| **Agent sign-in** | signed-in trade partners | the supplier's **STO** rates, for **2026 and 2027** |
| **Public view** | everyone else | **Rack** rates, reverse-engineered from the STO |

### The rack formula — rack = STO ÷ 0.8

Rack is **never** supplied; it is always derived. At the standard 20% commission:

```
rack = STO / 0.8        (i.e. STO + 25%)
```

Worked example — Strand Hotel, Standard Room, DBL/Sharing BB:

```
STO                    N$ 3,518
rack = 3518 / 0.8    = N$ 4,397
agent takes 20% off 4,397 = 879  ->  nets 3,518  = the STO exactly
```

Do **not** use `STO x 1.20`. That yields 4,222, and 20% off 4,222 nets only 3,377 —
a shortfall against the STO on every room, every night.

If a supplier states a commission other than 20%, use `rack = STO / (1 - commission)`.
Living Desert Adventures is 15%, so `rack = STO / 0.85`.

### Both years
Unless the supplier gives different 2027 figures, **2026 and 2027 carry the same rates**,
and both years must be present so the season toggle shows rates either way. Where a
contracted rate spans both (e.g. O&L runs 01.01.2026 – 30.06.2028), set
`data-rate-years="2026 2027"` on the sheet so the toggle does not hide valid rates.

## Currency
- **Namibia** lodges → **NAD (N$)**.
- **Botswana, Delta, Chobe, and Vic Falls** lodges → **USD (US$)**.
- Never display a USD rate under an N$ label (or vice-versa).

## Email filing workflow (webmail: rates@desert-tracks.com → "2027 Rates" tree)
- **Follow up** — supplier said rates are still coming (or redirected to a colleague / portal / questionnaire).
- **Busy** — rates received but not yet built into the site + builder.
- **Done** — rates received AND page built AND added to the builder (all three surfaces updated).
- **Sign contract** — awaiting / handling contract signature.
- **All Mail** — automatic replies, bounces, tests, own-sends, newsletters, and old/irrelevant mail.

A supplier email only moves to **Done** once items 1–6 above are actually live on the site + builder.
