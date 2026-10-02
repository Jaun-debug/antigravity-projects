// Vercel Serverless Function — Natural Selection live availability probe.
//
// Natural Selection publish a live room grid on naturalselection.travel/check-availability/,
// fed by their reservations system (TMIS / Tourplan, tmis.co.za). That endpoint only
// accepts browser calls from naturalselection.travel (CORS), so this function makes the
// same call server-side, the same way /api/nbavail does for NightsBridge.
//
// Contract:
//   GET /api/nsavail?camp=hoanibelephantcamp&start=2026-11-20&nights=3
//   -> { ok:true, camp, name, start, nights, free, available, rooms:[{name, free}] }
//   -> { ok:false, error }           (never throws; the dot just stays grey)
//
// "free" for a room type = the lowest number of rooms open across every night of the stay;
// the stay is available when at least one room type has a room open on every night.
// Responses are cached at the edge for 5 minutes.

const NS_ENDPOINT = 'https://tmis.co.za/natural_selection/tp_extension/hosted/option/allocation';

// Camp key (lowercase, letters and digits only) -> Natural Selection's option ids for that camp.
// Taken from their public availability page on 2 Oct 2026.
const CAMPS = {
  tawana: [9211, 9453],
  northislandokavango: [8659, 9541],
  dukescamp: [8029, 9446, 9447],
  dukeseast: [9200, 9448, 9449],
  mbamba: [9607, 9608, 9609],
  tuludi: [5826, 9450],
  sablealley: [1968, 9452, 9451],
  littlesable: [5855, 9641],
  elephantpan: [9307, 9711],
  skybeds: [9308],
  mokolwane: [9404, 9454],
  mokolwaneplains: [10331, 10339],
  jackscamp: [9461, 3532, 9443],
  sancamp: [1973, 9444, 9445],
  campkalahari: [1974, 9441, 9442],
  menoakwena: [54, 9440, 9439],
  thamotelele: [7973, 8092, 7975, 8126],
  expeditionscamp: [9810, 9811],
  kwessidunes: [6058, 9499],
  hoanibvalleycamp: [4966, 9500],
  hoanibelephantcamp: [9699, 9698],
  safarihoek: [5276, 5277, 5273, 5274, 3545, 5272],
  safarihoeklodge: [5276, 5277, 5273, 5274, 3545, 5272],
  etoshamountainlodge: [5381, 5384, 5379, 5380],
  safarihouse: [5918],
  nkasalinyanti: [9685],
  lekkerwater: [5814, 9498]
};

function isIsoDate(s) {
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(new Date(s + 'T00:00:00Z').getTime());
}
function addDays(iso, n) {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');

  const q = req.query || {};
  const camp = String(q.camp || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const start = String(q.start || '').trim();
  let nights = parseInt(String(q.nights || '1'), 10);
  if (!nights || nights < 1) nights = 1;
  if (nights > 14) nights = 14; // the grid returns 14 days from the start date

  const ids = CAMPS[camp];
  if (!ids || !isIsoDate(start)) {
    return res.status(200).json({ ok: false, error: 'bad params' });
  }

  try {
    const ctrl = new AbortController();
    const timer = setTimeout(function () { ctrl.abort(); }, 9000);
    const r = await fetch(NS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': 'https://naturalselection.travel',
        'Referer': 'https://naturalselection.travel/check-availability/',
        'User-Agent': 'Mozilla/5.0 (compatible; NamibiaRates/1.0)'
      },
      body: JSON.stringify({ OptList: ids, StartDate_String: start, Country: '', PriceRange: '', IsMobile: false }),
      signal: ctrl.signal
    });
    clearTimeout(timer);
    if (!r.ok) return res.status(200).json({ ok: false, error: 'upstream ' + r.status });

    const rows = await r.json();
    if (!Array.isArray(rows) || !rows.length) return res.status(200).json({ ok: false, error: 'no data' });

    // The nights we need: start .. start+nights-1, in the feed's YYYY/MM/DD form.
    const want = [];
    for (let i = 0; i < nights; i++) want.push(addDays(start, i).replace(/-/g, '/'));

    let name = '';
    const byRoom = {}; // opT_ID -> {name, perNight:{date:available}}
    rows.forEach(function (x) {
      if (!x || !x.allocation) return;
      if (!name && x.crm && x.crm.name) name = String(x.crm.name);
      const id = x.opT_ID;
      const rt = byRoom[id] || (byRoom[id] = { name: String(x.description || '').trim(), perNight: {} });
      rt.perNight[String(x.allocation.availabilityDate_String)] = Number(x.allocation.available || 0);
    });

    const rooms = Object.keys(byRoom).map(function (id) {
      const rt = byRoom[id];
      let min = Infinity;
      want.forEach(function (d) {
        const v = rt.perNight[d];
        min = Math.min(min, typeof v === 'number' ? Math.max(0, v) : 0);
      });
      return { name: rt.name, free: min === Infinity ? 0 : min };
    });
    // The same physical room is sometimes listed once per meal plan ("Classic Room - FI",
    // "Classic Room - DBB"); count each physical room type once.
    const phys = {};
    rooms.forEach(function (x) {
      const k = x.name.split(' - ')[0].trim().toLowerCase();
      phys[k] = Math.max(phys[k] || 0, x.free);
    });
    const free = Object.keys(phys).reduce(function (t, k) { return t + phys[k]; }, 0);

    return res.status(200).json({
      ok: true, camp: camp, name: name, start: start, nights: nights,
      free: free, available: free > 0, rooms: rooms
    });
  } catch (e) {
    return res.status(200).json({ ok: false, error: 'fetch failed' });
  }
};
