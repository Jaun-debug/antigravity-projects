// Vercel Serverless Function — NightsBridge live availability probe.
//
// The itinerary builder calls this in the background once a row has both a
// lodge (with a NightsBridge property id) and a check-in date, and shows a
// green dot when rooms are free / red when nothing is available.
//
// Why a server-side proxy: book.nightsbridge.com's API only allows its own
// origin, so the browser on namibiarates.com cannot call it directly (CORS).
// This function makes the same call server-side, where CORS does not apply.
//
// Contract:
//   GET /api/nbavail?bbid=14158&start=2026-11-20&nights=3
//   -> { ok:true, bbid, start, end, nights, free, available, rooms:[{name, free}] }
//   -> { ok:false, error }           (never throws; the dot just hides)
//
// Politeness: responses are cached at the edge for 5 minutes, so repeatedly
// re-rendering a quote does not re-hit NightsBridge for the same lodge/date.

const NB_ENDPOINT = 'https://www.nightsbridge.com/bridge/api/5.0/availability/';

function addDays(iso, n) {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function isIsoDate(s) {
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(new Date(s + 'T00:00:00Z').getTime());
}

module.exports = async (req, res) => {
  // Cache at the edge: same lodge + same dates won't re-hit NightsBridge for 5 min.
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');

  const q = req.query || {};
  const bbid = parseInt(String(q.bbid || ''), 10);
  const start = String(q.start || '').trim();
  let nights = parseInt(String(q.nights || '1'), 10);
  if (!nights || nights < 1) nights = 1;
  if (nights > 30) nights = 30;

  if (!bbid || !isIsoDate(start)) {
    return res.status(200).json({ ok: false, error: 'bad params' });
  }

  const end = addDays(start, nights);

  try {
    const ctrl = new AbortController();
    const timer = setTimeout(function () { ctrl.abort(); }, 8000);

    const r = await fetch(NB_ENDPOINT + bbid, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        // NightsBridge's API expects its own booking engine as the caller.
        'Origin': 'https://book.nightsbridge.com',
        'Referer': 'https://book.nightsbridge.com/' + bbid,
        'User-Agent': 'Mozilla/5.0 (compatible; NamibiaRates/1.0)'
      },
      body: JSON.stringify({
        bbid: bbid, startdate: start, enddate: end, nightsbridge: true,
        bbrtid: 0, rtgroupid: 0, nbid: 0, promocode: ''
      }),
      signal: ctrl.signal
    });
    clearTimeout(timer);

    if (!r.ok) return res.status(200).json({ ok: false, error: 'upstream ' + r.status });

    const j = await r.json();
    if (!j || j.success !== true || !j.data) {
      return res.status(200).json({ ok: false, error: 'no data' });
    }

    const rts = Array.isArray(j.data.roomtypes) ? j.data.roomtypes : [];
    const rooms = rts.map(function (x) {
      return { name: String(x.roomtypename || '').trim(), free: Number(x.roomsfree || 0) };
    }).filter(function (x) { return x.name; });

    const free = rooms.reduce(function (t, x) { return t + (x.free > 0 ? x.free : 0); }, 0);

    return res.status(200).json({
      ok: true,
      bbid: bbid, start: start, end: end, nights: nights,
      name: String(j.data.name || ''),
      free: free,
      available: free > 0,
      rooms: rooms
    });
  } catch (e) {
    // Timeouts / network blips must never break the builder — the dot just hides.
    return res.status(200).json({ ok: false, error: String((e && e.message) || e).slice(0, 120) });
  }
};
