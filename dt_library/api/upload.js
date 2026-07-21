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

  const caller = auth.sessionFromReq(req);
  if (!caller || (caller.role !== 'supplier' && caller.role !== 'owner')) {
    return res.status(200).json({ ok: false, error: 'Please sign in as a supplier to upload.' });
  }

  const body = await readBody(req);
  if (!body.dataBase64 || !body.filename) return res.status(200).json({ ok: false, error: 'No file received.' });
  const ct = String(body.contentType || '');
  if (!/pdf/i.test(ct) && !/\.pdf$/i.test(body.filename)) {
    return res.status(200).json({ ok: false, error: 'Please upload a PDF (Excel support is coming).' });
  }

  const id = uploads.newId();
  // supplier's own slug takes priority; owner may pass a slug
  const slugHint = caller.role === 'supplier' ? (caller.supplierSlug || body.slug || '') : (body.slug || '');

  // 1) store the original file (Blob optional — extraction still runs without it)
  let blobUrl = '';
  try {
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = require('@vercel/blob');
      const buf = Buffer.from(body.dataBase64, 'base64');
      const put = await blob.put('rate-uploads/' + id + '-' + String(body.filename).replace(/[^\w.\-]+/g, '_'), buf, {
        access: 'public', token: process.env.BLOB_READ_WRITE_TOKEN, contentType: 'application/pdf',
      });
      blobUrl = (put && put.url) || '';
    }
  } catch (e) { /* non-fatal — carry on to extraction */ }

  // 2) record it as processing
  let rec = {
    id: id, supplierEmail: caller.email, supplierName: caller.name || '',
    slug: slugHint, name: '', region: '', kind: String(body.kind || 'rack'),
    filename: body.filename, blobUrl: blobUrl, status: 'processing',
    extracted: null, confidence: null, anomalies: [], yearDiff: [], note: '',
    createdAt: Date.now(), reviewedAt: 0, reviewedBy: '',
  };
  await uploads.saveUpload(rec);

  // 3) AI extraction
  const ex = await extract.extractFromPdf(body.dataBase64);
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
  rec.extracted = ex.doc;
  rec.confidence = ex.confidence;
  rec.anomalies = ex.anomalies || [];
  rec.yearDiff = diff;
  await uploads.saveUpload(rec);

  return res.status(200).json({ ok: true, id: id, status: 'draft', confidence: ex.confidence, anomalies: rec.anomalies, extracted: ex.doc, slug: slug, yearDiff: diff });
};
