// Vercel Serverless Function — PUBLIC rack rates read.
//
// Serves owner-entered RACK rates so the itinerary builder can overlay them on
// top of the static /assets/rates-index.json. Rack rates are public selling
// prices, so this endpoint needs no auth. (STO net rates are NEVER served here.)
//
//   GET /api/rack            -> { ok, lodges: { "<slug>": { name, region, rates:[{n,p}] } } }
//   GET /api/rack?slug=xxx   -> { ok, slug, lodge: { name, region, rates:[{n,p}] } | null }
//
// rates[] mirrors the shape used inside rates-index.json ({n: label, p: number})
// so the builder can drop it straight in.

const db = require('./_ratesdb');
const VF_RACK = {
  "drift-inn-bayete-collection": {
    "name": "Drift Inn (Bayete Collection)",
    "region": "Vic Falls",
    "currency": "US$",
    "validity": "2027 · Low 1 Jan–31 Mar / High 1 Apr–31 Dec",
    "note": "Published rack rates (USD)",
    "sections": [
      {
        "title": "Standard — Low (per person, B&B)",
        "rows": [
          [
            "Adult sharing",
            "91"
          ],
          [
            "Adult single",
            "118"
          ],
          [
            "Child sharing",
            "46"
          ],
          [
            "Child single",
            "60"
          ]
        ]
      },
      {
        "title": "Standard — High (per person, B&B)",
        "rows": [
          [
            "Adult sharing",
            "101"
          ],
          [
            "Adult single",
            "131"
          ],
          [
            "Child sharing",
            "51"
          ],
          [
            "Child single",
            "66"
          ]
        ]
      },
      {
        "title": "Studio — Low (per person, B&B)",
        "rows": [
          [
            "Adult sharing",
            "102"
          ],
          [
            "Adult single",
            "132"
          ],
          [
            "Child sharing",
            "52"
          ],
          [
            "Child single",
            "67"
          ]
        ]
      },
      {
        "title": "Studio — High (per person, B&B)",
        "rows": [
          [
            "Adult sharing",
            "111"
          ],
          [
            "Adult single",
            "141"
          ],
          [
            "Child sharing",
            "56"
          ],
          [
            "Child single",
            "71"
          ]
        ]
      },
      {
        "title": "Family rooms & guide — Low",
        "rows": [
          [
            "Standard Family Room per unit",
            "291"
          ],
          [
            "Studio Family Room per unit",
            "331"
          ]
        ]
      },
      {
        "title": "Family rooms & guide — High",
        "rows": [
          [
            "Standard Family Room per unit",
            "326"
          ],
          [
            "Studio Family Room per unit",
            "371"
          ]
        ]
      },
      {
        "title": "Family rooms & guide — all seasons",
        "rows": [
          [
            "Guide per night",
            "65"
          ]
        ]
      }
    ]
  },
  "phezulu-bayete-collection": {
    "name": "PheZulu (Bayete Collection)",
    "region": "Vic Falls",
    "currency": "US$",
    "validity": "2027 · Low 1 Jan–31 Mar / High 1 Apr–31 Dec",
    "note": "Published rack rates (USD)",
    "sections": [
      {
        "title": "Deluxe — Low (per person, B&B)",
        "rows": [
          [
            "Adult sharing",
            "116"
          ],
          [
            "Adult single",
            "151"
          ],
          [
            "Child sharing",
            "59"
          ],
          [
            "Child single",
            "76"
          ]
        ]
      },
      {
        "title": "Deluxe — High (per person, B&B)",
        "rows": [
          [
            "Adult sharing",
            "136"
          ],
          [
            "Adult single",
            "176"
          ],
          [
            "Child sharing",
            "69"
          ],
          [
            "Child single",
            "88"
          ]
        ]
      },
      {
        "title": "Deluxe — all seasons",
        "rows": [
          [
            "Guide per night",
            "65"
          ]
        ]
      }
    ]
  },
  "bayete-guest-lodge": {
    "name": "Bayete Guest Lodge",
    "region": "Vic Falls",
    "currency": "US$",
    "validity": "2027 · Low 1 Jan–31 Mar / High 1 Apr–31 Dec",
    "note": "Published rack rates (USD)",
    "sections": [
      {
        "title": "Classic — Low (per person, B&B)",
        "rows": [
          [
            "Adult sharing",
            "131"
          ],
          [
            "Adult single",
            "171"
          ],
          [
            "Child sharing",
            "66"
          ],
          [
            "Child single",
            "86"
          ]
        ]
      },
      {
        "title": "Classic — High (per person, B&B)",
        "rows": [
          [
            "Adult sharing",
            "146"
          ],
          [
            "Adult single",
            "191"
          ],
          [
            "Child sharing",
            "74"
          ],
          [
            "Child single",
            "96"
          ]
        ]
      },
      {
        "title": "Executive & Honeymoon — Low (per person, B&B)",
        "rows": [
          [
            "Adult sharing",
            "141"
          ],
          [
            "Adult single",
            "181"
          ],
          [
            "Child sharing",
            "71"
          ],
          [
            "Child single",
            "91"
          ]
        ]
      },
      {
        "title": "Executive & Honeymoon — High (per person, B&B)",
        "rows": [
          [
            "Adult sharing",
            "176"
          ],
          [
            "Adult single",
            "231"
          ],
          [
            "Child sharing",
            "89"
          ],
          [
            "Child single",
            "116"
          ]
        ]
      },
      {
        "title": "Executive & Honeymoon — all seasons",
        "rows": [
          [
            "Guide per night",
            "65"
          ]
        ]
      }
    ]
  },
  "nkosi-bayete-collection": {
    "name": "Nkosi (Bayete Collection)",
    "region": "Vic Falls",
    "currency": "US$",
    "validity": "2027 · Low 1 Jan–31 Mar / High 1 Apr–31 Dec",
    "note": "Published rack rates (USD)",
    "sections": [
      {
        "title": "Superior & Honeymoon — Low (per person, B&B)",
        "rows": [
          [
            "Adult sharing",
            "171"
          ],
          [
            "Adult single",
            "221"
          ],
          [
            "Child sharing",
            "86"
          ],
          [
            "Child single",
            "111"
          ]
        ]
      },
      {
        "title": "Superior & Honeymoon — High (per person, B&B)",
        "rows": [
          [
            "Adult sharing",
            "206"
          ],
          [
            "Adult single",
            "271"
          ],
          [
            "Child sharing",
            "104"
          ],
          [
            "Child single",
            "136"
          ]
        ]
      },
      {
        "title": "Superior & Honeymoon — all seasons",
        "rows": [
          [
            "Guide per night",
            "80"
          ]
        ]
      }
    ]
  },
  "the-victorian-manor": {
    "name": "The Victorian Manor (Bayete Collection)",
    "region": "Vic Falls",
    "currency": "US$",
    "validity": "2027 · 1 Jan–31 Dec",
    "note": "Published rack rates (USD)",
    "sections": [
      {
        "title": "Per person, B&B (1 Jan–31 Dec)",
        "rows": [
          [
            "Victorian Suite — sharing",
            "276"
          ],
          [
            "Victorian Suite — single",
            "361"
          ],
          [
            "Master Suite — sharing",
            "321"
          ],
          [
            "Master Suite — single",
            "416"
          ],
          [
            "Cassa 2-Bedroom Unit",
            "701"
          ],
          [
            "Villa — sharing",
            "351"
          ],
          [
            "Villa — single",
            "456"
          ],
          [
            "Exclusive Entire Manor",
            "5025"
          ],
          [
            "Guide per night",
            "100"
          ]
        ]
      }
    ]
  }
};

