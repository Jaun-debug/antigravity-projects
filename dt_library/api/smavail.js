// Vercel Serverless Function — SiteMinder (direct-book.com) public availability probe.
//
// The Chobe Safari Lodge and Nata Lodge sell rooms to the public through SiteMinder's
// direct-book.com booking engine. Kwando's trade availability (CIMSO) sits behind the agent
// login, so the builder checks the lodges' PUBLIC allocation instead and labels it as such.
//
// Why a server-side proxy: direct-book.com's API sends no CORS headers, so the browser on
// namibiarates.com cannot call it directly.
//
// Contract (same shape as /api/nbavail and /api/nsavail):
//   GET /api/smavail?prop=chobesafarilodgedirect&start=2026-11-20&nights=2
//   -> { ok:true, prop, start, end, nights, free, available, rooms:[{id, free}], source:'siteminder-public' }
//   -> { ok:false, error }           (never throws; the chip just shows the calendar icon)
//
// Only the properties listed below are proxied (no open relay). Room-type ids are the ones the
// booking engine lists for each property (read 6 Oct 2026). A room type counts as free when the
// engine says the guest can check in that day, the stay meets its minimum stay, and it has rooms.
// Responses are cached at the edge for 5 minutes.

const PROPS = {
  // The Chobe Safari Lodge: the three room types sold online (Rondavels, Luxury Bush Room, Safari Room).
  // River Rooms, Suites and Explorer Suites are not sold on direct-book, so they are not covered.
  chobesafarilodgedirect: [175880, 224568, 175589],
  // Nata Lodge: the two room types sold online.
  NataLodgeDIRECT: [292085, 292086]
};

function addDays(iso, n) {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
function isIsoDate(s) {
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(new Date(s + 'T00:00:00Z').getTime());
}

async function roomType(prop, id, start, nights) {
  const u = 'https://direct-book.com/api/properties/' + encodeURIComponent(prop) + '/room-types/' + id +
    '/availability?checkInsFrom=' + start + '&checkInsTo=' + start + '&adults=2&children=0&infants=0&los=' + nights;
  const ctrl = new AbortController();
  const timer = setTimeout(function () { ctrl.abort(); }, 8000);
  try {
    const r = await fetch(u, {
      headers: {
        'Accept': 'application/json',
        'Referer': 'https://direct-book.com/properties/' + prop,
        'User-Agent': 'Mozilla/5.0 (compatible; NamibiaRates/1.0)'
      },
      signal: ctrl.signal
    });
    if (!r.ok) throw new Error('upstream ' + r.status);
    const j = await r.json();
    const row = (j && Array.isArray(j.result)) ? j.result.find(function (x) { return String(x.date || '').slice(0, 10) === start; }) : null;
    if (!row) return { id: id, free: 0 };
    const minStay = row.checkOutConstraint && row.checkOutConstraint.minStay ? Number(row.checkOutConstraint.minStay) : 1;
    const ok = row.canCheckIn !== false && nights >= minStay;
    return { id: id, free: ok ? Math.max(0, Number(row.totalAvailability || 0)) : 0 };
  } finally {
    clearTimeout(timer);
  }
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
  const q = req.query || {};
  const prop = String(q.prop || '').trim();
  const start = String(q.start || '').trim();
  let nights = parseInt(String(q.nights || '1'), 10);
  if (!nights || nights < 1) nights = 1;
  if (nights > 30) nights = 30;
  if (!PROPS[prop] || !isIsoDate(start)) {
    return res.status(200).json({ ok: false, error: 'bad params' });
  }
  try {
    const rooms = await Promise.all(PROPS[prop].map(function (id) { return roomType(prop, id, start, nights); }));
    const free = rooms.reduce(function (t, x) { return t + x.free; }, 0);
    return res.status(200).json({
      ok: true, prop: prop, start: start, end: addDays(start, nights), nights: nights,
      free: free, available: free > 0, rooms: rooms, source: 'siteminder-public'
    });
  } catch (e) {
    return res.status(200).json({ ok: false, error: String((e && e.message) || e).slice(0, 120) });
  }
};
