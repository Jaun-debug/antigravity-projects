// Shared helper for the Owner rate-management area.
//
// Files/folders in /api prefixed with "_" are NOT turned into routes by Vercel,
// so this module is import-only (used by owner-rates.js, rack.js, sto.js).
//
// STORAGE: Upstash Redis, provisioned via Vercel → Storage → Redis. The
// integration injects connection env vars automatically. We read whichever
// naming the integration used (KV_* legacy, UPSTASH_*, or REDIS_*).
//
// DATA MODEL (all values are JSON strings):
//   rates:rack:<slug>  -> { name, region, currency, validity, note, sections:[{title, rows:[[label, price], ...]}] }
//   rates:sto:<slug>   -> { name, region, commission, currency, validity, note, sections:[...] }
//   rates:index        -> Redis SET of every slug that has a rack and/or sto entry
//
// AUTH: a single owner password (env OWNER_PASS). The owner session token is
// derived from it, so changing the password invalidates every session.

const crypto = require('crypto');
const { Redis } = require('@upstash/redis');

// ── Redis connection ────────────────────────────────────────────────────────
let _redis = null;
function getRedis() {
  if (_redis) return _redis;
  const url =
    process.env.KV_REST_API_URL ||
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.REDIS_REST_API_URL ||
    '';
  const token =
    process.env.KV_REST_API_TOKEN ||
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.REDIS_REST_API_TOKEN ||
    '';
  if (!url || !token) return null; // DB not configured yet -> callers fall back
  _redis = new Redis({ url, token, automaticDeserialization: false });
  return _redis;
}

function dbConfigured() {
  return !!getRedis();
}

// ── Auth ──────────────────────────────────────────────────────────────────
function ownerToken(pass) {
  return crypto
    .createHash('sha256')
    .update('nr-owner-session|' + pass)
    .digest('hex')
    .slice(0, 40);
}

// Owner password. No insecure default: if OWNER_PASS is unset, owner login is
// simply disabled (writes impossible) rather than open to the public.
function ownerPass() {
  return process.env.OWNER_PASS || '';
}

function validOwnerToken() {
  const p = ownerPass();
  return p ? ownerToken(p) : '';
}

// Returns true if the request carries a valid owner credential or token.
function isOwner({ token, username, password }) {
  const pass = ownerPass();
  if (!pass) return false;
  const vt = ownerToken(pass);
  if (token && token === vt) return true;
  // username optional; the owner area uses a single password.
  if (password && password === pass) return true;
  return false;
}

// ── Rate storage ────────────────────────────────────────────────────────────
// Rates can be stored per season YEAR so 2026 and 2027 live side by side.
//   rates:rack:<slug>          -> legacy / undated doc (still read as a fallback)
//   rates:rack:<slug>:<year>   -> that year's doc
//   rates:years:rack:<slug>    -> SET of the years that exist for this slug
const KINDS = { rack: 'rates:rack:', sto: 'rates:sto:' };
const INDEX = 'rates:index';

function keyFor(kind, slug, year) {
  const prefix = KINDS[kind];
  if (!prefix) throw new Error('bad kind: ' + kind);
  return prefix + slug + (year ? ':' + String(year) : '');
}
function yearsKey(kind, slug) {
  return 'rates:years:' + kind + ':' + slug;
}

async function getRates(kind, slug, year) {
  const r = getRedis();
  if (!r) return null;
  const raw = await r.get(keyFor(kind, slug, year));
  if (!raw) return null;
  try {
    return typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch (e) {
    return null;
  }
}

// List the years that exist for a slug (sorted ascending). Empty => only legacy/undated.
async function listYears(kind, slug) {
  const r = getRedis();
  if (!r) return [];
  const ys = await r.smembers(yearsKey(kind, slug));
  return Array.isArray(ys) ? ys.map(String).sort() : [];
}

async function setRates(kind, slug, obj, year) {
  const r = getRedis();
  if (!r) throw new Error('database not configured');
  await r.set(keyFor(kind, slug, year), JSON.stringify(obj));
  await r.sadd(INDEX, slug);
  if (year) await r.sadd(yearsKey(kind, slug), String(year));
  return true;
}

async function delRates(kind, slug, year) {
  const r = getRedis();
  if (!r) throw new Error('database not configured');
  await r.del(keyFor(kind, slug, year));
  if (year) {
    await r.srem(yearsKey(kind, slug), String(year));
    return true;
  }
  // Drop from index only if neither rack nor sto (any year) remains for this slug.
  const other = kind === 'rack' ? 'sto' : 'rack';
  const stillHas = await r.exists(keyFor(other, slug));
  const rackYears = await r.scard(yearsKey('rack', slug));
  const stoYears = await r.scard(yearsKey('sto', slug));
  if (!stillHas && !rackYears && !stoYears) await r.srem(INDEX, slug);
  return true;
}

// Pick the best year to show by default: current calendar year if present,
// else the nearest upcoming year, else the latest available.
function pickDefaultYear(years) {
  if (!years || !years.length) return null;
  const now = new Date().getFullYear();
  const nums = years.map(Number).filter(function (n) { return !isNaN(n); }).sort(function (a, b) { return a - b; });
  if (!nums.length) return years[years.length - 1];
  if (nums.indexOf(now) !== -1) return String(now);
  const upcoming = nums.filter(function (n) { return n >= now; });
  if (upcoming.length) return String(upcoming[0]);
  return String(nums[nums.length - 1]);
}

// Resolve the doc to show for a slug: a specific year, else default year, else legacy.
async function getRackResolved(slug, year) {
  const years = await listYears('rack', slug);
  if (year) {
    const doc = await getRates('rack', slug, year);
    return { doc: doc, year: String(year), years: years };
  }
  if (years.length) {
    const def = pickDefaultYear(years);
    const doc = await getRates('rack', slug, def);
    return { doc: doc, year: def, years: years };
  }
  const legacy = await getRates('rack', slug); // undated fallback
  return { doc: legacy, year: null, years: years };
}

async function listSlugs() {
  const r = getRedis();
  if (!r) return [];
  const members = await r.smembers(INDEX);
  return Array.isArray(members) ? members.sort() : [];
}

// Returns [{ slug, name, region, hasRack, hasSto }] for the owner list view.
async function listSummary() {
  const r = getRedis();
  if (!r) return [];
  const slugs = await listSlugs();
  const out = [];
  for (const slug of slugs) {
    const rack = await getRates('rack', slug);
    const sto = await getRates('sto', slug);
    const meta = rack || sto || {};
    out.push({
      slug,
      name: meta.name || slug,
      region: meta.region || '',
      hasRack: !!rack,
      hasSto: !!sto,
    });
  }
  return out;
}

// Public: all rack rates keyed by slug (used by the builder overlay).
async function allRack() {
  const r = getRedis();
  if (!r) return {};
  const slugs = await listSlugs();
  const out = {};
  for (const slug of slugs) {
    const resolved = await getRackResolved(slug);
    if (resolved && resolved.doc) out[slug] = resolved.doc;
  }
  return out;
}

module.exports = {
  getRedis,
  dbConfigured,
  ownerToken,
  ownerPass,
  validOwnerToken,
  isOwner,
  getRates,
  setRates,
  delRates,
  listYears,
  getRackResolved,
  pickDefaultYear,
  listSlugs,
  listSummary,
  allRack,
};