const NAM_RACK = {
  "duwisib-guest-farm": {
    "name": "Duwisib Guest Farm",
    "region": "Namib-Naukluft",
    "currency": "N$",
    "validity": "2027 (01.11.2026–31.10.2027)",
    "note": "Published rack rates, incl. VAT & levy.",
    "sections": [
      {
        "title": "Rates (per person sharing unless noted)",
        "rows": [
          [
            "Double/twin BB — pp sharing",
            "1480"
          ],
          [
            "Double/twin BB — single",
            "1840"
          ],
          [
            "Triple room BB — pp sharing (3 pax)",
            "1265"
          ],
          [
            "Double/twin DBB — pp sharing",
            "1890"
          ],
          [
            "Double/twin DBB — single",
            "2150"
          ],
          [
            "Triple room DBB — pp sharing (3 pax)",
            "1695"
          ],
          [
            "Self-catering bungalow — per bungalow",
            "1430"
          ],
          [
            "Camping — per person",
            "270"
          ]
        ]
      }
    ]
  },
  "hotel-pension-rapmund": {
    "name": "Hotel Pension Rapmund",
    "region": "Swakopmund",
    "currency": "N$",
    "validity": "2027 (01.01–31.12.2027)",
    "note": "Published rack rates, per room, incl. 2% levy & 15% VAT.",
    "sections": [
      {
        "title": "Bed & Breakfast (per room)",
        "rows": [
          [
            "Double room B/B — per room",
            "2574"
          ],
          [
            "Single room B/B — per room",
            "1545"
          ],
          [
            "Triple room B/B — 2 adults + 1 child under 12",
            "2866.50"
          ],
          [
            "Triple room B/B — 3 adults",
            "3159"
          ],
          [
            "Family room B/B — children under 12",
            "3627"
          ],
          [
            "Family room B/B — children 12+ / 4 adults",
            "4154"
          ],
          [
            "Luxury flat & Gallery room B/B — 2 adults",
            "3182"
          ],
          [
            "Luxury flat B/B — 3 adults / 2 adults + 2-3 children under 12",
            "4095"
          ]
        ]
      }
    ]
  },
  "weltevrede-guest-farm": {
    "name": "Weltevrede Guest Farm",
    "region": "Namib (Maltahöhe)",
    "currency": "N$",
    "validity": "2027 (01.01–31.12.2027)",
    "note": "Rack rates (derived: agent rate is 20% off rack), incl. VAT & levy.",
    "sections": [
      {
        "title": "Dinner, Bed & Breakfast / Camping",
        "rows": [
          [
            "DBB — per person sharing",
            "2375"
          ],
          [
            "DBB — single per night",
            "3125"
          ],
          [
            "Child 4–12, sharing with 2 adults)",
            "1187.50"
          ],
          [
            "Camping — per person (more than 2 pax)",
            "237.50"
          ],
          [
            "Camping — child under 12",
            "118.75"
          ]
        ]
      }
    ]
  },
  "lagoon-chalets": {
    "name": "Lagoon Chalets",
    "region": "Walvis Bay",
    "currency": "N$",
    "validity": "01.07.2026–30.06.2027",
    "note": "Self-catering, per unit per night by number of guests.",
    "sections": [
      {
        "title": "Self-catering units (per unit / night)",
        "rows": [
          [
            "One/Two Bedroom Chalet — 1 pax",
            "950"
          ],
          [
            "One/Two Bedroom Chalet — 2 pax",
            "1300"
          ],
          [
            "One/Two Bedroom Chalet — 3 pax",
            "1500"
          ],
          [
            "One/Two Bedroom Chalet — 4 pax",
            "1700"
          ],
          [
            "One/Two Bedroom Chalet — 5 pax",
            "1850"
          ],
          [
            "One/Two Bedroom Chalet — 6 pax",
            "1950"
          ],
          [
            "Double Storey Chalet — 5 pax",
            "1950"
          ],
          [
            "Double Storey Chalet — 6 pax",
            "2100"
          ],
          [
            "Double Storey Chalet — 7-8 pax",
            "2500"
          ],
          [
            "Double Room (max 4 pax) — 2 pax",
            "850"
          ],
          [
            "Double Room (max 4 pax) — 4 pax",
            "1200"
          ],
          [
            "Bachelor Flat — 2 pax",
            "1300"
          ],
          [
            "Campsite — 2 pax",
            "700"
          ],
          [
            "Campsite — 4 pax",
            "1100"
          ],
          [
            "Campsite — 6 pax",
            "1300"
          ]
        ]
      }
    ]
  }
};
// Desert & Delta Safaris — multi-year (2026 + 2027) US$ rack rates,
// keyed slug -> year -> doc so lodge pages can show a year switcher.
const DDS_RACK_BY_YEAR = {
  "chobe-game-lodge": {
    "2026": {
      "name": "Chobe Game Lodge",
      "region": "Chobe",
      "currency": "US$",
      "validity": "2026 · Green 6 Jan–Mar / Shoulder Apr & Nov–5 Jan '27 / Peak May–Oct",
      "note": "Published selling rates (RSR), US$. Fully inclusive: accommodation, scheduled activities, all meals, local drinks, laundry, park fees, levies and 14% VAT, plus airport transfers.",
      "sections": [
        {
          "title": "Green season (6 Jan – Mar) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "690"
            ],
            [
              "5 – 6 night stay",
              "649"
            ],
            [
              "7 or more nights",
              "635"
            ]
          ]
        },
        {
          "title": "Shoulder season (Apr & Nov – 5 Jan '27) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "990"
            ],
            [
              "5 – 6 night stay",
              "931"
            ],
            [
              "7 or more nights",
              "911"
            ]
          ]
        },
        {
          "title": "Peak season (May – Oct) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "1290"
            ],
            [
              "5 – 6 night stay",
              "1213"
            ],
            [
              "7 or more nights",
              "1187"
            ]
          ]
        },
        {
          "title": "Suites & Best of Chobe package",
          "rows": [
            [
              "Chobe Game Lodge Suite — Green",
              "1010"
            ],
            [
              "Chobe Game Lodge Suite — Shoulder",
              "1410"
            ],
            [
              "Chobe Game Lodge Suite — Peak",
              "1570"
            ],
            [
              "Best of Chobe 4-night package — Green",
              "2596"
            ],
            [
              "Best of Chobe 4-night package — Shoulder",
              "3724"
            ],
            [
              "Best of Chobe 4-night package — Peak",
              "4852"
            ],
            [
              "Best of Chobe package single supplement",
              "1808"
            ]
          ]
        },
        {
          "title": "Supplements & extras (all seasons)",
          "rows": [
            [
              "Single supplement",
              "452"
            ],
            [
              "Tour leader / registered guide / pilot per night",
              "350"
            ],
            [
              "Private activity per night",
              "550"
            ],
            [
              "Specialist guide per night",
              "475"
            ],
            [
              "Victoria Falls day trip",
              "300"
            ],
            [
              "Chobe Impact levy per bed night",
              "5"
            ]
          ]
        }
      ]
    },
    "2027": {
      "name": "Chobe Game Lodge",
      "region": "Chobe",
      "currency": "US$",
      "validity": "2027 · Green 6 Jan–Mar / Shoulder Apr & Nov–5 Jan '28 / Peak May–Oct",
      "note": "Published selling rates (RSR), US$. Fully inclusive: accommodation, scheduled activities, all meals, local drinks, laundry, park fees, levies and 14% VAT, plus airport transfers.",
      "sections": [
        {
          "title": "Green season (6 Jan – Mar) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "740"
            ],
            [
              "5 – 6 night stay",
              "703"
            ],
            [
              "7 or more nights",
              "681"
            ]
          ]
        },
        {
          "title": "Shoulder season (Apr & Nov – 5 Jan '28) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "1080"
            ],
            [
              "5 – 6 night stay",
              "1026"
            ],
            [
              "7 or more nights",
              "994"
            ]
          ]
        },
        {
          "title": "Peak season (May – Oct) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "1410"
            ],
            [
              "5 – 6 night stay",
              "1340"
            ],
            [
              "7 or more nights",
              "1297"
            ]
          ]
        },
        {
          "title": "Suites & Best of Chobe package",
          "rows": [
            [
              "Chobe Game Lodge Suite — Green",
              "1090"
            ],
            [
              "Chobe Game Lodge Suite — Shoulder",
              "1540"
            ],
            [
              "Chobe Game Lodge Suite — Peak",
              "1715"
            ],
            [
              "Best of Chobe 4-night package — Green",
              "2812"
            ],
            [
              "Best of Chobe 4-night package — Shoulder",
              "4104"
            ],
            [
              "Best of Chobe 4-night package — Peak",
              "5360"
            ],
            [
              "Best of Chobe package single supplement",
              "1976"
            ]
          ]
        },
        {
          "title": "Supplements & extras (all seasons)",
          "rows": [
            [
              "Single supplement",
              "494"
            ],
            [
              "Tour leader / registered guide / pilot per night",
              "350"
            ],
            [
              "Private activity per night",
              "575"
            ],
            [
              "Specialist guide per night",
              "500"
            ],
            [
              "Victoria Falls day trip",
              "314"
            ],
            [
              "Chobe Impact levy per bed night",
              "5"
            ]
          ]
        }
      ]
    }
  },
  "chobe-savanna-lodge": {
    "2026": {
      "name": "Chobe Savanna Lodge",
      "region": "Chobe",
      "currency": "US$",
      "validity": "2026 · Green 6 Jan–Mar / Shoulder Apr & Nov–5 Jan '27 / Peak May–Oct",
      "note": "Published selling rates (RSR), US$. Fully inclusive: accommodation, scheduled activities, all meals, local drinks, laundry, park fees, levies and 14% VAT, plus airport transfers.",
      "sections": [
        {
          "title": "Green season (6 Jan – Mar) — per person sharing",
          "rows": [
            [
              "Per person sharing",
              "490"
            ]
          ]
        },
        {
          "title": "Shoulder season (Apr & Nov – 5 Jan '27) — per person sharing",
          "rows": [
            [
              "Per person sharing",
              "520"
            ]
          ]
        },
        {
          "title": "Peak season (May – Oct) — per person sharing",
          "rows": [
            [
              "Per person sharing",
              "660"
            ]
          ]
        },
        {
          "title": "Supplements & extras (all seasons)",
          "rows": [
            [
              "Single supplement",
              "231"
            ],
            [
              "Tour leader / registered guide / pilot per night",
              "350"
            ],
            [
              "Private activity per night",
              "550"
            ],
            [
              "Specialist guide per night",
              "475"
            ],
            [
              "Victoria Falls day trip",
              "300"
            ],
            [
              "Chobe Impact levy per bed night",
              "5"
            ]
          ]
        }
      ]
    },
    "2027": {
      "name": "Chobe Savanna Lodge",
      "region": "Chobe",
      "currency": "US$",
      "validity": "2027 · Green 6 Jan–Mar / Shoulder Apr & Nov–5 Jan '28 / Peak May–Oct",
      "note": "Published selling rates (RSR), US$. Fully inclusive: accommodation, scheduled activities, all meals, local drinks, laundry, park fees, levies and 14% VAT, plus airport transfers.",
      "sections": [
        {
          "title": "Green season (6 Jan – Mar) — per person sharing",
          "rows": [
            [
              "Per person sharing",
              "530"
            ]
          ]
        },
        {
          "title": "Shoulder season (Apr & Nov – 5 Jan '28) — per person sharing",
          "rows": [
            [
              "Per person sharing",
              "570"
            ]
          ]
        },
        {
          "title": "Peak season (May – Oct) — per person sharing",
          "rows": [
            [
              "Per person sharing",
              "720"
            ]
          ]
        },
        {
          "title": "Supplements & extras (all seasons)",
          "rows": [
            [
              "Single supplement",
              "252"
            ],
            [
              "Tour leader / registered guide / pilot per night",
              "350"
            ],
            [
              "Private activity per night",
              "575"
            ],
            [
              "Specialist guide per night",
              "500"
            ],
            [
              "Victoria Falls day trip",
              "314"
            ],
            [
              "Chobe Impact levy per bed night",
              "5"
            ]
          ]
        }
      ]
    }
  },
  "savute-safari-lodge": {
    "2026": {
      "name": "Savute Safari Lodge",
      "region": "Chobe",
      "currency": "US$",
      "validity": "2026 · Green 6 Jan–Mar / Shoulder Apr & Nov–5 Jan '27 / Peak May–Oct",
      "note": "Published selling rates (RSR), US$. Fully inclusive: accommodation, scheduled activities, all meals, local drinks, laundry, park fees, levies and 14% VAT, plus airport transfers.",
      "sections": [
        {
          "title": "Green season (6 Jan – Mar) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "690"
            ],
            [
              "5 – 6 night stay",
              "649"
            ],
            [
              "7 or more nights",
              "635"
            ]
          ]
        },
        {
          "title": "Shoulder season (Apr & Nov – 5 Jan '27) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "990"
            ],
            [
              "5 – 6 night stay",
              "931"
            ],
            [
              "7 or more nights",
              "911"
            ]
          ]
        },
        {
          "title": "Peak season (May – Oct) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "1290"
            ],
            [
              "5 – 6 night stay",
              "1213"
            ],
            [
              "7 or more nights",
              "1187"
            ]
          ]
        },
        {
          "title": "Supplements & extras (all seasons)",
          "rows": [
            [
              "Single supplement",
              "452"
            ],
            [
              "Tour leader / registered guide / pilot per night",
              "350"
            ],
            [
              "Private activity per night",
              "550"
            ],
            [
              "Specialist guide per night",
              "475"
            ],
            [
              "Victoria Falls day trip",
              "300"
            ],
            [
              "Chobe Impact levy per bed night",
              "5"
            ]
          ]
        }
      ]
    },
    "2027": {
      "name": "Savute Safari Lodge",
      "region": "Chobe",
      "currency": "US$",
      "validity": "2027 · Green 6 Jan–Mar / Shoulder Apr & Nov–5 Jan '28 / Peak May–Oct",
      "note": "Published selling rates (RSR), US$. Fully inclusive: accommodation, scheduled activities, all meals, local drinks, laundry, park fees, levies and 14% VAT, plus airport transfers.",
      "sections": [
        {
          "title": "Green season (6 Jan – Mar) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "740"
            ],
            [
              "5 – 6 night stay",
              "703"
            ],
            [
              "7 or more nights",
              "681"
            ]
          ]
        },
        {
          "title": "Shoulder season (Apr & Nov – 5 Jan '28) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "1080"
            ],
            [
              "5 – 6 night stay",
              "1026"
            ],
            [
              "7 or more nights",
              "994"
            ]
          ]
        },
        {
          "title": "Peak season (May – Oct) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "1410"
            ],
            [
              "5 – 6 night stay",
              "1340"
            ],
            [
              "7 or more nights",
              "1297"
            ]
          ]
        },
        {
          "title": "Supplements & extras (all seasons)",
          "rows": [
            [
              "Single supplement",
              "494"
            ],
            [
              "Tour leader / registered guide / pilot per night",
              "350"
            ],
            [
              "Private activity per night",
              "575"
            ],
            [
              "Specialist guide per night",
              "500"
            ],
            [
              "Victoria Falls day trip",
              "314"
            ],
            [
              "Chobe Impact levy per bed night",
              "5"
            ]
          ]
        }
      ]
    }
  },
  "camp-okavango": {
    "2026": {
      "name": "Camp Okavango",
      "region": "Okavango Delta",
      "currency": "US$",
      "validity": "2026 · Green 6 Jan–Mar / Shoulder Apr & Nov–5 Jan '27 / Peak May–Oct",
      "note": "Published selling rates (RSR), US$. Fully inclusive: accommodation, scheduled activities, all meals, local drinks, laundry, park fees, levies and 14% VAT, plus airport transfers.",
      "sections": [
        {
          "title": "Green season (6 Jan – Mar) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "690"
            ],
            [
              "5 – 6 night stay",
              "649"
            ],
            [
              "7 or more nights",
              "635"
            ]
          ]
        },
        {
          "title": "Shoulder season (Apr & Nov – 5 Jan '27) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "990"
            ],
            [
              "5 – 6 night stay",
              "931"
            ],
            [
              "7 or more nights",
              "911"
            ]
          ]
        },
        {
          "title": "Peak season (May – Oct) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "1290"
            ],
            [
              "5 – 6 night stay",
              "1213"
            ],
            [
              "7 or more nights",
              "1187"
            ]
          ]
        },
        {
          "title": "Supplements & extras (all seasons)",
          "rows": [
            [
              "Single supplement",
              "452"
            ],
            [
              "Tour leader / registered guide / pilot per night",
              "350"
            ],
            [
              "Private activity per night",
              "550"
            ],
            [
              "Specialist guide per night",
              "475"
            ],
            [
              "Victoria Falls day trip",
              "300"
            ],
            [
              "Chobe Impact levy per bed night",
              "5"
            ]
          ]
        }
      ]
    },
    "2027": {
      "name": "Camp Okavango",
      "region": "Okavango Delta",
      "currency": "US$",
      "validity": "2027 · Green 6 Jan–Mar / Shoulder Apr & Nov–5 Jan '28 / Peak May–Oct",
      "note": "Published selling rates (RSR), US$. Fully inclusive: accommodation, scheduled activities, all meals, local drinks, laundry, park fees, levies and 14% VAT, plus airport transfers.",
      "sections": [
        {
          "title": "Green season (6 Jan – Mar) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "740"
            ],
            [
              "5 – 6 night stay",
              "703"
            ],
            [
              "7 or more nights",
              "681"
            ]
          ]
        },
        {
          "title": "Shoulder season (Apr & Nov – 5 Jan '28) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "1080"
            ],
            [
              "5 – 6 night stay",
              "1026"
            ],
            [
              "7 or more nights",
              "994"
            ]
          ]
        },
        {
          "title": "Peak season (May – Oct) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "1410"
            ],
            [
              "5 – 6 night stay",
              "1340"
            ],
            [
              "7 or more nights",
              "1297"
            ]
          ]
        },
        {
          "title": "Supplements & extras (all seasons)",
          "rows": [
            [
              "Single supplement",
              "494"
            ],
            [
              "Tour leader / registered guide / pilot per night",
              "350"
            ],
            [
              "Private activity per night",
              "575"
            ],
            [
              "Specialist guide per night",
              "500"
            ],
            [
              "Victoria Falls day trip",
              "314"
            ],
            [
              "Chobe Impact levy per bed night",
              "5"
            ]
          ]
        }
      ]
    }
  },
  "xugana-island-lodge": {
    "2026": {
      "name": "Xugana Island Lodge",
      "region": "Okavango Delta",
      "currency": "US$",
      "validity": "2026 · Green 6 Jan–Mar / Shoulder Apr & Nov–5 Jan '27 / Peak May–Oct",
      "note": "Published selling rates (RSR), US$. Fully inclusive: accommodation, scheduled activities, all meals, local drinks, laundry, park fees, levies and 14% VAT, plus airport transfers.",
      "sections": [
        {
          "title": "Green season (6 Jan – Mar) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "690"
            ],
            [
              "5 – 6 night stay",
              "649"
            ],
            [
              "7 or more nights",
              "635"
            ]
          ]
        },
        {
          "title": "Shoulder season (Apr & Nov – 5 Jan '27) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "990"
            ],
            [
              "5 – 6 night stay",
              "931"
            ],
            [
              "7 or more nights",
              "911"
            ]
          ]
        },
        {
          "title": "Peak season (May – Oct) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "1290"
            ],
            [
              "5 – 6 night stay",
              "1213"
            ],
            [
              "7 or more nights",
              "1187"
            ]
          ]
        },
        {
          "title": "Supplements & extras (all seasons)",
          "rows": [
            [
              "Single supplement",
              "452"
            ],
            [
              "Tour leader / registered guide / pilot per night",
              "350"
            ],
            [
              "Private activity per night",
              "550"
            ],
            [
              "Specialist guide per night",
              "475"
            ],
            [
              "Victoria Falls day trip",
              "300"
            ],
            [
              "Chobe Impact levy per bed night",
              "5"
            ]
          ]
        }
      ]
    },
    "2027": {
      "name": "Xugana Island Lodge",
      "region": "Okavango Delta",
      "currency": "US$",
      "validity": "2027 · Green 6 Jan–Mar / Shoulder Apr & Nov–5 Jan '28 / Peak May–Oct",
      "note": "Published selling rates (RSR), US$. Fully inclusive: accommodation, scheduled activities, all meals, local drinks, laundry, park fees, levies and 14% VAT, plus airport transfers.",
      "sections": [
        {
          "title": "Green season (6 Jan – Mar) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "740"
            ],
            [
              "5 – 6 night stay",
              "703"
            ],
            [
              "7 or more nights",
              "681"
            ]
          ]
        },
        {
          "title": "Shoulder season (Apr & Nov – 5 Jan '28) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "1080"
            ],
            [
              "5 – 6 night stay",
              "1026"
            ],
            [
              "7 or more nights",
              "994"
            ]
          ]
        },
        {
          "title": "Peak season (May – Oct) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "1410"
            ],
            [
              "5 – 6 night stay",
              "1340"
            ],
            [
              "7 or more nights",
              "1297"
            ]
          ]
        },
        {
          "title": "Supplements & extras (all seasons)",
          "rows": [
            [
              "Single supplement",
              "494"
            ],
            [
              "Tour leader / registered guide / pilot per night",
              "350"
            ],
            [
              "Private activity per night",
              "575"
            ],
            [
              "Specialist guide per night",
              "500"
            ],
            [
              "Victoria Falls day trip",
              "314"
            ],
            [
              "Chobe Impact levy per bed night",
              "5"
            ]
          ]
        }
      ]
    }
  },
  "nxamaseri-island-lodge": {
    "2026": {
      "name": "Nxamaseri Island Lodge",
      "region": "Okavango Delta",
      "currency": "US$",
      "validity": "2026 · Green 6 Jan–Mar / Shoulder Apr & Nov–5 Jan '27 / Peak May–Oct",
      "note": "Published selling rates (RSR), US$. Fully inclusive: accommodation, scheduled activities, all meals, local drinks, laundry, park fees, levies and 14% VAT, plus airport transfers.",
      "sections": [
        {
          "title": "Green season (6 Jan – Mar) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "690"
            ],
            [
              "5 – 6 night stay",
              "649"
            ],
            [
              "7 or more nights",
              "635"
            ]
          ]
        },
        {
          "title": "Shoulder season (Apr & Nov – 5 Jan '27) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "990"
            ],
            [
              "5 – 6 night stay",
              "931"
            ],
            [
              "7 or more nights",
              "911"
            ]
          ]
        },
        {
          "title": "Peak season (May – Oct) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "1290"
            ],
            [
              "5 – 6 night stay",
              "1213"
            ],
            [
              "7 or more nights",
              "1187"
            ]
          ]
        },
        {
          "title": "Supplements & extras (all seasons)",
          "rows": [
            [
              "Single supplement",
              "452"
            ],
            [
              "Tour leader / registered guide / pilot per night",
              "350"
            ],
            [
              "Private activity per night",
              "550"
            ],
            [
              "Specialist guide per night",
              "475"
            ],
            [
              "Victoria Falls day trip",
              "300"
            ],
            [
              "Chobe Impact levy per bed night",
              "5"
            ]
          ]
        }
      ]
    },
    "2027": {
      "name": "Nxamaseri Island Lodge",
      "region": "Okavango Delta",
      "currency": "US$",
      "validity": "2027 · Green 6 Jan–Mar / Shoulder Apr & Nov–5 Jan '28 / Peak May–Oct",
      "note": "Published selling rates (RSR), US$. Fully inclusive: accommodation, scheduled activities, all meals, local drinks, laundry, park fees, levies and 14% VAT, plus airport transfers.",
      "sections": [
        {
          "title": "Green season (6 Jan – Mar) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "740"
            ],
            [
              "5 – 6 night stay",
              "703"
            ],
            [
              "7 or more nights",
              "681"
            ]
          ]
        },
        {
          "title": "Shoulder season (Apr & Nov – 5 Jan '28) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "1080"
            ],
            [
              "5 – 6 night stay",
              "1026"
            ],
            [
              "7 or more nights",
              "994"
            ]
          ]
        },
        {
          "title": "Peak season (May – Oct) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "1410"
            ],
            [
              "5 – 6 night stay",
              "1340"
            ],
            [
              "7 or more nights",
              "1297"
            ]
          ]
        },
        {
          "title": "Supplements & extras (all seasons)",
          "rows": [
            [
              "Single supplement",
              "494"
            ],
            [
              "Tour leader / registered guide / pilot per night",
              "350"
            ],
            [
              "Private activity per night",
              "575"
            ],
            [
              "Specialist guide per night",
              "500"
            ],
            [
              "Victoria Falls day trip",
              "314"
            ],
            [
              "Chobe Impact levy per bed night",
              "5"
            ]
          ]
        }
      ]
    }
  },
  "camp-moremi": {
    "2026": {
      "name": "Camp Moremi",
      "region": "Okavango Delta",
      "currency": "US$",
      "validity": "2026 · Green 6 Jan–Mar / Shoulder Apr & Nov–5 Jan '27 / Peak May–Oct",
      "note": "Published selling rates (RSR), US$. Fully inclusive: accommodation, scheduled activities, all meals, local drinks, laundry, park fees, levies and 14% VAT, plus airport transfers.",
      "sections": [
        {
          "title": "Green season (6 Jan – Mar) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "690"
            ],
            [
              "5 – 6 night stay",
              "649"
            ],
            [
              "7 or more nights",
              "635"
            ]
          ]
        },
        {
          "title": "Shoulder season (Apr & Nov – 5 Jan '27) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "990"
            ],
            [
              "5 – 6 night stay",
              "931"
            ],
            [
              "7 or more nights",
              "911"
            ]
          ]
        },
        {
          "title": "Peak season (May – Oct) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "1290"
            ],
            [
              "5 – 6 night stay",
              "1213"
            ],
            [
              "7 or more nights",
              "1187"
            ]
          ]
        },
        {
          "title": "Supplements & extras (all seasons)",
          "rows": [
            [
              "Single supplement",
              "452"
            ],
            [
              "Tour leader / registered guide / pilot per night",
              "350"
            ],
            [
              "Private activity per night",
              "550"
            ],
            [
              "Specialist guide per night",
              "475"
            ],
            [
              "Victoria Falls day trip",
              "300"
            ],
            [
              "Chobe Impact levy per bed night",
              "5"
            ]
          ]
        }
      ]
    },
    "2027": {
      "name": "Camp Moremi",
      "region": "Okavango Delta",
      "currency": "US$",
      "validity": "2027 · Green 6 Jan–Mar / Shoulder Apr & Nov–5 Jan '28 / Peak May–Oct",
      "note": "Published selling rates (RSR), US$. Fully inclusive: accommodation, scheduled activities, all meals, local drinks, laundry, park fees, levies and 14% VAT, plus airport transfers.",
      "sections": [
        {
          "title": "Green season (6 Jan – Mar) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "740"
            ],
            [
              "5 – 6 night stay",
              "703"
            ],
            [
              "7 or more nights",
              "681"
            ]
          ]
        },
        {
          "title": "Shoulder season (Apr & Nov – 5 Jan '28) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "1080"
            ],
            [
              "5 – 6 night stay",
              "1026"
            ],
            [
              "7 or more nights",
              "994"
            ]
          ]
        },
        {
          "title": "Peak season (May – Oct) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "1410"
            ],
            [
              "5 – 6 night stay",
              "1340"
            ],
            [
              "7 or more nights",
              "1297"
            ]
          ]
        },
        {
          "title": "Supplements & extras (all seasons)",
          "rows": [
            [
              "Single supplement",
              "494"
            ],
            [
              "Tour leader / registered guide / pilot per night",
              "350"
            ],
            [
              "Private activity per night",
              "575"
            ],
            [
              "Specialist guide per night",
              "500"
            ],
            [
              "Victoria Falls day trip",
              "314"
            ],
            [
              "Chobe Impact levy per bed night",
              "5"
            ]
          ]
        }
      ]
    }
  },
  "camp-xakanaxa": {
    "2026": {
      "name": "Camp Xakanaxa",
      "region": "Okavango Delta",
      "currency": "US$",
      "validity": "2026 · Green 6 Jan–Mar / Shoulder Apr & Nov–5 Jan '27 / Peak May–Oct",
      "note": "Published selling rates (RSR), US$. Fully inclusive: accommodation, scheduled activities, all meals, local drinks, laundry, park fees, levies and 14% VAT, plus airport transfers.",
      "sections": [
        {
          "title": "Green season (6 Jan – Mar) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "690"
            ],
            [
              "5 – 6 night stay",
              "649"
            ],
            [
              "7 or more nights",
              "635"
            ]
          ]
        },
        {
          "title": "Shoulder season (Apr & Nov – 5 Jan '27) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "990"
            ],
            [
              "5 – 6 night stay",
              "931"
            ],
            [
              "7 or more nights",
              "911"
            ]
          ]
        },
        {
          "title": "Peak season (May – Oct) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "1290"
            ],
            [
              "5 – 6 night stay",
              "1213"
            ],
            [
              "7 or more nights",
              "1187"
            ]
          ]
        },
        {
          "title": "Supplements & extras (all seasons)",
          "rows": [
            [
              "Single supplement",
              "452"
            ],
            [
              "Tour leader / registered guide / pilot per night",
              "350"
            ],
            [
              "Private activity per night",
              "550"
            ],
            [
              "Specialist guide per night",
              "475"
            ],
            [
              "Victoria Falls day trip",
              "300"
            ],
            [
              "Chobe Impact levy per bed night",
              "5"
            ]
          ]
        }
      ]
    },
    "2027": {
      "name": "Camp Xakanaxa",
      "region": "Okavango Delta",
      "currency": "US$",
      "validity": "2027 · Green 6 Jan–Mar / Shoulder Apr & Nov–5 Jan '28 / Peak May–Oct",
      "note": "Published selling rates (RSR), US$. Fully inclusive: accommodation, scheduled activities, all meals, local drinks, laundry, park fees, levies and 14% VAT, plus airport transfers.",
      "sections": [
        {
          "title": "Green season (6 Jan – Mar) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "740"
            ],
            [
              "5 – 6 night stay",
              "703"
            ],
            [
              "7 or more nights",
              "681"
            ]
          ]
        },
        {
          "title": "Shoulder season (Apr & Nov – 5 Jan '28) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "1080"
            ],
            [
              "5 – 6 night stay",
              "1026"
            ],
            [
              "7 or more nights",
              "994"
            ]
          ]
        },
        {
          "title": "Peak season (May – Oct) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "1410"
            ],
            [
              "5 – 6 night stay",
              "1340"
            ],
            [
              "7 or more nights",
              "1297"
            ]
          ]
        },
        {
          "title": "Supplements & extras (all seasons)",
          "rows": [
            [
              "Single supplement",
              "494"
            ],
            [
              "Tour leader / registered guide / pilot per night",
              "350"
            ],
            [
              "Private activity per night",
              "575"
            ],
            [
              "Specialist guide per night",
              "500"
            ],
            [
              "Victoria Falls day trip",
              "314"
            ],
            [
              "Chobe Impact levy per bed night",
              "5"
            ]
          ]
        }
      ]
    }
  },
  "sediba-sa-rona": {
    "2026": {
      "name": "Sediba Sa Rona",
      "region": "Okavango Delta",
      "currency": "US$",
      "validity": "2026 · Green 6 Jan–Mar / Shoulder Apr & Nov–5 Jan '27 / Peak May–Oct",
      "note": "Published selling rates (RSR), US$. Fully inclusive: accommodation, scheduled activities, all meals, local drinks, laundry, park fees, levies and 14% VAT, plus airport transfers.",
      "sections": [
        {
          "title": "Green season (6 Jan – Mar) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "690"
            ],
            [
              "5 – 6 night stay",
              "649"
            ],
            [
              "7 or more nights",
              "635"
            ]
          ]
        },
        {
          "title": "Shoulder season (Apr & Nov – 5 Jan '27) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "990"
            ],
            [
              "5 – 6 night stay",
              "931"
            ],
            [
              "7 or more nights",
              "911"
            ]
          ]
        },
        {
          "title": "Peak season (May – Oct) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "1290"
            ],
            [
              "5 – 6 night stay",
              "1213"
            ],
            [
              "7 or more nights",
              "1187"
            ]
          ]
        },
        {
          "title": "Supplements & extras (all seasons)",
          "rows": [
            [
              "Single supplement",
              "452"
            ],
            [
              "Tour leader / registered guide / pilot per night",
              "350"
            ],
            [
              "Private activity per night",
              "550"
            ],
            [
              "Specialist guide per night",
              "475"
            ],
            [
              "Victoria Falls day trip",
              "300"
            ],
            [
              "Chobe Impact levy per bed night",
              "5"
            ]
          ]
        }
      ]
    },
    "2027": {
      "name": "Sediba Sa Rona",
      "region": "Okavango Delta",
      "currency": "US$",
      "validity": "2027 · Green 6 Jan–Mar / Shoulder Apr & Nov–5 Jan '28 / Peak May–Oct",
      "note": "Published selling rates (RSR), US$. Fully inclusive: accommodation, scheduled activities, all meals, local drinks, laundry, park fees, levies and 14% VAT, plus airport transfers.",
      "sections": [
        {
          "title": "Green season (6 Jan – Mar) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "740"
            ],
            [
              "5 – 6 night stay",
              "703"
            ],
            [
              "7 or more nights",
              "681"
            ]
          ]
        },
        {
          "title": "Shoulder season (Apr & Nov – 5 Jan '28) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "1080"
            ],
            [
              "5 – 6 night stay",
              "1026"
            ],
            [
              "7 or more nights",
              "994"
            ]
          ]
        },
        {
          "title": "Peak season (May – Oct) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "1410"
            ],
            [
              "5 – 6 night stay",
              "1340"
            ],
            [
              "7 or more nights",
              "1297"
            ]
          ]
        },
        {
          "title": "Supplements & extras (all seasons)",
          "rows": [
            [
              "Single supplement",
              "494"
            ],
            [
              "Tour leader / registered guide / pilot per night",
              "350"
            ],
            [
              "Private activity per night",
              "575"
            ],
            [
              "Specialist guide per night",
              "500"
            ],
            [
              "Victoria Falls day trip",
              "314"
            ],
            [
              "Chobe Impact levy per bed night",
              "5"
            ]
          ]
        }
      ]
    }
  },
  "leroo-la-tau": {
    "2026": {
      "name": "Leroo La Tau",
      "region": "Botswana",
      "currency": "US$",
      "validity": "2026 · Green 6 Jan–Mar / Shoulder Apr & Nov–5 Jan '27 / Peak May–Oct",
      "note": "Published selling rates (RSR), US$. Fully inclusive: accommodation, scheduled activities, all meals, local drinks, laundry, park fees, levies and 14% VAT, plus airport transfers.",
      "sections": [
        {
          "title": "Green season (6 Jan – Mar) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "690"
            ],
            [
              "5 – 6 night stay",
              "649"
            ],
            [
              "7 or more nights",
              "635"
            ]
          ]
        },
        {
          "title": "Shoulder season (Apr & Nov – 5 Jan '27) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "990"
            ],
            [
              "5 – 6 night stay",
              "931"
            ],
            [
              "7 or more nights",
              "911"
            ]
          ]
        },
        {
          "title": "Peak season (May – Oct) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "1290"
            ],
            [
              "5 – 6 night stay",
              "1213"
            ],
            [
              "7 or more nights",
              "1187"
            ]
          ]
        },
        {
          "title": "Supplements & extras (all seasons)",
          "rows": [
            [
              "Single supplement",
              "452"
            ],
            [
              "Tour leader / registered guide / pilot per night",
              "350"
            ],
            [
              "Private activity per night",
              "550"
            ],
            [
              "Specialist guide per night",
              "475"
            ],
            [
              "Victoria Falls day trip",
              "300"
            ],
            [
              "Chobe Impact levy per bed night",
              "5"
            ]
          ]
        }
      ]
    },
    "2027": {
      "name": "Leroo La Tau",
      "region": "Botswana",
      "currency": "US$",
      "validity": "2027 · Green 6 Jan–Mar / Shoulder Apr & Nov–5 Jan '28 / Peak May–Oct",
      "note": "Published selling rates (RSR), US$. Fully inclusive: accommodation, scheduled activities, all meals, local drinks, laundry, park fees, levies and 14% VAT, plus airport transfers.",
      "sections": [
        {
          "title": "Green season (6 Jan – Mar) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "740"
            ],
            [
              "5 – 6 night stay",
              "703"
            ],
            [
              "7 or more nights",
              "681"
            ]
          ]
        },
        {
          "title": "Shoulder season (Apr & Nov – 5 Jan '28) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "1080"
            ],
            [
              "5 – 6 night stay",
              "1026"
            ],
            [
              "7 or more nights",
              "994"
            ]
          ]
        },
        {
          "title": "Peak season (May – Oct) — per person sharing",
          "rows": [
            [
              "1 – 4 night stay",
              "1410"
            ],
            [
              "5 – 6 night stay",
              "1340"
            ],
            [
              "7 or more nights",
              "1297"
            ]
          ]
        },
        {
          "title": "Supplements & extras (all seasons)",
          "rows": [
            [
              "Single supplement",
              "494"
            ],
            [
              "Tour leader / registered guide / pilot per night",
              "350"
            ],
            [
              "Private activity per night",
              "575"
            ],
            [
              "Specialist guide per night",
              "500"
            ],
            [
              "Victoria Falls day trip",
              "314"
            ],
            [
              "Chobe Impact levy per bed night",
              "5"
            ]
          ]
        }
      ]
    }
  }
};
Object.assign(DDS_RACK_BY_YEAR, {
  "muchenje-safari-lodge": {
    "2026": {
      "name": "Muchenje Safari Lodge",
      "region": "Chobe",
      "currency": "US$",
      "validity": "2026/27 · valid 1 Apr 2026 – 31 Mar 2027",
      "note": "Published rack rates, US$ per person per night. Fully inclusive: unlimited safari activities, full-day Chobe excursion with river cruise, night drives, guided walks, mokoro (water permitting), village trip, all meals and drinks, park fees, Kasane airport transfers, laundry and government tax.",
      "sections": [
        {
          "title": "Shoulder season (1 Apr – 30 Jun 2026)",
          "rows": [
            [
              "Per person sharing",
              "785"
            ],
            [
              "Single per night",
              "1175"
            ]
          ]
        },
        {
          "title": "High season (1 Jul – 31 Oct 2026)",
          "rows": [
            [
              "Per person sharing",
              "965"
            ],
            [
              "Single per night",
              "1445"
            ]
          ]
        },
        {
          "title": "Shoulder season (1 – 30 Nov 2026)",
          "rows": [
            [
              "Per person sharing",
              "785"
            ],
            [
              "Single per night",
              "1175"
            ]
          ]
        },
        {
          "title": "Green season (1 Dec 2026 – 31 Mar 2027)",
          "rows": [
            [
              "Per person sharing",
              "585"
            ],
            [
              "Single per night",
              "585"
            ]
          ]
        },
        {
          "title": "Guides & tour leaders (all seasons)",
          "rows": [
            [
              "Groups 8+ rooms — 1 tour leader",
              "0"
            ],
            [
              "Groups 3–7 rooms — guide at 50% STO",
              "0"
            ],
            [
              "Groups 1–2 rooms — guide at STO rate",
              "0"
            ]
          ]
        }
      ]
    },
    "2027": {
      "name": "Muchenje Safari Lodge",
      "region": "Chobe",
      "currency": "US$",
      "validity": "2027/28 · valid 1 Apr 2027 – 31 Mar 2028",
      "note": "Published rack rates, US$ per person per night. Fully inclusive: unlimited safari activities, full-day Chobe excursion with river cruise, night drives, guided walks, mokoro (water permitting), village trip, all meals and drinks, park fees, Kasane airport transfers, laundry and government tax.",
      "sections": [
        {
          "title": "Shoulder season (1 Apr – 30 Jun 2027)",
          "rows": [
            [
              "Per person sharing",
              "875"
            ],
            [
              "Single per night",
              "1130"
            ]
          ]
        },
        {
          "title": "High season (1 Jul – 31 Oct 2027)",
          "rows": [
            [
              "Per person sharing",
              "1060"
            ],
            [
              "Single per night",
              "1380"
            ]
          ]
        },
        {
          "title": "Shoulder season (1 – 30 Nov 2027) · Pay 2 Stay 3",
          "rows": [
            [
              "Per person sharing",
              "875"
            ],
            [
              "Single per night",
              "1130"
            ]
          ]
        },
        {
          "title": "Green season (1 Dec 2027 – 31 Mar 2028) · Pay 2 Stay 3",
          "rows": [
            [
              "Per person sharing",
              "640"
            ],
            [
              "Single per night",
              "640"
            ]
          ]
        },
        {
          "title": "Guides & tour leaders (all seasons)",
          "rows": [
            [
              "Groups 8+ rooms — 1 tour leader",
              "0"
            ],
            [
              "Groups 3–7 rooms — guide at 50% STO",
              "0"
            ],
            [
              "Groups 1–2 rooms — guide at STO rate",
              "0"
            ]
          ]
        }
      ]
    }
  }
});
Object.assign(VF_RACK, NAM_RACK);


