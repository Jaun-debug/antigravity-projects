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

    // supplier: fetch the full record of one of THEIR OWN uploads (to review/edit)
    if (action === 'myget') {
      if (!caller) return res.status(200).json({ ok: false, error: 'Sign in required.' });
      const u = await uploads.getUpload(body.id);
      if (!u) return res.status(200).json({ ok: false, error: 'Upload not found.' });
      const ownIt = caller.role === 'owner' || (u.supplierEmail && String(u.supplierEmail).toLowerCase() === String(caller.email).toLowerCase());
      if (!ownIt) return res.status(200).json({ ok: false, error: 'Not your upload.' });
      return res.status(200).json({ ok: true, upload: u });
    }

    // supplier: save edits to a draft, or submit it into the owner's approval queue
    if (action === 'savedraft' || action === 'submit') {
      if (!caller) return res.status(200).json({ ok: false, error: 'Sign in required.' });
      const u = await uploads.getUpload(body.id);
      if (!u) return res.status(200).json({ ok: false, error: 'Upload not found.' });
      const ownIt = caller.role === 'owner' || (u.supplierEmail && String(u.supplierEmail).toLowerCase() === String(caller.email).toLowerCase());
      if (!ownIt) return res.status(200).json({ ok: false, error: 'Not your upload.' });
      // Only editable while it is the supplier's to edit.
      if (['approved', 'rejected', 'processing', 'error'].indexOf(u.status) !== -1) {
        return res.status(200).json({ ok: false, error: 'This upload can no longer be edited.' });
      }
      const doc = (body.data && typeof body.data === 'object') ? body.data : u.extracted;
      // Multi-property sheets: the supplier reviews every property and sends them all back.
      if (Array.isArray(body.properties) && body.properties.length) {
        u.properties = body.properties.map(function (it) {
          const d = (it && it.data) || it || {};
          const out = {
            name: d.name || '', region: d.region || '', currency: d.currency || 'N$',
            validity: d.validity || '', note: d.note || '', year: d.year || '',
            commission: d.commission || '', sections: Array.isArray(d.sections) ? d.sections : [],
          };
          out.slug = String((it && it.slug) || d.slug || '').trim();
          return out;
        });
      }
      if (action === 'submit') {
        const anyProp = Array.isArray(u.properties) && u.properties.some(function (p) { return p.sections && p.sections.length; });
        const okDoc = doc && Array.isArray(doc.sections) && doc.sections.length;
        if (!anyProp && !okDoc) return res.status(200).json({ ok: false, error: 'Add at least one rate before submitting.' });
      }
      u.extracted = doc || u.extracted;
      if (doc) { u.name = doc.name || u.name; u.region = doc.region || u.region; }
      if (body.year != null && body.year !== '') u.year = String(body.year).replace(/[^0-9]/g, '');
      u.status = action === 'submit' ? 'pending' : 'draft';
      if (action === 'submit') u.submittedAt = Date.now();
      await uploads.saveUpload(u);
      return res.status(200).json({ ok: true, status: u.status });
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
      const kind = u.kind === 'sto' ? 'sto' : 'rack';
      // Year: owner override in body wins, else the year carried on the upload, else the doc's detected year.
      const year = String((body.year != null && body.year !== '') ? body.year : (u.year || doc.year || '')).replace(/[^0-9]/g, '');
      function payloadFor(d, fallbackSlug) {
        return {
          name: d.name || fallbackSlug, region: d.region || '',
          currency: d.currency || 'N$', validity: d.validity || '', note: d.note || '',
          year: year || '', commission: d.commission || '', sections: d.sections,
        };
      }

      // Multi-property sheets: publish each property to its own slug.
      let items = null;
      if (Array.isArray(body.properties) && body.properties.length) items = body.properties;
      else if (Array.isArray(u.properties) && u.properties.length > 1) {
        items = u.properties.map(function (p) { return { slug: p.slug || '', data: p }; });
      }
      if (items) {
        const published = [];
        for (const it of items) {
          const d = (it && it.data) || it;
          const sl = String((it && it.slug) || (d && d.slug) || '').trim();
          if (!sl || !d || !Array.isArray(d.sections) || !d.sections.length) continue;
          await db.setRates(kind, sl, payloadFor(d, sl), year || undefined);
          published.push(sl);
        }
        if (!published.length) return res.status(200).json({ ok: false, error: 'None of the properties had a slug to publish to.' });
        u.status = 'approved'; u.year = year || u.year; u.reviewedAt = Date.now(); u.reviewedBy = caller.email;
        await uploads.saveUpload(u);
        return res.status(200).json({ ok: true, slugs: published, count: published.length, kind: kind, year: year || null });
      }

      if (!u.slug) return res.status(200).json({ ok: false, error: 'This upload has no lodge slug — set one before publishing.' });
      await db.setRates(kind, u.slug, payloadFor(doc, u.slug), year || undefined);
      u.status = 'approved'; u.extracted = doc; u.year = year || u.year; u.reviewedAt = Date.now(); u.reviewedBy = caller.email;
      await uploads.saveUpload(u);
      return res.status(200).json({ ok: true, slug: u.slug, kind: kind, year: year || null });
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
