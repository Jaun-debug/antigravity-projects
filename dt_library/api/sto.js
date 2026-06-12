// Vercel Serverless Function — agent auth + NET STO rates.
//
// SINGLE SIGN-IN MODEL:
//   1. Agent signs in once (homepage header) with username + password.
//      -> POST { username, password }            -> { ok, token }
//   2. The browser stores that token and every lodge page sends it back:
//      -> POST { token, lodge: "<slug>" }         -> { ok, token, lodge, rates }
//   The STO numbers and the password live here, server-side. They are NEVER
//   sent to a browser that hasn't authenticated, and are not in any page source.
//
// SET THESE IN VERCEL → Project Settings → Environments → Production:
//   AGENT_USER  = desert tracks
//   AGENT_PASS  = passme9cops
//
// The session token is derived from AGENT_PASS, so it is not a separate secret
// and it automatically invalidates every session if you ever change the password.

const crypto = require('crypto');

function sessionToken(pass) {
  return crypto.createHash('sha256').update('nr-agent-session|' + pass).digest('hex').slice(0, 40);
}

const STO_DB = {
  'camp-kwando': {
    name: 'Camp Kwando',
    commission: '20% STO',
    currency: 'N$',
    validity: '01 Dec 2025 – 30 Nov 2026',
    note: 'All rates in Namibian Dollar, incl. VAT & Tourism Levy. Net STO rates.',
    sections: [
      { title: 'Bed & Breakfast (per person, per night)', rows: [
        ['Tented River Chalet — Single', '1,612'],
        ['Tented River Chalet — Double (pp sharing)', '1,380'],
        ['Tented Chalet — Single', '1,208'],
        ['Tented Chalet — Double (pp sharing)', '1,072'],
        ['Tree House — Single', '2,700'],
        ['Tree House — Double (pp sharing)', '2,052']
      ]},
      { title: 'Dinner, Bed & Breakfast (per person, per night)', rows: [
        ['Tented River Chalet — Single', '2,032'],
        ['Tented River Chalet — Double (pp sharing)', '1,800'],
        ['Tented Chalet — Single', '1,628'],
        ['Tented Chalet — Double (pp sharing)', '1,492'],
        ['Tree House — Single', '3,120'],
        ['Tree House — Double (pp sharing)', '2,472']
      ]},
      { title: 'Activities (per person)', rows: [
        ['Game Drive (min 2 / max 10 pax)', '760'],
        ['Boat Cruise (morning or sunset)', '552'],
        ['Bird Cruise (mornings only)', '552']
      ]}
    ]
  },
  'epako-safari-lodge': {
    name: 'Epako Safari Lodge', commission: '20% STO', currency: 'N$', validity: '2026',
    note: 'All rates in Namibian Dollar, incl. VAT & Tourism Levy. Net STO rates.',
    sections: [
      { title: 'Rates (per person, per night)', rows: [
        ['Deluxe Room (Sharing pp) - DBB', '7,120'],
        ['Deluxe Room (Single) - DBB', '10,720'],
        ['Junior Suite (Sharing pp) - DBB', '9,720'],
        ['Junior Suite (Single) - DBB', '14,240'],
        ['Tour Guide Room - DBB', '2,190']
      ]}
    ]
  }
};

module.exports = (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body || {};
  const token = String(body.token || '');
  const user = String(body.username || '').trim().toLowerCase();
  const pass = String(body.password || '');
  const lodge = String(body.lodge || '').trim();

  const VALID_USER = (process.env.AGENT_USER || '').trim().toLowerCase();
  const VALID_PASS = process.env.AGENT_PASS || '';

  if (!VALID_USER || !VALID_PASS) {
    return res.status(500).json({ error: 'Login not configured. Set AGENT_USER and AGENT_PASS in Vercel.' });
  }

  const validToken = sessionToken(VALID_PASS);

  // Authenticate by an existing session token OR by username + password.
  const authedByToken = token && token === validToken;
  const authedByCreds = user && user === VALID_USER && pass === VALID_PASS;

  if (!authedByToken && !authedByCreds) {
    return res.status(401).json({ error: 'Invalid agent credentials.' });
  }

  // Always hand back the session token so the browser can stay signed in.
  const out = { ok: true, token: validToken };

  // If a lodge was requested, include its net STO rates.
  if (lodge) {
    const data = STO_DB[lodge];
    if (!data) {
      return res.status(404).json({ error: 'Lodge not found.' });
    }
    out.lodge = lodge;
    out.rates = data;
  }

  return res.status(200).json(out);
};