function parsePrice(s) {
  const str = String(s == null ? '' : s).replace(/,/g, '').replace(/[^\d.\-]/g, '');
  if (str === '' || str === '-' || str === '.') return null;
  const v = parseFloat(str);
  return isNaN(v) ? null : v;
}

function flatten(doc) {
  const rates = [];
  const sections = doc && Array.isArray(doc.sections) ? doc.sections : [];
  for (const sec of sections) {
    const rows = sec && Array.isArray(sec.rows) ? sec.rows : [];
    for (const row of rows) {
      if (!Array.isArray(row)) continue;
      const n = String(row[0] == null ? '' : row[0]).trim();
      const p = parsePrice(row[1]);
      if (!n || p == null) continue;
      rates.push({ n: n, p: p });
    }
  }
  return { name: (doc && doc.name) || '', region: (doc && doc.region) || '', rates: rates };
}

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  // Short cache: fresh enough for agents, easy on the DB.
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=120');

  try {
    const slug = req.query && req.query.slug ? String(req.query.slug).trim() : '';
    if (!db.dbConfigured() && !slug) {
      // No DB and no slug -> empty overlay; builder just uses the static file.
      return res.status(200).json({ ok: true, lodges: {} });
    }
    if (slug) {
      const yearReq = req.query && req.query.year ? String(req.query.year).trim() : '';
      let resolved = { doc: null, year: '', years: [] };
      let doc = null;
      if (DDS_RACK_BY_YEAR[slug]) {
        // Multi-year inline lodge: serve the requested year (default earliest)
        // and advertise every year held so the page renders a year switcher.
        const yrs = Object.keys(DDS_RACK_BY_YEAR[slug]).sort();
        const y = (yearReq && DDS_RACK_BY_YEAR[slug][yearReq]) ? yearReq : yrs[0];
        doc = DDS_RACK_BY_YEAR[slug][y];
        resolved = { doc: doc, year: y, years: yrs };
      } else if (VF_RACK[slug] && !yearReq) {
        // Inline rack data is pushed manually and is the source of truth, so
        // use it directly and skip the Redis lookup (~500ms saved per page).
        doc = VF_RACK[slug];
      } else {
        if (db.dbConfigured()) { try { resolved = await db.getRackResolved(slug, yearReq || undefined); } catch(e){} }
        doc = resolved.doc;
        if (!doc && VF_RACK[slug]) { doc = VF_RACK[slug]; }
      }
      // full=1 -> the raw sectioned doc (used by lodge pages to render season tables).
      if (req.query && req.query.full) {
        return res.status(200).json({ ok: true, slug: slug, doc: doc || null, year: resolved.year, years: resolved.years });
      }
      return res.status(200).json({ ok: true, slug: slug, lodge: doc ? flatten(doc) : null, year: resolved.year, years: resolved.years });
    }

    const all = db.dbConfigured() ? await db.allRack() : {};
    const lodges = {};
    for (const s of Object.keys(all)) lodges[s] = flatten(all[s]);
    for (const s of Object.keys(VF_RACK)) { if (!lodges[s]) lodges[s] = flatten(VF_RACK[s]); }
    for (const s of Object.keys(DDS_RACK_BY_YEAR)) { if (!lodges[s]) lodges[s] = flatten(DDS_RACK_BY_YEAR[s][Object.keys(DDS_RACK_BY_YEAR[s]).sort()[0]]); }
    return res.status(200).json({ ok: true, lodges: lodges });
  } catch (e) {
    return res.status(200).json({ ok: true, lodges: {}, error: String(e && e.message ? e.message : e) });
  }
};
