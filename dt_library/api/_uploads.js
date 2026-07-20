// Upload / pending-approval data model. Reuses the shared Upstash Redis.
//
//   upload:<id>        -> JSON { id, supplierEmail, supplierName, slug, name, region,
//                                kind, filename, blobUrl, status, extracted, confidence,
//                                anomalies[], yearDiff, note, createdAt, reviewedAt, reviewedBy }
//   uploads:index      -> SET of every upload id
//   uploads:bySupplier:<email> -> SET of that supplier's upload ids
//
// status: 'processing' | 'pending' | 'approved' | 'rejected' | 'error'

const crypto = require('crypto');
const db = require('./_ratesdb');

const U_PREFIX = 'upload:';
const U_INDEX = 'uploads:index';
const U_BY = 'uploads:bySupplier:';

function newId() {
  return Date.now().toString(36) + '-' + crypto.randomBytes(4).toString('hex');
}

async function saveUpload(u) {
  const r = db.getRedis(); if (!r) throw new Error('database not configured');
  await r.set(U_PREFIX + u.id, JSON.stringify(u));
  await r.sadd(U_INDEX, u.id);
  if (u.supplierEmail) await r.sadd(U_BY + String(u.supplierEmail).toLowerCase(), u.id);
  return u;
}
async function getUpload(id) {
  const r = db.getRedis(); if (!r) return null;
  const raw = await r.get(U_PREFIX + id);
  if (!raw) return null;
  try { return typeof raw === 'string' ? JSON.parse(raw) : raw; } catch (e) { return null; }
}
async function listUploads(filter) {
  const r = db.getRedis(); if (!r) return [];
  const ids = await r.smembers(U_INDEX);
  const out = [];
  for (const id of (ids || [])) {
    const u = await getUpload(id);
    if (!u) continue;
    if (filter && filter.status && u.status !== filter.status) continue;
    if (filter && filter.supplierEmail && String(u.supplierEmail).toLowerCase() !== String(filter.supplierEmail).toLowerCase()) continue;
    out.push(u);
  }
  out.sort(function (a, b) { return (b.createdAt || 0) - (a.createdAt || 0); });
  return out;
}
// light rows for list views (no heavy extracted payload)
function summary(u) {
  return {
    id: u.id, supplierEmail: u.supplierEmail, supplierName: u.supplierName || '',
    slug: u.slug || '', name: u.name || '', region: u.region || '', kind: u.kind || 'rack',
    filename: u.filename || '', status: u.status, confidence: u.confidence == null ? null : u.confidence,
    anomalyCount: (u.anomalies || []).length, createdAt: u.createdAt || 0, reviewedAt: u.reviewedAt || 0,
  };
}

module.exports = { newId, saveUpload, getUpload, listUploads, summary };
