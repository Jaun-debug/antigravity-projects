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
  },
'droombos-estate': {
    name: 'Droombos Estate & Simanya River Lodge', commission: '20% STO', currency: 'N$', validity: '2026',
    note: 'All rates in Namibian Dollar, incl. VAT & Tourism Levy. Net STO rates.',
    sections: [
      { title: 'Rates (per person, per night)', rows: [
        ['Droombos Distinctive Room (Sharing) - B&B (Low Season)', '4,449'],
        ['Droombos Distinctive Room (Sharing) - B&B (High Season)', '4,894'],
        ['Droombos Distinctive Room (Single) - B&B (Low Season)', '5,121'],
        ['Droombos Distinctive Room (Single) - B&B (High Season)', '5,633'],
        ['Droombos Luxury Room (Sharing) - B&B (Low Season)', '2,759'],
        ['Droombos Luxury Room (Sharing) - B&B (High Season)', '3,035'],
        ['Droombos Luxury Room (Single) - B&B (Low Season)', '3,146'],
        ['Droombos Luxury Room (Single) - B&B (High Season)', '3,461'],
        ['Droombos Standard Room (Sharing) - B&B (Low Season)', '1,355'],
        ['Droombos Standard Room (Sharing) - B&B (High Season)', '1,491'],
        ['Droombos Standard Room (Single) - B&B (Low Season)', '1,549'],
        ['Droombos Standard Room (Single) - B&B (High Season)', '1,704'],
        ['Droombos Vineyard Glamping (Sharing) - B&B (Low Season)', '700'],
        ['Droombos Vineyard Glamping (Sharing) - B&B (High Season)', '880'],
        ['Droombos Campsite (Sharing) - RO (Low Season)', '400'],
        ['Droombos Campsite (Sharing) - RO (High Season)', '480'],
        ['Simanya Standard Chalet (Sharing) - DBB (Low Season)', '2,904'],
        ['Simanya Standard Chalet (Sharing) - DBB (High Season)', '3,049.20'],
        ['Simanya Standard Chalet (Single) - DBB (Low Season)', '3,505.92'],
        ['Simanya Standard Chalet (Single) - DBB (High Season)', '3,681.22'],
        ['Simanya Luxury Chalet (Sharing) - DBB (Low Season)', '4,488'],
        ['Simanya Luxury Chalet (Sharing) - DBB (High Season)', '4,712.40'],
        ['Simanya Luxury Chalet (Single) - DBB (Low Season)', '5,192'],
        ['Simanya Luxury Chalet (Single) - DBB (High Season)', '5,451.60'],
        ['Simanya Campsite (Sharing) - RO (Low Season)', '350'],
        ['Simanya Campsite (Sharing) - RO (High Season)', '420'],
        ['Tour Guide Room (Droombos) - B&B (Low Season)', '1,200'],
        ['Tour Guide Room (Droombos) - B&B (High Season)', '1,200'],
        ['Tour Guide Room (Simanya) - DBB (Low Season)', '1,110'],
        ['Tour Guide Room (Simanya) - DBB (High Season)', '1,110']
      ]}
    ]
  },
  'emanya-at-etosha': {
    name: 'Emanya at Etosha', commission: '25% STO', currency: 'N$', validity: '2026',
    note: 'All rates in Namibian Dollar, incl. VAT & Tourism Levy. Net STO rates.',
    sections: [
      { title: 'Rates (per person, per night)', rows: [
        ['Standard Chalet (Sharing) - B&B (Low Season)', '1,477.50'],
        ['Standard Chalet (Sharing) - B&B (High Season)', '1,875'],
        ['Standard Chalet (Single) - B&B (Low Season)', '2,325'],
        ['Standard Chalet (Single) - B&B (High Season)', '3,000'],
        ['Standard Chalet (Sharing) - DBB (Low Season)', '1,856.25'],
        ['Standard Chalet (Sharing) - DBB (High Season)', '2,257.50'],
        ['Standard Chalet (Single) - DBB (Low Season)', '2,970'],
        ['Standard Chalet (Single) - DBB (High Season)', '3,210'],
        ['Children 4-11 sharing - B&B (Low Season)', '877.50'],
        ['Children 4-11 sharing - B&B (High Season)', '1,125'],
        ['Children 4-11 sharing - DBB (Low Season)', '1,113.75'],
        ['Children 4-11 sharing - DBB (High Season)', '1,350'],
        ['Tour Guide Room - DBB (Low Season)', '880'],
        ['Tour Guide Room - DBB (High Season)', '880']
      ]}
    ]
  },
  'namib-guesthouse': {
    name: 'Namib Guesthouse', commission: '20% STO', currency: 'N$', validity: '2026',
    note: 'All rates in Namibian Dollar, incl. VAT & Tourism Levy. Net STO rates.',
    sections: [
      { title: 'Rates (per person, per night)', rows: [
        ['Single Room (Low Season)', '1,120'],
        ['Single Room (High Season)', '1,440'],
        ['Luxury Single Room (Low Season)', '1,280'],
        ['Luxury Single Room (High Season)', '1,600'],
        ['Double Room (pp sharing) (Low Season)', '1,040'],
        ['Double Room (pp sharing) (High Season)', '1,160'],
        ['Luxury Double (pp sharing) (Low Season)', '1,160'],
        ['Luxury Double (pp sharing) (High Season)', '1,360'],
        ['Family Suite (pp sharing) (Low Season)', '1,160'],
        ['Family Suite (pp sharing) (High Season)', '1,360'],
        ['Child 7–12 yrs (per child) (Low Season)', '600'],
        ['Child 7–12 yrs (per child) (High Season)', '600'],
        ['Tour Guide (Low Season)', '700'],
        ['Tour Guide (High Season)', '700']
      ]}
    ]
  },
