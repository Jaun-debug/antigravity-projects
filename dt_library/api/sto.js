// Vercel Serverless Function — agent auth + NET STO rates.
//
// SINGLE SIGN-IN MODEL:
//   1. Agent signs in once (homepage header) with username + password.
//      -> POST { username, password }            -> { ok, token }
//   2. The browser stores that token and every lodge page sends it back:
//      -> POST { token, lodge: "<slug>" }         -> { ok, token, lodge, rates }
//   The STO numbers and the password live here, server-side. They are NEVER
//   sent to a browser that hasn't authenticated, and are not in any page source.
//
// SET THESE IN VERCEL → Project Settings → Environments → Production:
//   AGENT_USER  = desert tracks
//   AGENT_PASS  = passme9cops
//
// The session token is derived from AGENT_PASS, so it is not a separate secret
// and it automatically invalidates every session if you ever change the password.

const crypto = require('crypto');
const db = require('./_ratesdb');

function sessionToken(pass) {
  return crypto.createHash('sha256').update('nr-agent-session|' + pass).digest('hex').slice(0, 40);
}

// Season year of an undated/legacy doc, read from its own `validity` label.
// A leading 4-digit year is the season (e.g. "2027 (01.11.2026–31.10.2027)" is
// 2027); otherwise the latest year mentioned. Reads the doc's declared season —
// it does NOT guess from filenames.
function seasonYear(v) {
  if (!v) return null;
  const s = String(v);
  const lead = s.match(/^\s*(20\d\d)/);
  if (lead) return lead[1];
  const all = s.match(/20\d\d/g);
  if (!all || !all.length) return null;
  return String(all.map(Number).sort(function (a, b) { return a - b; })[all.length - 1]);
}

// Legacy sheet rates (populated at the bottom of this file). Consulted LAST —
// after Redis and after the inline maps — so it can only ever fill a gap, never
// override a live rate. See the block at the end of the file for the rationale.
const LEGACY_STO_BY_YEAR = {};
// Rates read off a lodge's own supplier sheet for lodges the API held nothing
// for. Consulted LAST, so anything live or inline always wins.
const SHEET_STO_BY_YEAR = {};

// Parse a price string like "2,000" or "N$ 1.850" into a number (null if none).
function parsePrice(s) {
  const str = String(s == null ? '' : s).replace(/,/g, '').replace(/[^\d.\-]/g, '');
  if (str === '' || str === '-' || str === '.') return null;
  const v = parseFloat(str);
  return isNaN(v) ? null : v;
}

// Flatten a sectioned rate doc into [{n, p}] rows — same shape the rack API and
// the itinerary builder use.
function flattenSto(doc) {
  const rates = [];
  const sections = doc && Array.isArray(doc.sections) ? doc.sections : [];
  for (const sec of sections) {
    const rows = sec && Array.isArray(sec.rows) ? sec.rows : [];
    for (const row of rows) {
      if (!Array.isArray(row)) continue;
      const n = String(row[0] == null ? '' : row[0]).trim();
      const p = parsePrice(row[1]);
      if (!n || p == null) continue;
      rates.push({ n: n, p: p });
    }
  }
  return rates;
}

// Desert & Delta Safaris — multi-year (2026 + 2027) US$ NETT agent rates.
const DDS_STO_BY_YEAR = {
  "chobe-game-lodge": {
    "2026": {
      "name": "Chobe Game Lodge",
      "region": "Chobe",
      "currency": "US$",
      "validity": "2026 · Green 6 Jan–Mar / Shoulder Apr & Nov–5 Jan '27 / Peak May–Oct",
      "note": "Net 20% agent (NETT) rates, US$. Fully inclusive: accommodation, scheduled activities, all meals, local drinks, laundry, park fees, levies and 14% VAT, plus airport transfers.",
      "sections": [
        {
          "title": "Green season (6 Jan – Mar) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "552"
            ],
            [
              "5 – 6 night stay",
              "511"
            ],
            [
              "7 or more nights",
              "497"
            ]
          ]
        },
        {
          "title": "Shoulder season (Apr & Nov – 5 Jan '27) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "792"
            ],
            [
              "5 – 6 night stay",
              "733"
            ],
            [
              "7 or more nights",
              "713"
            ]
          ]
        },
        {
          "title": "Peak season (May – Oct) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "1032"
            ],
            [
              "5 – 6 night stay",
              "955"
            ],
            [
              "7 or more nights",
              "929"
            ]
          ]
        },
        {
          "title": "Suites & Best of Chobe package",
          "rows": [
            [
              "Chobe Game Lodge Suite — Green",
              "808"
            ],
            [
              "Chobe Game Lodge Suite — Shoulder",
              "1128"
            ],
            [
              "Chobe Game Lodge Suite — Peak",
              "1256"
            ],
            [
              "Best of Chobe 4-night package — Green",
              "2044"
            ],
            [
              "Best of Chobe 4-night package — Shoulder",
              "2932"
            ],
            [
              "Best of Chobe 4-night package — Peak",
              "3820"
            ],
            [
              "Best of Chobe package single supplement",
              "1448"
            ]
          ]
        },
        {
          "title": "Supplements & extras (all seasons)",
          "rows": [
            [
              "Single supplement",
              "362"
            ],
            [
              "Tour leader / registered guide / pilot per night",
              "350"
            ],
            [
              "Private activity per night",
              "500"
            ],
            [
              "Specialist guide per night",
              "475"
            ],
            [
              "Victoria Falls day trip",
              "268"
            ],
            [
              "Chobe Impact levy per bed night",
              "5"
            ]
          ]
        }
      ],
      "commission": "20% NETT agent rate"
    },
    "2027": {
      "name": "Chobe Game Lodge",
      "region": "Chobe",
      "currency": "US$",
      "validity": "2027 · Green 6 Jan–Mar / Shoulder Apr & Nov–5 Jan '28 / Peak May–Oct",
      "note": "Net 20% agent (NETT) rates, US$. Fully inclusive: accommodation, scheduled activities, all meals, local drinks, laundry, park fees, levies and 14% VAT, plus airport transfers.",
      "sections": [
        {
          "title": "Green season (6 Jan – Mar) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "592"
            ],
            [
              "5 – 6 night stay",
              "555"
            ],
            [
              "7 or more nights",
              "533"
            ]
          ]
        },
        {
          "title": "Shoulder season (Apr & Nov – 5 Jan '28) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "864"
            ],
            [
              "5 – 6 night stay",
              "810"
            ],
            [
              "7 or more nights",
              "778"
            ]
          ]
        },
        {
          "title": "Peak season (May – Oct) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "1128"
            ],
            [
              "5 – 6 night stay",
              "1058"
            ],
            [
              "7 or more nights",
              "1015"
            ]
          ]
        },
        {
          "title": "Suites & Best of Chobe package",
          "rows": [
            [
              "Chobe Game Lodge Suite — Green",
              "872"
            ],
            [
              "Chobe Game Lodge Suite — Shoulder",
              "1232"
            ],
            [
              "Chobe Game Lodge Suite — Peak",
              "1372"
            ],
            [
              "Best of Chobe 4-night package — Green",
              "2220"
            ],
            [
              "Best of Chobe 4-night package — Shoulder",
              "3240"
            ],
            [
              "Best of Chobe 4-night package — Peak",
              "4232"
            ],
            [
              "Best of Chobe package single supplement",
              "1580"
            ]
          ]
        },
        {
          "title": "Supplements & extras (all seasons)",
          "rows": [
            [
              "Single supplement",
              "395"
            ],
            [
              "Tour leader / registered guide / pilot per night",
              "350"
            ],
            [
              "Private activity per night",
              "525"
            ],
            [
              "Specialist guide per night",
              "500"
            ],
            [
              "Victoria Falls day trip",
              "300"
            ],
            [
              "Chobe Impact levy per bed night",
              "5"
            ]
          ]
        }
      ],
      "commission": "20% NETT agent rate"
    }
  },
  "chobe-savanna-lodge": {
    "2026": {
      "name": "Chobe Savanna Lodge",
      "region": "Chobe",
      "currency": "US$",
      "validity": "2026 · Green 6 Jan–Mar / Shoulder Apr & Nov–5 Jan '27 / Peak May–Oct",
      "note": "Net 20% agent (NETT) rates, US$. Fully inclusive: accommodation, scheduled activities, all meals, local drinks, laundry, park fees, levies and 14% VAT, plus airport transfers.",
      "sections": [
        {
          "title": "Green season (6 Jan – Mar) — per person sharing",
          "rows": [
            [
              "Per person sharing",
              "392"
            ]
          ]
        },
        {
          "title": "Shoulder season (Apr & Nov – 5 Jan '27) — per person sharing",
          "rows": [
            [
              "Per person sharing",
              "416"
            ]
          ]
        },
        {
          "title": "Peak season (May – Oct) — per person sharing",
          "rows": [
            [
              "Per person sharing",
              "528"
            ]
          ]
        },
        {
          "title": "Supplements & extras (all seasons)",
          "rows": [
            [
              "Single supplement",
              "185"
            ],
            [
              "Tour leader / registered guide / pilot per night",
              "350"
            ],
            [
              "Private activity per night",
              "500"
            ],
            [
              "Specialist guide per night",
              "475"
            ],
            [
              "Victoria Falls day trip",
              "268"
            ],
            [
              "Chobe Impact levy per bed night",
              "5"
            ]
          ]
        }
      ],
      "commission": "20% NETT agent rate"
    },
    "2027": {
      "name": "Chobe Savanna Lodge",
      "region": "Chobe",
      "currency": "US$",
      "validity": "2027 · Green 6 Jan–Mar / Shoulder Apr & Nov–5 Jan '28 / Peak May–Oct",
      "note": "Net 20% agent (NETT) rates, US$. Fully inclusive: accommodation, scheduled activities, all meals, local drinks, laundry, park fees, levies and 14% VAT, plus airport transfers.",
      "sections": [
        {
          "title": "Green season (6 Jan – Mar) — per person sharing",
          "rows": [
            [
              "Per person sharing",
              "424"
            ]
          ]
        },
        {
          "title": "Shoulder season (Apr & Nov – 5 Jan '28) — per person sharing",
          "rows": [
            [
              "Per person sharing",
              "456"
            ]
          ]
        },
        {
          "title": "Peak season (May – Oct) — per person sharing",
          "rows": [
            [
              "Per person sharing",
              "576"
            ]
          ]
        },
        {
          "title": "Supplements & extras (all seasons)",
          "rows": [
            [
              "Single supplement",
              "202"
            ],
            [
              "Tour leader / registered guide / pilot per night",
              "350"
            ],
            [
              "Private activity per night",
              "525"
            ],
            [
              "Specialist guide per night",
              "500"
            ],
            [
              "Victoria Falls day trip",
              "300"
            ],
            [
              "Chobe Impact levy per bed night",
              "5"
            ]
          ]
        }
      ],
      "commission": "20% NETT agent rate"
    }
  },
  "savute-safari-lodge": {
    "2026": {
      "name": "Savute Safari Lodge",
      "region": "Chobe",
      "currency": "US$",
      "validity": "2026 · Green 6 Jan–Mar / Shoulder Apr & Nov–5 Jan '27 / Peak May–Oct",
      "note": "Net 20% agent (NETT) rates, US$. Fully inclusive: accommodation, scheduled activities, all meals, local drinks, laundry, park fees, levies and 14% VAT, plus airport transfers.",
      "sections": [
        {
          "title": "Green season (6 Jan – Mar) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "552"
            ],
            [
              "5 – 6 night stay",
              "511"
            ],
            [
              "7 or more nights",
              "497"
            ]
          ]
        },
        {
          "title": "Shoulder season (Apr & Nov – 5 Jan '27) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "792"
            ],
            [
              "5 – 6 night stay",
              "733"
            ],
            [
              "7 or more nights",
              "713"
            ]
          ]
        },
        {
          "title": "Peak season (May – Oct) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "1032"
            ],
            [
              "5 – 6 night stay",
              "955"
            ],
            [
              "7 or more nights",
              "929"
            ]
          ]
        },
        {
          "title": "Supplements & extras (all seasons)",
          "rows": [
            [
              "Single supplement",
              "362"
            ],
            [
              "Tour leader / registered guide / pilot per night",
              "350"
            ],
            [
              "Private activity per night",
              "500"
            ],
            [
              "Specialist guide per night",
              "475"
            ],
            [
              "Victoria Falls day trip",
              "268"
            ],
            [
              "Chobe Impact levy per bed night",
              "5"
            ]
          ]
        }
      ],
      "commission": "20% NETT agent rate"
    },
    "2027": {
      "name": "Savute Safari Lodge",
      "region": "Chobe",
      "currency": "US$",
      "validity": "2027 · Green 6 Jan–Mar / Shoulder Apr & Nov–5 Jan '28 / Peak May–Oct",
      "note": "Net 20% agent (NETT) rates, US$. Fully inclusive: accommodation, scheduled activities, all meals, local drinks, laundry, park fees, levies and 14% VAT, plus airport transfers.",
      "sections": [
        {
          "title": "Green season (6 Jan – Mar) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "592"
            ],
            [
              "5 – 6 night stay",
              "555"
            ],
            [
              "7 or more nights",
              "533"
            ]
          ]
        },
        {
          "title": "Shoulder season (Apr & Nov – 5 Jan '28) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "864"
            ],
            [
              "5 – 6 night stay",
              "810"
            ],
            [
              "7 or more nights",
              "778"
            ]
          ]
        },
        {
          "title": "Peak season (May – Oct) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "1128"
            ],
            [
              "5 – 6 night stay",
              "1058"
            ],
            [
              "7 or more nights",
              "1015"
            ]
          ]
        },
        {
          "title": "Supplements & extras (all seasons)",
          "rows": [
            [
              "Single supplement",
              "395"
            ],
            [
              "Tour leader / registered guide / pilot per night",
              "350"
            ],
            [
              "Private activity per night",
              "525"
            ],
            [
              "Specialist guide per night",
              "500"
            ],
            [
              "Victoria Falls day trip",
              "300"
            ],
            [
              "Chobe Impact levy per bed night",
              "5"
            ]
          ]
        }
      ],
      "commission": "20% NETT agent rate"
    }
  },
  "camp-okavango": {
    "2026": {
      "name": "Camp Okavango",
      "region": "Okavango Delta",
      "currency": "US$",
      "validity": "2026 · Green 6 Jan–Mar / Shoulder Apr & Nov–5 Jan '27 / Peak May–Oct",
      "note": "Net 20% agent (NETT) rates, US$. Fully inclusive: accommodation, scheduled activities, all meals, local drinks, laundry, park fees, levies and 14% VAT, plus airport transfers.",
      "sections": [
        {
          "title": "Green season (6 Jan – Mar) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "552"
            ],
            [
              "5 – 6 night stay",
              "511"
            ],
            [
              "7 or more nights",
              "497"
            ]
          ]
        },
        {
          "title": "Shoulder season (Apr & Nov – 5 Jan '27) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "792"
            ],
            [
              "5 – 6 night stay",
              "733"
            ],
            [
              "7 or more nights",
              "713"
            ]
          ]
        },
        {
          "title": "Peak season (May – Oct) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "1032"
            ],
            [
              "5 – 6 night stay",
              "955"
            ],
            [
              "7 or more nights",
              "929"
            ]
          ]
        },
        {
          "title": "Supplements & extras (all seasons)",
          "rows": [
            [
              "Single supplement",
              "362"
            ],
            [
              "Tour leader / registered guide / pilot per night",
              "350"
            ],
            [
              "Private activity per night",
              "500"
            ],
            [
              "Specialist guide per night",
              "475"
            ],
            [
              "Victoria Falls day trip",
              "268"
            ],
            [
              "Chobe Impact levy per bed night",
              "5"
            ]
          ]
        }
      ],
      "commission": "20% NETT agent rate"
    },
    "2027": {
      "name": "Camp Okavango",
      "region": "Okavango Delta",
      "currency": "US$",
      "validity": "2027 · Green 6 Jan–Mar / Shoulder Apr & Nov–5 Jan '28 / Peak May–Oct",
      "note": "Net 20% agent (NETT) rates, US$. Fully inclusive: accommodation, scheduled activities, all meals, local drinks, laundry, park fees, levies and 14% VAT, plus airport transfers.",
      "sections": [
        {
          "title": "Green season (6 Jan – Mar) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "592"
            ],
            [
              "5 – 6 night stay",
              "555"
            ],
            [
              "7 or more nights",
              "533"
            ]
          ]
        },
        {
          "title": "Shoulder season (Apr & Nov – 5 Jan '28) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "864"
            ],
            [
              "5 – 6 night stay",
              "810"
            ],
            [
              "7 or more nights",
              "778"
            ]
          ]
        },
        {
          "title": "Peak season (May – Oct) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "1128"
            ],
            [
              "5 – 6 night stay",
              "1058"
            ],
            [
              "7 or more nights",
              "1015"
            ]
          ]
        },
        {
          "title": "Supplements & extras (all seasons)",
          "rows": [
            [
              "Single supplement",
              "395"
            ],
            [
              "Tour leader / registered guide / pilot per night",
              "350"
            ],
            [
              "Private activity per night",
              "525"
            ],
            [
              "Specialist guide per night",
              "500"
            ],
            [
              "Victoria Falls day trip",
              "300"
            ],
            [
              "Chobe Impact levy per bed night",
              "5"
            ]
          ]
        }
      ],
      "commission": "20% NETT agent rate"
    }
  },
  "xugana-island-lodge": {
    "2026": {
      "name": "Xugana Island Lodge",
      "region": "Okavango Delta",
      "currency": "US$",
      "validity": "2026 · Green 6 Jan–Mar / Shoulder Apr & Nov–5 Jan '27 / Peak May–Oct",
      "note": "Net 20% agent (NETT) rates, US$. Fully inclusive: accommodation, scheduled activities, all meals, local drinks, laundry, park fees, levies and 14% VAT, plus airport transfers.",
      "sections": [
        {
          "title": "Green season (6 Jan – Mar) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "552"
            ],
            [
              "5 – 6 night stay",
              "511"
            ],
            [
              "7 or more nights",
              "497"
            ]
          ]
        },
        {
          "title": "Shoulder season (Apr & Nov – 5 Jan '27) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "792"
            ],
            [
              "5 – 6 night stay",
              "733"
            ],
            [
              "7 or more nights",
              "713"
            ]
          ]
        },
        {
          "title": "Peak season (May – Oct) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "1032"
            ],
            [
              "5 – 6 night stay",
              "955"
            ],
            [
              "7 or more nights",
              "929"
            ]
          ]
        },
        {
          "title": "Supplements & extras (all seasons)",
          "rows": [
            [
              "Single supplement",
              "362"
            ],
            [
              "Tour leader / registered guide / pilot per night",
              "350"
            ],
            [
              "Private activity per night",
              "500"
            ],
            [
              "Specialist guide per night",
              "475"
            ],
            [
              "Victoria Falls day trip",
              "268"
            ],
            [
              "Chobe Impact levy per bed night",
              "5"
            ]
          ]
        }
      ],
      "commission": "20% NETT agent rate"
    },
    "2027": {
      "name": "Xugana Island Lodge",
      "region": "Okavango Delta",
      "currency": "US$",
      "validity": "2027 · Green 6 Jan–Mar / Shoulder Apr & Nov–5 Jan '28 / Peak May–Oct",
      "note": "Net 20% agent (NETT) rates, US$. Fully inclusive: accommodation, scheduled activities, all meals, local drinks, laundry, park fees, levies and 14% VAT, plus airport transfers.",
      "sections": [
        {
          "title": "Green season (6 Jan – Mar) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "592"
            ],
            [
              "5 – 6 night stay",
              "555"
            ],
            [
              "7 or more nights",
              "533"
            ]
          ]
        },
        {
          "title": "Shoulder season (Apr & Nov – 5 Jan '28) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "864"
            ],
            [
              "5 – 6 night stay",
              "810"
            ],
            [
              "7 or more nights",
              "778"
            ]
          ]
        },
        {
          "title": "Peak season (May – Oct) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "1128"
            ],
            [
              "5 – 6 night stay",
              "1058"
            ],
            [
              "7 or more nights",
              "1015"
            ]
          ]
        },
        {
          "title": "Supplements & extras (all seasons)",
          "rows": [
            [
              "Single supplement",
              "395"
            ],
            [
              "Tour leader / registered guide / pilot per night",
              "350"
            ],
            [
              "Private activity per night",
              "525"
            ],
            [
              "Specialist guide per night",
              "500"
            ],
            [
              "Victoria Falls day trip",
              "300"
            ],
            [
              "Chobe Impact levy per bed night",
              "5"
            ]
          ]
        }
      ],
      "commission": "20% NETT agent rate"
    }
  },
  "nxamaseri-island-lodge": {
    "2026": {
      "name": "Nxamaseri Island Lodge",
      "region": "Okavango Delta",
      "currency": "US$",
      "validity": "2026 · Green 6 Jan–Mar / Shoulder Apr & Nov–5 Jan '27 / Peak May–Oct",
      "note": "Net 20% agent (NETT) rates, US$. Fully inclusive: accommodation, scheduled activities, all meals, local drinks, laundry, park fees, levies and 14% VAT, plus airport transfers.",
      "sections": [
        {
          "title": "Green season (6 Jan – Mar) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "552"
            ],
            [
              "5 – 6 night stay",
              "511"
            ],
            [
              "7 or more nights",
              "497"
            ]
          ]
        },
        {
          "title": "Shoulder season (Apr & Nov – 5 Jan '27) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "792"
            ],
            [
              "5 – 6 night stay",
              "733"
            ],
            [
              "7 or more nights",
              "713"
            ]
          ]
        },
        {
          "title": "Peak season (May – Oct) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "1032"
            ],
            [
              "5 – 6 night stay",
              "955"
            ],
            [
              "7 or more nights",
              "929"
            ]
          ]
        },
        {
          "title": "Supplements & extras (all seasons)",
          "rows": [
            [
              "Single supplement",
              "362"
            ],
            [
              "Tour leader / registered guide / pilot per night",
              "350"
            ],
            [
              "Private activity per night",
              "500"
            ],
            [
              "Specialist guide per night",
              "475"
            ],
            [
              "Victoria Falls day trip",
              "268"
            ],
            [
              "Chobe Impact levy per bed night",
              "5"
            ]
          ]
        }
      ],
      "commission": "20% NETT agent rate"
    },
    "2027": {
      "name": "Nxamaseri Island Lodge",
      "region": "Okavango Delta",
      "currency": "US$",
      "validity": "2027 · Green 6 Jan–Mar / Shoulder Apr & Nov–5 Jan '28 / Peak May–Oct",
      "note": "Net 20% agent (NETT) rates, US$. Fully inclusive: accommodation, scheduled activities, all meals, local drinks, laundry, park fees, levies and 14% VAT, plus airport transfers.",
      "sections": [
        {
          "title": "Green season (6 Jan – Mar) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "592"
            ],
            [
              "5 – 6 night stay",
              "555"
            ],
            [
              "7 or more nights",
              "533"
            ]
          ]
        },
        {
          "title": "Shoulder season (Apr & Nov – 5 Jan '28) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "864"
            ],
            [
              "5 – 6 night stay",
              "810"
            ],
            [
              "7 or more nights",
              "778"
            ]
          ]
        },
        {
          "title": "Peak season (May – Oct) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "1128"
            ],
            [
              "5 – 6 night stay",
              "1058"
            ],
            [
              "7 or more nights",
              "1015"
            ]
          ]
        },
        {
          "title": "Supplements & extras (all seasons)",
          "rows": [
            [
              "Single supplement",
              "395"
            ],
            [
              "Tour leader / registered guide / pilot per night",
              "350"
            ],
            [
              "Private activity per night",
              "525"
            ],
            [
              "Specialist guide per night",
              "500"
            ],
            [
              "Victoria Falls day trip",
              "300"
            ],
            [
              "Chobe Impact levy per bed night",
              "5"
            ]
          ]
        }
      ],
      "commission": "20% NETT agent rate"
    }
  },
  "camp-moremi": {
    "2026": {
      "name": "Camp Moremi",
      "region": "Okavango Delta",
      "currency": "US$",
      "validity": "2026 · Green 6 Jan–Mar / Shoulder Apr & Nov–5 Jan '27 / Peak May–Oct",
      "note": "Net 20% agent (NETT) rates, US$. Fully inclusive: accommodation, scheduled activities, all meals, local drinks, laundry, park fees, levies and 14% VAT, plus airport transfers.",
      "sections": [
        {
          "title": "Green season (6 Jan – Mar) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "552"
            ],
            [
              "5 – 6 night stay",
              "511"
            ],
            [
              "7 or more nights",
              "497"
            ]
          ]
        },
        {
          "title": "Shoulder season (Apr & Nov – 5 Jan '27) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "792"
            ],
            [
              "5 – 6 night stay",
              "733"
            ],
            [
              "7 or more nights",
              "713"
            ]
          ]
        },
        {
          "title": "Peak season (May – Oct) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "1032"
            ],
            [
              "5 – 6 night stay",
              "955"
            ],
            [
              "7 or more nights",
              "929"
            ]
          ]
        },
        {
          "title": "Supplements & extras (all seasons)",
          "rows": [
            [
              "Single supplement",
              "362"
            ],
            [
              "Tour leader / registered guide / pilot per night",
              "350"
            ],
            [
              "Private activity per night",
              "500"
            ],
            [
              "Specialist guide per night",
              "475"
            ],
            [
              "Victoria Falls day trip",
              "268"
            ],
            [
              "Chobe Impact levy per bed night",
              "5"
            ]
          ]
        }
      ],
      "commission": "20% NETT agent rate"
    },
    "2027": {
      "name": "Camp Moremi",
      "region": "Okavango Delta",
      "currency": "US$",
      "validity": "2027 · Green 6 Jan–Mar / Shoulder Apr & Nov–5 Jan '28 / Peak May–Oct",
      "note": "Net 20% agent (NETT) rates, US$. Fully inclusive: accommodation, scheduled activities, all meals, local drinks, laundry, park fees, levies and 14% VAT, plus airport transfers.",
      "sections": [
        {
          "title": "Green season (6 Jan – Mar) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "592"
            ],
            [
              "5 – 6 night stay",
              "555"
            ],
            [
              "7 or more nights",
              "533"
            ]
          ]
        },
        {
          "title": "Shoulder season (Apr & Nov – 5 Jan '28) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "864"
            ],
            [
              "5 – 6 night stay",
              "810"
            ],
            [
              "7 or more nights",
              "778"
            ]
          ]
        },
        {
          "title": "Peak season (May – Oct) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "1128"
            ],
            [
              "5 – 6 night stay",
              "1058"
            ],
            [
              "7 or more nights",
              "1015"
            ]
          ]
        },
        {
          "title": "Supplements & extras (all seasons)",
          "rows": [
            [
              "Single supplement",
              "395"
            ],
            [
              "Tour leader / registered guide / pilot per night",
              "350"
            ],
            [
              "Private activity per night",
              "525"
            ],
            [
              "Specialist guide per night",
              "500"
            ],
            [
              "Victoria Falls day trip",
              "300"
            ],
            [
              "Chobe Impact levy per bed night",
              "5"
            ]
          ]
        }
      ],
      "commission": "20% NETT agent rate"
    }
  },
  "camp-xakanaxa": {
    "2026": {
      "name": "Camp Xakanaxa",
      "region": "Okavango Delta",
      "currency": "US$",
      "validity": "2026 · Green 6 Jan–Mar / Shoulder Apr & Nov–5 Jan '27 / Peak May–Oct",
      "note": "Net 20% agent (NETT) rates, US$. Fully inclusive: accommodation, scheduled activities, all meals, local drinks, laundry, park fees, levies and 14% VAT, plus airport transfers.",
      "sections": [
        {
          "title": "Green season (6 Jan – Mar) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "552"
            ],
            [
              "5 – 6 night stay",
              "511"
            ],
            [
              "7 or more nights",
              "497"
            ]
          ]
        },
        {
          "title": "Shoulder season (Apr & Nov – 5 Jan '27) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "792"
            ],
            [
              "5 – 6 night stay",
              "733"
            ],
            [
              "7 or more nights",
              "713"
            ]
          ]
        },
        {
          "title": "Peak season (May – Oct) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "1032"
            ],
            [
              "5 – 6 night stay",
              "955"
            ],
            [
              "7 or more nights",
              "929"
            ]
          ]
        },
        {
          "title": "Supplements & extras (all seasons)",
          "rows": [
            [
              "Single supplement",
              "362"
            ],
            [
              "Tour leader / registered guide / pilot per night",
              "350"
            ],
            [
              "Private activity per night",
              "500"
            ],
            [
              "Specialist guide per night",
              "475"
            ],
            [
              "Victoria Falls day trip",
              "268"
            ],
            [
              "Chobe Impact levy per bed night",
              "5"
            ]
          ]
        }
      ],
      "commission": "20% NETT agent rate"
    },
    "2027": {
      "name": "Camp Xakanaxa",
      "region": "Okavango Delta",
      "currency": "US$",
      "validity": "2027 · Green 6 Jan–Mar / Shoulder Apr & Nov–5 Jan '28 / Peak May–Oct",
      "note": "Net 20% agent (NETT) rates, US$. Fully inclusive: accommodation, scheduled activities, all meals, local drinks, laundry, park fees, levies and 14% VAT, plus airport transfers.",
      "sections": [
        {
          "title": "Green season (6 Jan – Mar) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "592"
            ],
            [
              "5 – 6 night stay",
              "555"
            ],
            [
              "7 or more nights",
              "533"
            ]
          ]
        },
        {
          "title": "Shoulder season (Apr & Nov – 5 Jan '28) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "864"
            ],
            [
              "5 – 6 night stay",
              "810"
            ],
            [
              "7 or more nights",
              "778"
            ]
          ]
        },
        {
          "title": "Peak season (May – Oct) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "1128"
            ],
            [
              "5 – 6 night stay",
              "1058"
            ],
            [
              "7 or more nights",
              "1015"
            ]
          ]
        },
        {
          "title": "Supplements & extras (all seasons)",
          "rows": [
            [
              "Single supplement",
              "395"
            ],
            [
              "Tour leader / registered guide / pilot per night",
              "350"
            ],
            [
              "Private activity per night",
              "525"
            ],
            [
              "Specialist guide per night",
              "500"
            ],
            [
              "Victoria Falls day trip",
              "300"
            ],
            [
              "Chobe Impact levy per bed night",
              "5"
            ]
          ]
        }
      ],
      "commission": "20% NETT agent rate"
    }
  },
  "sediba-sa-rona": {
    "2026": {
      "name": "Sediba Sa Rona",
      "region": "Okavango Delta",
      "currency": "US$",
      "validity": "2026 · Green 6 Jan–Mar / Shoulder Apr & Nov–5 Jan '27 / Peak May–Oct",
      "note": "Net 20% agent (NETT) rates, US$. Fully inclusive: accommodation, scheduled activities, all meals, local drinks, laundry, park fees, levies and 14% VAT, plus airport transfers.",
      "sections": [
        {
          "title": "Green season (6 Jan – Mar) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "552"
            ],
            [
              "5 – 6 night stay",
              "511"
            ],
            [
              "7 or more nights",
              "497"
            ]
          ]
        },
        {
          "title": "Shoulder season (Apr & Nov – 5 Jan '27) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "792"
            ],
            [
              "5 – 6 night stay",
              "733"
            ],
            [
              "7 or more nights",
              "713"
            ]
          ]
        },
        {
          "title": "Peak season (May – Oct) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "1032"
            ],
            [
              "5 – 6 night stay",
              "955"
            ],
            [
              "7 or more nights",
              "929"
            ]
          ]
        },
        {
          "title": "Supplements & extras (all seasons)",
          "rows": [
            [
              "Single supplement",
              "362"
            ],
            [
              "Tour leader / registered guide / pilot per night",
              "350"
            ],
            [
              "Private activity per night",
              "500"
            ],
            [
              "Specialist guide per night",
              "475"
            ],
            [
              "Victoria Falls day trip",
              "268"
            ],
            [
              "Chobe Impact levy per bed night",
              "5"
            ]
          ]
        }
      ],
      "commission": "20% NETT agent rate"
    },
    "2027": {
      "name": "Sediba Sa Rona",
      "region": "Okavango Delta",
      "currency": "US$",
      "validity": "2027 · Green 6 Jan–Mar / Shoulder Apr & Nov–5 Jan '28 / Peak May–Oct",
      "note": "Net 20% agent (NETT) rates, US$. Fully inclusive: accommodation, scheduled activities, all meals, local drinks, laundry, park fees, levies and 14% VAT, plus airport transfers.",
      "sections": [
        {
          "title": "Green season (6 Jan – Mar) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "592"
            ],
            [
              "5 – 6 night stay",
              "555"
            ],
            [
              "7 or more nights",
              "533"
            ]
          ]
        },
        {
          "title": "Shoulder season (Apr & Nov – 5 Jan '28) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "864"
            ],
            [
              "5 – 6 night stay",
              "810"
            ],
            [
              "7 or more nights",
              "778"
            ]
          ]
        },
        {
          "title": "Peak season (May – Oct) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "1128"
            ],
            [
              "5 – 6 night stay",
              "1058"
            ],
            [
              "7 or more nights",
              "1015"
            ]
          ]
        },
        {
          "title": "Supplements & extras (all seasons)",
          "rows": [
            [
              "Single supplement",
              "395"
            ],
            [
              "Tour leader / registered guide / pilot per night",
              "350"
            ],
            [
              "Private activity per night",
              "525"
            ],
            [
              "Specialist guide per night",
              "500"
            ],
            [
              "Victoria Falls day trip",
              "300"
            ],
            [
              "Chobe Impact levy per bed night",
              "5"
            ]
          ]
        }
      ],
      "commission": "20% NETT agent rate"
    }
  },
  "leroo-la-tau": {
    "2026": {
      "name": "Leroo La Tau",
      "region": "Botswana",
      "currency": "US$",
      "validity": "2026 · Green 6 Jan–Mar / Shoulder Apr & Nov–5 Jan '27 / Peak May–Oct",
      "note": "Net 20% agent (NETT) rates, US$. Fully inclusive: accommodation, scheduled activities, all meals, local drinks, laundry, park fees, levies and 14% VAT, plus airport transfers.",
      "sections": [
        {
          "title": "Green season (6 Jan – Mar) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "552"
            ],
            [
              "5 – 6 night stay",
              "511"
            ],
            [
              "7 or more nights",
              "497"
            ]
          ]
        },
        {
          "title": "Shoulder season (Apr & Nov – 5 Jan '27) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "792"
            ],
            [
              "5 – 6 night stay",
              "733"
            ],
            [
              "7 or more nights",
              "713"
            ]
          ]
        },
        {
          "title": "Peak season (May – Oct) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "1032"
            ],
            [
              "5 – 6 night stay",
              "955"
            ],
            [
              "7 or more nights",
              "929"
            ]
          ]
        },
        {
          "title": "Supplements & extras (all seasons)",
          "rows": [
            [
              "Single supplement",
              "362"
            ],
            [
              "Tour leader / registered guide / pilot per night",
              "350"
            ],
            [
              "Private activity per night",
              "500"
            ],
            [
              "Specialist guide per night",
              "475"
            ],
            [
              "Victoria Falls day trip",
              "268"
            ],
            [
              "Chobe Impact levy per bed night",
              "5"
            ]
          ]
        }
      ],
      "commission": "20% NETT agent rate"
    },
    "2027": {
      "name": "Leroo La Tau",
      "region": "Botswana",
      "currency": "US$",
      "validity": "2027 · Green 6 Jan–Mar / Shoulder Apr & Nov–5 Jan '28 / Peak May–Oct",
      "note": "Net 20% agent (NETT) rates, US$. Fully inclusive: accommodation, scheduled activities, all meals, local drinks, laundry, park fees, levies and 14% VAT, plus airport transfers.",
      "sections": [
        {
          "title": "Green season (6 Jan – Mar) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "592"
            ],
            [
              "5 – 6 night stay",
              "555"
            ],
            [
              "7 or more nights",
              "533"
            ]
          ]
        },
        {
          "title": "Shoulder season (Apr & Nov – 5 Jan '28) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "864"
            ],
            [
              "5 – 6 night stay",
              "810"
            ],
            [
              "7 or more nights",
              "778"
            ]
          ]
        },
        {
          "title": "Peak season (May – Oct) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "1128"
            ],
            [
              "5 – 6 night stay",
              "1058"
            ],
            [
              "7 or more nights",
              "1015"
            ]
          ]
        },
        {
          "title": "Supplements & extras (all seasons)",
          "rows": [
            [
              "Single supplement",
              "395"
            ],
            [
              "Tour leader / registered guide / pilot per night",
              "350"
            ],
            [
              "Private activity per night",
              "525"
            ],
            [
              "Specialist guide per night",
              "500"
            ],
            [
              "Victoria Falls day trip",
              "300"
            ],
            [
              "Chobe Impact levy per bed night",
              "5"
            ]
          ]
        }
      ],
      "commission": "20% NETT agent rate"
    }
  }
};
Object.assign(DDS_STO_BY_YEAR, {
  "muchenje-safari-lodge": {
    "2026": {
      "name": "Muchenje Safari Lodge",
      "region": "Chobe",
      "currency": "US$",
      "validity": "2026/27 · valid 1 Apr 2026 – 31 Mar 2027",
      "note": "Net 20% STO rates, US$ per person per night. Same inclusions as rack. Minimum 2-night stay in High season (Jul–Oct).",
      "sections": [
        {
          "title": "Shoulder season (1 Apr – 30 Jun 2026)",
          "rows": [
            [
              "Per person sharing",
              "628"
            ],
            [
              "Single per night",
              "940"
            ]
          ]
        },
        {
          "title": "High season (1 Jul – 31 Oct 2026)",
          "rows": [
            [
              "Per person sharing",
              "772"
            ],
            [
              "Single per night",
              "1156"
            ]
          ]
        },
        {
          "title": "Shoulder season (1 – 30 Nov 2026)",
          "rows": [
            [
              "Per person sharing",
              "628"
            ],
            [
              "Single per night",
              "940"
            ]
          ]
        },
        {
          "title": "Green season (1 Dec 2026 – 31 Mar 2027)",
          "rows": [
            [
              "Per person sharing",
              "468"
            ],
            [
              "Single per night",
              "468"
            ]
          ]
        },
        {
          "title": "Guides & tour leaders (all seasons)",
          "rows": [
            [
              "Groups 8+ rooms — 1 tour leader",
              "0"
            ],
            [
              "Groups 3–7 rooms — guide at 50% STO",
              "0"
            ],
            [
              "Groups 1–2 rooms — guide at STO rate",
              "0"
            ]
          ]
        }
      ],
      "commission": "20% STO"
    },
    "2027": {
      "name": "Muchenje Safari Lodge",
      "region": "Chobe",
      "currency": "US$",
      "validity": "2027/28 · valid 1 Apr 2027 – 31 Mar 2028",
      "note": "Net 20% STO rates, US$ per person per night. Same inclusions as rack. Minimum 2-night stay in High season (Jul–Oct). Kasane airport transfers complimentary; Victoria Falls, Livingstone or Katima US$90 per person, minimum 2 (US$80 in 2026/27). Private vehicle and guide US$500 per 24 hours, or US$250 for families of 4 or fewer in low and mid season. Pay 2 Stay 3 applies in Green season and in the November shoulder.",
      "sections": [
        {
          "title": "Shoulder season (1 Apr – 30 Jun 2027)",
          "rows": [
            [
              "Per person sharing",
              "700"
            ],
            [
              "Single per night",
              "904"
            ]
          ]
        },
        {
          "title": "High season (1 Jul – 31 Oct 2027)",
          "rows": [
            [
              "Per person sharing",
              "848"
            ],
            [
              "Single per night",
              "1104"
            ]
          ]
        },
        {
          "title": "Shoulder season (1 – 30 Nov 2027) · Pay 2 Stay 3",
          "rows": [
            [
              "Per person sharing",
              "700"
            ],
            [
              "Single per night",
              "904"
            ]
          ]
        },
        {
          "title": "Green season (1 Dec 2027 – 31 Mar 2028) · Pay 2 Stay 3",
          "rows": [
            [
              "Per person sharing",
              "512"
            ],
            [
              "Single per night",
              "512"
            ]
          ]
        },
        {
          "title": "Guides & tour leaders (all seasons)",
          "rows": [
            [
              "Guide accommodation, per person per night (subject to availability)",
              "300"
            ]
          ]
        }
      ],
      "commission": "20% STO"
    }
  }
});

const STO_DB = {
  "duwisib-guest-farm": {
    "name": "Duwisib Guest Farm",
    "region": "Namib-Naukluft",
    "currency": "N$",
    "commission": "20% STO",
    "validity": "2027 (01.11.2026–31.10.2027)",
    "note": "Net STO rates, incl. VAT & levy.",
    "sections": [
      {
        "title": "Rates (per person sharing unless noted)",
        "rows": [
          [
            "Double/twin BB — pp sharing",
            "1184"
          ],
          [
            "Double/twin BB — single",
            "1472"
          ],
          [
            "Triple room BB — pp sharing (3 pax)",
            "1012"
          ],
          [
            "Double/twin DBB — pp sharing",
            "1512"
          ],
          [
            "Double/twin DBB — single",
            "1720"
          ],
          [
            "Triple room DBB — pp sharing (3 pax)",
            "1356"
          ],
          [
            "Self-catering bungalow — per bungalow",
            "1144"
          ],
          [
            "Camping — per person",
            "216"
          ],
          [
            "Nature Drive — per person (rack; no STO)",
            "550"
          ]
        ]
      }
    ]
  },
  "hotel-pension-rapmund": {
    "name": "Hotel Pension Rapmund",
    "region": "Swakopmund",
    "currency": "N$",
    "commission": "Agent nett",
    "validity": "2027 (01.01–31.12.2027)",
    "note": "Net STO rates, per room, incl. 2% levy & 15% VAT.",
    "sections": [
      {
        "title": "Bed & Breakfast (per room)",
        "rows": [
          [
            "Double room B/B — per room",
            "2340"
          ],
          [
            "Single room B/B — per room",
            "1404"
          ],
          [
            "Triple room B/B — 2 adults + 1 child under 12",
            "2574"
          ],
          [
            "Triple room B/B — 3 adults / 2 adults + 1 child 12+",
            "2866.50"
          ],
          [
            "Family unit B/B — 2 adults + 2/3 children under 12",
            "3276"
          ],
          [
            "Family unit B/B — 2 adults + 2/3 children 12+ / 4 adults",
            "3744"
          ],
          [
            "Luxury flat & Gallery room B/B — 2 adults",
            "2866.50"
          ],
          [
            "Guide room B/B (with a group only)",
            "772"
          ]
        ]
      }
    ]
  },
  "weltevrede-guest-farm": {
    "name": "Weltevrede Guest Farm",
    "region": "Namib (Maltahöhe)",
    "currency": "N$",
    "commission": "20% STO",
    "validity": "2027 (01.01–31.12.2027)",
    "note": "Net agent (STO) rates, incl. VAT & levy.",
    "sections": [
      {
        "title": "Dinner, Bed & Breakfast / Camping",
        "rows": [
          [
            "DBB — per person sharing",
            "1900"
          ],
          [
            "DBB — single per night",
            "2500"
          ],
          [
            "Child 4–12 (DBB, sharing with 2 adults)",
            "950"
          ],
          [
            "Camping — per person (more than 2 pax)",
            "190"
          ],
          [
            "Camping — child under 12",
            "95"
          ]
        ]
      }
    ]
  },
  "lagoon-chalets": {
    "name": "Lagoon Chalets",
    "region": "Walvis Bay",
    "currency": "N$",
    "commission": "Self-catering — net to agent",
    "validity": "01.07.2026–30.06.2027",
    "note": "Self-catering unit rates, net to agent (per unit / night by number of guests). Agent adds own markup.",
    "sections": [
      {
        "title": "Self-catering units (per unit / night)",
        "rows": [
          [
            "One/Two Bedroom Chalet — 1 pax",
            "950"
          ],
          [
            "One/Two Bedroom Chalet — 2 pax",
            "1300"
          ],
          [
            "One/Two Bedroom Chalet — 3 pax",
            "1500"
          ],
          [
            "One/Two Bedroom Chalet — 4 pax",
            "1700"
          ],
          [
            "One/Two Bedroom Chalet — 5 pax",
            "1850"
          ],
          [
            "One/Two Bedroom Chalet — 6 pax",
            "1950"
          ],
          [
            "Double Storey Chalet — 5 pax",
            "1950"
          ],
          [
            "Double Storey Chalet — 6 pax",
            "2100"
          ],
          [
            "Double Storey Chalet — 7-8 pax",
            "2500"
          ],
          [
            "Double Room (max 4 pax) — 2 pax",
            "850"
          ],
          [
            "Double Room (max 4 pax) — 4 pax",
            "1200"
          ],
          [
            "Bachelor Flat — 2 pax",
            "1300"
          ],
          [
            "Campsite — 2 pax",
            "700"
          ],
          [
            "Campsite — 4 pax",
            "1100"
          ],
          [
            "Campsite — 6 pax",
            "1300"
          ]
        ]
      }
    ]
  },
  "drift-inn-bayete-collection": {
    "name": "Drift Inn (Bayete Collection)",
    "region": "Vic Falls",
    "currency": "US$",
    "validity": "2027 · Low 1 Jan–31 Mar / High 1 Apr–31 Dec",
    "note": "Net STO rates (USD).",
    "sections": [
      {
        "title": "Standard — Low (per person, B&B)",
        "rows": [
          [
            "Adult sharing",
            "73"
          ],
          [
            "Adult single",
            "95"
          ],
          [
            "Child sharing",
            "37"
          ],
          [
            "Child single",
            "48"
          ]
        ]
      },
      {
        "title": "Standard — High (per person, B&B)",
        "rows": [
          [
            "Adult sharing",
            "83"
          ],
          [
            "Adult single",
            "108"
          ],
          [
            "Child sharing",
            "42"
          ],
          [
            "Child single",
            "55"
          ]
        ]
      },
      {
        "title": "Studio — Low (per person, B&B)",
        "rows": [
          [
            "Adult sharing",
            "82"
          ],
          [
            "Adult single",
            "106"
          ],
          [
            "Child sharing",
            "42"
          ],
          [
            "Child single",
            "54"
          ]
        ]
      },
      {
        "title": "Studio — High (per person, B&B)",
        "rows": [
          [
            "Adult sharing",
            "91"
          ],
          [
            "Adult single",
            "113"
          ],
          [
            "Child sharing",
            "46"
          ],
          [
            "Child single",
            "57"
          ]
        ]
      },
      {
        "title": "Family rooms & guide — Low",
        "rows": [
          [
            "Standard Family Room per unit",
            "233"
          ],
          [
            "Studio Family Room per unit",
            "265"
          ]
        ]
      },
      {
        "title": "Family rooms & guide — High",
        "rows": [
          [
            "Standard Family Room per unit",
            "261"
          ],
          [
            "Studio Family Room per unit",
            "297"
          ]
        ]
      },
      {
        "title": "Family rooms & guide — all seasons",
        "rows": [
          [
            "Guide per night",
            "65"
          ]
        ]
      }
    ],
    "commission": "20% STO"
  },
  "phezulu-bayete-collection": {
    "name": "PheZulu (Bayete Collection)",
    "region": "Vic Falls",
    "currency": "US$",
    "validity": "2027 · Low 1 Jan–31 Mar / High 1 Apr–31 Dec",
    "note": "Net STO rates (USD).",
    "sections": [
      {
        "title": "Deluxe — Low (per person, B&B)",
        "rows": [
          [
            "Adult sharing",
            "93"
          ],
          [
            "Adult single",
            "121"
          ],
          [
            "Child sharing",
            "47"
          ],
          [
            "Child single",
            "61"
          ]
        ]
      },
      {
        "title": "Deluxe — High (per person, B&B)",
        "rows": [
          [
            "Adult sharing",
            "109"
          ],
          [
            "Adult single",
            "141"
          ],
          [
            "Child sharing",
            "55"
          ],
          [
            "Child single",
            "71"
          ]
        ]
      },
      {
        "title": "Deluxe — all seasons",
        "rows": [
          [
            "Guide per night",
            "65"
          ]
        ]
      }
    ],
    "commission": "20% STO"
  },
  "bayete-guest-lodge": {
    "name": "Bayete Guest Lodge",
    "region": "Vic Falls",
    "currency": "US$",
    "validity": "2027 · Low 1 Jan–31 Mar / High 1 Apr–31 Dec",
    "note": "Net STO rates (USD).",
    "sections": [
      {
        "title": "Classic — Low (per person, B&B)",
        "rows": [
          [
            "Adult sharing",
            "105"
          ],
          [
            "Adult single",
            "137"
          ],
          [
            "Child sharing",
            "53"
          ],
          [
            "Child single",
            "69"
          ]
        ]
      },
      {
        "title": "Classic — High (per person, B&B)",
        "rows": [
          [
            "Adult sharing",
            "117"
          ],
          [
            "Adult single",
            "153"
          ],
          [
            "Child sharing",
            "59"
          ],
          [
            "Child single",
            "77"
          ]
        ]
      },
      {
        "title": "Executive & Honeymoon — Low (per person, B&B)",
        "rows": [
          [
            "Adult sharing",
            "113"
          ],
          [
            "Adult single",
            "145"
          ],
          [
            "Child sharing",
            "57"
          ],
          [
            "Child single",
            "73"
          ]
        ]
      },
      {
        "title": "Executive & Honeymoon — High (per person, B&B)",
        "rows": [
          [
            "Adult sharing",
            "141"
          ],
          [
            "Adult single",
            "185"
          ],
          [
            "Child sharing",
            "71"
          ],
          [
            "Child single",
            "93"
          ]
        ]
      },
      {
        "title": "Executive & Honeymoon — all seasons",
        "rows": [
          [
            "Guide per night",
            "65"
          ]
        ]
      }
    ],
    "commission": "20% STO"
  },
  "nkosi-bayete-collection": {
    "name": "Nkosi (Bayete Collection)",
    "region": "Vic Falls",
    "currency": "US$",
    "validity": "2027 · Low 1 Jan–31 Mar / High 1 Apr–31 Dec",
    "note": "Net STO rates (USD).",
    "sections": [
      {
        "title": "Superior & Honeymoon — Low (per person, B&B)",
        "rows": [
          [
            "Adult sharing",
            "137"
          ],
          [
            "Adult single",
            "177"
          ],
          [
            "Child sharing",
            "69"
          ],
          [
            "Child single",
            "89"
          ]
        ]
      },
      {
        "title": "Superior & Honeymoon — High (per person, B&B)",
        "rows": [
          [
            "Adult sharing",
            "165"
          ],
          [
            "Adult single",
            "217"
          ],
          [
            "Child sharing",
            "83"
          ],
          [
            "Child single",
            "109"
          ]
        ]
      },
      {
        "title": "Superior & Honeymoon — all seasons",
        "rows": [
          [
            "Guide per night",
            "80"
          ]
        ]
      }
    ],
    "commission": "20% STO"
  },
  "the-victorian-manor": {
    "name": "The Victorian Manor (Bayete Collection)",
    "region": "Vic Falls",
    "currency": "US$",
    "validity": "2027 · 1 Jan–31 Dec",
    "note": "Net STO rates (USD).",
    "sections": [
      {
        "title": "Per person, B&B (1 Jan–31 Dec)",
        "rows": [
          [
            "Victorian Suite — sharing",
            "221"
          ],
          [
            "Victorian Suite — single",
            "289"
          ],
          [
            "Master Suite — sharing",
            "257"
          ],
          [
            "Master Suite — single",
            "333"
          ],
          [
            "Cassa 2-Bedroom Unit",
            "561"
          ],
          [
            "Villa — sharing",
            "281"
          ],
          [
            "Villa — single",
            "365"
          ],
          [
            "Exclusive Entire Manor",
            "4020"
          ],
          [
            "Guide per night",
            "100"
          ]
        ]
      }
    ],
    "commission": "20% STO"
  },
  "pioneers-victoria-falls": {
    "name": "Pioneers Victoria Falls",
    "region": "Vic Falls",
    "currency": "US$",
    "validity": "2027 · Jan–May / Jun–Oct / Nov–Dec",
    "note": "Net STO rates (USD).",
    "sections": [
      {
        "title": "Per person, B&B — Jan–May (per person, B&B)",
        "rows": [
          [
            "pp sharing",
            "164"
          ],
          [
            "single",
            "230"
          ],
          [
            "child 4–11 sharing",
            "82"
          ],
          [
            "child 4–11 single",
            "230"
          ]
        ]
      },
      {
        "title": "Per person, B&B — Jun–Oct (per person, B&B)",
        "rows": [
          [
            "pp sharing",
            "184"
          ],
          [
            "single",
            "258"
          ],
          [
            "child 4–11 sharing",
            "92"
          ],
          [
            "child 4–11 single",
            "258"
          ]
        ]
      },
      {
        "title": "Per person, B&B — Nov–Dec (per person, B&B)",
        "rows": [
          [
            "pp sharing",
            "164"
          ],
          [
            "single",
            "230"
          ],
          [
            "child 4–11 sharing",
            "82"
          ],
          [
            "child 4–11 single",
            "230"
          ]
        ]
      }
    ],
    "commission": "STO"
  },
  "camp-kwando": {
    "name": "Camp Kwando",
    "commission": "20% STO",
    "currency": "N$",
    "validity": "01 Dec 2025 – 30 Nov 2026",
    "note": "All rates in Namibian Dollar, incl. VAT & Tourism Levy. Net STO rates.",
    "sections": [
      {
        "title": "Bed & Breakfast (per person, per night)",
        "rows": [
          [
            "Tented River Chalet — Single",
            "1,612"
          ],
          [
            "Tented River Chalet — Double (pp sharing)",
            "1,380"
          ],
          [
            "Tented Chalet — Single",
            "1,208"
          ],
          [
            "Tented Chalet — Double (pp sharing)",
            "1,072"
          ],
          [
            "Tree House — Single",
            "2,700"
          ],
          [
            "Tree House — Double (pp sharing)",
            "2,052"
          ]
        ]
      },
      {
        "title": "Dinner, Bed & Breakfast (per person, per night)",
        "rows": [
          [
            "Tented River Chalet — Single",
            "2,032"
          ],
          [
            "Tented River Chalet — Double (pp sharing)",
            "1,800"
          ],
          [
            "Tented Chalet — Single",
            "1,628"
          ],
          [
            "Tented Chalet — Double (pp sharing)",
            "1,492"
          ],
          [
            "Tree House — Single",
            "3,120"
          ],
          [
            "Tree House — Double (pp sharing)",
            "2,472"
          ]
        ]
      },
      {
        "title": "Activities (per person)",
        "rows": [
          [
            "Game Drive (min 2 / max 10 pax)",
            "760"
          ],
          [
            "Boat Cruise (morning or sunset)",
            "552"
          ],
          [
            "Bird Cruise (mornings only)",
            "552"
          ]
        ]
      }
    ]
  },
  "epako-safari-lodge": {
    "name": "Epako Safari Lodge",
    "commission": "20% STO",
    "currency": "N$",
    "validity": "2026",
    "note": "All rates in Namibian Dollar, incl. VAT & Tourism Levy. Net STO rates.",
    "sections": [
      {
        "title": "Rates (per person, per night)",
        "rows": [
          [
            "Deluxe Room (Sharing pp) - DBB",
            "7,120"
          ],
          [
            "Deluxe Room (Single) - DBB",
            "10,720"
          ],
          [
            "Junior Suite (Sharing pp) - DBB",
            "9,720"
          ],
          [
            "Junior Suite (Single) - DBB",
            "14,240"
          ],
          [
            "Tour Guide Room - DBB",
            "2,190"
          ]
        ]
      }
    ]
  },
  "ababis-guest-farm": {
    "name": "Ababis Guest Farm",
    "commission": "20% STO",
    "currency": "N$",
    "validity": "2026",
    "note": "All rates in Namibian Dollar, incl. VAT & Tourism Levy. Net STO rates.",
    "sections": [
      {
        "title": "Rates (per person, per night)",
        "rows": [
          [
            "Comfort Double Room (Sharing) - DBB",
            "2,496"
          ],
          [
            "Comfort Single Room - DBB",
            "2,800"
          ],
          [
            "Comfort Double (2 Nights Stay Discount) - DBB",
            "2,246.40"
          ],
          [
            "Comfort Single (2 Nights Stay Discount) - DBB",
            "2,520"
          ],
          [
            "Self-Catering Farmhouse (2 Pax Sharing) - RO",
            "800"
          ],
          [
            "Campsite (Per Person) - RO",
            "280"
          ],
          [
            "Tour Guide Room - DBB",
            "1,040"
          ]
        ]
      }
    ]
  },
  "africa-safari-lodge": {
    "name": "Africa Safari Lodge",
    "commission": "40% STO",
    "currency": "N$",
    "validity": "2026",
    "note": "All rates in Namibian Dollar, incl. VAT & Tourism Levy. Net STO rates.",
    "sections": [
      {
        "title": "Rates (per person, per night)",
        "rows": [
          [
            "Standard Room (Sharing) - DBB",
            "967"
          ],
          [
            "Standard Room (Single) - DBB",
            "1,192"
          ],
          [
            "Standard Room (Sharing) - BB",
            "672"
          ],
          [
            "Standard Room (Single) - BB",
            "897"
          ],
          [
            "Deluxe Family Room (2 Adults Sharing) - DBB",
            "2,753"
          ],
          [
            "Deluxe Family Room (2 Adults Sharing) - BB",
            "1,863"
          ]
        ]
      }
    ]
  },
  "aloegrove-safari-lodge": {
    "name": "Aloegrove Safari Lodge",
    "commission": "20% STO",
    "currency": "N$",
    "validity": "2026",
    "note": "All rates in Namibian Dollar, incl. VAT & Tourism Levy. Net STO rates.",
    "sections": [
      {
        "title": "Rates (per person, per night)",
        "rows": [
          [
            "Standard Room (Sharing pp) - B&B",
            "1,420.80"
          ],
          [
            "Standard Room (Single) - B&B",
            "1,624"
          ],
          [
            "Luxury Room (Sharing pp) - B&B",
            "1,644.80"
          ],
          [
            "Luxury Room (Single) - B&B",
            "1,848"
          ],
          [
            "Kids 5-11 sharing - B&B",
            "432"
          ],
          [
            "Kids 12-18 sharing - B&B",
            "1,280"
          ],
          [
            "Tour Guide Room - B&B",
            "1,200"
          ]
        ]
      }
    ]
  },
  "alte-kalkofen-lodge": {
    "name": "Alte Kalkofen Lodge",
    "commission": "20% STO",
    "currency": "N$",
    "validity": "2026",
    "note": "All rates in Namibian Dollar, incl. VAT & Tourism Levy. Net STO rates.",
    "sections": [
      {
        "title": "Rates (per person, per night)",
        "rows": [
          [
            "Luxury Chalet (Sharing) - B&B",
            "1,352"
          ],
          [
            "Luxury Chalet (Single) - B&B",
            "1,560"
          ],
          [
            "Luxury Chalet (Sharing) - Self Catering (Acc Only)",
            "1,184"
          ],
          [
            "Luxury Chalet (Single) - Self Catering (Acc Only)",
            "1,408"
          ],
          [
            "Children 3-13 years sharing - B&B",
            "676"
          ],
          [
            "Camping (Per Person) - RO",
            "200"
          ],
          [
            "Tour Guide Room - B&B",
            "812"
          ]
        ]
      }
    ]
  },
  "atlantic-villa": {
    "name": "Atlantic Villa Boutique Guesthouse",
    "commission": "20% STO",
    "currency": "N$",
    "validity": "2026",
    "note": "All rates in Namibian Dollar, incl. VAT & Tourism Levy. Net STO rates.",
    "sections": [
      {
        "title": "Rates (per person, per night)",
        "rows": [
          [
            "Standard Room (Sharing pp) - B&B",
            "1,056"
          ],
          [
            "Standard Room (Single) - B&B",
            "1,440"
          ],
          [
            "Deluxe Room (Sharing pp) - B&B",
            "1,320"
          ],
          [
            "Deluxe Room (Single) - B&B",
            "1,760"
          ],
          [
            "Luxury Room (Sharing pp) - B&B",
            "1,424"
          ],
          [
            "Luxury Room (Single) - B&B",
            "1,936"
          ],
          [
            "Junior Suite (Sharing pp) - B&B",
            "2,024"
          ],
          [
            "Junior Suite (Single) - B&B",
            "2,816"
          ],
          [
            "Tour Guide Rate (Nett) - B&B",
            "750"
          ]
        ]
      }
    ]
  },
  "auas-safari-lodge": {
    "name": "Auas Safari Lodge",
    "commission": "20% STO",
    "currency": "N$",
    "validity": "2026",
    "note": "All rates in Namibian Dollar, incl. VAT & Tourism Levy. Net STO rates.",
    "sections": [
      {
        "title": "Rates (per person, per night)",
        "rows": [
          [
            "Standard Room (Sharing pp) - DBB",
            "1,888"
          ],
          [
            "Standard Room (Single) - DBB",
            "2,208"
          ],
          [
            "Luxury Room (Sharing pp) - DBB",
            "2,500"
          ],
          [
            "Luxury Room (Single) - DBB",
            "2,816"
          ],
          [
            "Children (7-12 years) sharing - DBB",
            "1,200"
          ],
          [
            "Children (3-6 years) sharing - DBB",
            "368"
          ],
          [
            "Tour Guide Rate (Nett) - DBB",
            "1,500"
          ]
        ]
      }
    ]
  },
  "bahnhof-hotel-aus": {
    "name": "Bahnhof Hotel Aus",
    "commission": "20% STO",
    "currency": "N$",
    "validity": "2026",
    "note": "All rates in Namibian Dollar, incl. VAT & Tourism Levy. Net STO rates.",
    "sections": [
      {
        "title": "Rates (per person, per night)",
        "rows": [
          [
            "Double Room (Sharing pp) - B&B",
            "948"
          ],
          [
            "Single Room - B&B",
            "1,096"
          ],
          [
            "Family Room (Sharing pp) - B&B",
            "948"
          ],
          [
            "Orange House Sharing - Self Catering (Acc Only)",
            "467.50"
          ],
          [
            "Orange House Single - Self Catering (Acc Only)",
            "935"
          ]
        ]
      }
    ]
  },
  "cornerstone-guesthouse": {
    "name": "Cornerstone Guesthouse",
    "commission": "20% STO",
    "currency": "N$",
    "validity": "2026",
    "note": "All rates in Namibian Dollar, incl. VAT & Tourism Levy. Net STO rates.",
    "sections": [
      {
        "title": "Rates (per person, per night)",
        "rows": [
          [
            "Double Room (Sharing pp) - B&B",
            "1,011.97"
          ],
          [
            "Single Room - B&B",
            "1,223.93"
          ],
          [
            "Apartment (1-Bedroom, max 2) - RO",
            "2,116.24"
          ],
          [
            "Apartment (2-Bedroom, max 4) - RO",
            "3,179.49"
          ],
          [
            "Apartment (3-Bedroom, max 6) - RO",
            "3,712.82"
          ],
          [
            "Children (4-12 years) sharing - B&B",
            "632.48"
          ]
        ]
      }
    ]
  },
  "epacha-game-lodge-spa": {
    "name": "Epacha Game Lodge & Spa",
    "commission": "20% STO",
    "currency": "N$",
    "validity": "2026",
    "note": "All rates in Namibian Dollar, incl. VAT & Tourism Levy. Net STO rates.",
    "sections": [
      {
        "title": "Rates (per person, per night)",
        "rows": [
          [
            "Hemingway Safari Tent (Sharing) - DBB",
            "3,300"
          ],
          [
            "Hemingway Safari Tent (Single) - DBB",
            "4,265"
          ],
          [
            "Family Safari Tent (Sharing) - DBB",
            "3,300"
          ],
          [
            "Epacha Lodge Chalet (Sharing) - DBB",
            "5,060"
          ],
          [
            "Epacha Lodge Chalet (Single) - DBB",
            "6,000"
          ],
          [
            "Children 6-12 sharing (Safari Tents) - DBB",
            "1,645"
          ],
          [
            "Children 6-12 sharing (Lodge Chalet) - DBB",
            "2,525"
          ],
          [
            "Tour Guide Room - DBB",
            "1,320"
          ]
        ]
      }
    ]
  },
  "epupa-falls-lodge": {
    "name": "Epupa Falls Lodge",
    "commission": "20% STO",
    "currency": "N$",
    "validity": "2026",
    "note": "All rates in Namibian Dollar, incl. VAT & Tourism Levy. Net STO rates.",
    "sections": [
      {
        "title": "Rates (per person, per night)",
        "rows": [
          [
            "River View Chalet (Sharing pp) - DBB",
            "1,712"
          ],
          [
            "River View Chalet (Single) - DBB",
            "1,956"
          ],
          [
            "Standard Twin Chalet (Sharing pp) - DBB",
            "1,468"
          ],
          [
            "Standard Twin Chalet (Single) - DBB",
            "1,468"
          ],
          [
            "Children 3-12 sharing (Standard Chalet) - DBB",
            "650"
          ],
          [
            "Campsite (Per Person) - RO",
            "180"
          ],
          [
            "Tour Guide Room - DBB",
            "1,050"
          ]
        ]
      }
    ]
  },
  "erongo-rocks": {
    "name": "Erongo Rocks nature & camp",
    "commission": "10% STO",
    "currency": "N$",
    "validity": "2026",
    "note": "All rates in Namibian Dollar, incl. VAT & Tourism Levy. Net STO rates.",
    "sections": [
      {
        "title": "Rates (per person, per night)",
        "rows": [
          [
            "Comfy Camping (Sharing) - RO",
            "850"
          ],
          [
            "Comfy Camping (Single) - RO",
            "950"
          ],
          [
            "Campsite (Self-drive, per person) - RO",
            "385"
          ],
          [
            "Children 7-12 sharing - RO",
            "425"
          ],
          [
            "Tour Guide Rate (Camping) - RO",
            "192.50"
          ]
        ]
      }
    ]
  },
  "gabus-safari-lodge": {
    "name": "Gabus Safari Lodge",
    "commission": "20% STO",
    "currency": "N$",
    "validity": "2026",
    "note": "All rates in Namibian Dollar, incl. VAT & Tourism Levy. Net STO rates.",
    "sections": [
      {
        "title": "Rates (per person, per night)",
        "rows": [
          [
            "Luxury Room (Sharing pp) - DBB",
            "2,470.99"
          ],
          [
            "Luxury Room (Single) - DBB",
            "4,450.78"
          ],
          [
            "Luxury Room (Double per room) - DBB",
            "2,225.39"
          ],
          [
            "Kids 2-6 sharing - DBB",
            "369.26"
          ],
          [
            "Kids 7-11 sharing - DBB",
            "1,163.89"
          ],
          [
            "Tour Guide Room - DBB",
            "750"
          ]
        ]
      }
    ]
  },
  "ghaub": {
    "name": "Ghaub & Waterberg Wilderness",
    "commission": "20% STO",
    "currency": "N$",
    "validity": "2026",
    "note": "All rates in Namibian Dollar, incl. VAT & Tourism Levy. Net STO rates.",
    "sections": [
      {
        "title": "Rates (per person, per night)",
        "rows": [
          [
            "Ghaub Double Room (Single/Twin beds) - DBB",
            "2,720"
          ],
          [
            "Ghaub Campsite (Per Person) - RO",
            "420"
          ],
          [
            "Waterberg Plateau Lodge Rock Chalet - DBB",
            "3,480"
          ],
          [
            "Waterberg Wilderness Lodge Double Room - DBB",
            "2,560"
          ],
          [
            "Waterberg Valley Lodge Econo Chalet - DBB",
            "1,800"
          ],
          [
            "Waterberg Plateau Campsite - RO",
            "420"
          ],
          [
            "Tour Guide Room (DBB) - Nett",
            "1,000"
          ]
        ]
      }
    ]
  },
  "hansa-hotel": {
    "name": "Hansa Hotel Swakopmund",
    "commission": "20% STO",
    "currency": "N$",
    "validity": "2026",
    "note": "All rates in Namibian Dollar, incl. VAT & Tourism Levy. Net STO rates.",
    "sections": [
      {
        "title": "Rates (per person, per night)",
        "rows": [
          [
            "Single Room - B&B",
            "1,950"
          ],
          [
            "Double Room (Sharing pp) - B&B",
            "1,375"
          ],
          [
            "Double Room (Per Room) - B&B",
            "2,750"
          ],
          [
            "Triple Room - B&B",
            "3,250"
          ],
          [
            "Suite - B&B",
            "3,460"
          ],
          [
            "Children 5-12 sharing - B&B",
            "225"
          ],
          [
            "Children 13-18 sharing - B&B",
            "330"
          ],
          [
            "Tour Guide Room - B&B",
            "1,220"
          ]
        ]
      }
    ]
  },
  "hohewarte-guestfarm": {
    "name": "Hohewarte Guestfarm",
    "commission": "20% STO",
    "currency": "N$",
    "validity": "2026",
    "note": "All rates in Namibian Dollar, incl. VAT & Tourism Levy. Net STO rates.",
    "sections": [
      {
        "title": "Rates (per person, per night)",
        "rows": [
          [
            "Double Room (Sharing pp) - DBB",
            "1,600"
          ],
          [
            "Single Room - DBB",
            "2,000"
          ],
          [
            "Child u12 sharing - DBB",
            "800"
          ],
          [
            "Tour Guide Room - DBB",
            "1,000"
          ]
        ]
      }
    ]
  },
  "hotel-thule": {
    "name": "Hotel Thule",
    "commission": "15% STO",
    "currency": "N$",
    "validity": "2026",
    "note": "All rates in Namibian Dollar, incl. VAT & Tourism Levy. Net STO rates.",
    "sections": [
      {
        "title": "Rates (per person, per night)",
        "rows": [
          [
            "Double Room (Sharing pp) - B&B",
            "1,649"
          ],
          [
            "Single Room - B&B",
            "1,649"
          ],
          [
            "Double Room (Per Room) - B&B",
            "3,298"
          ],
          [
            "Children 3-12 sharing - B&B",
            "625"
          ],
          [
            "Tour Guide Room - B&B",
            "1,050"
          ]
        ]
      }
    ]
  },
  "kalahari-game-lodge": {
    "name": "Kalahari Game Lodge",
    "commission": "20% STO",
    "currency": "N$",
    "validity": "2026",
    "note": "All rates in Namibian Dollar, incl. VAT & Tourism Levy. Net STO rates.",
    "sections": [
      {
        "title": "Rates (per person, per night)",
        "rows": [
          [
            "Chalet (Sharing pp) - DBB",
            "1,935"
          ],
          [
            "Chalet (Single) - DBB",
            "3,352"
          ],
          [
            "Campsite (Per Person) - RO",
            "378"
          ],
          [
            "Kids 4-9 sharing - DBB",
            "977.50"
          ],
          [
            "Tour Guide Room (2nd) - DBB",
            "700"
          ]
        ]
      }
    ]
  },
  "waldeck-lodge": {
    "name": "Waldeck Lodge",
    "commission": "25% STO",
    "currency": "N$",
    "validity": "2026",
    "note": "All rates in Namibian Dollar, incl. VAT & Tourism Levy. Net STO rates.",
    "sections": [
      {
        "title": "Rates (per person, per night)",
        "rows": [
          [
            "Per Person Rate (1 - 6 guests) - Full Inclusive",
            "24,750"
          ],
          [
            "Per Person Rate (7 - 16 guests) - Full Inclusive",
            "20,625"
          ]
        ]
      }
    ]
  },
  "kaoko-mopane-lodge": {
    "name": "Kaoko Mopane Lodge & Camping",
    "commission": "15% STO",
    "currency": "N$",
    "validity": "2026",
    "note": "All rates in Namibian Dollar, incl. VAT & Tourism Levy. Net STO rates.",
    "sections": [
      {
        "title": "Rates (per person, per night)",
        "rows": [
          [
            "Luxury Room — Single",
            "2,252.50"
          ],
          [
            "Luxury Room — Double/Twin (pp sharing)",
            "1,921"
          ],
          [
            "Child 4–12 yrs (sharing with adults)",
            "807.50"
          ],
          [
            "Tour Guide (per guide)",
            "1,150"
          ],
          [
            "Luxury Room — Single",
            "1,870"
          ],
          [
            "Luxury Room — Double/Twin (pp sharing)",
            "1,513"
          ],
          [
            "Child 4–12 yrs",
            "510"
          ],
          [
            "Tour Guide",
            "900"
          ],
          [
            "Per Person",
            "255"
          ],
          [
            "Child 4–12 yrs",
            "127.50"
          ],
          [
            "Overlander (10+ pax)",
            "212.50"
          ]
        ]
      }
    ]
  },
  "nooishof": {
    "name": "Nooishof",
    "commission": "25% STO",
    "currency": "N$",
    "validity": "2026",
    "note": "All rates in Namibian Dollar, incl. VAT & Tourism Levy. Net STO rates.",
    "sections": [
      {
        "title": "Rates (per person, per night)",
        "rows": [
          [
            "Adult (per person per night)",
            "6,075"
          ],
          [
            "Child 4–15 yrs (per night)",
            "3,037.50"
          ],
          [
            "Guide (per night, nett)",
            "2,500"
          ]
        ]
      }
    ]
  },
  "droombos-estate": {
    "name": "Droombos Estate & Simanya River Lodge",
    "commission": "20% STO",
    "currency": "N$",
    "validity": "2026",
    "note": "All rates in Namibian Dollar, incl. VAT & Tourism Levy. Net STO rates.",
    "sections": [
      {
        "title": "Rates (per person, per night)",
        "rows": [
          [
            "Droombos Distinctive Room (Sharing) - B&B (Low Season)",
            "4,449"
          ],
          [
            "Droombos Distinctive Room (Sharing) - B&B (High Season)",
            "4,894"
          ],
          [
            "Droombos Distinctive Room (Single) - B&B (Low Season)",
            "5,121"
          ],
          [
            "Droombos Distinctive Room (Single) - B&B (High Season)",
            "5,633"
          ],
          [
            "Droombos Luxury Room (Sharing) - B&B (Low Season)",
            "2,759"
          ],
          [
            "Droombos Luxury Room (Sharing) - B&B (High Season)",
            "3,035"
          ],
          [
            "Droombos Luxury Room (Single) - B&B (Low Season)",
            "3,146"
          ],
          [
            "Droombos Luxury Room (Single) - B&B (High Season)",
            "3,461"
          ],
          [
            "Droombos Standard Room (Sharing) - B&B (Low Season)",
            "1,355"
          ],
          [
            "Droombos Standard Room (Sharing) - B&B (High Season)",
            "1,491"
          ],
          [
            "Droombos Standard Room (Single) - B&B (Low Season)",
            "1,549"
          ],
          [
            "Droombos Standard Room (Single) - B&B (High Season)",
            "1,704"
          ],
          [
            "Droombos Vineyard Glamping (Sharing) - B&B (Low Season)",
            "700"
          ],
          [
            "Droombos Vineyard Glamping (Sharing) - B&B (High Season)",
            "880"
          ],
          [
            "Droombos Campsite (Sharing) - RO (Low Season)",
            "400"
          ],
          [
            "Droombos Campsite (Sharing) - RO (High Season)",
            "480"
          ],
          [
            "Simanya Standard Chalet (Sharing) - DBB (Low Season)",
            "2,904"
          ],
          [
            "Simanya Standard Chalet (Sharing) - DBB (High Season)",
            "3,049.20"
          ],
          [
            "Simanya Standard Chalet (Single) - DBB (Low Season)",
            "3,505.92"
          ],
          [
            "Simanya Standard Chalet (Single) - DBB (High Season)",
            "3,681.22"
          ],
          [
            "Simanya Luxury Chalet (Sharing) - DBB (Low Season)",
            "4,488"
          ],
          [
            "Simanya Luxury Chalet (Sharing) - DBB (High Season)",
            "4,712.40"
          ],
          [
            "Simanya Luxury Chalet (Single) - DBB (Low Season)",
            "5,192"
          ],
          [
            "Simanya Luxury Chalet (Single) - DBB (High Season)",
            "5,451.60"
          ],
          [
            "Simanya Campsite (Sharing) - RO (Low Season)",
            "350"
          ],
          [
            "Simanya Campsite (Sharing) - RO (High Season)",
            "420"
          ],
          [
            "Tour Guide Room (Droombos) - B&B (Low Season)",
            "1,200"
          ],
          [
            "Tour Guide Room (Droombos) - B&B (High Season)",
            "1,200"
          ],
          [
            "Tour Guide Room (Simanya) - DBB (Low Season)",
            "1,110"
          ],
          [
            "Tour Guide Room (Simanya) - DBB (High Season)",
            "1,110"
          ]
        ]
      }
    ]
  },
  "emanya-at-etosha": {
    "name": "Emanya at Etosha",
    "commission": "25% STO",
    "currency": "N$",
    "validity": "2026",
    "note": "All rates in Namibian Dollar, incl. VAT & Tourism Levy. Net STO rates.",
    "sections": [
      {
        "title": "Rates (per person, per night)",
        "rows": [
          [
            "Standard Chalet (Sharing) - B&B (Low Season)",
            "1,477.50"
          ],
          [
            "Standard Chalet (Sharing) - B&B (High Season)",
            "1,875"
          ],
          [
            "Standard Chalet (Single) - B&B (Low Season)",
            "2,325"
          ],
          [
            "Standard Chalet (Single) - B&B (High Season)",
            "3,000"
          ],
          [
            "Standard Chalet (Sharing) - DBB (Low Season)",
            "1,856.25"
          ],
          [
            "Standard Chalet (Sharing) - DBB (High Season)",
            "2,257.50"
          ],
          [
            "Standard Chalet (Single) - DBB (Low Season)",
            "2,970"
          ],
          [
            "Standard Chalet (Single) - DBB (High Season)",
            "3,210"
          ],
          [
            "Children 4-11 sharing - B&B (Low Season)",
            "877.50"
          ],
          [
            "Children 4-11 sharing - B&B (High Season)",
            "1,125"
          ],
          [
            "Children 4-11 sharing - DBB (Low Season)",
            "1,113.75"
          ],
          [
            "Children 4-11 sharing - DBB (High Season)",
            "1,350"
          ],
          [
            "Tour Guide Room - DBB (Low Season)",
            "880"
          ],
          [
            "Tour Guide Room - DBB (High Season)",
            "880"
          ]
        ]
      }
    ]
  },
  "namib-guesthouse": {
    "name": "Namib Guesthouse",
    "commission": "20% STO",
    "currency": "N$",
    "validity": "2026",
    "note": "All rates in Namibian Dollar, incl. VAT & Tourism Levy. Net STO rates.",
    "sections": [
      {
        "title": "Rates (per person, per night)",
        "rows": [
          [
            "Single Room (Low Season)",
            "1,120"
          ],
          [
            "Single Room (High Season)",
            "1,440"
          ],
          [
            "Luxury Single Room (Low Season)",
            "1,280"
          ],
          [
            "Luxury Single Room (High Season)",
            "1,600"
          ],
          [
            "Double Room (pp sharing) (Low Season)",
            "1,040"
          ],
          [
            "Double Room (pp sharing) (High Season)",
            "1,160"
          ],
          [
            "Luxury Double (pp sharing) (Low Season)",
            "1,160"
          ],
          [
            "Luxury Double (pp sharing) (High Season)",
            "1,360"
          ],
          [
            "Family Suite (pp sharing) (Low Season)",
            "1,160"
          ],
          [
            "Family Suite (pp sharing) (High Season)",
            "1,360"
          ],
          [
            "Child 7–12 yrs (per child) (Low Season)",
            "600"
          ],
          [
            "Child 7–12 yrs (per child) (High Season)",
            "600"
          ],
          [
            "Tour Guide (Low Season)",
            "700"
          ],
          [
            "Tour Guide (High Season)",
            "700"
          ]
        ]
      }
    ]
  },
  "strand-hotel-swakopmund": {
    "name": "Strand Hotel Swakopmund",
    "commission": "20% STO",
    "currency": "N$",
    "validity": "2026",
    "note": "Net STO rates, incl. VAT & levy.",
    "cols": [
      "Room Type",
      "DBL/Sharing BB",
      "Single BB",
      "1 Child 7–13 Yrs BB  Adult",
      "1 Child 7–13 Yrs BB  Interleading"
    ],
    "rows": [
      [
        "Standard Rooms",
        "3,518",
        "5,629",
        "879",
        "2,638"
      ],
      [
        "Standard Sea Facing",
        "3,758",
        "6,013",
        "939",
        "2,818"
      ],
      [
        "Luxury Rooms",
        "4,222",
        "6,754",
        "1,055",
        "3,166"
      ],
      [
        "Luxury Sea Facing",
        "4,462",
        "7,138",
        "1,115",
        "3,346"
      ],
      [
        "Junior Suite",
        "4,573",
        "7,317",
        "1,143",
        "3,430"
      ],
      [
        "Luxury Suite",
        "5,629",
        "9,005",
        "1,407",
        "4,222"
      ],
      [
        "Presidential Suite",
        "8,794",
        "14,071",
        "N/A",
        "N/A"
      ]
    ]
  },
  "midgard-country-estate": {
    "name": "Midgard Country Estate",
    "commission": "20% STO",
    "currency": "N$",
    "validity": "2026",
    "note": "Net STO rates, incl. VAT & levy.",
    "cols": [
      "Room Type",
      "DBL/Sharing BB",
      "DBL/Sharing DBB",
      "Single BB",
      "Single DBB",
      "1 Child 7–13 BB",
      "1 Child 7–13 DBB"
    ],
    "rows": [
      [
        "Standard Room",
        "2,472",
        "3,086",
        "3,956",
        "4,718",
        "618",
        "771"
      ],
      [
        "Family Room",
        "3,214",
        "3,902",
        "5,142",
        "6,023",
        "804",
        "976"
      ],
      [
        "Junior Suite",
        "3,804",
        "4,551",
        "6,086",
        "7,062",
        "951",
        "1,138"
      ],
      [
        "Presidential Suite",
        "4,708",
        "5,546",
        "7,533",
        "8,653",
        "1,177",
        "1,386"
      ]
    ]
  },
  "alte-villa-2025": {
    "name": "Alte Villa",
    "commission": "15% STO",
    "currency": "N$",
    "validity": "2026",
    "note": "Net STO rates, incl. VAT & levy.",
    "sections": [
      {
        "title": "Double Rooms (per room / night)",
        "rows": [
          [
            "Kolmanskoppe — 1 adult",
            "2,092.75"
          ],
          [
            "Kolmanskoppe — 2 adults",
            "3,381.30"
          ],
          [
            "Garub — 1 adult (private lounge shared w/ Grasplatz)",
            "2,092.75"
          ],
          [
            "Garub — 2 adults",
            "3,381.30"
          ],
          [
            "Grasplatz — 1 adult (private lounge shared w/ Garub)",
            "2,092.75"
          ],
          [
            "Grasplatz — 2 adults",
            "3,381.30"
          ]
        ]
      },
      {
        "title": "Family / Studio Rooms (sleeps up to 4)",
        "rows": [
          [
            "Bogenfels Studio — 1 adult",
            "2,092.75"
          ],
          [
            "Bogenfels Studio — 2 adults",
            "3,381.30"
          ],
          [
            "Bogenfels Studio — 3 adults",
            "5,071.95"
          ],
          [
            "Bogenfels — +1 child &amp;lt;12 (with 2 adults)",
            "920.00"
          ],
          [
            "Bogenfels — +2 children &amp;lt;12 (with 2 adults)",
            "1,840.00"
          ],
          [
            "Tsiras Mountains (private terrace) — 1 adult",
            "2,092.75"
          ],
          [
            "Tsiras Mountains — 2 adults",
            "3,381.30"
          ],
          [
            "Tsiras Mountains — +1 child &amp;lt;12",
            "920.00"
          ],
          [
            "Tsiras Mountains — +2 children &amp;lt;12",
            "1,840.00"
          ]
        ]
      },
      {
        "title": "Apartments (self-catering option)",
        "rows": [
          [
            "Itchaboe Apartment — 1 adult",
            "2,092.75"
          ],
          [
            "Itchaboe Apartment — 2 adults",
            "3,381.30"
          ],
          [
            "Itchaboe — 3 adults",
            "5,071.95"
          ],
          [
            "Itchaboe — 4 adults",
            "6,762.00"
          ],
          [
            "Itchaboe — +1 child &amp;lt;12",
            "920.00"
          ],
          [
            "Itchaboe — +2 children &amp;lt;12",
            "1,840.00"
          ],
          [
            "Loft — 1 adult",
            "2,092.75"
          ],
          [
            "Loft — 2 adults",
            "3,381.30"
          ],
          [
            "Loft — +1 child &amp;lt;12",
            "920.00"
          ],
          [
            "Loft — +2 children &amp;lt;12",
            "1,840.00"
          ],
          [
            "Charlottental — 1 adult",
            "2,092.75"
          ],
          [
            "Charlottental — 2 adults",
            "3,381.30"
          ],
          [
            "Charlottental — 3 adults",
            "5,071.95"
          ],
          [
            "Charlottental — 4 adults",
            "6,762.00"
          ],
          [
            "Märchental — 1 adult",
            "2,092.75"
          ],
          [
            "Märchental — 2 adults",
            "3,381.30"
          ]
        ]
      }
    ]
  },
  "barkhan-dune-retreat": {
    "name": "Barkhan Dune Retreat",
    "commission": "20% STO",
    "currency": "N$",
    "validity": "2026",
    "note": "Net STO rates, incl. VAT & levy.",
    "sections": [
      {
        "title": "Dune Chalet — Full Board (per person, per night)",
        "rows": [
          [
            "Sharing — STO 1 (1 night)",
            "3,485.00"
          ],
          [
            "Sharing — STO 2 (2+ nights)",
            "3,280.00"
          ],
          [
            "Child 2–10 yrs (PCPN) — STO 1",
            "1,743.00"
          ],
          [
            "Child 2–10 yrs (PCPN) — STO 2",
            "1,640.00"
          ],
          [
            "Single — STO 1",
            "4,531.00"
          ],
          [
            "Single — STO 2",
            "4,264.00"
          ]
        ]
      },
      {
        "title": "Dune Chalet — Dinner, Bed &amp; Breakfast",
        "rows": [
          [
            "Sharing — STO 1",
            "2,318.00"
          ],
          [
            "Sharing — STO 2",
            "2,182.00"
          ],
          [
            "Child 2–10 yrs — STO 1",
            "1,159.00"
          ],
          [
            "Child 2–10 yrs — STO 2",
            "1,091.00"
          ],
          [
            "Single — STO 1",
            "3,013.00"
          ],
          [
            "Single — STO 2",
            "2,836.00"
          ],
          [
            "Guide (DBB) — rack rate",
            "1,370.00"
          ]
        ]
      },
      {
        "title": "Okanti House &amp; Rustic Cabin — Self-Catering",
        "rows": [
          [
            "Sharing — STO 1",
            "1,165.00"
          ],
          [
            "Sharing — STO 2",
            "1,096.00"
          ],
          [
            "Child 2–10 yrs — STO 1",
            "582.00"
          ],
          [
            "Child 2–10 yrs — STO 2",
            "548.00"
          ],
          [
            "Single — STO 1",
            "1,514.00"
          ],
          [
            "Single — STO 2",
            "1,425.00"
          ]
        ]
      },
      {
        "title": "Exclusive Kuangukuangu (bed only)",
        "rows": [
          [
            "Self-Catering Sharing — STO 1",
            "3,030.00"
          ],
          [
            "Self-Catering Sharing — STO 2",
            "2,852.00"
          ],
          [
            "Single Self-Catering — STO 1",
            "3,939.00"
          ],
          [
            "Single Self-Catering — STO 2",
            "3,708.00"
          ]
        ]
      },
      {
        "title": "Activities (per person)",
        "rows": [
          [
            "Sundowner DriveIncl. water, beer/soda &amp; light snacks",
            "660.00"
          ],
          [
            "Guided Hike to Ubib Grotto (≈4h)Prehistoric rock paintings · min 3 / max 8 pax · incl. water, beer/soda",
            "660.00"
          ],
          [
            "Guided Klipspringer Mountain Summit Hike (≈4h)Incl. water, beer/soda &amp; light snacks",
            "660.00"
          ],
          [
            "Self-Guided E-Bike Kudu Trail Picnic (≈2h)Incl. e-bike rental, water, beer/soda &amp; light snacks",
            "660.00"
          ],
          [
            "E-Bike Rental (2 hours)",
            "605.00"
          ]
        ]
      },
      {
        "title": "Meals — for self-catering guests (per person)",
        "rows": [
          [
            "Breakfast",
            "225.00"
          ],
          [
            "Lunch",
            "345.00"
          ],
          [
            "Dinner",
            "565.00"
          ],
          [
            "Lunch pack (to take on excursions)",
            "186.00"
          ],
          [
            "Tea time cake &amp; coffee @ 16:00",
            "115.00"
          ]
        ]
      },
      {
        "title": "Other",
        "rows": [
          [
            "Laundry — per 6kg load",
            "265.00"
          ]
        ]
      }
    ]
  },
  "belvedere-boutique-hotel": {
    "name": "Belvedere Boutique Hotel",
    "commission": "15% STO",
    "currency": "N$",
    "validity": "2026",
    "note": "Net STO rates, incl. VAT & levy.",
    "sections": [
      {
        "title": "Room Rates — STO (per room, per night)",
        "rows": [
          [
            "Standard Room — Single (12 rooms available)",
            "2,185.00"
          ],
          [
            "Standard Room — Double",
            "3,031.00"
          ],
          [
            "Family Room — Single (1 room)",
            "2,233.00"
          ],
          [
            "Family Room — Double",
            "3,139.00"
          ],
          [
            "Luxury Room — Single (4 rooms)",
            "2,525.00"
          ],
          [
            "Luxury Room — Double",
            "3,419.00"
          ],
          [
            "Luxury Twin — Single (1 room)",
            "2,525.00"
          ],
          [
            "Luxury Twin — Double",
            "3,419.00"
          ],
          [
            "Penthouse — Single (1 room)",
            "2,776.00"
          ],
          [
            "Penthouse — Double",
            "3,766.00"
          ]
        ]
      },
      {
        "title": "Family Room — Child Rates (sharing)",
        "rows": [
          [
            "Extra child (10–12 yrs)",
            "500.00"
          ],
          [
            "Extra child (13–18 yrs)Full sharing rate applies",
            "0.00"
          ]
        ]
      }
    ]
  },
  "flamingo-villa-boutique-hotel": {
    "name": "Flamingo Villas Boutique Hotel",
    "commission": "20% STO",
    "currency": "N$",
    "validity": "2026",
    "note": "Net STO rates, incl. VAT & levy.",
    "sections": [
      {
        "title": "Comfort Double / Twin Room — B&amp;B (per room)",
        "rows": [
          [
            "Single per room",
            "2,484.00"
          ],
          [
            "Double per room",
            "3,312.00"
          ],
          [
            "Children 7–12 yrs sharing",
            "1,242.40"
          ]
        ]
      },
      {
        "title": "Superior Double Room with Balcony — B&amp;B (per room)",
        "rows": [
          [
            "Single per room",
            "3,060.00"
          ],
          [
            "Double per room",
            "4,391.20"
          ],
          [
            "Children 7–12 yrs sharing",
            "1,476.80"
          ]
        ]
      },
      {
        "title": "Deluxe Double Room with Balcony — B&amp;B (per room)",
        "rows": [
          [
            "Single per room",
            "3,451.20"
          ],
          [
            "Double per room",
            "5,144.00"
          ],
          [
            "Children 7–12 yrs sharing",
            "1,507.20"
          ]
        ]
      },
      {
        "title": "Flamingo Suite with Balcony — B&amp;B (per room)",
        "rows": [
          [
            "Single per room",
            "4,673.60"
          ],
          [
            "Double per room",
            "5,535.20"
          ],
          [
            "Children 7–12 yrs sharing",
            "1,631.20"
          ]
        ]
      }
    ]
  },
  "heinitzburg-boutique-hotel": {
    "name": "Hotel Heinitzburg",
    "commission": "20% STO",
    "currency": "N$",
    "validity": "2026",
    "note": "Net STO rates, incl. VAT & levy.",
    "sections": [
      {
        "title": "Single Rooms — B&amp;B (per room)",
        "rows": [
          [
            "Single Standard Deluxe Room",
            "2,508.48"
          ],
          [
            "Single Comfort Deluxe Room",
            "2,759.98"
          ],
          [
            "Single Superior Deluxe Room",
            "2,996.83"
          ]
        ]
      },
      {
        "title": "Twin / Double — B&amp;B (per room)",
        "rows": [
          [
            "Twin Standard Deluxe Room",
            "3,708.19"
          ],
          [
            "Twin Comfort Deluxe Room",
            "4,150.96"
          ],
          [
            "Double Superior Deluxe Room",
            "4,737.79"
          ],
          [
            "Triple Comfort Deluxe Room",
            "4,737.79"
          ]
        ]
      },
      {
        "title": "Family — B&amp;B (per room)",
        "rows": [
          [
            "Family Room (2 adults + 2 children, 2 rooms / 2 bathrooms, interleading)",
            "6,900.35"
          ]
        ]
      }
    ]
  },
  "kamaku-guesthouse": {
    "name": "Kamaku Guesthouse",
    "commission": "15% STO",
    "currency": "N$",
    "validity": "2026",
    "note": "Net STO rates, incl. VAT & levy.",
    "sections": [
      {
        "title": "Rooms — B&amp;B",
        "rows": [
          [
            "Per Double Unit",
            "977.50"
          ],
          [
            "Per Single Unit",
            "765.00"
          ],
          [
            "Family Unit per person",
            "488.75"
          ]
        ]
      }
    ]
  },
  "little-sossus-lodge": {
    "name": "Little Sossus Lodge &amp; Campsite",
    "commission": "20% STO",
    "currency": "N$",
    "validity": "2026",
    "note": "Net STO rates, incl. VAT & levy.",
    "sections": [
      {
        "title": "Chalet (DBB, per room per night)",
        "rows": [
          [
            "Single room",
            "3,600.00"
          ],
          [
            "Double / Twin room",
            "5,440.00"
          ],
          [
            "3-bed room (max 2 adults)",
            "6,360.00"
          ],
          [
            "4-bed room (max 2 adults)",
            "7,280.00"
          ],
          [
            "Additional Tour Guide / Driver",
            "1,750.00"
          ]
        ]
      },
      {
        "title": "Camping (self-catering, per site + per person)",
        "rows": [
          [
            "Campsite per night",
            "238.00"
          ],
          [
            "Per person per night",
            "221.00"
          ],
          [
            "Per child (5–11 yrs) per night",
            "148.75"
          ]
        ]
      },
      {
        "title": "Meals (per person — incl. VAT)",
        "rows": [
          [
            "Lunch pack",
            "330.00"
          ],
          [
            "Lunch",
            "350.00"
          ],
          [
            "Breakfast",
            "380.00"
          ],
          [
            "Breakfast — child 5–11 yrs",
            "300.00"
          ],
          [
            "Dinner",
            "550.00"
          ],
          [
            "Dinner — child 5–11 yrs",
            "450.00"
          ]
        ]
      },
      {
        "title": "Activities (per person)",
        "rows": [
          [
            "Guided Sossusvlei Trip (min 2 paying, child 5–11 yrs 50%)",
            "3,000.00"
          ],
          [
            "Sundowner Drive (min 2 pax, child 5–11 yrs 50%)",
            "1,850.00"
          ]
        ]
      }
    ]
  },
  "luderitz-nest-hotel": {
    "name": "Lüderitz Nest Hotel",
    "commission": "15% STO",
    "currency": "N$",
    "validity": "2026",
    "note": "Net STO rates, incl. VAT & levy.",
    "sections": [
      {
        "title": "Comfort Rooms — B&amp;B (per room — gross)",
        "rows": [
          [
            "Comfort Single",
            "2,516.00"
          ],
          [
            "Comfort Twin / Double",
            "4,046.00"
          ],
          [
            "Comfort Family Room (max 2 adults + 2 children 0–12)",
            "6,562.00"
          ]
        ]
      },
      {
        "title": "Deluxe Rooms &amp; Suite — B&amp;B (per room — gross)",
        "rows": [
          [
            "Deluxe Single",
            "3,085.50"
          ],
          [
            "Deluxe Twin / Double",
            "4,938.50"
          ],
          [
            "Suite",
            "8,202.50"
          ],
          [
            "Tour Guide (50% of single rack)",
            "1,480.00"
          ]
        ]
      },
      {
        "title": "Meals (per person — gross)",
        "rows": [
          [
            "Breakfast — adult",
            "340.00"
          ],
          [
            "Breakfast — child 3–12 yrs",
            "240.00"
          ],
          [
            "Lunch — adult",
            "510.00"
          ],
          [
            "Lunch — child 3–12 yrs",
            "360.00"
          ],
          [
            "Dinner — adult",
            "660.00"
          ],
          [
            "Dinner — child 3–12 yrs",
            "470.00"
          ],
          [
            "Lunchpack",
            "320.00"
          ]
        ]
      }
    ]
  },
  "moon-mountain-lodge": {
    "name": "Moon Mountain Lodge",
    "commission": "20% STO",
    "currency": "N$",
    "validity": "2026",
    "note": "Net STO rates, incl. VAT & levy.",
    "sections": [
      {
        "title": "Luxury Rooms (×11) — DBB",
        "rows": [
          [
            "Single Room",
            "3,185.00"
          ],
          [
            "Double Room (per person)",
            "2,902.50"
          ]
        ]
      },
      {
        "title": "Executive Suites (×6) — DBB",
        "rows": [
          [
            "Single Room",
            "3,511.67"
          ],
          [
            "Double Room (per person)",
            "3,202.50"
          ],
          [
            "Child under 12 sharing with parents",
            "1,601.67"
          ],
          [
            "Child under 6 sharing with parents",
            "0.00"
          ]
        ]
      },
      {
        "title": "Guide Rates (nett)",
        "rows": [
          [
            "Guide DBB — 1 to 9 pax",
            "1,012.00"
          ],
          [
            "Guide DBB — 10 to 19 pax",
            "506.00"
          ],
          [
            "Guide FOC — 20+ pax",
            "0.00"
          ]
        ]
      },
      {
        "title": "Activities &amp; Extras (nett)",
        "rows": [
          [
            "Lunch pack (pp)",
            "236.00"
          ],
          [
            "Lunch — 3-course menu, 2 choices",
            "404.00"
          ],
          [
            "Guided Sossusvlei Excursion (pp)",
            "2,772.00"
          ],
          [
            "Mountain Sunset at view point (drinks &amp; snacks incl.)",
            "263.00"
          ],
          [
            "Namib-Naukluft Airstrip transfer (one way, pp)",
            "270.00"
          ]
        ]
      }
    ]
  },
  "namib-outpost": {
    "name": "Namib Outpost",
    "commission": "15% STO",
    "currency": "N$",
    "validity": "2025",
    "note": "Net STO rates, incl. VAT & levy.",
    "sections": [
      {
        "title": "High Season (01 Mar – 30 Nov) — DBB pp",
        "rows": [
          [
            "Suite — pp sharing",
            "9,460.00"
          ],
          [
            "Suite — single",
            "13,710.00"
          ],
          [
            "Superior Suite — pp sharing",
            "9,890.00"
          ],
          [
            "Child 4–12 yrs sharing with 1 full-paying adult",
            "4,855.00"
          ],
          [
            "Child 4–12 yrs sharing with 2 full-paying adults",
            "2,935.00"
          ],
          [
            "Family Suite — 2 adults + 2 children (4–12 yrs)",
            "6,440.00"
          ]
        ]
      },
      {
        "title": "Low Season (01 Dec – 28 Feb) — DBB pp",
        "rows": [
          [
            "Suite — pp sharing",
            "7,140.00"
          ],
          [
            "Suite — single",
            "10,760.00"
          ],
          [
            "Superior Suite — pp sharing",
            "7,530.00"
          ],
          [
            "Child 4–12 yrs sharing with 1 full-paying adult",
            "4,185.00"
          ],
          [
            "Child 4–12 yrs sharing with 2 full-paying adults",
            "2,528.00"
          ]
        ]
      },
      {
        "title": "Extras (per person)",
        "rows": [
          [
            "Tour Guide — meals only",
            "1,025.00"
          ],
          [
            "Sossusvlei Excursion (full day)",
            "2,945.00"
          ],
          [
            "Sundowner Drive",
            "815.00"
          ],
          [
            "Nature Walk",
            "595.00"
          ],
          [
            "Massage / Wellness — POR",
            "0.00"
          ]
        ]
      }
    ]
  },
  "ohorongo-game-and-safari-lodge": {
    "name": "Ohorongo Game &amp; Safari Lodge",
    "commission": "20% STO",
    "currency": "N$",
    "validity": "2026",
    "note": "Net STO rates, incl. VAT & levy.",
    "sections": [
      {
        "title": "Ohorongo Safari Lodge — Low Season (DBB pp)",
        "rows": [
          [
            "Double Room",
            "3,000.00"
          ],
          [
            "Triple Room (pp)",
            "2,711.00"
          ],
          [
            "Child 6–11 yrs sharing with full-paying adults",
            "1,500.00"
          ],
          [
            "Child 0–5 yrs sharing with full-paying adults",
            "0.00"
          ]
        ]
      },
      {
        "title": "Ohorongo Safari Lodge — High Season (DBB pp)",
        "rows": [
          [
            "Double Room",
            "3,582.00"
          ],
          [
            "Triple Room (pp)",
            "3,292.00"
          ],
          [
            "Child 6–11 yrs sharing with full-paying adults",
            "1,791.00"
          ],
          [
            "Child 0–5 yrs sharing with full-paying adults",
            "0.00"
          ]
        ]
      },
      {
        "title": "Ohorongo Tented Camp — Low Season (FI pp, min 2-night stay)",
        "rows": [
          [
            "Double Room — Fully Inclusive",
            "7,164.00"
          ],
          [
            "Child 6–11 yrs sharing with full-paying adults",
            "3,582.00"
          ],
          [
            "Child 0–5 yrs sharing with full-paying adults",
            "0.00"
          ]
        ]
      },
      {
        "title": "Ohorongo Tented Camp — High Season (FI pp, min 2-night stay)",
        "rows": [
          [
            "Double Room — Fully Inclusive",
            "8,616.00"
          ],
          [
            "Child 6–11 yrs sharing with full-paying adults",
            "4,308.00"
          ],
          [
            "Child 0–5 yrs sharing with full-paying adults",
            "0.00"
          ]
        ]
      },
      {
        "title": "Activities (per person, gross)",
        "rows": [
          [
            "Nature Excursion 3–4 hr (min 2, max 6)",
            "850.00"
          ],
          [
            "Nature Excursion 2 hr (min 2, max 6)",
            "425.00"
          ],
          [
            "Night Drive 2 hr (min 2, max 6)",
            "600.00"
          ],
          [
            "Rhino Tracking 3–4 hr (no children u/12)",
            "1,980.00"
          ],
          [
            "Guided Nature Walk 2 hr (max 4)",
            "425.00"
          ],
          [
            "Private Vehicle &amp; Guide (4 hr, max 5)",
            "6,750.00"
          ]
        ]
      },
      {
        "title": "Wilderness Feasts &amp; Meals (per person)",
        "rows": [
          [
            "Light Lunch (12:00–14:00)",
            "350.00"
          ],
          [
            "Brunch in Nature (min 2 guests)",
            "425.00"
          ],
          [
            "Dinner under the Stars (min 2 guests)",
            "660.00"
          ]
        ]
      }
    ]
  },
  "the-olive-exclusive": {
    "name": "The Olive Exclusive",
    "commission": "15% STO",
    "currency": "N$",
    "validity": "2026",
    "note": "Net STO rates, incl. VAT & levy.",
    "sections": [
      {
        "title": "Jan – Jun 2026 (Low Season) — B&amp;B",
        "rows": [
          [
            "Junior Suite — pp sharing",
            "4,543.00"
          ],
          [
            "Premier Suite — pp sharing",
            "5,680.00"
          ],
          [
            "Junior Suite — single",
            "5,118.00"
          ],
          [
            "Premier Suite — single",
            "6,422.00"
          ]
        ]
      },
      {
        "title": "Jul – Dec 2026 (High Season) — B&amp;B",
        "rows": [
          [
            "Junior Suite — pp sharing",
            "4,913.00"
          ],
          [
            "Premier Suite — pp sharing",
            "6,149.00"
          ],
          [
            "Junior Suite — single",
            "5,539.00"
          ],
          [
            "Premier Suite — single",
            "6,948.00"
          ]
        ]
      },
      {
        "title": "Children Sharing with 2 Full-Paying Adults",
        "rows": [
          [
            "Children under 6 yrs",
            "0.00"
          ],
          [
            "Children 12 yrs &amp; under (50% of adult rate)",
            "0.00"
          ]
        ]
      }
    ]
  },
  "opuwo-country-lodge": {
    "name": "Opuwo Country Lodge",
    "commission": "15% STO",
    "currency": "N$",
    "validity": "2026",
    "note": "Net STO rates, incl. VAT & levy.",
    "sections": [
      {
        "title": "Rooms — B&amp;B (STO gross)",
        "rows": [
          [
            "Luxury Room — pp sharing",
            "1,870.00"
          ],
          [
            "Luxury Room — single",
            "2,805.00"
          ],
          [
            "Standard Room — pp sharing",
            "1,355.75"
          ],
          [
            "Standard Room — single",
            "1,870.00"
          ],
          [
            "Children 5–11 yrs (50% of rack)",
            "0.00"
          ],
          [
            "Children 0–4 yrs",
            "0.00"
          ],
          [
            "1st Tour Guide (min 8 clients)",
            "0.00"
          ],
          [
            "1st Tour Guide (≤7 clients)",
            "1,320.00"
          ],
          [
            "2nd Tour Guide",
            "1,320.00"
          ]
        ]
      },
      {
        "title": "Camping — Self-catering",
        "rows": [
          [
            "Adult per person",
            "330.00"
          ],
          [
            "Child 5–11 yrs",
            "165.00"
          ],
          [
            "Child 0–4 yrs",
            "0.00"
          ]
        ]
      },
      {
        "title": "Meals (per person — rack)",
        "rows": [
          [
            "Breakfast",
            "395.00"
          ],
          [
            "Lunch (3-course set menu)",
            "555.00"
          ],
          [
            "Dinner (4-course set menu)",
            "690.00"
          ],
          [
            "Lunch Pack",
            "370.00"
          ]
        ]
      },
      {
        "title": "Activities (per person — rack)",
        "rows": [
          [
            "Desert Elephant Excursion (min 2)",
            "2,150.00"
          ],
          [
            "Fly-in Excursion (incl. lunch &amp; Himba)",
            "1,960.00"
          ],
          [
            "Himba Excursion",
            "1,200.00"
          ],
          [
            "Wine Tasting Flight (min 2 max 6)",
            "1,200.00"
          ],
          [
            "Epupa Falls Excursion (per guide)",
            "3,795.00"
          ],
          [
            "Epupa Falls Excursion (per guest, min 2)",
            "885.00"
          ],
          [
            "Ruacana Falls Excursion (per guide)",
            "3,795.00"
          ],
          [
            "Ruacana Falls Excursion (per guest, min 2)",
            "885.00"
          ],
          [
            "Airstrip Transfer (two-way pp)",
            "440.00"
          ]
        ]
      }
    ]
  },
  "organic-stay": {
    "name": "Organic Stay",
    "commission": "20% STO",
    "currency": "N$",
    "validity": "2026/2027",
    "note": "Net STO rates, incl. VAT & levy.",
    "sections": [
      {
        "title": "Rooms — B&amp;B",
        "rows": [
          [
            "Single",
            "1,830.00"
          ],
          [
            "Double",
            "2,920.00"
          ],
          [
            "Triple",
            "3,750.00"
          ],
          [
            "Family Standard",
            "4,250.00"
          ],
          [
            "2-Bedroom Family",
            "5,500.00"
          ]
        ]
      },
      {
        "title": "Child Policy",
        "rows": [
          [
            "Children 4 years &amp; under",
            "0.00"
          ],
          [
            "Children 5–10 years",
            "690.00"
          ],
          [
            "Children 11 years &amp; older",
            "0.00"
          ]
        ]
      }
    ]
  },
  "oyster-box-guesthouse": {
    "name": "Oyster Box Guesthouse",
    "commission": "20% STO",
    "currency": "N$",
    "validity": "2026",
    "note": "Net STO rates, incl. VAT & levy.",
    "sections": [
      {
        "title": "Single Rooms — B&amp;B (per room)",
        "rows": [
          [
            "Single Room Standard",
            "1,163.90"
          ],
          [
            "Single Room, Partial-Sea Facing",
            "1,359.23"
          ],
          [
            "Single Comfort Room, Partial-Sea Facing",
            "1,501.67"
          ]
        ]
      },
      {
        "title": "Twin / Double — B&amp;B (per room)",
        "rows": [
          [
            "Twin Room Standard",
            "1,863.86"
          ],
          [
            "Twin Room, Partial-Sea Facing",
            "2,140.59"
          ],
          [
            "Double Comfort Room, Partial-Sea Facing",
            "2,344.07"
          ]
        ]
      },
      {
        "title": "Triple — B&amp;B (per room)",
        "rows": [
          [
            "Triple Room Standard",
            "2,344.07"
          ],
          [
            "Triple Room, Partial-Sea Facing",
            "2,698.12"
          ],
          [
            "Triple Comfort Room, Partial-Sea Facing",
            "2,889.39"
          ]
        ]
      }
    ]
  },
  "rostock-ritz-desert-lodge": {
    "name": "Rostock Ritz Desert Lodge",
    "commission": "20% STO",
    "currency": "N$",
    "validity": "2026",
    "note": "Net STO rates, incl. VAT & levy.",
    "sections": [
      {
        "title": "Suites — B&amp;B",
        "rows": [
          [
            "Suite — Double/Twin (2 pax sharing)",
            "5,200.00"
          ],
          [
            "Suite — Single",
            "4,160.00"
          ],
          [
            "Children 3–11 yrs sharing with adults",
            "1,000.00"
          ],
          [
            "Children 0–2 yrs sharing with adults",
            "0.00"
          ],
          [
            "Guide — Single (no aircon)",
            "1,000.00"
          ]
        ]
      },
      {
        "title": "Meals (per person)",
        "rows": [
          [
            "Breakfast",
            "235.00"
          ],
          [
            "Lunch Pack",
            "235.00"
          ],
          [
            "Lunch (3-course set menu, max 10 + TG)",
            "350.00"
          ],
          [
            "Dinner (3-course à la carte)",
            "500.00"
          ]
        ]
      },
      {
        "title": "Activities (per person)",
        "rows": [
          [
            "Sunset Scenic Drive (2 hr, min 2 pax)",
            "800.00"
          ],
          [
            "4x4 Cave Painting Drive (4 hr, min 2 pax)",
            "1,350.00"
          ],
          [
            "4x4 Cave Painting Drive (4 hr, 3+ pax)",
            "1,200.00"
          ],
          [
            "10 Hiking Trails (3–30 km, seasonal)",
            "0.00"
          ]
        ]
      }
    ]
  },
  "sesfontein-guesthouse": {
    "name": "Sesfontein Guesthouse",
    "commission": "20% STO",
    "currency": "N$",
    "validity": "2026",
    "note": "Net STO rates, incl. VAT & levy.",
    "sections": [
      {
        "title": "Bed &amp; Breakfast (per person)",
        "rows": [
          [
            "Per person sharing",
            "1,760.00"
          ],
          [
            "Third person in room",
            "920.00"
          ],
          [
            "Per single room",
            "2,200.00"
          ],
          [
            "Guide / Pilot",
            "920.00"
          ],
          [
            "Children 7–12 yrs",
            "920.00"
          ],
          [
            "Children 0–6 yrs",
            "0.00"
          ]
        ]
      },
      {
        "title": "Dinner, Bed &amp; Breakfast (per person)",
        "rows": [
          [
            "Per person sharing",
            "2,320.00"
          ],
          [
            "Third person in room",
            "1,480.00"
          ],
          [
            "Per single room",
            "2,760.00"
          ],
          [
            "Guide / Pilot",
            "1,480.00"
          ],
          [
            "Children 7–12 yrs",
            "1,480.00"
          ]
        ]
      },
      {
        "title": "1-night Sleep-Out (DBB, min 2 pax)",
        "rows": [
          [
            "Per person",
            "3,520.00"
          ],
          [
            "Single supplement",
            "760.00"
          ],
          [
            "Child under 13 yrs",
            "2,040.00"
          ],
          [
            "Guide rate (per guide)",
            "2,040.00"
          ]
        ]
      },
      {
        "title": "2-night Hoanib Elephant Sleep-Out Package (min 2 pax)",
        "rows": [
          [
            "Per person",
            "6,720.00"
          ],
          [
            "Single supplement",
            "1,200.00"
          ],
          [
            "Child under 13 yrs",
            "3,960.00"
          ],
          [
            "Guide rate (per guide)",
            "3,960.00"
          ]
        ]
      },
      {
        "title": "3-night Rhino Tracking Sleep-Out Package (min 2 pax)",
        "rows": [
          [
            "Per person",
            "8,640.00"
          ],
          [
            "Single supplement",
            "2,040.00"
          ],
          [
            "Guide rate (per guide)",
            "5,520.00"
          ]
        ]
      },
      {
        "title": "1-night Ongongo Tented Option (DBB, min 2 pax)",
        "rows": [
          [
            "Per person",
            "2,040.00"
          ],
          [
            "Single supplement",
            "640.00"
          ],
          [
            "Child 7–12 yrs",
            "1,680.00"
          ],
          [
            "Child 0–6 yrs",
            "560.00"
          ],
          [
            "Guide rate (per guide)",
            "1,120.00"
          ]
        ]
      },
      {
        "title": "Activities (rack — fully commissionable)",
        "rows": [
          [
            "Himba Village Visit (pp, min 2)",
            "2,100.00"
          ],
          [
            "Hoanib Elephant Drive incl. Himba (pp, min 2)",
            "3,700.00"
          ],
          [
            "Sundowner Drive (incl. drinks &amp; snacks)",
            "800.00"
          ],
          [
            "Airstrip Transfer (return, per vehicle)",
            "700.00"
          ]
        ]
      }
    ]
  },
  "simanya-river-lodge": {
    "name": "Simanya River Lodge",
    "commission": "20% STO",
    "currency": "N$",
    "validity": "2026",
    "note": "Net STO rates, incl. VAT & levy.",
    "sections": [
      {
        "title": "Luxury Rooms (×16) — Low Season DBB",
        "rows": [
          [
            "Per person sharing",
            "2,904.00"
          ],
          [
            "Single Supplement",
            "601.92"
          ],
          [
            "Children 0–5 yrs (RO)",
            "0.00"
          ],
          [
            "Children 6–12 yrs (max 2 sharing)",
            "1,815.00"
          ]
        ]
      },
      {
        "title": "Luxury Rooms (×16) — High Season DBB",
        "rows": [
          [
            "Per person sharing",
            "3,049.20"
          ],
          [
            "Single Supplement",
            "632.02"
          ],
          [
            "Children 6–12 yrs (max 2 sharing)",
            "1,905.75"
          ]
        ]
      },
      {
        "title": "Distinctive Rooms (×4) — Low Season DBB",
        "rows": [
          [
            "Per person sharing",
            "4,488.00"
          ],
          [
            "Single Supplement",
            "704.00"
          ],
          [
            "Children 6–12 yrs (max 2 sharing)",
            "1,452.00"
          ]
        ]
      },
      {
        "title": "Distinctive Rooms (×4) — High Season DBB",
        "rows": [
          [
            "Per person sharing",
            "4,712.40"
          ],
          [
            "Single Supplement",
            "739.20"
          ],
          [
            "Children 6–12 yrs (max 2 sharing)",
            "1,905.75"
          ]
        ]
      },
      {
        "title": "Camping (max 5 pax per site)",
        "rows": [
          [
            "Per person — Low Season",
            "350.00"
          ],
          [
            "Per person — High Season",
            "420.00"
          ],
          [
            "Kids 6–12 yrs — Low",
            "175.00"
          ],
          [
            "Kids 6–12 yrs — High",
            "200.00"
          ]
        ]
      },
      {
        "title": "Meals (per person)",
        "rows": [
          [
            "Breakfast",
            "275.00"
          ],
          [
            "Breakfast Pack",
            "250.00"
          ],
          [
            "Lunch",
            "310.00"
          ],
          [
            "Lunch Pack",
            "275.00"
          ],
          [
            "Dinner (3-course)",
            "550.00"
          ]
        ]
      },
      {
        "title": "Guide Room",
        "rows": [
          [
            "Guide Room (only 1 guide per group)",
            "1,110.00"
          ]
        ]
      }
    ]
  },
  "the-rez": {
    "name": "The Rez",
    "commission": "15% STO",
    "currency": "N$",
    "validity": "2026",
    "note": "Net STO rates, incl. VAT & levy.",
    "sections": [
      {
        "title": "Luxury Rooms — B&amp;B",
        "rows": [
          [
            "Luxury Room — Single",
            "1,522.00"
          ],
          [
            "Luxury Room — Double (pp sharing)",
            "1,300.00"
          ]
        ]
      },
      {
        "title": "Deluxe Rooms — B&amp;B",
        "rows": [
          [
            "Deluxe Room — Single",
            "1,633.15"
          ],
          [
            "Deluxe Room — Double (pp sharing)",
            "1,452.30"
          ]
        ]
      },
      {
        "title": "Super Deluxe Rooms — B&amp;B",
        "rows": [
          [
            "Super Deluxe Room — Single",
            "1,987.80"
          ],
          [
            "Super Deluxe Room — Double (pp sharing)",
            "1,605.40"
          ]
        ]
      }
    ]
  },
  "tsauchab-river-camp": {
    "name": "Tsauchab River Camp",
    "commission": "20% STO",
    "currency": "N$",
    "validity": "2026",
    "note": "Net STO rates, incl. VAT & levy.",
    "sections": [
      {
        "title": "Chalet (DBB, per room per night)",
        "rows": [
          [
            "Chalet single",
            "2,400.00"
          ],
          [
            "Chalet double/twin",
            "4,000.00"
          ],
          [
            "Chalet 3-bed (max 2 adults)",
            "4,680.00"
          ],
          [
            "Chalet 4-bed (max 2 adults)",
            "5,360.00"
          ]
        ]
      },
      {
        "title": "Falcon View Suite — DBB (per room per night)",
        "rows": [
          [
            "Suite single",
            "6,000.00"
          ],
          [
            "Suite double/twin",
            "8,000.00"
          ]
        ]
      },
      {
        "title": "Tour Guides",
        "rows": [
          [
            "1st Tour Guide (min 8 guests)",
            "0.00"
          ],
          [
            "Additional Tour Guide / Driver",
            "1,600.00"
          ]
        ]
      },
      {
        "title": "Camping (self-catering, per site + per person)",
        "rows": [
          [
            "Campsite per night",
            "212.50"
          ],
          [
            "Per person per night",
            "195.50"
          ],
          [
            "Per child (5–11 yrs) per night",
            "110.50"
          ]
        ]
      },
      {
        "title": "Meals (per person — incl. VAT, rack)",
        "rows": [
          [
            "Breakfast",
            "330.00"
          ],
          [
            "Breakfast — child 5–11 yrs",
            "280.00"
          ],
          [
            "Lunch Pack",
            "300.00"
          ],
          [
            "Lunch",
            "350.00"
          ],
          [
            "Dinner",
            "450.00"
          ],
          [
            "Dinner — child 5–11 yrs",
            "370.00"
          ]
        ]
      }
    ]
  },
  "uis-elephant": {
    "name": "Uis Elephant Guesthouse",
    "commission": "20% STO",
    "currency": "N$",
    "validity": "2026",
    "note": "Net STO rates, incl. VAT & levy.",
    "sections": [
      {
        "title": "Bed &amp; Breakfast — Per Person Sharing",
        "rows": [
          [
            "Standard Room",
            "1,680.00"
          ],
          [
            "Luxury Room",
            "1,840.00"
          ],
          [
            "Suite",
            "2,040.00"
          ]
        ]
      },
      {
        "title": "Bed &amp; Breakfast — Per Single Room",
        "rows": [
          [
            "Standard Room",
            "2,120.00"
          ],
          [
            "Luxury Room",
            "2,280.00"
          ],
          [
            "Suite",
            "2,640.00"
          ]
        ]
      },
      {
        "title": "Bed &amp; Breakfast — Guides &amp; Children",
        "rows": [
          [
            "Guide / Pilot",
            "880.00"
          ],
          [
            "Children 7–12 yrs",
            "880.00"
          ],
          [
            "Children 0–6 yrs",
            "0.00"
          ]
        ]
      },
      {
        "title": "Dinner, Bed &amp; Breakfast — Per Person Sharing",
        "rows": [
          [
            "Standard Room",
            "2,160.00"
          ],
          [
            "Luxury Room",
            "2,320.00"
          ],
          [
            "Suite",
            "2,520.00"
          ]
        ]
      },
      {
        "title": "Dinner, Bed &amp; Breakfast — Per Single Room",
        "rows": [
          [
            "Standard Room",
            "2,600.00"
          ],
          [
            "Luxury Room",
            "2,760.00"
          ],
          [
            "Suite",
            "3,120.00"
          ]
        ]
      },
      {
        "title": "Sleep-Out Packages (min 4 pax — fully commissionable)",
        "rows": [
          [
            "Stand-alone Sleep-Out — pp",
            "4,200.00"
          ],
          [
            "Standard Room + Sleep-Out — pp",
            "6,850.00"
          ],
          [
            "Luxury Room + Sleep-Out — pp",
            "7,050.00"
          ],
          [
            "Suite + Sleep-Out — pp",
            "7,250.00"
          ]
        ]
      },
      {
        "title": "Brandberg Hiking Package (min 4 pax)",
        "rows": [
          [
            "Per person",
            "12,100.00"
          ],
          [
            "Guide rate (per guide)",
            "5,950.00"
          ]
        ]
      },
      {
        "title": "Activities (rack — fully commissionable)",
        "rows": [
          [
            "Full-day Brandberg Excursion (min 2 pax)",
            "2,000.00"
          ],
          [
            "Sundowner Drive (min 2 pax)",
            "1,100.00"
          ],
          [
            "AM/PM Elephant Drive (min 2 pax)",
            "1,350.00"
          ]
        ]
      }
    ]
  },
  "vingerklip-lodge": {
    "name": "Vingerklip Lodge",
    "commission": "15% STO",
    "currency": "N$",
    "validity": "2026",
    "note": "Net STO rates, incl. VAT & levy.",
    "sections": [
      {
        "title": "Rooms — DBB (per person)",
        "rows": [
          [
            "Double Room (pp sharing)",
            "2,065.50"
          ],
          [
            "Single Supplement",
            "1,045.50"
          ],
          [
            "Children 4–14 yrs",
            "1,266.50"
          ],
          [
            "Children 0–3 yrs",
            "0.00"
          ]
        ]
      },
      {
        "title": "Heaven&#x27;s Gate Suite — DBB (per person)",
        "rows": [
          [
            "Suite (pp sharing)",
            "3,077.00"
          ],
          [
            "Single Supplement",
            "1,513.00"
          ]
        ]
      },
      {
        "title": "Tour Guides (NET rates — non-commissionable)",
        "rows": [
          [
            "Group of up to 7 full-paying pax",
            "1,380.00"
          ],
          [
            "Group of 8 or more full-paying pax",
            "1,275.00"
          ],
          [
            "Each additional guide",
            "1,155.00"
          ]
        ]
      },
      {
        "title": "Separate Services (per person — non-commissionable)",
        "rows": [
          [
            "Eagles Nest Dinner (extra, on top)",
            "100.00"
          ],
          [
            "Lunch — Buffet",
            "280.00"
          ],
          [
            "Lunch — Set menu",
            "220.00"
          ],
          [
            "Light Lunches (range)",
            "220.00"
          ],
          [
            "Lunch Pack",
            "170.00"
          ],
          [
            "Dinner",
            "390.00"
          ],
          [
            "Breakfast",
            "220.00"
          ]
        ]
      }
    ]
  },
  "voigtland-guesthouse": {
    "name": "Guesthouse Voigtland",
    "commission": "20% STO",
    "currency": "N$",
    "validity": "2026",
    "note": "Net STO rates, incl. VAT & levy.",
    "sections": [
      {
        "title": "Explorer Package — Bed &amp; Breakfast (Agent STO)",
        "rows": [
          [
            "Per person sharing",
            "2,884.00"
          ],
          [
            "Single room",
            "3,259.00"
          ]
        ]
      },
      {
        "title": "Exclusive Package — DBB (Agent STO) — Best Seller",
        "rows": [
          [
            "Per person sharing",
            "3,580.00"
          ],
          [
            "Single room",
            "3,955.00"
          ]
        ]
      },
      {
        "title": "Superior Package — Full Board (Agent STO)",
        "rows": [
          [
            "Per person sharing",
            "3,877.00"
          ],
          [
            "Single room",
            "4,252.00"
          ]
        ]
      },
      {
        "title": "Building Blocks — Agent STO ~25% commission",
        "rows": [
          [
            "Bed Rate per person",
            "1,874.00"
          ],
          [
            "Bed Rate — single",
            "2,249.00"
          ],
          [
            "Tour Guide Room (single, accom only)",
            "1,874.00"
          ],
          [
            "Day Room — per person",
            "2,344.00"
          ]
        ]
      },
      {
        "title": "À la carte Extras (per person)",
        "rows": [
          [
            "Breakfast",
            "350.00"
          ],
          [
            "Lunch",
            "297.00"
          ],
          [
            "4-Course Dinner",
            "696.00"
          ],
          [
            "High Tea",
            "300.00"
          ],
          [
            "Giraffe Feeding",
            "360.00"
          ],
          [
            "Nature Drive incl. Sundowner Cocktail (2 hr)",
            "545.00"
          ],
          [
            "Laundry Service (per machine)",
            "230.00"
          ]
        ]
      },
      {
        "title": "Transfers (per person)",
        "rows": [
          [
            "Airport Transfer",
            "385.00"
          ],
          [
            "City Transfer",
            "460.00"
          ]
        ]
      }
    ]
  },
  "waterberg-wilderness": {
    "name": "Waterberg Wilderness Lodges",
    "commission": "20% STO",
    "currency": "N$",
    "validity": "2026",
    "note": "Net STO rates, incl. VAT & levy.",
    "sections": [
      {
        "title": "Waterberg Plateau Lodge — Rock Chalet (DBB pp)",
        "rows": [
          [
            "Per person DBB",
            "3,480.00"
          ]
        ]
      },
      {
        "title": "Waterberg Wilderness Lodge — Double / Family Unit (DBB pp)",
        "rows": [
          [
            "Per person DBB",
            "2,560.00"
          ]
        ]
      },
      {
        "title": "Waterberg Valley Lodge — Econo Chalet (DBB pp)",
        "rows": [
          [
            "Per person DBB",
            "1,800.00"
          ]
        ]
      },
      {
        "title": "Camping (per person, non-commissionable)",
        "rows": [
          [
            "Waterberg Plateau Campsite",
            "420.00"
          ],
          [
            "Waterberg Andersson Camp",
            "420.00"
          ]
        ]
      },
      {
        "title": "Experiences — 1 night stay (non-commissionable)",
        "rows": [
          [
            "Plateau hike (guided)",
            "420.00"
          ],
          [
            "Honeymoon Sundowner (guided)",
            "1,000.00"
          ],
          [
            "Rhino drive (guided)",
            "1,200.00"
          ],
          [
            "Rhino tracking (guided)",
            "1,100.00"
          ],
          [
            "Nature Trails (self-guided)",
            "0.00"
          ]
        ]
      },
      {
        "title": "Experiences — Stay-2-Experience (2+ nights, 25% off)",
        "rows": [
          [
            "Plateau hike",
            "315.00"
          ],
          [
            "Honeymoon Sundowner",
            "750.00"
          ],
          [
            "Rhino drive",
            "900.00"
          ],
          [
            "Rhino tracking",
            "825.00"
          ]
        ]
      }
    ]
  },
  "white-sands-caprivi": {
    "name": "White Sands Lodge",
    "commission": "Net STO",
    "currency": "N$",
    "validity": "2026",
    "note": "Net STO rates, incl. VAT & levy.",
    "sections": [
      {
        "title": "Game Drives (per person, min 2)",
        "rows": [
          [
            "Game Drive — Bwabwata NP (2.5–3 hr)",
            "950.00"
          ],
          [
            "Game Drive — Mahango NP (3.5–4 hr)",
            "1,150.00"
          ],
          [
            "VIP Game Drive — Bwabwata NP (5 hr)",
            "1,800.00"
          ],
          [
            "Full Day Game Drive — Mahango &amp; Bwabwata",
            "2,500.00"
          ],
          [
            "SAN Traditional Tour (1.5–2 hr)",
            "480.00"
          ]
        ]
      },
      {
        "title": "Sunset &amp; Fishing — N//Goabaca (per person, min 3)",
        "rows": [
          [
            "Sunset Cruise (1.5 hr)",
            "440.00"
          ],
          [
            "Fishing per hour — 1 to 3 pax (min 2 hr)",
            "935.00"
          ],
          [
            "Fishing — additional pax per hour",
            "240.00"
          ],
          [
            "Rent of fishing gear (4 hr)",
            "250.00"
          ]
        ]
      },
      {
        "title": "Private Boat Charters — Okavango Dreams (per person, min 4)",
        "rows": [
          [
            "Breakfast Cruise (1.5 hr)",
            "650.00"
          ],
          [
            "Breakfast Cruise — in-house guests",
            "420.00"
          ],
          [
            "Namibian Braai Cruise (4 hr, all drinks)",
            "1,699.00"
          ],
          [
            "Birding Cruise (3 hr, 2 drinks)",
            "880.00"
          ],
          [
            "Game Cruise (4 hr, 2 drinks)",
            "1,350.00"
          ],
          [
            "VIP Cruise (6 hr, all-inclusive)",
            "2,500.00"
          ]
        ]
      }
    ]
  }
};

/* -- O&L Collection ---------------------------------------------------------
   Contracted rates run 01.01.2026 to 30.06.2028, so 2026 and 2027 carry the
   same figures. Rack is the STO grossed up at the sheet's stated 20% commission
   (rack = STO / 0.8) -- what an agent must bill to net the STO back.
   -------------------------------------------------------------------------- */
Object.assign(DDS_STO_BY_YEAR, {
  "strand-hotel-swakopmund": {
    "2026": {
      "name": "Strand Hotel Swakopmund",
      "region": "Swakopmund",
      "currency": "N$",
      "validity": "01 Jan 2026 – 30 Jun 2028 (2026 and 2027 identical)",
      "note": "Net STO rates",
      "sections": [
        {
          "title": "DBL/Sharing BB",
          "rows": [
            [
              "Standard Rooms",
              "3,518"
            ],
            [
              "Standard Sea Facing",
              "3,758"
            ],
            [
              "Luxury Rooms",
              "4,222"
            ],
            [
              "Luxury Sea Facing",
              "4,462"
            ],
            [
              "Junior Suite",
              "4,573"
            ],
            [
              "Luxury Suite",
              "5,629"
            ],
            [
              "Presidential Suite",
              "8,794"
            ]
          ]
        },
        {
          "title": "Single BB",
          "rows": [
            [
              "Standard Rooms",
              "5,629"
            ],
            [
              "Standard Sea Facing",
              "6,013"
            ],
            [
              "Luxury Rooms",
              "6,754"
            ],
            [
              "Luxury Sea Facing",
              "7,138"
            ],
            [
              "Junior Suite",
              "7,317"
            ],
            [
              "Luxury Suite",
              "9,005"
            ],
            [
              "Presidential Suite",
              "14,071"
            ]
          ]
        },
        {
          "title": "1 Child 7–13 Yrs BB Sharing Adult",
          "rows": [
            [
              "Standard Rooms",
              "879"
            ],
            [
              "Standard Sea Facing",
              "939"
            ],
            [
              "Luxury Rooms",
              "1,055"
            ],
            [
              "Luxury Sea Facing",
              "1,115"
            ],
            [
              "Junior Suite",
              "1,143"
            ],
            [
              "Luxury Suite",
              "1,407"
            ]
          ]
        },
        {
          "title": "1 Child 7–13 Yrs BB Sgl Interleading",
          "rows": [
            [
              "Standard Rooms",
              "2,638"
            ],
            [
              "Standard Sea Facing",
              "2,818"
            ],
            [
              "Luxury Rooms",
              "3,166"
            ],
            [
              "Luxury Sea Facing",
              "3,346"
            ],
            [
              "Junior Suite",
              "3,430"
            ],
            [
              "Luxury Suite",
              "4,222"
            ]
          ]
        }
      ],
      "commission": "20% STO"
    },
    "2027": {
      "name": "Strand Hotel Swakopmund",
      "region": "Swakopmund",
      "currency": "N$",
      "validity": "01 Jan 2026 – 30 Jun 2028 (2026 and 2027 identical)",
      "note": "Net STO rates",
      "sections": [
        {
          "title": "DBL/Sharing BB",
          "rows": [
            [
              "Standard Rooms",
              "3,518"
            ],
            [
              "Standard Sea Facing",
              "3,758"
            ],
            [
              "Luxury Rooms",
              "4,222"
            ],
            [
              "Luxury Sea Facing",
              "4,462"
            ],
            [
              "Junior Suite",
              "4,573"
            ],
            [
              "Luxury Suite",
              "5,629"
            ],
            [
              "Presidential Suite",
              "8,794"
            ]
          ]
        },
        {
          "title": "Single BB",
          "rows": [
            [
              "Standard Rooms",
              "5,629"
            ],
            [
              "Standard Sea Facing",
              "6,013"
            ],
            [
              "Luxury Rooms",
              "6,754"
            ],
            [
              "Luxury Sea Facing",
              "7,138"
            ],
            [
              "Junior Suite",
              "7,317"
            ],
            [
              "Luxury Suite",
              "9,005"
            ],
            [
              "Presidential Suite",
              "14,071"
            ]
          ]
        },
        {
          "title": "1 Child 7–13 Yrs BB Sharing Adult",
          "rows": [
            [
              "Standard Rooms",
              "879"
            ],
            [
              "Standard Sea Facing",
              "939"
            ],
            [
              "Luxury Rooms",
              "1,055"
            ],
            [
              "Luxury Sea Facing",
              "1,115"
            ],
            [
              "Junior Suite",
              "1,143"
            ],
            [
              "Luxury Suite",
              "1,407"
            ]
          ]
        },
        {
          "title": "1 Child 7–13 Yrs BB Sgl Interleading",
          "rows": [
            [
              "Standard Rooms",
              "2,638"
            ],
            [
              "Standard Sea Facing",
              "2,818"
            ],
            [
              "Luxury Rooms",
              "3,166"
            ],
            [
              "Luxury Sea Facing",
              "3,346"
            ],
            [
              "Junior Suite",
              "3,430"
            ],
            [
              "Luxury Suite",
              "4,222"
            ]
          ]
        }
      ],
      "commission": "20% STO"
    }
  },
  "mokuti-etosha": {
    "2026": {
      "name": "Mokuti Etosha Lodge",
      "region": "East Etosha",
      "currency": "N$",
      "validity": "01 Jan 2026 – 30 Jun 2028 (2026 and 2027 identical)",
      "note": "Net STO rates",
      "sections": [
        {
          "title": "DBL/Sharing BB",
          "rows": [
            [
              "Standard Room",
              "3,518"
            ],
            [
              "Deluxe Room",
              "4,046"
            ],
            [
              "Junior Suite",
              "4,573"
            ],
            [
              "Presidential Suite",
              "8,794"
            ]
          ]
        },
        {
          "title": "DBL/Sharing DBB",
          "rows": [
            [
              "Standard Room",
              "3,946"
            ],
            [
              "Deluxe Room",
              "4,474"
            ],
            [
              "Junior Suite",
              "5,001"
            ],
            [
              "Presidential Suite",
              "9,222"
            ]
          ]
        },
        {
          "title": "Single BB",
          "rows": [
            [
              "Standard Room",
              "5,629"
            ],
            [
              "Deluxe Room",
              "6,473"
            ],
            [
              "Junior Suite",
              "7,317"
            ],
            [
              "Presidential Suite",
              "14,071"
            ]
          ]
        },
        {
          "title": "Single DBB",
          "rows": [
            [
              "Standard Room",
              "6,057"
            ],
            [
              "Deluxe Room",
              "6,901"
            ],
            [
              "Junior Suite",
              "7,745"
            ],
            [
              "Presidential Suite",
              "14,499"
            ]
          ]
        },
        {
          "title": "1 Child 7–13 BB",
          "rows": [
            [
              "Standard Room",
              "879"
            ],
            [
              "Deluxe Room",
              "1,011"
            ],
            [
              "Junior Suite",
              "1,143"
            ],
            [
              "Presidential Suite",
              "2,199"
            ]
          ]
        },
        {
          "title": "1 Child 7–13 DBB",
          "rows": [
            [
              "Standard Room",
              "986"
            ],
            [
              "Deluxe Room",
              "1,118"
            ],
            [
              "Junior Suite",
              "1,250"
            ],
            [
              "Presidential Suite",
              "2,306"
            ]
          ]
        }
      ],
      "commission": "20% STO"
    },
    "2027": {
      "name": "Mokuti Etosha Lodge",
      "region": "East Etosha",
      "currency": "N$",
      "validity": "01 Jan 2026 – 30 Jun 2028 (2026 and 2027 identical)",
      "note": "Net STO rates",
      "sections": [
        {
          "title": "DBL/Sharing BB",
          "rows": [
            [
              "Standard Room",
              "3,518"
            ],
            [
              "Deluxe Room",
              "4,046"
            ],
            [
              "Junior Suite",
              "4,573"
            ],
            [
              "Presidential Suite",
              "8,794"
            ]
          ]
        },
        {
          "title": "DBL/Sharing DBB",
          "rows": [
            [
              "Standard Room",
              "3,946"
            ],
            [
              "Deluxe Room",
              "4,474"
            ],
            [
              "Junior Suite",
              "5,001"
            ],
            [
              "Presidential Suite",
              "9,222"
            ]
          ]
        },
        {
          "title": "Single BB",
          "rows": [
            [
              "Standard Room",
              "5,629"
            ],
            [
              "Deluxe Room",
              "6,473"
            ],
            [
              "Junior Suite",
              "7,317"
            ],
            [
              "Presidential Suite",
              "14,071"
            ]
          ]
        },
        {
          "title": "Single DBB",
          "rows": [
            [
              "Standard Room",
              "6,057"
            ],
            [
              "Deluxe Room",
              "6,901"
            ],
            [
              "Junior Suite",
              "7,745"
            ],
            [
              "Presidential Suite",
              "14,499"
            ]
          ]
        },
        {
          "title": "1 Child 7–13 BB",
          "rows": [
            [
              "Standard Room",
              "879"
            ],
            [
              "Deluxe Room",
              "1,011"
            ],
            [
              "Junior Suite",
              "1,143"
            ],
            [
              "Presidential Suite",
              "2,199"
            ]
          ]
        },
        {
          "title": "1 Child 7–13 DBB",
          "rows": [
            [
              "Standard Room",
              "986"
            ],
            [
              "Deluxe Room",
              "1,118"
            ],
            [
              "Junior Suite",
              "1,250"
            ],
            [
              "Presidential Suite",
              "2,306"
            ]
          ]
        }
      ],
      "commission": "20% STO"
    }
  },
  "midgard-otjihavera-windhoek": {
    "2026": {
      "name": "Midgard Otjihavera Windhoek",
      "region": "Windhoek",
      "currency": "N$",
      "validity": "01 Jan 2026 – 30 Jun 2028 (2026 and 2027 identical)",
      "note": "Net STO rates",
      "sections": [
        {
          "title": "DBL/Sharing BB",
          "rows": [
            [
              "Standard Room",
              "2,472"
            ],
            [
              "Family Room",
              "3,214"
            ],
            [
              "Junior Suite",
              "3,804"
            ],
            [
              "Presidential Suite",
              "4,708"
            ]
          ]
        },
        {
          "title": "DBL/Sharing DBB",
          "rows": [
            [
              "Standard Room",
              "3,086"
            ],
            [
              "Family Room",
              "3,902"
            ],
            [
              "Junior Suite",
              "4,551"
            ],
            [
              "Presidential Suite",
              "5,546"
            ]
          ]
        },
        {
          "title": "Single BB",
          "rows": [
            [
              "Standard Room",
              "3,956"
            ],
            [
              "Family Room",
              "5,142"
            ],
            [
              "Junior Suite",
              "6,086"
            ],
            [
              "Presidential Suite",
              "7,533"
            ]
          ]
        },
        {
          "title": "Single DBB",
          "rows": [
            [
              "Standard Room",
              "4,718"
            ],
            [
              "Family Room",
              "6,023"
            ],
            [
              "Junior Suite",
              "7,062"
            ],
            [
              "Presidential Suite",
              "8,653"
            ]
          ]
        },
        {
          "title": "1 Child 7–13 BB",
          "rows": [
            [
              "Standard Room",
              "618"
            ],
            [
              "Family Room",
              "804"
            ],
            [
              "Junior Suite",
              "951"
            ],
            [
              "Presidential Suite",
              "1,177"
            ]
          ]
        },
        {
          "title": "1 Child 7–13 DBB",
          "rows": [
            [
              "Standard Room",
              "771"
            ],
            [
              "Family Room",
              "976"
            ],
            [
              "Junior Suite",
              "1,138"
            ],
            [
              "Presidential Suite",
              "1,386"
            ]
          ]
        }
      ],
      "commission": "20% STO"
    },
    "2027": {
      "name": "Midgard Otjihavera Windhoek",
      "region": "Windhoek",
      "currency": "N$",
      "validity": "01 Jan 2026 – 30 Jun 2028 (2026 and 2027 identical)",
      "note": "Net STO rates",
      "sections": [
        {
          "title": "DBL/Sharing BB",
          "rows": [
            [
              "Standard Room",
              "2,472"
            ],
            [
              "Family Room",
              "3,214"
            ],
            [
              "Junior Suite",
              "3,804"
            ],
            [
              "Presidential Suite",
              "4,708"
            ]
          ]
        },
        {
          "title": "DBL/Sharing DBB",
          "rows": [
            [
              "Standard Room",
              "3,086"
            ],
            [
              "Family Room",
              "3,902"
            ],
            [
              "Junior Suite",
              "4,551"
            ],
            [
              "Presidential Suite",
              "5,546"
            ]
          ]
        },
        {
          "title": "Single BB",
          "rows": [
            [
              "Standard Room",
              "3,956"
            ],
            [
              "Family Room",
              "5,142"
            ],
            [
              "Junior Suite",
              "6,086"
            ],
            [
              "Presidential Suite",
              "7,533"
            ]
          ]
        },
        {
          "title": "Single DBB",
          "rows": [
            [
              "Standard Room",
              "4,718"
            ],
            [
              "Family Room",
              "6,023"
            ],
            [
              "Junior Suite",
              "7,062"
            ],
            [
              "Presidential Suite",
              "8,653"
            ]
          ]
        },
        {
          "title": "1 Child 7–13 BB",
          "rows": [
            [
              "Standard Room",
              "618"
            ],
            [
              "Family Room",
              "804"
            ],
            [
              "Junior Suite",
              "951"
            ],
            [
              "Presidential Suite",
              "1,177"
            ]
          ]
        },
        {
          "title": "1 Child 7–13 DBB",
          "rows": [
            [
              "Standard Room",
              "771"
            ],
            [
              "Family Room",
              "976"
            ],
            [
              "Junior Suite",
              "1,138"
            ],
            [
              "Presidential Suite",
              "1,386"
            ]
          ]
        }
      ],
      "commission": "20% STO"
    }
  },
  "chobe-water-villas-zambezi": {
    "2026": {
      "name": "Chobe Water Villas Zambezi",
      "region": "Zambezi & Caprivi",
      "currency": "N$",
      "validity": "01 Jan 2026 – 30 Jun 2028 (2026 and 2027 identical)",
      "note": "Net STO rates",
      "sections": [
        {
          "title": "DBL/Sharing",
          "rows": [
            [
              "Full Inclusive",
              "17,644"
            ],
            [
              "Bed & Breakfast",
              "7,378"
            ],
            [
              "Dinner, Bed & Breakfast",
              "7,940"
            ]
          ]
        },
        {
          "title": "Single",
          "rows": [
            [
              "Full Inclusive",
              "28,230"
            ],
            [
              "Bed & Breakfast",
              "11,068"
            ],
            [
              "Dinner, Bed & Breakfast",
              "11,629"
            ]
          ]
        },
        {
          "title": "1 Child 13–17 Yrs Sharing Adult",
          "rows": [
            [
              "Full Inclusive",
              "13,233"
            ],
            [
              "Bed & Breakfast",
              "5,534"
            ],
            [
              "Dinner, Bed & Breakfast",
              "5,955"
            ]
          ]
        }
      ],
      "commission": "20% STO"
    },
    "2027": {
      "name": "Chobe Water Villas Zambezi",
      "region": "Zambezi & Caprivi",
      "currency": "N$",
      "validity": "01 Jan 2026 – 30 Jun 2028 (2026 and 2027 identical)",
      "note": "Net STO rates",
      "sections": [
        {
          "title": "DBL/Sharing",
          "rows": [
            [
              "Full Inclusive",
              "17,644"
            ],
            [
              "Bed & Breakfast",
              "7,378"
            ],
            [
              "Dinner, Bed & Breakfast",
              "7,940"
            ]
          ]
        },
        {
          "title": "Single",
          "rows": [
            [
              "Full Inclusive",
              "28,230"
            ],
            [
              "Bed & Breakfast",
              "11,068"
            ],
            [
              "Dinner, Bed & Breakfast",
              "11,629"
            ]
          ]
        },
        {
          "title": "1 Child 13–17 Yrs Sharing Adult",
          "rows": [
            [
              "Full Inclusive",
              "13,233"
            ],
            [
              "Bed & Breakfast",
              "5,534"
            ],
            [
              "Dinner, Bed & Breakfast",
              "5,955"
            ]
          ]
        }
      ],
      "commission": "20% STO"
    }
  },
  "divava-okavango": {
    "2026": {
      "name": "Divava Okavango",
      "region": "Zambezi & Caprivi",
      "currency": "N$",
      "validity": "01 Jan 2026 – 30 Jun 2028 (2026 and 2027 identical)",
      "note": "Net STO rates",
      "sections": [
        {
          "title": "Low Season — 01.01.26 to 30.06.2026 · DBL/Sharing DBB",
          "rows": [
            [
              "Luxury Chalets",
              "3,312"
            ]
          ]
        },
        {
          "title": "Low Season — 01.01.26 to 30.06.2026 · Single DBB",
          "rows": [
            [
              "Luxury Chalets",
              "4,424"
            ]
          ]
        },
        {
          "title": "Low Season — 01.01.26 to 30.06.2026 · 1 Child 6–12 Yrs DBB Sharing Adult",
          "rows": [
            [
              "Luxury Chalets",
              "828"
            ]
          ]
        },
        {
          "title": "High Season — 01.07.26 to 30.11.2026 · DBL/Sharing DBB",
          "rows": [
            [
              "Luxury Chalets",
              "4,044"
            ]
          ]
        },
        {
          "title": "High Season — 01.07.26 to 30.11.2026 · Single DBB",
          "rows": [
            [
              "Luxury Chalets",
              "5,280"
            ]
          ]
        },
        {
          "title": "High Season — 01.07.26 to 30.11.2026 · 1 Child 6–12 Yrs DBB Sharing Adult",
          "rows": [
            [
              "Luxury Chalets",
              "1,011"
            ]
          ]
        }
      ],
      "commission": "20% STO"
    },
    "2027": {
      "name": "Divava Okavango",
      "region": "Zambezi & Caprivi",
      "currency": "N$",
      "validity": "01 Jan 2026 – 30 Jun 2028 (2026 and 2027 identical)",
      "note": "Net STO rates",
      "sections": [
        {
          "title": "Low Season — 01.01.26 to 30.06.2026 · DBL/Sharing DBB",
          "rows": [
            [
              "Luxury Chalets",
              "3,312"
            ]
          ]
        },
        {
          "title": "Low Season — 01.01.26 to 30.06.2026 · Single DBB",
          "rows": [
            [
              "Luxury Chalets",
              "4,424"
            ]
          ]
        },
        {
          "title": "Low Season — 01.01.26 to 30.06.2026 · 1 Child 6–12 Yrs DBB Sharing Adult",
          "rows": [
            [
              "Luxury Chalets",
              "828"
            ]
          ]
        },
        {
          "title": "High Season — 01.07.26 to 30.11.2026 · DBL/Sharing DBB",
          "rows": [
            [
              "Luxury Chalets",
              "4,044"
            ]
          ]
        },
        {
          "title": "High Season — 01.07.26 to 30.11.2026 · Single DBB",
          "rows": [
            [
              "Luxury Chalets",
              "5,280"
            ]
          ]
        },
        {
          "title": "High Season — 01.07.26 to 30.11.2026 · 1 Child 6–12 Yrs DBB Sharing Adult",
          "rows": [
            [
              "Luxury Chalets",
              "1,011"
            ]
          ]
        }
      ],
      "commission": "20% STO"
    }
  },
  "le-mirage-sossusvlei": {
    "2026": {
      "name": "Le Mirage Sossusvlei",
      "region": "Sossusvlei & Namib",
      "currency": "N$",
      "validity": "01 Jan 2026 – 30 Jun 2028 (2026 and 2027 identical)",
      "note": "Net STO rates",
      "sections": [
        {
          "title": "Low Season — 01.01.26 to 30.06.2026 · DBL/Sharing DBB",
          "rows": [
            [
              "Camelthorn Room",
              "3,096"
            ],
            [
              "Oasis Room",
              "3,420"
            ]
          ]
        },
        {
          "title": "Low Season — 01.01.26 to 30.06.2026 · Single DBB",
          "rows": [
            [
              "Camelthorn Room",
              "4,136"
            ],
            [
              "Oasis Room",
              "4,561"
            ]
          ]
        },
        {
          "title": "Low Season — 01.01.26 to 30.06.2026 · 1 Child 13–17 Yrs Sharing Adult",
          "rows": [
            [
              "Camelthorn Room",
              "774"
            ],
            [
              "Oasis Room",
              "855"
            ]
          ]
        },
        {
          "title": "High Season — 01.07.26 to 30.11.2026 · DBL/Sharing DBB",
          "rows": [
            [
              "Camelthorn Room",
              "3,792"
            ],
            [
              "Oasis Room",
              "4,200"
            ]
          ]
        },
        {
          "title": "High Season — 01.07.26 to 30.11.2026 · Single DBB",
          "rows": [
            [
              "Camelthorn Room",
              "5,012"
            ],
            [
              "Oasis Room",
              "5,540"
            ]
          ]
        },
        {
          "title": "High Season — 01.07.26 to 30.11.2026 · 1 Child 13–17 Yrs Sharing Adult",
          "rows": [
            [
              "Camelthorn Room",
              "948"
            ],
            [
              "Oasis Room",
              "1,050"
            ]
          ]
        }
      ],
      "commission": "20% STO"
    },
    "2027": {
      "name": "Le Mirage Sossusvlei",
      "region": "Sossusvlei & Namib",
      "currency": "N$",
      "validity": "01 Jan 2026 – 30 Jun 2028 (2026 and 2027 identical)",
      "note": "Net STO rates",
      "sections": [
        {
          "title": "Low Season — 01.01.26 to 30.06.2026 · DBL/Sharing DBB",
          "rows": [
            [
              "Camelthorn Room",
              "3,096"
            ],
            [
              "Oasis Room",
              "3,420"
            ]
          ]
        },
        {
          "title": "Low Season — 01.01.26 to 30.06.2026 · Single DBB",
          "rows": [
            [
              "Camelthorn Room",
              "4,136"
            ],
            [
              "Oasis Room",
              "4,561"
            ]
          ]
        },
        {
          "title": "Low Season — 01.01.26 to 30.06.2026 · 1 Child 13–17 Yrs Sharing Adult",
          "rows": [
            [
              "Camelthorn Room",
              "774"
            ],
            [
              "Oasis Room",
              "855"
            ]
          ]
        },
        {
          "title": "High Season — 01.07.26 to 30.11.2026 · DBL/Sharing DBB",
          "rows": [
            [
              "Camelthorn Room",
              "3,792"
            ],
            [
              "Oasis Room",
              "4,200"
            ]
          ]
        },
        {
          "title": "High Season — 01.07.26 to 30.11.2026 · Single DBB",
          "rows": [
            [
              "Camelthorn Room",
              "5,012"
            ],
            [
              "Oasis Room",
              "5,540"
            ]
          ]
        },
        {
          "title": "High Season — 01.07.26 to 30.11.2026 · 1 Child 13–17 Yrs Sharing Adult",
          "rows": [
            [
              "Camelthorn Room",
              "948"
            ],
            [
              "Oasis Room",
              "1,050"
            ]
          ]
        }
      ],
      "commission": "20% STO"
    }
  }
});

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body || {};
  const token = String(body.token || '');
  const user = String(body.username || '').trim().toLowerCase();
  const pass = String(body.password || '');
  const lodge = String(body.lodge || '').trim();

  // Primary login: Vercel env vars take precedence; default is the
  // Desert Tracks credential dt / dt (username & password, not case-sensitive).
  const VALID_USER = (process.env.AGENT_USER || 'dt').trim().toLowerCase();
  const VALID_PASS = process.env.AGENT_PASS || 'dt';

  // Additional always-accepted logins. This guarantees dt / dt works even if
  // env vars are set to something else. Each issues the same session token.
  const EXTRA_LOGINS = [
    { user: 'dt', pass: 'dt' },
  ];

  const validToken = sessionToken(VALID_PASS);

  // ── PASSWORD PROTECTION ENABLED ──────────────────────────────────────────
  // Sign-in requires a valid credential (dt / dt) or an existing session token.
  const authedByToken = token && token === validToken;
  const passLc = pass.toLowerCase();
  const authedByCreds =
    (user && user === VALID_USER && passLc === VALID_PASS.toLowerCase()) ||
    EXTRA_LOGINS.some(function (c) { return user === c.user && passLc === c.pass; });
  if (!authedByToken && !authedByCreds) {
    return res.status(401).json({ error: 'Invalid agent credentials.' });
  }

  // Always hand back the session token so the browser can stay signed in.
  const out = { ok: true, token: validToken };

  // coverage:1 -> per-slug STO coverage (which years each slug holds), merged
  // across inline data + Redis. Auth already passed above, so this owner/agent
  // tool sees YEARS ONLY — never the rate numbers themselves. Lets the
  // rate-progress tracker derive coverage live instead of storing a stale file.
  if (body.coverage) {
    const cov = {};
    const add = function (slug, y, legacy, meta) {
      const e = cov[slug] || (cov[slug] = { years: [], undated: false, legacy: false, name: '', region: '' });
      if (y === 'undated') { e.undated = true; e.legacy = true; }
      else if (e.years.indexOf(y) === -1) e.years.push(y);
      if (legacy) e.legacy = true;
      if (meta) { if (!e.name && meta.name) e.name = meta.name; if (!e.region && meta.region) e.region = meta.region; }
    };
    for (const s of Object.keys(DDS_STO_BY_YEAR)) {
      for (const y of Object.keys(DDS_STO_BY_YEAR[s])) add(s, y, false, DDS_STO_BY_YEAR[s][y]);
    }
    for (const s of Object.keys(STO_DB)) {
      const d = STO_DB[s]; add(s, seasonYear(d && d.validity) || 'undated', true, d);
    }
    if (db.dbConfigured()) {
      try {
        for (const s of await db.listSlugs()) {
          const ys = await db.listYears('sto', s);
          if (ys && ys.length) { for (const y of ys) add(s, String(y), false, (await db.getRates('sto', s, y)) || {}); }
          else { const lg = await db.getRates('sto', s); if (lg) add(s, seasonYear(lg.validity) || 'undated', true, lg); }
        }
      } catch (e) {}
    }
    // Legacy sheet rates count as coverage too, but only where nothing live
    // exists for that slug — so the tracker never double-counts a live lodge.
    for (const s of Object.keys(SHEET_STO_BY_YEAR)) {
      if (cov[s]) continue;
      for (const y of Object.keys(SHEET_STO_BY_YEAR[s])) add(s, y, false, SHEET_STO_BY_YEAR[s][y]);
    }
    for (const s of Object.keys(LEGACY_STO_BY_YEAR)) {
      if (cov[s]) continue;
      // legacy=false: these carry an explicit 2027 season, so the tracker must
      // not flag them as "undated sheet — tag its year".
      for (const y of Object.keys(LEGACY_STO_BY_YEAR[s])) add(s, y, false, LEGACY_STO_BY_YEAR[s][y]);
    }
    for (const s of Object.keys(cov)) cov[s].years.sort();
    out.coverage = cov;
    return res.status(200).json(out);
  }

  // all:1 -> every lodge's live NET STO rates, flattened per year, for the
  // itinerary builder. Auth already passed (the builder is agent-only). Mirrors
  // GET /api/rack's all-lodges shape so the builder can overlay live net rates
  // exactly the way it already overlays live rack. Merges inline data + Redis:
  //   rates       = 2026 / default-year rates
  //   rates_2027  = 2027 rates, EMPTY when the API has no 2027 for that lodge
  // (an empty rates_2027 is what stops the builder quoting a 2027 rate the live
  // site itself doesn't yet have).
  if (body.all) {
    async function resolveStoYear(slug, year) {
      if (db.dbConfigured()) { try { const r = await db.getRates('sto', slug, year); if (r) return r; } catch (e) {} }
      if (DDS_STO_BY_YEAR[slug] && DDS_STO_BY_YEAR[slug][year]) return DDS_STO_BY_YEAR[slug][year];
      let legacy = STO_DB[slug];
      if (db.dbConfigured()) { try { const rl = await db.getRates('sto', slug); if (rl) legacy = rl; } catch (e) {} }
      if (legacy && seasonYear(legacy.validity) === year) return legacy;
      // Last resort: supplier-sheet rates, only for lodges with nothing live.
      if (!STO_DB[slug] && !DDS_STO_BY_YEAR[slug] && LEGACY_STO_BY_YEAR[slug] && LEGACY_STO_BY_YEAR[slug][year]) {
        return LEGACY_STO_BY_YEAR[slug][year];
      }
      if (!STO_DB[slug] && !DDS_STO_BY_YEAR[slug] && !LEGACY_STO_BY_YEAR[slug] && SHEET_STO_BY_YEAR[slug] && SHEET_STO_BY_YEAR[slug][year]) {
        return SHEET_STO_BY_YEAR[slug][year];
      }
      return null;
    }
    const slugs = new Set([...Object.keys(STO_DB), ...Object.keys(DDS_STO_BY_YEAR), ...Object.keys(LEGACY_STO_BY_YEAR), ...Object.keys(SHEET_STO_BY_YEAR)]);
    if (db.dbConfigured()) { try { (await db.listSlugs()).forEach(function (s) { slugs.add(s); }); } catch (e) {} }
    const lodges = {};
    for (const slug of slugs) {
      const d26 = await resolveStoYear(slug, '2026');
      const d27 = await resolveStoYear(slug, '2027');
      if (!d26 && !d27) continue;
      const meta = d26 || d27 || {};
      lodges[slug] = {
        name: meta.name || '',
        region: meta.region || '',
        rates: d26 ? flattenSto(d26) : [],
        rates_2027: d27 ? flattenSto(d27) : [],
      };
    }
    out.lodges = lodges;
    return res.status(200).json(out);
  }

  // If a lodge was requested and we hold inline net rates for it, include them.
  // Many lodges keep their net rates in a separate STO sheet instead of here,
  // so a lodge that isn't in STO_DB is normal and must NEVER block a valid
  // login. In that case we simply return the session token without rates; the
  // lodge page then sends the signed-in agent straight to its bookable STO
  // sheet.
  if (lodge) {
    // Owner-entered net rates (Redis) take precedence; the inline STO_DB below
    // is the fallback for lodges not yet managed in the owner area. If the DB
    // is unreachable we silently fall back so a valid login is never blocked.
    const yearReq = body.year ? String(body.year) : '';
    let data = null, years = [], year = null;
    if (DDS_STO_BY_YEAR[lodge]) {
      // Multi-year inline lodge: serve the requested year (default earliest)
      // and advertise every year held so the page renders a year switcher.
      // Ask for a season and you get that season or nothing. Serving another
      // year's net rates under the season the agent picked is how a wrong price
      // reaches a client, so we would rather hand back a blank.
      years = Object.keys(DDS_STO_BY_YEAR[lodge]).sort();
      if (yearReq) {
        data = DDS_STO_BY_YEAR[lodge][yearReq] || null;
        year = data ? yearReq : null;
      } else {
        year = years[0];
        data = DDS_STO_BY_YEAR[lodge][year];
      }
    } else if (STO_DB[lodge] && !yearReq) {
      // Inline STO data is pushed manually and is the source of truth, so use
      // it directly and skip the Redis round-trip (~500ms saved per call).
      data = STO_DB[lodge];
    } else {
      try {
        const resolved = await db.getResolved('sto', lodge, yearReq || undefined);
        data = resolved.doc; years = resolved.years || []; year = resolved.year;
      } catch (e) {
        data = null;
      }
      // The inline sheet doc is undated, so only use it when no season was
      // asked for, or when the season it carries is the one asked for.
      if (!data && STO_DB[lodge]) {
        const sy = seasonYear(STO_DB[lodge].validity);
        if (!yearReq || sy === yearReq) { data = STO_DB[lodge]; years = []; year = sy || null; }
      }
      // Last resort: a rate recovered from the supplier's own sheet. Only
      // reached when neither the owner area nor the inline maps hold anything
      // for this lodge, so it can never override a live rate.
      if (!data && LEGACY_STO_BY_YEAR[lodge]) {
        const lys = Object.keys(LEGACY_STO_BY_YEAR[lodge]).sort();
        const ly = yearReq ? (LEGACY_STO_BY_YEAR[lodge][yearReq] ? yearReq : '') : lys[0];
        data = ly ? LEGACY_STO_BY_YEAR[lodge][ly] : null; years = lys; year = ly || null;
      }
      if (!data && SHEET_STO_BY_YEAR[lodge]) {
        const hys = Object.keys(SHEET_STO_BY_YEAR[lodge]).sort();
        const hy = yearReq ? (SHEET_STO_BY_YEAR[lodge][yearReq] ? yearReq : '') : hys[0];
        data = hy ? SHEET_STO_BY_YEAR[lodge][hy] : null; years = hys; year = hy || null;
      }
    }
    if (data) {
      out.lodge = lodge;
      out.rates = data;
      out.years = years;   // e.g. ["2026","2027"] when more than one STO year exists
      out.year = year;     // the year these rates are for (null = undated)
    }
  }

  return res.status(200).json(out);
};

// ---------------------------------------------------------------------------
// Solitaire General Dealer (Pty) Ltd — Solitaire Mountain Lodge & Solitaire
// Roadhouse. 2027 STO 20% rates, B&B, N$. Supplier published its own rack
// alongside the STO, so rack is taken from the sheet (see api/rack.js) rather
// than derived. 2026 not supplied — chase Solitaire reservations.
// ---------------------------------------------------------------------------
Object.assign(DDS_STO_BY_YEAR, {
  "solitaire-mountain-lodge": {
    "2027": {
      "name": "Solitaire Mountain Lodge",
      "region": "Sossusvlei",
      "currency": "N$",
      "validity": "2027 · single season, no high/low split",
      "note": "STO 20% nett rates, N$, bed & breakfast. Rates exclude dinner, alcohol and activities, and are rounded down to the lowest N$10. Non-commissionable extras: buffet dinner N$400 per person, lunch packs N$300 per person (group lunches must be pre-booked at lunchbooking@solitairenamibia.com). Children 0–4 sharing with parents free of charge, 5–12 half price, 13 and over full price; extra beds and cots available. Guide policy: groups under 10 pax, 1 guide free of charge B&B and additional guides or drivers at N$720 per person; groups over 10 pax, 2 guides or drivers free of charge B&B.",
      "sections": [
        {
          "title": "2027 — bed & breakfast",
          "rows": [
            ["Single room (1 person)", "1,600"],
            ["Double room (per person sharing)", "1,480"],
            ["Family room (3 adults, see child policy)", "3,800"],
            ["Guide room", "720"]
          ]
        }
      ]
    }
  },
  "solitaire-roadhouse": {
    "2027": {
      "name": "Solitaire Roadhouse",
      "region": "Sossusvlei",
      "currency": "N$",
      "validity": "2027 · single season, no high/low split",
      "note": "STO 20% nett rates, N$, bed & breakfast. Rates exclude dinner, alcohol and activities, and are rounded down to the lowest N$10. Non-commissionable extras: buffet dinner N$400 per person, lunch packs N$300 per person (group lunches must be pre-booked at lunchbooking@solitairenamibia.com). Children 0–4 sharing with parents free of charge, 5–12 half price, 13 and over full price; extra beds and cots available. Guide policy: groups under 10 pax, 1 guide free of charge B&B and additional guides or drivers at N$720 per person; groups over 10 pax, 2 guides or drivers free of charge B&B.",
      "sections": [
        {
          "title": "2027 — bed & breakfast",
          "rows": [
            ["Single room (1 person)", "1,520"],
            ["Double room (per person sharing)", "1,360"],
            ["Family room (3 adults, see child policy)", "3,640"],
            ["Guide room", "720"]
          ]
        }
      ]
    }
  }
});

// ---------------------------------------------------------------------------
// Cresta Sprayview Hotel, Victoria Falls (Zimbabwe) — 2027 tour operator rates.
// Supplier publishes both RACK and STO on the same agreement, so rack is taken
// from the sheet (api/rack.js) and NOT derived. STO is nett and
// non-commissionable. RATES ONLY BECOME VALID ONCE THE SIGNED AGREEMENT IS
// RETURNED TO CRESTA — see the Sign contract folder.
// ---------------------------------------------------------------------------
Object.assign(DDS_STO_BY_YEAR, {
  "cresta-sprayview": {
    "2027": {
      "name": "Cresta Sprayview Hotel",
      "region": "Victoria Falls",
      "currency": "US$",
      "validity": "2027 · Green 1 Jan – 30 Jun / High 1 Jul – 31 Dec",
      "note": "Nett, non-commissionable tour operator rates in US$, per person per night, inclusive of VAT and the Government Tourism levy. Excludes all local and international transfers, beverages, laundry, telephone and personal charges. Children 12 and under (maximum 2 per room) are charged 50% of the adult rate on bed & breakfast when sharing with 2 adults in a family or interleading room; children in their own room pay the full adult rate. Meals: ages 0–2 no charge, ages 3–12 50% of the applicable rate per meal per day. Group rooming lists required 30 days prior to arrival. Rooms held until 18:00 on the arrival date; check-in 14:00, check-out 10:00. Rates become valid only once the signed agreement is returned to Cresta.",
      "sections": [
        {
          "title": "Green season (1 Jan – 30 Jun 2027) — bed & breakfast",
          "rows": [
            ["Standard room — per person sharing", "147"],
            ["Standard room — single", "176"],
            ["Executive — per person sharing", "169"],
            ["Executive — single", "202"]
          ]
        },
        {
          "title": "Green season (1 Jan – 30 Jun 2027) — half board",
          "rows": [
            ["Standard room — per person sharing", "175"],
            ["Standard room — single", "210"],
            ["Executive — per person sharing", "197"],
            ["Executive — single", "236"]
          ]
        },
        {
          "title": "Green season (1 Jan – 30 Jun 2027) — full board",
          "rows": [
            ["Standard room — per person sharing", "199"],
            ["Standard room — single", "238"],
            ["Executive — per person sharing", "221"],
            ["Executive — single", "265"]
          ]
        },
        {
          "title": "High season (1 Jul – 31 Dec 2027) — bed & breakfast",
          "rows": [
            ["Standard room — per person sharing", "176"],
            ["Standard room — single", "211"],
            ["Executive — per person sharing", "202"],
            ["Executive — single", "242"]
          ]
        },
        {
          "title": "High season (1 Jul – 31 Dec 2027) — half board",
          "rows": [
            ["Standard room — per person sharing", "204"],
            ["Standard room — single", "244"],
            ["Executive — per person sharing", "230"],
            ["Executive — single", "276"]
          ]
        },
        {
          "title": "High season (1 Jul – 31 Dec 2027) — full board",
          "rows": [
            ["Standard room — per person sharing", "228"],
            ["Standard room — single", "273"],
            ["Executive — per person sharing", "254"],
            ["Executive — single", "304"]
          ]
        }
      ]
    }
  }
});

// ---------------------------------------------------------------------------
// Thebe River Safaris, Kasane (Chobe) — 2026 and 2027.
// NOTE: quoted in BOTSWANA PULA, not US$ — this is the supplier's own currency
// on both the rack and STO sheets. Rack is the supplier's published sheet, not
// derived. STO is a consistent 20% off rack across every line.
// ---------------------------------------------------------------------------
Object.assign(DDS_STO_BY_YEAR, {
  "thebe-river-safaris": {
    "2026": {
      "name": "Thebe River Safaris",
      "region": "Chobe",
      "currency": "BWP",
      "validity": "2026 · single season, 1 Jan – 31 Dec 2026",
      "note": "Net 20% STO rates, BWP. Rates are quoted in Botswana Pula (BWP) per person per night as supplied by Thebe — this supplier does not quote in US$. All rates exclude Government park fees; the Government bed levy and park fees may change without notice. Child policy: children under 6 sharing with 2 adults free of charge; 6–12 sharing with 2 adults pay 50% of the adult rate; 12 and over count as an adult if using their own room. One child sharing per room; child and third-person sharing subject to availability. Guide policy: one room free of charge per accommodated group booking for crew or translator, subject to availability at check-in and not confirmable at booking or rooming-list stage — a guaranteed crew room is charged at the STO rate, as are additional crew rooms. Crew free of charge on camping group bookings; crew pay park fees only for activities. Activities are not private, seats may be shared with other hotel guests, and require a minimum of four persons per departure. Packages exclude park fees, visas, transfers and drinks. The three-night package includes a guided day trip to Victoria Falls (Zimbabwe) with transfer, lunch and craft market visit, excluding park fees and visa. A signed STO agreement must be returned to reservations@theberiversafaris.com.",
      "sections": [
        {
          "title": "Safari rooms — per person sharing",
          "rows": [
            [
              "Bed & breakfast",
              "780"
            ],
            [
              "Half board (dinner, bed & breakfast)",
              "910"
            ],
            [
              "Full board (breakfast, lunch, dinner & bed)",
              "1,040"
            ],
            [
              "Fully inclusive (full board + two game viewing activities)",
              "1,664"
            ]
          ]
        },
        {
          "title": "Safari rooms — single",
          "rows": [
            [
              "Bed & breakfast",
              "1,164"
            ],
            [
              "Half board",
              "1,294"
            ],
            [
              "Full board",
              "1,424"
            ],
            [
              "Fully inclusive",
              "2,048"
            ]
          ]
        },
        {
          "title": "Family room — per person sharing (minimum 4 persons)",
          "rows": [
            [
              "Bed & breakfast",
              "589"
            ],
            [
              "Half board",
              "719"
            ],
            [
              "Full board",
              "849"
            ],
            [
              "Fully inclusive",
              "1,473"
            ]
          ]
        },
        {
          "title": "Camping — per person sharing",
          "rows": [
            [
              "Room only",
              "115"
            ]
          ]
        },
        {
          "title": "Packages — per person",
          "rows": [
            [
              "Two-night package — sharing",
              "2,370"
            ],
            [
              "Two-night package — single",
              "3,100"
            ],
            [
              "Three-night package — sharing",
              "5,167"
            ],
            [
              "Three-night package — single",
              "6,262"
            ]
          ]
        },
        {
          "title": "Activities — per person",
          "rows": [
            [
              "Chobe game drive (3 hrs)",
              "312"
            ],
            [
              "Full day game drive (9 hrs)",
              "936"
            ],
            [
              "Chobe boat cruise (3 hrs)",
              "312"
            ]
          ]
        },
        {
          "title": "Transfers — per person",
          "rows": [
            [
              "Border to Kasane town",
              "86"
            ],
            [
              "Border to Kasane airport",
              "106"
            ],
            [
              "Thebe to Victoria Falls",
              "505"
            ],
            [
              "Thebe to Livingstone",
              "505"
            ]
          ]
        },
        {
          "title": "Chobe National Park / conservation fees — per person per day",
          "rows": [
            [
              "Foreign / international",
              "190"
            ],
            [
              "Residents",
              "145"
            ],
            [
              "Citizens",
              "20"
            ]
          ]
        }
      ]
    },
    "2027": {
      "name": "Thebe River Safaris",
      "region": "Chobe",
      "currency": "BWP",
      "validity": "2027 · single season, 1 Jan – 31 Dec 2027",
      "note": "Net 20% STO rates, BWP. Rates are quoted in Botswana Pula (BWP) per person per night as supplied by Thebe — this supplier does not quote in US$. All rates exclude Government park fees; the Government bed levy and park fees may change without notice. Child policy: children under 6 sharing with 2 adults free of charge; 6–12 sharing with 2 adults pay 50% of the adult rate; 12 and over count as an adult if using their own room. One child sharing per room; child and third-person sharing subject to availability. Guide policy: one room free of charge per accommodated group booking for crew or translator, subject to availability at check-in and not confirmable at booking or rooming-list stage — a guaranteed crew room is charged at the STO rate, as are additional crew rooms. Crew free of charge on camping group bookings; crew pay park fees only for activities. Activities are not private, seats may be shared with other hotel guests, and require a minimum of four persons per departure. Packages exclude park fees, visas, transfers and drinks. The three-night package includes a guided day trip to Victoria Falls (Zimbabwe) with transfer, lunch and craft market visit, excluding park fees and visa. A signed STO agreement must be returned to reservations@theberiversafaris.com.",
      "sections": [
        {
          "title": "Safari rooms — per person sharing",
          "rows": [
            [
              "Bed & breakfast",
              "834"
            ],
            [
              "Half board (dinner, bed & breakfast)",
              "964"
            ],
            [
              "Full board (breakfast, lunch, dinner & bed)",
              "1,094"
            ],
            [
              "Fully inclusive (full board + two game viewing activities)",
              "1,718"
            ]
          ]
        },
        {
          "title": "Safari rooms — single",
          "rows": [
            [
              "Bed & breakfast",
              "1,245"
            ],
            [
              "Half board",
              "1,375"
            ],
            [
              "Full board",
              "1,505"
            ],
            [
              "Fully inclusive",
              "2,129"
            ]
          ]
        },
        {
          "title": "Family room — per person sharing (minimum 4 persons)",
          "rows": [
            [
              "Bed & breakfast",
              "630"
            ],
            [
              "Half board",
              "760"
            ],
            [
              "Full board",
              "890"
            ],
            [
              "Fully inclusive",
              "1,514"
            ]
          ]
        },
        {
          "title": "Camping — per person sharing",
          "rows": [
            [
              "Room only",
              "123"
            ]
          ]
        },
        {
          "title": "Packages — per person",
          "rows": [
            [
              "Two-night package — sharing",
              "2,474"
            ],
            [
              "Two-night package — single",
              "3,256"
            ],
            [
              "Three-night package — sharing",
              "5,212"
            ],
            [
              "Three-night package — single",
              "6,384"
            ]
          ]
        },
        {
          "title": "Activities — per person",
          "rows": [
            [
              "Chobe game drive (3 hrs)",
              "312"
            ],
            [
              "Full day game drive (9 hrs)",
              "936"
            ],
            [
              "Chobe boat cruise (3 hrs)",
              "312"
            ]
          ]
        },
        {
          "title": "Transfers — per person",
          "rows": [
            [
              "Border to Kasane town",
              "86"
            ],
            [
              "Border to Kasane airport",
              "106"
            ],
            [
              "Thebe to Victoria Falls",
              "505"
            ],
            [
              "Thebe to Livingstone",
              "505"
            ]
          ]
        },
        {
          "title": "Chobe National Park / conservation fees — per person per day",
          "rows": [
            [
              "Foreign / international",
              "190"
            ],
            [
              "Residents",
              "145"
            ],
            [
              "Citizens",
              "20"
            ]
          ]
        }
      ]
    }
  }
});

// ---------------------------------------------------------------------------
// Ultimate Safaris / ultimate.earth camps — 2027, N$.
// Galton House (Windhoek), Camp Sossus (Sossusvlei), Camp Doros, Onduli Ridge
// and Onduli Enclave (Damaraland).
// RACK IS THE SUPPLIER'S OWN PUBLISHED SHEET, NOT DERIVED. Their STO discount is
// ~26.4% off public, not the usual 20% — deriving rack at STO/0.8 would have
// understated every public price.
// Conservation & community fee is charged ON TOP and is not in the rates.
// ---------------------------------------------------------------------------
Object.assign(DDS_STO_BY_YEAR, {
  "galton-house": {
    "2027": {
      "name": "Galton House",
      "region": "Windhoek",
      "currency": "N$",
      "validity": "2027 · Shoulder 10 Jan–31 Mar & 1–19 Dec / High 1 Apr–30 Nov & 20 Dec–9 Jan '28",
      "note": "Net STO rates. N$ per person per night, bed & breakfast, minimum 1 night. Includes accommodation, breakfast and VAT. Excludes drinks, dinner, a la carte lunch, artisan coffee, laundry (available on two-night stays or longer), activities, tips, personal items and travel insurance. Day use of the communal areas and bathroom, without a guest room, is N$550 per person for guests not staying at Galton House. Windhoek city tour N$1,415 per person one way, 3 hours, minimum 2 and maximum 7 pax. Children of all ages welcome sharing with adults on a single bed: 0–5 years at 25% of the adult rate, 6–12 years at 50%. A 15% long-stay discount applies from 6 nights and is already reflected in the 6+ night columns; it applies in shoulder season only.",
      "sections": [
        {
          "title": "Shoulder season (10 Jan – 31 Mar 2027 and 1 – 19 Dec 2027) — standard rooms",
          "rows": [
            [
              "Per person sharing, 1–5 nights",
              "1,544"
            ],
            [
              "Per person sharing, 6+ nights (15% long-stay)",
              "1,312"
            ],
            [
              "Single supplement, 1–5 nights",
              "340"
            ],
            [
              "Single supplement, 6+ nights",
              "289"
            ]
          ]
        },
        {
          "title": "High season (1 Apr – 30 Nov 2027 and 20 Dec 2027 – 9 Jan 2028) — standard rooms",
          "rows": [
            [
              "Per person sharing, 1–5 nights",
              "1,762"
            ],
            [
              "Per person sharing, 6+ nights",
              "1,762"
            ],
            [
              "Single supplement, 1–5 nights",
              "399"
            ],
            [
              "Single supplement, 6+ nights",
              "399"
            ]
          ]
        },
        {
          "title": "Shoulder season (10 Jan – 31 Mar 2027 and 1 – 19 Dec 2027) — pool suite",
          "rows": [
            [
              "Per person sharing, 1–5 nights",
              "2,101"
            ],
            [
              "Per person sharing, 6+ nights (15% long-stay)",
              "1,785"
            ],
            [
              "Single supplement, 1–5 nights",
              "513"
            ],
            [
              "Single supplement, 6+ nights",
              "436"
            ]
          ]
        },
        {
          "title": "High season (1 Apr – 30 Nov 2027 and 20 Dec 2027 – 9 Jan 2028) — pool suite",
          "rows": [
            [
              "Per person sharing, 1–5 nights",
              "2,381"
            ],
            [
              "Per person sharing, 6+ nights",
              "2,381"
            ],
            [
              "Single supplement, 1–5 nights",
              "628"
            ],
            [
              "Single supplement, 6+ nights",
              "628"
            ]
          ]
        },
        {
          "title": "Pilots & guides (per person per night, all meals and non-alcoholic drinks)",
          "rows": [
            [
              "Standard room",
              "1,315"
            ],
            [
              "Pool suite",
              "2,630"
            ]
          ]
        }
      ]
    }
  },
  "camp-sossus": {
    "2027": {
      "name": "Camp Sossus",
      "region": "Sossusvlei",
      "currency": "N$",
      "validity": "2027 · Shoulder 10 Jan–31 Mar & 1–19 Dec / High 1 Apr–30 Nov & 20 Dec–9 Jan '28",
      "note": "Net STO rates. N$ per person per night, fully inclusive, minimum 2 nights. The conservation and community fee is charged per person per night for adults and children and is NOT included in the rates above — it must be added to every booking. Pilots and guides are not subject to the conservation and community fee; their rate includes all meals and non-alcoholic drinks. Private vehicles must be booked in advance for the entire stay, are charged per night, are limited to 7 passengers and are subject to availability. A 15% long-stay discount applies from 6 nights and is already reflected in the 6+ night columns; it applies in shoulder season only. Rates must be read in conjunction with the camp fact sheet. Includes accommodation, all meals, local drinks, shared camp activities, transfers to and from Hammerstein or Witwater airstrips, concession fees, the Sossusvlei fee and VAT. Excludes premium drinks, laundry (not available), additional transfers, third-party activities, tips, the conservation fee, personal items and travel insurance. No children under 6 unless exclusive use is booked (5 or more full-paying tents, 10 adults); children 6–12 at 50% of the adult rate sharing with adults. Exclusive use is considered at 5 or more full-paying tents.",
      "sections": [
        {
          "title": "Shoulder season (10 Jan – 31 Mar 2027 and 1 – 19 Dec 2027)",
          "rows": [
            [
              "Per person sharing, 1–5 nights",
              "5,761"
            ],
            [
              "Per person sharing, 6+ nights (15% long-stay)",
              "4,897"
            ],
            [
              "Single supplement, 1–5 nights",
              "1,923"
            ],
            [
              "Single supplement, 6+ nights",
              "1,633"
            ],
            [
              "Conservation & community fee, per person per night",
              "420"
            ]
          ]
        },
        {
          "title": "High season (1 Apr – 30 Nov 2027 and 20 Dec 2027 – 9 Jan 2028)",
          "rows": [
            [
              "Per person sharing, 1–5 nights",
              "6,829"
            ],
            [
              "Per person sharing, 6+ nights",
              "6,829"
            ],
            [
              "Single supplement, 1–5 nights",
              "2,279"
            ],
            [
              "Single supplement, 6+ nights",
              "2,279"
            ],
            [
              "Conservation & community fee, per person per night",
              "420"
            ]
          ]
        },
        {
          "title": "Pilots, guides & private vehicle",
          "rows": [
            [
              "Pilot or guide — shoulder season",
              "1,998"
            ],
            [
              "Pilot or guide — high season",
              "3,996"
            ],
            [
              "Private vehicle, per vehicle per night",
              "12,941"
            ]
          ]
        }
      ]
    }
  },
  "camp-doros": {
    "2027": {
      "name": "Camp Doros",
      "region": "Damaraland",
      "currency": "N$",
      "validity": "2027 · Shoulder 10 Jan–31 Mar & 1–19 Dec / High 1 Apr–30 Nov & 20 Dec–9 Jan '28",
      "note": "Net STO rates. N$ per person per night, fully inclusive, minimum 2 nights. The conservation and community fee is charged per person per night for adults and children and is NOT included in the rates above — it must be added to every booking. Pilots and guides are not subject to the conservation and community fee; their rate includes all meals and non-alcoholic drinks. Private vehicles must be booked in advance for the entire stay, are charged per night, are limited to 7 passengers and are subject to availability. A 15% long-stay discount applies from 6 nights and is already reflected in the 6+ night columns; it applies in shoulder season only. Rates must be read in conjunction with the camp fact sheet. Includes accommodation, all meals, local drinks, scheduled shared activities, airstrip transfers from Onduli airstrip at the scheduled 15:00 pick-up, concession fees, the rhino activity and VAT. On a three-night stay the rock engraving visit and elephant tracking fee are included. Excludes premium drinks, laundry (not available), additional transfers, tips, the conservation fee, personal items and travel insurance. Exclusive use is considered at 5 or more full-paying tents.",
      "sections": [
        {
          "title": "Shoulder season (10 Jan – 31 Mar 2027 and 1 – 19 Dec 2027)",
          "rows": [
            [
              "Per person sharing, 1–5 nights",
              "5,761"
            ],
            [
              "Per person sharing, 6+ nights (15% long-stay)",
              "4,897"
            ],
            [
              "Single supplement, 1–5 nights",
              "1,923"
            ],
            [
              "Single supplement, 6+ nights",
              "1,636"
            ],
            [
              "Conservation & community fee, per person per night",
              "420"
            ]
          ]
        },
        {
          "title": "High season (1 Apr – 30 Nov 2027 and 20 Dec 2027 – 9 Jan 2028)",
          "rows": [
            [
              "Per person sharing, 1–5 nights",
              "6,829"
            ],
            [
              "Per person sharing, 6+ nights",
              "6,829"
            ],
            [
              "Single supplement, 1–5 nights",
              "2,279"
            ],
            [
              "Single supplement, 6+ nights",
              "2,279"
            ],
            [
              "Conservation & community fee, per person per night",
              "420"
            ]
          ]
        },
        {
          "title": "Pilots, guides & private vehicle",
          "rows": [
            [
              "Pilot or guide — shoulder season",
              "1,998"
            ],
            [
              "Pilot or guide — high season",
              "3,996"
            ],
            [
              "Private vehicle, per vehicle per night",
              "12,941"
            ]
          ]
        }
      ]
    }
  },
  "onduli-ridge": {
    "2027": {
      "name": "Onduli Ridge",
      "region": "Damaraland",
      "currency": "N$",
      "validity": "2027 · Shoulder 10 Jan–31 Mar & 1–19 Dec / High 1 Apr–30 Nov & 20 Dec–9 Jan '28",
      "note": "Net STO rates. N$ per person per night, fully inclusive, minimum 2 nights. The conservation and community fee is charged per person per night for adults and children and is NOT included in the rates above — it must be added to every booking. Pilots and guides are not subject to the conservation and community fee; their rate includes all meals and non-alcoholic drinks. Private vehicles must be booked in advance for the entire stay, are charged per night, are limited to 7 passengers and are subject to availability. A 15% long-stay discount applies from 6 nights and is already reflected in the 6+ night columns; it applies in shoulder season only. Rates must be read in conjunction with the camp fact sheet. Includes accommodation, all meals, local drinks, laundry, scheduled shared activities, airstrip transfers from Onduli airstrip, concession fees, the elephant tracking fee, the Twyfelfontein fee and VAT. On a three-night stay the rhino activity is included. Excludes premium brand drinks, additional transfers, tips, the conservation fee, personal items and travel insurance.",
      "sections": [
        {
          "title": "Shoulder season (10 Jan – 31 Mar 2027 and 1 – 19 Dec 2027)",
          "rows": [
            [
              "Per person sharing, 1–5 nights",
              "11,287"
            ],
            [
              "Per person sharing, 6+ nights (15% long-stay)",
              "9,594"
            ],
            [
              "Single supplement, 1–5 nights",
              "3,877"
            ],
            [
              "Single supplement, 6+ nights",
              "3,296"
            ],
            [
              "Conservation & community fee, per person per night",
              "600"
            ]
          ]
        },
        {
          "title": "High season (1 Apr – 30 Nov 2027 and 20 Dec 2027 – 9 Jan 2028)",
          "rows": [
            [
              "Per person sharing, 1–5 nights",
              "14,707"
            ],
            [
              "Per person sharing, 6+ nights",
              "14,707"
            ],
            [
              "Single supplement, 1–5 nights",
              "5,038"
            ],
            [
              "Single supplement, 6+ nights",
              "5,038"
            ],
            [
              "Conservation & community fee, per person per night",
              "600"
            ]
          ]
        },
        {
          "title": "Pilots, guides & private vehicle",
          "rows": [
            [
              "Pilot or guide — shoulder season",
              "2,125"
            ],
            [
              "Pilot or guide — high season",
              "4,250"
            ],
            [
              "Private vehicle, per vehicle per night",
              "12,941"
            ]
          ]
        }
      ]
    }
  },
  "onduli-enclave": {
    "2027": {
      "name": "Onduli Enclave",
      "region": "Damaraland",
      "currency": "N$",
      "validity": "2027 · Shoulder 10 Jan–31 Mar & 1–19 Dec / High 1 Apr–30 Nov & 20 Dec–9 Jan '28",
      "note": "Net STO rates. N$ per night, fully inclusive, exclusive use, minimum 4 pax and minimum 2 nights. The headline figure is for 4 persons sharing per night, not per person. Includes accommodation, all meals with a private chef, local and premium brand drinks as offered, laundry, private activities, a private butler, airstrip transfers from Onduli airstrip, concession fees, the elephant tracking fee, the Twyfelfontein fee and VAT. On a three-night stay the rhino activity is included. Excludes additional transfers, tips, conservation fees, personal items and travel insurance. Pilots and guides are accommodated at Onduli Ridge. A 15% long-stay discount applies from 6 nights, shoulder season only, and is already reflected in the 6+ night columns.",
      "sections": [
        {
          "title": "Shoulder season (10 Jan – 31 Mar 2027 and 1 – 19 Dec 2027) — exclusive use, minimum 4 pax",
          "rows": [
            [
              "4 persons sharing, per night, 1–5 nights",
              "77,608"
            ],
            [
              "4 persons sharing, per night, 6+ nights (15% long-stay)",
              "65,968"
            ],
            [
              "Additional 5th or 6th adult sharing, 1–5 nights",
              "19,402"
            ],
            [
              "Additional 5th or 6th adult sharing, 6+ nights",
              "16,492"
            ],
            [
              "Conservation & community fee, per night (4 pax unit)",
              "2,400"
            ],
            [
              "Conservation & community fee, each additional adult",
              "600"
            ]
          ]
        },
        {
          "title": "High season (1 Apr – 30 Nov 2027 and 20 Dec 2027 – 9 Jan 2028) — exclusive use, minimum 4 pax",
          "rows": [
            [
              "4 persons sharing, per night, 1–5 nights",
              "101,455"
            ],
            [
              "4 persons sharing, per night, 6+ nights",
              "101,455"
            ],
            [
              "Additional 5th or 6th adult sharing, 1–5 nights",
              "25,364"
            ],
            [
              "Additional 5th or 6th adult sharing, 6+ nights",
              "25,364"
            ],
            [
              "Conservation & community fee, per night (4 pax unit)",
              "2,400"
            ],
            [
              "Conservation & community fee, each additional adult",
              "600"
            ]
          ]
        },
        {
          "title": "Pilots & guides (accommodated at Onduli Ridge)",
          "rows": [
            [
              "Shoulder season",
              "2,125"
            ],
            [
              "High season",
              "4,250"
            ]
          ]
        }
      ]
    }
  }
});

// ---------------------------------------------------------------------------
// The Victoria Falls Hotel (Zimbabwe) — 2026 and 2027, US$.
// Rates are PER ROOM per night, bed & breakfast, nett and non-commissionable.
// No published rack sheet, so rack is derived at STO/0.8.
// ---------------------------------------------------------------------------
Object.assign(DDS_STO_BY_YEAR, {
  "the-victoria-falls-hotel": {
    "2026": {
      "name": "The Victoria Falls Hotel",
      "region": "Victoria Falls",
      "currency": "US$",
      "validity": "2026 · Low 1 Jan–30 Jun / High 1 Jul–31 Dec",
      "note": "Nett, non-commissionable travel agent rates. US$ per ROOM per night — not per person — on a bed and breakfast basis. The Presidential / Livingstone suite is quoted on dinner, bed and breakfast. Rates include the 2% tourism levy and VAT as legislated by the Government of Zimbabwe. The hotel offers a fully serviced wheelchair accessible room in the Classic category. Check-in 14:00, check-out 10:00. A provisional booking is held for 14 days and then automatically released if not confirmed. Low season bookings need a 10% non-refundable deposit or voucher within 30 days of booking; high season 20%. Bookings made within 30 days of travel require full payment within 48 hours, and full prepayment is due no later than 45 days before arrival. Children are 3–11 years and adult children 12 and over. Child rates apply to Classic, Stables Signature Wing and Premium rooms only, subject to availability, and never to suites: a second room taken by a guest of 12 or over is charged the normal single or twin rate; a second room taken by a child of 3–11 is charged 50% on bed and breakfast — one child pays 50% of the single rate, two children pay 50% of the double rate. Infants under 3 stay free sharing with paying guests and cots are available. Children 3–11 pay 50% of the applicable meal rate on buffet meals only. An STO rate application form and a signed agreement are required by the hotel.",
      "sections": [
        {
          "title": "Low season (1 Jan – 30 Jun 2026) — single, per room per night",
          "rows": [
            [
              "Classic room",
              "559"
            ],
            [
              "Classic accessible room",
              "559"
            ],
            [
              "Stables Signature Wing room",
              "760"
            ],
            [
              "Premium room",
              "1,086"
            ],
            [
              "Deluxe suite",
              "1,226"
            ],
            [
              "Executive suite",
              "1,592"
            ],
            [
              "Batoka suite",
              "3,960"
            ],
            [
              "Presidential / Livingstone suite (dinner, bed & breakfast)",
              "5,850"
            ]
          ]
        },
        {
          "title": "Low season (1 Jan – 30 Jun 2026) — double / twin, per room per night",
          "rows": [
            [
              "Classic room",
              "598"
            ],
            [
              "Classic accessible room",
              "598"
            ],
            [
              "Stables Signature Wing room",
              "796"
            ],
            [
              "Premium room",
              "1,138"
            ],
            [
              "Deluxe suite",
              "1,226"
            ],
            [
              "Executive suite",
              "1,592"
            ],
            [
              "Batoka suite",
              "3,960"
            ],
            [
              "Presidential / Livingstone suite (dinner, bed & breakfast)",
              "5,850"
            ]
          ]
        },
        {
          "title": "High season (1 Jul – 31 Dec 2026) — single, per room per night",
          "rows": [
            [
              "Classic room",
              "612"
            ],
            [
              "Classic accessible room",
              "612"
            ],
            [
              "Stables Signature Wing room",
              "826"
            ],
            [
              "Premium room",
              "1,179"
            ],
            [
              "Deluxe suite",
              "1,347"
            ],
            [
              "Executive suite",
              "1,755"
            ],
            [
              "Batoka suite",
              "3,960"
            ],
            [
              "Presidential / Livingstone suite (dinner, bed & breakfast)",
              "5,850"
            ]
          ]
        },
        {
          "title": "High season (1 Jul – 31 Dec 2026) — double / twin, per room per night",
          "rows": [
            [
              "Classic room",
              "654"
            ],
            [
              "Classic accessible room",
              "654"
            ],
            [
              "Stables Signature Wing room",
              "862"
            ],
            [
              "Premium room",
              "1,232"
            ],
            [
              "Deluxe suite",
              "1,347"
            ],
            [
              "Executive suite",
              "1,755"
            ],
            [
              "Batoka suite",
              "3,960"
            ],
            [
              "Presidential / Livingstone suite (dinner, bed & breakfast)",
              "5,850"
            ]
          ]
        },
        {
          "title": "Restaurant & meal rates, per person",
          "rows": [
            [
              "Jungle Junction breakfast buffet (06:30–10:00)",
              "40"
            ],
            [
              "Jungle Junction private lunch buffet, minimum 35 pax (12:00–14:00)",
              "40"
            ],
            [
              "Jungle Junction dinner buffet (19:00–22:00)",
              "45"
            ]
          ]
        }
      ]
    },
    "2027": {
      "name": "The Victoria Falls Hotel",
      "region": "Victoria Falls",
      "currency": "US$",
      "validity": "2027 · Low 1 Jan–30 Apr & 1 Nov–31 Dec / High 1 May–31 Oct",
      "note": "Nett, non-commissionable travel agent rates. US$ per ROOM per night — not per person — on a bed and breakfast basis. The Presidential / Livingstone suite is quoted on dinner, bed and breakfast. Rates include the 2% tourism levy and VAT as legislated by the Government of Zimbabwe. The hotel offers a fully serviced wheelchair accessible room in the Classic category. Check-in 14:00, check-out 10:00. A provisional booking is held for 14 days and then automatically released if not confirmed. Low season bookings need a 10% non-refundable deposit or voucher within 30 days of booking; high season 20%. Bookings made within 30 days of travel require full payment within 48 hours, and full prepayment is due no later than 45 days before arrival. Children are 3–11 years and adult children 12 and over. Child rates apply to Classic, Stables Signature Wing and Premium rooms only, subject to availability, and never to suites: a second room taken by a guest of 12 or over is charged the normal single or twin rate; a second room taken by a child of 3–11 is charged 50% on bed and breakfast — one child pays 50% of the single rate, two children pay 50% of the double rate. Infants under 3 stay free sharing with paying guests and cots are available. Children 3–11 pay 50% of the applicable meal rate on buffet meals only. An STO rate application form and a signed agreement are required by the hotel.",
      "sections": [
        {
          "title": "Low season (1 Jan – 30 Apr 2027 and 1 Nov – 31 Dec 2027) — single, per room per night",
          "rows": [
            [
              "Classic room",
              "560"
            ],
            [
              "Stables Signature Wing room",
              "798"
            ],
            [
              "Premium room",
              "1,086"
            ],
            [
              "Deluxe suite",
              "1,226"
            ],
            [
              "Executive suite",
              "1,592"
            ],
            [
              "Batoka suite",
              "3,960"
            ],
            [
              "Presidential / Livingstone suite (dinner, bed & breakfast)",
              "5,850"
            ]
          ]
        },
        {
          "title": "Low season (1 Jan – 30 Apr 2027 and 1 Nov – 31 Dec 2027) — double / twin, per room per night",
          "rows": [
            [
              "Classic room",
              "598"
            ],
            [
              "Stables Signature Wing room",
              "835"
            ],
            [
              "Premium room",
              "1,138"
            ],
            [
              "Deluxe suite",
              "1,226"
            ],
            [
              "Executive suite",
              "1,592"
            ],
            [
              "Batoka suite",
              "3,960"
            ],
            [
              "Presidential / Livingstone suite (dinner, bed & breakfast)",
              "5,850"
            ]
          ]
        },
        {
          "title": "High season (1 May – 31 Oct 2027) — single, per room per night",
          "rows": [
            [
              "Classic room",
              "612"
            ],
            [
              "Stables Signature Wing room",
              "867"
            ],
            [
              "Premium room",
              "1,179"
            ],
            [
              "Deluxe suite",
              "1,347"
            ],
            [
              "Executive suite",
              "1,755"
            ],
            [
              "Batoka suite",
              "3,960"
            ],
            [
              "Presidential / Livingstone suite (dinner, bed & breakfast)",
              "5,850"
            ]
          ]
        },
        {
          "title": "High season (1 May – 31 Oct 2027) — double / twin, per room per night",
          "rows": [
            [
              "Classic room",
              "653"
            ],
            [
              "Stables Signature Wing room",
              "905"
            ],
            [
              "Premium room",
              "1,231"
            ],
            [
              "Deluxe suite",
              "1,347"
            ],
            [
              "Executive suite",
              "1,755"
            ],
            [
              "Batoka suite",
              "3,960"
            ],
            [
              "Presidential / Livingstone suite (dinner, bed & breakfast)",
              "5,850"
            ]
          ]
        },
        {
          "title": "Restaurant & meal rates, per person",
          "rows": [
            [
              "Jungle Junction breakfast buffet (06:30–10:00)",
              "41"
            ],
            [
              "Jungle Junction dinner buffet (19:00–22:00)",
              "41"
            ]
          ]
        }
      ]
    }
  }
});


// ---------------------------------------------------------------------------
// LEGACY SHEET RATES — 2027 net STO recovered from the suppliers' own rate
// sheets for lodges the live rate system did not yet serve (they previously
// read "rates to follow" even though the supplier had sent rates).
//
// IMPORTANT — this map is consulted LAST: after the owner area (Redis) and
// after the inline maps above. It can therefore only ever FILL a gap, never
// override a live rate. Once a lodge is loaded properly in the owner area,
// that wins automatically and this entry becomes dead weight.
//
// Rack is deliberately NOT derived from these: the sheets do not state a
// commission %, and per policy rack is only published when the supplier's own
// rack is known or the commission is stated. So these grow AGENT (STO)
// coverage only; the public rack pages are unchanged.
// ---------------------------------------------------------------------------
Object.assign(LEGACY_STO_BY_YEAR, {
  "hakusembe-river-lodge": {
    "2027": {
      "name": "Hakusembe River Lodge",
      "region": "Caprivi",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/originals/gondwana/gondwana_p27.pdf). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "Room B&B — per person sharing",
              "2,912"
            ],
            [
              "Room B&B — single",
              "3,640"
            ],
            [
              "Camping2Go (bed only) — per person sharing",
              "920"
            ],
            [
              "Camping2Go (bed only) — single",
              "1,840"
            ],
            [
              "Campsite — per person per night",
              "324"
            ],
            [
              "Tour Guide Room (DBB)",
              "793"
            ]
          ]
        }
      ]
    }
  },
  "namushasha-river-lodge": {
    "2027": {
      "name": "Namushasha River Lodge",
      "region": "Caprivi",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/originals/gondwana/gondwana_p28.pdf). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "Room B&B — per person sharing",
              "2,912"
            ],
            [
              "Room B&B — single",
              "3,640"
            ],
            [
              "Camping2Go (bed only) — per person sharing",
              "920"
            ],
            [
              "Camping2Go (bed only) — single",
              "1,840"
            ],
            [
              "Campsite — per person per night",
              "324"
            ],
            [
              "Tour Guide Room (DBB)",
              "793"
            ]
          ]
        }
      ]
    }
  },
  "popa-falls-resort": {
    "2027": {
      "name": "Popa Falls Resort",
      "region": "Caprivi",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/originals/nwr/nwr_popafalls.pdf). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "Low Season (01 Nov – 30 Jun) · Campsite — per person camping",
              "153"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Campsite — per person camping",
              "153"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Campsite (overlander) (max — per person camping",
              "153"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Campsite (overlander) (max — per person camping",
              "153"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · River cabins (2 beds) BB — per person sharing",
              "1,368"
            ],
            [
              "High Season (01 Jul – 31 Oct) · River cabins (2 beds) BB — per person sharing",
              "1,710"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · River cabins (2 beds) BB — single",
              "1,584"
            ],
            [
              "High Season (01 Jul – 31 Oct) · River cabins (2 beds) BB — single",
              "1,935"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Bush chalet (2 beds) BB — per person sharing",
              "1,224"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Bush chalet (2 beds) BB — per person sharing",
              "1,521"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Bush chalet (2 beds) BB — single",
              "1,449"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Bush chalet (2 beds) BB — single",
              "1,746"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Family House (6 beds) - min BB — per person sharing",
              "1,368"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Family House (6 beds) - min BB — per person sharing",
              "1,710"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Luxury river cabins BB — per person sharing",
              "1,638"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Luxury river cabins BB — per person sharing",
              "1,962"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Luxury river cabins BB — single",
              "1,854"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Luxury river cabins BB — single",
              "2,178"
            ]
          ]
        }
      ]
    }
  },
  "ai-aiba-lodge": {
    "2027": {
      "name": "Ai Aiba Lodge",
      "region": "Central Namibia",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/ai_aiba_lodge.html). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "Low Season (16 Jan – 30 Jun) · Per Person Sharing",
              "2,001"
            ],
            [
              "Low Season (16 Jan – 30 Jun) · Single",
              "2,703"
            ],
            [
              "Low Season (16 Jan – 30 Jun) · Conservation Levy (pppn)",
              "170"
            ],
            [
              "High Season (1 Jul – 15 Jan) · Per Person Sharing",
              "2,873"
            ],
            [
              "High Season (1 Jul – 15 Jan) · Single",
              "3,884"
            ],
            [
              "High Season (1 Jul – 15 Jan) · Conservation Levy (pppn)",
              "170"
            ],
            [
              "Low — ≤3 pax (25% off)",
              "1,501"
            ],
            [
              "Low — 4+ pax (50% off)",
              "1,001"
            ],
            [
              "High — ≤3 pax (25% off)",
              "2,155"
            ],
            [
              "High — 4+ pax (50% off)",
              "1,437"
            ],
            [
              "Nature Drive / Bushman Rock Art (3 hrs)",
              "750"
            ],
            [
              "Guided Morning Walk — Ai Aiba (2–3 hrs)",
              "450"
            ],
            [
              "Nature Drive / Bushman Rock Art (3 hrs, AM or PM) — per person",
              "750"
            ],
            [
              "Ai Aiba Guided Walk (2–3 hrs) — per person",
              "450"
            ],
            [
              "Walk & Drive (3 hrs) — per person",
              "750"
            ],
            [
              "Walk with San Living Museum visit (3 hrs) — per person",
              "710"
            ],
            [
              "Guided Sundowner Mountain Bike Ride (E-bike) — per person",
              "350"
            ],
            [
              "Guided Mountain Bike Tour (incl. E-bike) — per person",
              "1,050"
            ]
          ]
        }
      ]
    }
  },
  "gross-barmen-resort": {
    "2027": {
      "name": "Gross Barmen Resort",
      "region": "Central Namibia",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/originals/nwr/nwr_grossbarmen.pdf). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "Low Season (01 Nov – 30 Jun) · Campsite — per person camping",
              "216"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Campsite — per person camping",
              "216"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Premier chalet BB — per person sharing",
              "2,394"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Premier chalet BB — per person sharing",
              "2,394"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Premier chalet BB — single",
              "2,565"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Premier chalet BB — single",
              "2,565"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Bush chalet BB — per person sharing",
              "1,197"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Bush chalet BB — per person sharing",
              "1,197"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Bush chalet BB — single",
              "1,368"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Bush chalet BB — single",
              "1,368"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Family chalet (4 beds) – min BB — per person sharing",
              "1,800"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Family chalet (4 beds) – min BB — per person sharing",
              "1,800"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Premier family chalet (4 beds) -min BB — per person sharing",
              "2,394"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Premier family chalet (4 beds) -min BB — per person sharing",
              "2,394"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Acacia (A & B) – Bed only — bed only",
              "1,062"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Acacia (A & B) – Bed only — bed only",
              "1,062"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Aloe (A , B & C) – Bed only — bed only",
              "1,062"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Aloe (A , B & C) – Bed only — bed only",
              "1,062"
            ]
          ]
        }
      ]
    }
  },
  "hohenstein-lodge": {
    "2027": {
      "name": "Hohenstein Lodge",
      "region": "Central Namibia",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/hohenstein_lodge.html). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "High Season (01 Mar – 30 Nov) · DBB · Room — per person sharing",
              "2,480"
            ],
            [
              "High Season (01 Mar – 30 Nov) · DBB · Room — single",
              "3,240"
            ],
            [
              "High Season (01 Mar – 30 Nov) · DBB · Chalet — per person sharing",
              "4,240"
            ],
            [
              "High Season (01 Mar – 30 Nov) · DBB · Chalet — single",
              "5,520"
            ],
            [
              "High Season (01 Mar – 30 Nov) · Child 4–12",
              "2,120"
            ],
            [
              "Tour Guide (Guide Room)",
              "1,190"
            ],
            [
              "Low Season (01 Dec – 29 Feb) · DBB · Room — per person sharing",
              "1,520"
            ],
            [
              "Low Season (01 Dec – 29 Feb) · DBB · Room — single",
              "1,976"
            ],
            [
              "Low Season (01 Dec – 29 Feb) · DBB · Chalet — per person sharing",
              "3,120"
            ],
            [
              "Low Season (01 Dec – 29 Feb) · DBB · Chalet — single",
              "4,080"
            ],
            [
              "Low Season (01 Dec – 29 Feb) · Child 4–12",
              "1,560"
            ]
          ]
        }
      ]
    }
  },
  "ondudu-safari-lodge": {
    "2027": {
      "name": "Ondudu Safari Lodge",
      "region": "Central Namibia",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/ondudu_safari_lodge.html). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "Green Season (07 Jan – 31 Mar) · DBB — per person sharing",
              "2,820"
            ],
            [
              "Low Season (01 Apr – 30 Jun & 16 Nov – 14 Dec) · DBB — per person sharing",
              "3,473"
            ],
            [
              "High Season (01 Jul – 15 Nov & 15 Dec – 06 Jan) · DBB — per person sharing",
              "3,645"
            ],
            [
              "Green Season (07 Jan – 31 Mar) · DBB — single",
              "3,807"
            ],
            [
              "Low Season (01 Apr – 30 Jun & 16 Nov – 14 Dec) · DBB — single",
              "4,689"
            ],
            [
              "High Season (01 Jul – 15 Nov & 15 Dec – 06 Jan) · DBB — single",
              "4,920"
            ]
          ]
        }
      ]
    }
  },
  "waterberg-camp": {
    "2027": {
      "name": "Waterberg Camp",
      "region": "Central Namibia",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/originals/nwr/nwr_waterberg.pdf). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "Low Season (01 Nov – 30 Jun) · Campsite — per person camping",
              "387"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Campsite — per person camping",
              "387"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Double room BB — per person sharing",
              "990"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Double room BB — per person sharing",
              "1,152"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Double room BB — single",
              "1,215"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Double room BB — single",
              "1,377"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Bush chalet (2 beds) BB — per person sharing",
              "1,206"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Bush chalet (2 beds) BB — per person sharing",
              "1,395"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Bush chalet (2 beds) BB — single",
              "1,440"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Bush chalet (2 beds) BB — single",
              "1,620"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Bush chalet (4 beds) - min BB — per person sharing",
              "1,206"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Bush chalet (4 beds) - min BB — per person sharing",
              "1,368"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Family chalet (4 beds) - min BB — per person sharing",
              "1,368"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Family chalet (4 beds) - min BB — per person sharing",
              "1,584"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Premier bush chalet (2 beds) BB — per person sharing",
              "1,476"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Premier bush chalet (2 beds) BB — per person sharing",
              "1,638"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Premier bush chalet (2 beds) BB — single",
              "1,701"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Premier bush chalet (2 beds) BB — single",
              "1,872"
            ]
          ]
        }
      ]
    }
  },
  "damara-mopane-lodge": {
    "2027": {
      "name": "Damara Mopane Lodge",
      "region": "Damaraland",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/originals/gondwana/gondwana_p20.pdf). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "Room B&B — per person sharing",
              "1,918.40"
            ],
            [
              "Room B&B — single",
              "2,398"
            ],
            [
              "Tour Guide Room (DBB)",
              "793"
            ]
          ]
        }
      ]
    }
  },
  "grootberg-lodge": {
    "2027": {
      "name": "Grootberg Lodge",
      "region": "Damaraland",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/grootberg_lodge.html). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "Green Season (07 Jan – 31 Mar) · DBB — per person sharing",
              "2,471"
            ],
            [
              "Low Season (01 Apr – 30 Jun & 16 Nov – 14 Dec) · DBB — per person sharing",
              "3,036"
            ],
            [
              "High Season (01 Jul – 15 Nov & 15 Dec – 06 Jan) · DBB — per person sharing",
              "3,662"
            ],
            [
              "Green Season (07 Jan – 31 Mar) · DBB — single",
              "3,336"
            ],
            [
              "Low Season (01 Apr – 30 Jun & 16 Nov – 14 Dec) · DBB — single",
              "4,099"
            ],
            [
              "High Season (01 Jul – 15 Nov & 15 Dec – 06 Jan) · DBB — single",
              "4,944"
            ]
          ]
        }
      ]
    }
  },
  "hoada-campsite": {
    "2027": {
      "name": "Hoada Campsite",
      "region": "Damaraland",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/hoada_campsite.html). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "Green Season (07 Jan – 31 Mar) · Individual campsite — per person",
              "273"
            ],
            [
              "Low Season (01 Apr – 30 Jun & 16 Nov – 14 Dec) · Individual campsite — per person",
              "340"
            ],
            [
              "High Season (01 Jul – 15 Nov & 15 Dec – 06 Jan) · Individual campsite — per person",
              "369"
            ],
            [
              "Green Season (07 Jan – 31 Mar) · Group campsite — per site",
              "2,999"
            ],
            [
              "Low Season (01 Apr – 30 Jun & 16 Nov – 14 Dec) · Group campsite — per site",
              "3,737"
            ],
            [
              "High Season (01 Jul – 15 Nov & 15 Dec – 06 Jan) · Group campsite — per site",
              "4,131"
            ],
            [
              "Green Season (07 Jan – 31 Mar) · Comfort camping tent (incl) — per person",
              "904"
            ],
            [
              "Low Season (01 Apr – 30 Jun & 16 Nov – 14 Dec) · Comfort camping tent (incl) — per person",
              "1,061"
            ],
            [
              "High Season (01 Jul – 15 Nov & 15 Dec – 06 Jan) · Comfort camping tent (incl) — per person",
              "1,093"
            ],
            [
              "Green Season (07 Jan – 31 Mar) · Comfort camping tent (excl) — per person",
              "647"
            ],
            [
              "Low Season (01 Apr – 30 Jun & 16 Nov – 14 Dec) · Comfort camping tent (excl) — per person",
              "804"
            ],
            [
              "High Season (01 Jul – 15 Nov & 15 Dec – 06 Jan) · Comfort camping tent (excl) — per person",
              "836"
            ]
          ]
        }
      ]
    }
  },
  "lodge-damaraland": {
    "2027": {
      "name": "Lodge Damaraland",
      "region": "Damaraland",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/lodge_damaraland.html). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "Low Season (01 Jan – 31 Mar) · Classic Room — per person sharing",
              "1,855"
            ],
            [
              "Low Season (01 Jan – 31 Mar) · Classic Room — single",
              "2,440"
            ],
            [
              "Shoulder Season (01 Apr – 30 Jun & 01 – 31 Dec) · Classic Room — per person sharing",
              "2,010"
            ],
            [
              "Shoulder Season (01 Apr – 30 Jun & 01 – 31 Dec) · Classic Room — single",
              "2,630"
            ],
            [
              "High Season (01 Jul – 30 Nov) · Classic Room — per person sharing",
              "2,305"
            ],
            [
              "High Season (01 Jul – 30 Nov) · Classic Room — single",
              "3,030"
            ]
          ]
        }
      ]
    }
  },
  "omaruru-game-lodge": {
    "2027": {
      "name": "Omaruru Game Lodge",
      "region": "Damaraland",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/omaruru_game_lodge_ratesheet_v3.html). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "Bungalow Standard · DBB — per person sharing",
              "1,880"
            ],
            [
              "Bungalow Standard · DBB — single",
              "2,000"
            ],
            [
              "Bungalow Superior · DBB — per person sharing",
              "2,080"
            ],
            [
              "Bungalow Superior · DBB — single",
              "2,400"
            ],
            [
              "Child 4–10 (DBB)",
              "800"
            ],
            [
              "Tour Guide (DBB)",
              "950"
            ],
            [
              "Game Drive (per person)",
              "600"
            ]
          ]
        }
      ]
    }
  },
  "palmwag-lodge": {
    "2027": {
      "name": "Palmwag Lodge",
      "region": "Damaraland",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/originals/gondwana/gondwana_p21.pdf). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "Standard Room B&B — per person sharing",
              "2,400"
            ],
            [
              "Standard Room B&B — single",
              "3,000"
            ],
            [
              "Comfort Room B&B — per person sharing",
              "2,948.80"
            ],
            [
              "Comfort Room B&B — single",
              "3,686"
            ],
            [
              "Camping2Go (bed only) — per person sharing",
              "920"
            ],
            [
              "Camping2Go (bed only) — single",
              "1,840"
            ],
            [
              "Campsite — per person per night",
              "324"
            ],
            [
              "Tour Guide Room (DBB)",
              "793"
            ]
          ]
        }
      ]
    }
  },
  "twyfelfontein-adventure-camp": {
    "2027": {
      "name": "Twyfelfontein Adventure Camp",
      "region": "Damaraland",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/twyfelfontein_adventure_camp.html). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "High Season (01 Mar – 30 Nov) · DBB · Standard Tent — per person sharing",
              "2,240"
            ],
            [
              "High Season (01 Mar – 30 Nov) · DBB · Standard Tent — single",
              "2,960"
            ],
            [
              "High Season (01 Mar – 30 Nov) · DBB · Premium Tent — per person sharing",
              "3,520"
            ],
            [
              "High Season (01 Mar – 30 Nov) · DBB · Premium Tent — single",
              "4,640"
            ],
            [
              "Tour Guide (Guide Room)",
              "1,090"
            ],
            [
              "Low Season (01 Dec – 29 Feb) · DBB · Standard Tent — per person sharing",
              "1,760"
            ],
            [
              "Low Season (01 Dec – 29 Feb) · DBB · Standard Tent — single",
              "2,320"
            ],
            [
              "Low Season (01 Dec – 29 Feb) · DBB · Premium Tent — per person sharing",
              "2,800"
            ],
            [
              "Low Season (01 Dec – 29 Feb) · DBB · Premium Tent — single",
              "3,680"
            ]
          ]
        }
      ]
    }
  },
  "twyfelfontein-country-lodge": {
    "2027": {
      "name": "Twyfelfontein Country Lodge",
      "region": "Damaraland",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/twyfelfontein_country_lodge.html). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "(01 Nov 2026 – 31 Oct 2027) · DBB — per person sharing",
              "3,116.90"
            ],
            [
              "(01 Nov 2026 – 31 Oct 2027) · DBB — single",
              "3,695.86"
            ],
            [
              "Damaraland Scenic Flight — Route 1, 45min (per pax, 5 sharing)",
              "2,710"
            ],
            [
              "Damaraland Scenic Flight — Route 1, 45min (per pax, 2 sharing)",
              "6,775"
            ]
          ]
        }
      ]
    }
  },
  "wilderness-damaraland-camp": {
    "2027": {
      "name": "Wilderness Damaraland Camp",
      "region": "Damaraland",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/wilderness_damaraland_camp.html). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "06 Jan – 31 Mar · Fully Inclusive — per person sharing",
              "8,693"
            ],
            [
              "06 Jan – 31 Mar · Fully Inclusive — single",
              "11,285"
            ],
            [
              "01 Apr – 31 May · Fully Inclusive — per person sharing",
              "10,742"
            ],
            [
              "01 Apr – 31 May · Fully Inclusive — single",
              "13,945"
            ],
            [
              "01 Jun – 31 Oct · Fully Inclusive — per person sharing",
              "15,249"
            ],
            [
              "01 Jun – 31 Oct · Fully Inclusive — single",
              "19,797"
            ],
            [
              "01 Nov – 19 Dec · Fully Inclusive — per person sharing",
              "10,742"
            ],
            [
              "01 Nov – 19 Dec · Fully Inclusive — single",
              "13,945"
            ],
            [
              "20 Dec – 05 Jan · Fully Inclusive — per person sharing",
              "15,249"
            ],
            [
              "20 Dec – 05 Jan · Fully Inclusive — single",
              "19,797"
            ],
            [
              "06 Jan – 31 Mar · DBB — per person sharing",
              "5,390"
            ],
            [
              "06 Jan – 31 Mar · DBB — single",
              "6,997"
            ],
            [
              "01 Apr – 31 May · DBB — per person sharing",
              "6,769"
            ],
            [
              "01 Apr – 31 May · DBB — single",
              "8,788"
            ],
            [
              "01 Jun – 31 Oct · DBB — per person sharing",
              "12,143"
            ],
            [
              "01 Jun – 31 Oct · DBB — single",
              "15,764"
            ],
            [
              "01 Nov – 19 Dec · DBB — per person sharing",
              "6,964"
            ],
            [
              "01 Nov – 19 Dec · DBB — single",
              "9,041"
            ],
            [
              "20 Dec – 05 Jan · DBB — per person sharing",
              "7,785"
            ],
            [
              "20 Dec – 05 Jan · DBB — single",
              "10,107"
            ]
          ]
        }
      ]
    }
  },
  "wilderness-desert-rhino-camp": {
    "2027": {
      "name": "Wilderness Desert Rhino Camp",
      "region": "Damaraland",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/wilderness_desert_rhino_camp.html). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "06 Jan – 31 Mar · Fully Inclusive — per person sharing",
              "10,555"
            ],
            [
              "06 Jan – 31 Mar · Fully Inclusive — single",
              "13,703"
            ],
            [
              "01 Apr – 31 May · Fully Inclusive — per person sharing",
              "10,935"
            ],
            [
              "01 Apr – 31 May · Fully Inclusive — single",
              "14,196"
            ],
            [
              "01 Jun – 31 Oct · Fully Inclusive — per person sharing",
              "17,359"
            ],
            [
              "01 Jun – 31 Oct · Fully Inclusive — single",
              "22,536"
            ],
            [
              "01 Nov – 19 Dec · Fully Inclusive — per person sharing",
              "10,935"
            ],
            [
              "01 Nov – 19 Dec · Fully Inclusive — single",
              "14,196"
            ],
            [
              "20 Dec – 05 Jan · Fully Inclusive — per person sharing",
              "17,359"
            ],
            [
              "20 Dec – 05 Jan · Fully Inclusive — single",
              "22,536"
            ]
          ]
        }
      ]
    }
  },
  "wilderness-doro-nawas": {
    "2027": {
      "name": "Wilderness Doro Nawas",
      "region": "Damaraland",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/wilderness_doro_nawas.html). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "06 Jan – 31 Mar · Fully Inclusive — per person sharing",
              "6,594"
            ],
            [
              "06 Jan – 31 Mar · Fully Inclusive — single",
              "8,560"
            ],
            [
              "01 Apr – 31 May · Fully Inclusive — per person sharing",
              "8,048"
            ],
            [
              "01 Apr – 31 May · Fully Inclusive — single",
              "10,448"
            ],
            [
              "01 Jun – 31 Oct · Fully Inclusive — per person sharing",
              "10,228"
            ],
            [
              "01 Jun – 31 Oct · Fully Inclusive — single",
              "13,278"
            ],
            [
              "01 Nov – 19 Dec · Fully Inclusive — per person sharing",
              "8,495"
            ],
            [
              "01 Nov – 19 Dec · Fully Inclusive — single",
              "11,028"
            ],
            [
              "20 Dec – 05 Jan · Fully Inclusive — per person sharing",
              "9,554"
            ],
            [
              "20 Dec – 05 Jan · Fully Inclusive — single",
              "12,403"
            ],
            [
              "06 Jan – 31 Mar · DBB — per person sharing",
              "4,057"
            ],
            [
              "06 Jan – 31 Mar · DBB — single",
              "5,267"
            ],
            [
              "01 Apr – 31 May · DBB — per person sharing",
              "5,230"
            ],
            [
              "01 Apr – 31 May · DBB — single",
              "6,790"
            ],
            [
              "01 Jun – 31 Oct · DBB — per person sharing",
              "7,714"
            ],
            [
              "01 Jun – 31 Oct · DBB — single",
              "10,014"
            ],
            [
              "01 Nov – 19 Dec · DBB — per person sharing",
              "5,204"
            ],
            [
              "01 Nov – 19 Dec · DBB — single",
              "6,756"
            ],
            [
              "20 Dec – 05 Jan · DBB — per person sharing",
              "5,531"
            ],
            [
              "20 Dec – 05 Jan · DBB — single",
              "7,180"
            ]
          ]
        }
      ]
    }
  },
  "etosha-king-nehale": {
    "2027": {
      "name": "Etosha King Nehale",
      "region": "East Etosha",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/originals/gondwana/gondwana_p26.pdf). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "Room B&B — per person sharing",
              "2,636"
            ],
            [
              "Room B&B — single",
              "3,295"
            ],
            [
              "Tour Guide Room (DBB)",
              "793"
            ]
          ]
        }
      ]
    }
  },
  "omarunga-epupa-falls-camp": {
    "2027": {
      "name": "Omarunga Epupa-Falls Camp",
      "region": "Epupa",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/originals/gondwana/gondwana_p22.pdf). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "Room B&B — per person sharing",
              "2,120"
            ],
            [
              "Room B&B — single",
              "2,650"
            ],
            [
              "Campsite — per person per night",
              "324"
            ],
            [
              "Tour Guide Room (DBB)",
              "793"
            ]
          ]
        }
      ]
    }
  },
  "ai-ais-hot-springs-and-spa": {
    "2027": {
      "name": "/Ai-/Ais Hot Springs and Spa",
      "region": "Fish River Canyon",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/originals/nwr/nwr_aiais.pdf). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "Low Season (01 Nov – 30 Jun) · Campsite — per person camping",
              "351"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Campsite — per person camping",
              "351"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Mountain view double room (2 beds) BB — per person sharing",
              "1,224"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Mountain view double room (2 beds) BB — per person sharing",
              "1,476"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Mountain view double room (2 beds) BB — single",
              "1,476"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Mountain view double room (2 beds) BB — single",
              "1,719"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · River view double room (2 beds) BB — per person sharing",
              "1,476"
            ],
            [
              "High Season (01 Jul – 31 Oct) · River view double room (2 beds) BB — per person sharing",
              "1,800"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · River view double room (2 beds) BB — single",
              "1,719"
            ],
            [
              "High Season (01 Jul – 31 Oct) · River view double room (2 beds) BB — single",
              "2,052"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Bush family chalet (4 beds) – min Bed only — bed only",
              "1,638"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Bush family chalet (4 beds) – min Bed only — bed only",
              "1,962"
            ]
          ]
        }
      ]
    }
  },
  "boplaas-campsite": {
    "2027": {
      "name": "Boplaas Campsite",
      "region": "Fish River Canyon",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/originals/nwr/nwr_boplaas.pdf). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "Low Season (01 Nov – 30 Jun) · Campsite — per person camping",
              "99"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Campsite — per person camping",
              "99"
            ]
          ]
        }
      ]
    }
  },
  "canyon-lodge": {
    "2027": {
      "name": "Canyon Lodge",
      "region": "Fish River Canyon",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/originals/gondwana/gondwana_p10.pdf). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "Room B&B — per person sharing",
              "2,619.20"
            ],
            [
              "Room B&B — single",
              "3,274"
            ],
            [
              "Tour Guide Room (DBB)",
              "793"
            ]
          ]
        }
      ]
    }
  },
  "canyon-roadhouse": {
    "2027": {
      "name": "Canyon Roadhouse",
      "region": "Fish River Canyon",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/originals/gondwana/gondwana_p12.pdf). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "Room B&B — per person sharing",
              "2,120"
            ],
            [
              "Room B&B — single",
              "2,650"
            ],
            [
              "Campsite — per person per night",
              "324"
            ],
            [
              "Tour Guide Room (DBB)",
              "793"
            ]
          ]
        }
      ]
    }
  },
  "canyon-village": {
    "2027": {
      "name": "Canyon Village",
      "region": "Fish River Canyon",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/originals/gondwana/gondwana_p11.pdf). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "Room B&B — per person sharing",
              "1,596"
            ],
            [
              "Room B&B — single",
              "1,995"
            ],
            [
              "Tour Guide Room (DBB)",
              "793"
            ]
          ]
        }
      ]
    }
  },
  "fish-river-lodge": {
    "2027": {
      "name": "Fish River Lodge",
      "region": "Fish River Canyon",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/fish_river_lodge.html). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "Green Season (07 Jan – 31 Mar) · FB+ — per person sharing",
              "5,672"
            ],
            [
              "Low Season (01 Apr – 30 Jun & 16 Nov – 14 Dec) · FB+ — per person sharing",
              "6,428"
            ],
            [
              "High Season (01 Jul – 15 Nov & 15 Dec – 06 Jan) · FB+ — per person sharing",
              "6,706"
            ],
            [
              "Green Season (07 Jan – 31 Mar) · FB+ — single",
              "6,797"
            ],
            [
              "Low Season (01 Apr – 30 Jun & 16 Nov – 14 Dec) · FB+ — single",
              "7,817"
            ],
            [
              "High Season (01 Jul – 15 Nov & 15 Dec – 06 Jan) · FB+ — single",
              "8,193"
            ],
            [
              "Green Season (07 Jan – 31 Mar) · DBB — per person sharing",
              "3,274"
            ],
            [
              "Low Season (01 Apr – 30 Jun & 16 Nov – 14 Dec) · DBB — per person sharing",
              "4,043"
            ],
            [
              "High Season (01 Jul – 15 Nov & 15 Dec – 06 Jan) · DBB — per person sharing",
              "4,327"
            ],
            [
              "Green Season (07 Jan – 31 Mar) · DBB — single",
              "4,420"
            ],
            [
              "Low Season (01 Apr – 30 Jun & 16 Nov – 14 Dec) · DBB — single",
              "5,458"
            ],
            [
              "High Season (01 Jul – 15 Nov & 15 Dec – 06 Jan) · DBB — single",
              "5,841"
            ]
          ]
        }
      ]
    }
  },
  "hobas-lodge": {
    "2027": {
      "name": "Hobas Lodge",
      "region": "Fish River Canyon",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/originals/nwr/nwr_hobas.pdf). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "Low Season (01 Nov – 30 Jun) · Campsite — per person camping",
              "432"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Campsite — per person camping",
              "432"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Bush chalet (2 beds) BB — per person sharing",
              "1,701"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Bush chalet (2 beds) BB — per person sharing",
              "2,106"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Bush chalet (2 beds) BB — single",
              "1,935"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Bush chalet (2 beds) BB — single",
              "2,106"
            ]
          ]
        }
      ]
    }
  },
  "hardap-resort": {
    "2027": {
      "name": "Hardap Resort",
      "region": "Kalahari",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/originals/nwr/nwr_hardap.pdf). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "Low Season (01 Nov – 30 Jun) · Campsite — per person camping",
              "198"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Campsite — per person camping",
              "198"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · VIP chalets (4 beds) - min BB — per person sharing",
              "1,044"
            ],
            [
              "High Season (01 Jul – 31 Oct) · VIP chalets (4 beds) - min BB — per person sharing",
              "1,044"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Family chalet (4 beds) - min BB — per person sharing",
              "774"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Family chalet (4 beds) - min BB — per person sharing",
              "774"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Bush chalet (2 beds) BB — per person sharing",
              "648"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Bush chalet (2 beds) BB — per person sharing",
              "1,044"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Bush chalet (2 beds) BB — single",
              "819"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Bush chalet (2 beds) BB — single",
              "1,206"
            ]
          ]
        }
      ]
    }
  },
  "kalahari-anib-lodge": {
    "2027": {
      "name": "Kalahari Anib Lodge",
      "region": "Kalahari",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/originals/gondwana/gondwana_p07.pdf). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "Standard Room B&B — per person sharing",
              "2,263.20"
            ],
            [
              "Standard Room B&B — single",
              "2,829"
            ],
            [
              "Comfort Room B&B — per person sharing",
              "2,822.40"
            ],
            [
              "Comfort Room B&B — single",
              "3,528"
            ],
            [
              "Camping2Go (bed only) — per person sharing",
              "920"
            ],
            [
              "Camping2Go (bed only) — single",
              "1,840"
            ],
            [
              "Campsite — per person per night",
              "324"
            ],
            [
              "Tour Guide Room (DBB)",
              "793"
            ]
          ]
        }
      ]
    }
  },
  "kalahari-farmhouse": {
    "2027": {
      "name": "Kalahari Farmhouse",
      "region": "Kalahari",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/originals/gondwana/gondwana_p09.pdf). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "Room B&B — per person sharing",
              "1,700"
            ],
            [
              "Room B&B — single",
              "2,125"
            ],
            [
              "Campsite — per person per night",
              "324"
            ],
            [
              "Tour Guide Room (DBB)",
              "793"
            ]
          ]
        }
      ]
    }
  },
  "kalahari-red-dunes-lodge": {
    "2027": {
      "name": "Kalahari Red Dunes Lodge",
      "region": "Kalahari",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/kalahari_red_dunes_lodge.html). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "High Season (01 Mar – 30 Nov) · Full Board Plus · Suite — per person sharing",
              "5,560"
            ],
            [
              "High Season (01 Mar – 30 Nov) · Full Board Plus · Suite — single",
              "7,240"
            ],
            [
              "High Season (01 Mar – 30 Nov) · Full Board Plus · Superior Suite — per person sharing",
              "7,160"
            ],
            [
              "High Season (01 Mar – 30 Nov) · Child 4–12 (Suite)",
              "2,780"
            ],
            [
              "Tour Guide (Guide Room)",
              "1,190"
            ],
            [
              "Low Season (01 Dec – 29 Feb) · Full Board Plus · Suite — per person sharing",
              "3,360"
            ],
            [
              "Low Season (01 Dec – 29 Feb) · Full Board Plus · Suite — single",
              "4,400"
            ],
            [
              "Low Season (01 Dec – 29 Feb) · Full Board Plus · Superior Suite — per person sharing",
              "5,040"
            ],
            [
              "Low Season (01 Dec – 29 Feb) · Child 4–12 (Suite)",
              "1,680"
            ]
          ]
        }
      ]
    }
  },
  "teufelskrallen-lodge": {
    "2027": {
      "name": "Teufelskrallen Lodge",
      "region": "Kalahari",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/teufelskrallen_lodge.html). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "High Season (01 Mar – 30 Nov) · DBB · Standard Tent — per person sharing",
              "2,240"
            ],
            [
              "High Season (01 Mar – 30 Nov) · DBB · Standard Tent — single",
              "2,960"
            ],
            [
              "High Season (01 Mar – 30 Nov) · Child 4–12",
              "1,120"
            ],
            [
              "Tour Guide (Guide Room)",
              "990"
            ],
            [
              "Low Season (01 Dec – 29 Feb) · DBB · Standard Tent — per person sharing",
              "1,680"
            ],
            [
              "Low Season (01 Dec – 29 Feb) · DBB · Standard Tent — single",
              "2,240"
            ],
            [
              "Low Season (01 Dec – 29 Feb) · Child 4–12",
              "840"
            ]
          ]
        }
      ]
    }
  },
  "etendeka-hiking-trails": {
    "2027": {
      "name": "Etendeka Hiking Trails",
      "region": "Kaokoland",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/etendeka_hiking_trails.html). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "Low Season (01 Jan – 30 Jun) · Full Board — per person sharing",
              "5,554"
            ],
            [
              "Low Season (01 Jan – 30 Jun) · Full Board — single",
              "6,902"
            ],
            [
              "High Season (01 Jul – 31 Dec) · Full Board — per person sharing",
              "6,795"
            ],
            [
              "High Season (01 Jul – 31 Dec) · Full Board — single",
              "8,606"
            ],
            [
              "CESW Conservation Levy (per person per night, additional)",
              "290"
            ]
          ]
        }
      ]
    }
  },
  "etendeka-mountain-camp": {
    "2027": {
      "name": "Etendeka Mountain Camp",
      "region": "Kaokoland",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/etendeka_mountain_camp.html). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "Low Season (1 Jan – 30 Jun) · Per Person Sharing",
              "5,066"
            ],
            [
              "Low Season (1 Jan – 30 Jun) · Single",
              "6,298"
            ],
            [
              "Low Season (1 Jan – 30 Jun) · Conservation Levy (pppn)",
              "290"
            ],
            [
              "High Season (1 Jul – 31 Dec) · Per Person Sharing",
              "5,894"
            ],
            [
              "High Season (1 Jul – 31 Dec) · Single",
              "7,463"
            ],
            [
              "High Season (1 Jul – 31 Dec) · Conservation Levy (pppn)",
              "290"
            ],
            [
              "Low — ≤3 pax (25% off)",
              "3,800"
            ],
            [
              "Low — 4+ pax (50% off)",
              "2,533"
            ],
            [
              "High — ≤3 pax (25% off)",
              "4,421"
            ],
            [
              "High — 4+ pax (50% off)",
              "2,947"
            ]
          ]
        }
      ]
    }
  },
  "wilderness-serra-cafema": {
    "2027": {
      "name": "Wilderness Serra Cafema",
      "region": "Kaokoland",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/wilderness_serra_cafema.html). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "06 Jan – 31 Mar · Fully Inclusive — per person sharing",
              "16,640"
            ],
            [
              "06 Jan – 31 Mar · Fully Inclusive — single",
              "21,602"
            ],
            [
              "01 Apr – 31 May · Fully Inclusive — per person sharing",
              "16,764"
            ],
            [
              "01 Apr – 31 May · Fully Inclusive — single",
              "21,764"
            ],
            [
              "01 Jun – 31 Oct · Fully Inclusive — per person sharing",
              "27,735"
            ],
            [
              "01 Jun – 31 Oct · Fully Inclusive — single",
              "36,006"
            ],
            [
              "01 Nov – 19 Dec · Fully Inclusive — per person sharing",
              "16,764"
            ],
            [
              "01 Nov – 19 Dec · Fully Inclusive — single",
              "21,764"
            ],
            [
              "20 Dec – 05 Jan · Fully Inclusive — per person sharing",
              "27,735"
            ],
            [
              "20 Dec – 05 Jan · Fully Inclusive — single",
              "36,006"
            ]
          ]
        }
      ]
    }
  },
  "mile-108": {
    "2027": {
      "name": "Mile 108",
      "region": "Skeleton Coast",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/originals/nwr/nwr_mile108.pdf). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "Low Season (01 Nov – 30 Jun) · Campsite — per person camping",
              "171"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Campsite — per person camping",
              "171"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Fisherman Chalet (max Bed only — bed only",
              "432"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Fisherman Chalet (max Bed only — bed only",
              "432"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Self-contained Campsites (max — per person camping",
              "279"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Self-contained Campsites (max — per person camping",
              "279"
            ]
          ]
        }
      ]
    }
  },
  "shipwreck-lodge": {
    "2027": {
      "name": "Shipwreck Lodge",
      "region": "Skeleton Coast",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/shipwreck_lodge.html). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "Green Season (10 Jan – 31 Mar) · FI — per person sharing",
              "15,260"
            ],
            [
              "Shoulder Season (01 Apr – 30 Apr & 01 Jun – 30 Jun & 01 Nov – 19 Dec) · FI — per person sharing",
              "18,991"
            ],
            [
              "High Shoulder Season (01 May – 31 May) · FI — per person sharing",
              "20,433"
            ],
            [
              "High Season (01 Sep – 31 Oct & 20 Dec – 09 Jan) · FI — per person sharing",
              "22,807"
            ],
            [
              "Peak Season (01 Jul – 31 Aug) · FI — per person sharing",
              "25,605"
            ],
            [
              "Green Season (10 Jan – 31 Mar) · FI — single",
              "21,365"
            ],
            [
              "Shoulder Season (01 Apr – 30 Apr & 01 Jun – 30 Jun & 01 Nov – 19 Dec) · FI — single",
              "26,589"
            ],
            [
              "High Shoulder Season (01 May – 31 May) · FI — single",
              "28,607"
            ],
            [
              "High Season (01 Sep – 31 Oct & 20 Dec – 09 Jan) · FI — single",
              "31,931"
            ],
            [
              "Peak Season (01 Jul – 31 Aug) · FI — single",
              "35,849"
            ]
          ]
        }
      ]
    }
  },
  "terrace-bay-resort": {
    "2027": {
      "name": "Terrace Bay Resort",
      "region": "Skeleton Coast",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/originals/nwr/nwr_terracebay.pdf). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "Low Season (01 Nov – 30 Jun) · Double room (2 beds) DBB — per person sharing",
              "1,566"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Double room (2 beds) DBB — per person sharing",
              "1,188"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Double room (2 beds) DBB — single",
              "1,746"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Double room (2 beds) DBB — single",
              "1,377"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Beach chalet (8 beds) - min Bed only — bed only",
              "1,386"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Beach chalet (8 beds) - min Bed only — bed only",
              "864"
            ]
          ]
        }
      ]
    }
  },
  "desert-camp": {
    "2027": {
      "name": "Desert Camp",
      "region": "Sossusvlei",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/desert_camp.html). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "High Season · DBB — per person sharing",
              "2,126.25"
            ],
            [
              "High Season · DBB — single",
              "2,861.50"
            ],
            [
              "Low Season · DBB — per person sharing",
              "2,011.50"
            ],
            [
              "Low Season · DBB — single",
              "2,691.50"
            ],
            [
              "High Season · B&B — per person sharing",
              "1,666.25"
            ],
            [
              "High Season · B&B — single",
              "2,401.50"
            ],
            [
              "Low Season · B&B — per person sharing",
              "1,551.50"
            ],
            [
              "Low Season · B&B — single",
              "2,231.50"
            ],
            [
              "High Season · Room Only (self-catering) — per person sharing",
              "1,466.25"
            ],
            [
              "High Season · Room Only (self-catering) — single",
              "2,201.50"
            ],
            [
              "Low Season · Room Only (self-catering) — per person sharing",
              "1,351.50"
            ],
            [
              "Low Season · Room Only (self-catering) — single",
              "2,031.50"
            ],
            [
              "Breakfast",
              "200"
            ],
            [
              "Lunch",
              "290"
            ],
            [
              "Lunch Pack",
              "150"
            ],
            [
              "Dinner",
              "460"
            ],
            [
              "Sundowner / Nature Drive (lodge property)",
              "550"
            ],
            [
              "Elim Dune Nature Walk",
              "845"
            ],
            [
              "Sesriem Canyon Excursion",
              "695"
            ],
            [
              "Sossusvlei & Dead Vlei Excursion",
              "1,490"
            ]
          ]
        }
      ]
    }
  },
  "desert-hills-lodge": {
    "2027": {
      "name": "Desert Hills Lodge",
      "region": "Sossusvlei",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/desert_hills_lodge.html). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "Low Season (01 Mar – 30 Apr & 01 Dec – 28 Feb) · DBB — Luxury Chalet (per room, 1–2 guests)",
              "6,740"
            ],
            [
              "High Season (01 May – 30 Nov) · DBB — Luxury Chalet (per room, 1–2 guests)",
              "7,190"
            ],
            [
              "Low Season (01 Mar – 30 Apr & 01 Dec – 28 Feb) · Additional child 7–12 (sharing)",
              "1,690"
            ],
            [
              "High Season (01 May – 30 Nov) · Additional child 7–12 (sharing)",
              "1,800"
            ]
          ]
        }
      ]
    }
  },
  "desert-homestead-lodge": {
    "2027": {
      "name": "Desert Homestead Lodge",
      "region": "Sossusvlei",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/desert_homestead_lodge.html). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "High Season (01 Mar – 30 Nov) · DBB · Chalet — per person sharing",
              "2,800"
            ],
            [
              "High Season (01 Mar – 30 Nov) · DBB · Chalet — single",
              "3,680"
            ],
            [
              "High Season (01 Mar – 30 Nov) · Child 4–12",
              "1,400"
            ],
            [
              "Tour Guide (Guide Room)",
              "990"
            ],
            [
              "Low Season (01 Dec – 29 Feb) · DBB · Chalet — per person sharing",
              "2,080"
            ],
            [
              "Low Season (01 Dec – 29 Feb) · DBB · Chalet — single",
              "2,640"
            ],
            [
              "Low Season (01 Dec – 29 Feb) · Child 4–12",
              "1,040"
            ]
          ]
        }
      ]
    }
  },
  "desert-quiver-camp": {
    "2027": {
      "name": "Desert Quiver Camp",
      "region": "Sossusvlei",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/desert_quiver_camp.html). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "High Season · DBB — per person sharing",
              "2,126.25"
            ],
            [
              "High Season · DBB — single",
              "2,861.50"
            ],
            [
              "Low Season · DBB — per person sharing",
              "2,011.50"
            ],
            [
              "Low Season · DBB — single",
              "2,691.50"
            ],
            [
              "High Season · B&B — per person sharing",
              "1,666.25"
            ],
            [
              "High Season · B&B — single",
              "2,401.50"
            ],
            [
              "Low Season · B&B — per person sharing",
              "1,551.50"
            ],
            [
              "Low Season · B&B — single",
              "2,231.50"
            ],
            [
              "High Season · Room Only (self-catering) — per person sharing",
              "1,466.25"
            ],
            [
              "High Season · Room Only (self-catering) — single",
              "2,201.50"
            ],
            [
              "Low Season · Room Only (self-catering) — per person sharing",
              "1,351.50"
            ],
            [
              "Low Season · Room Only (self-catering) — single",
              "2,031.50"
            ],
            [
              "Breakfast",
              "200"
            ],
            [
              "Lunch",
              "290"
            ],
            [
              "Lunch Pack",
              "150"
            ],
            [
              "Dinner",
              "460"
            ],
            [
              "Sundowner / Nature Drive (lodge property)",
              "550"
            ],
            [
              "Elim Dune Nature Walk",
              "845"
            ],
            [
              "Sesriem Canyon Excursion",
              "695"
            ],
            [
              "Sossusvlei & Dead Vlei Excursion",
              "1,490"
            ]
          ]
        }
      ]
    }
  },
  "desert-whisper": {
    "2027": {
      "name": "Desert Whisper",
      "region": "Sossusvlei",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/originals/gondwana/gondwana_p16.pdf). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "Fully inclusive (per room, max 2)",
              "26,400"
            ]
          ]
        }
      ]
    }
  },
  "hammerstein-lodge": {
    "2027": {
      "name": "Hammerstein Lodge",
      "region": "Sossusvlei",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/hammerstein_lodge.html). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "Low Season (01 Mar – 30 Apr & 01 Dec – 28 Feb) · DBB — Standard Room (per room, 1–2 guests)",
              "2,100"
            ],
            [
              "High Season (01 May – 30 Nov) · DBB — Standard Room (per room, 1–2 guests)",
              "2,260"
            ],
            [
              "Low Season (01 Mar – 30 Apr & 01 Dec – 28 Feb) · Additional child 7–12 (sharing)",
              "590"
            ],
            [
              "High Season (01 May – 30 Nov) · Additional child 7–12 (sharing)",
              "640"
            ],
            [
              "Camping · Per campsite (up to 4 pax)",
              "470"
            ],
            [
              "Camping · Additional camper (per person, max 6)",
              "260"
            ]
          ]
        }
      ]
    }
  },
  "namib-desert-lodge": {
    "2027": {
      "name": "Namib Desert Lodge",
      "region": "Sossusvlei",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/originals/gondwana/gondwana_p13.pdf). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "Room B&B — per person sharing",
              "2,033.60"
            ],
            [
              "Room B&B — single",
              "2,542"
            ],
            [
              "Camping2Go (bed only) — per person sharing",
              "920"
            ],
            [
              "Camping2Go (bed only) — single",
              "1,840"
            ],
            [
              "Campsite — per person per night",
              "324"
            ],
            [
              "Tour Guide Room (DBB)",
              "793"
            ]
          ]
        }
      ]
    }
  },
  "namib-dune-star-camp": {
    "2027": {
      "name": "Namib Dune Star Camp",
      "region": "Sossusvlei",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/originals/gondwana/gondwana_p14.pdf). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "Room B&B — per person sharing (one-night stay)",
              "2,955.20"
            ],
            [
              "Room B&B — single (one-night stay)",
              "3,694"
            ],
            [
              "Tour Guide Room (DBB)",
              "793"
            ]
          ]
        }
      ]
    }
  },
  "naukluft-camp": {
    "2027": {
      "name": "Naukluft Camp",
      "region": "Sossusvlei",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/originals/nwr/nwr_naukluft.pdf). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "Low Season (01 Nov – 30 Jun) · Campsite — per person camping",
              "414"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Campsite — per person camping",
              "414"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Bush chalet (2 beds) BB — per person sharing",
              "1,305"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Bush chalet (2 beds) BB — per person sharing",
              "1,800"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Bush chalet (2 beds) BB — single",
              "1,548"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Bush chalet (2 beds) BB — single",
              "2,052"
            ]
          ]
        }
      ]
    }
  },
  "reverie-kalahari-pod": {
    "2027": {
      "name": "Reverie Kalahari Pod",
      "region": "Sossusvlei",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/originals/gondwana/gondwana_p08.pdf). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "Fully inclusive (per room, max 2)",
              "26,400"
            ]
          ]
        }
      ]
    }
  },
  "sesriem-campsite": {
    "2027": {
      "name": "Sesriem Campsite",
      "region": "Sossusvlei",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/originals/nwr/nwr_sesriem.pdf). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "Low Season (01 Nov – 30 Jun) · Campsite — per person camping",
              "603"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Campsite — per person camping",
              "603"
            ]
          ]
        }
      ]
    }
  },
  "sossus-dune-lodge": {
    "2027": {
      "name": "Sossus Dune Lodge",
      "region": "Sossusvlei",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/originals/nwr/nwr_sossusdune.pdf). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "Low Season (01 Nov – 30 Jun) · Dune chalet (2 beds) DBB — per person sharing",
              "3,627"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Dune chalet (2 beds) DBB — per person sharing",
              "6,300"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Dune chalet (2 beds) DBB — single",
              "3,960"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Dune chalet (2 beds) DBB — single",
              "6,642"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Honeymoon chalets (double bed) DBB — per person sharing",
              "4,131"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Honeymoon chalets (double bed) DBB — per person sharing",
              "6,957"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Honeymoon chalets (double bed) DBB — single",
              "4,464"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Honeymoon chalets (double bed) DBB — single",
              "7,299"
            ]
          ]
        }
      ]
    }
  },
  "sossus-oasis-campsite": {
    "2027": {
      "name": "Sossus Oasis Campsite",
      "region": "Sossusvlei",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/sossus_oasis_campsite.html). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "Camping — per adult per night",
              "306"
            ],
            [
              "Camping — per child (5–11 yrs)",
              "153"
            ]
          ]
        }
      ]
    }
  },
  "sossusvlei-lodge": {
    "2027": {
      "name": "Sossusvlei Lodge",
      "region": "Sossusvlei",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/sossusvlei_lodge.html). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "High Season · Superior Room DBB — per person sharing",
              "3,636"
            ],
            [
              "High Season · Superior Room DBB — single",
              "5,456"
            ],
            [
              "Low Season · Superior Room DBB — per person sharing",
              "2,716"
            ],
            [
              "Low Season · Superior Room DBB — single",
              "4,080"
            ],
            [
              "High Season · Standard Room DBB — per person sharing",
              "3,124"
            ],
            [
              "High Season · Standard Room DBB — single",
              "4,688"
            ],
            [
              "Low Season · Standard Room DBB — per person sharing",
              "2,324"
            ],
            [
              "Low Season · Standard Room DBB — single",
              "3,488"
            ],
            [
              "High Season · Junior Suite DBB (per room)",
              "10,912"
            ],
            [
              "Low Season · Junior Suite DBB (per room)",
              "10,312"
            ],
            [
              "Sundowner / Nature Drive (lodge property)",
              "550"
            ],
            [
              "Elim Dune Nature Walk",
              "845"
            ],
            [
              "Sesriem Canyon Excursion",
              "695"
            ],
            [
              "Sossusvlei & Dead Vlei Excursion",
              "1,490"
            ],
            [
              "Sundowner / Nature Drive (min 2 pax) — per person",
              "550"
            ],
            [
              "Elim Dune Nature Walk (min 2 pax) — per person",
              "845"
            ],
            [
              "Sossusvlei & Dead Vlei excursion (min 4 pax) — per person",
              "1,490"
            ],
            [
              "Sesriem Canyon excursion (min 4 pax) — per person",
              "695"
            ]
          ]
        }
      ]
    }
  },
  "the-desert-grace": {
    "2027": {
      "name": "The Desert Grace",
      "region": "Sossusvlei",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/originals/gondwana/gondwana_p15.pdf). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "Room B&B — per person sharing",
              "4,744"
            ],
            [
              "Room B&B — single",
              "5,930"
            ],
            [
              "Tour Guide Room (DBB)",
              "793"
            ]
          ]
        }
      ]
    }
  },
  "the-pearls-beach-pods": {
    "2027": {
      "name": "The Pearls Beach Pods",
      "region": "Sossusvlei",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/originals/gondwana/gondwana_p19.pdf). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "The Jetty — F&B inclusive (per room, max 2)",
              "24,200"
            ],
            [
              "The Jetty — additional room (2 rooms)",
              "14,520"
            ],
            [
              "The Jetty — additional room (3 rooms)",
              "9,680"
            ],
            [
              "The Mole — F&B inclusive (per room, max 2)",
              "24,200"
            ],
            [
              "The Mole — additional room (2 rooms)",
              "14,520"
            ]
          ]
        }
      ]
    }
  },
  "we-kebi-safari-lodge": {
    "2027": {
      "name": "We Kebi Safari Lodge",
      "region": "Sossusvlei",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/we_kebi_safari_lodge.html). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "Low Season (01 Mar – 30 Apr & 01 Dec – 28 Feb) · DBB — Luxury Chalet (per room, 1–2 guests)",
              "4,220"
            ],
            [
              "High Season (01 May – 30 Nov) · DBB — Luxury Chalet (per room, 1–2 guests)",
              "4,490"
            ],
            [
              "Low Season (01 Mar – 30 Apr & 01 Dec – 28 Feb) · Additional child 7–12 (sharing)",
              "1,060"
            ],
            [
              "High Season (01 May – 30 Nov) · Additional child 7–12 (sharing)",
              "1,130"
            ]
          ]
        }
      ]
    }
  },
  "wilderness-kulala-desert-lodge": {
    "2027": {
      "name": "Wilderness Kulala Desert Lodge",
      "region": "Sossusvlei",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/wilderness_kulala_desert_lodge.html). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "06 Jan – 31 Mar · Fully Inclusive — per person sharing",
              "6,292"
            ],
            [
              "06 Jan – 31 Mar · Fully Inclusive — single",
              "8,168"
            ],
            [
              "01 Apr – 31 May · Fully Inclusive — per person sharing",
              "7,542"
            ],
            [
              "01 Apr – 31 May · Fully Inclusive — single",
              "9,791"
            ],
            [
              "01 Jun – 31 Oct · Fully Inclusive — per person sharing",
              "10,729"
            ],
            [
              "01 Jun – 31 Oct · Fully Inclusive — single",
              "13,929"
            ],
            [
              "01 Nov – 19 Dec · Fully Inclusive — per person sharing",
              "7,542"
            ],
            [
              "01 Nov – 19 Dec · Fully Inclusive — single",
              "9,791"
            ],
            [
              "20 Dec – 05 Jan · Fully Inclusive — per person sharing",
              "10,076"
            ],
            [
              "20 Dec – 05 Jan · Fully Inclusive — single",
              "13,081"
            ],
            [
              "06 Jan – 31 Mar · DBB — per person sharing",
              "3,873"
            ],
            [
              "06 Jan – 31 Mar · DBB — single",
              "5,028"
            ],
            [
              "01 Apr – 31 May · DBB — per person sharing",
              "4,902"
            ],
            [
              "01 Apr – 31 May · DBB — single",
              "6,364"
            ],
            [
              "01 Jun – 31 Oct · DBB — per person sharing",
              "7,699"
            ],
            [
              "01 Jun – 31 Oct · DBB — single",
              "9,995"
            ],
            [
              "01 Nov – 19 Dec · DBB — per person sharing",
              "5,005"
            ],
            [
              "01 Nov – 19 Dec · DBB — single",
              "6,497"
            ],
            [
              "20 Dec – 05 Jan · DBB — per person sharing",
              "5,421"
            ],
            [
              "20 Dec – 05 Jan · DBB — single",
              "7,038"
            ]
          ]
        }
      ]
    }
  },
  "wilderness-little-kulala": {
    "2027": {
      "name": "Wilderness Little Kulala",
      "region": "Sossusvlei",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/wilderness_little_kulala.html). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "06 Jan – 31 Mar · Fully Inclusive — per person sharing",
              "15,618"
            ],
            [
              "06 Jan – 31 Mar · Fully Inclusive — single",
              "20,276"
            ],
            [
              "01 Apr – 31 May · Fully Inclusive — per person sharing",
              "16,181"
            ],
            [
              "01 Apr – 31 May · Fully Inclusive — single",
              "21,006"
            ],
            [
              "01 Jun – 31 Oct · Fully Inclusive — per person sharing",
              "25,690"
            ],
            [
              "01 Jun – 31 Oct · Fully Inclusive — single",
              "33,351"
            ],
            [
              "01 Nov – 19 Dec · Fully Inclusive — per person sharing",
              "16,181"
            ],
            [
              "01 Nov – 19 Dec · Fully Inclusive — single",
              "21,006"
            ],
            [
              "20 Dec – 05 Jan · Fully Inclusive — per person sharing",
              "25,690"
            ],
            [
              "20 Dec – 05 Jan · Fully Inclusive — single",
              "33,351"
            ]
          ]
        }
      ]
    }
  },
  "wolwedans-boulders-camp": {
    "2027": {
      "name": "Wolwedans Boulders Camp",
      "region": "Sossusvlei",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/wolwedans_boulders_camp.html). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "Per person sharing (FI, 01 Apr – 15 Nov)",
              "16,760"
            ],
            [
              "Child sharing",
              "4,200"
            ],
            [
              "Exclusive use — whole camp (per night)",
              "100,560"
            ],
            [
              "Guide / Pilot (per night)",
              "2,625"
            ],
            [
              "Guided Nature Walk — Morning",
              "895"
            ],
            [
              "Sunset Drive with drinks",
              "1,315"
            ],
            [
              "Half-day Scenic Drive (6 hrs)",
              "2,625"
            ],
            [
              "Adopt & Plant a Tree",
              "5,775"
            ],
            [
              "Adopt a Fairy Circle",
              "1,315"
            ],
            [
              "E-Biking Full Day with picnic lunch (6 hrs, min 2) — per person",
              "2,625"
            ],
            [
              "Adopt & Plant a Tree — per person",
              "5,775"
            ],
            [
              "Adopt a Fairy Circle — per person",
              "1,315"
            ],
            [
              "Dune Bush Dining Experience – morning (first 2 guests)",
              "1,575"
            ],
            [
              "Dining Under the Stars Experience – evening (first 2 guests)",
              "1,945"
            ]
          ]
        }
      ]
    }
  },
  "wolwedans-dune-camp": {
    "2027": {
      "name": "Wolwedans Dune Camp",
      "region": "Sossusvlei",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/wolwedans_dune_camp.html). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "Green Season · Standard Tent — per person sharing (FI)",
              "11,920"
            ],
            [
              "High Season · Standard Tent — per person sharing (FI)",
              "12,520"
            ],
            [
              "Green Season · additional child",
              "3,000"
            ],
            [
              "High Season · additional child",
              "3,150"
            ],
            [
              "Dune Family Suite — exclusive (per unit) · Green",
              "47,680"
            ],
            [
              "Dune Family Suite — exclusive (per unit) · High",
              "50,080"
            ],
            [
              "Guide / Pilot (per night)",
              "2,625"
            ],
            [
              "Guided Nature Walk — Morning",
              "895"
            ],
            [
              "Sunset Drive with drinks",
              "1,315"
            ],
            [
              "Half-day Scenic Drive (6 hrs)",
              "2,625"
            ],
            [
              "Adopt & Plant a Tree",
              "5,775"
            ],
            [
              "Adopt a Fairy Circle",
              "1,315"
            ],
            [
              "E-Biking Full Day with picnic lunch (6 hrs, min 2) — per person",
              "2,625"
            ],
            [
              "Adopt & Plant a Tree — per person",
              "5,775"
            ],
            [
              "Adopt a Fairy Circle — per person",
              "1,315"
            ],
            [
              "Dune Bush Dining Experience – morning (first 2 guests)",
              "1,575"
            ],
            [
              "Dining Under the Stars Experience – evening (first 2 guests)",
              "1,945"
            ],
            [
              "Horse Riding – Morning (2 hrs) — per person",
              "895"
            ],
            [
              "Horse Riding – Sunset with drinks (3 hrs, min 2) — per person",
              "1,315"
            ],
            [
              "Horse Riding – Full Day with picnic (6 hrs, min 2) — per person",
              "2,625"
            ],
            [
              "Desert Sleepout – Sundowner + Sunrise Overnight (min 2) — per person",
              "2,625"
            ],
            [
              "Namib Sky Ballooning (min 2) — per person",
              "10,720"
            ],
            [
              "Shared transfer to Kwessie/Geluk (min 2) — per person",
              "2,395"
            ]
          ]
        }
      ]
    }
  },
  "wolwedans-mountain-view-suite": {
    "2027": {
      "name": "Wolwedans Mountain View Suite",
      "region": "Sossusvlei",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/wolwedans_mountain_view_suite.html). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "Per person sharing (FI)",
              "16,760"
            ],
            [
              "Child sharing",
              "4,200"
            ],
            [
              "Guide / Pilot (per night)",
              "2,625"
            ],
            [
              "Guided Nature Walk — Morning",
              "895"
            ],
            [
              "Sunset Drive with drinks",
              "1,315"
            ],
            [
              "Half-day Scenic Drive (6 hrs)",
              "2,625"
            ],
            [
              "Adopt & Plant a Tree",
              "5,775"
            ],
            [
              "Adopt a Fairy Circle",
              "1,315"
            ],
            [
              "E-Biking Full Day with picnic lunch (6 hrs, min 2) — per person",
              "2,625"
            ],
            [
              "Adopt & Plant a Tree — per person",
              "5,775"
            ],
            [
              "Adopt a Fairy Circle — per person",
              "1,315"
            ],
            [
              "Dune Bush Dining Experience – morning (first 2 guests)",
              "1,575"
            ],
            [
              "Dining Under the Stars Experience – evening (first 2 guests)",
              "1,945"
            ],
            [
              "Horse Riding – Morning (2 hrs) — per person",
              "895"
            ],
            [
              "Horse Riding – Sunset with drinks (3 hrs, min 2) — per person",
              "1,315"
            ],
            [
              "Horse Riding – Full Day with picnic (6 hrs, min 2) — per person",
              "2,625"
            ],
            [
              "Desert Sleepout – Sundowner + Sunrise Overnight (min 2) — per person",
              "2,625"
            ],
            [
              "Namib Sky Ballooning (min 2) — per person",
              "10,720"
            ],
            [
              "Shared transfer to Kwessie/Geluk (min 2) — per person",
              "2,395"
            ]
          ]
        }
      ]
    }
  },
  "wolwedans-plains-camp": {
    "2027": {
      "name": "Wolwedans Plains Camp",
      "region": "Sossusvlei",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/wolwedans_plains_camp.html). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "Per person sharing (FI)",
              "16,760"
            ],
            [
              "Child sharing",
              "4,200"
            ],
            [
              "Exclusive use — whole camp (per night)",
              "67,040"
            ],
            [
              "Guide / Pilot (per night)",
              "2,625"
            ],
            [
              "Guided Nature Walk — Morning",
              "895"
            ],
            [
              "Sunset Drive with drinks",
              "1,315"
            ],
            [
              "Half-day Scenic Drive (6 hrs)",
              "2,625"
            ],
            [
              "Adopt & Plant a Tree",
              "5,775"
            ],
            [
              "Adopt a Fairy Circle",
              "1,315"
            ],
            [
              "E-Biking Full Day with picnic lunch (6 hrs, min 2) — per person",
              "2,625"
            ],
            [
              "Adopt & Plant a Tree — per person",
              "5,775"
            ],
            [
              "Adopt a Fairy Circle — per person",
              "1,315"
            ],
            [
              "Dune Bush Dining Experience – morning (first 2 guests)",
              "1,575"
            ],
            [
              "Dining Under the Stars Experience – evening (first 2 guests)",
              "1,945"
            ],
            [
              "Horse Riding – Morning (2 hrs) — per person",
              "895"
            ],
            [
              "Horse Riding – Sunset with drinks (3 hrs, min 2) — per person",
              "1,315"
            ],
            [
              "Horse Riding – Full Day with picnic (6 hrs, min 2) — per person",
              "2,625"
            ],
            [
              "Desert Sleepout – Sundowner + Sunrise Overnight (min 2) — per person",
              "2,625"
            ],
            [
              "Namib Sky Ballooning (min 2) — per person",
              "10,720"
            ],
            [
              "Shared transfer to Kwessie/Geluk (min 2) — per person",
              "2,395"
            ]
          ]
        }
      ]
    }
  },
  "etosha-oberland-lodge": {
    "2027": {
      "name": "Etosha Oberland Lodge",
      "region": "South Etosha",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/etosha_oberland_lodge.html). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "High Season (01 Mar – 30 Nov) · Full Board Plus · Suite — per person sharing",
              "7,056"
            ],
            [
              "High Season (01 Mar – 30 Nov) · Full Board Plus · Suite — single",
              "9,200"
            ],
            [
              "High Season (01 Mar – 30 Nov) · Child 4–12",
              "3,528"
            ],
            [
              "Tour Guide (Guide Room)",
              "1,190"
            ],
            [
              "Low Season (01 Dec – 29 Feb) · Full Board Plus · Suite — per person sharing",
              "5,800"
            ],
            [
              "Low Season (01 Dec – 29 Feb) · Full Board Plus · Suite — single",
              "7,560"
            ],
            [
              "Low Season (01 Dec – 29 Feb) · Child 4–12",
              "2,900"
            ]
          ]
        }
      ]
    }
  },
  "etosha-omusati-lodge": {
    "2027": {
      "name": "Etosha Omusati Lodge",
      "region": "South Etosha",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/etosha_omusati_lodge.html). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "Low Season (01 Mar – 30 Apr & 01 Dec – 28 Feb) · DBB — Bush Chalet/Bungalow (per room, 1–2 guests)",
              "2,870"
            ],
            [
              "High Season (01 May – 30 Nov) · DBB — Bush Chalet/Bungalow (per room, 1–2 guests)",
              "3,060"
            ],
            [
              "Low Season (01 Mar – 30 Apr & 01 Dec – 28 Feb) · Additional child 7–12 (sharing)",
              "760"
            ],
            [
              "High Season (01 May – 30 Nov) · Additional child 7–12 (sharing)",
              "820"
            ],
            [
              "Camping · Per campsite (up to 4 pax)",
              "470"
            ],
            [
              "Camping · Additional camper (per person, max 6)",
              "260"
            ]
          ]
        }
      ]
    }
  },
  "etosha-safari-camping2go": {
    "2027": {
      "name": "Etosha Safari Camping2Go",
      "region": "South Etosha",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/originals/gondwana/gondwana_p25.pdf). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "Camping2Go (bed only) — per person sharing",
              "920"
            ],
            [
              "Camping2Go (bed only) — single",
              "1,840"
            ]
          ]
        }
      ]
    }
  },
  "etosha-safari-lodge": {
    "2027": {
      "name": "Etosha Safari Lodge",
      "region": "South Etosha",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/originals/gondwana/gondwana_p23.pdf). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "Room B&B — per person sharing",
              "2,976.80"
            ],
            [
              "Room B&B — single",
              "3,721"
            ],
            [
              "Tour Guide Room (DBB)",
              "793"
            ]
          ]
        }
      ]
    }
  },
  "etosha-trading-post-campsite": {
    "2027": {
      "name": "Etosha Trading Post Campsite",
      "region": "South Etosha",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/etosha_trading_post_campsite.html). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "Camping — per adult per night",
              "306"
            ],
            [
              "Camping — per child (5–11 yrs)",
              "153"
            ]
          ]
        }
      ]
    }
  },
  "etosha-village": {
    "2027": {
      "name": "Etosha Village",
      "region": "South Etosha",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/etosha_village.html). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "High Season · DBB — per person sharing",
              "2,216"
            ],
            [
              "High Season · DBB — single",
              "3,328"
            ],
            [
              "Low Season · DBB — per person sharing",
              "1,980"
            ],
            [
              "Low Season · DBB — single",
              "2,972"
            ],
            [
              "Breakfast",
              "200"
            ],
            [
              "Lunch",
              "290"
            ],
            [
              "Lunch Pack",
              "150"
            ],
            [
              "Dinner",
              "460"
            ],
            [
              "Morning Game Drive (Etosha)",
              "1,520"
            ],
            [
              "Full Day Game Drive (Etosha)",
              "1,810"
            ],
            [
              "Sundowner Drive",
              "550"
            ],
            [
              "Sunrise Guided Walk",
              "520"
            ],
            [
              "Stargazing (guided)",
              "440"
            ],
            [
              "Etosha NP Morning Game Drive (min 4 pax) — per person",
              "1,520"
            ],
            [
              "Etosha NP Full Day Game Drive (min 4 pax) — per person",
              "1,810"
            ],
            [
              "Sundowner Drive – private reserve (min 4 pax) — per person",
              "550"
            ],
            [
              "Sunrise Guided Walk (min 2 pax, max 8) — per person",
              "520"
            ],
            [
              "Stargazing – seasonal (min 2 pax) — per person",
              "440"
            ]
          ]
        }
      ]
    }
  },
  "etosha-village-campsite": {
    "2027": {
      "name": "Etosha Village Campsite",
      "region": "South Etosha",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/etosha_village_campsite.html). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "Camping — per adult per night",
              "306"
            ],
            [
              "Camping — per child (5–11 yrs)",
              "153"
            ],
            [
              "Morning Game Drive (Etosha)",
              "1,520"
            ],
            [
              "Full Day Game Drive (Etosha)",
              "1,810"
            ],
            [
              "Sundowner Drive",
              "550"
            ],
            [
              "Sunrise Guided Walk",
              "520"
            ],
            [
              "Stargazing (guided)",
              "440"
            ]
          ]
        }
      ]
    }
  },
  "okaukuejo-camp": {
    "2027": {
      "name": "Okaukuejo Camp",
      "region": "South Etosha",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/originals/nwr/nwr_okaukuejo.pdf). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "Low Season (01 Nov – 30 Jun) · Campsite — per person camping",
              "414"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Campsite — per person camping",
              "504"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Double room A (2 beds) BB — per person sharing",
              "1,710"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Double room A (2 beds) BB — per person sharing",
              "2,142"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Double room A (2 beds) BB — single",
              "1,917"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Double room A (2 beds) BB — single",
              "2,493"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Double room B (2 beds) BB — per person sharing",
              "1,710"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Double room B (2 beds) BB — per person sharing",
              "2,142"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Double room B (2 beds) BB — single",
              "1,917"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Double room B (2 beds) BB — single",
              "2,493"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Bush chalet (2 beds, disabled access) BB — per person sharing",
              "1,710"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Bush chalet (2 beds, disabled access) BB — per person sharing",
              "2,277"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Bush chalet (2 beds, disabled access) BB — single",
              "1,917"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Bush chalet (2 beds, disabled access) BB — single",
              "2,637"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Bush chalet (2 beds) BB — per person sharing",
              "1,989"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Bush chalet (2 beds) BB — per person sharing",
              "2,412"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Bush chalet (2 beds) BB — single",
              "2,205"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Bush chalet (2 beds) BB — single",
              "2,781"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Family chalet (4 beds) - min BB — per person sharing",
              "1,917"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Family chalet (4 beds) - min BB — per person sharing",
              "2,565"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Waterhole chalet (2 beds) BB — per person sharing",
              "2,142"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Waterhole chalet (2 beds) BB — per person sharing",
              "3,132"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Waterhole chalet (2 beds) BB — single",
              "2,358"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Waterhole chalet (2 beds) BB — single",
              "3,483"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Premier Waterhole Chalet (double BB — per person sharing",
              "3,564"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Premier Waterhole Chalet (double BB — per person sharing",
              "5,337"
            ]
          ]
        }
      ]
    }
  },
  "okutala-etosha-lodge": {
    "2027": {
      "name": "Okutala Etosha Lodge",
      "region": "South Etosha",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/okutala_etosha_lodge_ratesheet_v3.html). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "Season 1 (01 Jan – 31 Mar) · Hilltop Chalet DBB — per person sharing",
              "2,252"
            ],
            [
              "Season 1 (01 Jan – 31 Mar) · Hilltop Chalet DBB — single",
              "2,592"
            ],
            [
              "Season 2 (01 Apr – 31 Dec) · Hilltop Chalet DBB — per person sharing",
              "2,816"
            ],
            [
              "Season 2 (01 Apr – 31 Dec) · Hilltop Chalet DBB — single",
              "3,236"
            ],
            [
              "Season 1 (01 Jan – 31 Mar) · Lodge Luxury Room DBB — per person sharing",
              "2,252"
            ],
            [
              "Season 1 (01 Jan – 31 Mar) · Lodge Luxury Room DBB — single",
              "2,592"
            ],
            [
              "Season 2 (01 Apr – 31 Dec) · Lodge Luxury Room DBB — per person sharing",
              "2,816"
            ],
            [
              "Season 2 (01 Apr – 31 Dec) · Lodge Luxury Room DBB — single",
              "3,236"
            ],
            [
              "Season 1 (01 Jan – 31 Mar) · King Suite DBB — per person sharing",
              "2,880"
            ],
            [
              "Season 1 (01 Jan – 31 Mar) · King Suite DBB — single",
              "3,360"
            ],
            [
              "Season 2 (01 Apr – 31 Dec) · King Suite DBB — per person sharing",
              "3,360"
            ],
            [
              "Season 2 (01 Apr – 31 Dec) · King Suite DBB — single",
              "4,160"
            ],
            [
              "Guide Room (per guide)",
              "576"
            ],
            [
              "Light Lunch",
              "420"
            ],
            [
              "Lunch Pack",
              "200"
            ],
            [
              "Bush Picnic Lunch",
              "220"
            ],
            [
              "Etosha Day Tour (8 hrs) — per person",
              "1,755"
            ],
            [
              "Morning Game/Nature Drive (2 hrs) — per person",
              "684"
            ],
            [
              "Afternoon Game/Nature Drive (2 hrs) — per person",
              "684"
            ],
            [
              "Night Drive — per person",
              "765"
            ],
            [
              "Morning Hiking Tour — per person",
              "351"
            ],
            [
              "Afternoon Hiking Tour — per person",
              "351"
            ]
          ]
        }
      ]
    }
  },
  "olifantsrus-campsite": {
    "2027": {
      "name": "Olifantsrus Campsite",
      "region": "South Etosha",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/originals/nwr/nwr_olifantsrus.pdf). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "Low Season (01 Nov – 30 Jun) · Campsite — per person camping",
              "459"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Campsite — per person camping",
              "459"
            ]
          ]
        }
      ]
    }
  },
  "onkoshi-camp": {
    "2027": {
      "name": "Onkoshi Camp",
      "region": "South Etosha",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/originals/nwr/nwr_onkoshi.pdf). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "Low Season (01 Nov – 30 Jun) · Onkoshi chalet (2 beds) DBB — per person sharing",
              "2,862"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Onkoshi chalet (2 beds) DBB — per person sharing",
              "3,888"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Onkoshi chalet (2 beds) DBB — single",
              "3,141"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Onkoshi chalet (2 beds) DBB — single",
              "4,167"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Onkoshi honeymoon chalets DBB — per person sharing",
              "3,204"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Onkoshi honeymoon chalets DBB — per person sharing",
              "4,590"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Onkoshi honeymoon chalets DBB — single",
              "3,492"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Onkoshi honeymoon chalets DBB — single",
              "4,860"
            ]
          ]
        }
      ]
    }
  },
  "the-ekipa-etosha-pod": {
    "2027": {
      "name": "The Ekipa Etosha Pod",
      "region": "South Etosha",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/originals/gondwana/gondwana_p24.pdf). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "Fully inclusive (per room, max 2)",
              "26,400"
            ]
          ]
        }
      ]
    }
  },
  "toshari-lodge": {
    "2027": {
      "name": "Toshari Lodge",
      "region": "South Etosha",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/toshari_lodge.html). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "Low Season (01 Jan – 31 Mar) · Bush Room — per person sharing",
              "1,335"
            ],
            [
              "Low Season (01 Jan – 31 Mar) · Bush Chalet — per person sharing",
              "1,475"
            ],
            [
              "Low Season (01 Jan – 31 Mar) · Bush Room — single",
              "1,800"
            ],
            [
              "Low Season (01 Jan – 31 Mar) · Bush Chalet — single",
              "2,010"
            ],
            [
              "Shoulder Season (01 Apr – 30 Jun & 01 – 31 Dec) · Bush Room — per person sharing",
              "1,435"
            ],
            [
              "Shoulder Season (01 Apr – 30 Jun & 01 – 31 Dec) · Bush Chalet — per person sharing",
              "1,550"
            ],
            [
              "Shoulder Season (01 Apr – 30 Jun & 01 – 31 Dec) · Bush Room — single",
              "1,930"
            ],
            [
              "Shoulder Season (01 Apr – 30 Jun & 01 – 31 Dec) · Bush Chalet — single",
              "2,120"
            ],
            [
              "High Season (01 Jul – 30 Nov) · Bush Room — per person sharing",
              "1,680"
            ],
            [
              "High Season (01 Jul – 30 Nov) · Bush Chalet — per person sharing",
              "1,775"
            ],
            [
              "High Season (01 Jul – 30 Nov) · Bush Room — single",
              "2,255"
            ],
            [
              "High Season (01 Jul – 30 Nov) · Bush Chalet — single",
              "2,440"
            ],
            [
              "Camping — per person",
              "290"
            ]
          ]
        }
      ]
    }
  },
  "ocean-house-guesthouse": {
    "2027": {
      "name": "Ocean House Guesthouse",
      "region": "Swakopmund",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/ocean_house_guesthouse.html). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "Low Season (01 Mar – 30 Apr & 01 Jan – 28 Feb) · DBB — Standard Room (per room, 1–2 guests)",
              "2,250"
            ],
            [
              "High Season (01 May – 31 Dec) · DBB — Standard Room (per room, 1–2 guests)",
              "2,390"
            ],
            [
              "Low Season (01 Mar – 30 Apr & 01 Jan – 28 Feb) · Additional child 7–12 (sharing)",
              "580"
            ],
            [
              "High Season (01 May – 31 Dec) · Additional child 7–12 (sharing)",
              "630"
            ]
          ]
        }
      ]
    }
  },
  "swakopmund-sands": {
    "2027": {
      "name": "Swakopmund Sands",
      "region": "Swakopmund",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/swakopmund_sands.html). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "Low Season (01 Jan – 31 Mar) · Classic / Cottage Room — pp sharing",
              "1,090"
            ],
            [
              "Low Season (01 Jan – 31 Mar) · Luxury Room — pp sharing",
              "1,420"
            ],
            [
              "Low Season (01 Jan – 31 Mar) · Luxury Suite — pp sharing",
              "1,560"
            ],
            [
              "Low Season (01 Jan – 31 Mar) · Sea View Cottage Suite — pp sharing",
              "2,065"
            ],
            [
              "Low Season (01 Jan – 31 Mar) · Classic / Cottage Room — single",
              "1,440"
            ],
            [
              "Low Season (01 Jan – 31 Mar) · Luxury Room — single",
              "1,800"
            ],
            [
              "Low Season (01 Jan – 31 Mar) · Luxury Suite — single",
              "2,010"
            ],
            [
              "Low Season (01 Jan – 31 Mar) · Sea View Cottage Suite — single",
              "2,495"
            ],
            [
              "Shoulder Season (01 Apr – 30 Jun & 01 – 31 Dec) · Classic / Cottage Room — pp sharing",
              "1,210"
            ],
            [
              "Shoulder Season (01 Apr – 30 Jun & 01 – 31 Dec) · Luxury Room — pp sharing",
              "1,580"
            ],
            [
              "Shoulder Season (01 Apr – 30 Jun & 01 – 31 Dec) · Luxury Suite — pp sharing",
              "1,740"
            ],
            [
              "Shoulder Season (01 Apr – 30 Jun & 01 – 31 Dec) · Sea View Cottage Suite — pp sharing",
              "2,250"
            ],
            [
              "Shoulder Season (01 Apr – 30 Jun & 01 – 31 Dec) · Classic / Cottage Room — single",
              "1,585"
            ],
            [
              "Shoulder Season (01 Apr – 30 Jun & 01 – 31 Dec) · Luxury Room — single",
              "1,995"
            ],
            [
              "Shoulder Season (01 Apr – 30 Jun & 01 – 31 Dec) · Luxury Suite — single",
              "2,240"
            ],
            [
              "Shoulder Season (01 Apr – 30 Jun & 01 – 31 Dec) · Sea View Cottage Suite — single",
              "2,780"
            ],
            [
              "High Season (01 Jul – 30 Nov) · Classic / Cottage Room — pp sharing",
              "1,385"
            ],
            [
              "High Season (01 Jul – 30 Nov) · Luxury Room — pp sharing",
              "1,730"
            ],
            [
              "High Season (01 Jul – 30 Nov) · Luxury Suite — pp sharing",
              "1,890"
            ],
            [
              "High Season (01 Jul – 30 Nov) · Sea View Cottage Suite — pp sharing",
              "2,465"
            ],
            [
              "High Season (01 Jul – 30 Nov) · Classic / Cottage Room — single",
              "1,820"
            ],
            [
              "High Season (01 Jul – 30 Nov) · Luxury Room — single",
              "2,200"
            ],
            [
              "High Season (01 Jul – 30 Nov) · Luxury Suite — single",
              "2,440"
            ],
            [
              "High Season (01 Jul – 30 Nov) · Sea View Cottage Suite — single",
              "3,020"
            ]
          ]
        }
      ]
    }
  },
  "the-delight-swakopmund": {
    "2027": {
      "name": "The Delight Swakopmund",
      "region": "Swakopmund",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/originals/gondwana/gondwana_p18.pdf). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "Room B&B — per person sharing",
              "1,684.80"
            ],
            [
              "Room B&B — single",
              "2,106"
            ],
            [
              "Tour Guide Room (B&B)",
              "1,684.80"
            ]
          ]
        }
      ]
    }
  },
  "dolomite-camp": {
    "2027": {
      "name": "Dolomite Camp",
      "region": "West Etosha",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/originals/nwr/nwr_dolomite.pdf). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "Low Season (01 Nov – 30 Jun) · Bush chalet (2 beds) DBB — per person sharing",
              "2,862"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Bush chalet (2 beds) DBB — per person sharing",
              "3,888"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Bush chalet (2 beds) DBB — single",
              "3,141"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Bush chalet (2 beds) DBB — single",
              "4,167"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Deluxe chalet (Double bed) DBB — per person sharing",
              "3,204"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Deluxe chalet (Double bed) DBB — per person sharing",
              "4,590"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Deluxe chalet (Double bed) DBB — single",
              "3,492"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Deluxe chalet (Double bed) DBB — single",
              "4,860"
            ]
          ]
        }
      ]
    }
  },
  "okapuka-safari-lodge": {
    "2027": {
      "name": "Okapuka Safari Lodge",
      "region": "Windhoek",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/originals/gondwana/gondwana_p04.pdf). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "Standard Safari Room B&B — per person sharing",
              "1,699.20"
            ],
            [
              "Standard Safari Room B&B — single",
              "2,124"
            ],
            [
              "Classic Safari Room B&B — per person sharing",
              "2,075.20"
            ],
            [
              "Classic Safari Room B&B — single",
              "2,594"
            ],
            [
              "Luxury Safari Suite B&B — per person sharing",
              "2,544.80"
            ],
            [
              "Luxury Safari Suite B&B — single",
              "3,181"
            ],
            [
              "Tour Guide Room (DBB)",
              "1,699.20"
            ]
          ]
        }
      ]
    }
  },
  "olive-grove-guesthouse": {
    "2027": {
      "name": "Olive Grove Guesthouse",
      "region": "Windhoek",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/olive_grove_guesthouse.html). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "Low Season (01 Jan – 30 Jun & 01 – 31 Dec) · Classic Room — per person sharing",
              "1,210"
            ],
            [
              "Low Season (01 Jan – 30 Jun & 01 – 31 Dec) · Terrace Room — per person sharing",
              "1,700"
            ],
            [
              "Low Season (01 Jan – 30 Jun & 01 – 31 Dec) · Terrace Suite — per person sharing",
              "1,935"
            ],
            [
              "Low Season (01 Jan – 30 Jun & 01 – 31 Dec) · Classic Room — single",
              "1,700"
            ],
            [
              "Low Season (01 Jan – 30 Jun & 01 – 31 Dec) · Terrace Room — single",
              "2,360"
            ],
            [
              "Low Season (01 Jan – 30 Jun & 01 – 31 Dec) · Terrace Suite — single",
              "2,725"
            ],
            [
              "High Season (01 Jul – 30 Nov) · Classic Room — per person sharing",
              "1,305"
            ],
            [
              "High Season (01 Jul – 30 Nov) · Terrace Room — per person sharing",
              "1,815"
            ],
            [
              "High Season (01 Jul – 30 Nov) · Terrace Suite — per person sharing",
              "2,040"
            ],
            [
              "High Season (01 Jul – 30 Nov) · Classic Room — single",
              "1,815"
            ],
            [
              "High Season (01 Jul – 30 Nov) · Terrace Room — single",
              "2,465"
            ],
            [
              "High Season (01 Jul – 30 Nov) · Terrace Suite — single",
              "2,860"
            ]
          ]
        }
      ]
    }
  },
  "onjala-lodge": {
    "2027": {
      "name": "Onjala",
      "region": "Windhoek",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/onjala_ratesheet_v3.html). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "Low Season (01 Dec – 30 Jun) · DBB — per person sharing",
              "2,160"
            ],
            [
              "Low Season (01 Dec – 30 Jun) · Single supplement",
              "540"
            ],
            [
              "Low Season (01 Dec – 30 Jun) · Day room — per person",
              "1,350"
            ],
            [
              "High Season (01 Jul – 30 Nov) · DBB — per person sharing",
              "2,700"
            ],
            [
              "High Season (01 Jul – 30 Nov) · Single supplement",
              "675"
            ]
          ]
        }
      ]
    }
  },
  "the-weinberg-windhoek": {
    "2027": {
      "name": "The Weinberg",
      "region": "Windhoek",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/originals/gondwana/gondwana_p05.pdf). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "Courtyard Room B&B — per person sharing",
              "2,488"
            ],
            [
              "Courtyard Room B&B — single",
              "3,483.20"
            ],
            [
              "Superior Upper-Level B&B — per person sharing",
              "2,730.40"
            ],
            [
              "Superior Upper-Level B&B — single",
              "3,822.56"
            ],
            [
              "Loft Room B&B — per person sharing",
              "3,477.60"
            ],
            [
              "Loft Room B&B — single",
              "4,868.64"
            ],
            [
              "Terrace Suite B&B (per room, max 2)",
              "13,200"
            ],
            [
              "Terrace Suite supplement",
              "4,400"
            ],
            [
              "Tour Guide Single (B&B)",
              "2,488"
            ]
          ]
        }
      ]
    }
  },
  "ti-melen": {
    "2027": {
      "name": "Ti Melen",
      "region": "Windhoek",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/ti_melen.html). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "B&B · Room — per person sharing",
              "1,360"
            ],
            [
              "B&B · Room — single",
              "2,000"
            ],
            [
              "Child 4–12",
              "960"
            ],
            [
              "Tour Guide (Guide Room)",
              "990"
            ]
          ]
        }
      ]
    }
  },
  "weinberg-urban-pod": {
    "2027": {
      "name": "Weinberg Urban Pod",
      "region": "Windhoek",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/originals/gondwana/gondwana_p06.pdf). Seasons are shown in the rate label. Rack not derived: the sheet does not state a commission %, so no public rack is published for this property.",
      "sections": [
        {
          "title": "2027 — net STO",
          "rows": [
            [
              "Urban Pod — F&B inclusive (per room, max 2)",
              "26,400"
            ],
            [
              "Additional room supplement (2 rooms)",
              "15,840"
            ],
            [
              "Additional room supplement (3 rooms)",
              "10,560"
            ]
          ]
        }
      ]
    }
  }
});


// ---------------------------------------------------------------------------
// Namib Outpost — its inline entry above is a 2025 season, i.e. an expired rate
// that agents were still being shown. Drop that entry so the lookup falls
// through to the owner area (if it holds anything) and otherwise to the 2027
// sheet rates below. Same gap-fill rule as the rest of this block: never an
// override of a live rate.
// ---------------------------------------------------------------------------
delete STO_DB['namib-outpost'];
Object.assign(LEGACY_STO_BY_YEAR, { "namib-outpost": { "2027": {
  "name": "Namib Outpost",
  "region": "Sossusvlei",
  "currency": "N$",
  "validity": "2027 season",
  "note": "Net STO rates recovered from the supplier rate sheet (/ratesheets/namib_outpost_ratesheet_v3.html). Replaces an expired 2025 rate that was previously being served. Seasons are shown in the rate label.",
  "sections": [
    {
      "title": "2027 — net STO",
      "rows": [
        [
          "High Season (01 Mar – 30 Nov) · Full Board Plus · Suite — per person sharing",
          "7,056"
        ],
        [
          "High Season (01 Mar – 30 Nov) · Full Board Plus · Suite — single",
          "9,200"
        ],
        [
          "High Season (01 Mar – 30 Nov) · Full Board Plus · Superior Suite — per person sharing",
          "10,600"
        ],
        [
          "High Season (01 Mar – 30 Nov) · Child 4–12 (Suite)",
          "3,528"
        ],
        [
          "Tour Guide (Guide Room)",
          "1,190"
        ],
        [
          "Low Season (01 Dec – 29 Feb) · Full Board Plus · Suite — per person sharing",
          "5,800"
        ],
        [
          "Low Season (01 Dec – 29 Feb) · Full Board Plus · Suite — single",
          "7,560"
        ],
        [
          "Low Season (01 Dec – 29 Feb) · Full Board Plus · Superior Suite — per person sharing",
          "8,800"
        ],
        [
          "Low Season (01 Dec – 29 Feb) · Child 4–12 (Suite)",
          "2,900"
        ]
      ]
    }
  ]
} } });

// --------------------------------------------------------------------------
// Net STO rates recovered from each lodge's own supplier ratesheet, for lodges
// the API held nothing for. Cross-checked row by row against the independently
// generated rates index. Consulted last — a live or inline rate always wins.
// --------------------------------------------------------------------------
Object.assign(SHEET_STO_BY_YEAR, {
  "chobe-princess": {
    "2026": {
      "name": "Chobe Princess",
      "region": "Chobe",
      "currency": "N$",
      "validity": "2026",
      "note": "Net STO rates from the supplier sheet.",
      "commission": "20% STO",
      "sections": [
        {
          "title": "1 March – 30 November 2026",
          "rows": [
            [
              "Cabin — PP Sharing",
              "10,746"
            ]
          ]
        },
        {
          "title": "1 December 2026 – 28 February 2027",
          "rows": [
            [
              "Cabin — PP Sharing",
              "8,717"
            ]
          ]
        },
        {
          "title": "Levy & Guide",
          "rows": [
            [
              "Conservation & Community Levy (pppn)",
              "150"
            ],
            [
              "Tour Guide (per night, at Ichingo)",
              "3,800"
            ]
          ]
        }
      ]
    }
  },
  "ichingo-chobe-river-lodge": {
    "2026": {
      "name": "Ichingo Chobe River Lodge",
      "region": "Chobe",
      "currency": "N$",
      "validity": "2026",
      "note": "Net STO rates from the supplier sheet.",
      "commission": "20% STO",
      "sections": [
        {
          "title": "1 March – 30 November 2026",
          "rows": [
            [
              "PP Sharing",
              "7,397"
            ]
          ]
        },
        {
          "title": "1 December 2026 – 28 February 2027",
          "rows": [
            [
              "PP Sharing",
              "6,845"
            ]
          ]
        },
        {
          "title": "Levy & Guide",
          "rows": [
            [
              "Conservation & Community Levy (pppn)",
              "150"
            ],
            [
              "Guide Tent (per night)",
              "3,800"
            ]
          ]
        }
      ]
    }
  },
  "zambezi-queen": {
    "2026": {
      "name": "Zambezi Queen",
      "region": "Chobe",
      "currency": "N$",
      "validity": "2026",
      "note": "Net STO rates from the supplier sheet.",
      "commission": "20% STO",
      "sections": [
        {
          "title": "1 March – 30 November 2026",
          "rows": [
            [
              "Suite — PP Sharing",
              "14,056"
            ],
            [
              "Luxury Suite — PP Sharing",
              "16,591"
            ]
          ]
        },
        {
          "title": "1 December 2026 – 28 February 2027",
          "rows": [
            [
              "Suite — PP Sharing",
              "12,656"
            ],
            [
              "Luxury Suite — PP Sharing",
              "14,929"
            ]
          ]
        },
        {
          "title": "Levy & Guide",
          "rows": [
            [
              "Conservation & Community Levy (pppn)",
              "250"
            ],
            [
              "Tour Guide Cabin (per night, 2–9 suites)",
              "4,800"
            ]
          ]
        }
      ]
    }
  },
  "palmwag-under-canvas-sleep-out": {
    "2026": {
      "name": "Palmwag Under-Canvas Sleep-Out",
      "region": "Damaraland",
      "currency": "N$",
      "validity": "2026",
      "note": "Net STO rates from the supplier sheet.",
      "commission": "20% STO",
      "sections": [
        {
          "title": "STO 25% Rate -- All-Inclusive Sleep-Out",
          "rows": [
            [
              "Sharing/Single tent pp -- meals, beverages and activities included",
              "3,746.25"
            ]
          ]
        }
      ]
    }
  },
  "dead-valley-lodge": {
    "2026": {
      "name": "Dead Valley Lodge",
      "region": "Sossusvlei",
      "currency": "N$",
      "validity": "2026",
      "note": "Net STO rates from the supplier sheet.",
      "commission": "20% STO",
      "sections": [
        {
          "title": "Low Season (1 Nov 2025 – 31 May 2026)",
          "rows": [
            [
              "Per Person Sharing",
              "3,080"
            ],
            [
              "Per Person Single",
              "3,430"
            ]
          ]
        },
        {
          "title": "High Season (1 Jun – 31 Oct 2026)",
          "rows": [
            [
              "Per Person Sharing",
              "4,200"
            ],
            [
              "Per Person Single",
              "4,410"
            ]
          ]
        },
        {
          "title": "Low Season (1 Nov 2026 – 31 May 2027)",
          "rows": [
            [
              "Per Person Sharing",
              "3,290"
            ],
            [
              "Per Person Single",
              "3,640"
            ]
          ]
        },
        {
          "title": "Excursions (1 Jun 2026 – 31 May 2027, STO less 15%)",
          "rows": [
            [
              "Sossusvlei Scenic Sunrise Drive",
              "1,148"
            ],
            [
              "Sossusvlei Scenic Sunset Drive",
              "1,148"
            ],
            [
              "Sunset Elim Dune Drive / Guided Walk",
              "723"
            ],
            [
              "Sesriem Canyon",
              "595"
            ]
          ]
        }
      ]
    }
  },
  "windpomp-14-sea-side-camp": {
    "2026": {
      "name": "Windpomp 14 Sea Side Camp",
      "region": "Swakopmund",
      "currency": "N$",
      "validity": "2026",
      "note": "Net STO rates from the supplier sheet.",
      "commission": "20% STO",
      "sections": [
        {
          "title": "Beachfront Units",
          "rows": [
            [
              "Adult — Off Season",
              "248"
            ],
            [
              "Child 6–15 — Off Season",
              "160"
            ],
            [
              "Child 0–5 — Off Season",
              "40"
            ],
            [
              "Adult — Peak Season",
              "272"
            ],
            [
              "Child 6–15 — Peak Season",
              "216"
            ],
            [
              "Child 0–5 — Peak Season",
              "68"
            ]
          ]
        },
        {
          "title": "Middle Row Units",
          "rows": [
            [
              "Adult — Off Season",
              "224"
            ],
            [
              "Child 6–15 — Off Season",
              "152"
            ],
            [
              "Child 0–5 — Off Season",
              "40"
            ],
            [
              "Adult — Peak Season",
              "260"
            ],
            [
              "Child 6–15 — Peak Season",
              "208"
            ],
            [
              "Child 0–5 — Peak Season",
              "60"
            ]
          ]
        },
        {
          "title": "Back Row Units",
          "rows": [
            [
              "Adult — Off Season",
              "208"
            ],
            [
              "Child 6–15 — Off Season",
              "152"
            ],
            [
              "Child 0–5 — Off Season",
              "40"
            ],
            [
              "Adult — Peak Season",
              "252"
            ],
            [
              "Child 6–15 — Peak Season",
              "200"
            ],
            [
              "Child 0–5 — Peak Season",
              "56"
            ]
          ]
        }
      ]
    }
  },
  "daan-viljoen-lodge": {
    "2026": {
      "name": "Daan Viljoen Lodge",
      "region": "Windhoek",
      "currency": "N$",
      "validity": "2026",
      "note": "Net STO rates from the supplier sheet.",
      "commission": "20% STO",
      "sections": [
        {
          "title": "Standard Chalet",
          "rows": [
            [
              "Adult Double Room",
              "1,680"
            ],
            [
              "Adult Single Room",
              "1,085"
            ],
            [
              "Child Double Room (6–15)",
              "1,162"
            ],
            [
              "Child Single Room (6–15)",
              "588"
            ]
          ]
        },
        {
          "title": "Deluxe Chalet (sleeps 3)",
          "rows": [
            [
              "Adult Double Room",
              "1,918"
            ],
            [
              "Adult Single Room",
              "1,330"
            ],
            [
              "Children (6–15)",
              "413"
            ]
          ]
        },
        {
          "title": "Activities & Extras",
          "rows": [
            [
              "Dinner (per person, tour groups)",
              "440"
            ],
            [
              "Tour Guide & Driver Accommodation (pp)",
              "800"
            ]
          ]
        }
      ]
    }
  },
  "sesriem-oshana-campsite": {
    "2026": {
      "name": "Sesriem Oshana Campsite",
      "region": "Sossusvlei",
      "currency": "N$",
      "validity": "2026",
      "note": "Net STO rates from the supplier sheet.",
      "commission": "20% STO",
      "sections": [
        {
          "title": "1 Nov 2025 – 31 May 2026",
          "rows": [
            [
              "Per Person",
              "308"
            ],
            [
              "Child 6–15",
              "154"
            ]
          ]
        },
        {
          "title": "1 Jun – 31 Oct 2026",
          "rows": [
            [
              "Per Person",
              "392"
            ]
          ]
        },
        {
          "title": "1 Nov 2026 – 31 May 2027",
          "rows": [
            [
              "Per Person",
              "329"
            ],
            [
              "Child 6–15",
              "168"
            ]
          ]
        }
      ]
    }
  },
  "daan-viljoen-camping": {
    "2026": {
      "name": "Daan Viljoen Camping",
      "region": "Windhoek",
      "currency": "N$",
      "validity": "2026",
      "note": "Net STO rates from the supplier sheet.",
      "commission": "20% STO",
      "sections": [
        {
          "title": "Camping Rates (2026)",
          "rows": [
            [
              "Single Camp",
              "280"
            ],
            [
              "Double Camp",
              "408"
            ],
            [
              "Extra per person",
              "144"
            ]
          ]
        }
      ]
    }
  },
  "nkasa-linyanti": {
    "2026": {
      "name": "Nkasa Linyanti",
      "region": "Caprivi",
      "currency": "N$",
      "validity": "2026",
      "note": "Net STO rates from the supplier sheet.",
      "commission": "STO",
      "sections": [
        {
          "title": "Nkasa Linyanti — Shoulder Season1-30 Apr | 1-30 Jun1 Nov-19 Dec",
          "rows": [
            [
              "Per Night RatePer Person Sharing",
              "8,396"
            ],
            [
              "Single Supplement",
              "3,369"
            ],
            [
              "Private VehiclePer vehicle per night",
              "9,875"
            ]
          ]
        },
        {
          "title": "Nkasa Linyanti — Shoulder High1-31 May",
          "rows": [
            [
              "Per Night RatePer Person Sharing",
              "10,436"
            ],
            [
              "Single Supplement",
              "4,188"
            ],
            [
              "Private VehiclePer vehicle per night",
              "9,875"
            ]
          ]
        },
        {
          "title": "Nkasa Linyanti — High Season1 Sep-31 Oct20 Dec-9 Jan",
          "rows": [
            [
              "Per Night RatePer Person Sharing",
              "12,472"
            ],
            [
              "Single Supplement",
              "5,005"
            ],
            [
              "Private VehiclePer vehicle per night",
              "12,095"
            ]
          ]
        },
        {
          "title": "Nkasa Linyanti — Peak Season1 Jul-31 Aug",
          "rows": [
            [
              "Per Night RatePer Person Sharing",
              "13,396"
            ],
            [
              "Single Supplement",
              "5,376"
            ],
            [
              "Private VehiclePer vehicle per night",
              "12,095"
            ]
          ]
        },
        {
          "title": "When would you like to travel? — Shoulder Season1-30 Apr | 1-30 Jun1 Nov-19 Dec",
          "rows": [
            [
              "Per Night RatePer Person Sharing",
              "8,396"
            ],
            [
              "Single Supplement",
              "3,369"
            ],
            [
              "Private VehiclePer vehicle per night",
              "9,875"
            ]
          ]
        },
        {
          "title": "When would you like to travel? — Shoulder High1-31 May",
          "rows": [
            [
              "Per Night RatePer Person Sharing",
              "10,436"
            ],
            [
              "Single Supplement",
              "4,188"
            ],
            [
              "Private VehiclePer vehicle per night",
              "9,875"
            ]
          ]
        },
        {
          "title": "When would you like to travel? — High Season1 Sep-31 Oct20 Dec-9 Jan",
          "rows": [
            [
              "Per Night RatePer Person Sharing",
              "12,472"
            ],
            [
              "Single Supplement",
              "5,005"
            ],
            [
              "Private VehiclePer vehicle per night",
              "12,095"
            ]
          ]
        },
        {
          "title": "When would you like to travel? — Peak Season1 Jul-31 Aug",
          "rows": [
            [
              "Per Night RatePer Person Sharing",
              "13,396"
            ],
            [
              "Single Supplement",
              "5,376"
            ],
            [
              "Private VehiclePer vehicle per night",
              "12,095"
            ]
          ]
        }
      ]
    }
  },
  "camp-kipwe": {
    "2026": {
      "name": "Camp Kipwe",
      "region": "Damaraland",
      "currency": "N$",
      "validity": "2026",
      "note": "Net STO rates from the supplier sheet.",
      "commission": "STO",
      "sections": [
        {
          "title": "STO15 Rate — 01 Jan 2026 to 31 Dec 2026 — Low Season STO 15%",
          "rows": [
            [
              "9 x Bungalows — DBB p/p Sharing",
              "4,310"
            ],
            [
              "9 x Bungalows — DBB Single Person",
              "5,814"
            ],
            [
              "Bungalow 2-Night FI Package — Sharing p/p",
              "12,631"
            ],
            [
              "Bungalow 2-Night FI Package — Single",
              "15,436"
            ],
            [
              "Bungalow 3-Night FI Package — Sharing p/p",
              "18,335"
            ],
            [
              "Bungalow 3-Night FI Package — Single",
              "22,670"
            ],
            [
              "1 x Kipwe Suite — DBB p/p Sharing",
              "7,259"
            ],
            [
              "1 x Kipwe Suite — DBB Single Person",
              "9,894"
            ],
            [
              "Kipwe Suite 2-Night FI Package — Sharing p/p",
              "18,496"
            ],
            [
              "Kipwe Suite 2-Night FI Package — Single",
              "23,571"
            ],
            [
              "Kipwe Suite 3-Night FI Package — Sharing p/p",
              "27,107"
            ],
            [
              "Kipwe Suite 3-Night FI Package — Single",
              "34,859"
            ],
            [
              "2 x Luxury Suites — DBB p/p Sharing",
              "10,608"
            ],
            [
              "2 x Luxury Suites — DBB Single Person",
              "14,425"
            ],
            [
              "Luxury Suite 2-Night FI Package — Sharing p/p",
              "25,313"
            ],
            [
              "Luxury Suite 2-Night FI Package — Single",
              "32,734"
            ],
            [
              "Luxury Suite 3-Night FI Package — Sharing p/p",
              "37,281"
            ],
            [
              "Luxury Suite 3-Night FI Package — Single",
              "48,552"
            ]
          ]
        },
        {
          "title": "STO15 Rate — 01 Jan 2026 to 31 Dec 2026 — High Season STO 15%",
          "rows": [
            [
              "9 x Bungalows — DBB p/p Sharing",
              "5,695"
            ],
            [
              "9 x Bungalows — DBB Single Person",
              "8,432"
            ],
            [
              "Bungalow 2-Night FI Package — Sharing p/p",
              "15,385"
            ],
            [
              "Bungalow 2-Night FI Package — Single",
              "19,312"
            ],
            [
              "Bungalow 3-Night FI Package — Sharing p/p",
              "22,440"
            ],
            [
              "Bungalow 3-Night FI Package — Single",
              "28,458"
            ],
            [
              "1 x Kipwe Suite — DBB p/p Sharing",
              "8,696"
            ],
            [
              "1 x Kipwe Suite — DBB Single Person",
              "12,580"
            ],
            [
              "Kipwe Suite 2-Night FI Package — Sharing p/p",
              "21,369"
            ],
            [
              "Kipwe Suite 2-Night FI Package — Single",
              "27,574"
            ],
            [
              "Kipwe Suite 3-Night FI Package — Sharing p/p",
              "31,442"
            ],
            [
              "Kipwe Suite 3-Night FI Package — Single",
              "40,851"
            ],
            [
              "2 x Luxury Suites — DBB p/p Sharing",
              "12,589"
            ],
            [
              "2 x Luxury Suites — DBB Single Person",
              "17,663"
            ],
            [
              "Luxury Suite 2-Night FI Package — Sharing p/p",
              "29,240"
            ],
            [
              "Luxury Suite 2-Night FI Package — Single",
              "37,834"
            ],
            [
              "Luxury Suite 3-Night FI Package — Sharing p/p",
              "43,223"
            ],
            [
              "Luxury Suite 3-Night FI Package — Single",
              "56,228"
            ]
          ]
        },
        {
          "title": "Child Sharing Rates (accommodated in children's tent / camping bed) — Low Season NETT",
          "rows": [
            [
              "Child (4-12 yrs) — DBB per night",
              "2,610"
            ],
            [
              "Child (4-12 yrs) — 2-Night FI Package",
              "8,190"
            ],
            [
              "Child (4-12 yrs) — 3-Night FI Package",
              "11,190"
            ]
          ]
        },
        {
          "title": "Child Sharing Rates (accommodated in children's tent / camping bed) — High Season NETT",
          "rows": [
            [
              "Child (4-12 yrs) — DBB per night",
              "2,610"
            ],
            [
              "Child (4-12 yrs) — 2-Night FI Package",
              "8,190"
            ],
            [
              "Child (4-12 yrs) — 3-Night FI Package",
              "11,190"
            ]
          ]
        },
        {
          "title": "Guide & Pilot Rates — Rate (N$)",
          "rows": [
            [
              "Tour Guide Room (per Guide/Pilot per night)",
              "2,210"
            ]
          ]
        },
        {
          "title": "Rack Rate — 01 Jan 2026 to 31 Dec 2026 — Low Season RACK",
          "rows": [
            [
              "9 x Bungalows — DBB p/p Sharing",
              "5,070"
            ],
            [
              "9 x Bungalows — DBB Single Person",
              "6,840"
            ],
            [
              "Bungalow 2-Night FI Package — Sharing p/p",
              "14,860"
            ],
            [
              "Bungalow 2-Night FI Package — Single",
              "18,160"
            ],
            [
              "Bungalow 3-Night FI Package — Sharing p/p",
              "21,570"
            ],
            [
              "Bungalow 3-Night FI Package — Single",
              "26,670"
            ],
            [
              "1 x Kipwe Suite — DBB p/p Sharing",
              "8,540"
            ],
            [
              "1 x Kipwe Suite — DBB Single Person",
              "11,640"
            ],
            [
              "Kipwe Suite 2-Night FI Package — Sharing p/p",
              "21,760"
            ],
            [
              "Kipwe Suite 2-Night FI Package — Single",
              "27,730"
            ],
            [
              "Kipwe Suite 3-Night FI Package — Sharing p/p",
              "31,890"
            ],
            [
              "Kipwe Suite 3-Night FI Package — Single",
              "41,010"
            ],
            [
              "2 x Luxury Suites — DBB p/p Sharing",
              "12,480"
            ],
            [
              "2 x Luxury Suites — DBB Single Person",
              "16,970"
            ],
            [
              "Luxury Suite 2-Night FI Package — Sharing p/p",
              "29,780"
            ],
            [
              "Luxury Suite 2-Night FI Package — Single",
              "38,510"
            ],
            [
              "Luxury Suite 3-Night FI Package — Sharing p/p",
              "43,860"
            ],
            [
              "Luxury Suite 3-Night FI Package — Single",
              "57,120"
            ]
          ]
        },
        {
          "title": "Rack Rate — 01 Jan 2026 to 31 Dec 2026 — High Season RACK",
          "rows": [
            [
              "9 x Bungalows — DBB p/p Sharing",
              "6,700"
            ],
            [
              "9 x Bungalows — DBB Single Person",
              "9,920"
            ],
            [
              "Bungalow 2-Night FI Package — Sharing p/p",
              "18,100"
            ],
            [
              "Bungalow 2-Night FI Package — Single",
              "22,720"
            ],
            [
              "Bungalow 3-Night FI Package — Sharing p/p",
              "26,400"
            ],
            [
              "Bungalow 3-Night FI Package — Single",
              "33,480"
            ],
            [
              "1 x Kipwe Suite — DBB p/p Sharing",
              "10,230"
            ],
            [
              "1 x Kipwe Suite — DBB Single Person",
              "14,800"
            ],
            [
              "Kipwe Suite 2-Night FI Package — Sharing p/p",
              "25,140"
            ],
            [
              "Kipwe Suite 2-Night FI Package — Single",
              "32,440"
            ],
            [
              "Kipwe Suite 3-Night FI Package — Sharing p/p",
              "36,990"
            ],
            [
              "Kipwe Suite 3-Night FI Package — Single",
              "48,060"
            ],
            [
              "2 x Luxury Suites — DBB p/p Sharing",
              "14,810"
            ],
            [
              "2 x Luxury Suites — DBB Single Person",
              "20,780"
            ],
            [
              "Luxury Suite 2-Night FI Package — Sharing p/p",
              "34,400"
            ],
            [
              "Luxury Suite 2-Night FI Package — Single",
              "44,510"
            ],
            [
              "Luxury Suite 3-Night FI Package — Sharing p/p",
              "50,850"
            ],
            [
              "Luxury Suite 3-Night FI Package — Single",
              "66,150"
            ]
          ]
        },
        {
          "title": "Activities offered at Camp Kipwe — Nett Price (N$)",
          "rows": [
            [
              "Nature Drive (guided, Morning)",
              "1,360"
            ],
            [
              "Twyfelfontein Excursion (guided, Afternoon)",
              "1,110"
            ],
            [
              "Damara Living Museum Entry",
              "320"
            ],
            [
              "All-Inclusive Drinks Add-On",
              "1,200"
            ]
          ]
        },
        {
          "title": "Transfers (Charged pp one-way) — Nett Price (N$)",
          "rows": [
            [
              "Twyfelfontein Airstrip Transfer",
              "395"
            ],
            [
              "!Doro Nawas Transfer",
              "465"
            ],
            [
              "Damaraland Camp Transfer",
              "695"
            ]
          ]
        },
        {
          "title": "Additional Meals — Price (N$)",
          "rows": [
            [
              "Breakfast",
              "395"
            ],
            [
              "Lunch",
              "375"
            ],
            [
              "Lunch Pack",
              "255"
            ],
            [
              "Dinner (3 Course)",
              "890"
            ]
          ]
        }
      ]
    }
  },
  "mowani-mountain-camp": {
    "2026": {
      "name": "Mowani Mountain Camp",
      "region": "Damaraland",
      "currency": "N$",
      "validity": "2026",
      "note": "Net STO rates from the supplier sheet.",
      "commission": "STO",
      "sections": [
        {
          "title": "STO15 Rate — 01 Jan 2026 to 31 Dec 2026 — Low Season STO 15%",
          "rows": [
            [
              "8 x View Rooms — DBB p/p Sharing",
              "5,049"
            ],
            [
              "8 x View Rooms — DBB Single Person",
              "6,817"
            ],
            [
              "View Room 2-Night FI Package — Sharing p/p",
              "14,102"
            ],
            [
              "View Room 2-Night FI Package — Single",
              "17,459"
            ],
            [
              "View Room 3-Night FI Package — Sharing p/p",
              "20,553"
            ],
            [
              "View Room 3-Night FI Package — Single",
              "25,653"
            ],
            [
              "4 x Superior View Rooms — DBB p/p Sharing",
              "5,440"
            ],
            [
              "4 x Superior View Rooms — DBB Single Person",
              "7,327"
            ],
            [
              "Superior View 2-Night FI Package — Sharing p/p",
              "14,858"
            ],
            [
              "Superior View 2-Night FI Package — Single",
              "18,462"
            ],
            [
              "Superior View 3-Night FI Package — Sharing p/p",
              "21,675"
            ],
            [
              "Superior View 3-Night FI Package — Single",
              "27,183"
            ],
            [
              "1 x Luxury Room — DBB p/p Sharing",
              "5,687"
            ],
            [
              "1 x Luxury Room — DBB Single Person",
              "7,676"
            ],
            [
              "Luxury Room 2-Night FI Package — Sharing p/p",
              "15,462"
            ],
            [
              "Luxury Room 2-Night FI Package — Single",
              "19,253"
            ],
            [
              "Luxury Room 3-Night FI Package — Sharing p/p",
              "22,568"
            ],
            [
              "Luxury Room 3-Night FI Package — Single",
              "28,331"
            ],
            [
              "1 x Rock Suite (Mini) — DBB p/p Sharing",
              "6,477"
            ],
            [
              "1 x Rock Suite (Mini) — DBB Single Person",
              "8,730"
            ],
            [
              "Rock Suite 2-Night FI Package — Sharing p/p",
              "17,060"
            ],
            [
              "Rock Suite 2-Night FI Package — Single",
              "21,378"
            ],
            [
              "Rock Suite 3-Night FI Package — Sharing p/p",
              "24,939"
            ],
            [
              "Rock Suite 3-Night FI Package — Single",
              "31,518"
            ],
            [
              "1 x Mountain Suite — DBB p/p Sharing",
              "10,710"
            ],
            [
              "1 x Mountain Suite — DBB Single Person",
              "14,561"
            ],
            [
              "Mountain Suite 2-Night FI Package — Sharing p/p",
              "25,526"
            ],
            [
              "Mountain Suite 2-Night FI Package — Single",
              "33,023"
            ],
            [
              "Mountain Suite 3-Night FI Package — Sharing p/p",
              "37,613"
            ],
            [
              "Mountain Suite 3-Night FI Package — Single",
              "48,986"
            ]
          ]
        },
        {
          "title": "STO15 Rate — 01 Jan 2026 to 31 Dec 2026 — High Season STO 15%",
          "rows": [
            [
              "8 x View Rooms — DBB p/p Sharing",
              "6,766"
            ],
            [
              "8 x View Rooms — DBB Single Person",
              "9,231"
            ],
            [
              "View Room 2-Night FI Package — Sharing p/p",
              "17,519"
            ],
            [
              "View Room 2-Night FI Package — Single",
              "22,253"
            ],
            [
              "View Room 3-Night FI Package — Sharing p/p",
              "25,653"
            ],
            [
              "View Room 3-Night FI Package — Single",
              "32,870"
            ],
            [
              "4 x Superior View Rooms — DBB p/p Sharing",
              "7,259"
            ],
            [
              "4 x Superior View Rooms — DBB Single Person",
              "9,792"
            ],
            [
              "Superior View 2-Night FI Package — Sharing p/p",
              "18,530"
            ],
            [
              "Superior View 2-Night FI Package — Single",
              "23,384"
            ],
            [
              "Superior View 3-Night FI Package — Sharing p/p",
              "27,183"
            ],
            [
              "Superior View 3-Night FI Package — Single",
              "34,578"
            ],
            [
              "1 x Luxury Room — DBB p/p Sharing",
              "7,608"
            ],
            [
              "1 x Luxury Room — DBB Single Person",
              "10,251"
            ],
            [
              "Luxury Room 2-Night FI Package — Sharing p/p",
              "19,312"
            ],
            [
              "Luxury Room 2-Night FI Package — Single",
              "24,421"
            ],
            [
              "Luxury Room 3-Night FI Package — Sharing p/p",
              "28,305"
            ],
            [
              "Luxury Room 3-Night FI Package — Single",
              "36,032"
            ],
            [
              "1 x Rock Suite (Mini) — DBB p/p Sharing",
              "8,339"
            ],
            [
              "1 x Rock Suite (Mini) — DBB Single Person",
              "11,110"
            ],
            [
              "Rock Suite 2-Night FI Package — Sharing p/p",
              "20,757"
            ],
            [
              "Rock Suite 2-Night FI Package — Single",
              "26,129"
            ],
            [
              "Rock Suite 3-Night FI Package — Sharing p/p",
              "30,498"
            ],
            [
              "Rock Suite 3-Night FI Package — Single",
              "38,633"
            ],
            [
              "1 x Mountain Suite — DBB p/p Sharing",
              "12,708"
            ],
            [
              "1 x Mountain Suite — DBB Single Person",
              "17,145"
            ],
            [
              "Mountain Suite 2-Night FI Package — Sharing p/p",
              "29,495"
            ],
            [
              "Mountain Suite 2-Night FI Package — Single",
              "38,174"
            ],
            [
              "Mountain Suite 3-Night FI Package — Sharing p/p",
              "43,605"
            ],
            [
              "Mountain Suite 3-Night FI Package — Single",
              "56,712"
            ]
          ]
        },
        {
          "title": "Child Sharing Rates (accommodated in children's tent / camping bed) — Low Season NETT",
          "rows": [
            [
              "Child (4-12 yrs) — DBB per night",
              "2,610"
            ],
            [
              "Child (4-12 yrs) — 2-Night FI Package",
              "8,190"
            ],
            [
              "Child (4-12 yrs) — 3-Night FI Package",
              "11,190"
            ]
          ]
        },
        {
          "title": "Child Sharing Rates (accommodated in children's tent / camping bed) — High Season NETT",
          "rows": [
            [
              "Child (4-12 yrs) — DBB per night",
              "2,610"
            ],
            [
              "Child (4-12 yrs) — 2-Night FI Package",
              "8,190"
            ],
            [
              "Child (4-12 yrs) — 3-Night FI Package",
              "11,190"
            ]
          ]
        },
        {
          "title": "Guide & Pilot Rates — Rate (N$)",
          "rows": [
            [
              "Tour Guide Room (per Guide/Pilot per night)",
              "2,210"
            ]
          ]
        },
        {
          "title": "Rack Rate — 01 Jan 2026 to 31 Dec 2026 — Low Season RACK",
          "rows": [
            [
              "8 x View Rooms — DBB p/p Sharing",
              "5,940"
            ],
            [
              "8 x View Rooms — DBB Single Person",
              "8,020"
            ],
            [
              "View Room 2-Night FI Package — Sharing p/p",
              "16,590"
            ],
            [
              "View Room 2-Night FI Package — Single",
              "20,540"
            ],
            [
              "View Room 3-Night FI Package — Sharing p/p",
              "24,180"
            ],
            [
              "View Room 3-Night FI Package — Single",
              "30,180"
            ],
            [
              "4 x Superior View Rooms — DBB p/p Sharing",
              "6,400"
            ],
            [
              "4 x Superior View Rooms — DBB Single Person",
              "8,620"
            ],
            [
              "Superior View 2-Night FI Package — Sharing p/p",
              "17,480"
            ],
            [
              "Superior View 2-Night FI Package — Single",
              "21,720"
            ],
            [
              "Superior View 3-Night FI Package — Sharing p/p",
              "25,500"
            ],
            [
              "Superior View 3-Night FI Package — Single",
              "31,980"
            ],
            [
              "1 x Luxury Room — DBB p/p Sharing",
              "6,690"
            ],
            [
              "1 x Luxury Room — DBB Single Person",
              "9,030"
            ],
            [
              "Luxury Room 2-Night FI Package — Sharing p/p",
              "18,190"
            ],
            [
              "Luxury Room 2-Night FI Package — Single",
              "22,650"
            ],
            [
              "Luxury Room 3-Night FI Package — Sharing p/p",
              "26,550"
            ],
            [
              "Luxury Room 3-Night FI Package — Single",
              "33,330"
            ],
            [
              "1 x Rock Suite (Mini) — DBB p/p Sharing",
              "7,620"
            ],
            [
              "1 x Rock Suite (Mini) — DBB Single Person",
              "10,270"
            ],
            [
              "Rock Suite 2-Night FI Package — Sharing p/p",
              "20,070"
            ],
            [
              "Rock Suite 2-Night FI Package — Single",
              "25,150"
            ],
            [
              "Rock Suite 3-Night FI Package — Sharing p/p",
              "29,340"
            ],
            [
              "Rock Suite 3-Night FI Package — Single",
              "37,080"
            ],
            [
              "1 x Mountain Suite — DBB p/p Sharing",
              "12,600"
            ],
            [
              "1 x Mountain Suite — DBB Single Person",
              "17,130"
            ],
            [
              "Mountain Suite 2-Night FI Package — Sharing p/p",
              "30,030"
            ],
            [
              "Mountain Suite 2-Night FI Package — Single",
              "38,850"
            ],
            [
              "Mountain Suite 3-Night FI Package — Sharing p/p",
              "44,250"
            ],
            [
              "Mountain Suite 3-Night FI Package — Single",
              "57,630"
            ]
          ]
        },
        {
          "title": "Rack Rate — 01 Jan 2026 to 31 Dec 2026 — High Season RACK",
          "rows": [
            [
              "8 x View Rooms — DBB p/p Sharing",
              "7,960"
            ],
            [
              "8 x View Rooms — DBB Single Person",
              "10,860"
            ],
            [
              "View Room 2-Night FI Package — Sharing p/p",
              "20,610"
            ],
            [
              "View Room 2-Night FI Package — Single",
              "26,180"
            ],
            [
              "View Room 3-Night FI Package — Sharing p/p",
              "30,180"
            ],
            [
              "View Room 3-Night FI Package — Single",
              "38,670"
            ],
            [
              "4 x Superior View Rooms — DBB p/p Sharing",
              "8,540"
            ],
            [
              "4 x Superior View Rooms — DBB Single Person",
              "11,520"
            ],
            [
              "Superior View 2-Night FI Package — Sharing p/p",
              "21,800"
            ],
            [
              "Superior View 2-Night FI Package — Single",
              "27,510"
            ],
            [
              "Superior View 3-Night FI Package — Sharing p/p",
              "31,980"
            ],
            [
              "Superior View 3-Night FI Package — Single",
              "40,680"
            ],
            [
              "1 x Luxury Room — DBB p/p Sharing",
              "8,950"
            ],
            [
              "1 x Luxury Room — DBB Single Person",
              "12,060"
            ],
            [
              "Luxury Room 2-Night FI Package — Sharing p/p",
              "22,720"
            ],
            [
              "Luxury Room 2-Night FI Package — Single",
              "28,730"
            ],
            [
              "Luxury Room 3-Night FI Package — Sharing p/p",
              "33,300"
            ],
            [
              "Luxury Room 3-Night FI Package — Single",
              "42,390"
            ],
            [
              "1 x Rock Suite (Mini) — DBB p/p Sharing",
              "9,810"
            ],
            [
              "1 x Rock Suite (Mini) — DBB Single Person",
              "13,070"
            ],
            [
              "Rock Suite 2-Night FI Package — Sharing p/p",
              "24,420"
            ],
            [
              "Rock Suite 2-Night FI Package — Single",
              "30,740"
            ],
            [
              "Rock Suite 3-Night FI Package — Sharing p/p",
              "35,880"
            ],
            [
              "Rock Suite 3-Night FI Package — Single",
              "45,450"
            ],
            [
              "1 x Mountain Suite — DBB p/p Sharing",
              "14,950"
            ],
            [
              "1 x Mountain Suite — DBB Single Person",
              "20,170"
            ],
            [
              "Mountain Suite 2-Night FI Package — Sharing p/p",
              "34,700"
            ],
            [
              "Mountain Suite 2-Night FI Package — Single",
              "44,910"
            ],
            [
              "Mountain Suite 3-Night FI Package — Sharing p/p",
              "51,300"
            ],
            [
              "Mountain Suite 3-Night FI Package — Single",
              "66,720"
            ]
          ]
        },
        {
          "title": "Activities offered at Mowani Mountain Camp — Nett Price (N$)",
          "rows": [
            [
              "Nature Drive (guided, Morning)",
              "1,360"
            ],
            [
              "Twyfelfontein Excursion (guided, Afternoon)",
              "1,110"
            ],
            [
              "Damara Living Museum Entry",
              "320"
            ],
            [
              "All-Inclusive Drinks Add-On",
              "1,200"
            ]
          ]
        },
        {
          "title": "Transfers (Charged pp one-way) — Nett Price (N$)",
          "rows": [
            [
              "Twyfelfontein Airstrip Transfer",
              "395"
            ],
            [
              "!Doro Nawas Transfer",
              "465"
            ],
            [
              "Damaraland Camp Transfer",
              "695"
            ]
          ]
        },
        {
          "title": "Additional Meals — Price (N$)",
          "rows": [
            [
              "Breakfast",
              "395"
            ],
            [
              "Lunch",
              "375"
            ],
            [
              "Lunch Pack",
              "255"
            ],
            [
              "Dinner (3 Course)",
              "890"
            ]
          ]
        }
      ]
    }
  },
  "spitzkoppe-cabin-camp": {
    "2026": {
      "name": "Spitzkoppe Cabin Camp",
      "region": "Damaraland",
      "currency": "N$",
      "validity": "2026",
      "note": "Net STO rates from the supplier sheet.",
      "commission": "STO",
      "sections": [
        {
          "title": "Cabin STO Rates 2026 — STO Rate (N$)",
          "rows": [
            [
              "Per Person Sharing — Self-Catering",
              "1,275"
            ],
            [
              "Single Person — Self-Catering",
              "2,380"
            ],
            [
              "Child 3–12 Sharing with Adults (max 3)",
              "637.50"
            ],
            [
              "Child 3–12 Own Room (1st child)",
              "1,275"
            ],
            [
              "Child 3–12 Own Room (2nd/3rd child)",
              "637.50"
            ],
            [
              "Tour Guide Single",
              "1,750"
            ],
            [
              "Tour Guide Sharing",
              "880"
            ]
          ]
        },
        {
          "title": "Camp Service Extras — STO Rate (N$)",
          "rows": [
            [
              "Scullery / Cutlery Usage Fee (per 2 pax per stay)",
              "50"
            ]
          ]
        }
      ]
    }
  },
  "spitzkoppe-restcamp": {
    "2026": {
      "name": "Spitzkoppe Restcamp",
      "region": "Damaraland",
      "currency": "N$",
      "validity": "2026",
      "note": "Net STO rates from the supplier sheet.",
      "commission": "STO",
      "sections": [
        {
          "title": "Community Camping Rates 2026 — STO Rate (N$)",
          "rows": [
            [
              "Adult Campsite Pitch — pppn",
              "270"
            ],
            [
              "Child 4–11 Campsite Pitch — pppn",
              "180"
            ]
          ]
        },
        {
          "title": "Day Visitor Permits — STO Rate (N$)",
          "rows": [
            [
              "Day Visitor — Adult",
              "170"
            ],
            [
              "Day Visitor — Child 4–11",
              "110"
            ]
          ]
        }
      ]
    }
  },
  "spitzkoppen-lodge": {
    "2026": {
      "name": "Spitzkoppen Lodge",
      "region": "Damaraland",
      "currency": "N$",
      "validity": "2026",
      "note": "Net STO rates from the supplier sheet.",
      "commission": "STO",
      "sections": [
        {
          "title": "Lodge Rates 2026 — STO Rate (N$)",
          "rows": [
            [
              "Per Person Sharing — DBB",
              "5,525"
            ],
            [
              "Single Person — DBB",
              "8,075"
            ],
            [
              "Child 6–11 Sharing with Adults — DBB",
              "2,550"
            ],
            [
              "Child 6–11 Own Room — DBB",
              "3,995"
            ],
            [
              "Tour Guide — DBB",
              "2,400"
            ]
          ]
        },
        {
          "title": "Spitzkoppe Excursions & Activities — STO Rate (N$)",
          "rows": [
            [
              "Guided Walk Chain Tour (per person)",
              "410"
            ],
            [
              "Guided Drive — 4 Stop Excursion (per person)",
              "410"
            ],
            [
              "Top-Up Sunset Drive (added to drive, per person)",
              "240"
            ],
            [
              "Guided Cycling Tour (per person)",
              "550"
            ],
            [
              "Mountain Hike (per person)",
              "690"
            ],
            [
              "Lunch (standard dining)",
              "370"
            ],
            [
              "Lunch Pack (per person)",
              "240"
            ]
          ]
        }
      ]
    }
  },
  "mushara-bush-camp": {
    "2026": {
      "name": "Mushara Bush Camp",
      "region": "East Etosha",
      "currency": "N$",
      "validity": "2026",
      "note": "Net STO rates from the supplier sheet.",
      "commission": "STO",
      "sections": [
        {
          "title": "Shoulder Season — 01.01.2026 to 30.06.2026 — STO Rate (N$)",
          "rows": [
            [
              "Double Tent — Single Use DBB",
              "3,200"
            ],
            [
              "Double Tent — Sharing DBB",
              "2,480"
            ],
            [
              "Child Rate 4–12 years sharing — DBB",
              "1,120"
            ],
            [
              "Single Guide Room — DBB",
              "1,700"
            ]
          ]
        },
        {
          "title": "High Season — 01.07.2026 to 31.12.2026 — STO Rate (N$)",
          "rows": [
            [
              "Double Tent — Single Use DBB",
              "3,440"
            ],
            [
              "Double Tent — Sharing DBB",
              "2,680"
            ],
            [
              "Child Rate 4–12 years sharing — DBB",
              "1,120"
            ],
            [
              "Single Guide Room — DBB",
              "1,700"
            ]
          ]
        },
        {
          "title": "Etosha Game Drives & Activities — STO Rate (N$)",
          "rows": [
            [
              "Morning or Afternoon Scheduled Game Drive (pp)",
              "1,235"
            ],
            [
              "Morning or Afternoon Private Game Drive (per vehicle exclusive)",
              "9,860"
            ],
            [
              "Pilot Separate Airstrip Transfer (per transfer)",
              "500"
            ]
          ]
        },
        {
          "title": "Dining & Extras — STO Rate (N$)",
          "rows": [
            [
              "Lunch (per person)",
              "300"
            ],
            [
              "Lunch Pack (per person)",
              "200"
            ]
          ]
        }
      ]
    }
  },
  "mushara-lodge": {
    "2026": {
      "name": "Mushara Lodge",
      "region": "East Etosha",
      "currency": "N$",
      "validity": "2026",
      "note": "Net STO rates from the supplier sheet.",
      "commission": "STO",
      "sections": [
        {
          "title": "Shoulder Season — 01.01.2026 to 30.06.2026 — STO Rate (N$)",
          "rows": [
            [
              "Double Chalet — Single Use DBB",
              "4,400"
            ],
            [
              "Double Chalet — Sharing DBB",
              "3,280"
            ],
            [
              "Triple Room — Sharing DBB",
              "3,280"
            ],
            [
              "Family House — Sharing pp DBB",
              "3,280"
            ],
            [
              "Single Guide Room — DBB",
              "1,700"
            ]
          ]
        },
        {
          "title": "High Season — 01.07.2026 to 31.12.2026 — STO Rate (N$)",
          "rows": [
            [
              "Double Chalet — Single Use DBB",
              "4,720"
            ],
            [
              "Double Chalet — Sharing DBB",
              "3,520"
            ],
            [
              "Triple Room — Sharing DBB",
              "3,520"
            ],
            [
              "Family House — Sharing pp DBB",
              "3,520"
            ],
            [
              "Single Guide Room — DBB",
              "1,700"
            ]
          ]
        },
        {
          "title": "Etosha Game Drives & Activities — STO Rate (N$)",
          "rows": [
            [
              "Morning or Afternoon Scheduled Game Drive (pp)",
              "1,235"
            ],
            [
              "Morning or Afternoon Private Game Drive (per vehicle exclusive)",
              "9,860"
            ],
            [
              "Pilot Separate Airstrip Transfer (per transfer)",
              "500"
            ]
          ]
        },
        {
          "title": "Dining & Extras — STO Rate (N$)",
          "rows": [
            [
              "Lunch (per person)",
              "300"
            ],
            [
              "Lunch Pack (per person)",
              "200"
            ]
          ]
        }
      ]
    }
  },
  "mushara-outpost": {
    "2026": {
      "name": "Mushara Outpost",
      "region": "East Etosha",
      "currency": "N$",
      "validity": "2026",
      "note": "Net STO rates from the supplier sheet.",
      "commission": "STO",
      "sections": [
        {
          "title": "Shoulder Season — 01.01.2026 to 30.06.2026 — STO Rate (N$)",
          "rows": [
            [
              "Double Tent — Single Use DBB",
              "4,560"
            ],
            [
              "Double Tent — Sharing DBB",
              "3,480"
            ],
            [
              "Double Tent — Single Use Fully Inclusive",
              "8,320"
            ],
            [
              "Double Tent — Sharing Fully Inclusive",
              "6,360"
            ],
            [
              "Single Guide Tent — DBB",
              "1,700"
            ]
          ]
        },
        {
          "title": "High Season — 01.07.2026 to 31.12.2026 — STO Rate (N$)",
          "rows": [
            [
              "Double Tent — Single Use DBB",
              "4,880"
            ],
            [
              "Double Tent — Sharing DBB",
              "3,760"
            ],
            [
              "Double Tent — Single Use Fully Inclusive",
              "8,880"
            ],
            [
              "Double Tent — Sharing Fully Inclusive",
              "6,880"
            ],
            [
              "Single Guide Tent — DBB",
              "1,700"
            ]
          ]
        },
        {
          "title": "Etosha Game Drives & Activities — STO Rate (N$)",
          "rows": [
            [
              "Morning or Afternoon Scheduled Game Drive (pp)",
              "1,235"
            ],
            [
              "Morning or Afternoon Private Game Drive (per vehicle exclusive)",
              "9,860"
            ],
            [
              "Pilot Separate Airstrip Transfer (per transfer)",
              "500"
            ]
          ]
        },
        {
          "title": "Dining & Extras — STO Rate (N$)",
          "rows": [
            [
              "Lunch (per person)",
              "300"
            ],
            [
              "Lunch Pack (per person)",
              "200"
            ]
          ]
        }
      ]
    }
  },
  "onguma-bush-camp": {
    "2026": {
      "name": "Onguma Bush Camp",
      "region": "East Etosha",
      "currency": "N$",
      "validity": "2026",
      "note": "Net STO rates from the supplier sheet.",
      "commission": "STO",
      "sections": [
        {
          "title": "Per Person Sharing (DBB) — Rate (N$)",
          "rows": [
            [
              "3 Rondavels",
              "2,248"
            ],
            [
              "Rondavel — Child (3–11)",
              "1,405"
            ],
            [
              "3 Loft & 3 Family Rooms",
              "2,600"
            ],
            [
              "Loft / Family — Child (3–11)",
              "1,625"
            ],
            [
              "8 Deluxe Rooms",
              "3,280"
            ],
            [
              "Deluxe — Child (3–11)",
              "2,050"
            ],
            [
              "1 Settler's Room",
              "3,432"
            ],
            [
              "Settler's — Child (3–11)",
              "2,145"
            ]
          ]
        },
        {
          "title": "Single Supplement (per night) — Rate (N$)",
          "rows": [
            [
              "Rondavels",
              "848"
            ],
            [
              "Loft, Family, Deluxe & Settler's",
              "1,104"
            ]
          ]
        },
        {
          "title": "3-Night DBB Package (per person · fixed) — Adult",
          "rows": [
            [
              "3 Rondavels",
              "5,328"
            ],
            [
              "3 Loft & 3 Family Rooms",
              "6,228"
            ],
            [
              "8 Deluxe Rooms",
              "7,788"
            ],
            [
              "1 Settler's Room",
              "8,238"
            ]
          ]
        },
        {
          "title": "3-Night DBB Package (per person · fixed) — Child (3–11)",
          "rows": [
            [
              "3 Rondavels",
              "3,330"
            ],
            [
              "3 Loft & 3 Family Rooms",
              "3,894"
            ],
            [
              "8 Deluxe Rooms",
              "4,869"
            ],
            [
              "1 Settler's Room",
              "5,149.50"
            ]
          ]
        },
        {
          "title": "Activities & Nature Drives — Rate",
          "rows": [
            [
              "Morning / Afternoon Etosha Game Drive (4 hrs)",
              "1,750"
            ],
            [
              "Onguma Sunrise Drive (3 hrs)",
              "890"
            ],
            [
              "Onguma Sundowner Drive (3 hrs)",
              "890"
            ],
            [
              "Interpretive Nature Walk (1½ hrs · min age 16)",
              "890"
            ],
            [
              "Mid-Morning Onkolo Hide (3 hrs · min age 7)",
              "650"
            ],
            [
              "Young Explorers Walk (1½ hrs)",
              "420"
            ],
            [
              "Private Game Drive (4 hrs)",
              "9,700"
            ],
            [
              "Private Game Drive — Full Day (8 hrs)",
              "15,500"
            ],
            [
              "Private Game Drive — Fully Inclusive surcharge (per activity)",
              "6,000"
            ],
            [
              "Private Game Drive — Fully Inclusive surcharge (full day)",
              "7,500"
            ]
          ]
        },
        {
          "title": "Onguma Dream Cruiser (Sleep-Out) — Rate",
          "rows": [
            [
              "Onguma Dream Cruiser (max 2 guests)",
              "9,800"
            ],
            [
              "Additional surcharge — Leadwood & Tamboti Campsite",
              "5,200"
            ]
          ]
        },
        {
          "title": "Additional Meals — Rate",
          "rows": [
            [
              "Breakfast",
              "290"
            ],
            [
              "Breakfast Pack",
              "290"
            ],
            [
              "Lunch (3 course)",
              "360"
            ],
            [
              "Lunch Pack",
              "260"
            ],
            [
              "Dinner (3 course)",
              "640"
            ],
            [
              "Dinner (4 course)",
              "810"
            ]
          ]
        }
      ]
    }
  },
  "onguma-camp-kala": {
    "2026": {
      "name": "Onguma Camp Kala",
      "region": "East Etosha",
      "currency": "N$",
      "validity": "2026",
      "note": "Net STO rates from the supplier sheet.",
      "commission": "STO",
      "sections": [
        {
          "title": "All-Inclusive Rates — 01.11.2025 to 31.10.2026 — Rate (N$)",
          "rows": [
            [
              "Suite — per person sharing (All-Inclusive)",
              "23,832"
            ],
            [
              "Single Supplement",
              "11,344"
            ]
          ]
        },
        {
          "title": "Activities & Nature Drives — Rate",
          "rows": [
            [
              "Morning / Afternoon Etosha Game Drive (4 hrs)",
              "1,750"
            ],
            [
              "Onguma Sunrise Drive (3 hrs)",
              "890"
            ],
            [
              "Onguma Sundowner Drive (3 hrs)",
              "890"
            ],
            [
              "Interpretive Nature Walk (1½ hrs · min age 16)",
              "890"
            ],
            [
              "Mid-Morning Onkolo Hide (3 hrs · min age 7)",
              "650"
            ],
            [
              "Young Explorers Walk (1½ hrs)",
              "420"
            ],
            [
              "Private Game Drive (4 hrs)",
              "9,700"
            ],
            [
              "Private Game Drive — Full Day (8 hrs)",
              "15,500"
            ],
            [
              "Private Game Drive — Fully Inclusive surcharge (per activity)",
              "6,000"
            ],
            [
              "Private Game Drive — Fully Inclusive surcharge (full day)",
              "7,500"
            ]
          ]
        },
        {
          "title": "Onguma Dream Cruiser (Sleep-Out) — Rate",
          "rows": [
            [
              "Onguma Dream Cruiser (max 2 guests)",
              "9,800"
            ],
            [
              "Additional surcharge — Leadwood & Tamboti Campsite",
              "5,200"
            ]
          ]
        },
        {
          "title": "Additional Meals — Rate",
          "rows": [
            [
              "Breakfast",
              "290"
            ],
            [
              "Breakfast Pack",
              "290"
            ],
            [
              "Lunch (3 course)",
              "360"
            ],
            [
              "Lunch Pack",
              "260"
            ],
            [
              "Dinner (3 course)",
              "640"
            ],
            [
              "Dinner (4 course)",
              "810"
            ]
          ]
        }
      ]
    }
  },
  "onguma-forest-camp": {
    "2026": {
      "name": "Onguma Forest Camp",
      "region": "East Etosha",
      "currency": "N$",
      "validity": "2026",
      "note": "Net STO rates from the supplier sheet.",
      "commission": "STO",
      "sections": [
        {
          "title": "Per Person Sharing (DBB) — Rate (N$)",
          "rows": [
            [
              "4 Heritage Bungalows",
              "2,432"
            ],
            [
              "Heritage — Child (3–11)",
              "1,520"
            ],
            [
              "3 Bush Suites — Double",
              "2,736"
            ],
            [
              "3 Bush Suites — Triple",
              "2,560"
            ],
            [
              "3 Bush Suites — Quad",
              "2,392"
            ],
            [
              "Bush Suite — Child (3–11)",
              "1,710"
            ],
            [
              "3 Explorer Bungalows",
              "3,088"
            ],
            [
              "Explorer — Child (3–11)",
              "1,930"
            ],
            [
              "1 Honeymoon Bungalow",
              "3,240"
            ],
            [
              "Honeymoon — Child (3–11)",
              "2,025"
            ]
          ]
        },
        {
          "title": "Single Supplement (per night) — Rate (N$)",
          "rows": [
            [
              "Heritage Bungalows",
              "848"
            ],
            [
              "Bush Suites, Explorer & Honeymoon",
              "1,104"
            ]
          ]
        },
        {
          "title": "3-Night DBB Package (per person · fixed) — Adult",
          "rows": [
            [
              "4 Heritage Bungalows",
              "6,393"
            ],
            [
              "3 Bush Suites — Double",
              "7,236"
            ],
            [
              "3 Bush Suites — Triple",
              "6,774"
            ],
            [
              "3 Bush Suites — Quad",
              "6,306"
            ],
            [
              "3 Explorer Bungalows",
              "8,187"
            ],
            [
              "1 Honeymoon Bungalow",
              "8,799"
            ]
          ]
        },
        {
          "title": "3-Night DBB Package (per person · fixed) — Child (3–11)",
          "rows": [
            [
              "4 Heritage Bungalows",
              "3,996"
            ],
            [
              "3 Bush Suites — Double",
              "4,524"
            ],
            [
              "3 Bush Suites — Triple",
              "4,524"
            ],
            [
              "3 Bush Suites — Quad",
              "4,524"
            ],
            [
              "3 Explorer Bungalows",
              "5,118"
            ],
            [
              "1 Honeymoon Bungalow",
              "5,500.50"
            ]
          ]
        },
        {
          "title": "Activities & Nature Drives — Rate",
          "rows": [
            [
              "Morning / Afternoon Etosha Game Drive (4 hrs)",
              "1,750"
            ],
            [
              "Onguma Sunrise Drive (3 hrs)",
              "890"
            ],
            [
              "Onguma Sundowner Drive (3 hrs)",
              "890"
            ],
            [
              "Interpretive Nature Walk (1½ hrs · min age 16)",
              "890"
            ],
            [
              "Mid-Morning Onkolo Hide (3 hrs · min age 7)",
              "650"
            ],
            [
              "Young Explorers Walk (1½ hrs)",
              "420"
            ],
            [
              "Private Game Drive (4 hrs)",
              "9,700"
            ],
            [
              "Private Game Drive — Full Day (8 hrs)",
              "15,500"
            ],
            [
              "Private Game Drive — Fully Inclusive surcharge (per activity)",
              "6,000"
            ],
            [
              "Private Game Drive — Fully Inclusive surcharge (full day)",
              "7,500"
            ]
          ]
        },
        {
          "title": "Onguma Dream Cruiser (Sleep-Out) — Rate",
          "rows": [
            [
              "Onguma Dream Cruiser (max 2 guests)",
              "9,800"
            ],
            [
              "Additional surcharge — Leadwood & Tamboti Campsite",
              "5,200"
            ]
          ]
        },
        {
          "title": "Additional Meals — Rate",
          "rows": [
            [
              "Breakfast",
              "290"
            ],
            [
              "Breakfast Pack",
              "290"
            ],
            [
              "Lunch (3 course)",
              "360"
            ],
            [
              "Lunch Pack",
              "260"
            ],
            [
              "Dinner (3 course)",
              "640"
            ],
            [
              "Dinner (4 course)",
              "810"
            ]
          ]
        }
      ]
    }
  },
  "onguma-tented-camp": {
    "2026": {
      "name": "Onguma Tented Camp",
      "region": "East Etosha",
      "currency": "N$",
      "validity": "2026",
      "note": "Net STO rates from the supplier sheet.",
      "commission": "STO",
      "sections": [
        {
          "title": "All-Inclusive Rates — 01.11.2025 to 31.10.2026 — Rate (N$)",
          "rows": [
            [
              "Luxury Safari Tent — per person sharing (All-Inclusive)",
              "11,848"
            ],
            [
              "Single Supplement",
              "2,432"
            ]
          ]
        },
        {
          "title": "Activities & Nature Drives — Rate",
          "rows": [
            [
              "Morning / Afternoon Etosha Game Drive (4 hrs)",
              "1,750"
            ],
            [
              "Onguma Sunrise Drive (3 hrs)",
              "890"
            ],
            [
              "Onguma Sundowner Drive (3 hrs)",
              "890"
            ],
            [
              "Interpretive Nature Walk (1½ hrs · min age 16)",
              "890"
            ],
            [
              "Mid-Morning Onkolo Hide (3 hrs · min age 7)",
              "650"
            ],
            [
              "Young Explorers Walk (1½ hrs)",
              "420"
            ],
            [
              "Private Game Drive (4 hrs)",
              "9,700"
            ],
            [
              "Private Game Drive — Full Day (8 hrs)",
              "15,500"
            ],
            [
              "Private Game Drive — Fully Inclusive surcharge (per activity)",
              "6,000"
            ],
            [
              "Private Game Drive — Fully Inclusive surcharge (full day)",
              "7,500"
            ]
          ]
        },
        {
          "title": "Onguma Dream Cruiser (Sleep-Out) — Rate",
          "rows": [
            [
              "Onguma Dream Cruiser (max 2 guests)",
              "9,800"
            ],
            [
              "Additional surcharge — Leadwood & Tamboti Campsite",
              "5,200"
            ]
          ]
        },
        {
          "title": "Additional Meals — Rate",
          "rows": [
            [
              "Breakfast",
              "290"
            ],
            [
              "Breakfast Pack",
              "290"
            ],
            [
              "Lunch (3 course)",
              "360"
            ],
            [
              "Lunch Pack",
              "260"
            ],
            [
              "Dinner (3 course)",
              "640"
            ],
            [
              "Dinner (4 course)",
              "810"
            ]
          ]
        }
      ]
    }
  },
  "onguma-the-fort": {
    "2026": {
      "name": "Onguma The Fort",
      "region": "East Etosha",
      "currency": "N$",
      "validity": "2026",
      "note": "Net STO rates from the supplier sheet.",
      "commission": "STO",
      "sections": [
        {
          "title": "Dinner, Bed & Breakfast (per person sharing) — Rate (N$)",
          "rows": [
            [
              "11 Bush Suites",
              "8,448"
            ],
            [
              "Bush Suite — Child (7–11)",
              "5,280"
            ],
            [
              "1 Sultan Suite",
              "10,288"
            ],
            [
              "Sultan Suite — Child (7–11)",
              "6,430"
            ],
            [
              "1 Honeymoon Suite",
              "11,792"
            ],
            [
              "Honeymoon Suite — Child (7–11)",
              "7,370"
            ]
          ]
        },
        {
          "title": "All-Inclusive (per person sharing) — Rate (N$)",
          "rows": [
            [
              "11 Bush Suites",
              "12,056"
            ],
            [
              "Bush Suite — Child (7–11)",
              "7,530"
            ],
            [
              "1 Sultan Suite",
              "13,896"
            ],
            [
              "Sultan Suite — Child (7–11)",
              "8,680"
            ],
            [
              "1 Honeymoon Suite",
              "15,400"
            ],
            [
              "Honeymoon Suite — Child (7–11)",
              "9,630"
            ]
          ]
        },
        {
          "title": "Single Supplement (per night) — Rate (N$)",
          "rows": [
            [
              "Bush Suite",
              "2,816"
            ],
            [
              "Sultan Suite",
              "3,128"
            ],
            [
              "Honeymoon Suite",
              "5,928"
            ]
          ]
        },
        {
          "title": "3-Night DBB Package (per person · fixed) — Adult",
          "rows": [
            [
              "11 Bush Suites",
              "20,160"
            ],
            [
              "1 Sultan Suite",
              "24,318"
            ],
            [
              "1 Honeymoon Suite",
              "28,407"
            ]
          ]
        },
        {
          "title": "3-Night DBB Package (per person · fixed) — Child (7–11)",
          "rows": [
            [
              "11 Bush Suites",
              "12,600"
            ],
            [
              "1 Sultan Suite",
              "15,200"
            ],
            [
              "1 Honeymoon Suite",
              "17,755"
            ]
          ]
        },
        {
          "title": "Activities & Nature Drives — Rate",
          "rows": [
            [
              "Morning / Afternoon Etosha Game Drive (4 hrs)",
              "1,750"
            ],
            [
              "Onguma Sunrise Drive (3 hrs)",
              "890"
            ],
            [
              "Onguma Sundowner Drive (3 hrs)",
              "890"
            ],
            [
              "Interpretive Nature Walk (1½ hrs · min age 16)",
              "890"
            ],
            [
              "Mid-Morning Onkolo Hide (3 hrs · min age 7)",
              "650"
            ],
            [
              "Young Explorers Walk (1½ hrs)",
              "420"
            ],
            [
              "Private Game Drive (4 hrs)",
              "9,700"
            ],
            [
              "Private Game Drive — Full Day (8 hrs)",
              "15,500"
            ],
            [
              "Private Game Drive — Fully Inclusive surcharge (per activity)",
              "6,000"
            ],
            [
              "Private Game Drive — Fully Inclusive surcharge (full day)",
              "7,500"
            ]
          ]
        },
        {
          "title": "Onguma Dream Cruiser (Sleep-Out) — Rate",
          "rows": [
            [
              "Onguma Dream Cruiser (max 2 guests)",
              "9,800"
            ],
            [
              "Additional surcharge — Leadwood & Tamboti Campsite",
              "5,200"
            ]
          ]
        },
        {
          "title": "Additional Meals — Rate",
          "rows": [
            [
              "Breakfast",
              "290"
            ],
            [
              "Breakfast Pack",
              "290"
            ],
            [
              "Lunch (3 course)",
              "360"
            ],
            [
              "Lunch Pack",
              "260"
            ],
            [
              "Dinner (3 course)",
              "640"
            ],
            [
              "Dinner (4 course)",
              "810"
            ]
          ]
        }
      ]
    }
  },
  "villa-mushara": {
    "2026": {
      "name": "Villa Mushara",
      "region": "East Etosha",
      "currency": "N$",
      "validity": "2026",
      "note": "Net STO rates from the supplier sheet.",
      "commission": "STO",
      "sections": [
        {
          "title": "Shoulder Season — 01.01.2026 to 30.06.2026 — STO Rate (N$)",
          "rows": [
            [
              "Single Occupancy — DBB",
              "7,440"
            ],
            [
              "Double Occupancy — DBB",
              "5,680"
            ],
            [
              "Single Occupancy — Fully Inclusive",
              "10,880"
            ],
            [
              "Double Occupancy — Fully Inclusive",
              "8,320"
            ],
            [
              "Single Guide Room — DBB",
              "1,700"
            ]
          ]
        },
        {
          "title": "High Season — 01.07.2026 to 31.12.2026 — STO Rate (N$)",
          "rows": [
            [
              "Single Occupancy — DBB",
              "8,000"
            ],
            [
              "Double Occupancy — DBB",
              "6,160"
            ],
            [
              "Single Occupancy — Fully Inclusive",
              "11,760"
            ],
            [
              "Double Occupancy — Fully Inclusive",
              "9,000"
            ],
            [
              "Single Guide Room — DBB",
              "1,700"
            ]
          ]
        },
        {
          "title": "Etosha Private Excursions & Activities — STO Rate (N$)",
          "rows": [
            [
              "Morning or Afternoon Scheduled Game Drive (pp)",
              "1,235"
            ],
            [
              "Morning or Afternoon Private Game Drive (per vehicle exclusive)",
              "9,860"
            ],
            [
              "Pilot Separate Airstrip Transfer (per transfer)",
              "500"
            ]
          ]
        },
        {
          "title": "Dining & Extras — STO Rate (N$)",
          "rows": [
            [
              "Lunch (per person)",
              "300"
            ],
            [
              "Lunch Pack (per person)",
              "200"
            ]
          ]
        }
      ]
    }
  },
  "kalahari-bush-breaks": {
    "2026": {
      "name": "Kalahari Bush Breaks",
      "region": "Kalahari",
      "currency": "N$",
      "validity": "2026",
      "note": "Net STO rates from the supplier sheet.",
      "commission": "STO",
      "sections": [
        {
          "title": "Lodge Rates 2026 — STO Rate (N$)",
          "rows": [
            [
              "Per Person Sharing — DBB",
              "2,720"
            ],
            [
              "Single Person — DBB",
              "4,080"
            ],
            [
              "Child 2–12 Max 2 in Family Room — DBB",
              "1,360"
            ],
            [
              "Tour Guide — DBB",
              "1,650"
            ]
          ]
        },
        {
          "title": "Campsite — Self-Catering — STO Rate (N$)",
          "rows": [
            [
              "Kalahari Campsite Pitch — pppn",
              "270"
            ]
          ]
        },
        {
          "title": "Meals & Dining Extras — STO Rate (N$)",
          "rows": [
            [
              "Dinner (adult)",
              "550"
            ],
            [
              "Dinner (child 2–11)",
              "380"
            ],
            [
              "Breakfast (adult)",
              "350"
            ],
            [
              "Lunch Pack (per person)",
              "280"
            ]
          ]
        }
      ]
    }
  },
  "hoanib-elephant-camp": {
    "2026": {
      "name": "Hoanib Elephant Camp",
      "region": "Kaokoland",
      "currency": "N$",
      "validity": "2026",
      "note": "Net STO rates from the supplier sheet.",
      "commission": "STO",
      "sections": [
        {
          "title": "Hoanib Elephant Camp — Shoulder Season1-30 Apr | 1-30 Jun1 Nov-19 Dec",
          "rows": [
            [
              "Per Night RatePer Person Sharing",
              "16,540"
            ],
            [
              "Single Supplement",
              "6,638"
            ],
            [
              "Private VehiclePer vehicle per night",
              "9,875"
            ]
          ]
        },
        {
          "title": "Hoanib Elephant Camp — Shoulder High1-31 May",
          "rows": [
            [
              "Per Night RatePer Person Sharing",
              "17,948"
            ],
            [
              "Single Supplement",
              "7,203"
            ],
            [
              "Private VehiclePer vehicle per night",
              "9,875"
            ]
          ]
        },
        {
          "title": "Hoanib Elephant Camp — High Season1 Sep-31 Oct20 Dec-9 Jan",
          "rows": [
            [
              "Per Night RatePer Person Sharing",
              "19,836"
            ],
            [
              "Single Supplement",
              "7,960"
            ],
            [
              "Private VehiclePer vehicle per night",
              "12,095"
            ]
          ]
        },
        {
          "title": "Hoanib Elephant Camp — Peak Season1 Jul-31 Aug",
          "rows": [
            [
              "Per Night RatePer Person Sharing",
              "22,876"
            ],
            [
              "Single Supplement",
              "9,180"
            ],
            [
              "Private VehiclePer vehicle per night",
              "12,095"
            ]
          ]
        },
        {
          "title": "When would you like to travel? — Shoulder Season1-30 Apr | 1-30 Jun1 Nov-19 Dec",
          "rows": [
            [
              "Per Night RatePer Person Sharing",
              "16,540"
            ],
            [
              "Single Supplement",
              "6,638"
            ],
            [
              "Private VehiclePer vehicle per night",
              "9,875"
            ]
          ]
        },
        {
          "title": "When would you like to travel? — Shoulder High1-31 May",
          "rows": [
            [
              "Per Night RatePer Person Sharing",
              "17,948"
            ],
            [
              "Single Supplement",
              "7,203"
            ],
            [
              "Private VehiclePer vehicle per night",
              "9,875"
            ]
          ]
        },
        {
          "title": "When would you like to travel? — High Season1 Sep-31 Oct20 Dec-9 Jan",
          "rows": [
            [
              "Per Night RatePer Person Sharing",
              "19,836"
            ],
            [
              "Single Supplement",
              "7,960"
            ],
            [
              "Private VehiclePer vehicle per night",
              "12,095"
            ]
          ]
        },
        {
          "title": "When would you like to travel? — Peak Season1 Jul-31 Aug",
          "rows": [
            [
              "Per Night RatePer Person Sharing",
              "22,876"
            ],
            [
              "Single Supplement",
              "9,180"
            ],
            [
              "Private VehiclePer vehicle per night",
              "12,095"
            ]
          ]
        }
      ]
    }
  },
  "hoanib-valley-camp": {
    "2026": {
      "name": "Hoanib Valley Camp",
      "region": "Kaokoland",
      "currency": "N$",
      "validity": "2026",
      "note": "Net STO rates from the supplier sheet.",
      "commission": "STO",
      "sections": [
        {
          "title": "Hoanib Valley Camp — Shoulder Season1-30 Apr | 1-30 Jun1 Nov-19 Dec",
          "rows": [
            [
              "1-5 Night RatePer Person Sharing",
              "15,036"
            ],
            [
              "Single Supplement",
              "6,034"
            ],
            [
              "6-7 Night RatePer Person Sharing",
              "13,533"
            ],
            [
              "Single Supplement",
              "5,431"
            ],
            [
              "8+ Night RatePer Person Sharing",
              "12,781"
            ],
            [
              "Single Supplement",
              "5,129"
            ],
            [
              "Private VehiclePer vehicle per night",
              "9,875"
            ]
          ]
        },
        {
          "title": "Hoanib Valley Camp — Shoulder High1-31 May",
          "rows": [
            [
              "1-5 Night RatePer Person Sharing",
              "16,316"
            ],
            [
              "Single Supplement",
              "6,548"
            ],
            [
              "6-7 Night RatePer Person Sharing",
              "15,500"
            ],
            [
              "Single Supplement",
              "6,220"
            ],
            [
              "8+ Night RatePer Person Sharing",
              "14,685"
            ],
            [
              "Single Supplement",
              "5,893"
            ],
            [
              "Private VehiclePer vehicle per night",
              "9,875"
            ]
          ]
        },
        {
          "title": "Hoanib Valley Camp — High Season1 Sep-31 Oct20 Dec-9 Jan",
          "rows": [
            [
              "1-5 Night RatePer Person Sharing",
              "18,036"
            ],
            [
              "Single Supplement",
              "7,238"
            ],
            [
              "6-7 Night RatePer Person Sharing",
              "17,134"
            ],
            [
              "Single Supplement",
              "6,876"
            ],
            [
              "8+ Night RatePer Person Sharing",
              "16,233"
            ],
            [
              "Single Supplement",
              "6,514"
            ],
            [
              "Private VehiclePer vehicle per night",
              "12,095"
            ]
          ]
        },
        {
          "title": "Hoanib Valley Camp — Peak Season1 Jul-31 Aug",
          "rows": [
            [
              "1-5 Night RatePer Person Sharing",
              "20,796"
            ],
            [
              "Single Supplement",
              "8,346"
            ],
            [
              "6-7 Night RatePer Person Sharing",
              "19,756"
            ],
            [
              "Single Supplement",
              "7,928"
            ],
            [
              "8+ Night RatePer Person Sharing",
              "19,756"
            ],
            [
              "Single Supplement",
              "7,928"
            ],
            [
              "Private VehiclePer vehicle per night",
              "12,095"
            ]
          ]
        },
        {
          "title": "When would you like to travel? — Shoulder Season1-30 Apr | 1-30 Jun1 Nov-19 Dec",
          "rows": [
            [
              "1-5 Night RatePer Person Sharing",
              "15,036"
            ],
            [
              "Single Supplement",
              "6,034"
            ],
            [
              "6-7 Night RatePer Person Sharing",
              "13,533"
            ],
            [
              "Single Supplement",
              "5,431"
            ],
            [
              "8+ Night RatePer Person Sharing",
              "12,781"
            ],
            [
              "Single Supplement",
              "5,129"
            ],
            [
              "Private VehiclePer vehicle per night",
              "9,875"
            ]
          ]
        },
        {
          "title": "When would you like to travel? — Shoulder High1-31 May",
          "rows": [
            [
              "1-5 Night RatePer Person Sharing",
              "16,316"
            ],
            [
              "Single Supplement",
              "6,548"
            ],
            [
              "6-7 Night RatePer Person Sharing",
              "15,500"
            ],
            [
              "Single Supplement",
              "6,220"
            ],
            [
              "8+ Night RatePer Person Sharing",
              "14,685"
            ],
            [
              "Single Supplement",
              "5,893"
            ],
            [
              "Private VehiclePer vehicle per night",
              "9,875"
            ]
          ]
        },
        {
          "title": "When would you like to travel? — High Season1 Sep-31 Oct20 Dec-9 Jan",
          "rows": [
            [
              "1-5 Night RatePer Person Sharing",
              "18,036"
            ],
            [
              "Single Supplement",
              "7,238"
            ],
            [
              "6-7 Night RatePer Person Sharing",
              "17,134"
            ],
            [
              "Single Supplement",
              "6,876"
            ],
            [
              "8+ Night RatePer Person Sharing",
              "16,233"
            ],
            [
              "Single Supplement",
              "6,514"
            ],
            [
              "Private VehiclePer vehicle per night",
              "12,095"
            ]
          ]
        },
        {
          "title": "When would you like to travel? — Peak Season1 Jul-31 Aug",
          "rows": [
            [
              "1-5 Night RatePer Person Sharing",
              "20,796"
            ],
            [
              "Single Supplement",
              "8,346"
            ],
            [
              "6-7 Night RatePer Person Sharing",
              "19,756"
            ],
            [
              "Single Supplement",
              "7,928"
            ],
            [
              "8+ Night RatePer Person Sharing",
              "19,756"
            ],
            [
              "Single Supplement",
              "7,928"
            ],
            [
              "Private VehiclePer vehicle per night",
              "12,095"
            ]
          ]
        }
      ]
    }
  },
  "l-deritz-nest-hotel": {
    "2026": {
      "name": "Lüderitz Nest Hotel",
      "region": "Luderitz",
      "currency": "N$",
      "validity": "2026",
      "note": "Net STO rates from the supplier sheet.",
      "commission": "STO",
      "sections": [
        {
          "title": "Comfort Rooms — B&B (per room — gross) — Rate (N$)",
          "rows": [
            [
              "Comfort Single",
              "2,516"
            ],
            [
              "Comfort Twin / Double",
              "4,046"
            ],
            [
              "Comfort Family Room (max 2 adults + 2 children 0–12)",
              "6,562"
            ]
          ]
        },
        {
          "title": "Deluxe Rooms & Suite — B&B (per room — gross) — Rate (N$)",
          "rows": [
            [
              "Deluxe Single",
              "3,085.50"
            ],
            [
              "Deluxe Twin / Double",
              "4,938.50"
            ],
            [
              "Suite",
              "8,202.50"
            ],
            [
              "Tour Guide (50% of single rack)",
              "1,480"
            ]
          ]
        },
        {
          "title": "Meals (per person — gross) — Rate (N$)",
          "rows": [
            [
              "Breakfast — adult",
              "340"
            ],
            [
              "Breakfast — child 3–12 yrs",
              "240"
            ],
            [
              "Lunch — adult",
              "510"
            ],
            [
              "Lunch — child 3–12 yrs",
              "360"
            ],
            [
              "Dinner — adult",
              "660"
            ],
            [
              "Dinner — child 3–12 yrs",
              "470"
            ],
            [
              "Lunchpack",
              "320"
            ]
          ]
        }
      ]
    }
  },
  "shark-island-resort": {
    "2026": {
      "name": "Shark Island Resort",
      "region": "Luderitz",
      "currency": "N$",
      "validity": "2026",
      "note": "Net STO rates from the supplier sheet.",
      "commission": "STO",
      "sections": [
        {
          "title": "Rack Rates — Low PPS (N$)",
          "rows": [
            [
              "Campsite (max 8)",
              "330"
            ],
            [
              "Lighthouse (min 2 people)",
              "1,210"
            ]
          ]
        },
        {
          "title": "Rack Rates — High PPS (N$)",
          "rows": [
            [
              "Campsite (max 8)",
              "330"
            ],
            [
              "Lighthouse (min 2 people)",
              "1,210"
            ]
          ]
        }
      ]
    }
  },
  "forgotten-valley": {
    "2026": {
      "name": "Forgotten Valley (Ekoto Camp)",
      "region": "Opuwo",
      "currency": "N$",
      "validity": "2026",
      "note": "Net STO rates from the supplier sheet.",
      "commission": "STO",
      "sections": [
        {
          "title": "Chalet Rates 2026 — STO Rate (N$)",
          "rows": [
            [
              "Per Person Sharing — Self-Catering",
              "2,360"
            ],
            [
              "Single Person — Self-Catering",
              "4,720"
            ],
            [
              "Child 6–12 Sharing",
              "680"
            ],
            [
              "Tour Guide",
              "1,000"
            ],
            [
              "Exclusive Use — All 6 Chalets (Max 12 pax)",
              "28,320"
            ]
          ]
        },
        {
          "title": "Ekoto Excursions & Extras — STO Rate (N$)",
          "rows": [
            [
              "Compulsory Conservancy Levy (per adult per stay)",
              "250"
            ],
            [
              "Guided Hike pp (2–4 hours, min 2 pax)",
              "350"
            ]
          ]
        }
      ]
    }
  },
  "kwessi-dunes": {
    "2026": {
      "name": "Kwessi Dunes",
      "region": "Sossusvlei",
      "currency": "N$",
      "validity": "2026",
      "note": "Net STO rates from the supplier sheet.",
      "commission": "STO",
      "sections": [
        {
          "title": "Kwessi Dunes — Shoulder Season1-30 Apr | 1-30 Jun1 Nov-19 Dec",
          "rows": [
            [
              "1-5 Night RatePer Person Sharing",
              "9,996"
            ],
            [
              "Single Supplement",
              "4,011"
            ],
            [
              "6-7 Night RatePer Person Sharing",
              "8,997"
            ],
            [
              "Single Supplement",
              "3,611"
            ],
            [
              "8+ Night RatePer Person Sharing",
              "8,497"
            ],
            [
              "Single Supplement",
              "3,410"
            ],
            [
              "Private VehiclePer vehicle per night",
              "9,875"
            ]
          ]
        },
        {
          "title": "Kwessi Dunes — Shoulder High1-31 May",
          "rows": [
            [
              "1-5 Night RatePer Person Sharing",
              "11,716"
            ],
            [
              "Single Supplement",
              "4,702"
            ],
            [
              "6-7 Night RatePer Person Sharing",
              "11,130"
            ],
            [
              "Single Supplement",
              "4,467"
            ],
            [
              "8+ Night RatePer Person Sharing",
              "10,545"
            ],
            [
              "Single Supplement",
              "4,232"
            ],
            [
              "Private VehiclePer vehicle per night",
              "9,875"
            ]
          ]
        },
        {
          "title": "Kwessi Dunes — High Season1 Sep-31 Oct20 Dec-9 Jan",
          "rows": [
            [
              "1-5 Night RatePer Person Sharing",
              "14,756"
            ],
            [
              "Single Supplement",
              "5,922"
            ],
            [
              "6-7 Night RatePer Person Sharing",
              "14,018"
            ],
            [
              "Single Supplement",
              "5,626"
            ],
            [
              "8+ Night RatePer Person Sharing",
              "13,281"
            ],
            [
              "Single Supplement",
              "5,330"
            ],
            [
              "Private VehiclePer vehicle per night",
              "12,095"
            ]
          ]
        },
        {
          "title": "Kwessi Dunes — Peak Season1 Jul-31 Aug",
          "rows": [
            [
              "1-5 Night RatePer Person Sharing",
              "16,396"
            ],
            [
              "Single Supplement",
              "6,580"
            ],
            [
              "6-7 Night RatePer Person Sharing",
              "15,576"
            ],
            [
              "Single Supplement",
              "6,251"
            ],
            [
              "8+ Night RatePer Person Sharing",
              "15,576"
            ],
            [
              "Single Supplement",
              "6,251"
            ],
            [
              "Private VehiclePer vehicle per night",
              "12,095"
            ]
          ]
        },
        {
          "title": "When would you like to travel? — Shoulder Season1-30 Apr | 1-30 Jun1 Nov-19 Dec",
          "rows": [
            [
              "1-5 Night RatePer Person Sharing",
              "9,996"
            ],
            [
              "Single Supplement",
              "4,011"
            ],
            [
              "6-7 Night RatePer Person Sharing",
              "8,997"
            ],
            [
              "Single Supplement",
              "3,611"
            ],
            [
              "8+ Night RatePer Person Sharing",
              "8,497"
            ],
            [
              "Single Supplement",
              "3,410"
            ],
            [
              "Private VehiclePer vehicle per night",
              "9,875"
            ]
          ]
        },
        {
          "title": "When would you like to travel? — Shoulder High1-31 May",
          "rows": [
            [
              "1-5 Night RatePer Person Sharing",
              "11,716"
            ],
            [
              "Single Supplement",
              "4,702"
            ],
            [
              "6-7 Night RatePer Person Sharing",
              "11,130"
            ],
            [
              "Single Supplement",
              "4,467"
            ],
            [
              "8+ Night RatePer Person Sharing",
              "10,545"
            ],
            [
              "Single Supplement",
              "4,232"
            ],
            [
              "Private VehiclePer vehicle per night",
              "9,875"
            ]
          ]
        },
        {
          "title": "When would you like to travel? — High Season1 Sep-31 Oct20 Dec-9 Jan",
          "rows": [
            [
              "1-5 Night RatePer Person Sharing",
              "14,756"
            ],
            [
              "Single Supplement",
              "5,922"
            ],
            [
              "6-7 Night RatePer Person Sharing",
              "14,018"
            ],
            [
              "Single Supplement",
              "5,626"
            ],
            [
              "8+ Night RatePer Person Sharing",
              "13,281"
            ],
            [
              "Single Supplement",
              "5,330"
            ],
            [
              "Private VehiclePer vehicle per night",
              "12,095"
            ]
          ]
        },
        {
          "title": "When would you like to travel? — Peak Season1 Jul-31 Aug",
          "rows": [
            [
              "1-5 Night RatePer Person Sharing",
              "16,396"
            ],
            [
              "Single Supplement",
              "6,580"
            ],
            [
              "6-7 Night RatePer Person Sharing",
              "15,576"
            ],
            [
              "Single Supplement",
              "6,251"
            ],
            [
              "8+ Night RatePer Person Sharing",
              "15,576"
            ],
            [
              "Single Supplement",
              "6,251"
            ],
            [
              "Private VehiclePer vehicle per night",
              "12,095"
            ]
          ]
        }
      ]
    }
  },
  "anderssons-at-ongava": {
    "2026": {
      "name": "Anderssons at Ongava",
      "region": "South Etosha",
      "currency": "N$",
      "validity": "2026",
      "note": "Net STO rates from the supplier sheet.",
      "commission": "STO",
      "sections": [
        {
          "title": "STO15 Rates — 11.01.2026 to 10.01.2027 — Accommodation Rate (N$)",
          "rows": [
            [
              "Fully Inclusive",
              "19,890"
            ],
            [
              "Fully Inclusive",
              "25,160"
            ]
          ]
        },
        {
          "title": "STO15 Rates — 11.01.2026 to 10.01.2027 — Conservation Fee (N$)",
          "rows": [
            [
              "Fully Inclusive",
              "1,200"
            ],
            [
              "Fully Inclusive",
              "1,200"
            ]
          ]
        },
        {
          "title": "Child Rates — Fully Inclusive — Accommodation Rate (N$)",
          "rows": [
            [
              "Ongava Lodge, Tented Camp & Anderssons",
              "14,000"
            ]
          ]
        },
        {
          "title": "Child Rates — Fully Inclusive — Conservation Fee (N$)",
          "rows": [
            [
              "Ongava Lodge, Tented Camp & Anderssons",
              "600"
            ]
          ]
        },
        {
          "title": "Guide & Pilot Rates — Rate (N$)",
          "rows": [
            [
              "Per single unit",
              "1,800"
            ]
          ]
        },
        {
          "title": "Activities & Miscellaneous — Rate (N$)",
          "rows": [
            [
              "Lunch Pack",
              "600"
            ],
            [
              "Etosha Game Drives (Scheduled)",
              "2,600"
            ],
            [
              "Ongava Property Game Drives (Scheduled)",
              "1,600"
            ],
            [
              "Nature Walk (Scheduled)",
              "700"
            ],
            [
              "Night Drives (Scheduled)",
              "1,400"
            ],
            [
              "Airfield Passenger Fee",
              "700"
            ],
            [
              "Airfield Transfer — each way",
              "600"
            ],
            [
              "Private Activities — Sole Use Guide & Vehicle (FI only)",
              "18,700"
            ]
          ]
        }
      ]
    }
  },
  "little-ongava": {
    "2026": {
      "name": "Little Ongava",
      "region": "South Etosha",
      "currency": "N$",
      "validity": "2026",
      "note": "Net STO rates from the supplier sheet.",
      "commission": "STO",
      "sections": [
        {
          "title": "STO15 Rates — 11.01.2026 to 10.01.2027 — Accommodation Rate (N$)",
          "rows": [
            [
              "Fully Inclusive",
              "43,180"
            ],
            [
              "Fully Inclusive",
              "53,924"
            ]
          ]
        },
        {
          "title": "STO15 Rates — 11.01.2026 to 10.01.2027 — Conservation Fee (N$)",
          "rows": [
            [
              "Fully Inclusive",
              "1,200"
            ],
            [
              "Fully Inclusive",
              "1,200"
            ]
          ]
        },
        {
          "title": "Child Rates — Fully Inclusive — Accommodation Rate (N$)",
          "rows": [
            [
              "Fully Inclusive",
              "37,000"
            ]
          ]
        },
        {
          "title": "Child Rates — Fully Inclusive — Conservation Fee (N$)",
          "rows": [
            [
              "Fully Inclusive",
              "600"
            ]
          ]
        },
        {
          "title": "Guide & Pilot Rates — Rate (N$)",
          "rows": [
            [
              "Per single unit",
              "1,800"
            ]
          ]
        }
      ]
    }
  },
  "ongava-lodge": {
    "2026": {
      "name": "Ongava Lodge",
      "region": "South Etosha",
      "currency": "N$",
      "validity": "2026",
      "note": "Net STO rates from the supplier sheet.",
      "commission": "STO",
      "sections": [
        {
          "title": "STO15 Rates — 11.01.2026 to 10.01.2027 — Accommodation Rate (N$)",
          "rows": [
            [
              "Full Board",
              "10,030"
            ],
            [
              "Full Board",
              "12,835"
            ],
            [
              "Fully Inclusive",
              "14,705"
            ],
            [
              "Fully Inclusive",
              "18,615"
            ]
          ]
        },
        {
          "title": "STO15 Rates — 11.01.2026 to 10.01.2027 — Conservation Fee (N$)",
          "rows": [
            [
              "Full Board",
              "1,200"
            ],
            [
              "Full Board",
              "1,200"
            ],
            [
              "Fully Inclusive",
              "1,200"
            ],
            [
              "Fully Inclusive",
              "1,200"
            ]
          ]
        },
        {
          "title": "Child Rates — Accommodation Rate (N$)",
          "rows": [
            [
              "Full Board",
              "9,300"
            ],
            [
              "Fully Inclusive",
              "14,000"
            ]
          ]
        },
        {
          "title": "Child Rates — Conservation Fee (N$)",
          "rows": [
            [
              "Full Board",
              "600"
            ],
            [
              "Fully Inclusive",
              "600"
            ]
          ]
        },
        {
          "title": "Guide & Pilot Rates — Rate (N$)",
          "rows": [
            [
              "Per single unit",
              "1,800"
            ]
          ]
        },
        {
          "title": "Activities & Miscellaneous — Rate (N$)",
          "rows": [
            [
              "Lunch Pack",
              "600"
            ],
            [
              "Etosha Game Drives (Scheduled)",
              "2,600"
            ],
            [
              "Ongava Property Game Drives (Scheduled)",
              "1,600"
            ],
            [
              "Nature Walk (Scheduled)",
              "700"
            ],
            [
              "Night Drives (Scheduled)",
              "1,400"
            ],
            [
              "Ongava Airfield Passenger Fee",
              "700"
            ],
            [
              "Airfield Transfer — each way",
              "600"
            ],
            [
              "Private Activities — Sole Use Guide & Vehicle (FI only)",
              "18,700"
            ]
          ]
        }
      ]
    }
  },
  "ongava-tented-camp": {
    "2026": {
      "name": "Ongava Tented Camp",
      "region": "South Etosha",
      "currency": "N$",
      "validity": "2026",
      "note": "Net STO rates from the supplier sheet.",
      "commission": "STO",
      "sections": [
        {
          "title": "STO15 Rates — 11.01.2026 to 10.01.2027 — Accommodation Rate (N$)",
          "rows": [
            [
              "Fully Inclusive",
              "14,705"
            ],
            [
              "Fully Inclusive",
              "18,615"
            ]
          ]
        },
        {
          "title": "STO15 Rates — 11.01.2026 to 10.01.2027 — Conservation Fee (N$)",
          "rows": [
            [
              "Fully Inclusive",
              "1,200"
            ],
            [
              "Fully Inclusive",
              "1,200"
            ]
          ]
        },
        {
          "title": "Child Rates — Fully Inclusive — Accommodation Rate (N$)",
          "rows": [
            [
              "Ongava Lodge, Tented Camp & Anderssons",
              "14,000"
            ]
          ]
        },
        {
          "title": "Child Rates — Fully Inclusive — Conservation Fee (N$)",
          "rows": [
            [
              "Ongava Lodge, Tented Camp & Anderssons",
              "600"
            ]
          ]
        },
        {
          "title": "Guide & Pilot Rates — Rate (N$)",
          "rows": [
            [
              "Per single unit",
              "1,800"
            ]
          ]
        },
        {
          "title": "Activities & Miscellaneous — Rate (N$)",
          "rows": [
            [
              "Lunch Pack",
              "600"
            ],
            [
              "Etosha Game Drives (Scheduled)",
              "2,600"
            ],
            [
              "Ongava Property Game Drives (Scheduled)",
              "1,600"
            ],
            [
              "Nature Walk (Scheduled)",
              "700"
            ],
            [
              "Night Drives (Scheduled)",
              "1,400"
            ],
            [
              "Ongava Airfield Passenger Fee",
              "700"
            ],
            [
              "Airfield Transfer — Ongava Camp to/from airfield (each way)",
              "600"
            ],
            [
              "Private Activities — Sole Use Guide & Vehicle (FI only)",
              "18,700"
            ]
          ]
        }
      ]
    }
  },
  "etosha-mountain-lodge": {
    "2026": {
      "name": "Etosha Mountain Lodge",
      "region": "West Etosha",
      "currency": "N$",
      "validity": "2026",
      "note": "Net STO rates from the supplier sheet.",
      "commission": "STO",
      "sections": [
        {
          "title": "Dinner, Bed and Breakfast -- Per Person Sharing — Green Season10 Jan-31 Mar",
          "rows": [
            [
              "1-5 Night Rate",
              "3,516"
            ],
            [
              "6-7 Night Rate",
              "3,165"
            ],
            [
              "8+ Night Rate",
              "2,989"
            ]
          ]
        },
        {
          "title": "Dinner, Bed and Breakfast -- Per Person Sharing — Shoulder Season1-30 Apr | 1-30 Jun1 Nov-19 Dec",
          "rows": [
            [
              "1-5 Night Rate",
              "4,476"
            ],
            [
              "6-7 Night Rate",
              "4,029"
            ],
            [
              "8+ Night Rate",
              "3,805"
            ],
            [
              "Single Supplement",
              "17,961,527"
            ]
          ]
        },
        {
          "title": "Dinner, Bed and Breakfast -- Per Person Sharing — Shoulder High1-31 May",
          "rows": [
            [
              "1-5 Night Rate",
              "4,916"
            ],
            [
              "6-7 Night Rate",
              "4,670"
            ],
            [
              "8+ Night Rate",
              "4,425"
            ],
            [
              "Single Supplement",
              "19,731,776"
            ]
          ]
        },
        {
          "title": "Dinner, Bed and Breakfast -- Per Person Sharing — High Season1 Sep-31 Oct20 Dec-9 Jan",
          "rows": [
            [
              "1-5 Night Rate",
              "5,180"
            ],
            [
              "6-7 Night Rate",
              "4,921"
            ],
            [
              "8+ Night Rate",
              "4,662"
            ],
            [
              "Single Supplement",
              "20,791,871"
            ]
          ]
        },
        {
          "title": "Dinner, Bed and Breakfast -- Per Person Sharing — Peak Season1 Jul-31 Aug",
          "rows": [
            [
              "1-5 Night Rate",
              "5,876"
            ],
            [
              "6-7 Night Rate",
              "5,582"
            ],
            [
              "8+ Night Rate",
              "5,582"
            ],
            [
              "Single Supplement",
              "23,582,240"
            ]
          ]
        },
        {
          "title": "Fully Inclusive -- Per Person Sharing — Green Season10 Jan-31 Mar",
          "rows": [
            [
              "1-5 Night Rate",
              "5,860"
            ],
            [
              "6-7 Night Rate",
              "5,274"
            ],
            [
              "8+ Night Rate",
              "4,981"
            ]
          ]
        },
        {
          "title": "Fully Inclusive -- Per Person Sharing — Shoulder Season1-30 Apr | 1-30 Jun1 Nov-19 Dec",
          "rows": [
            [
              "1-5 Night Rate",
              "6,868"
            ],
            [
              "6-7 Night Rate",
              "6,182"
            ],
            [
              "8+ Night Rate",
              "5,838"
            ],
            [
              "Single Supplement",
              "27,562,343"
            ]
          ]
        },
        {
          "title": "Fully Inclusive -- Per Person Sharing — Shoulder High1-31 May",
          "rows": [
            [
              "1-5 Night Rate",
              "7,500"
            ],
            [
              "6-7 Night Rate",
              "7,125"
            ],
            [
              "8+ Night Rate",
              "6,750"
            ],
            [
              "Single Supplement",
              "30,102,709"
            ]
          ]
        },
        {
          "title": "Fully Inclusive -- Per Person Sharing — High Season1 Sep-31 Oct20 Dec-9 Jan",
          "rows": [
            [
              "1-5 Night Rate",
              "7,796"
            ],
            [
              "6-7 Night Rate",
              "7,406"
            ],
            [
              "8+ Night Rate",
              "7,017"
            ],
            [
              "Single Supplement",
              "31,292,816"
            ]
          ]
        },
        {
          "title": "Fully Inclusive -- Per Person Sharing — Peak Season1 Jul-31 Aug",
          "rows": [
            [
              "1-5 Night Rate",
              "8,636"
            ],
            [
              "6-7 Night Rate",
              "8,204"
            ],
            [
              "8+ Night Rate",
              "8,204"
            ],
            [
              "Single Supplement",
              "34,663,292"
            ]
          ]
        }
      ]
    }
  },
  "safari-house": {
    "2026": {
      "name": "Safari House",
      "region": "West Etosha",
      "currency": "N$",
      "validity": "2026",
      "note": "Net STO rates from the supplier sheet.",
      "commission": "STO",
      "sections": [
        {
          "title": "Safari House — Green Season10 Jan-31 Mar",
          "rows": [
            [
              "1-5 Night Rate",
              "29,300"
            ],
            [
              "6-7 Night Rate",
              "26,370"
            ],
            [
              "8+ Night Rate",
              "24,905"
            ]
          ]
        },
        {
          "title": "Safari House — Shoulder Season1-30 Apr | 1-30 Jun1 Nov-19 Dec",
          "rows": [
            [
              "1-5 Night Rate",
              "34,340"
            ],
            [
              "6-7 Night Rate",
              "30,906"
            ],
            [
              "8+ Night Rate",
              "29,189"
            ]
          ]
        },
        {
          "title": "Safari House — Shoulder High1-31 May",
          "rows": [
            [
              "1-5 Night Rate",
              "37,500"
            ],
            [
              "6-7 Night Rate",
              "35,625"
            ],
            [
              "8+ Night Rate",
              "33,750"
            ]
          ]
        },
        {
          "title": "Safari House — High Season1 Sep-31 Oct20 Dec-9 Jan",
          "rows": [
            [
              "1-5 Night Rate",
              "38,980"
            ],
            [
              "6-7 Night Rate",
              "37,031"
            ],
            [
              "8+ Night Rate",
              "35,082"
            ]
          ]
        },
        {
          "title": "Safari House — Peak Season1 Jul-31 Aug",
          "rows": [
            [
              "1-5 Night Rate",
              "43,180"
            ],
            [
              "6-7 Night Rate",
              "41,021"
            ],
            [
              "8+ Night Rate",
              "41,021"
            ]
          ]
        },
        {
          "title": "When would you like to travel? — Green Season10 Jan-31 Mar",
          "rows": [
            [
              "1-5 Night Rate",
              "29,300"
            ],
            [
              "6-7 Night Rate",
              "26,370"
            ],
            [
              "8+ Night Rate",
              "24,905"
            ]
          ]
        },
        {
          "title": "When would you like to travel? — Shoulder Season1-30 Apr | 1-30 Jun1 Nov-19 Dec",
          "rows": [
            [
              "1-5 Night Rate",
              "34,340"
            ],
            [
              "6-7 Night Rate",
              "30,906"
            ],
            [
              "8+ Night Rate",
              "29,189"
            ]
          ]
        },
        {
          "title": "When would you like to travel? — Shoulder High1-31 May",
          "rows": [
            [
              "1-5 Night Rate",
              "37,500"
            ],
            [
              "6-7 Night Rate",
              "35,625"
            ],
            [
              "8+ Night Rate",
              "33,750"
            ]
          ]
        },
        {
          "title": "When would you like to travel? — High Season1 Sep-31 Oct20 Dec-9 Jan",
          "rows": [
            [
              "1-5 Night Rate",
              "38,980"
            ],
            [
              "6-7 Night Rate",
              "37,031"
            ],
            [
              "8+ Night Rate",
              "35,082"
            ]
          ]
        },
        {
          "title": "When would you like to travel? — Peak Season1 Jul-31 Aug",
          "rows": [
            [
              "1-5 Night Rate",
              "43,180"
            ],
            [
              "6-7 Night Rate",
              "41,021"
            ],
            [
              "8+ Night Rate",
              "41,021"
            ]
          ]
        }
      ]
    }
  },
  "safarihoek-lodge": {
    "2026": {
      "name": "Safarihoek Lodge",
      "region": "West Etosha",
      "currency": "N$",
      "validity": "2026",
      "note": "Net STO rates from the supplier sheet.",
      "commission": "STO",
      "sections": [
        {
          "title": "Luxury Room -- DBB Per Person Sharing — Green Season10 Jan-31 Mar",
          "rows": [
            [
              "1-5 Night Rate",
              "5,196"
            ],
            [
              "6-7 Night Rate",
              "4,677"
            ],
            [
              "8+ Night Rate",
              "4,417"
            ]
          ]
        },
        {
          "title": "Luxury Room -- DBB Per Person Sharing — Shoulder Season1-30 Apr | 1-30 Jun1 Nov-19 Dec",
          "rows": [
            [
              "1-5 Night Rate",
              "6,028"
            ],
            [
              "6-7 Night Rate",
              "5,426"
            ],
            [
              "8+ Night Rate",
              "5,124"
            ]
          ]
        },
        {
          "title": "Luxury Room -- DBB Per Person Sharing — Shoulder High1-31 May",
          "rows": [
            [
              "1-5 Night Rate",
              "6,380"
            ],
            [
              "6-7 Night Rate",
              "6,061"
            ],
            [
              "8+ Night Rate",
              "5,742"
            ]
          ]
        },
        {
          "title": "Luxury Room -- DBB Per Person Sharing — High Season1 Sep-31 Oct20 Dec-9 Jan",
          "rows": [
            [
              "1-5 Night Rate",
              "6,860"
            ],
            [
              "6-7 Night Rate",
              "6,517"
            ],
            [
              "8+ Night Rate",
              "6,174"
            ]
          ]
        },
        {
          "title": "Luxury Room -- DBB Per Person Sharing — Peak Season1 Jul-31 Aug",
          "rows": [
            [
              "1-5 Night Rate",
              "7,560"
            ],
            [
              "6-7 Night Rate",
              "7,182"
            ],
            [
              "8+ Night Rate",
              "7,182"
            ]
          ]
        },
        {
          "title": "Classic Room -- DBB Per Person Sharing — Green Season10 Jan-31 Mar",
          "rows": [
            [
              "1-5 Night Rate",
              "4,636"
            ],
            [
              "6-7 Night Rate",
              "4,173"
            ],
            [
              "8+ Night Rate",
              "3,941"
            ]
          ]
        },
        {
          "title": "Classic Room -- DBB Per Person Sharing — Shoulder Season1-30 Apr | 1-30 Jun1 Nov-19 Dec",
          "rows": [
            [
              "1-5 Night Rate",
              "5,400"
            ],
            [
              "6-7 Night Rate",
              "4,860"
            ],
            [
              "8+ Night Rate",
              "4,590"
            ]
          ]
        },
        {
          "title": "Classic Room -- DBB Per Person Sharing — Shoulder High1-31 May",
          "rows": [
            [
              "1-5 Night Rate",
              "5,716"
            ],
            [
              "6-7 Night Rate",
              "5,430"
            ],
            [
              "8+ Night Rate",
              "5,145"
            ]
          ]
        },
        {
          "title": "Classic Room -- DBB Per Person Sharing — High Season1 Sep-31 Oct20 Dec-9 Jan",
          "rows": [
            [
              "1-5 Night Rate",
              "6,140"
            ],
            [
              "6-7 Night Rate",
              "5,833"
            ],
            [
              "8+ Night Rate",
              "5,526"
            ]
          ]
        },
        {
          "title": "Classic Room -- DBB Per Person Sharing — Peak Season1 Jul-31 Aug",
          "rows": [
            [
              "1-5 Night Rate",
              "6,796"
            ],
            [
              "6-7 Night Rate",
              "6,456"
            ],
            [
              "8+ Night Rate",
              "6,456"
            ]
          ]
        },
        {
          "title": "Luxury Room -- Fully Inclusive Per Person Sharing — Green Season10 Jan-31 Mar",
          "rows": [
            [
              "1-5 Night Rate",
              "7,156"
            ],
            [
              "6-7 Night Rate",
              "6,441"
            ],
            [
              "8+ Night Rate",
              "6,082"
            ]
          ]
        },
        {
          "title": "Luxury Room -- Fully Inclusive Per Person Sharing — Shoulder Season1-30 Apr | 1-30 Jun1 Nov-19 Dec",
          "rows": [
            [
              "1-5 Night Rate",
              "8,196"
            ],
            [
              "6-7 Night Rate",
              "7,377"
            ],
            [
              "8+ Night Rate",
              "6,966"
            ]
          ]
        },
        {
          "title": "Luxury Room -- Fully Inclusive Per Person Sharing — Shoulder High1-31 May",
          "rows": [
            [
              "1-5 Night Rate",
              "8,700"
            ],
            [
              "6-7 Night Rate",
              "8,265"
            ],
            [
              "8+ Night Rate",
              "7,830"
            ]
          ]
        },
        {
          "title": "Luxury Room -- Fully Inclusive Per Person Sharing — High Season1 Sep-31 Oct20 Dec-9 Jan",
          "rows": [
            [
              "1-5 Night Rate",
              "9,100"
            ],
            [
              "6-7 Night Rate",
              "8,645"
            ],
            [
              "8+ Night Rate",
              "8,190"
            ]
          ]
        },
        {
          "title": "Luxury Room -- Fully Inclusive Per Person Sharing — Peak Season1 Jul-31 Aug",
          "rows": [
            [
              "1-5 Night Rate",
              "10,212"
            ],
            [
              "6-7 Night Rate",
              "9,702"
            ],
            [
              "8+ Night Rate",
              "9,702"
            ]
          ]
        },
        {
          "title": "Classic Room -- Fully Inclusive Per Person Sharing — Green Season10 Jan-31 Mar",
          "rows": [
            [
              "1-5 Night Rate",
              "5,812"
            ],
            [
              "6-7 Night Rate",
              "5,231"
            ],
            [
              "8+ Night Rate",
              "4,940"
            ]
          ]
        },
        {
          "title": "Classic Room -- Fully Inclusive Per Person Sharing — Shoulder Season1-30 Apr | 1-30 Jun1 Nov-19 Dec",
          "rows": [
            [
              "1-5 Night Rate",
              "6,908"
            ],
            [
              "6-7 Night Rate",
              "6,218"
            ],
            [
              "8+ Night Rate",
              "5,872"
            ]
          ]
        },
        {
          "title": "Classic Room -- Fully Inclusive Per Person Sharing — Shoulder High1-31 May",
          "rows": [
            [
              "1-5 Night Rate",
              "7,324"
            ],
            [
              "6-7 Night Rate",
              "6,958"
            ],
            [
              "8+ Night Rate",
              "6,592"
            ]
          ]
        },
        {
          "title": "Classic Room -- Fully Inclusive Per Person Sharing — High Season1 Sep-31 Oct20 Dec-9 Jan",
          "rows": [
            [
              "1-5 Night Rate",
              "7,436"
            ],
            [
              "6-7 Night Rate",
              "7,064"
            ],
            [
              "8+ Night Rate",
              "6,693"
            ]
          ]
        },
        {
          "title": "Classic Room -- Fully Inclusive Per Person Sharing — Peak Season1 Jul-31 Aug",
          "rows": [
            [
              "1-5 Night Rate",
              "8,316"
            ],
            [
              "6-7 Night Rate",
              "7,900"
            ],
            [
              "8+ Night Rate",
              "7,900"
            ]
          ]
        }
      ]
    }
  },
  "windhoek-lux-suites": {
    "2026": {
      "name": "The Windhoek Lux Suites",
      "region": "Windhoek",
      "currency": "N$",
      "validity": "2026",
      "note": "Net STO rates from the supplier sheet.",
      "commission": "STO",
      "sections": [
        {
          "title": "Rooms — B&B (per room) — Rate (N$)",
          "rows": [
            [
              "Ground Room — Single",
              "2,057"
            ],
            [
              "Ground Room — Double",
              "3,085.50"
            ],
            [
              "Loft Room — Single",
              "2,057"
            ],
            [
              "Loft Room — Double",
              "3,085.50"
            ]
          ]
        },
        {
          "title": "Family Rooms — B&B (per room) — Rate (N$)",
          "rows": [
            [
              "Family Room — 2 adults + 2 children",
              "4,114"
            ],
            [
              "Family Room — 2 adults + 1 child",
              "3,599.75"
            ]
          ]
        },
        {
          "title": "Children — Rate (N$)",
          "rows": [
            [
              "Children under 3 yrs",
              "0"
            ]
          ]
        }
      ]
    }
  },
  "mowani-campsite": {
    "2026": {
      "name": "Mowani Campsite",
      "region": "Damaraland",
      "currency": "N$",
      "validity": "2026",
      "note": "Net STO rates from the supplier sheet.",
      "commission": "STO",
      "sections": [
        {
          "title": "NETT Rates — 01 Jan 2026 to 31 Dec 2026 — Nett Price (N$)",
          "rows": [
            [
              "Campsite — Per Adult per night",
              "520"
            ],
            [
              "Campsite — Per Child (3-12 yrs) per night",
              "240"
            ],
            [
              "Campsite — Child under 3 yrs",
              "0"
            ]
          ]
        }
      ]
    }
  },
  "onguma-leadwood-campsite": {
    "2026": {
      "name": "Onguma Leadwood Campsite",
      "region": "East Etosha",
      "currency": "N$",
      "validity": "2026",
      "note": "Net STO rates from the supplier sheet.",
      "commission": "STO",
      "sections": [
        {
          "title": "Campsite Rates — 01.11.2025 to 31.10.2026 — Rate (N$)",
          "rows": [
            [
              "Camping Site — per adult (nett)",
              "500"
            ],
            [
              "Camping Site — per child 3–11 (nett)",
              "250"
            ]
          ]
        },
        {
          "title": "Activities & Nature Drives — Rate",
          "rows": [
            [
              "Morning / Afternoon Etosha Game Drive (4 hrs)",
              "1,750"
            ],
            [
              "Onguma Sunrise Drive (3 hrs)",
              "890"
            ],
            [
              "Onguma Sundowner Drive (3 hrs)",
              "890"
            ],
            [
              "Interpretive Nature Walk (1½ hrs · min age 16)",
              "890"
            ],
            [
              "Mid-Morning Onkolo Hide (3 hrs · min age 7)",
              "650"
            ],
            [
              "Young Explorers Walk (1½ hrs)",
              "420"
            ],
            [
              "Private Game Drive (4 hrs)",
              "9,700"
            ],
            [
              "Private Game Drive — Full Day (8 hrs)",
              "15,500"
            ],
            [
              "Private Game Drive — Fully Inclusive surcharge (per activity)",
              "6,000"
            ],
            [
              "Private Game Drive — Fully Inclusive surcharge (full day)",
              "7,500"
            ]
          ]
        },
        {
          "title": "Onguma Dream Cruiser (Sleep-Out) — Rate",
          "rows": [
            [
              "Onguma Dream Cruiser (max 2 guests)",
              "9,800"
            ],
            [
              "Additional surcharge — Leadwood & Tamboti Campsite",
              "5,200"
            ]
          ]
        },
        {
          "title": "Additional Meals — Rate",
          "rows": [
            [
              "Breakfast",
              "290"
            ],
            [
              "Breakfast Pack",
              "290"
            ],
            [
              "Lunch (3 course)",
              "360"
            ],
            [
              "Lunch Pack",
              "260"
            ],
            [
              "Dinner (3 course)",
              "640"
            ],
            [
              "Dinner (4 course)",
              "810"
            ]
          ]
        }
      ]
    }
  },
  "onguma-tamboti-campsite": {
    "2026": {
      "name": "Onguma Tamboti Campsite",
      "region": "East Etosha",
      "currency": "N$",
      "validity": "2026",
      "note": "Net STO rates from the supplier sheet.",
      "commission": "STO",
      "sections": [
        {
          "title": "Campsite Rates — 01.11.2025 to 31.10.2026 — Rate (N$)",
          "rows": [
            [
              "Camping Site — per adult (nett)",
              "500"
            ],
            [
              "Camping Site — per child 3–11 (nett)",
              "250"
            ]
          ]
        },
        {
          "title": "Activities & Nature Drives — Rate",
          "rows": [
            [
              "Morning / Afternoon Etosha Game Drive (4 hrs)",
              "1,750"
            ],
            [
              "Onguma Sunrise Drive (3 hrs)",
              "890"
            ],
            [
              "Onguma Sundowner Drive (3 hrs)",
              "890"
            ],
            [
              "Interpretive Nature Walk (1½ hrs · min age 16)",
              "890"
            ],
            [
              "Mid-Morning Onkolo Hide (3 hrs · min age 7)",
              "650"
            ],
            [
              "Young Explorers Walk (1½ hrs)",
              "420"
            ],
            [
              "Private Game Drive (4 hrs)",
              "9,700"
            ],
            [
              "Private Game Drive — Full Day (8 hrs)",
              "15,500"
            ],
            [
              "Private Game Drive — Fully Inclusive surcharge (per activity)",
              "6,000"
            ],
            [
              "Private Game Drive — Fully Inclusive surcharge (full day)",
              "7,500"
            ]
          ]
        },
        {
          "title": "Onguma Dream Cruiser (Sleep-Out) — Rate",
          "rows": [
            [
              "Onguma Dream Cruiser (max 2 guests)",
              "9,800"
            ],
            [
              "Additional surcharge — Leadwood & Tamboti Campsite",
              "5,200"
            ]
          ]
        },
        {
          "title": "Additional Meals — Rate",
          "rows": [
            [
              "Breakfast",
              "290"
            ],
            [
              "Breakfast Pack",
              "290"
            ],
            [
              "Lunch (3 course)",
              "360"
            ],
            [
              "Lunch Pack",
              "260"
            ],
            [
              "Dinner (3 course)",
              "640"
            ],
            [
              "Dinner (4 course)",
              "810"
            ]
          ]
        }
      ]
    }
  },
  "chobe-river-camp": {
    "2026": {
      "name": "Chobe River Camp",
      "region": "Chobe",
      "currency": "N$",
      "validity": "2026",
      "note": "Net STO rates from the supplier sheet.",
      "commission": "STO",
      "sections": [
        {
          "title": "2026 — net STO",
          "rows": [
            [
              "Double/Twin/Family -- Sharing BB",
              "1,891.20"
            ],
            [
              "Single -- BB",
              "2,364"
            ],
            [
              "Chobe Campsite pppn (10% commission)",
              "307"
            ],
            [
              "Morning or Afternoon Boat Cruise (guided, seasonal, 3hrs)",
              "738.75"
            ],
            [
              "Sundowner Boat Cruise (guided, seasonal, 2hrs)",
              "397.50"
            ],
            [
              "Walking Trail (guided, seasonal, 1-2hrs -- direct booking only)",
              "341.25"
            ],
            [
              "Canoe Trip (guided, 1.5hrs, refreshments -- direct booking only)",
              "416.25"
            ],
            [
              "Birding Drive (guided, 3hrs, refreshments -- direct booking only)",
              "382.50"
            ],
            [
              "Dinner (buffet/set)",
              "572"
            ],
            [
              "Lunch",
              "228"
            ],
            [
              "Full 3-Course Lunch",
              "341"
            ],
            [
              "Lunch Pack",
              "226"
            ]
          ]
        }
      ]
    }
  },
  "hakusembe-camping2go": {
    "2026": {
      "name": "Hakusembe Camping2Go",
      "region": "Caprivi",
      "currency": "N$",
      "validity": "2026",
      "note": "Net STO rates from the supplier sheet.",
      "commission": "STO",
      "sections": [
        {
          "title": "2026 — net STO",
          "rows": [
            [
              "Camping2Go Tent -- Sharing pppn",
              "867.20"
            ],
            [
              "Camping2Go Tent -- Single pppn",
              "1,732.80"
            ],
            [
              "Dinner pp -- buffet",
              "572"
            ],
            [
              "Breakfast pp -- buffet",
              "284"
            ],
            [
              "Lunch pp",
              "228"
            ]
          ]
        }
      ]
    }
  },
  "namushasha-river-camping2go": {
    "2026": {
      "name": "Namushasha Camping2Go",
      "region": "Caprivi",
      "currency": "N$",
      "validity": "2026",
      "note": "Net STO rates from the supplier sheet.",
      "commission": "STO",
      "sections": [
        {
          "title": "2026 — net STO",
          "rows": [
            [
              "Camping2Go Tent -- Sharing pppn",
              "867.20"
            ],
            [
              "Camping2Go Tent -- Single pppn",
              "1,732.80"
            ],
            [
              "Dinner pp -- buffet",
              "572"
            ],
            [
              "Breakfast pp -- buffet",
              "284"
            ],
            [
              "Lunch pp",
              "228"
            ]
          ]
        }
      ]
    }
  },
  "namushasha-camping2go": {
    "2026": {
      "name": "Namushasha Camping2go",
      "region": "Caprivi",
      "currency": "N$",
      "validity": "2026",
      "note": "Net STO rates from the supplier sheet.",
      "commission": "STO",
      "sections": [
        {
          "title": "2026 — net STO",
          "rows": [
            [
              "Camping2Go Tent -- Sharing pppn",
              "867.20"
            ],
            [
              "Camping2Go Tent -- Single pppn",
              "1,732.80"
            ],
            [
              "Dinner pp -- buffet",
              "572"
            ],
            [
              "Breakfast pp -- buffet",
              "284"
            ],
            [
              "Lunch pp",
              "228"
            ]
          ]
        }
      ]
    }
  },
  "namushasha-river-villa": {
    "2026": {
      "name": "Namushasha River Villa",
      "region": "Caprivi",
      "currency": "N$",
      "validity": "2026",
      "note": "Net STO rates from the supplier sheet.",
      "commission": "STO",
      "sections": [
        {
          "title": "2026 — net STO",
          "rows": [
            [
              "Per room/night -- Fully Inclusive (max 2 pax)",
              "24,200"
            ],
            [
              "Transfer to Katima Mpacha Airport return (120km)",
              "1,005"
            ],
            [
              "Transfer to Lianshulu return (25km)",
              "330"
            ],
            [
              "Package Transfer -- Airport and 3 Zambezi properties return",
              "1,170"
            ],
            [
              "Dinner (buffet/set)",
              "572"
            ],
            [
              "Lunch",
              "228"
            ],
            [
              "Full 3-Course Lunch",
              "341"
            ],
            [
              "Lunch Pack",
              "226"
            ]
          ]
        }
      ]
    }
  },
  "zambezi-mubala-camp": {
    "2026": {
      "name": "Zambezi Mubala Camp",
      "region": "Caprivi",
      "currency": "N$",
      "validity": "2026",
      "note": "Net STO rates from the supplier sheet.",
      "commission": "STO",
      "sections": [
        {
          "title": "2026 — net STO",
          "rows": [
            [
              "Self-Catering Tent -- Sharing pppn",
              "867.20"
            ],
            [
              "Self-Catering Tent -- Single pppn",
              "1,732.80"
            ],
            [
              "Zambezi Mubala Campsite pppn (10% commission)",
              "307"
            ],
            [
              "Sundowner Boat Cruise (guided, 1.5hrs, refreshments)",
              "460"
            ],
            [
              "Morning or Afternoon Boat Cruise (guided, 3hrs, refreshments)",
              "790"
            ],
            [
              "Nature Walk to bird colonies (guided, 3hrs, seasonal -- direct booking)",
              "305"
            ],
            [
              "Transfer to Katima Mpacha Airport return (50km)",
              "505"
            ],
            [
              "Package Transfer -- Airport and 3 Zambezi properties return",
              "1,170"
            ],
            [
              "Dinner (buffet/set)",
              "572"
            ],
            [
              "Lunch",
              "228"
            ],
            [
              "Full 3-Course Lunch",
              "341"
            ],
            [
              "Lunch Pack",
              "226"
            ]
          ]
        }
      ]
    }
  },
  "zambezi-mubala-lodge": {
    "2026": {
      "name": "Zambezi Mubala Lodge",
      "region": "Caprivi",
      "currency": "N$",
      "validity": "2026",
      "note": "Net STO rates from the supplier sheet.",
      "commission": "STO",
      "sections": [
        {
          "title": "2026 — net STO",
          "rows": [
            [
              "Double/Twin/Triple/Family -- Sharing BB",
              "2,647.20"
            ],
            [
              "Single -- BB",
              "3,310.40"
            ],
            [
              "Sundowner Boat Cruise (guided, 1.5hrs, refreshments)",
              "460"
            ],
            [
              "Morning or Afternoon Boat Cruise (guided, 3hrs, refreshments)",
              "790"
            ],
            [
              "Nature Walk to bird colonies (guided, 3hrs, seasonal)",
              "305"
            ],
            [
              "Transfer to Katima Mpacha Airport return (50km)",
              "505"
            ],
            [
              "Package Transfer -- Airport and 3 Zambezi properties return",
              "1,170"
            ],
            [
              "Dinner (buffet/set)",
              "572"
            ],
            [
              "Lunch",
              "228"
            ],
            [
              "Full 3-Course Lunch",
              "341"
            ],
            [
              "Lunch Pack",
              "226"
            ]
          ]
        }
      ]
    }
  },
  "palmwag-camping2go": {
    "2026": {
      "name": "Palmwag Camping2Go",
      "region": "Damaraland",
      "currency": "N$",
      "validity": "2026",
      "note": "Net STO rates from the supplier sheet.",
      "commission": "STO",
      "sections": [
        {
          "title": "2026 — net STO",
          "rows": [
            [
              "Camping2Go Tent -- Sharing pppn",
              "867.20"
            ],
            [
              "Camping2Go Tent -- Single pppn",
              "1,732.80"
            ],
            [
              "Dinner pp -- buffet",
              "415"
            ],
            [
              "Breakfast pp -- buffet",
              "284"
            ],
            [
              "Lunch pp",
              "226"
            ],
            [
              "Half-Day Scenic Drive (guided, 3hrs)",
              "1,016.25"
            ],
            [
              "Full-Day Damaraland Excursion (guided, min 4 pax)",
              "2,666.25"
            ],
            [
              "Half-Day Rhino Tracking (guided, min 2 pax -- not for under 12)",
              "2,981.25"
            ]
          ]
        }
      ]
    }
  },
  "kalahari-camping2go": {
    "2026": {
      "name": "Kalahari Camping2Go",
      "region": "Kalahari",
      "currency": "N$",
      "validity": "2026",
      "note": "Net STO rates from the supplier sheet.",
      "commission": "STO",
      "sections": [
        {
          "title": "2026 — net STO",
          "rows": [
            [
              "Camping2Go Tent -- Sharing pppn",
              "867.20"
            ],
            [
              "Camping2Go Tent -- Single pppn",
              "1,732.80"
            ],
            [
              "Dinner pp -- buffet",
              "572"
            ],
            [
              "Breakfast pp -- buffet",
              "284"
            ],
            [
              "Lunch pp",
              "228"
            ]
          ]
        }
      ]
    }
  }
});

// ---------------------------------------------------------------------------
// Two lodges were stored as a single wide table (cols + rows) instead of the
// sectioned shape everything else uses, so the flattener read no rates from
// them at all: they counted as "loaded" while quoting nothing. Rebuilt here as
// one section per rate column, same numbers, no data changed.
// ---------------------------------------------------------------------------
(function reshapeWideDocs() {
  ['strand-hotel-swakopmund', 'midgard-country-estate'].forEach(function (slug) {
    const d = STO_DB[slug];
    if (!d || !Array.isArray(d.cols) || !Array.isArray(d.rows) || Array.isArray(d.sections)) return;
    const sections = [];
    for (let c = 1; c < d.cols.length; c++) {
      const rows = [];
      d.rows.forEach(function (r) {
        if (!Array.isArray(r) || !r[0] || r[c] === undefined || r[c] === '') return;
        rows.push([String(r[0]), String(r[c])]);
      });
      if (rows.length) sections.push({ title: String(d.cols[c]), rows: rows });
    }
    if (sections.length) { d.sections = sections; delete d.cols; delete d.rows; }
  });
})();
