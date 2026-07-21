// Shared auth helpers for the Partner Portal (suppliers, agents, owner).
// Reuses the same Upstash Redis connection as _ratesdb — no new services.
//
// DATA MODEL (Redis):
//   user:<email>   -> JSON { email, name, role, supplierSlug, salt, hash, active, createdAt }
//   users:index    -> SET of every user email
//
// role is one of: 'owner' | 'agent' | 'supplier'
//
// AUTH: per-user password (scrypt-hashed). Sessions are stateless signed tokens
// (HMAC) stored in an httpOnly cookie. The signing secret is SESSION_SECRET, or
// falls back to OWNER_PASS so it works before a dedicated secret is added.

const crypto = require('crypto');
const db = require('./_ratesdb');

const USER_PREFIX = 'user:';
const USERS_INDEX = 'users:index';
const ROLES = ['owner', 'agent', 'supplier'];
const SESSION_DAYS = 30;

function sessionSecret() {
  return process.env.SESSION_SECRET || process.env.OWNER_PASS || 'nr-portal-fallback-secret';
}

function normEmail(e) {
  return String(e == null ? '' : e).trim().toLowerCase();
}

// ── password hashing (scrypt, built into Node — no dependency) ───────────────
function hashPassword(pw, salt) {
  salt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(String(pw), salt, 64).toString('hex');
  return { salt, hash };
}
function verifyPassword(pw, salt, hash) {
  try {
    const h = crypto.scryptSync(String(pw), String(salt), 64).toString('hex');
    const a = Buffer.from(h);
    const b = Buffer.from(String(hash));
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch (e) { return false; }
}

// ── stateless session tokens: base64url(payload).hmac ────────────────────────
function signSession(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', sessionSecret()).update(body).digest('base64url');
  return body + '.' + sig;
}
function verifySession(token) {
  if (!token || String(token).indexOf('.') < 0) return null;
  const parts = String(token).split('.');
  const body = parts[0], sig = parts[1] || '';
  const expect = crypto.createHmac('sha256', sessionSecret()).update(body).digest('base64url');
  try {
    const a = Buffer.from(sig), b = Buffer.from(expect);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  } catch (e) { return null; }
  try {
    const p = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (p.exp && Date.now() > p.exp) return null;
    return p;
  } catch (e) { return null; }
}
function makeSessionToken(user) {
  return signSession({
    email: user.email, role: user.role, name: user.name || '',
    supplierSlug: user.supplierSlug || '',
    exp: Date.now() + SESSION_DAYS * 864e5,
  });
}

// ── cookie helpers ───────────────────────────────────────────────────────────
const COOKIE = 'nr_portal';
function readCookie(req, name) {
  const raw = (req.headers && req.headers.cookie) || '';
  const m = raw.split(';').map(function (s) { return s.trim(); })
    .find(function (s) { return s.indexOf(name + '=') === 0; });
  return m ? decodeURIComponent(m.slice(name.length + 1)) : '';
}
function setSessionCookie(res, token) {
  res.setHeader('Set-Cookie', COOKIE + '=' + encodeURIComponent(token) +
    '; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=' + (SESSION_DAYS * 86400));
}
function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', COOKIE + '=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0');
}
function sessionFromReq(req) {
  return verifySession(readCookie(req, COOKIE));
}

// ── user storage ─────────────────────────────────────────────────────────────
async function getUser(email) {
  const r = db.getRedis(); if (!r) return null;
  const raw = await r.get(USER_PREFIX + normEmail(email));
  if (!raw) return null;
  try { return typeof raw === 'string' ? JSON.parse(raw) : raw; } catch (e) { return null; }
}
async function saveUser(u) {
  const r = db.getRedis(); if (!r) throw new Error('database not configured');
  u.email = normEmail(u.email);
  await r.set(USER_PREFIX + u.email, JSON.stringify(u));
  await r.sadd(USERS_INDEX, u.email);
  return u;
}
async function listUsers() {
  const r = db.getRedis(); if (!r) return [];
  const emails = await r.smembers(USERS_INDEX);
  const out = [];
  for (const e of (emails || [])) {
    const u = await getUser(e);
    if (u) out.push({ email: u.email, name: u.name || '', role: u.role, supplierSlug: u.supplierSlug || '', category: u.category || 'accommodation', active: u.active !== false, createdAt: u.createdAt || 0 });
  }
  out.sort(function (a, b) { return a.role === b.role ? (a.email < b.email ? -1 : 1) : (a.role < b.role ? -1 : 1); });
  return out;
}
async function countUsers() {
  const r = db.getRedis(); if (!r) return 0;
  return (await r.scard(USERS_INDEX)) || 0;
}

function redirectFor(role) {
  if (role === 'owner') return '/owner/';
  if (role === 'supplier') return '/supplier/';
  return '/agent/';
}

module.exports = {
  ROLES, COOKIE, normEmail, hashPassword, verifyPassword,
  signSession, verifySession, makeSessionToken,
  readCookie, setSessionCookie, clearSessionCookie, sessionFromReq,
  getUser, saveUser, listUsers, countUsers, redirectFor,
};
