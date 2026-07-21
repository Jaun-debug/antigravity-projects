// Vercel Serverless Function — OWNER rate-management API (private).
//
// Single-password owner model (env OWNER_PASS). Every write requires a valid
// owner token/password. Reads (list/get) are owner-only too, because the admin
// view shows net STO rates alongside rack rates.
//
//   POST { action:'login',  password }                 -> { ok, token }
//   POST { action:'list',   token }                    -> { ok, lodges:[...] }
//   POST { action:'get',    token, slug }              -> { ok, slug, rack, sto }
//   POST { action:'save',   token, slug, kind, data }  -> { ok }
//   POST { action:'delete', token, slug, kind }        -> { ok }
//
// kind is 'rack' or 'sto'. data shape:
//   { name, region, currency, validity, note, commission?, sections:[{title, rows:[[label, price], ...]}] }

const db = require('./_ratesdb');

function slugify(s) {
  return String(s || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizeDoc(data) {
  const d = data && typeof data === 'object' ? data : {};
  const sectionsIn = Array.isArray(d.sections) ? d.sections : [];
  const sections = sectionsIn
    .map(function (sec) {
      const rowsIn = sec && Array.isArray(sec.rows) ? sec.rows : [];
      const rows = rowsIn
        .map(function (row) {
          if (!Array.isArray(row)) return null;
          const label = String(row[0] == null ? '' : row[0]).trim();
          const price = String(row[1] == null ? '' : row[1]).trim();
          if (!label && !price) return null;
          return [label, price];
        })
        .filter(Boolean);
      return { title: String((sec && sec.title) || '').trim(), rows: rows };
    })
    .filter(function (sec) {
      return sec.title || sec.rows.length;
    });
  return {
    name: String(d.name || '').trim(),
    region: String(d.region || '').trim(),
    commission: String(d.commission || '').trim(),
    currency: String(d.currency || 'N$').trim(),
    validity: String(d.validity || '').trim(),
    note: String(d.note || '').trim(),
    sections: sections,
    updated: new Date().toISOString(),
  };
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body || {};
  const action = String(body.action || '').trim();
  const token = String(body.token || '');

  // ── login ────────────────────────────────────────────────────────────────
  if (action === 'login') {
    if (!db.ownerPass()) {
      return res
        .status(503)
        .json({ error: 'Owner area not set up: OWNER_PASS is not configured on the server.' });
    }
    if (!db.isOwner({ password: String(body.password || '') })) {
      return res.status(401).json({ error: 'Wrong owner password.' });
    }
    return res.status(200).json({ ok: true, token: db.validOwnerToken() });
  }

  // Every other action requires a valid owner session.
  if (!db.isOwner({ token })) {
    return res.status(401).json({ error: 'Not signed in as owner.' });
  }

  if (!db.dbConfigured()) {
    return res
      .status(503)
      .json({ error: 'Database not connected. Add a Redis store to the Vercel project.' });
  }

  try {
    if (action === 'list') {
      const lodges = await db.listSummary();
      return res.status(200).json({ ok: true, lodges: lodges });
    }

    if (action === 'get') {
      const slug = slugify(body.slug);
      if (!slug) return res.status(400).json({ error: 'Missing slug.' });
      const yearReq = body.year ? String(body.year) : '';
      const rackYears = await db.listYears('rack', slug);
      const stoYears = await db.listYears('sto', slug);
      const rackRes = await db.getResolved('rack', slug, yearReq || undefined);
      const stoRes = await db.getResolved('sto', slug, yearReq || undefined);
      return res.status(200).json({
        ok: true, slug: slug, rack: rackRes.doc, sto: stoRes.doc,
        year: yearReq || rackRes.year || stoRes.year || '',
        rackYears: rackYears, stoYears: stoYears,
      });
    }

    if (action === 'save') {
      const kind = String(body.kind || '');
      if (kind !== 'rack' && kind !== 'sto') {
        return res.status(400).json({ error: "kind must be 'rack' or 'sto'." });
      }
      // Prefer an explicit slug; otherwise derive from the name.
      const slug = slugify(body.slug || (body.data && body.data.name));
      if (!slug) return res.status(400).json({ error: 'Provide a lodge name or slug.' });
      const doc = normalizeDoc(body.data);
      if (!doc.name) return res.status(400).json({ error: 'Lodge name is required.' });
      const year = body.year ? String(body.year).replace(/[^0-9]/g, '') : '';
      if (year) doc.year = year;
      await db.setRates(kind, slug, doc, year || undefined);
      return res.status(200).json({ ok: true, slug: slug, kind: kind, year: year || null });
    }

    if (action === 'delete') {
      const kind = String(body.kind || '');
      if (kind !== 'rack' && kind !== 'sto') {
        return res.status(400).json({ error: "kind must be 'rack' or 'sto'." });
      }
      const slug = slugify(body.slug);
      if (!slug) return res.status(400).json({ error: 'Missing slug.' });
      const year = body.year ? String(body.year).replace(/[^0-9]/g, '') : '';
      await db.delRates(kind, slug, year || undefined);
      return res.status(200).json({ ok: true, slug: slug, kind: kind, year: year || null });
    }

    return res.status(400).json({ error: 'Unknown action: ' + action });
  } catch (e) {
    return res.status(500).json({ error: 'Server error: ' + (e && e.message ? e.message : String(e)) });
  }
};