'strand-hotel-swakopmund': {
    name: 'Strand Hotel Swakopmund', commission: '20% STO', currency: 'N$', validity: '2026',
    note: 'Net STO rates, incl. VAT & levy.', cols: ["Room Type","DBL/Sharing BB","Single BB","1 Child 7–13 Yrs BB  Adult","1 Child 7–13 Yrs BB  Interleading"], rows: [["Standard Rooms","3,518","5,629","879","2,638"],["Standard Sea Facing","3,758","6,013","939","2,818"],["Luxury Rooms","4,222","6,754","1,055","3,166"],["Luxury Sea Facing","4,462","7,138","1,115","3,346"],["Junior Suite","4,573","7,317","1,143","3,430"],["Luxury Suite","5,629","9,005","1,407","4,222"],["Presidential Suite","8,794","14,071","N/A","N/A"]]
  },
  'midgard-country-estate': {
    name: 'Midgard Country Estate', commission: '20% STO', currency: 'N$', validity: '2026',
    note: 'Net STO rates, incl. VAT & levy.', cols: ["Room Type","DBL/Sharing BB","DBL/Sharing DBB","Single BB","Single DBB","1 Child 7–13 BB","1 Child 7–13 DBB"], rows: [["Standard Room","2,472","3,086","3,956","4,718","618","771"],["Family Room","3,214","3,902","5,142","6,023","804","976"],["Junior Suite","3,804","4,551","6,086","7,062","951","1,138"],["Presidential Suite","4,708","5,546","7,533","8,653","1,177","1,386"]]
  }
