// Supplier upload -> store original -> AI extract -> pending approval queue.
//
//   POST { filename, contentType, dataBase64, slug?, kind? }   (supplier or owner session)
//     -> { ok, id, status, confidence, anomalies }
//
// dataBase64 is the raw file base64 (no data: prefix). PDFs only for now.
// Keep files under ~4MB (serverless body limit).

const db = require('./_ratesdb');
const auth = require('./_auth');
const uploads = require('./_uploads');
const extract = require('./_extract');

function readBody(req) {
  return new Promise(function (resolve) {
    if (req.body && typeof req.body === 'object') return resolve(req.body);
    let data = '';
    req.on('data', function (c) { data += c; });
    req.on('end', function () { try { resolve(JSON.parse(data || '{}')); } catch (e) { resolve({}); } });
    req.on('error', function () { resolve({}); });
  });
}
function slugify(s) {
  return String(s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

module.exports = async function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  // Safe health-check (no secrets) so config can be verified.
  if (req.method === 'GET') return res.status(200).json({ ok: true, extractConfigured: extract.extractConfigured(), blobConfigured: !!process.env.BLOB_READ_WRITE_TOKEN, dbConfigured: db.dbConfigured() });
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!db.dbConfigured()) return res.status(200).json({ ok: false, error: 'Database not configured.' });

  const body = await readBody(req);

  // Suppliers/owners authenticate with the Partner Portal cookie. The Owner Rates
  // area signs in with OWNER_PASS instead, so accept that owner token as well.
  let caller = auth.sessionFromReq(req);
  if (!caller && body.token && db.isOwner({ token: String(body.token) })) {
    caller = { email: 'owner', role: 'owner', name: 'Owner' };
  }
  if (!caller || (caller.role !== 'supplier' && caller.role !== 'owner')) {
    return res.status(200).json({ ok: false, error: 'Please sign in as a supplier to upload.' });
  }
  if (!body.filename || (!body.dataBase64 && !body.blobUrl)) return res.status(200).json({ ok: false, error: 'No file received.' });
  const ct = String(body.contentType || '');
  if (!/pdf/i.test(ct) && !/\.pdf$/i.test(body.filename)) {
    return res.status(200).json({ ok: false, error: 'Please upload a PDF (Excel support is coming).' });
  }

  const id = uploads.newId();
  // supplier's own slug takes priority; owner may pass a slug
  const slugHint = caller.role === 'supplier' ? (caller.supplierSlug || body.slug || '') : (body.slug || '');

  // Large sheets are uploaded straight to Blob by the browser; fetch the bytes here.
  let base64 = body.dataBase64 || '';
  let blobUrl = body.blobUrl || '';
  if (!base64 && blobUrl) {
    try {
      const r = await fetch(blobUrl);
      if (!r.ok) return res.status(200).json({ ok: false, error: 'Could not read the uploaded file (' + r.status + ').' });
      base64 = Buffer.from(await r.arrayBuffer()).toString('base64');
    } catch (e) { return res.status(200).json({ ok: false, error: 'Could not read the uploaded file.' }); }
  }

  // Store a copy in Blob only when the browser sent the bytes inline (small files).
  if (!blobUrl && base64) {
    try {
      if (process.env.BLOB_READ_WRITE_TOKEN) {
        const blob = require('@vercel/blob');
        const buf = Buffer.from(base64, 'base64');
        const put = await blob.put('rate-uploads/' + id + '-' + String(body.filename).replace(/[^\w.\-]+/g, '_'), buf, {
          access: 'public', token: process.env.BLOB_READ_WRITE_TOKEN, contentType: 'application/pdf',
        });
        blobUrl = (put && put.url) || '';
      }
    } catch (e) { /* non-fatal — carry on to extraction */ }
  }

  // 2) record it as processing
  let rec = {
    id: id, supplierEmail: caller.email, supplierName: caller.name || '',
    slug: slugHint, name: '', region: '', kind: String(body.kind || 'rack'),
    filename: body.filename, blobUrl: blobUrl, status: 'processing',
    extracted: null, confidence: null, anomalies: [], yearDiff: [], note: '', year: '',
    createdAt: Date.now(), reviewedAt: 0, reviewedBy: '',
  };
  await uploads.saveUpload(rec);

  // 3) AI extraction. Vehicle/activity sheets are a single supplier — don't split.
  const single = !!body.single;
  const ex = await extract.extractFromPdf(base64, { single: single });
  if (!ex.ok) {
    rec.status = 'error'; rec.note = ex.error || 'Extraction failed.';
    await uploads.saveUpload(rec);
    return res.status(200).json({ ok: false, id: id, status: 'error', error: rec.note });
  }

  const slug = slugHint || slugify(ex.doc.name);
  const diff = await extract.yearDiff(slug, ex.doc);

  // Land as a DRAFT the supplier reviews/corrects before submitting to the owner queue.
  rec.status = 'draft';
  rec.slug = slug;
  rec.name = ex.doc.name || '';
  rec.region = ex.doc.region || '';
  rec.year = ex.doc.year || '';
  rec.extracted = ex.doc;
  rec.properties = ex.properties || [ex.doc];   // every property found in the sheet
  rec.confidence = ex.confidence;
  rec.anomalies = ex.anomalies || [];
  rec.yearDiff = diff;
  await uploads.saveUpload(rec);

  return res.status(200).json({ ok: true, id: id, status: 'draft', confidence: ex.confidence, anomalies: rec.anomalies, extracted: ex.doc, properties: rec.properties, slug: slug, year: rec.year, yearDiff: diff });
};
