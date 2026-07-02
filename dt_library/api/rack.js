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
    if (!db.dbConfigured()) {
      // No DB yet -> empty overlay; builder just uses the static file.
      return res.status(200).json({ ok: true, lodges: {} });
    }

    const slug = req.query && req.query.slug ? String(req.query.slug).trim() : '';
    if (slug) {
      const doc = await db.getRates('rack', slug);
      return res.status(200).json({ ok: true, slug: slug, lodge: doc ? flatten(doc) : null });
    }

    const all = await db.allRack();
    const lodges = {};
    for (const s of Object.keys(all)) lodges[s] = flatten(all[s]);
    return res.status(200).json({ ok: true, lodges: lodges });
  } catch (e) {
    return res.status(200).json({ ok: true, lodges: {}, error: String(e && e.message ? e.message : e) });
  }
};
