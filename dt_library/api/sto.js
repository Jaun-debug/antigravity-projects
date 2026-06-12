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
  },
'ababis-guest-farm': {
    name: 'Ababis Guest Farm', commission: '20% STO', currency: 'N$', validity: '2026',
    note: 'All rates in Namibian Dollar, incl. VAT & Tourism Levy. Net STO rates.',
    sections: [
      { title: 'Rates (per person, per night)', rows: [
        ['Comfort Double Room (Sharing) - DBB', '2,496'],
        ['Comfort Single Room - DBB', '2,800'],
        ['Comfort Double (2 Nights Stay Discount) - DBB', '2,246.40'],
        ['Comfort Single (2 Nights Stay Discount) - DBB', '2,520'],
        ['Self-Catering Farmhouse (2 Pax Sharing) - RO', '800'],
        ['Campsite (Per Person) - RO', '280'],
        ['Tour Guide Room - DBB', '1,040']
      ]}
    ]
  },
  'africa-safari-lodge': {
    name: 'Africa Safari Lodge', commission: '40% STO', currency: 'N$', validity: '2026',
    note: 'All rates in Namibian Dollar, incl. VAT & Tourism Levy. Net STO rates.',
    sections: [
      { title: 'Rates (per person, per night)', rows: [
        ['Standard Room (Sharing) - DBB', '967'],
        ['Standard Room (Single) - DBB', '1,192'],
        ['Standard Room (Sharing) - BB', '672'],
        ['Standard Room (Single) - BB', '897'],
        ['Deluxe Family Room (2 Adults Sharing) - DBB', '2,753'],
        ['Deluxe Family Room (2 Adults Sharing) - BB', '1,863']
      ]}
    ]
  },
  'aloegrove-safari-lodge': {
    name: 'Aloegrove Safari Lodge', commission: '20% STO', currency: 'N$', validity: '2026',
    note: 'All rates in Namibian Dollar, incl. VAT & Tourism Levy. Net STO rates.',
    sections: [
      { title: 'Rates (per person, per night)', rows: [
        ['Standard Room (Sharing pp) - B&B', '1,420.80'],
        ['Standard Room (Single) - B&B', '1,624'],
        ['Luxury Room (Sharing pp) - B&B', '1,644.80'],
        ['Luxury Room (Single) - B&B', '1,848'],
        ['Kids 5-11 sharing - B&B', '432'],
        ['Kids 12-18 sharing - B&B', '1,280'],
        ['Tour Guide Room - B&B', '1,200']
      ]}
    ]
  },
  'alte-kalkofen-lodge': {
    name: 'Alte Kalkofen Lodge', commission: '20% STO', currency: 'N$', validity: '2026',
    note: 'All rates in Namibian Dollar, incl. VAT & Tourism Levy. Net STO rates.',
    sections: [
      { title: 'Rates (per person, per night)', rows: [
        ['Luxury Chalet (Sharing) - B&B', '1,352'],
        ['Luxury Chalet (Single) - B&B', '1,560'],
        ['Luxury Chalet (Sharing) - Self Catering (Acc Only)', '1,184'],
        ['Luxury Chalet (Single) - Self Catering (Acc Only)', '1,408'],
        ['Children 3-13 years sharing - B&B', '676'],
        ['Camping (Per Person) - RO', '200'],
        ['Tour Guide Room - B&B', '812']
      ]}
    ]
  },
  'atlantic-villa': {
    name: 'Atlantic Villa Boutique Guesthouse', commission: '20% STO', currency: 'N$', validity: '2026',
    note: 'All rates in Namibian Dollar, incl. VAT & Tourism Levy. Net STO rates.',
    sections: [
      { title: 'Rates (per person, per night)', rows: [
        ['Standard Room (Sharing pp) - B&B', '1,056'],
        ['Standard Room (Single) - B&B', '1,440'],
        ['Deluxe Room (Sharing pp) - B&B', '1,320'],
        ['Deluxe Room (Single) - B&B', '1,760'],
        ['Luxury Room (Sharing pp) - B&B', '1,424'],
        ['Luxury Room (Single) - B&B', '1,936'],
        ['Junior Suite (Sharing pp) - B&B', '2,024'],
        ['Junior Suite (Single) - B&B', '2,816'],
        ['Tour Guide Rate (Nett) - B&B', '750']
      ]}
    ]
  },
  'auas-safari-lodge': {
    name: 'Auas Safari Lodge', commission: '20% STO', currency: 'N$', validity: '2026',
    note: 'All rates in Namibian Dollar, incl. VAT & Tourism Levy. Net STO rates.',
    sections: [
      { title: 'Rates (per person, per night)', rows: [
        ['Standard Room (Sharing pp) - DBB', '1,888'],
        ['Standard Room (Single) - DBB', '2,208'],
        ['Luxury Room (Sharing pp) - DBB', '2,500'],
        ['Luxury Room (Single) - DBB', '2,816'],
        ['Children (7-12 years) sharing - DBB', '1,200'],
        ['Children (3-6 years) sharing - DBB', '368'],
        ['Tour Guide Rate (Nett) - DBB', '1,500']
      ]}
    ]
  },
  'bahnhof-hotel-aus': {
    name: 'Bahnhof Hotel Aus', commission: '20% STO', currency: 'N$', validity: '2026',
    note: 'All rates in Namibian Dollar, incl. VAT & Tourism Levy. Net STO rates.',
    sections: [
      { title: 'Rates (per person, per night)', rows: [
        ['Double Room (Sharing pp) - B&B', '948'],
        ['Single Room - B&B', '1,096'],
        ['Family Room (Sharing pp) - B&B', '948'],
        ['Orange House Sharing - Self Catering (Acc Only)', '467.50'],
        ['Orange House Single - Self Catering (Acc Only)', '935']
      ]}
    ]
  },
  'cornerstone-guesthouse': {
    name: 'Cornerstone Guesthouse', commission: '20% STO', currency: 'N$', validity: '2026',
    note: 'All rates in Namibian Dollar, incl. VAT & Tourism Levy. Net STO rates.',
    sections: [
      { title: 'Rates (per person, per night)', rows: [
        ['Double Room (Sharing pp) - B&B', '1,011.97'],
        ['Single Room - B&B', '1,223.93'],
        ['Apartment (1-Bedroom, max 2) - RO', '2,116.24'],
        ['Apartment (2-Bedroom, max 4) - RO', '3,179.49'],
        ['Apartment (3-Bedroom, max 6) - RO', '3,712.82'],
        ['Children (4-12 years) sharing - B&B', '632.48']
      ]}
    ]
  },
  'epacha-game-lodge-spa': {
    name: 'Epacha Game Lodge & Spa', commission: '20% STO', currency: 'N$', validity: '2026',
    note: 'All rates in Namibian Dollar, incl. VAT & Tourism Levy. Net STO rates.',
    sections: [
      { title: 'Rates (per person, per night)', rows: [
        ['Hemingway Safari Tent (Sharing) - DBB', '3,300'],
        ['Hemingway Safari Tent (Single) - DBB', '4,265'],
        ['Family Safari Tent (Sharing) - DBB', '3,300'],
        ['Epacha Lodge Chalet (Sharing) - DBB', '5,060'],
        ['Epacha Lodge Chalet (Single) - DBB', '6,000'],
        ['Children 6-12 sharing (Safari Tents) - DBB', '1,645'],
        ['Children 6-12 sharing (Lodge Chalet) - DBB', '2,525'],
        ['Tour Guide Room - DBB', '1,320']
      ]}
    ]
  },
  'epupa-falls-lodge': {
    name: 'Epupa Falls Lodge', commission: '20% STO', currency: 'N$', validity: '2026',
    note: 'All rates in Namibian Dollar, incl. VAT & Tourism Levy. Net STO rates.',
    sections: [
      { title: 'Rates (per person, per night)', rows: [
        ['River View Chalet (Sharing pp) - DBB', '1,712'],
        ['River View Chalet (Single) - DBB', '1,956'],
        ['Standard Twin Chalet (Sharing pp) - DBB', '1,468'],
        ['Standard Twin Chalet (Single) - DBB', '1,468'],
        ['Children 3-12 sharing (Standard Chalet) - DBB', '650'],
        ['Campsite (Per Person) - RO', '180'],
        ['Tour Guide Room - DBB', '1,050']
      ]}
    ]
  },
  'erongo-rocks': {
    name: 'Erongo Rocks nature & camp', commission: '10% STO', currency: 'N$', validity: '2026',
    note: 'All rates in Namibian Dollar, incl. VAT & Tourism Levy. Net STO rates.',
    sections: [
      { title: 'Rates (per person, per night)', rows: [
        ['Comfy Camping (Sharing) - RO', '850'],
        ['Comfy Camping (Single) - RO', '950'],
        ['Campsite (Self-drive, per person) - RO', '385'],
        ['Children 7-12 sharing - RO', '425'],
        ['Tour Guide Rate (Camping) - RO', '192.50']
      ]}
    ]
  },
  'gabus-safari-lodge': {
    name: 'Gabus Safari Lodge', commission: '20% STO', currency: 'N$', validity: '2026',
    note: 'All rates in Namibian Dollar, incl. VAT & Tourism Levy. Net STO rates.',
    sections: [
      { title: 'Rates (per person, per night)', rows: [
        ['Luxury Room (Sharing pp) - DBB', '2,470.99'],
        ['Luxury Room (Single) - DBB', '4,450.78'],
        ['Luxury Room (Double per room) - DBB', '2,225.39'],
        ['Kids 2-6 sharing - DBB', '369.26'],
        ['Kids 7-11 sharing - DBB', '1,163.89'],
        ['Tour Guide Room - DBB', '750']
      ]}
    ]
  },
  'ghaub': {
    name: 'Ghaub & Waterberg Wilderness', commission: '20% STO', currency: 'N$', validity: '2026',
    note: 'All rates in Namibian Dollar, incl. VAT & Tourism Levy. Net STO rates.',
    sections: [
      { title: 'Rates (per person, per night)', rows: [
        ['Ghaub Double Room (Single/Twin beds) - DBB', '2,720'],
        ['Ghaub Campsite (Per Person) - RO', '420'],
        ['Waterberg Plateau Lodge Rock Chalet - DBB', '3,480'],
        ['Waterberg Wilderness Lodge Double Room - DBB', '2,560'],
        ['Waterberg Valley Lodge Econo Chalet - DBB', '1,800'],
        ['Waterberg Plateau Campsite - RO', '420'],
        ['Tour Guide Room (DBB) - Nett', '1,000']
      ]}
    ]
  },
  'hansa-hotel': {
    name: 'Hansa Hotel Swakopmund', commission: '20% STO', currency: 'N$', validity: '2026',
    note: 'All rates in Namibian Dollar, incl. VAT & Tourism Levy. Net STO rates.',
    sections: [
      { title: 'Rates (per person, per night)', rows: [
        ['Single Room - B&B', '1,950'],
        ['Double Room (Sharing pp) - B&B', '1,375'],
        ['Double Room (Per Room) - B&B', '2,750'],
        ['Triple Room - B&B', '3,250'],
        ['Suite - B&B', '3,460'],
        ['Children 5-12 sharing - B&B', '225'],
        ['Children 13-18 sharing - B&B', '330'],
        ['Tour Guide Room - B&B', '1,220']
      ]}
    ]
  },
  'hohewarte-guestfarm': {
    name: 'Hohewarte Guestfarm', commission: '20% STO', currency: 'N$', validity: '2026',
    note: 'All rates in Namibian Dollar, incl. VAT & Tourism Levy. Net STO rates.',
    sections: [
      { title: 'Rates (per person, per night)', rows: [
        ['Double Room (Sharing pp) - DBB', '1,600'],
        ['Single Room - DBB', '2,000'],
        ['Child u12 sharing - DBB', '800'],
        ['Tour Guide Room - DBB', '1,000']
      ]}
    ]
  },
  'hotel-thule': {
    name: 'Hotel Thule', commission: '15% STO', currency: 'N$', validity: '2026',
    note: 'All rates in Namibian Dollar, incl. VAT & Tourism Levy. Net STO rates.',
    sections: [
      { title: 'Rates (per person, per night)', rows: [
        ['Double Room (Sharing pp) - B&B', '1,649'],
        ['Single Room - B&B', '1,649'],
        ['Double Room (Per Room) - B&B', '3,298'],
        ['Children 3-12 sharing - B&B', '625'],
        ['Tour Guide Room - B&B', '1,050']
      ]}
    ]
  },
  'kalahari-game-lodge': {
    name: 'Kalahari Game Lodge', commission: '20% STO', currency: 'N$', validity: '2026',
    note: 'All rates in Namibian Dollar, incl. VAT & Tourism Levy. Net STO rates.',
    sections: [
      { title: 'Rates (per person, per night)', rows: [
        ['Chalet (Sharing pp) - DBB', '1,935'],
        ['Chalet (Single) - DBB', '3,352'],
        ['Campsite (Per Person) - RO', '378'],
        ['Kids 4-9 sharing - DBB', '977.50'],
        ['Tour Guide Room (2nd) - DBB', '700']
      ]}
    ]
  },
  'waldeck-lodge': {
    name: 'Waldeck Lodge', commission: '25% STO', currency: 'N$', validity: '2026',
    note: 'All rates in Namibian Dollar, incl. VAT & Tourism Levy. Net STO rates.',
    sections: [
      { title: 'Rates (per person, per night)', rows: [
        ['Per Person Rate (1 - 6 guests) - Full Inclusive', '24,750'],
        ['Per Person Rate (7 - 16 guests) - Full Inclusive', '20,625']
      ]}
    ]
  },
  'kaoko-mopane-lodge': {
    name: 'Kaoko Mopane Lodge & Camping', commission: '15% STO', currency: 'N$', validity: '2026',
    note: 'All rates in Namibian Dollar, incl. VAT & Tourism Levy. Net STO rates.',
    sections: [
      { title: 'Rates (per person, per night)', rows: [
        ['Luxury Room — Single', '2,252.50'],
        ['Luxury Room — Double/Twin (pp sharing)', '1,921'],
        ['Child 4–12 yrs (sharing with adults)', '807.50'],
        ['Tour Guide (per guide)', '1,150'],
        ['Luxury Room — Single', '1,870'],
        ['Luxury Room — Double/Twin (pp sharing)', '1,513'],
        ['Child 4–12 yrs', '510'],
        ['Tour Guide', '900'],
        ['Per Person', '255'],
        ['Child 4–12 yrs', '127.50'],
        ['Overlander (10+ pax)', '212.50']
      ]}
    ]
  },
  'nooishof': {
    name: 'Nooishof', commission: '25% STO', currency: 'N$', validity: '2026',
    note: 'All rates in Namibian Dollar, incl. VAT & Tourism Levy. Net STO rates.',
    sections: [
      { title: 'Rates (per person, per night)', rows: [
        ['Adult (per person per night)', '6,075'],
        ['Child 4–15 yrs (per night)', '3,037.50'],
        ['Guide (per night, nett)', '2,500']
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
