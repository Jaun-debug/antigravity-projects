// Vercel Serverless Function — PUBLIC rack rates read.
//
// Serves owner-entered RACK rates so the itinerary builder can overlay them on
// top of the static /assets/rates-index.json. Rack rates are public selling
// prices, so this endpoint needs no auth. (STO net rates are NEVER served here.)
//
//   GET /api/rack            -> { ok, lodges: { "<slug>": { name, region, rates:[{n,p}] } } }
//   GET /api/rack?slug=xxx   -> { ok, slug, lodge: { name, region, rates:[{n,p}] } | null }
//
// rates[] mirrors the shape used inside rates-index.json ({n: label, p: number})
// so the builder can drop it straight in.

const db = require('./_ratesdb');
const VF_RACK = {
  "drift-inn-bayete-collection": {
    "name": "Drift Inn (Bayete Collection)",
    "region": "Vic Falls",
    "currency": "US$",
    "validity": "2027 · Low 1 Jan–31 Mar / High 1 Apr–31 Dec",
    "note": "Published rack rates (USD)",
    "sections": [
      {
        "title": "Standard (per person, B&B)",
        "rows": [
          [
            "Adult sharing (Low)",
            "91"
          ],
          [
            "Adult sharing (High)",
            "101"
          ],
          [
            "Adult single (Low)",
            "118"
          ],
          [
            "Adult single (High)",
            "131"
          ],
          [
            "Child sharing (Low)",
            "46"
          ],
          [
            "Child sharing (High)",
            "51"
          ],
          [
            "Child single (Low)",
            "60"
          ],
          [
            "Child single (High)",
            "66"
          ]
        ]
      },
      {
        "title": "Studio (per person, B&B)",
        "rows": [
          [
            "Adult sharing (Low)",
            "102"
          ],
          [
            "Adult sharing (High)",
            "111"
          ],
          [
            "Adult single (Low)",
            "132"
          ],
          [
            "Adult single (High)",
            "141"
          ],
          [
            "Child sharing (Low)",
            "52"
          ],
          [
            "Child sharing (High)",
            "56"
          ],
          [
            "Child single (Low)",
            "67"
          ],
          [
            "Child single (High)",
            "71"
          ]
        ]
      },
      {
        "title": "Family rooms & guide",
        "rows": [
          [
            "Standard Family Room per unit (Low)",
            "291"
          ],
          [
            "Standard Family Room per unit (High)",
            "326"
          ],
          [
            "Studio Family Room per unit (Low)",
            "331"
          ],
          [
            "Studio Family Room per unit (High)",
            "371"
          ],
          [
            "Guide per night",
            "65"
          ]
        ]
      }
    ]
  },
  "phezulu-bayete-collection": {
    "name": "PheZulu (Bayete Collection)",
    "region": "Vic Falls",
    "currency": "US$",
    "validity": "2027 · Low 1 Jan–31 Mar / High 1 Apr–31 Dec",
    "note": "Published rack rates (USD)",
    "sections": [
      {
        "title": "Deluxe (per person, B&B)",
        "rows": [
          [
            "Adult sharing (Low)",
            "116"
          ],
          [
            "Adult sharing (High)",
            "136"
          ],
          [
            "Adult single (Low)",
            "151"
          ],
          [
            "Adult single (High)",
            "176"
          ],
          [
            "Child sharing (Low)",
            "59"
          ],
          [
            "Child sharing (High)",
            "69"
          ],
          [
            "Child single (Low)",
            "76"
          ],
          [
            "Child single (High)",
            "88"
          ],
          [
            "Guide per night",
            "65"
          ]
        ]
      }
    ]
  },
  "bayete-guest-lodge": {
    "name": "Bayete Guest Lodge",
    "region": "Vic Falls",
    "currency": "US$",
    "validity": "2027 · Low 1 Jan–31 Mar / High 1 Apr–31 Dec",
    "note": "Published rack rates (USD)",
    "sections": [
      {
        "title": "Classic (per person, B&B)",
        "rows": [
          [
            "Adult sharing (Low)",
            "131"
          ],
          [
            "Adult sharing (High)",
            "146"
          ],
          [
            "Adult single (Low)",
            "171"
          ],
          [
            "Adult single (High)",
            "191"
          ],
          [
            "Child sharing (Low)",
            "66"
          ],
          [
            "Child sharing (High)",
            "74"
          ],
          [
            "Child single (Low)",
            "86"
          ],
          [
            "Child single (High)",
            "96"
          ]
        ]
      },
      {
        "title": "Executive & Honeymoon (per person, B&B)",
        "rows": [
          [
            "Adult sharing (Low)",
            "141"
          ],
          [
            "Adult sharing (High)",
            "176"
          ],
          [
            "Adult single (Low)",
            "181"
          ],
          [
            "Adult single (High)",
            "231"
          ],
          [
            "Child sharing (Low)",
            "71"
          ],
          [
            "Child sharing (High)",
            "89"
          ],
          [
            "Child single (Low)",
            "91"
          ],
          [
            "Child single (High)",
            "116"
          ],
          [
            "Guide per night",
            "65"
          ]
        ]
      }
    ]
  },
  "nkosi-bayete-collection": {
    "name": "Nkosi (Bayete Collection)",
    "region": "Vic Falls",
    "currency": "US$",
    "validity": "2027 · Low 1 Jan–31 Mar / High 1 Apr–31 Dec",
    "note": "Published rack rates (USD)",
    "sections": [
      {
        "title": "Superior & Honeymoon (per person, B&B)",
        "rows": [
          [
            "Adult sharing (Low)",
            "171"
          ],
          [
            "Adult sharing (High)",
            "206"
          ],
          [
            "Adult single (Low)",
            "221"
          ],
          [
            "Adult single (High)",
            "271"
          ],
          [
            "Child sharing (Low)",
            "86"
          ],
          [
            "Child sharing (High)",
            "104"
          ],
          [
            "Child single (Low)",
            "111"
          ],
          [
            "Child single (High)",
            "136"
          ],
          [
            "Guide per night",
            "80"
          ]
        ]
      }
    ]
  },
  "the-victorian-manor": {
    "name": "The Victorian Manor (Bayete Collection)",
    "region": "Vic Falls",
    "currency": "US$",
    "validity": "2027 · 1 Jan–31 Dec",
    "note": "Published rack rates (USD)",
    "sections": [
      {
        "title": "Per person, B&B (1 Jan–31 Dec)",
        "rows": [
          [
            "Victorian Suite — sharing",
            "276"
          ],
          [
            "Victorian Suite — single",
            "361"
          ],
          [
            "Master Suite — sharing",
            "321"
          ],
          [
            "Master Suite — single",
            "416"
          ],
          [
            "Cassa 2-Bedroom Unit",
            "701"
          ],
          [
            "Villa — sharing",
            "351"
          ],
          [
            "Villa — single",
            "456"
          ],
          [
            "Exclusive Entire Manor",
            "5025"
          ],
          [
            "Guide per night",
            "100"
          ]
        ]
      }
    ]
  }
};


