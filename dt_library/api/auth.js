// Partner Portal auth API. One endpoint, action-based (mirrors owner-rates.js).
//
//   POST { action:'login',    email, password }                 -> { ok, role, redirect, name } (+ sets cookie)
//   POST { action:'me' }                                        -> { ok, user:{email,role,name,supplierSlug} }
//   POST { action:'logout' }                                    -> { ok } (+ clears cookie)
//   POST { action:'bootstrap', email, password, ownerPass }     -> first owner only (when no users exist)
//   POST { action:'createUser', email, password, role, name, supplierSlug }  -> owner only
//   POST { action:'listUsers' }                                 -> owner only
//   POST { action:'setActive', email, active }                  -> owner only
//   POST { action:'setPassword', email, password }              -> owner (any user) or self
//
// Reuses the shared Upstash Redis via _auth / _ratesdb — no new services.

const db = require('./_ratesdb');
const auth = require('./_auth');

function readBody(req) {
  return new Promise(function (resolve) {
    if (req.body && typeof req.body === 'object') return resolve(req.body);
    let data = '';
    req.on('data', function (c) { data += c; });
    req.on('end', function () { try { resolve(JSON.parse(data || '{}')); } catch (e) { resolve({}); } });
    req.on('error', function () { resolve({}); });
  });
}

function validEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(e || '')); }

module.exports = async function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!db.dbConfigured()) return res.status(200).json({ ok: false, error: 'Database not configured yet.' });

  const body = await readBody(req);
  const action = String(body.action || '');
  const caller = auth.sessionFromReq(req);

  try {
    // ── login ────────────────────────────────────────────────────────────────
    if (action === 'login') {
      const u = await auth.getUser(body.email);
      if (!u || u.active === false || !auth.verifyPassword(body.password, u.salt, u.hash)) {
        return res.status(200).json({ ok: false, error: 'Incorrect email or password.' });
      }
      auth.setSessionCookie(res, auth.makeSessionToken(u));
      return res.status(200).json({ ok: true, role: u.role, name: u.name || '', redirect: auth.redirectFor(u.role) });
    }

    // ── me ─────────────────────────────────────────────────────────────────────
    if (action === 'me') {
      if (!caller) return res.status(200).json({ ok: false });
      return res.status(200).json({ ok: true, user: { email: caller.email, role: caller.role, name: caller.name || '', supplierSlug: caller.supplierSlug || '' } });
    }

    // ── logout ─────────────────────────────────────────────────────────────────
    if (action === 'logout') {
      auth.clearSessionCookie(res);
      return res.status(200).json({ ok: true });
    }

    // ── bootstrap the very first owner (only when no users exist) ───────────────
    if (action === 'bootstrap') {
      if ((await auth.countUsers()) > 0) return res.status(200).json({ ok: false, error: 'Already set up. Ask the owner to add your account.' });
      const ownerPass = db.ownerPass();
      if (!ownerPass || body.ownerPass !== ownerPass) return res.status(200).json({ ok: false, error: 'Owner setup password is incorrect.' });
      if (!validEmail(body.email)) return res.status(200).json({ ok: false, error: 'Enter a valid email.' });
      if (String(body.password || '').length < 8) return res.status(200).json({ ok: false, error: 'Password must be at least 8 characters.' });
      const ph = auth.hashPassword(body.password);
      const u = await auth.saveUser({ email: body.email, name: body.name || 'Owner', role: 'owner', supplierSlug: '', salt: ph.salt, hash: ph.hash, active: true, createdAt: Date.now() });
      auth.setSessionCookie(res, auth.makeSessionToken(u));
      return res.status(200).json({ ok: true, role: 'owner', redirect: '/owner/' });
    }

    // ── owner-only account management ───────────────────────────────────────────
    const isOwner = caller && caller.role === 'owner';

    if (action === 'createUser') {
      if (!isOwner) return res.status(200).json({ ok: false, error: 'Owner access required.' });
      const role = String(body.role || 'agent');
      if (auth.ROLES.indexOf(role) < 0) return res.status(200).json({ ok: false, error: 'Invalid role.' });
      if (!validEmail(body.email)) return res.status(200).json({ ok: false, error: 'Enter a valid email.' });
      if (String(body.password || '').length < 8) return res.status(200).json({ ok: false, error: 'Password must be at least 8 characters.' });
      if (await auth.getUser(body.email)) return res.status(200).json({ ok: false, error: 'An account with that email already exists.' });
      const ph = auth.hashPassword(body.password);
      await auth.saveUser({ email: body.email, name: body.name || '', role: role, supplierSlug: body.supplierSlug || '', salt: ph.salt, hash: ph.hash, active: true, createdAt: Date.now() });
      return res.status(200).json({ ok: true, email: auth.normEmail(body.email), role: role });
    }

    if (action === 'listUsers') {
      if (!isOwner) return res.status(200).json({ ok: false, error: 'Owner access required.' });
      return res.status(200).json({ ok: true, users: await auth.listUsers() });
    }

    if (action === 'setActive') {
      if (!isOwner) return res.status(200).json({ ok: false, error: 'Owner access required.' });
      const u = await auth.getUser(body.email);
      if (!u) return res.status(200).json({ ok: false, error: 'No such user.' });
      u.active = body.active !== false && body.active !== 'false';
      await auth.saveUser(u);
      return res.status(200).json({ ok: true });
    }

    if (action === 'setPassword') {
      const target = auth.normEmail(body.email);
      const self = caller && auth.normEmail(caller.email) === target;
      if (!isOwner && !self) return res.status(200).json({ ok: false, error: 'Not allowed.' });
      if (String(body.password || '').length < 8) return res.status(200).json({ ok: false, error: 'Password must be at least 8 characters.' });
      const u = await auth.getUser(target);
      if (!u) return res.status(200).json({ ok: false, error: 'No such user.' });
      const ph = auth.hashPassword(body.password);
      u.salt = ph.salt; u.hash = ph.hash;
      await auth.saveUser(u);
      return res.status(200).json({ ok: true });
    }

    return res.status(200).json({ ok: false, error: 'Unknown action.' });
  } catch (e) {
    return res.status(200).json({ ok: false, error: String(e && e.message ? e.message : e) });
  }
};
