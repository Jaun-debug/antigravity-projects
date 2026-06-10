// Vercel Serverless Function — returns NET STO rates only after a valid agent login.
// The STO numbers and the password live here, server-side. They are NEVER sent to a
// browser that hasn't authenticated, and are not present in any public page source.
//
// SET THESE IN VERCEL → Project Settings → Environment Variables:
//   AGENT_USER  = desert tracks
//   AGENT_PASS  = passme9cops
// (Keeping them in env vars means they are not in the Git repo either.)

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
  }
};

module.exports = (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const body = req.body || {};
  const user = String(body.username || '').trim().toLowerCase();
  const pass = String(body.password || '');
  const lodge = String(body.lodge || '').trim();

  const VALID_USER = (process.env.AGENT_USER || '').trim().toLowerCase();
  const VALID_PASS = process.env.AGENT_PASS || '';

  if (!VALID_USER || !VALID_PASS) {
    return res.status(500).json({ error: 'Login not configured. Set AGENT_USER and AGENT_PASS in Vercel.' });
  }
  if (user !== VALID_USER || pass !== VALID_PASS) {
    return res.status(401).json({ error: 'Invalid agent credentials.' });
  }
  const data = STO_DB[lodge];
  if (!data) {
    return res.status(404).json({ error: 'Lodge not found.' });
  }
  return res.status(200).json({ ok: true, lodge, rates: data });
};
