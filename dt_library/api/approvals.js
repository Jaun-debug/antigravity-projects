// Approval workflow. Owner reviews AI-extracted uploads and publishes them.
//
//   POST { action:'list', status? }        (owner)    -> { ok, uploads:[summary] }
//   POST { action:'get', id }              (owner)    -> { ok, upload }  (full record)
//   POST { action:'approve', id, data? }   (owner)    -> { ok }  publishes to live rates
//   POST { action:'reject', id, note? }    (owner)    -> { ok }
//   POST { action:'correct', id, note }    (owner)    -> { ok }  ask supplier to re-send
//   POST { action:'mine' }                 (supplier) -> { ok, uploads:[summary] }
//
// Approving writes the (possibly edited) rack/sto doc to the live rates DB via _ratesdb,
// so the lodge page shows it immediately. Nothing publishes until approved.

const db = require('./_ratesdb');
const auth = require('./_auth');
const uploads = require('./_uploads');

function readBody(req) {
  return new Promise(function (resolve) {
    if (req.body && typeof req.body === 'object') return resolve(req.body);
    let data = '';
    req.on('data', function (c) { data += c; });
    req.on('end', function () { try { resolve(JSON.parse(data || '{}')); } catch (e) { resolve({}); } });
    req.on('error', function () { resolve({}); });
  });
}

module.exports = async function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!db.dbConfigured()) return res.status(200).json({ ok: false, error: 'Database not configured.' });

  const body = await readBody(req);
  const action = String(body.action || '');
  const caller = auth.sessionFromReq(req);
  const isOwner = caller && caller.role === 'owner';

  try {
    // supplier: their own upload history
    if (action === 'mine') {
      if (!caller || (caller.role !== 'supplier' && caller.role !== 'owner')) return res.status(200).json({ ok: false, error: 'Sign in required.' });
      const list = await uploads.listUploads({ supplierEmail: caller.email });
      return res.status(200).json({ ok: true, uploads: list.map(uploads.summary) });
    }

    if (!isOwner) return res.status(200).json({ ok: false, error: 'Owner access required.' });

    if (action === 'list') {
      const list = await uploads.listUploads(body.status ? { status: String(body.status) } : { status: 'pending' });
      return res.status(200).json({ ok: true, uploads: list.map(uploads.summary) });
    }

    if (action === 'get') {
      const u = await uploads.getUpload(body.id);
      if (!u) return res.status(200).json({ ok: false, error: 'Upload not found.' });
      return res.status(200).json({ ok: true, upload: u });
    }

    if (action === 'approve') {
      const u = await uploads.getUpload(body.id);
      if (!u) return res.status(200).json({ ok: false, error: 'Upload not found.' });
      const doc = (body.data && typeof body.data === 'object') ? body.data : u.extracted;
      if (!doc || !Array.isArray(doc.sections) || !doc.sections.length) return res.status(200).json({ ok: false, error: 'Nothing to publish.' });
      if (!u.slug) return res.status(200).json({ ok: false, error: 'This upload has no lodge slug — set one before publishing.' });
      const kind = u.kind === 'sto' ? 'sto' : 'rack';
      const payload = {
        name: doc.name || u.name || u.slug, region: doc.region || u.region || '',
        currency: doc.currency || 'N$', validity: doc.validity || '', note: doc.note || '',
        commission: doc.commission || '', sections: doc.sections,
      };
      await db.setRates(kind, u.slug, payload);
      u.status = 'approved'; u.extracted = doc; u.reviewedAt = Date.now(); u.reviewedBy = caller.email;
      await uploads.saveUpload(u);
      return res.status(200).json({ ok: true, slug: u.slug, kind: kind });
    }

    if (action === 'reject' || action === 'correct') {
      const u = await uploads.getUpload(body.id);
      if (!u) return res.status(200).json({ ok: false, error: 'Upload not found.' });
      u.status = action === 'reject' ? 'rejected' : 'corrections';
      u.note = String(body.note || ''); u.reviewedAt = Date.now(); u.reviewedBy = caller.email;
      await uploads.saveUpload(u);
      return res.status(200).json({ ok: true });
    }

    return res.status(200).json({ ok: false, error: 'Unknown action.' });
  } catch (e) {
    return res.status(200).json({ ok: false, error: String(e && e.message ? e.message : e) });
  }
};