function parsePrice(s) {
  const str = String(s == null ? '' : s).replace(/,/g, '').replace(/[^\d.\-]/g, '');
  if (str === '' || str === '-' || str === '.') return null;
  const v = parseFloat(str);
  return isNaN(v) ? null : v;
}

function flatten(doc) {
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
  return { name: (doc && doc.name) || '', region: (doc && doc.region) || '', rates: rates };
}

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  // Short cache: fresh enough for agents, easy on the DB.
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=120');

  try {
    const slug = req.query && req.query.slug ? String(req.query.slug).trim() : '';
    if (!db.dbConfigured() && !slug) {
      // No DB and no slug -> empty overlay; builder just uses the static file.
      return res.status(200).json({ ok: true, lodges: {} });
    }
    if (slug) {
      const yearReq = req.query && req.query.year ? String(req.query.year).trim() : '';
      let resolved = { doc: null, year: '', years: [] };
      if (db.dbConfigured()) { try { resolved = await db.getRackResolved(slug, yearReq || undefined); } catch(e){} }
      let doc = resolved.doc;
      if (!doc && VF_RACK[slug]) { doc = VF_RACK[slug]; }
      // full=1 -> the raw sectioned doc (used by lodge pages to render season tables).
      if (req.query && req.query.full) {
        return res.status(200).json({ ok: true, slug: slug, doc: doc || null, year: resolved.year, years: resolved.years });
      }
      return res.status(200).json({ ok: true, slug: slug, lodge: doc ? flatten(doc) : null, year: resolved.year, years: resolved.years });
    }

    const all = db.dbConfigured() ? await db.allRack() : {};
    const lodges = {};
    for (const s of Object.keys(all)) lodges[s] = flatten(all[s]);
    for (const s of Object.keys(VF_RACK)) { if (!lodges[s]) lodges[s] = flatten(VF_RACK[s]); }
    return res.status(200).json({ ok: true, lodges: lodges });
  } catch (e) {
    return res.status(200).json({ ok: true, lodges: {}, error: String(e && e.message ? e.message : e) });
  }
};