,
  'alte-villa-2025': {"name": "Alte Villa", "commission": "15% STO", "currency": "N$", "validity": "2026", "note": "Net STO rates, incl. VAT & levy.", "sections": [{"title": "Double Rooms (per room / night)", "rows": [["Kolmanskoppe — 1 adult", "2,092.75"], ["Kolmanskoppe — 2 adults", "3,381.30"], ["Garub — 1 adult (private lounge shared w/ Grasplatz)", "2,092.75"], ["Garub — 2 adults", "3,381.30"], ["Grasplatz — 1 adult (private lounge shared w/ Garub)", "2,092.75"], ["Grasplatz — 2 adults", "3,381.30"]]}, {"title": "Family / Studio Rooms (sleeps up to 4)", "rows": [["Bogenfels Studio — 1 adult", "2,092.75"], ["Bogenfels Studio — 2 adults", "3,381.30"], ["Bogenfels Studio — 3 adults", "5,071.95"], ["Bogenfels — +1 child &amp;lt;12 (with 2 adults)", "920.00"], ["Bogenfels — +2 children &amp;lt;12 (with 2 adults)", "1,840.00"], ["Tsiras Mountains (private terrace) — 1 adult", "2,092.75"], ["Tsiras Mountains — 2 adults", "3,381.30"], ["Tsiras Mountains — +1 child &amp;lt;12", "920.00"], ["Tsiras Mountains — +2 children &amp;lt;12", "1,840.00"]]}, {"title": "Apartments (self-catering option)", "rows": [["Itchaboe Apartment — 1 adult", "2,092.75"], ["Itchaboe Apartment — 2 adults", "3,381.30"], ["Itchaboe — 3 adults", "5,071.95"], ["Itchaboe — 4 adults", "6,762.00"], ["Itchaboe — +1 child &amp;lt;12", "920.00"], ["Itchaboe — +2 children &amp;lt;12", "1,840.00"], ["Loft — 1 adult", "2,092.75"], ["Loft — 2 adults", "3,381.30"], ["Loft — +1 child &amp;lt;12", "920.00"], ["Loft — +2 children &amp;lt;12", "1,840.00"], ["Charlottental — 1 adult", "2,092.75"], ["Charlottental — 2 adults", "3,381.30"], ["Charlottental — 3 adults", "5,071.95"], ["Charlottental — 4 adults", "6,762.00"], ["Märchental — 1 adult", "2,092.75"], ["Märchental — 2 adults", "3,381.30"]]}]},
  'barkhan-dune-retreat': {"name": "Barkhan Dune Retreat", "commission": "20% STO", "currency": "N$", "validity": "2026", "note": "Net STO rates, incl. VAT & levy.", "sections": [{"title": "Dune Chalet — Full Board (per person, per night)", "rows": [["Sharing — STO 1 (1 night)", "3,485.00"], ["Sharing — STO 2 (2+ nights)", "3,280.00"], ["Child 2–10 yrs (PCPN) — STO 1", "1,743.00"], ["Child 2–10 yrs (PCPN) — STO 2", "1,640.00"], ["Single — STO 1", "4,531.00"], ["Single — STO 2", "4,264.00"]]}, {"title": "Dune Chalet — Dinner, Bed &amp; Breakfast", "rows": [["Sharing — STO 1", "2,318.00"], ["Sharing — STO 2", "2,182.00"], ["Child 2–10 yrs — STO 1", "1,159.00"], ["Child 2–10 yrs — STO 2", "1,091.00"], ["Single — STO 1", "3,013.00"], ["Single — STO 2", "2,836.00"], ["Guide (DBB) — rack rate", "1,370.00"]]}, {"title": "Okanti House &amp; Rustic Cabin — Self-Catering", "rows": [["Sharing — STO 1", "1,165.00"], ["Sharing — STO 2", "1,096.00"], ["Child 2–10 yrs — STO 1", "582.00"], ["Child 2–10 yrs — STO 2", "548.00"], ["Single — STO 1", "1,514.00"], ["Single — STO 2", "1,425.00"]]}, {"title": "Exclusive Kuangukuangu (bed only)", "rows": [["Self-Catering Sharing — STO 1", "3,030.00"], ["Self-Catering Sharing — STO 2", "2,852.00"], ["Single Self-Catering — STO 1", "3,939.00"], ["Single Self-Catering — STO 2", "3,708.00"]]}, {"title": "Activities (per person)", "rows": [["Sundowner DriveIncl. water, beer/soda &amp; light snacks", "660.00"], ["Guided Hike to Ubib Grotto (≈4h)Prehistoric rock paintings · min 3 / max 8 pax · incl. water, beer/soda", "660.00"], ["Guided Klipspringer Mountain Summit Hike (≈4h)Incl. water, beer/soda &amp; light snacks", "660.00"], ["Self-Guided E-Bike Kudu Trail Picnic (≈2h)Incl. e-bike rental, water, beer/soda &amp; light snacks", "660.00"], ["E-Bike Rental (2 hours)", "605.00"]]}, {"title": "Meals — for self-catering guests (per person)", "rows": [["Breakfast", "225.00"], ["Lunch", "345.00"], ["Dinner", "565.00"], ["Lunch pack (to take on excursions)", "186.00"], ["Tea time cake &amp; coffee @ 16:00", "115.00"]]}, {"title": "Other", "rows": [["Laundry — per 6kg load", "265.00"]]}]},
  'belvedere-boutique-hotel': {"name": "Belvedere Boutique Hotel", "commission": "15% STO", "currency": "N$", "validity": "2026", "note": "Net STO rates, incl. VAT & levy.", "sections": [{"title": "Room Rates — STO (per room, per night)", "rows": [["Standard Room — Single (12 rooms available)", "2,185.00"], ["Standard Room — Double", "3,031.00"], ["Family Room — Single (1 room)", "2,233.00"], ["Family Room — Double", "3,139.00"], ["Luxury Room — Single (4 rooms)", "2,525.00"], ["Luxury Room — Double", "3,419.00"], ["Luxury Twin — Single (1 room)", "2,525.00"], ["Luxury Twin — Double", "3,419.00"], ["Penthouse — Single (1 room)", "2,776.00"], ["Penthouse — Double", "3,766.00"]]}, {"title": "Family Room — Child Rates (sharing)", "rows": [["Extra child (10–12 yrs)", "500.00"], ["Extra child (13–18 yrs)Full sharing rate applies", "0.00"]]}]},
  'flamingo-villa-boutique-hotel': {"name": "Flamingo Villas Boutique Hotel", "commission": "20% STO", "currency": "N$", "validity": "2026", "note": "Net STO rates, incl. VAT & levy.", "sections": [{"title": "Comfort Double / Twin Room — B&amp;B (per room)", "rows": [["Single per room", "2,484.00"], ["Double per room", "3,312.00"], ["Children 7–12 yrs sharing", "1,242.40"]]}, {"title": "Superior Double Room with Balcony — B&amp;B (per room)", "rows": [["Single per room", "3,060.00"], ["Double per room", "4,391.20"], ["Children 7–12 yrs sharing", "1,476.80"]]}, {"title": "Deluxe Double Room with Balcony — B&amp;B (per room)", "rows": [["Single per room", "3,451.20"], ["Double per room", "5,144.00"], ["Children 7–12 yrs sharing", "1,507.20"]]}, {"title": "Flamingo Suite with Balcony — B&amp;B (per room)", "rows": [["Single per room", "4,673.60"], ["Double per room", "5,535.20"], ["Children 7–12 yrs sharing", "1,631.20"]]}]},
  'heinitzburg-boutique-hotel': {"name": "Hotel Heinitzburg", "commission": "20% STO", "currency": "N$", "validity": "2026", "note": "Net STO rates, incl. VAT & levy.", "sections": [{"title": "Single Rooms — B&amp;B (per room)", "rows": [["Single Standard Deluxe Room", "2,508.48"], ["Single Comfort Deluxe Room", "2,759.98"], ["Single Superior Deluxe Room", "2,996.83"]]}, {"title": "Twin / Double — B&amp;B (per room)", "rows": [["Twin Standard Deluxe Room", "3,708.19"], ["Twin Comfort Deluxe Room", "4,150.96"], ["Double Superior Deluxe Room", "4,737.79"], ["Triple Comfort Deluxe Room", "4,737.79"]]}, {"title": "Family — B&amp;B (per room)", "rows": [["Family Room (2 adults + 2 children, 2 rooms / 2 bathrooms, interleading)", "6,900.35"]]}]},
  'kamaku-guesthouse': {"name": "Kamaku Guesthouse", "commission": "15% STO", "currency": "N$", "validity": "2026", "note": "Net STO rates, incl. VAT & levy.", "sections": [{"title": "Rooms — B&amp;B", "rows": [["Per Double Unit", "977.50"], ["Per Single Unit", "765.00"], ["Family Unit per person", "488.75"]]}]},
  'little-sossus-lodge': {"name": "Little Sossus Lodge &amp; Campsite", "commission": "20% STO", "currency": "N$", "validity": "2026", "note": "Net STO rates, incl. VAT & levy.", "sections": [{"title": "Chalet (DBB, per room per night)", "rows": [["Single room", "3,600.00"], ["Double / Twin room", "5,440.00"], ["3-bed room (max 2 adults)", "6,360.00"], ["4-bed room (max 2 adults)", "7,280.00"], ["Additional Tour Guide / Driver", "1,750.00"]]}, {"title": "Camping (self-catering, per site + per person)", "rows": [["Campsite per night", "238.00"], ["Per person per night", "221.00"], ["Per child (5–11 yrs) per night", "148.75"]]}, {"title": "Meals (per person — incl. VAT)", "rows": [["Lunch pack", "330.00"], ["Lunch", "350.00"], ["Breakfast", "380.00"], ["Breakfast — child 5–11 yrs", "300.00"], ["Dinner", "550.00"], ["Dinner — child 5–11 yrs", "450.00"]]}, {"title": "Activities (per person)", "rows": [["Guided Sossusvlei Trip (min 2 paying, child 5–11 yrs 50%)", "3,000.00"], ["Sundowner Drive (min 2 pax, child 5–11 yrs 50%)", "1,850.00"]]}]},
  'luderitz-nest-hotel': {"name": "Lüderitz Nest Hotel", "commission": "15% STO", "currency": "N$", "validity": "2026", "note": "Net STO rates, incl. VAT & levy.", "sections": [{"title": "Comfort Rooms — B&amp;B (per room — gross)", "rows": [["Comfort Single", "2,516.00"], ["Comfort Twin / Double", "4,046.00"], ["Comfort Family Room (max 2 adults + 2 children 0–12)", "6,562.00"]]}, {"title": "Deluxe Rooms &amp; Suite — B&amp;B (per room — gross)", "rows": [["Deluxe Single", "3,085.50"], ["Deluxe Twin / Double", "4,938.50"], ["Suite", "8,202.50"], ["Tour Guide (50% of single rack)", "1,480.00"]]}, {"title": "Meals (per person — gross)", "rows": [["Breakfast — adult", "340.00"], ["Breakfast — child 3–12 yrs", "240.00"], ["Lunch — adult", "510.00"], ["Lunch — child 3–12 yrs", "360.00"], ["Dinner — adult", "660.00"], ["Dinner — child 3–12 yrs", "470.00"], ["Lunchpack", "320.00"]]}]},
  'moon-mountain-lodge': {"name": "Moon Mountain Lodge", "commission": "20% STO", "currency": "N$", "validity": "2026", "note": "Net STO rates, incl. VAT & levy.", "sections": [{"title": "Luxury Rooms (×11) — DBB", "rows": [["Single Room", "3,185.00"], ["Double Room (per person)", "2,902.50"]]}, {"title": "Executive Suites (×6) — DBB", "rows": [["Single Room", "3,511.67"], ["Double Room (per person)", "3,202.50"], ["Child under 12 sharing with parents", "1,601.67"], ["Child under 6 sharing with parents", "0.00"]]}, {"title": "Guide Rates (nett)", "rows": [["Guide DBB — 1 to 9 pax", "1,012.00"], ["Guide DBB — 10 to 19 pax", "506.00"], ["Guide FOC — 20+ pax", "0.00"]]}, {"title": "Activities &amp; Extras (nett)", "rows": [["Lunch pack (pp)", "236.00"], ["Lunch — 3-course menu, 2 choices", "404.00"], ["Guided Sossusvlei Excursion (pp)", "2,772.00"], ["Mountain Sunset at view point (drinks &amp; snacks incl.)", "263.00"], ["Namib-Naukluft Airstrip transfer (one way, pp)", "270.00"]]}]},
  'namib-outpost': {"name": "Namib Outpost", "commission": "15% STO", "currency": "N$", "validity": "2025", "note": "Net STO rates, incl. VAT & levy.", "sections": [{"title": "High Season (01 Mar – 30 Nov) — DBB pp", "rows": [["Suite — pp sharing", "9,460.00"], ["Suite — single", "13,710.00"], ["Superior Suite — pp sharing", "9,890.00"], ["Child 4–12 yrs sharing with 1 full-paying adult", "4,855.00"], ["Child 4–12 yrs sharing with 2 full-paying adults", "2,935.00"], ["Family Suite — 2 adults + 2 children (4–12 yrs)", "6,440.00"]]}, {"title": "Low Season (01 Dec – 28 Feb) — DBB pp", "rows": [["Suite — pp sharing", "7,140.00"], ["Suite — single", "10,760.00"], ["Superior Suite — pp sharing", "7,530.00"], ["Child 4–12 yrs sharing with 1 full-paying adult", "4,185.00"], ["Child 4–12 yrs sharing with 2 full-paying adults", "2,528.00"]]}, {"title": "Extras (per person)", "rows": [["Tour Guide — meals only", "1,025.00"], ["Sossusvlei Excursion (full day)", "2,945.00"], ["Sundowner Drive", "815.00"], ["Nature Walk", "595.00"], ["Massage / Wellness — POR", "0.00"]]}]},
  'ohorongo-game-and-safari-lodge': {"name": "Ohorongo Game &amp; Safari Lodge", "commission": "20% STO", "currency": "N$", "validity": "2026", "note": "Net STO rates, incl. VAT & levy.", "sections": [{"title": "Ohorongo Safari Lodge — Low Season (DBB pp)", "rows": [["Double Room", "3,000.00"], ["Triple Room (pp)", "2,711.00"], ["Child 6–11 yrs sharing with full-paying adults", "1,500.00"], ["Child 0–5 yrs sharing with full-paying adults", "0.00"]]}, {"title": "Ohorongo Safari Lodge — High Season (DBB pp)", "rows": [["Double Room", "3,582.00"], ["Triple Room (pp)", "3,292.00"], ["Child 6–11 yrs sharing with full-paying adults", "1,791.00"], ["Child 0–5 yrs sharing with full-paying adults", "0.00"]]}, {"title": "Ohorongo Tented Camp — Low Season (FI pp, min 2-night stay)", "rows": [["Double Room — Fully Inclusive", "7,164.00"], ["Child 6–11 yrs sharing with full-paying adults", "3,582.00"], ["Child 0–5 yrs sharing with full-paying adults", "0.00"]]}, {"title": "Ohorongo Tented Camp — High Season (FI pp, min 2-night stay)", "rows": [["Double Room — Fully Inclusive", "8,616.00"], ["Child 6–11 yrs sharing with full-paying adults", "4,308.00"], ["Child 0–5 yrs sharing with full-paying adults", "0.00"]]}, {"title": "Activities (per person, gross)", "rows": [["Nature Excursion 3–4 hr (min 2, max 6)", "850.00"], ["Nature Excursion 2 hr (min 2, max 6)", "425.00"], ["Night Drive 2 hr (min 2, max 6)", "600.00"], ["Rhino Tracking 3–4 hr (no children u/12)", "1,980.00"], ["Guided Nature Walk 2 hr (max 4)", "425.00"], ["Private Vehicle &amp; Guide (4 hr, max 5)", "6,750.00"]]}, {"title": "Wilderness Feasts &amp; Meals (per person)", "rows": [["Light Lunch (12:00–14:00)", "350.00"], ["Brunch in Nature (min 2 guests)", "425.00"], ["Dinner under the Stars (min 2 guests)", "660.00"]]}]},
  'the-olive-exclusive': {"name": "The Olive Exclusive", "commission": "15% STO", "currency": "N$", "validity": "2026", "note": "Net STO rates, incl. VAT & levy.", "sections": [{"title": "Jan – Jun 2026 (Low Season) — B&amp;B", "rows": [["Junior Suite — pp sharing", "4,543.00"], ["Premier Suite — pp sharing", "5,680.00"], ["Junior Suite — single", "5,118.00"], ["Premier Suite — single", "6,422.00"]]}, {"title": "Jul – Dec 2026 (High Season) — B&amp;B", "rows": [["Junior Suite — pp sharing", "4,913.00"], ["Premier Suite — pp sharing", "6,149.00"], ["Junior Suite — single", "5,539.00"], ["Premier Suite — single", "6,948.00"]]}, {"title": "Children Sharing with 2 Full-Paying Adults", "rows": [["Children under 6 yrs", "0.00"], ["Children 12 yrs &amp; under (50% of adult rate)", "0.00"]]}]},
  'opuwo-country-lodge': {"name": "Opuwo Country Lodge", "commission": "15% STO", "currency": "N$", "validity": "2026", "note": "Net STO rates, incl. VAT & levy.", "sections": [{"title": "Rooms — B&amp;B (STO gross)", "rows": [["Luxury Room — pp sharing", "1,870.00"], ["Luxury Room — single", "2,805.00"], ["Standard Room — pp sharing", "1,355.75"], ["Standard Room — single", "1,870.00"], ["Children 5–11 yrs (50% of rack)", "0.00"], ["Children 0–4 yrs", "0.00"], ["1st Tour Guide (min 8 clients)", "0.00"], ["1st Tour Guide (≤7 clients)", "1,320.00"], ["2nd Tour Guide", "1,320.00"]]}, {"title": "Camping — Self-catering", "rows": [["Adult per person", "330.00"], ["Child 5–11 yrs", "165.00"], ["Child 0–4 yrs", "0.00"]]}, {"title": "Meals (per person — rack)", "rows": [["Breakfast", "395.00"], ["Lunch (3-course set menu)", "555.00"], ["Dinner (4-course set menu)", "690.00"], ["Lunch Pack", "370.00"]]}, {"title": "Activities (per person — rack)", "rows": [["Desert Elephant Excursion (min 2)", "2,150.00"], ["Fly-in Excursion (incl. lunch &amp; Himba)", "1,960.00"], ["Himba Excursion", "1,200.00"], ["Wine Tasting Flight (min 2 max 6)", "1,200.00"], ["Epupa Falls Excursion (per guide)", "3,795.00"], ["Epupa Falls Excursion (per guest, min 2)", "885.00"], ["Ruacana Falls Excursion (per guide)", "3,795.00"], ["Ruacana Falls Excursion (per guest, min 2)", "885.00"], ["Airstrip Transfer (two-way pp)", "440.00"]]}]},
  'organic-stay': {"name": "Organic Stay", "commission": "20% STO", "currency": "N$", "validity": "2026/2027", "note": "Net STO rates, incl. VAT & levy.", "sections": [{"title": "Rooms — B&amp;B", "rows": [["Single", "1,830.00"], ["Double", "2,920.00"], ["Triple", "3,750.00"], ["Family Standard", "4,250.00"], ["2-Bedroom Family", "5,500.00"]]}, {"title": "Child Policy", "rows": [["Children 4 years &amp; under", "0.00"], ["Children 5–10 years", "690.00"], ["Children 11 years &amp; older", "0.00"]]}]},
  'oyster-box-guesthouse': {"name": "Oyster Box Guesthouse", "commission": "20% STO", "currency": "N$", "validity": "2026", "note": "Net STO rates, incl. VAT & levy.", "sections": [{"title": "Single Rooms — B&amp;B (per room)", "rows": [["Single Room Standard", "1,163.90"], ["Single Room, Partial-Sea Facing", "1,359.23"], ["Single Comfort Room, Partial-Sea Facing", "1,501.67"]]}, {"title": "Twin / Double — B&amp;B (per room)", "rows": [["Twin Room Standard", "1,863.86"], ["Twin Room, Partial-Sea Facing", "2,140.59"], ["Double Comfort Room, Partial-Sea Facing", "2,344.07"]]}, {"title": "Triple — B&amp;B (per room)", "rows": [["Triple Room Standard", "2,344.07"], ["Triple Room, Partial-Sea Facing", "2,698.12"], ["Triple Comfort Room, Partial-Sea Facing", "2,889.39"]]}]},
  'rostock-ritz-desert-lodge': {"name": "Rostock Ritz Desert Lodge", "commission": "20% STO", "currency": "N$", "validity": "2026", "note": "Net STO rates, incl. VAT & levy.", "sections": [{"title": "Suites — B&amp;B", "rows": [["Suite — Double/Twin (2 pax sharing)", "5,200.00"], ["Suite — Single", "4,160.00"], ["Children 3–11 yrs sharing with adults", "1,000.00"], ["Children 0–2 yrs sharing with adults", "0.00"], ["Guide — Single (no aircon)", "1,000.00"]]}, {"title": "Meals (per person)", "rows": [["Breakfast", "235.00"], ["Lunch Pack", "235.00"], ["Lunch (3-course set menu, max 10 + TG)", "350.00"], ["Dinner (3-course à la carte)", "500.00"]]}, {"title": "Activities (per person)", "rows": [["Sunset Scenic Drive (2 hr, min 2 pax)", "800.00"], ["4x4 Cave Painting Drive (4 hr, min 2 pax)", "1,350.00"], ["4x4 Cave Painting Drive (4 hr, 3+ pax)", "1,200.00"], ["10 Hiking Trails (3–30 km, seasonal)", "0.00"]]}]},
  'sesfontein-guesthouse': {"name": "Sesfontein Guesthouse", "commission": "20% STO", "currency": "N$", "validity": "2026", "note": "Net STO rates, incl. VAT & levy.", "sections": [{"title": "Bed &amp; Breakfast (per person)", "rows": [["Per person sharing", "1,760.00"], ["Third person in room", "920.00"], ["Per single room", "2,200.00"], ["Guide / Pilot", "920.00"], ["Children 7–12 yrs", "920.00"], ["Children 0–6 yrs", "0.00"]]}, {"title": "Dinner, Bed &amp; Breakfast (per person)", "rows": [["Per person sharing", "2,320.00"], ["Third person in room", "1,480.00"], ["Per single room", "2,760.00"], ["Guide / Pilot", "1,480.00"], ["Children 7–12 yrs", "1,480.00"]]}, {"title": "1-night Sleep-Out (DBB, min 2 pax)", "rows": [["Per person", "3,520.00"], ["Single supplement", "760.00"], ["Child under 13 yrs", "2,040.00"], ["Guide rate (per guide)", "2,040.00"]]}, {"title": "2-night Hoanib Elephant Sleep-Out Package (min 2 pax)", "rows": [["Per person", "6,720.00"], ["Single supplement", "1,200.00"], ["Child under 13 yrs", "3,960.00"], ["Guide rate (per guide)", "3,960.00"]]}, {"title": "3-night Rhino Tracking Sleep-Out Package (min 2 pax)", "rows": [["Per person", "8,640.00"], ["Single supplement", "2,040.00"], ["Guide rate (per guide)", "5,520.00"]]}, {"title": "1-night Ongongo Tented Option (DBB, min 2 pax)", "rows": [["Per person", "2,040.00"], ["Single supplement", "640.00"], ["Child 7–12 yrs", "1,680.00"], ["Child 0–6 yrs", "560.00"], ["Guide rate (per guide)", "1,120.00"]]}, {"title": "Activities (rack — fully commissionable)", "rows": [["Himba Village Visit (pp, min 2)", "2,100.00"], ["Hoanib Elephant Drive incl. Himba (pp, min 2)", "3,700.00"], ["Sundowner Drive (incl. drinks &amp; snacks)", "800.00"], ["Airstrip Transfer (return, per vehicle)", "700.00"]]}]},
  'simanya-river-lodge': {"name": "Simanya River Lodge", "commission": "20% STO", "currency": "N$", "validity": "2026", "note": "Net STO rates, incl. VAT & levy.", "sections": [{"title": "Luxury Rooms (×16) — Low Season DBB", "rows": [["Per person sharing", "2,904.00"], ["Single Supplement", "601.92"], ["Children 0–5 yrs (RO)", "0.00"], ["Children 6–12 yrs (max 2 sharing)", "1,815.00"]]}, {"title": "Luxury Rooms (×16) — High Season DBB", "rows": [["Per person sharing", "3,049.20"], ["Single Supplement", "632.02"], ["Children 6–12 yrs (max 2 sharing)", "1,905.75"]]}, {"title": "Distinctive Rooms (×4) — Low Season DBB", "rows": [["Per person sharing", "4,488.00"], ["Single Supplement", "704.00"], ["Children 6–12 yrs (max 2 sharing)", "1,452.00"]]}, {"title": "Distinctive Rooms (×4) — High Season DBB", "rows": [["Per person sharing", "4,712.40"], ["Single Supplement", "739.20"], ["Children 6–12 yrs (max 2 sharing)", "1,905.75"]]}, {"title": "Camping (max 5 pax per site)", "rows": [["Per person — Low Season", "350.00"], ["Per person — High Season", "420.00"], ["Kids 6–12 yrs — Low", "175.00"], ["Kids 6–12 yrs — High", "200.00"]]}, {"title": "Meals (per person)", "rows": [["Breakfast", "275.00"], ["Breakfast Pack", "250.00"], ["Lunch", "310.00"], ["Lunch Pack", "275.00"], ["Dinner (3-course)", "550.00"]]}, {"title": "Guide Room", "rows": [["Guide Room (only 1 guide per group)", "1,110.00"]]}]},
  'the-rez': {"name": "The Rez", "commission": "15% STO", "currency": "N$", "validity": "2026", "note": "Net STO rates, incl. VAT & levy.", "sections": [{"title": "Luxury Rooms — B&amp;B", "rows": [["Luxury Room — Single", "1,522.00"], ["Luxury Room — Double (pp sharing)", "1,300.00"]]}, {"title": "Deluxe Rooms — B&amp;B", "rows": [["Deluxe Room — Single", "1,633.15"], ["Deluxe Room — Double (pp sharing)", "1,452.30"]]}, {"title": "Super Deluxe Rooms — B&amp;B", "rows": [["Super Deluxe Room — Single", "1,987.80"], ["Super Deluxe Room — Double (pp sharing)", "1,605.40"]]}]},
  'tsauchab-river-camp': {"name": "Tsauchab River Camp", "commission": "20% STO", "currency": "N$", "validity": "2026", "note": "Net STO rates, incl. VAT & levy.", "sections": [{"title": "Chalet (DBB, per room per night)", "rows": [["Chalet single", "2,400.00"], ["Chalet double/twin", "4,000.00"], ["Chalet 3-bed (max 2 adults)", "4,680.00"], ["Chalet 4-bed (max 2 adults)", "5,360.00"]]}, {"title": "Falcon View Suite — DBB (per room per night)", "rows": [["Suite single", "6,000.00"], ["Suite double/twin", "8,000.00"]]}, {"title": "Tour Guides", "rows": [["1st Tour Guide (min 8 guests)", "0.00"], ["Additional Tour Guide / Driver", "1,600.00"]]}, {"title": "Camping (self-catering, per site + per person)", "rows": [["Campsite per night", "212.50"], ["Per person per night", "195.50"], ["Per child (5–11 yrs) per night", "110.50"]]}, {"title": "Meals (per person — incl. VAT, rack)", "rows": [["Breakfast", "330.00"], ["Breakfast — child 5–11 yrs", "280.00"], ["Lunch Pack", "300.00"], ["Lunch", "350.00"], ["Dinner", "450.00"], ["Dinner — child 5–11 yrs", "370.00"]]}]},
  'uis-elephant': {"name": "Uis Elephant Guesthouse", "commission": "20% STO", "currency": "N$", "validity": "2026", "note": "Net STO rates, incl. VAT & levy.", "sections": [{"title": "Bed &amp; Breakfast — Per Person Sharing", "rows": [["Standard Room", "1,680.00"], ["Luxury Room", "1,840.00"], ["Suite", "2,040.00"]]}, {"title": "Bed &amp; Breakfast — Per Single Room", "rows": [["Standard Room", "2,120.00"], ["Luxury Room", "2,280.00"], ["Suite", "2,640.00"]]}, {"title": "Bed &amp; Breakfast — Guides &amp; Children", "rows": [["Guide / Pilot", "880.00"], ["Children 7–12 yrs", "880.00"], ["Children 0–6 yrs", "0.00"]]}, {"title": "Dinner, Bed &amp; Breakfast — Per Person Sharing", "rows": [["Standard Room", "2,160.00"], ["Luxury Room", "2,320.00"], ["Suite", "2,520.00"]]}, {"title": "Dinner, Bed &amp; Breakfast — Per Single Room", "rows": [["Standard Room", "2,600.00"], ["Luxury Room", "2,760.00"], ["Suite", "3,120.00"]]}, {"title": "Sleep-Out Packages (min 4 pax — fully commissionable)", "rows": [["Stand-alone Sleep-Out — pp", "4,200.00"], ["Standard Room + Sleep-Out — pp", "6,850.00"], ["Luxury Room + Sleep-Out — pp", "7,050.00"], ["Suite + Sleep-Out — pp", "7,250.00"]]}, {"title": "Brandberg Hiking Package (min 4 pax)", "rows": [["Per person", "12,100.00"], ["Guide rate (per guide)", "5,950.00"]]}, {"title": "Activities (rack — fully commissionable)", "rows": [["Full-day Brandberg Excursion (min 2 pax)", "2,000.00"], ["Sundowner Drive (min 2 pax)", "1,100.00"], ["AM/PM Elephant Drive (min 2 pax)", "1,350.00"]]}]},
  'vingerklip-lodge': {"name": "Vingerklip Lodge", "commission": "15% STO", "currency": "N$", "validity": "2026", "note": "Net STO rates, incl. VAT & levy.", "sections": [{"title": "Rooms — DBB (per person)", "rows": [["Double Room (pp sharing)", "2,065.50"], ["Single Supplement", "1,045.50"], ["Children 4–14 yrs", "1,266.50"], ["Children 0–3 yrs", "0.00"]]}, {"title": "Heaven&#x27;s Gate Suite — DBB (per person)", "rows": [["Suite (pp sharing)", "3,077.00"], ["Single Supplement", "1,513.00"]]}, {"title": "Tour Guides (NET rates — non-commissionable)", "rows": [["Group of up to 7 full-paying pax", "1,380.00"], ["Group of 8 or more full-paying pax", "1,275.00"], ["Each additional guide", "1,155.00"]]}, {"title": "Separate Services (per person — non-commissionable)", "rows": [["Eagles Nest Dinner (extra, on top)", "100.00"], ["Lunch — Buffet", "280.00"], ["Lunch — Set menu", "220.00"], ["Light Lunches (range)", "220.00"], ["Lunch Pack", "170.00"], ["Dinner", "390.00"], ["Breakfast", "220.00"]]}]},
  'voigtland-guesthouse': {"name": "Guesthouse Voigtland", "commission": "20% STO", "currency": "N$", "validity": "2026", "note": "Net STO rates, incl. VAT & levy.", "sections": [{"title": "Explorer Package — Bed &amp; Breakfast (Agent STO)", "rows": [["Per person sharing", "2,884.00"], ["Single room", "3,259.00"]]}, {"title": "Exclusive Package — DBB (Agent STO) — Best Seller", "rows": [["Per person sharing", "3,580.00"], ["Single room", "3,955.00"]]}, {"title": "Superior Package — Full Board (Agent STO)", "rows": [["Per person sharing", "3,877.00"], ["Single room", "4,252.00"]]}, {"title": "Building Blocks — Agent STO ~25% commission", "rows": [["Bed Rate per person", "1,874.00"], ["Bed Rate — single", "2,249.00"], ["Tour Guide Room (single, accom only)", "1,874.00"], ["Day Room — per person", "2,344.00"]]}, {"title": "À la carte Extras (per person)", "rows": [["Breakfast", "350.00"], ["Lunch", "297.00"], ["4-Course Dinner", "696.00"], ["High Tea", "300.00"], ["Giraffe Feeding", "360.00"], ["Nature Drive incl. Sundowner Cocktail (2 hr)", "545.00"], ["Laundry Service (per machine)", "230.00"]]}, {"title": "Transfers (per person)", "rows": [["Airport Transfer", "385.00"], ["City Transfer", "460.00"]]}]},
  'waterberg-wilderness': {"name": "Waterberg Wilderness Lodges", "commission": "20% STO", "currency": "N$", "validity": "2026", "note": "Net STO rates, incl. VAT & levy.", "sections": [{"title": "Waterberg Plateau Lodge — Rock Chalet (DBB pp)", "rows": [["Per person DBB", "3,480.00"]]}, {"title": "Waterberg Wilderness Lodge — Double / Family Unit (DBB pp)", "rows": [["Per person DBB", "2,560.00"]]}, {"title": "Waterberg Valley Lodge — Econo Chalet (DBB pp)", "rows": [["Per person DBB", "1,800.00"]]}, {"title": "Camping (per person, non-commissionable)", "rows": [["Waterberg Plateau Campsite", "420.00"], ["Waterberg Andersson Camp", "420.00"]]}, {"title": "Experiences — 1 night stay (non-commissionable)", "rows": [["Plateau hike (guided)", "420.00"], ["Honeymoon Sundowner (guided)", "1,000.00"], ["Rhino drive (guided)", "1,200.00"], ["Rhino tracking (guided)", "1,100.00"], ["Nature Trails (self-guided)", "0.00"]]}, {"title": "Experiences — Stay-2-Experience (2+ nights, 25% off)", "rows": [["Plateau hike", "315.00"], ["Honeymoon Sundowner", "750.00"], ["Rhino drive", "900.00"], ["Rhino tracking", "825.00"]]}]},
  'white-sands-caprivi': {"name": "White Sands Lodge", "commission": "Net STO", "currency": "N$", "validity": "2026", "note": "Net STO rates, incl. VAT & levy.", "sections": [{"title": "Game Drives (per person, min 2)", "rows": [["Game Drive — Bwabwata NP (2.5–3 hr)", "950.00"], ["Game Drive — Mahango NP (3.5–4 hr)", "1,150.00"], ["VIP Game Drive — Bwabwata NP (5 hr)", "1,800.00"], ["Full Day Game Drive — Mahango &amp; Bwabwata", "2,500.00"], ["SAN Traditional Tour (1.5–2 hr)", "480.00"]]}, {"title": "Sunset &amp; Fishing — N//Goabaca (per person, min 3)", "rows": [["Sunset Cruise (1.5 hr)", "440.00"], ["Fishing per hour — 1 to 3 pax (min 2 hr)", "935.00"], ["Fishing — additional pax per hour", "240.00"], ["Rent of fishing gear (4 hr)", "250.00"]]}, {"title": "Private Boat Charters — Okavango Dreams (per person, min 4)", "rows": [["Breakfast Cruise (1.5 hr)", "650.00"], ["Breakfast Cruise — in-house guests", "420.00"], ["Namibian Braai Cruise (4 hr, all drinks)", "1,699.00"], ["Birding Cruise (3 hr, 2 drinks)", "880.00"], ["Game Cruise (4 hr, 2 drinks)", "1,350.00"], ["VIP Cruise (6 hr, all-inclusive)", "2,500.00"]]}]}
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
