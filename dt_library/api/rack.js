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
      "note": "Published rack rates, US$ per person per night. Fully inclusive: unlimited safari activities, full-day Chobe excursion with river cruise, night drives, guided walks, mokoro (water permitting), village trip, all meals and drinks, park fees, Kasane airport transfers, laundry and government tax. Kasane airport transfers complimentary; Victoria Falls, Livingstone or Katima US$90 per person, minimum 2 (US$80 in 2026/27). Private vehicle and guide US$500 per 24 hours, or US$250 for families of 4 or fewer in low and mid season. Pay 2 Stay 3 applies in Green season and in the November shoulder.",
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
              "Guide accommodation, per person per night (subject to availability)",
              "300"
            ]
          ]
        }
      ]
    }
  }
});
Object.assign(VF_RACK, NAM_RACK);


// Derived public rack (populated at the end of this file). Consulted LAST — after
// the owner area (Redis) and the inline maps — so it can only ever fill a gap,
// never override a rack the supplier or the owner has set.

// Run an async job over a list with a concurrency cap. These database lookups
// used to run strictly one after another — hundreds of round-trips in series —
// which is what made the coverage feeds and the builder feed crawl.
async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let next = 0;
  const workers = new Array(Math.min(limit, items.length)).fill(0).map(async function () {
    for (;;) {
      const i = next++;
      if (i >= items.length) return;
      try { out[i] = await fn(items[i]); } catch (e) { out[i] = null; }
    }
  });
  await Promise.all(workers);
  return out;
}
const LEGACY_RACK_BY_YEAR = {};
// Rack for lodges the API held nothing for: the supplier's own published rack
// where the sheet prints one, otherwise the net rate at the house +20% ceiling.
// Consulted LAST, so a real rack always wins.
const SHEET_RACK_BY_YEAR = {};

function parsePrice(s) {
  const str = String(s == null ? '' : s).replace(/,/g, '').replace(/[^\d.\-]/g, '');
  if (str === '' || str === '-' || str === '.') return null;
  const v = parseFloat(str);
  return isNaN(v) ? null : v;
}

function flatten(doc) {
  const rates = [];
  const sections = doc && Array.isArray(doc.sections) ? doc.sections : [];
  // A label that appears in more than one section (the same room across Low,
  // High and Shoulder, say) is ambiguous once the sections are flattened away —
  // the agent sees three identical rows at three prices. Fold the section title
  // into those labels only. Labels that are already unique are left untouched.
  const _seen = {};
  for (const sec of sections) {
    for (const row of (sec && Array.isArray(sec.rows) ? sec.rows : [])) {
      if (!Array.isArray(row) || !row[0]) continue;
      const k = String(row[0]).trim();
      _seen[k] = (_seen[k] || 0) + 1;
    }
  }
  for (const sec of sections) {
    const rows = sec && Array.isArray(sec.rows) ? sec.rows : [];
    for (const row of rows) {
      if (!Array.isArray(row)) continue;
      const n = String(row[0] == null ? '' : row[0]).trim();
      const p = parsePrice(row[1]);
      if (!n || p == null) continue;
      const t = String((sec && sec.title) || '').trim();
      rates.push({ n: (_seen[n] > 1 && t) ? (n + ' — ' + t) : n, p: p });
    }
  }
  return { name: (doc && doc.name) || '', region: (doc && doc.region) || '', rates: rates };
}

/* -- O&L Collection ---------------------------------------------------------
   Contracted rates run 01.01.2026 to 30.06.2028, so 2026 and 2027 carry the
   same figures. Rack is the STO grossed up at the sheet's stated 20% commission
   (rack = STO / 0.8) -- what an agent must bill to net the STO back.
   -------------------------------------------------------------------------- */
Object.assign(DDS_RACK_BY_YEAR, {
  "strand-hotel-swakopmund": {
    "2026": {
      "name": "Strand Hotel Swakopmund",
      "region": "Swakopmund",
      "currency": "N$",
      "validity": "01 Jan 2026 – 30 Jun 2028 (2026 and 2027 identical)",
      "note": "Published rack rates",
      "sections": [
        {
          "title": "DBL/Sharing BB",
          "rows": [
            [
              "Standard Rooms",
              "4,397"
            ],
            [
              "Standard Sea Facing",
              "4,697"
            ],
            [
              "Luxury Rooms",
              "5,277"
            ],
            [
              "Luxury Sea Facing",
              "5,577"
            ],
            [
              "Junior Suite",
              "5,716"
            ],
            [
              "Luxury Suite",
              "7,036"
            ],
            [
              "Presidential Suite",
              "10,993"
            ]
          ]
        },
        {
          "title": "Single BB",
          "rows": [
            [
              "Standard Rooms",
              "7,036"
            ],
            [
              "Standard Sea Facing",
              "7,516"
            ],
            [
              "Luxury Rooms",
              "8,443"
            ],
            [
              "Luxury Sea Facing",
              "8,923"
            ],
            [
              "Junior Suite",
              "9,146"
            ],
            [
              "Luxury Suite",
              "11,257"
            ],
            [
              "Presidential Suite",
              "17,589"
            ]
          ]
        },
        {
          "title": "1 Child 7–13 Yrs BB Sharing Adult",
          "rows": [
            [
              "Standard Rooms",
              "1,099"
            ],
            [
              "Standard Sea Facing",
              "1,174"
            ],
            [
              "Luxury Rooms",
              "1,319"
            ],
            [
              "Luxury Sea Facing",
              "1,394"
            ],
            [
              "Junior Suite",
              "1,429"
            ],
            [
              "Luxury Suite",
              "1,759"
            ]
          ]
        },
        {
          "title": "1 Child 7–13 Yrs BB Sgl Interleading",
          "rows": [
            [
              "Standard Rooms",
              "3,298"
            ],
            [
              "Standard Sea Facing",
              "3,523"
            ],
            [
              "Luxury Rooms",
              "3,958"
            ],
            [
              "Luxury Sea Facing",
              "4,183"
            ],
            [
              "Junior Suite",
              "4,287"
            ],
            [
              "Luxury Suite",
              "5,277"
            ]
          ]
        }
      ]
    },
    "2027": {
      "name": "Strand Hotel Swakopmund",
      "region": "Swakopmund",
      "currency": "N$",
      "validity": "01 Jan 2026 – 30 Jun 2028 (2026 and 2027 identical)",
      "note": "Published rack rates",
      "sections": [
        {
          "title": "DBL/Sharing BB",
          "rows": [
            [
              "Standard Rooms",
              "4,397"
            ],
            [
              "Standard Sea Facing",
              "4,697"
            ],
            [
              "Luxury Rooms",
              "5,277"
            ],
            [
              "Luxury Sea Facing",
              "5,577"
            ],
            [
              "Junior Suite",
              "5,716"
            ],
            [
              "Luxury Suite",
              "7,036"
            ],
            [
              "Presidential Suite",
              "10,993"
            ]
          ]
        },
        {
          "title": "Single BB",
          "rows": [
            [
              "Standard Rooms",
              "7,036"
            ],
            [
              "Standard Sea Facing",
              "7,516"
            ],
            [
              "Luxury Rooms",
              "8,443"
            ],
            [
              "Luxury Sea Facing",
              "8,923"
            ],
            [
              "Junior Suite",
              "9,146"
            ],
            [
              "Luxury Suite",
              "11,257"
            ],
            [
              "Presidential Suite",
              "17,589"
            ]
          ]
        },
        {
          "title": "1 Child 7–13 Yrs BB Sharing Adult",
          "rows": [
            [
              "Standard Rooms",
              "1,099"
            ],
            [
              "Standard Sea Facing",
              "1,174"
            ],
            [
              "Luxury Rooms",
              "1,319"
            ],
            [
              "Luxury Sea Facing",
              "1,394"
            ],
            [
              "Junior Suite",
              "1,429"
            ],
            [
              "Luxury Suite",
              "1,759"
            ]
          ]
        },
        {
          "title": "1 Child 7–13 Yrs BB Sgl Interleading",
          "rows": [
            [
              "Standard Rooms",
              "3,298"
            ],
            [
              "Standard Sea Facing",
              "3,523"
            ],
            [
              "Luxury Rooms",
              "3,958"
            ],
            [
              "Luxury Sea Facing",
              "4,183"
            ],
            [
              "Junior Suite",
              "4,287"
            ],
            [
              "Luxury Suite",
              "5,277"
            ]
          ]
        }
      ]
    }
  },
  "mokuti-etosha": {
    "2026": {
      "name": "Mokuti Etosha Lodge",
      "region": "East Etosha",
      "currency": "N$",
      "validity": "01 Jan 2026 – 30 Jun 2028 (2026 and 2027 identical)",
      "note": "Published rack rates",
      "sections": [
        {
          "title": "DBL/Sharing BB",
          "rows": [
            [
              "Standard Room",
              "4,397"
            ],
            [
              "Deluxe Room",
              "5,057"
            ],
            [
              "Junior Suite",
              "5,716"
            ],
            [
              "Presidential Suite",
              "10,993"
            ]
          ]
        },
        {
          "title": "DBL/Sharing DBB",
          "rows": [
            [
              "Standard Room",
              "4,932"
            ],
            [
              "Deluxe Room",
              "5,592"
            ],
            [
              "Junior Suite",
              "6,251"
            ],
            [
              "Presidential Suite",
              "11,528"
            ]
          ]
        },
        {
          "title": "Single BB",
          "rows": [
            [
              "Standard Room",
              "7,036"
            ],
            [
              "Deluxe Room",
              "8,091"
            ],
            [
              "Junior Suite",
              "9,146"
            ],
            [
              "Presidential Suite",
              "17,589"
            ]
          ]
        },
        {
          "title": "Single DBB",
          "rows": [
            [
              "Standard Room",
              "7,571"
            ],
            [
              "Deluxe Room",
              "8,626"
            ],
            [
              "Junior Suite",
              "9,681"
            ],
            [
              "Presidential Suite",
              "18,124"
            ]
          ]
        },
        {
          "title": "1 Child 7–13 BB",
          "rows": [
            [
              "Standard Room",
              "1,099"
            ],
            [
              "Deluxe Room",
              "1,264"
            ],
            [
              "Junior Suite",
              "1,429"
            ],
            [
              "Presidential Suite",
              "2,748"
            ]
          ]
        },
        {
          "title": "1 Child 7–13 DBB",
          "rows": [
            [
              "Standard Room",
              "1,233"
            ],
            [
              "Deluxe Room",
              "1,398"
            ],
            [
              "Junior Suite",
              "1,563"
            ],
            [
              "Presidential Suite",
              "2,882"
            ]
          ]
        }
      ]
    },
    "2027": {
      "name": "Mokuti Etosha Lodge",
      "region": "East Etosha",
      "currency": "N$",
      "validity": "01 Jan 2026 – 30 Jun 2028 (2026 and 2027 identical)",
      "note": "Published rack rates",
      "sections": [
        {
          "title": "DBL/Sharing BB",
          "rows": [
            [
              "Standard Room",
              "4,397"
            ],
            [
              "Deluxe Room",
              "5,057"
            ],
            [
              "Junior Suite",
              "5,716"
            ],
            [
              "Presidential Suite",
              "10,993"
            ]
          ]
        },
        {
          "title": "DBL/Sharing DBB",
          "rows": [
            [
              "Standard Room",
              "4,932"
            ],
            [
              "Deluxe Room",
              "5,592"
            ],
            [
              "Junior Suite",
              "6,251"
            ],
            [
              "Presidential Suite",
              "11,528"
            ]
          ]
        },
        {
          "title": "Single BB",
          "rows": [
            [
              "Standard Room",
              "7,036"
            ],
            [
              "Deluxe Room",
              "8,091"
            ],
            [
              "Junior Suite",
              "9,146"
            ],
            [
              "Presidential Suite",
              "17,589"
            ]
          ]
        },
        {
          "title": "Single DBB",
          "rows": [
            [
              "Standard Room",
              "7,571"
            ],
            [
              "Deluxe Room",
              "8,626"
            ],
            [
              "Junior Suite",
              "9,681"
            ],
            [
              "Presidential Suite",
              "18,124"
            ]
          ]
        },
        {
          "title": "1 Child 7–13 BB",
          "rows": [
            [
              "Standard Room",
              "1,099"
            ],
            [
              "Deluxe Room",
              "1,264"
            ],
            [
              "Junior Suite",
              "1,429"
            ],
            [
              "Presidential Suite",
              "2,748"
            ]
          ]
        },
        {
          "title": "1 Child 7–13 DBB",
          "rows": [
            [
              "Standard Room",
              "1,233"
            ],
            [
              "Deluxe Room",
              "1,398"
            ],
            [
              "Junior Suite",
              "1,563"
            ],
            [
              "Presidential Suite",
              "2,882"
            ]
          ]
        }
      ]
    }
  },
  "midgard-otjihavera-windhoek": {
    "2026": {
      "name": "Midgard Otjihavera Windhoek",
      "region": "Windhoek",
      "currency": "N$",
      "validity": "01 Jan 2026 – 30 Jun 2028 (2026 and 2027 identical)",
      "note": "Published rack rates",
      "sections": [
        {
          "title": "DBL/Sharing BB",
          "rows": [
            [
              "Standard Room",
              "3,090"
            ],
            [
              "Family Room",
              "4,018"
            ],
            [
              "Junior Suite",
              "4,755"
            ],
            [
              "Presidential Suite",
              "5,885"
            ]
          ]
        },
        {
          "title": "DBL/Sharing DBB",
          "rows": [
            [
              "Standard Room",
              "3,857"
            ],
            [
              "Family Room",
              "4,878"
            ],
            [
              "Junior Suite",
              "5,689"
            ],
            [
              "Presidential Suite",
              "6,932"
            ]
          ]
        },
        {
          "title": "Single BB",
          "rows": [
            [
              "Standard Room",
              "4,945"
            ],
            [
              "Family Room",
              "6,428"
            ],
            [
              "Junior Suite",
              "7,608"
            ],
            [
              "Presidential Suite",
              "9,416"
            ]
          ]
        },
        {
          "title": "Single DBB",
          "rows": [
            [
              "Standard Room",
              "5,898"
            ],
            [
              "Family Room",
              "7,529"
            ],
            [
              "Junior Suite",
              "8,827"
            ],
            [
              "Presidential Suite",
              "10,816"
            ]
          ]
        },
        {
          "title": "1 Child 7–13 BB",
          "rows": [
            [
              "Standard Room",
              "773"
            ],
            [
              "Family Room",
              "1,005"
            ],
            [
              "Junior Suite",
              "1,189"
            ],
            [
              "Presidential Suite",
              "1,471"
            ]
          ]
        },
        {
          "title": "1 Child 7–13 DBB",
          "rows": [
            [
              "Standard Room",
              "964"
            ],
            [
              "Family Room",
              "1,220"
            ],
            [
              "Junior Suite",
              "1,422"
            ],
            [
              "Presidential Suite",
              "1,733"
            ]
          ]
        }
      ]
    },
    "2027": {
      "name": "Midgard Otjihavera Windhoek",
      "region": "Windhoek",
      "currency": "N$",
      "validity": "01 Jan 2026 – 30 Jun 2028 (2026 and 2027 identical)",
      "note": "Published rack rates",
      "sections": [
        {
          "title": "DBL/Sharing BB",
          "rows": [
            [
              "Standard Room",
              "3,090"
            ],
            [
              "Family Room",
              "4,018"
            ],
            [
              "Junior Suite",
              "4,755"
            ],
            [
              "Presidential Suite",
              "5,885"
            ]
          ]
        },
        {
          "title": "DBL/Sharing DBB",
          "rows": [
            [
              "Standard Room",
              "3,857"
            ],
            [
              "Family Room",
              "4,878"
            ],
            [
              "Junior Suite",
              "5,689"
            ],
            [
              "Presidential Suite",
              "6,932"
            ]
          ]
        },
        {
          "title": "Single BB",
          "rows": [
            [
              "Standard Room",
              "4,945"
            ],
            [
              "Family Room",
              "6,428"
            ],
            [
              "Junior Suite",
              "7,608"
            ],
            [
              "Presidential Suite",
              "9,416"
            ]
          ]
        },
        {
          "title": "Single DBB",
          "rows": [
            [
              "Standard Room",
              "5,898"
            ],
            [
              "Family Room",
              "7,529"
            ],
            [
              "Junior Suite",
              "8,827"
            ],
            [
              "Presidential Suite",
              "10,816"
            ]
          ]
        },
        {
          "title": "1 Child 7–13 BB",
          "rows": [
            [
              "Standard Room",
              "773"
            ],
            [
              "Family Room",
              "1,005"
            ],
            [
              "Junior Suite",
              "1,189"
            ],
            [
              "Presidential Suite",
              "1,471"
            ]
          ]
        },
        {
          "title": "1 Child 7–13 DBB",
          "rows": [
            [
              "Standard Room",
              "964"
            ],
            [
              "Family Room",
              "1,220"
            ],
            [
              "Junior Suite",
              "1,422"
            ],
            [
              "Presidential Suite",
              "1,733"
            ]
          ]
        }
      ]
    }
  },
  "chobe-water-villas-zambezi": {
    "2026": {
      "name": "Chobe Water Villas Zambezi",
      "region": "Zambezi & Caprivi",
      "currency": "N$",
      "validity": "01 Jan 2026 – 30 Jun 2028 (2026 and 2027 identical)",
      "note": "Published rack rates",
      "sections": [
        {
          "title": "DBL/Sharing",
          "rows": [
            [
              "Full Inclusive",
              "22,055"
            ],
            [
              "Bed & Breakfast",
              "9,223"
            ],
            [
              "Dinner, Bed & Breakfast",
              "9,925"
            ]
          ]
        },
        {
          "title": "Single",
          "rows": [
            [
              "Full Inclusive",
              "35,288"
            ],
            [
              "Bed & Breakfast",
              "13,835"
            ],
            [
              "Dinner, Bed & Breakfast",
              "14,536"
            ]
          ]
        },
        {
          "title": "1 Child 13–17 Yrs Sharing Adult",
          "rows": [
            [
              "Full Inclusive",
              "16,541"
            ],
            [
              "Bed & Breakfast",
              "6,917"
            ],
            [
              "Dinner, Bed & Breakfast",
              "7,444"
            ]
          ]
        }
      ]
    },
    "2027": {
      "name": "Chobe Water Villas Zambezi",
      "region": "Zambezi & Caprivi",
      "currency": "N$",
      "validity": "01 Jan 2026 – 30 Jun 2028 (2026 and 2027 identical)",
      "note": "Published rack rates",
      "sections": [
        {
          "title": "DBL/Sharing",
          "rows": [
            [
              "Full Inclusive",
              "22,055"
            ],
            [
              "Bed & Breakfast",
              "9,223"
            ],
            [
              "Dinner, Bed & Breakfast",
              "9,925"
            ]
          ]
        },
        {
          "title": "Single",
          "rows": [
            [
              "Full Inclusive",
              "35,288"
            ],
            [
              "Bed & Breakfast",
              "13,835"
            ],
            [
              "Dinner, Bed & Breakfast",
              "14,536"
            ]
          ]
        },
        {
          "title": "1 Child 13–17 Yrs Sharing Adult",
          "rows": [
            [
              "Full Inclusive",
              "16,541"
            ],
            [
              "Bed & Breakfast",
              "6,917"
            ],
            [
              "Dinner, Bed & Breakfast",
              "7,444"
            ]
          ]
        }
      ]
    }
  },
  "divava-okavango": {
    "2026": {
      "name": "Divava Okavango",
      "region": "Zambezi & Caprivi",
      "currency": "N$",
      "validity": "01 Jan 2026 – 30 Jun 2028 (2026 and 2027 identical)",
      "note": "Published rack rates",
      "sections": [
        {
          "title": "Low Season — 01.01.26 to 30.06.2026 · DBL/Sharing DBB",
          "rows": [
            [
              "Luxury Chalets",
              "4,140"
            ]
          ]
        },
        {
          "title": "Low Season — 01.01.26 to 30.06.2026 · Single DBB",
          "rows": [
            [
              "Luxury Chalets",
              "5,530"
            ]
          ]
        },
        {
          "title": "Low Season — 01.01.26 to 30.06.2026 · 1 Child 6–12 Yrs DBB Sharing Adult",
          "rows": [
            [
              "Luxury Chalets",
              "1,035"
            ]
          ]
        },
        {
          "title": "High Season — 01.07.26 to 30.11.2026 · DBL/Sharing DBB",
          "rows": [
            [
              "Luxury Chalets",
              "5,055"
            ]
          ]
        },
        {
          "title": "High Season — 01.07.26 to 30.11.2026 · Single DBB",
          "rows": [
            [
              "Luxury Chalets",
              "6,600"
            ]
          ]
        },
        {
          "title": "High Season — 01.07.26 to 30.11.2026 · 1 Child 6–12 Yrs DBB Sharing Adult",
          "rows": [
            [
              "Luxury Chalets",
              "1,264"
            ]
          ]
        }
      ]
    },
    "2027": {
      "name": "Divava Okavango",
      "region": "Zambezi & Caprivi",
      "currency": "N$",
      "validity": "01 Jan 2026 – 30 Jun 2028 (2026 and 2027 identical)",
      "note": "Published rack rates",
      "sections": [
        {
          "title": "Low Season — 01.01.26 to 30.06.2026 · DBL/Sharing DBB",
          "rows": [
            [
              "Luxury Chalets",
              "4,140"
            ]
          ]
        },
        {
          "title": "Low Season — 01.01.26 to 30.06.2026 · Single DBB",
          "rows": [
            [
              "Luxury Chalets",
              "5,530"
            ]
          ]
        },
        {
          "title": "Low Season — 01.01.26 to 30.06.2026 · 1 Child 6–12 Yrs DBB Sharing Adult",
          "rows": [
            [
              "Luxury Chalets",
              "1,035"
            ]
          ]
        },
        {
          "title": "High Season — 01.07.26 to 30.11.2026 · DBL/Sharing DBB",
          "rows": [
            [
              "Luxury Chalets",
              "5,055"
            ]
          ]
        },
        {
          "title": "High Season — 01.07.26 to 30.11.2026 · Single DBB",
          "rows": [
            [
              "Luxury Chalets",
              "6,600"
            ]
          ]
        },
        {
          "title": "High Season — 01.07.26 to 30.11.2026 · 1 Child 6–12 Yrs DBB Sharing Adult",
          "rows": [
            [
              "Luxury Chalets",
              "1,264"
            ]
          ]
        }
      ]
    }
  },
  "le-mirage-sossusvlei": {
    "2026": {
      "name": "Le Mirage Sossusvlei",
      "region": "Sossusvlei & Namib",
      "currency": "N$",
      "validity": "01 Jan 2026 – 30 Jun 2028 (2026 and 2027 identical)",
      "note": "Published rack rates",
      "sections": [
        {
          "title": "Low Season — 01.01.26 to 30.06.2026 · DBL/Sharing DBB",
          "rows": [
            [
              "Camelthorn Room",
              "3,870"
            ],
            [
              "Oasis Room",
              "4,275"
            ]
          ]
        },
        {
          "title": "Low Season — 01.01.26 to 30.06.2026 · Single DBB",
          "rows": [
            [
              "Camelthorn Room",
              "5,170"
            ],
            [
              "Oasis Room",
              "5,701"
            ]
          ]
        },
        {
          "title": "Low Season — 01.01.26 to 30.06.2026 · 1 Child 13–17 Yrs Sharing Adult",
          "rows": [
            [
              "Camelthorn Room",
              "968"
            ],
            [
              "Oasis Room",
              "1,069"
            ]
          ]
        },
        {
          "title": "High Season — 01.07.26 to 30.11.2026 · DBL/Sharing DBB",
          "rows": [
            [
              "Camelthorn Room",
              "4,740"
            ],
            [
              "Oasis Room",
              "5,250"
            ]
          ]
        },
        {
          "title": "High Season — 01.07.26 to 30.11.2026 · Single DBB",
          "rows": [
            [
              "Camelthorn Room",
              "6,265"
            ],
            [
              "Oasis Room",
              "6,925"
            ]
          ]
        },
        {
          "title": "High Season — 01.07.26 to 30.11.2026 · 1 Child 13–17 Yrs Sharing Adult",
          "rows": [
            [
              "Camelthorn Room",
              "1,185"
            ],
            [
              "Oasis Room",
              "1,313"
            ]
          ]
        }
      ]
    },
    "2027": {
      "name": "Le Mirage Sossusvlei",
      "region": "Sossusvlei & Namib",
      "currency": "N$",
      "validity": "01 Jan 2026 – 30 Jun 2028 (2026 and 2027 identical)",
      "note": "Published rack rates",
      "sections": [
        {
          "title": "Low Season — 01.01.26 to 30.06.2026 · DBL/Sharing DBB",
          "rows": [
            [
              "Camelthorn Room",
              "3,870"
            ],
            [
              "Oasis Room",
              "4,275"
            ]
          ]
        },
        {
          "title": "Low Season — 01.01.26 to 30.06.2026 · Single DBB",
          "rows": [
            [
              "Camelthorn Room",
              "5,170"
            ],
            [
              "Oasis Room",
              "5,701"
            ]
          ]
        },
        {
          "title": "Low Season — 01.01.26 to 30.06.2026 · 1 Child 13–17 Yrs Sharing Adult",
          "rows": [
            [
              "Camelthorn Room",
              "968"
            ],
            [
              "Oasis Room",
              "1,069"
            ]
          ]
        },
        {
          "title": "High Season — 01.07.26 to 30.11.2026 · DBL/Sharing DBB",
          "rows": [
            [
              "Camelthorn Room",
              "4,740"
            ],
            [
              "Oasis Room",
              "5,250"
            ]
          ]
        },
        {
          "title": "High Season — 01.07.26 to 30.11.2026 · Single DBB",
          "rows": [
            [
              "Camelthorn Room",
              "6,265"
            ],
            [
              "Oasis Room",
              "6,925"
            ]
          ]
        },
        {
          "title": "High Season — 01.07.26 to 30.11.2026 · 1 Child 13–17 Yrs Sharing Adult",
          "rows": [
            [
              "Camelthorn Room",
              "1,185"
            ],
            [
              "Oasis Room",
              "1,313"
            ]
          ]
        }
      ]
    }
  }
});

// Season year of an undated/legacy doc, read from its own `validity` label.
// A leading 4-digit year is the season (e.g. "2027 (01.11.2026–31.10.2027)" is
// 2027); otherwise the latest year mentioned. This reads the doc's declared
// season — it does NOT guess from filenames.
function seasonYear(v) {
  if (!v) return null;
  const s = String(v);
  const lead = s.match(/^\s*(20\d\d)/);
  if (lead) return lead[1];
  const all = s.match(/20\d\d/g);
  if (!all || !all.length) return null;
  return String(all.map(Number).sort(function (a, b) { return a - b; })[all.length - 1]);
}

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  // Short cache: fresh enough for agents, easy on the DB.
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=120');

  try {
    // ?list=1 -> per-slug RACK coverage (which years each slug holds), merged
    // across inline data + Redis. Used by the owner rate-progress tracker so it
    // can derive coverage live instead of storing a stale status file. Rack is
    // public, so this needs no auth (it exposes no more than the rack API does).
    if (req.query && req.query.list) {
      const cov = {};
      const add = function (slug, y, legacy, meta) {
        const e = cov[slug] || (cov[slug] = { years: [], undated: false, legacy: false, name: '', region: '' });
        if (y === 'undated') { e.undated = true; e.legacy = true; }
        else if (e.years.indexOf(y) === -1) e.years.push(y);
        if (legacy) e.legacy = true;
        if (meta) { if (!e.name && meta.name) e.name = meta.name; if (!e.region && meta.region) e.region = meta.region; }
      };
      for (const s of Object.keys(DDS_RACK_BY_YEAR)) {
        for (const y of Object.keys(DDS_RACK_BY_YEAR[s])) add(s, y, false, DDS_RACK_BY_YEAR[s][y]);
      }
      for (const s of Object.keys(VF_RACK)) {
        const d = VF_RACK[s]; add(s, seasonYear(d && d.validity) || 'undated', true, d);
      }
      if (db.dbConfigured()) {
        try {
          const found = await mapLimit(await db.listSlugs(), 24, async function (s) {
            const ys = await db.listYears('rack', s);
            if (ys && ys.length) return { s: s, ys: ys, docs: await Promise.all(ys.map(function (y) { return db.getRates('rack', s, y); })) };
            return { s: s, ys: [], legacyDoc: await db.getRates('rack', s) };
          });
          found.forEach(function (r) {
            if (!r) return;
            if (r.ys.length) r.ys.forEach(function (y, i) { add(r.s, String(y), false, r.docs[i] || {}); });
            else if (r.legacyDoc) add(r.s, seasonYear(r.legacyDoc.validity) || 'undated', true, r.legacyDoc);
          });
        } catch (e) {}
      }
      // Derived rack counts as coverage, but only where nothing live holds one.
      for (const s of Object.keys(SHEET_RACK_BY_YEAR)) {
        if (cov[s]) continue;
        for (const y of Object.keys(SHEET_RACK_BY_YEAR[s])) add(s, y, false, SHEET_RACK_BY_YEAR[s][y]);
      }
      for (const s of Object.keys(LEGACY_RACK_BY_YEAR)) {
        if (cov[s]) continue;
        for (const y of Object.keys(LEGACY_RACK_BY_YEAR[s])) add(s, y, false, LEGACY_RACK_BY_YEAR[s][y]);
      }
      for (const s of Object.keys(cov)) cov[s].years.sort();
      return res.status(200).json({ ok: true, coverage: cov });
    }

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
        // Multi-year inline lodge. When a season is asked for we serve that
        // season or nothing — handing back a different year's prices under the
        // heading the visitor clicked is worse than an honest blank. With no
        // year asked for we serve the earliest held. Either way we advertise
        // every year so the page can still render its switcher.
        const yrs = Object.keys(DDS_RACK_BY_YEAR[slug]).sort();
        if (yearReq) {
          doc = DDS_RACK_BY_YEAR[slug][yearReq] || null;
          resolved = { doc: doc, year: doc ? yearReq : '', years: yrs };
        } else {
          const y = yrs[0];
          doc = DDS_RACK_BY_YEAR[slug][y];
          resolved = { doc: doc, year: y, years: yrs };
        }
      } else if (VF_RACK[slug] && !yearReq) {
        // Inline rack data is pushed manually and is the source of truth, so
        // use it directly and skip the Redis lookup (~500ms saved per page).
        doc = VF_RACK[slug];
      } else {
        if (db.dbConfigured()) { try { resolved = await db.getRackResolved(slug, yearReq || undefined); } catch(e){} }
        doc = resolved.doc;
        // Same rule for the undated inline doc: only if its own season matches.
        if (!doc && VF_RACK[slug]) {
          const vfy = seasonYear(VF_RACK[slug].validity);
          if (!yearReq || vfy === yearReq) { doc = VF_RACK[slug]; if (!resolved.year) resolved.year = vfy || ''; }
        }
        // Last resort: rack derived from the supplier's net STO. Only reached
        // when nothing else holds a rack, so a real rack always wins.
        if (!doc && LEGACY_RACK_BY_YEAR[slug]) {
          const lys = Object.keys(LEGACY_RACK_BY_YEAR[slug]).sort();
          const ly = yearReq ? (LEGACY_RACK_BY_YEAR[slug][yearReq] ? yearReq : '') : lys[0];
          doc = ly ? LEGACY_RACK_BY_YEAR[slug][ly] : null;
          resolved = { doc: doc, year: ly, years: lys };
        }
        if (!doc && SHEET_RACK_BY_YEAR[slug]) {
          const hys = Object.keys(SHEET_RACK_BY_YEAR[slug]).sort();
          const hy = yearReq ? (SHEET_RACK_BY_YEAR[slug][yearReq] ? yearReq : '') : hys[0];
          doc = hy ? SHEET_RACK_BY_YEAR[slug][hy] : null;
          resolved = { doc: doc, year: hy, years: hys };
        }
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
    for (const s of Object.keys(LEGACY_RACK_BY_YEAR)) { if (!lodges[s]) lodges[s] = flatten(LEGACY_RACK_BY_YEAR[s][Object.keys(LEGACY_RACK_BY_YEAR[s]).sort()[0]]); }
    for (const s of Object.keys(SHEET_RACK_BY_YEAR)) { if (!lodges[s]) lodges[s] = flatten(SHEET_RACK_BY_YEAR[s][Object.keys(SHEET_RACK_BY_YEAR[s]).sort()[0]]); }
    return res.status(200).json({ ok: true, lodges: lodges });
  } catch (e) {
    return res.status(200).json({ ok: true, lodges: {}, error: String(e && e.message ? e.message : e) });
  }
};

// ---------------------------------------------------------------------------
// Solitaire General Dealer (Pty) Ltd — Solitaire Mountain Lodge & Solitaire
// Roadhouse. 2027 published RACK rates, B&B, N$. These are the supplier's own
// published rack figures from the 2027 rate sheet — NOT derived from STO.
// ---------------------------------------------------------------------------
Object.assign(DDS_RACK_BY_YEAR, {
  "solitaire-mountain-lodge": {
    "2027": {
      "name": "Solitaire Mountain Lodge",
      "region": "Sossusvlei",
      "currency": "N$",
      "validity": "2027 · single season, no high/low split",
      "note": "Published rack rates, N$, bed & breakfast. Rates exclude dinner, alcohol and activities, and are rounded down to the lowest N$10. Extras: buffet dinner N$400 per person, lunch packs N$300 per person. Children 0–4 sharing with parents free of charge, 5–12 half price, 13 and over full price.",
      "sections": [
        {
          "title": "2027 — bed & breakfast",
          "rows": [
            ["Single room (1 person)", "2,000"],
            ["Double room (per person sharing)", "1,850"],
            ["Family room (3 adults, see child policy)", "4,750"],
            ["Guide room", "900"]
          ]
        }
      ]
    }
  },
  "solitaire-roadhouse": {
    "2027": {
      "name": "Solitaire Roadhouse",
      "region": "Sossusvlei",
      "currency": "N$",
      "validity": "2027 · single season, no high/low split",
      "note": "Published rack rates, N$, bed & breakfast. Rates exclude dinner, alcohol and activities, and are rounded down to the lowest N$10. Extras: buffet dinner N$400 per person, lunch packs N$300 per person. Children 0–4 sharing with parents free of charge, 5–12 half price, 13 and over full price.",
      "sections": [
        {
          "title": "2027 — bed & breakfast",
          "rows": [
            ["Single room (1 person)", "1,900"],
            ["Double room (per person sharing)", "1,700"],
            ["Family room (3 adults, see child policy)", "4,550"],
            ["Guide room", "900"]
          ]
        }
      ]
    }
  }
});

// ---------------------------------------------------------------------------
// Cresta Sprayview Hotel, Victoria Falls (Zimbabwe) — 2027 published RACK rates.
// Taken straight from the supplier's agreement, NOT derived from STO. Cresta
// notes that rack is "a guideline and not the contracted rates".
// ---------------------------------------------------------------------------
Object.assign(DDS_RACK_BY_YEAR, {
  "cresta-sprayview": {
    "2027": {
      "name": "Cresta Sprayview Hotel",
      "region": "Victoria Falls",
      "currency": "US$",
      "validity": "2027 · Green 1 Jan – 30 Jun / High 1 Jul – 31 Dec",
      "note": "Published rack rates in US$, per person per night, inclusive of VAT and the Government Tourism levy. Excludes all local and international transfers, beverages, laundry, telephone and personal charges. Children 12 and under (maximum 2 per room) are charged 50% of the adult rate on bed & breakfast when sharing with 2 adults; children in their own room pay the full adult rate. Meals: ages 0–2 no charge, ages 3–12 50% per meal per day. Rooms held until 18:00 on the arrival date; check-in 14:00, check-out 10:00.",
      "sections": [
        {
          "title": "Green season (1 Jan – 30 Jun 2027) — bed & breakfast",
          "rows": [
            ["Standard room — per person sharing", "184"],
            ["Standard room — single", "220"],
            ["Executive — per person sharing", "212"],
            ["Executive — single", "254"]
          ]
        },
        {
          "title": "Green season (1 Jan – 30 Jun 2027) — half board",
          "rows": [
            ["Standard room — per person sharing", "219"],
            ["Standard room — single", "262"],
            ["Executive — per person sharing", "247"],
            ["Executive — single", "296"]
          ]
        },
        {
          "title": "Green season (1 Jan – 30 Jun 2027) — full board",
          "rows": [
            ["Standard room — per person sharing", "249"],
            ["Standard room — single", "298"],
            ["Executive — per person sharing", "277"],
            ["Executive — single", "332"]
          ]
        },
        {
          "title": "High season (1 Jul – 31 Dec 2027) — bed & breakfast",
          "rows": [
            ["Standard room — per person sharing", "220"],
            ["Standard room — single", "264"],
            ["Executive — per person sharing", "253"],
            ["Executive — single", "303"]
          ]
        },
        {
          "title": "High season (1 Jul – 31 Dec 2027) — half board",
          "rows": [
            ["Standard room — per person sharing", "255"],
            ["Standard room — single", "306"],
            ["Executive — per person sharing", "288"],
            ["Executive — single", "345"]
          ]
        },
        {
          "title": "High season (1 Jul – 31 Dec 2027) — full board",
          "rows": [
            ["Standard room — per person sharing", "285"],
            ["Standard room — single", "342"],
            ["Executive — per person sharing", "318"],
            ["Executive — single", "381"]
          ]
        }
      ]
    }
  }
});

// ---------------------------------------------------------------------------
// Thebe River Safaris, Kasane (Chobe) — 2026 and 2027.
// NOTE: quoted in BOTSWANA PULA, not US$ — this is the supplier's own currency
// on both the rack and STO sheets. Rack is the supplier's published sheet, not
// derived. STO is a consistent 20% off rack across every line.
// ---------------------------------------------------------------------------
Object.assign(DDS_RACK_BY_YEAR, {
  "thebe-river-safaris": {
    "2026": {
      "name": "Thebe River Safaris",
      "region": "Chobe",
      "currency": "BWP",
      "validity": "2026 · single season, 1 Jan – 31 Dec 2026",
      "note": "Published rack rates, BWP. Rates are quoted in Botswana Pula (BWP) per person per night as supplied by Thebe — this supplier does not quote in US$. All rates exclude Government park fees; the Government bed levy and park fees may change without notice. Child policy: children under 6 sharing with 2 adults free of charge; 6–12 sharing with 2 adults pay 50% of the adult rate; 12 and over count as an adult if using their own room. One child sharing per room; child and third-person sharing subject to availability. Guide policy: one room free of charge per accommodated group booking for crew or translator, subject to availability at check-in and not confirmable at booking or rooming-list stage — a guaranteed crew room is charged at the STO rate, as are additional crew rooms. Crew free of charge on camping group bookings; crew pay park fees only for activities. Activities are not private, seats may be shared with other hotel guests, and require a minimum of four persons per departure. Packages exclude park fees, visas, transfers and drinks. The three-night package includes a guided day trip to Victoria Falls (Zimbabwe) with transfer, lunch and craft market visit, excluding park fees and visa. A signed STO agreement must be returned to reservations@theberiversafaris.com.",
      "sections": [
        {
          "title": "Safari rooms — per person sharing",
          "rows": [
            [
              "Bed & breakfast",
              "974"
            ],
            [
              "Half board (dinner, bed & breakfast)",
              "1,104"
            ],
            [
              "Full board (breakfast, lunch, dinner & bed)",
              "1,234"
            ],
            [
              "Fully inclusive (full board + two game viewing activities)",
              "2,014"
            ]
          ]
        },
        {
          "title": "Safari rooms — single",
          "rows": [
            [
              "Bed & breakfast",
              "1,455"
            ],
            [
              "Half board",
              "1,585"
            ],
            [
              "Full board",
              "1,715"
            ],
            [
              "Fully inclusive",
              "2,495"
            ]
          ]
        },
        {
          "title": "Family room — per person sharing (minimum 4 persons)",
          "rows": [
            [
              "Bed & breakfast",
              "736"
            ],
            [
              "Half board",
              "866"
            ],
            [
              "Full board",
              "996"
            ],
            [
              "Fully inclusive",
              "1,776"
            ]
          ]
        },
        {
          "title": "Camping — per person sharing",
          "rows": [
            [
              "Room only",
              "144"
            ]
          ]
        },
        {
          "title": "Packages — per person",
          "rows": [
            [
              "Two-night package — sharing",
              "2,963"
            ],
            [
              "Two-night package — single",
              "3,875"
            ],
            [
              "Three-night package — sharing",
              "6,459"
            ],
            [
              "Three-night package — single",
              "7,827"
            ]
          ]
        },
        {
          "title": "Activities — per person",
          "rows": [
            [
              "Chobe game drive (3 hrs)",
              "390"
            ],
            [
              "Full day game drive (9 hrs)",
              "1,170"
            ],
            [
              "Chobe boat cruise (3 hrs)",
              "390"
            ]
          ]
        },
        {
          "title": "Transfers — per person",
          "rows": [
            [
              "Border to Kasane town",
              "108"
            ],
            [
              "Border to Kasane airport",
              "133"
            ],
            [
              "Thebe to Victoria Falls",
              "631"
            ],
            [
              "Thebe to Livingstone",
              "631"
            ]
          ]
        },
        {
          "title": "Chobe National Park / conservation fees — per person per day",
          "rows": [
            [
              "Foreign / international",
              "190"
            ],
            [
              "Residents",
              "145"
            ],
            [
              "Citizens",
              "20"
            ]
          ]
        }
      ]
    },
    "2027": {
      "name": "Thebe River Safaris",
      "region": "Chobe",
      "currency": "BWP",
      "validity": "2027 · single season, 1 Jan – 31 Dec 2027",
      "note": "Published rack rates, BWP. Rates are quoted in Botswana Pula (BWP) per person per night as supplied by Thebe — this supplier does not quote in US$. All rates exclude Government park fees; the Government bed levy and park fees may change without notice. Child policy: children under 6 sharing with 2 adults free of charge; 6–12 sharing with 2 adults pay 50% of the adult rate; 12 and over count as an adult if using their own room. One child sharing per room; child and third-person sharing subject to availability. Guide policy: one room free of charge per accommodated group booking for crew or translator, subject to availability at check-in and not confirmable at booking or rooming-list stage — a guaranteed crew room is charged at the STO rate, as are additional crew rooms. Crew free of charge on camping group bookings; crew pay park fees only for activities. Activities are not private, seats may be shared with other hotel guests, and require a minimum of four persons per departure. Packages exclude park fees, visas, transfers and drinks. The three-night package includes a guided day trip to Victoria Falls (Zimbabwe) with transfer, lunch and craft market visit, excluding park fees and visa. A signed STO agreement must be returned to reservations@theberiversafaris.com.",
      "sections": [
        {
          "title": "Safari rooms — per person sharing",
          "rows": [
            [
              "Bed & breakfast",
              "1,043"
            ],
            [
              "Half board (dinner, bed & breakfast)",
              "1,173"
            ],
            [
              "Full board (breakfast, lunch, dinner & bed)",
              "1,303"
            ],
            [
              "Fully inclusive (full board + two game viewing activities)",
              "2,083"
            ]
          ]
        },
        {
          "title": "Safari rooms — single",
          "rows": [
            [
              "Bed & breakfast",
              "1,557"
            ],
            [
              "Half board",
              "1,687"
            ],
            [
              "Full board",
              "1,817"
            ],
            [
              "Fully inclusive",
              "2,597"
            ]
          ]
        },
        {
          "title": "Family room — per person sharing (minimum 4 persons)",
          "rows": [
            [
              "Bed & breakfast",
              "788"
            ],
            [
              "Half board",
              "918"
            ],
            [
              "Full board",
              "1,048"
            ],
            [
              "Fully inclusive",
              "1,828"
            ]
          ]
        },
        {
          "title": "Camping — per person sharing",
          "rows": [
            [
              "Room only",
              "154"
            ]
          ]
        },
        {
          "title": "Packages — per person",
          "rows": [
            [
              "Two-night package — sharing",
              "3,093"
            ],
            [
              "Two-night package — single",
              "4,070"
            ],
            [
              "Three-night package — sharing",
              "6,515"
            ],
            [
              "Three-night package — single",
              "7,980"
            ]
          ]
        },
        {
          "title": "Activities — per person",
          "rows": [
            [
              "Chobe game drive (3 hrs)",
              "390"
            ],
            [
              "Full day game drive (9 hrs)",
              "1,170"
            ],
            [
              "Chobe boat cruise (3 hrs)",
              "390"
            ]
          ]
        },
        {
          "title": "Transfers — per person",
          "rows": [
            [
              "Border to Kasane town",
              "108"
            ],
            [
              "Border to Kasane airport",
              "133"
            ],
            [
              "Thebe to Victoria Falls",
              "631"
            ],
            [
              "Thebe to Livingstone",
              "631"
            ]
          ]
        },
        {
          "title": "Chobe National Park / conservation fees — per person per day",
          "rows": [
            [
              "Foreign / international",
              "190"
            ],
            [
              "Residents",
              "145"
            ],
            [
              "Citizens",
              "20"
            ]
          ]
        }
      ]
    }
  }
});

// ---------------------------------------------------------------------------
// Ultimate Safaris / ultimate.earth camps — 2027, N$.
// Galton House (Windhoek), Camp Sossus (Sossusvlei), Camp Doros, Onduli Ridge
// and Onduli Enclave (Damaraland).
// RACK IS THE SUPPLIER'S OWN PUBLISHED SHEET, NOT DERIVED. Their STO discount is
// ~26.4% off public, not the usual 20% — deriving rack at STO/0.8 would have
// understated every public price.
// Conservation & community fee is charged ON TOP and is not in the rates.
// ---------------------------------------------------------------------------
Object.assign(DDS_RACK_BY_YEAR, {
  "galton-house": {
    "2027": {
      "name": "Galton House",
      "region": "Windhoek",
      "currency": "N$",
      "validity": "2027 · Shoulder 10 Jan–31 Mar & 1–19 Dec / High 1 Apr–30 Nov & 20 Dec–9 Jan '28",
      "note": "Published public rates. N$ per person per night, bed & breakfast, minimum 1 night. Includes accommodation, breakfast and VAT. Excludes drinks, dinner, a la carte lunch, artisan coffee, laundry (available on two-night stays or longer), activities, tips, personal items and travel insurance. Day use of the communal areas and bathroom, without a guest room, is N$550 per person for guests not staying at Galton House. Windhoek city tour N$1,415 per person one way, 3 hours, minimum 2 and maximum 7 pax. Children of all ages welcome sharing with adults on a single bed: 0–5 years at 25% of the adult rate, 6–12 years at 50%. A 15% long-stay discount applies from 6 nights and is already reflected in the 6+ night columns; it applies in shoulder season only.",
      "sections": [
        {
          "title": "Shoulder season (10 Jan – 31 Mar 2027 and 1 – 19 Dec 2027) — standard rooms",
          "rows": [
            [
              "Per person sharing, 1–5 nights",
              "2,098"
            ],
            [
              "Per person sharing, 6+ nights (15% long-stay)",
              "1,784"
            ],
            [
              "Single supplement, 1–5 nights",
              "461"
            ],
            [
              "Single supplement, 6+ nights",
              "393"
            ]
          ]
        },
        {
          "title": "High season (1 Apr – 30 Nov 2027 and 20 Dec 2027 – 9 Jan 2028) — standard rooms",
          "rows": [
            [
              "Per person sharing, 1–5 nights",
              "2,393"
            ],
            [
              "Per person sharing, 6+ nights",
              "2,393"
            ],
            [
              "Single supplement, 1–5 nights",
              "542"
            ],
            [
              "Single supplement, 6+ nights",
              "542"
            ]
          ]
        },
        {
          "title": "Shoulder season (10 Jan – 31 Mar 2027 and 1 – 19 Dec 2027) — pool suite",
          "rows": [
            [
              "Per person sharing, 1–5 nights",
              "2,855"
            ],
            [
              "Per person sharing, 6+ nights (15% long-stay)",
              "2,426"
            ],
            [
              "Single supplement, 1–5 nights",
              "695"
            ],
            [
              "Single supplement, 6+ nights",
              "591"
            ]
          ]
        },
        {
          "title": "High season (1 Apr – 30 Nov 2027 and 20 Dec 2027 – 9 Jan 2028) — pool suite",
          "rows": [
            [
              "Per person sharing, 1–5 nights",
              "3,235"
            ],
            [
              "Per person sharing, 6+ nights",
              "3,235"
            ],
            [
              "Single supplement, 1–5 nights",
              "851"
            ],
            [
              "Single supplement, 6+ nights",
              "851"
            ]
          ]
        },
        {
          "title": "Pilots & guides (per person per night, all meals and non-alcoholic drinks)",
          "rows": [
            [
              "Standard room",
              "1,779"
            ],
            [
              "Pool suite",
              "3,558"
            ]
          ]
        }
      ]
    }
  },
  "camp-sossus": {
    "2027": {
      "name": "Camp Sossus",
      "region": "Sossusvlei",
      "currency": "N$",
      "validity": "2027 · Shoulder 10 Jan–31 Mar & 1–19 Dec / High 1 Apr–30 Nov & 20 Dec–9 Jan '28",
      "note": "Published public rates. N$ per person per night, fully inclusive, minimum 2 nights. The conservation and community fee is charged per person per night for adults and children and is NOT included in the rates above — it must be added to every booking. Pilots and guides are not subject to the conservation and community fee; their rate includes all meals and non-alcoholic drinks. Private vehicles must be booked in advance for the entire stay, are charged per night, are limited to 7 passengers and are subject to availability. A 15% long-stay discount applies from 6 nights and is already reflected in the 6+ night columns; it applies in shoulder season only. Rates must be read in conjunction with the camp fact sheet. Includes accommodation, all meals, local drinks, shared camp activities, transfers to and from Hammerstein or Witwater airstrips, concession fees, the Sossusvlei fee and VAT. Excludes premium drinks, laundry (not available), additional transfers, third-party activities, tips, the conservation fee, personal items and travel insurance. No children under 6 unless exclusive use is booked (5 or more full-paying tents, 10 adults); children 6–12 at 50% of the adult rate sharing with adults. Exclusive use is considered at 5 or more full-paying tents.",
      "sections": [
        {
          "title": "Shoulder season (10 Jan – 31 Mar 2027 and 1 – 19 Dec 2027)",
          "rows": [
            [
              "Per person sharing, 1–5 nights",
              "7,828"
            ],
            [
              "Per person sharing, 6+ nights (15% long-stay)",
              "6,654"
            ],
            [
              "Single supplement, 1–5 nights",
              "2,614"
            ],
            [
              "Single supplement, 6+ nights",
              "2,222"
            ],
            [
              "Conservation & community fee, per person per night",
              "420"
            ]
          ]
        },
        {
          "title": "High season (1 Apr – 30 Nov 2027 and 20 Dec 2027 – 9 Jan 2028)",
          "rows": [
            [
              "Per person sharing, 1–5 nights",
              "9,279"
            ],
            [
              "Per person sharing, 6+ nights",
              "9,279"
            ],
            [
              "Single supplement, 1–5 nights",
              "3,096"
            ],
            [
              "Single supplement, 6+ nights",
              "3,096"
            ],
            [
              "Conservation & community fee, per person per night",
              "420"
            ]
          ]
        },
        {
          "title": "Pilots, guides & private vehicle",
          "rows": [
            [
              "Pilot or guide — shoulder season",
              "2,703"
            ],
            [
              "Pilot or guide — high season",
              "5,406"
            ],
            [
              "Private vehicle, per vehicle per night",
              "17,508"
            ]
          ]
        }
      ]
    }
  },
  "camp-doros": {
    "2027": {
      "name": "Camp Doros",
      "region": "Damaraland",
      "currency": "N$",
      "validity": "2027 · Shoulder 10 Jan–31 Mar & 1–19 Dec / High 1 Apr–30 Nov & 20 Dec–9 Jan '28",
      "note": "Published public rates. N$ per person per night, fully inclusive, minimum 2 nights. The conservation and community fee is charged per person per night for adults and children and is NOT included in the rates above — it must be added to every booking. Pilots and guides are not subject to the conservation and community fee; their rate includes all meals and non-alcoholic drinks. Private vehicles must be booked in advance for the entire stay, are charged per night, are limited to 7 passengers and are subject to availability. A 15% long-stay discount applies from 6 nights and is already reflected in the 6+ night columns; it applies in shoulder season only. Rates must be read in conjunction with the camp fact sheet. Includes accommodation, all meals, local drinks, scheduled shared activities, airstrip transfers from Onduli airstrip at the scheduled 15:00 pick-up, concession fees, the rhino activity and VAT. On a three-night stay the rock engraving visit and elephant tracking fee are included. Excludes premium drinks, laundry (not available), additional transfers, tips, the conservation fee, personal items and travel insurance. Exclusive use is considered at 5 or more full-paying tents.",
      "sections": [
        {
          "title": "Shoulder season (10 Jan – 31 Mar 2027 and 1 – 19 Dec 2027)",
          "rows": [
            [
              "Per person sharing, 1–5 nights",
              "7,828"
            ],
            [
              "Per person sharing, 6+ nights (15% long-stay)",
              "6,654"
            ],
            [
              "Single supplement, 1–5 nights",
              "2,614"
            ],
            [
              "Single supplement, 6+ nights",
              "2,222"
            ],
            [
              "Conservation & community fee, per person per night",
              "420"
            ]
          ]
        },
        {
          "title": "High season (1 Apr – 30 Nov 2027 and 20 Dec 2027 – 9 Jan 2028)",
          "rows": [
            [
              "Per person sharing, 1–5 nights",
              "9,279"
            ],
            [
              "Per person sharing, 6+ nights",
              "9,279"
            ],
            [
              "Single supplement, 1–5 nights",
              "3,096"
            ],
            [
              "Single supplement, 6+ nights",
              "3,096"
            ],
            [
              "Conservation & community fee, per person per night",
              "420"
            ]
          ]
        },
        {
          "title": "Pilots, guides & private vehicle",
          "rows": [
            [
              "Pilot or guide — shoulder season",
              "2,703"
            ],
            [
              "Pilot or guide — high season",
              "5,406"
            ],
            [
              "Private vehicle, per vehicle per night",
              "17,508"
            ]
          ]
        }
      ]
    }
  },
  "onduli-ridge": {
    "2027": {
      "name": "Onduli Ridge",
      "region": "Damaraland",
      "currency": "N$",
      "validity": "2027 · Shoulder 10 Jan–31 Mar & 1–19 Dec / High 1 Apr–30 Nov & 20 Dec–9 Jan '28",
      "note": "Published public rates. N$ per person per night, fully inclusive, minimum 2 nights. The conservation and community fee is charged per person per night for adults and children and is NOT included in the rates above — it must be added to every booking. Pilots and guides are not subject to the conservation and community fee; their rate includes all meals and non-alcoholic drinks. Private vehicles must be booked in advance for the entire stay, are charged per night, are limited to 7 passengers and are subject to availability. A 15% long-stay discount applies from 6 nights and is already reflected in the 6+ night columns; it applies in shoulder season only. Rates must be read in conjunction with the camp fact sheet. Includes accommodation, all meals, local drinks, laundry, scheduled shared activities, airstrip transfers from Onduli airstrip, concession fees, the elephant tracking fee, the Twyfelfontein fee and VAT. On a three-night stay the rhino activity is included. Excludes premium brand drinks, additional transfers, tips, the conservation fee, personal items and travel insurance.",
      "sections": [
        {
          "title": "Shoulder season (10 Jan – 31 Mar 2027 and 1 – 19 Dec 2027)",
          "rows": [
            [
              "Per person sharing, 1–5 nights",
              "15,337"
            ],
            [
              "Per person sharing, 6+ nights (15% long-stay)",
              "13,037"
            ],
            [
              "Single supplement, 1–5 nights",
              "5,268"
            ],
            [
              "Single supplement, 6+ nights",
              "4,479"
            ],
            [
              "Conservation & community fee, per person per night",
              "600"
            ]
          ]
        },
        {
          "title": "High season (1 Apr – 30 Nov 2027 and 20 Dec 2027 – 9 Jan 2028)",
          "rows": [
            [
              "Per person sharing, 1–5 nights",
              "19,984"
            ],
            [
              "Per person sharing, 6+ nights",
              "19,984"
            ],
            [
              "Single supplement, 1–5 nights",
              "6,846"
            ],
            [
              "Single supplement, 6+ nights",
              "6,846"
            ],
            [
              "Conservation & community fee, per person per night",
              "600"
            ]
          ]
        },
        {
          "title": "Pilots, guides & private vehicle",
          "rows": [
            [
              "Pilot or guide — shoulder season",
              "2,875"
            ],
            [
              "Pilot or guide — high season",
              "5,750"
            ],
            [
              "Private vehicle, per vehicle per night",
              "17,508"
            ]
          ]
        }
      ]
    }
  },
  "onduli-enclave": {
    "2027": {
      "name": "Onduli Enclave",
      "region": "Damaraland",
      "currency": "N$",
      "validity": "2027 · Shoulder 10 Jan–31 Mar & 1–19 Dec / High 1 Apr–30 Nov & 20 Dec–9 Jan '28",
      "note": "Published public rates. N$ per night, fully inclusive, exclusive use, minimum 4 pax and minimum 2 nights. The headline figure is for 4 persons sharing per night, not per person. Includes accommodation, all meals with a private chef, local and premium brand drinks as offered, laundry, private activities, a private butler, airstrip transfers from Onduli airstrip, concession fees, the elephant tracking fee, the Twyfelfontein fee and VAT. On a three-night stay the rhino activity is included. Excludes additional transfers, tips, conservation fees, personal items and travel insurance. Pilots and guides are accommodated at Onduli Ridge. A 15% long-stay discount applies from 6 nights, shoulder season only, and is already reflected in the 6+ night columns.",
      "sections": [
        {
          "title": "Shoulder season (10 Jan – 31 Mar 2027 and 1 – 19 Dec 2027) — exclusive use, minimum 4 pax",
          "rows": [
            [
              "4 persons sharing, per night, 1–5 nights",
              "105,455"
            ],
            [
              "4 persons sharing, per night, 6+ nights (15% long-stay)",
              "89,639"
            ],
            [
              "Additional 5th or 6th adult sharing, 1–5 nights",
              "26,364"
            ],
            [
              "Additional 5th or 6th adult sharing, 6+ nights",
              "22,409"
            ],
            [
              "Conservation & community fee, per night (4 pax unit)",
              "2,400"
            ],
            [
              "Conservation & community fee, each additional adult",
              "600"
            ]
          ]
        },
        {
          "title": "High season (1 Apr – 30 Nov 2027 and 20 Dec 2027 – 9 Jan 2028) — exclusive use, minimum 4 pax",
          "rows": [
            [
              "4 persons sharing, per night, 1–5 nights",
              "137,859"
            ],
            [
              "4 persons sharing, per night, 6+ nights",
              "137,859"
            ],
            [
              "Additional 5th or 6th adult sharing, 1–5 nights",
              "34,465"
            ],
            [
              "Additional 5th or 6th adult sharing, 6+ nights",
              "34,465"
            ],
            [
              "Conservation & community fee, per night (4 pax unit)",
              "2,400"
            ],
            [
              "Conservation & community fee, each additional adult",
              "600"
            ]
          ]
        },
        {
          "title": "Pilots & guides (accommodated at Onduli Ridge)",
          "rows": [
            [
              "Shoulder season",
              "2,875"
            ],
            [
              "High season",
              "5,750"
            ]
          ]
        }
      ]
    }
  }
});

// ---------------------------------------------------------------------------
// The Victoria Falls Hotel (Zimbabwe) — 2026 and 2027, US$.
// Rates are PER ROOM per night, bed & breakfast, nett and non-commissionable.
// No published rack sheet, so rack is derived at STO/0.8.
// ---------------------------------------------------------------------------
Object.assign(DDS_RACK_BY_YEAR, {
  "the-victoria-falls-hotel": {
    "2026": {
      "name": "The Victoria Falls Hotel",
      "region": "Victoria Falls",
      "currency": "US$",
      "validity": "2026 · Low 1 Jan–30 Jun / High 1 Jul–31 Dec",
      "note": "Rack derived from the hotel's nett travel agent rate at the standard 20% margin — The Victoria Falls Hotel does not publish a separate rack sheet. US$ per ROOM per night — not per person — on a bed and breakfast basis. The Presidential / Livingstone suite is quoted on dinner, bed and breakfast. Rates include the 2% tourism levy and VAT as legislated by the Government of Zimbabwe. The hotel offers a fully serviced wheelchair accessible room in the Classic category. Check-in 14:00, check-out 10:00. A provisional booking is held for 14 days and then automatically released if not confirmed. Low season bookings need a 10% non-refundable deposit or voucher within 30 days of booking; high season 20%. Bookings made within 30 days of travel require full payment within 48 hours, and full prepayment is due no later than 45 days before arrival. Children are 3–11 years and adult children 12 and over. Child rates apply to Classic, Stables Signature Wing and Premium rooms only, subject to availability, and never to suites: a second room taken by a guest of 12 or over is charged the normal single or twin rate; a second room taken by a child of 3–11 is charged 50% on bed and breakfast — one child pays 50% of the single rate, two children pay 50% of the double rate. Infants under 3 stay free sharing with paying guests and cots are available. Children 3–11 pay 50% of the applicable meal rate on buffet meals only. An STO rate application form and a signed agreement are required by the hotel.",
      "sections": [
        {
          "title": "Low season (1 Jan – 30 Jun 2026) — single, per room per night",
          "rows": [
            [
              "Classic room",
              "699"
            ],
            [
              "Classic accessible room",
              "699"
            ],
            [
              "Stables Signature Wing room",
              "950"
            ],
            [
              "Premium room",
              "1,358"
            ],
            [
              "Deluxe suite",
              "1,532"
            ],
            [
              "Executive suite",
              "1,990"
            ],
            [
              "Batoka suite",
              "4,950"
            ],
            [
              "Presidential / Livingstone suite (dinner, bed & breakfast)",
              "7,312"
            ]
          ]
        },
        {
          "title": "Low season (1 Jan – 30 Jun 2026) — double / twin, per room per night",
          "rows": [
            [
              "Classic room",
              "748"
            ],
            [
              "Classic accessible room",
              "748"
            ],
            [
              "Stables Signature Wing room",
              "995"
            ],
            [
              "Premium room",
              "1,422"
            ],
            [
              "Deluxe suite",
              "1,532"
            ],
            [
              "Executive suite",
              "1,990"
            ],
            [
              "Batoka suite",
              "4,950"
            ],
            [
              "Presidential / Livingstone suite (dinner, bed & breakfast)",
              "7,312"
            ]
          ]
        },
        {
          "title": "High season (1 Jul – 31 Dec 2026) — single, per room per night",
          "rows": [
            [
              "Classic room",
              "765"
            ],
            [
              "Classic accessible room",
              "765"
            ],
            [
              "Stables Signature Wing room",
              "1,032"
            ],
            [
              "Premium room",
              "1,474"
            ],
            [
              "Deluxe suite",
              "1,684"
            ],
            [
              "Executive suite",
              "2,194"
            ],
            [
              "Batoka suite",
              "4,950"
            ],
            [
              "Presidential / Livingstone suite (dinner, bed & breakfast)",
              "7,312"
            ]
          ]
        },
        {
          "title": "High season (1 Jul – 31 Dec 2026) — double / twin, per room per night",
          "rows": [
            [
              "Classic room",
              "818"
            ],
            [
              "Classic accessible room",
              "818"
            ],
            [
              "Stables Signature Wing room",
              "1,078"
            ],
            [
              "Premium room",
              "1,540"
            ],
            [
              "Deluxe suite",
              "1,684"
            ],
            [
              "Executive suite",
              "2,194"
            ],
            [
              "Batoka suite",
              "4,950"
            ],
            [
              "Presidential / Livingstone suite (dinner, bed & breakfast)",
              "7,312"
            ]
          ]
        },
        {
          "title": "Restaurant & meal rates, per person",
          "rows": [
            [
              "Jungle Junction breakfast buffet (06:30–10:00)",
              "50"
            ],
            [
              "Jungle Junction private lunch buffet, minimum 35 pax (12:00–14:00)",
              "50"
            ],
            [
              "Jungle Junction dinner buffet (19:00–22:00)",
              "56"
            ]
          ]
        }
      ]
    },
    "2027": {
      "name": "The Victoria Falls Hotel",
      "region": "Victoria Falls",
      "currency": "US$",
      "validity": "2027 · Low 1 Jan–30 Apr & 1 Nov–31 Dec / High 1 May–31 Oct",
      "note": "Rack derived from the hotel's nett travel agent rate at the standard 20% margin — The Victoria Falls Hotel does not publish a separate rack sheet. US$ per ROOM per night — not per person — on a bed and breakfast basis. The Presidential / Livingstone suite is quoted on dinner, bed and breakfast. Rates include the 2% tourism levy and VAT as legislated by the Government of Zimbabwe. The hotel offers a fully serviced wheelchair accessible room in the Classic category. Check-in 14:00, check-out 10:00. A provisional booking is held for 14 days and then automatically released if not confirmed. Low season bookings need a 10% non-refundable deposit or voucher within 30 days of booking; high season 20%. Bookings made within 30 days of travel require full payment within 48 hours, and full prepayment is due no later than 45 days before arrival. Children are 3–11 years and adult children 12 and over. Child rates apply to Classic, Stables Signature Wing and Premium rooms only, subject to availability, and never to suites: a second room taken by a guest of 12 or over is charged the normal single or twin rate; a second room taken by a child of 3–11 is charged 50% on bed and breakfast — one child pays 50% of the single rate, two children pay 50% of the double rate. Infants under 3 stay free sharing with paying guests and cots are available. Children 3–11 pay 50% of the applicable meal rate on buffet meals only. An STO rate application form and a signed agreement are required by the hotel.",
      "sections": [
        {
          "title": "Low season (1 Jan – 30 Apr 2027 and 1 Nov – 31 Dec 2027) — single, per room per night",
          "rows": [
            [
              "Classic room",
              "700"
            ],
            [
              "Stables Signature Wing room",
              "998"
            ],
            [
              "Premium room",
              "1,358"
            ],
            [
              "Deluxe suite",
              "1,532"
            ],
            [
              "Executive suite",
              "1,990"
            ],
            [
              "Batoka suite",
              "4,950"
            ],
            [
              "Presidential / Livingstone suite (dinner, bed & breakfast)",
              "7,312"
            ]
          ]
        },
        {
          "title": "Low season (1 Jan – 30 Apr 2027 and 1 Nov – 31 Dec 2027) — double / twin, per room per night",
          "rows": [
            [
              "Classic room",
              "748"
            ],
            [
              "Stables Signature Wing room",
              "1,044"
            ],
            [
              "Premium room",
              "1,422"
            ],
            [
              "Deluxe suite",
              "1,532"
            ],
            [
              "Executive suite",
              "1,990"
            ],
            [
              "Batoka suite",
              "4,950"
            ],
            [
              "Presidential / Livingstone suite (dinner, bed & breakfast)",
              "7,312"
            ]
          ]
        },
        {
          "title": "High season (1 May – 31 Oct 2027) — single, per room per night",
          "rows": [
            [
              "Classic room",
              "765"
            ],
            [
              "Stables Signature Wing room",
              "1,084"
            ],
            [
              "Premium room",
              "1,474"
            ],
            [
              "Deluxe suite",
              "1,684"
            ],
            [
              "Executive suite",
              "2,194"
            ],
            [
              "Batoka suite",
              "4,950"
            ],
            [
              "Presidential / Livingstone suite (dinner, bed & breakfast)",
              "7,312"
            ]
          ]
        },
        {
          "title": "High season (1 May – 31 Oct 2027) — double / twin, per room per night",
          "rows": [
            [
              "Classic room",
              "816"
            ],
            [
              "Stables Signature Wing room",
              "1,131"
            ],
            [
              "Premium room",
              "1,539"
            ],
            [
              "Deluxe suite",
              "1,684"
            ],
            [
              "Executive suite",
              "2,194"
            ],
            [
              "Batoka suite",
              "4,950"
            ],
            [
              "Presidential / Livingstone suite (dinner, bed & breakfast)",
              "7,312"
            ]
          ]
        },
        {
          "title": "Restaurant & meal rates, per person",
          "rows": [
            [
              "Jungle Junction breakfast buffet (06:30–10:00)",
              "51"
            ],
            [
              "Jungle Junction dinner buffet (19:00–22:00)",
              "51"
            ]
          ]
        }
      ]
    }
  }
});


// ---------------------------------------------------------------------------
// DERIVED PUBLIC RACK — lodges that had an agent (STO) rate but no public rack,
// so the public page showed nothing at all.
//
// HOUSE RULE: rack is never more than 20% above the net STO.
//   - Supplier states a commission that grosses up to MORE than +20% (20/25/40%)
//     -> the +20% cap applies.
//   - Supplier states a commission that grosses up to LESS (10/15%)
//     -> that smaller figure is used, never inflated to the cap.
//   - Supplier states no commission -> the house +20% is used.
//
// Consulted LAST, so a supplier's own published rack — or anything set in the
// owner area — always wins over these. Ultimate Safaris is the reason that
// matters: their real discount is 26.4%, so their published rack legitimately
// sits above this cap and must not be overwritten.
// ---------------------------------------------------------------------------
Object.assign(LEGACY_RACK_BY_YEAR, {
 "camp-kwando": {
  "2026": {
   "name": "Camp Kwando",
   "region": "",
   "currency": "N$",
   "validity": "01 Dec 2025 – 30 Nov 2026",
   "note": "Public rack, capped at 20% above the net STO (house rule: rack is never more than STO + 20%). The supplier states 20% commission, which would gross up to 25.0% above net — the cap applies.",
   "sections": [
    {
     "title": "Bed & Breakfast (per person, per night)",
     "rows": [
      [
       "Tented River Chalet — Single",
       "1,934.40"
      ],
      [
       "Tented River Chalet — Double (pp sharing)",
       "1,656"
      ],
      [
       "Tented Chalet — Single",
       "1,449.60"
      ],
      [
       "Tented Chalet — Double (pp sharing)",
       "1,286.40"
      ],
      [
       "Tree House — Single",
       "3,240"
      ],
      [
       "Tree House — Double (pp sharing)",
       "2,462.40"
      ]
     ]
    },
    {
     "title": "Dinner, Bed & Breakfast (per person, per night)",
     "rows": [
      [
       "Tented River Chalet — Single",
       "2,438.40"
      ],
      [
       "Tented River Chalet — Double (pp sharing)",
       "2,160"
      ],
      [
       "Tented Chalet — Single",
       "1,953.60"
      ],
      [
       "Tented Chalet — Double (pp sharing)",
       "1,790.40"
      ],
      [
       "Tree House — Single",
       "3,744"
      ],
      [
       "Tree House — Double (pp sharing)",
       "2,966.40"
      ]
     ]
    },
    {
     "title": "Activities (per person)",
     "rows": [
      [
       "Game Drive (min 2 / max 10 pax)",
       "912"
      ],
      [
       "Boat Cruise (morning or sunset)",
       "662.40"
      ],
      [
       "Bird Cruise (mornings only)",
       "662.40"
      ]
     ]
    }
   ]
  }
 },
 "epako-safari-lodge": {
  "2026": {
   "name": "Epako Safari Lodge",
   "region": "",
   "currency": "N$",
   "validity": "2026",
   "note": "Public rack, capped at 20% above the net STO (house rule: rack is never more than STO + 20%). The supplier states 20% commission, which would gross up to 25.0% above net — the cap applies.",
   "sections": [
    {
     "title": "Rates (per person, per night)",
     "rows": [
      [
       "Deluxe Room (Sharing pp) - DBB",
       "8,544"
      ],
      [
       "Deluxe Room (Single) - DBB",
       "12,864"
      ],
      [
       "Junior Suite (Sharing pp) - DBB",
       "11,664"
      ],
      [
       "Junior Suite (Single) - DBB",
       "17,088"
      ],
      [
       "Tour Guide Room - DBB",
       "2,628"
      ]
     ]
    }
   ]
  }
 },
 "ababis-guest-farm": {
  "2026": {
   "name": "Ababis Guest Farm",
   "region": "",
   "currency": "N$",
   "validity": "2026",
   "note": "Public rack, capped at 20% above the net STO (house rule: rack is never more than STO + 20%). The supplier states 20% commission, which would gross up to 25.0% above net — the cap applies.",
   "sections": [
    {
     "title": "Rates (per person, per night)",
     "rows": [
      [
       "Comfort Double Room (Sharing) - DBB",
       "2,995.20"
      ],
      [
       "Comfort Single Room - DBB",
       "3,360"
      ],
      [
       "Comfort Double (2 Nights Stay Discount) - DBB",
       "2,695.68"
      ],
      [
       "Comfort Single (2 Nights Stay Discount) - DBB",
       "3,024"
      ],
      [
       "Self-Catering Farmhouse (2 Pax Sharing) - RO",
       "960"
      ],
      [
       "Campsite (Per Person) - RO",
       "336"
      ],
      [
       "Tour Guide Room - DBB",
       "1,248"
      ]
     ]
    }
   ]
  }
 },
 "africa-safari-lodge": {
  "2026": {
   "name": "Africa Safari Lodge",
   "region": "",
   "currency": "N$",
   "validity": "2026",
   "note": "Public rack, capped at 20% above the net STO (house rule: rack is never more than STO + 20%). The supplier states 40% commission, which would gross up to 66.7% above net — the cap applies.",
   "sections": [
    {
     "title": "Rates (per person, per night)",
     "rows": [
      [
       "Standard Room (Sharing) - DBB",
       "1,160.40"
      ],
      [
       "Standard Room (Single) - DBB",
       "1,430.40"
      ],
      [
       "Standard Room (Sharing) - BB",
       "806.40"
      ],
      [
       "Standard Room (Single) - BB",
       "1,076.40"
      ],
      [
       "Deluxe Family Room (2 Adults Sharing) - DBB",
       "3,303.60"
      ],
      [
       "Deluxe Family Room (2 Adults Sharing) - BB",
       "2,235.60"
      ]
     ]
    }
   ]
  }
 },
 "aloegrove-safari-lodge": {
  "2026": {
   "name": "Aloegrove Safari Lodge",
   "region": "",
   "currency": "N$",
   "validity": "2026",
   "note": "Public rack, capped at 20% above the net STO (house rule: rack is never more than STO + 20%). The supplier states 20% commission, which would gross up to 25.0% above net — the cap applies.",
   "sections": [
    {
     "title": "Rates (per person, per night)",
     "rows": [
      [
       "Standard Room (Sharing pp) - B&B",
       "1,704.96"
      ],
      [
       "Standard Room (Single) - B&B",
       "1,948.80"
      ],
      [
       "Luxury Room (Sharing pp) - B&B",
       "1,973.76"
      ],
      [
       "Luxury Room (Single) - B&B",
       "2,217.60"
      ],
      [
       "Kids 5-11 sharing - B&B",
       "518.40"
      ],
      [
       "Kids 12-18 sharing - B&B",
       "1,536"
      ],
      [
       "Tour Guide Room - B&B",
       "1,440"
      ]
     ]
    }
   ]
  }
 },
 "alte-kalkofen-lodge": {
  "2026": {
   "name": "Alte Kalkofen Lodge",
   "region": "",
   "currency": "N$",
   "validity": "2026",
   "note": "Public rack, capped at 20% above the net STO (house rule: rack is never more than STO + 20%). The supplier states 20% commission, which would gross up to 25.0% above net — the cap applies.",
   "sections": [
    {
     "title": "Rates (per person, per night)",
     "rows": [
      [
       "Luxury Chalet (Sharing) - B&B",
       "1,622.40"
      ],
      [
       "Luxury Chalet (Single) - B&B",
       "1,872"
      ],
      [
       "Luxury Chalet (Sharing) - Self Catering (Acc Only)",
       "1,420.80"
      ],
      [
       "Luxury Chalet (Single) - Self Catering (Acc Only)",
       "1,689.60"
      ],
      [
       "Children 3-13 years sharing - B&B",
       "811.20"
      ],
      [
       "Camping (Per Person) - RO",
       "240"
      ],
      [
       "Tour Guide Room - B&B",
       "974.40"
      ]
     ]
    }
   ]
  }
 },
 "atlantic-villa": {
  "2026": {
   "name": "Atlantic Villa Boutique Guesthouse",
   "region": "",
   "currency": "N$",
   "validity": "2026",
   "note": "Public rack, capped at 20% above the net STO (house rule: rack is never more than STO + 20%). The supplier states 20% commission, which would gross up to 25.0% above net — the cap applies.",
   "sections": [
    {
     "title": "Rates (per person, per night)",
     "rows": [
      [
       "Standard Room (Sharing pp) - B&B",
       "1,267.20"
      ],
      [
       "Standard Room (Single) - B&B",
       "1,728"
      ],
      [
       "Deluxe Room (Sharing pp) - B&B",
       "1,584"
      ],
      [
       "Deluxe Room (Single) - B&B",
       "2,112"
      ],
      [
       "Luxury Room (Sharing pp) - B&B",
       "1,708.80"
      ],
      [
       "Luxury Room (Single) - B&B",
       "2,323.20"
      ],
      [
       "Junior Suite (Sharing pp) - B&B",
       "2,428.80"
      ],
      [
       "Junior Suite (Single) - B&B",
       "3,379.20"
      ],
      [
       "Tour Guide Rate (Nett) - B&B",
       "900"
      ]
     ]
    }
   ]
  }
 },
 "auas-safari-lodge": {
  "2026": {
   "name": "Auas Safari Lodge",
   "region": "",
   "currency": "N$",
   "validity": "2026",
   "note": "Public rack, capped at 20% above the net STO (house rule: rack is never more than STO + 20%). The supplier states 20% commission, which would gross up to 25.0% above net — the cap applies.",
   "sections": [
    {
     "title": "Rates (per person, per night)",
     "rows": [
      [
       "Standard Room (Sharing pp) - DBB",
       "2,265.60"
      ],
      [
       "Standard Room (Single) - DBB",
       "2,649.60"
      ],
      [
       "Luxury Room (Sharing pp) - DBB",
       "3,000"
      ],
      [
       "Luxury Room (Single) - DBB",
       "3,379.20"
      ],
      [
       "Children (7-12 years) sharing - DBB",
       "1,440"
      ],
      [
       "Children (3-6 years) sharing - DBB",
       "441.60"
      ],
      [
       "Tour Guide Rate (Nett) - DBB",
       "1,800"
      ]
     ]
    }
   ]
  }
 },
 "bahnhof-hotel-aus": {
  "2026": {
   "name": "Bahnhof Hotel Aus",
   "region": "",
   "currency": "N$",
   "validity": "2026",
   "note": "Public rack, capped at 20% above the net STO (house rule: rack is never more than STO + 20%). The supplier states 20% commission, which would gross up to 25.0% above net — the cap applies.",
   "sections": [
    {
     "title": "Rates (per person, per night)",
     "rows": [
      [
       "Double Room (Sharing pp) - B&B",
       "1,137.60"
      ],
      [
       "Single Room - B&B",
       "1,315.20"
      ],
      [
       "Family Room (Sharing pp) - B&B",
       "1,137.60"
      ],
      [
       "Orange House Sharing - Self Catering (Acc Only)",
       "561"
      ],
      [
       "Orange House Single - Self Catering (Acc Only)",
       "1,122"
      ]
     ]
    }
   ]
  }
 },
 "cornerstone-guesthouse": {
  "2026": {
   "name": "Cornerstone Guesthouse",
   "region": "",
   "currency": "N$",
   "validity": "2026",
   "note": "Public rack, capped at 20% above the net STO (house rule: rack is never more than STO + 20%). The supplier states 20% commission, which would gross up to 25.0% above net — the cap applies.",
   "sections": [
    {
     "title": "Rates (per person, per night)",
     "rows": [
      [
       "Double Room (Sharing pp) - B&B",
       "1,214.36"
      ],
      [
       "Single Room - B&B",
       "1,468.72"
      ],
      [
       "Apartment (1-Bedroom, max 2) - RO",
       "2,539.49"
      ],
      [
       "Apartment (2-Bedroom, max 4) - RO",
       "3,815.39"
      ],
      [
       "Apartment (3-Bedroom, max 6) - RO",
       "4,455.38"
      ],
      [
       "Children (4-12 years) sharing - B&B",
       "758.98"
      ]
     ]
    }
   ]
  }
 },
 "epacha-game-lodge-spa": {
  "2026": {
   "name": "Epacha Game Lodge & Spa",
   "region": "",
   "currency": "N$",
   "validity": "2026",
   "note": "Public rack, capped at 20% above the net STO (house rule: rack is never more than STO + 20%). The supplier states 20% commission, which would gross up to 25.0% above net — the cap applies.",
   "sections": [
    {
     "title": "Rates (per person, per night)",
     "rows": [
      [
       "Hemingway Safari Tent (Sharing) - DBB",
       "3,960"
      ],
      [
       "Hemingway Safari Tent (Single) - DBB",
       "5,118"
      ],
      [
       "Family Safari Tent (Sharing) - DBB",
       "3,960"
      ],
      [
       "Epacha Lodge Chalet (Sharing) - DBB",
       "6,072"
      ],
      [
       "Epacha Lodge Chalet (Single) - DBB",
       "7,200"
      ],
      [
       "Children 6-12 sharing (Safari Tents) - DBB",
       "1,974"
      ],
      [
       "Children 6-12 sharing (Lodge Chalet) - DBB",
       "3,030"
      ],
      [
       "Tour Guide Room - DBB",
       "1,584"
      ]
     ]
    }
   ]
  }
 },
 "epupa-falls-lodge": {
  "2026": {
   "name": "Epupa Falls Lodge",
   "region": "",
   "currency": "N$",
   "validity": "2026",
   "note": "Public rack, capped at 20% above the net STO (house rule: rack is never more than STO + 20%). The supplier states 20% commission, which would gross up to 25.0% above net — the cap applies.",
   "sections": [
    {
     "title": "Rates (per person, per night)",
     "rows": [
      [
       "River View Chalet (Sharing pp) - DBB",
       "2,054.40"
      ],
      [
       "River View Chalet (Single) - DBB",
       "2,347.20"
      ],
      [
       "Standard Twin Chalet (Sharing pp) - DBB",
       "1,761.60"
      ],
      [
       "Standard Twin Chalet (Single) - DBB",
       "1,761.60"
      ],
      [
       "Children 3-12 sharing (Standard Chalet) - DBB",
       "780"
      ],
      [
       "Campsite (Per Person) - RO",
       "216"
      ],
      [
       "Tour Guide Room - DBB",
       "1,260"
      ]
     ]
    }
   ]
  }
 },
 "erongo-rocks": {
  "2026": {
   "name": "Erongo Rocks nature & camp",
   "region": "",
   "currency": "N$",
   "validity": "2026",
   "note": "Public rack, capped at 20% above the net STO (house rule: rack is never more than STO + 20%). The supplier states 10% commission, which is within the cap.",
   "sections": [
    {
     "title": "Rates (per person, per night)",
     "rows": [
      [
       "Comfy Camping (Sharing) - RO",
       "944.44"
      ],
      [
       "Comfy Camping (Single) - RO",
       "1,055.56"
      ],
      [
       "Campsite (Self-drive, per person) - RO",
       "427.78"
      ],
      [
       "Children 7-12 sharing - RO",
       "472.22"
      ],
      [
       "Tour Guide Rate (Camping) - RO",
       "213.89"
      ]
     ]
    }
   ]
  }
 },
 "gabus-safari-lodge": {
  "2026": {
   "name": "Gabus Safari Lodge",
   "region": "",
   "currency": "N$",
   "validity": "2026",
   "note": "Public rack, capped at 20% above the net STO (house rule: rack is never more than STO + 20%). The supplier states 20% commission, which would gross up to 25.0% above net — the cap applies.",
   "sections": [
    {
     "title": "Rates (per person, per night)",
     "rows": [
      [
       "Luxury Room (Sharing pp) - DBB",
       "2,965.19"
      ],
      [
       "Luxury Room (Single) - DBB",
       "5,340.94"
      ],
      [
       "Luxury Room (Double per room) - DBB",
       "2,670.47"
      ],
      [
       "Kids 2-6 sharing - DBB",
       "443.11"
      ],
      [
       "Kids 7-11 sharing - DBB",
       "1,396.67"
      ],
      [
       "Tour Guide Room - DBB",
       "900"
      ]
     ]
    }
   ]
  }
 },
 "ghaub": {
  "2026": {
   "name": "Ghaub & Waterberg Wilderness",
   "region": "",
   "currency": "N$",
   "validity": "2026",
   "note": "Public rack, capped at 20% above the net STO (house rule: rack is never more than STO + 20%). The supplier states 20% commission, which would gross up to 25.0% above net — the cap applies.",
   "sections": [
    {
     "title": "Rates (per person, per night)",
     "rows": [
      [
       "Ghaub Double Room (Single/Twin beds) - DBB",
       "3,264"
      ],
      [
       "Ghaub Campsite (Per Person) - RO",
       "504"
      ],
      [
       "Waterberg Plateau Lodge Rock Chalet - DBB",
       "4,176"
      ],
      [
       "Waterberg Wilderness Lodge Double Room - DBB",
       "3,072"
      ],
      [
       "Waterberg Valley Lodge Econo Chalet - DBB",
       "2,160"
      ],
      [
       "Waterberg Plateau Campsite - RO",
       "504"
      ],
      [
       "Tour Guide Room (DBB) - Nett",
       "1,200"
      ]
     ]
    }
   ]
  }
 },
 "hansa-hotel": {
  "2026": {
   "name": "Hansa Hotel Swakopmund",
   "region": "",
   "currency": "N$",
   "validity": "2026",
   "note": "Public rack, capped at 20% above the net STO (house rule: rack is never more than STO + 20%). The supplier states 20% commission, which would gross up to 25.0% above net — the cap applies.",
   "sections": [
    {
     "title": "Rates (per person, per night)",
     "rows": [
      [
       "Single Room - B&B",
       "2,340"
      ],
      [
       "Double Room (Sharing pp) - B&B",
       "1,650"
      ],
      [
       "Double Room (Per Room) - B&B",
       "3,300"
      ],
      [
       "Triple Room - B&B",
       "3,900"
      ],
      [
       "Suite - B&B",
       "4,152"
      ],
      [
       "Children 5-12 sharing - B&B",
       "270"
      ],
      [
       "Children 13-18 sharing - B&B",
       "396"
      ],
      [
       "Tour Guide Room - B&B",
       "1,464"
      ]
     ]
    }
   ]
  }
 },
 "hohewarte-guestfarm": {
  "2026": {
   "name": "Hohewarte Guestfarm",
   "region": "",
   "currency": "N$",
   "validity": "2026",
   "note": "Public rack, capped at 20% above the net STO (house rule: rack is never more than STO + 20%). The supplier states 20% commission, which would gross up to 25.0% above net — the cap applies.",
   "sections": [
    {
     "title": "Rates (per person, per night)",
     "rows": [
      [
       "Double Room (Sharing pp) - DBB",
       "1,920"
      ],
      [
       "Single Room - DBB",
       "2,400"
      ],
      [
       "Child u12 sharing - DBB",
       "960"
      ],
      [
       "Tour Guide Room - DBB",
       "1,200"
      ]
     ]
    }
   ]
  }
 },
 "hotel-thule": {
  "2026": {
   "name": "Hotel Thule",
   "region": "",
   "currency": "N$",
   "validity": "2026",
   "note": "Public rack, capped at 20% above the net STO (house rule: rack is never more than STO + 20%). The supplier states 15% commission, which is within the cap.",
   "sections": [
    {
     "title": "Rates (per person, per night)",
     "rows": [
      [
       "Double Room (Sharing pp) - B&B",
       "1,940"
      ],
      [
       "Single Room - B&B",
       "1,940"
      ],
      [
       "Double Room (Per Room) - B&B",
       "3,880"
      ],
      [
       "Children 3-12 sharing - B&B",
       "735.29"
      ],
      [
       "Tour Guide Room - B&B",
       "1,235.29"
      ]
     ]
    }
   ]
  }
 },
 "kalahari-game-lodge": {
  "2026": {
   "name": "Kalahari Game Lodge",
   "region": "",
   "currency": "N$",
   "validity": "2026",
   "note": "Public rack, capped at 20% above the net STO (house rule: rack is never more than STO + 20%). The supplier states 20% commission, which would gross up to 25.0% above net — the cap applies.",
   "sections": [
    {
     "title": "Rates (per person, per night)",
     "rows": [
      [
       "Chalet (Sharing pp) - DBB",
       "2,322"
      ],
      [
       "Chalet (Single) - DBB",
       "4,022.40"
      ],
      [
       "Campsite (Per Person) - RO",
       "453.60"
      ],
      [
       "Kids 4-9 sharing - DBB",
       "1,173"
      ],
      [
       "Tour Guide Room (2nd) - DBB",
       "840"
      ]
     ]
    }
   ]
  }
 },
 "waldeck-lodge": {
  "2026": {
   "name": "Waldeck Lodge",
   "region": "",
   "currency": "N$",
   "validity": "2026",
   "note": "Public rack, capped at 20% above the net STO (house rule: rack is never more than STO + 20%). The supplier states 25% commission, which would gross up to 33.3% above net — the cap applies.",
   "sections": [
    {
     "title": "Rates (per person, per night)",
     "rows": [
      [
       "Per Person Rate (1 - 6 guests) - Full Inclusive",
       "29,700"
      ],
      [
       "Per Person Rate (7 - 16 guests) - Full Inclusive",
       "24,750"
      ]
     ]
    }
   ]
  }
 },
 "kaoko-mopane-lodge": {
  "2026": {
   "name": "Kaoko Mopane Lodge & Camping",
   "region": "",
   "currency": "N$",
   "validity": "2026",
   "note": "Public rack, capped at 20% above the net STO (house rule: rack is never more than STO + 20%). The supplier states 15% commission, which is within the cap.",
   "sections": [
    {
     "title": "Rates (per person, per night)",
     "rows": [
      [
       "Luxury Room — Single",
       "2,650"
      ],
      [
       "Luxury Room — Double/Twin (pp sharing)",
       "2,260"
      ],
      [
       "Child 4–12 yrs (sharing with adults)",
       "950"
      ],
      [
       "Tour Guide (per guide)",
       "1,352.94"
      ],
      [
       "Luxury Room — Single",
       "2,200"
      ],
      [
       "Luxury Room — Double/Twin (pp sharing)",
       "1,780"
      ],
      [
       "Child 4–12 yrs",
       "600"
      ],
      [
       "Tour Guide",
       "1,058.82"
      ],
      [
       "Per Person",
       "300"
      ],
      [
       "Child 4–12 yrs",
       "150"
      ],
      [
       "Overlander (10+ pax)",
       "250"
      ]
     ]
    }
   ]
  }
 },
 "nooishof": {
  "2026": {
   "name": "Nooishof",
   "region": "",
   "currency": "N$",
   "validity": "2026",
   "note": "Public rack, capped at 20% above the net STO (house rule: rack is never more than STO + 20%). The supplier states 25% commission, which would gross up to 33.3% above net — the cap applies.",
   "sections": [
    {
     "title": "Rates (per person, per night)",
     "rows": [
      [
       "Adult (per person per night)",
       "7,290"
      ],
      [
       "Child 4–15 yrs (per night)",
       "3,645"
      ],
      [
       "Guide (per night, nett)",
       "3,000"
      ]
     ]
    }
   ]
  }
 },
 "droombos-estate": {
  "2026": {
   "name": "Droombos Estate & Simanya River Lodge",
   "region": "",
   "currency": "N$",
   "validity": "2026",
   "note": "Public rack, capped at 20% above the net STO (house rule: rack is never more than STO + 20%). The supplier states 20% commission, which would gross up to 25.0% above net — the cap applies.",
   "sections": [
    {
     "title": "Rates (per person, per night)",
     "rows": [
      [
       "Droombos Distinctive Room (Sharing) - B&B (Low Season)",
       "5,338.80"
      ],
      [
       "Droombos Distinctive Room (Sharing) - B&B (High Season)",
       "5,872.80"
      ],
      [
       "Droombos Distinctive Room (Single) - B&B (Low Season)",
       "6,145.20"
      ],
      [
       "Droombos Distinctive Room (Single) - B&B (High Season)",
       "6,759.60"
      ],
      [
       "Droombos Luxury Room (Sharing) - B&B (Low Season)",
       "3,310.80"
      ],
      [
       "Droombos Luxury Room (Sharing) - B&B (High Season)",
       "3,642"
      ],
      [
       "Droombos Luxury Room (Single) - B&B (Low Season)",
       "3,775.20"
      ],
      [
       "Droombos Luxury Room (Single) - B&B (High Season)",
       "4,153.20"
      ],
      [
       "Droombos Standard Room (Sharing) - B&B (Low Season)",
       "1,626"
      ],
      [
       "Droombos Standard Room (Sharing) - B&B (High Season)",
       "1,789.20"
      ],
      [
       "Droombos Standard Room (Single) - B&B (Low Season)",
       "1,858.80"
      ],
      [
       "Droombos Standard Room (Single) - B&B (High Season)",
       "2,044.80"
      ],
      [
       "Droombos Vineyard Glamping (Sharing) - B&B (Low Season)",
       "840"
      ],
      [
       "Droombos Vineyard Glamping (Sharing) - B&B (High Season)",
       "1,056"
      ],
      [
       "Droombos Campsite (Sharing) - RO (Low Season)",
       "480"
      ],
      [
       "Droombos Campsite (Sharing) - RO (High Season)",
       "576"
      ],
      [
       "Simanya Standard Chalet (Sharing) - DBB (Low Season)",
       "3,484.80"
      ],
      [
       "Simanya Standard Chalet (Sharing) - DBB (High Season)",
       "3,659.04"
      ],
      [
       "Simanya Standard Chalet (Single) - DBB (Low Season)",
       "4,207.10"
      ],
      [
       "Simanya Standard Chalet (Single) - DBB (High Season)",
       "4,417.46"
      ],
      [
       "Simanya Luxury Chalet (Sharing) - DBB (Low Season)",
       "5,385.60"
      ],
      [
       "Simanya Luxury Chalet (Sharing) - DBB (High Season)",
       "5,654.88"
      ],
      [
       "Simanya Luxury Chalet (Single) - DBB (Low Season)",
       "6,230.40"
      ],
      [
       "Simanya Luxury Chalet (Single) - DBB (High Season)",
       "6,541.92"
      ],
      [
       "Simanya Campsite (Sharing) - RO (Low Season)",
       "420"
      ],
      [
       "Simanya Campsite (Sharing) - RO (High Season)",
       "504"
      ],
      [
       "Tour Guide Room (Droombos) - B&B (Low Season)",
       "1,440"
      ],
      [
       "Tour Guide Room (Droombos) - B&B (High Season)",
       "1,440"
      ],
      [
       "Tour Guide Room (Simanya) - DBB (Low Season)",
       "1,332"
      ],
      [
       "Tour Guide Room (Simanya) - DBB (High Season)",
       "1,332"
      ]
     ]
    }
   ]
  }
 },
 "emanya-at-etosha": {
  "2026": {
   "name": "Emanya at Etosha",
   "region": "",
   "currency": "N$",
   "validity": "2026",
   "note": "Public rack, capped at 20% above the net STO (house rule: rack is never more than STO + 20%). The supplier states 25% commission, which would gross up to 33.3% above net — the cap applies.",
   "sections": [
    {
     "title": "Rates (per person, per night)",
     "rows": [
      [
       "Standard Chalet (Sharing) - B&B (Low Season)",
       "1,773"
      ],
      [
       "Standard Chalet (Sharing) - B&B (High Season)",
       "2,250"
      ],
      [
       "Standard Chalet (Single) - B&B (Low Season)",
       "2,790"
      ],
      [
       "Standard Chalet (Single) - B&B (High Season)",
       "3,600"
      ],
      [
       "Standard Chalet (Sharing) - DBB (Low Season)",
       "2,227.50"
      ],
      [
       "Standard Chalet (Sharing) - DBB (High Season)",
       "2,709"
      ],
      [
       "Standard Chalet (Single) - DBB (Low Season)",
       "3,564"
      ],
      [
       "Standard Chalet (Single) - DBB (High Season)",
       "3,852"
      ],
      [
       "Children 4-11 sharing - B&B (Low Season)",
       "1,053"
      ],
      [
       "Children 4-11 sharing - B&B (High Season)",
       "1,350"
      ],
      [
       "Children 4-11 sharing - DBB (Low Season)",
       "1,336.50"
      ],
      [
       "Children 4-11 sharing - DBB (High Season)",
       "1,620"
      ],
      [
       "Tour Guide Room - DBB (Low Season)",
       "1,056"
      ],
      [
       "Tour Guide Room - DBB (High Season)",
       "1,056"
      ]
     ]
    }
   ]
  }
 },
 "namib-guesthouse": {
  "2026": {
   "name": "Namib Guesthouse",
   "region": "",
   "currency": "N$",
   "validity": "2026",
   "note": "Public rack, capped at 20% above the net STO (house rule: rack is never more than STO + 20%). The supplier states 20% commission, which would gross up to 25.0% above net — the cap applies.",
   "sections": [
    {
     "title": "Rates (per person, per night)",
     "rows": [
      [
       "Single Room (Low Season)",
       "1,344"
      ],
      [
       "Single Room (High Season)",
       "1,728"
      ],
      [
       "Luxury Single Room (Low Season)",
       "1,536"
      ],
      [
       "Luxury Single Room (High Season)",
       "1,920"
      ],
      [
       "Double Room (pp sharing) (Low Season)",
       "1,248"
      ],
      [
       "Double Room (pp sharing) (High Season)",
       "1,392"
      ],
      [
       "Luxury Double (pp sharing) (Low Season)",
       "1,392"
      ],
      [
       "Luxury Double (pp sharing) (High Season)",
       "1,632"
      ],
      [
       "Family Suite (pp sharing) (Low Season)",
       "1,392"
      ],
      [
       "Family Suite (pp sharing) (High Season)",
       "1,632"
      ],
      [
       "Child 7–12 yrs (per child) (Low Season)",
       "720"
      ],
      [
       "Child 7–12 yrs (per child) (High Season)",
       "720"
      ],
      [
       "Tour Guide (Low Season)",
       "840"
      ],
      [
       "Tour Guide (High Season)",
       "840"
      ]
     ]
    }
   ]
  }
 },
 "alte-villa-2025": {
  "2026": {
   "name": "Alte Villa",
   "region": "",
   "currency": "N$",
   "validity": "2026",
   "note": "Public rack, capped at 20% above the net STO (house rule: rack is never more than STO + 20%). The supplier states 15% commission, which is within the cap.",
   "sections": [
    {
     "title": "Double Rooms (per room / night)",
     "rows": [
      [
       "Kolmanskoppe — 1 adult",
       "2,462.06"
      ],
      [
       "Kolmanskoppe — 2 adults",
       "3,978"
      ],
      [
       "Garub — 1 adult (private lounge shared w/ Grasplatz)",
       "2,462.06"
      ],
      [
       "Garub — 2 adults",
       "3,978"
      ],
      [
       "Grasplatz — 1 adult (private lounge shared w/ Garub)",
       "2,462.06"
      ],
      [
       "Grasplatz — 2 adults",
       "3,978"
      ]
     ]
    },
    {
     "title": "Family / Studio Rooms (sleeps up to 4)",
     "rows": [
      [
       "Bogenfels Studio — 1 adult",
       "2,462.06"
      ],
      [
       "Bogenfels Studio — 2 adults",
       "3,978"
      ],
      [
       "Bogenfels Studio — 3 adults",
       "5,967"
      ],
      [
       "Bogenfels — +1 child &amp;lt;12 (with 2 adults)",
       "1,082.35"
      ],
      [
       "Bogenfels — +2 children &amp;lt;12 (with 2 adults)",
       "2,164.71"
      ],
      [
       "Tsiras Mountains (private terrace) — 1 adult",
       "2,462.06"
      ],
      [
       "Tsiras Mountains — 2 adults",
       "3,978"
      ],
      [
       "Tsiras Mountains — +1 child &amp;lt;12",
       "1,082.35"
      ],
      [
       "Tsiras Mountains — +2 children &amp;lt;12",
       "2,164.71"
      ]
     ]
    },
    {
     "title": "Apartments (self-catering option)",
     "rows": [
      [
       "Itchaboe Apartment — 1 adult",
       "2,462.06"
      ],
      [
       "Itchaboe Apartment — 2 adults",
       "3,978"
      ],
      [
       "Itchaboe — 3 adults",
       "5,967"
      ],
      [
       "Itchaboe — 4 adults",
       "7,955.29"
      ],
      [
       "Itchaboe — +1 child &amp;lt;12",
       "1,082.35"
      ],
      [
       "Itchaboe — +2 children &amp;lt;12",
       "2,164.71"
      ],
      [
       "Loft — 1 adult",
       "2,462.06"
      ],
      [
       "Loft — 2 adults",
       "3,978"
      ],
      [
       "Loft — +1 child &amp;lt;12",
       "1,082.35"
      ],
      [
       "Loft — +2 children &amp;lt;12",
       "2,164.71"
      ],
      [
       "Charlottental — 1 adult",
       "2,462.06"
      ],
      [
       "Charlottental — 2 adults",
       "3,978"
      ],
      [
       "Charlottental — 3 adults",
       "5,967"
      ],
      [
       "Charlottental — 4 adults",
       "7,955.29"
      ],
      [
       "Märchental — 1 adult",
       "2,462.06"
      ],
      [
       "Märchental — 2 adults",
       "3,978"
      ]
     ]
    }
   ]
  }
 },
 "barkhan-dune-retreat": {
  "2026": {
   "name": "Barkhan Dune Retreat",
   "region": "",
   "currency": "N$",
   "validity": "2026",
   "note": "Public rack, capped at 20% above the net STO (house rule: rack is never more than STO + 20%). The supplier states 20% commission, which would gross up to 25.0% above net — the cap applies.",
   "sections": [
    {
     "title": "Dune Chalet — Full Board (per person, per night)",
     "rows": [
      [
       "Sharing — STO 1 (1 night)",
       "4,182"
      ],
      [
       "Sharing — STO 2 (2+ nights)",
       "3,936"
      ],
      [
       "Child 2–10 yrs (PCPN) — STO 1",
       "2,091.60"
      ],
      [
       "Child 2–10 yrs (PCPN) — STO 2",
       "1,968"
      ],
      [
       "Single — STO 1",
       "5,437.20"
      ],
      [
       "Single — STO 2",
       "5,116.80"
      ]
     ]
    },
    {
     "title": "Dune Chalet — Dinner, Bed &amp; Breakfast",
     "rows": [
      [
       "Sharing — STO 1",
       "2,781.60"
      ],
      [
       "Sharing — STO 2",
       "2,618.40"
      ],
      [
       "Child 2–10 yrs — STO 1",
       "1,390.80"
      ],
      [
       "Child 2–10 yrs — STO 2",
       "1,309.20"
      ],
      [
       "Single — STO 1",
       "3,615.60"
      ],
      [
       "Single — STO 2",
       "3,403.20"
      ],
      [
       "Guide (DBB) — rack rate",
       "1,644"
      ]
     ]
    },
    {
     "title": "Okanti House &amp; Rustic Cabin — Self-Catering",
     "rows": [
      [
       "Sharing — STO 1",
       "1,398"
      ],
      [
       "Sharing — STO 2",
       "1,315.20"
      ],
      [
       "Child 2–10 yrs — STO 1",
       "698.40"
      ],
      [
       "Child 2–10 yrs — STO 2",
       "657.60"
      ],
      [
       "Single — STO 1",
       "1,816.80"
      ],
      [
       "Single — STO 2",
       "1,710"
      ]
     ]
    },
    {
     "title": "Exclusive Kuangukuangu (bed only)",
     "rows": [
      [
       "Self-Catering Sharing — STO 1",
       "3,636"
      ],
      [
       "Self-Catering Sharing — STO 2",
       "3,422.40"
      ],
      [
       "Single Self-Catering — STO 1",
       "4,726.80"
      ],
      [
       "Single Self-Catering — STO 2",
       "4,449.60"
      ]
     ]
    },
    {
     "title": "Activities (per person)",
     "rows": [
      [
       "Sundowner DriveIncl. water, beer/soda &amp; light snacks",
       "792"
      ],
      [
       "Guided Hike to Ubib Grotto (≈4h)Prehistoric rock paintings · min 3 / max 8 pax · incl. water, beer/soda",
       "792"
      ],
      [
       "Guided Klipspringer Mountain Summit Hike (≈4h)Incl. water, beer/soda &amp; light snacks",
       "792"
      ],
      [
       "Self-Guided E-Bike Kudu Trail Picnic (≈2h)Incl. e-bike rental, water, beer/soda &amp; light snacks",
       "792"
      ],
      [
       "E-Bike Rental (2 hours)",
       "726"
      ]
     ]
    },
    {
     "title": "Meals — for self-catering guests (per person)",
     "rows": [
      [
       "Breakfast",
       "270"
      ],
      [
       "Lunch",
       "414"
      ],
      [
       "Dinner",
       "678"
      ],
      [
       "Lunch pack (to take on excursions)",
       "223.20"
      ],
      [
       "Tea time cake &amp; coffee @ 16:00",
       "138"
      ]
     ]
    },
    {
     "title": "Other",
     "rows": [
      [
       "Laundry — per 6kg load",
       "318"
      ]
     ]
    }
   ]
  }
 },
 "belvedere-boutique-hotel": {
  "2026": {
   "name": "Belvedere Boutique Hotel",
   "region": "",
   "currency": "N$",
   "validity": "2026",
   "note": "Public rack, capped at 20% above the net STO (house rule: rack is never more than STO + 20%). The supplier states 15% commission, which is within the cap.",
   "sections": [
    {
     "title": "Room Rates — STO (per room, per night)",
     "rows": [
      [
       "Standard Room — Single (12 rooms available)",
       "2,570.59"
      ],
      [
       "Standard Room — Double",
       "3,565.88"
      ],
      [
       "Family Room — Single (1 room)",
       "2,627.06"
      ],
      [
       "Family Room — Double",
       "3,692.94"
      ],
      [
       "Luxury Room — Single (4 rooms)",
       "2,970.59"
      ],
      [
       "Luxury Room — Double",
       "4,022.35"
      ],
      [
       "Luxury Twin — Single (1 room)",
       "2,970.59"
      ],
      [
       "Luxury Twin — Double",
       "4,022.35"
      ],
      [
       "Penthouse — Single (1 room)",
       "3,265.88"
      ],
      [
       "Penthouse — Double",
       "4,430.59"
      ]
     ]
    },
    {
     "title": "Family Room — Child Rates (sharing)",
     "rows": [
      [
       "Extra child (10–12 yrs)",
       "588.24"
      ]
     ]
    }
   ]
  }
 },
 "flamingo-villa-boutique-hotel": {
  "2026": {
   "name": "Flamingo Villas Boutique Hotel",
   "region": "",
   "currency": "N$",
   "validity": "2026",
   "note": "Public rack, capped at 20% above the net STO (house rule: rack is never more than STO + 20%). The supplier states 20% commission, which would gross up to 25.0% above net — the cap applies.",
   "sections": [
    {
     "title": "Comfort Double / Twin Room — B&amp;B (per room)",
     "rows": [
      [
       "Single per room",
       "2,980.80"
      ],
      [
       "Double per room",
       "3,974.40"
      ],
      [
       "Children 7–12 yrs sharing",
       "1,490.88"
      ]
     ]
    },
    {
     "title": "Superior Double Room with Balcony — B&amp;B (per room)",
     "rows": [
      [
       "Single per room",
       "3,672"
      ],
      [
       "Double per room",
       "5,269.44"
      ],
      [
       "Children 7–12 yrs sharing",
       "1,772.16"
      ]
     ]
    },
    {
     "title": "Deluxe Double Room with Balcony — B&amp;B (per room)",
     "rows": [
      [
       "Single per room",
       "4,141.44"
      ],
      [
       "Double per room",
       "6,172.80"
      ],
      [
       "Children 7–12 yrs sharing",
       "1,808.64"
      ]
     ]
    },
    {
     "title": "Flamingo Suite with Balcony — B&amp;B (per room)",
     "rows": [
      [
       "Single per room",
       "5,608.32"
      ],
      [
       "Double per room",
       "6,642.24"
      ],
      [
       "Children 7–12 yrs sharing",
       "1,957.44"
      ]
     ]
    }
   ]
  }
 },
 "heinitzburg-boutique-hotel": {
  "2026": {
   "name": "Hotel Heinitzburg",
   "region": "",
   "currency": "N$",
   "validity": "2026",
   "note": "Public rack, capped at 20% above the net STO (house rule: rack is never more than STO + 20%). The supplier states 20% commission, which would gross up to 25.0% above net — the cap applies.",
   "sections": [
    {
     "title": "Single Rooms — B&amp;B (per room)",
     "rows": [
      [
       "Single Standard Deluxe Room",
       "3,010.18"
      ],
      [
       "Single Comfort Deluxe Room",
       "3,311.98"
      ],
      [
       "Single Superior Deluxe Room",
       "3,596.20"
      ]
     ]
    },
    {
     "title": "Twin / Double — B&amp;B (per room)",
     "rows": [
      [
       "Twin Standard Deluxe Room",
       "4,449.83"
      ],
      [
       "Twin Comfort Deluxe Room",
       "4,981.15"
      ],
      [
       "Double Superior Deluxe Room",
       "5,685.35"
      ],
      [
       "Triple Comfort Deluxe Room",
       "5,685.35"
      ]
     ]
    },
    {
     "title": "Family — B&amp;B (per room)",
     "rows": [
      [
       "Family Room (2 adults + 2 children, 2 rooms / 2 bathrooms, interleading)",
       "8,280.42"
      ]
     ]
    }
   ]
  }
 },
 "kamaku-guesthouse": {
  "2026": {
   "name": "Kamaku Guesthouse",
   "region": "",
   "currency": "N$",
   "validity": "2026",
   "note": "Public rack, capped at 20% above the net STO (house rule: rack is never more than STO + 20%). The supplier states 15% commission, which is within the cap.",
   "sections": [
    {
     "title": "Rooms — B&amp;B",
     "rows": [
      [
       "Per Double Unit",
       "1,150"
      ],
      [
       "Per Single Unit",
       "900"
      ],
      [
       "Family Unit per person",
       "575"
      ]
     ]
    }
   ]
  }
 },
 "little-sossus-lodge": {
  "2026": {
   "name": "Little Sossus Lodge &amp; Campsite",
   "region": "",
   "currency": "N$",
   "validity": "2026",
   "note": "Public rack, capped at 20% above the net STO (house rule: rack is never more than STO + 20%). The supplier states 20% commission, which would gross up to 25.0% above net — the cap applies.",
   "sections": [
    {
     "title": "Chalet (DBB, per room per night)",
     "rows": [
      [
       "Single room",
       "4,320"
      ],
      [
       "Double / Twin room",
       "6,528"
      ],
      [
       "3-bed room (max 2 adults)",
       "7,632"
      ],
      [
       "4-bed room (max 2 adults)",
       "8,736"
      ],
      [
       "Additional Tour Guide / Driver",
       "2,100"
      ]
     ]
    },
    {
     "title": "Camping (self-catering, per site + per person)",
     "rows": [
      [
       "Campsite per night",
       "285.60"
      ],
      [
       "Per person per night",
       "265.20"
      ],
      [
       "Per child (5–11 yrs) per night",
       "178.50"
      ]
     ]
    },
    {
     "title": "Meals (per person — incl. VAT)",
     "rows": [
      [
       "Lunch pack",
       "396"
      ],
      [
       "Lunch",
       "420"
      ],
      [
       "Breakfast",
       "456"
      ],
      [
       "Breakfast — child 5–11 yrs",
       "360"
      ],
      [
       "Dinner",
       "660"
      ],
      [
       "Dinner — child 5–11 yrs",
       "540"
      ]
     ]
    },
    {
     "title": "Activities (per person)",
     "rows": [
      [
       "Guided Sossusvlei Trip (min 2 paying, child 5–11 yrs 50%)",
       "3,600"
      ],
      [
       "Sundowner Drive (min 2 pax, child 5–11 yrs 50%)",
       "2,220"
      ]
     ]
    }
   ]
  }
 },
 "luderitz-nest-hotel": {
  "2026": {
   "name": "Lüderitz Nest Hotel",
   "region": "",
   "currency": "N$",
   "validity": "2026",
   "note": "Public rack, capped at 20% above the net STO (house rule: rack is never more than STO + 20%). The supplier states 15% commission, which is within the cap.",
   "sections": [
    {
     "title": "Comfort Rooms — B&amp;B (per room — gross)",
     "rows": [
      [
       "Comfort Single",
       "2,960"
      ],
      [
       "Comfort Twin / Double",
       "4,760"
      ],
      [
       "Comfort Family Room (max 2 adults + 2 children 0–12)",
       "7,720"
      ]
     ]
    },
    {
     "title": "Deluxe Rooms &amp; Suite — B&amp;B (per room — gross)",
     "rows": [
      [
       "Deluxe Single",
       "3,630"
      ],
      [
       "Deluxe Twin / Double",
       "5,810"
      ],
      [
       "Suite",
       "9,650"
      ],
      [
       "Tour Guide (50% of single rack)",
       "1,741.18"
      ]
     ]
    },
    {
     "title": "Meals (per person — gross)",
     "rows": [
      [
       "Breakfast — adult",
       "400"
      ],
      [
       "Breakfast — child 3–12 yrs",
       "282.35"
      ],
      [
       "Lunch — adult",
       "600"
      ],
      [
       "Lunch — child 3–12 yrs",
       "423.53"
      ],
      [
       "Dinner — adult",
       "776.47"
      ],
      [
       "Dinner — child 3–12 yrs",
       "552.94"
      ],
      [
       "Lunchpack",
       "376.47"
      ]
     ]
    }
   ]
  }
 },
 "moon-mountain-lodge": {
  "2026": {
   "name": "Moon Mountain Lodge",
   "region": "",
   "currency": "N$",
   "validity": "2026",
   "note": "Public rack, capped at 20% above the net STO (house rule: rack is never more than STO + 20%). The supplier states 20% commission, which would gross up to 25.0% above net — the cap applies.",
   "sections": [
    {
     "title": "Luxury Rooms (×11) — DBB",
     "rows": [
      [
       "Single Room",
       "3,822"
      ],
      [
       "Double Room (per person)",
       "3,483"
      ]
     ]
    },
    {
     "title": "Executive Suites (×6) — DBB",
     "rows": [
      [
       "Single Room",
       "4,214.00"
      ],
      [
       "Double Room (per person)",
       "3,843"
      ],
      [
       "Child under 12 sharing with parents",
       "1,922.00"
      ]
     ]
    },
    {
     "title": "Guide Rates (nett)",
     "rows": [
      [
       "Guide DBB — 1 to 9 pax",
       "1,214.40"
      ],
      [
       "Guide DBB — 10 to 19 pax",
       "607.20"
      ]
     ]
    },
    {
     "title": "Activities &amp; Extras (nett)",
     "rows": [
      [
       "Lunch pack (pp)",
       "283.20"
      ],
      [
       "Lunch — 3-course menu, 2 choices",
       "484.80"
      ],
      [
       "Guided Sossusvlei Excursion (pp)",
       "3,326.40"
      ],
      [
       "Mountain Sunset at view point (drinks &amp; snacks incl.)",
       "315.60"
      ],
      [
       "Namib-Naukluft Airstrip transfer (one way, pp)",
       "324"
      ]
     ]
    }
   ]
  }
 },
 "ohorongo-game-and-safari-lodge": {
  "2026": {
   "name": "Ohorongo Game &amp; Safari Lodge",
   "region": "",
   "currency": "N$",
   "validity": "2026",
   "note": "Public rack, capped at 20% above the net STO (house rule: rack is never more than STO + 20%). The supplier states 20% commission, which would gross up to 25.0% above net — the cap applies.",
   "sections": [
    {
     "title": "Ohorongo Safari Lodge — Low Season (DBB pp)",
     "rows": [
      [
       "Double Room",
       "3,600"
      ],
      [
       "Triple Room (pp)",
       "3,253.20"
      ],
      [
       "Child 6–11 yrs sharing with full-paying adults",
       "1,800"
      ]
     ]
    },
    {
     "title": "Ohorongo Safari Lodge — High Season (DBB pp)",
     "rows": [
      [
       "Double Room",
       "4,298.40"
      ],
      [
       "Triple Room (pp)",
       "3,950.40"
      ],
      [
       "Child 6–11 yrs sharing with full-paying adults",
       "2,149.20"
      ]
     ]
    },
    {
     "title": "Ohorongo Tented Camp — Low Season (FI pp, min 2-night stay)",
     "rows": [
      [
       "Double Room — Fully Inclusive",
       "8,596.80"
      ],
      [
       "Child 6–11 yrs sharing with full-paying adults",
       "4,298.40"
      ]
     ]
    },
    {
     "title": "Ohorongo Tented Camp — High Season (FI pp, min 2-night stay)",
     "rows": [
      [
       "Double Room — Fully Inclusive",
       "10,339.20"
      ],
      [
       "Child 6–11 yrs sharing with full-paying adults",
       "5,169.60"
      ]
     ]
    },
    {
     "title": "Activities (per person, gross)",
     "rows": [
      [
       "Nature Excursion 3–4 hr (min 2, max 6)",
       "1,020"
      ],
      [
       "Nature Excursion 2 hr (min 2, max 6)",
       "510"
      ],
      [
       "Night Drive 2 hr (min 2, max 6)",
       "720"
      ],
      [
       "Rhino Tracking 3–4 hr (no children u/12)",
       "2,376"
      ],
      [
       "Guided Nature Walk 2 hr (max 4)",
       "510"
      ],
      [
       "Private Vehicle &amp; Guide (4 hr, max 5)",
       "8,100"
      ]
     ]
    },
    {
     "title": "Wilderness Feasts &amp; Meals (per person)",
     "rows": [
      [
       "Light Lunch (12:00–14:00)",
       "420"
      ],
      [
       "Brunch in Nature (min 2 guests)",
       "510"
      ],
      [
       "Dinner under the Stars (min 2 guests)",
       "792"
      ]
     ]
    }
   ]
  }
 },
 "the-olive-exclusive": {
  "2026": {
   "name": "The Olive Exclusive",
   "region": "",
   "currency": "N$",
   "validity": "2026",
   "note": "Public rack, capped at 20% above the net STO (house rule: rack is never more than STO + 20%). The supplier states 15% commission, which is within the cap.",
   "sections": [
    {
     "title": "Jan – Jun 2026 (Low Season) — B&amp;B",
     "rows": [
      [
       "Junior Suite — pp sharing",
       "5,344.71"
      ],
      [
       "Premier Suite — pp sharing",
       "6,682.35"
      ],
      [
       "Junior Suite — single",
       "6,021.18"
      ],
      [
       "Premier Suite — single",
       "7,555.29"
      ]
     ]
    },
    {
     "title": "Jul – Dec 2026 (High Season) — B&amp;B",
     "rows": [
      [
       "Junior Suite — pp sharing",
       "5,780"
      ],
      [
       "Premier Suite — pp sharing",
       "7,234.12"
      ],
      [
       "Junior Suite — single",
       "6,516.47"
      ],
      [
       "Premier Suite — single",
       "8,174.12"
      ]
     ]
    }
   ]
  }
 },
 "opuwo-country-lodge": {
  "2026": {
   "name": "Opuwo Country Lodge",
   "region": "",
   "currency": "N$",
   "validity": "2026",
   "note": "Public rack, capped at 20% above the net STO (house rule: rack is never more than STO + 20%). The supplier states 15% commission, which is within the cap.",
   "sections": [
    {
     "title": "Rooms — B&amp;B (STO gross)",
     "rows": [
      [
       "Luxury Room — pp sharing",
       "2,200"
      ],
      [
       "Luxury Room — single",
       "3,300"
      ],
      [
       "Standard Room — pp sharing",
       "1,595"
      ],
      [
       "Standard Room — single",
       "2,200"
      ],
      [
       "1st Tour Guide (≤7 clients)",
       "1,552.94"
      ],
      [
       "2nd Tour Guide",
       "1,552.94"
      ]
     ]
    },
    {
     "title": "Camping — Self-catering",
     "rows": [
      [
       "Adult per person",
       "388.24"
      ],
      [
       "Child 5–11 yrs",
       "194.12"
      ]
     ]
    },
    {
     "title": "Meals (per person — rack)",
     "rows": [
      [
       "Breakfast",
       "464.71"
      ],
      [
       "Lunch (3-course set menu)",
       "652.94"
      ],
      [
       "Dinner (4-course set menu)",
       "811.76"
      ],
      [
       "Lunch Pack",
       "435.29"
      ]
     ]
    },
    {
     "title": "Activities (per person — rack)",
     "rows": [
      [
       "Desert Elephant Excursion (min 2)",
       "2,529.41"
      ],
      [
       "Fly-in Excursion (incl. lunch &amp; Himba)",
       "2,305.88"
      ],
      [
       "Himba Excursion",
       "1,411.76"
      ],
      [
       "Wine Tasting Flight (min 2 max 6)",
       "1,411.76"
      ],
      [
       "Epupa Falls Excursion (per guide)",
       "4,464.71"
      ],
      [
       "Epupa Falls Excursion (per guest, min 2)",
       "1,041.18"
      ],
      [
       "Ruacana Falls Excursion (per guide)",
       "4,464.71"
      ],
      [
       "Ruacana Falls Excursion (per guest, min 2)",
       "1,041.18"
      ],
      [
       "Airstrip Transfer (two-way pp)",
       "517.65"
      ]
     ]
    }
   ]
  }
 },
 "organic-stay": {
  "2026": {
   "name": "Organic Stay",
   "region": "",
   "currency": "N$",
   "validity": "2026/2027",
   "note": "Public rack, capped at 20% above the net STO (house rule: rack is never more than STO + 20%). The supplier states 20% commission, which would gross up to 25.0% above net — the cap applies.",
   "sections": [
    {
     "title": "Rooms — B&amp;B",
     "rows": [
      [
       "Single",
       "2,196"
      ],
      [
       "Double",
       "3,504"
      ],
      [
       "Triple",
       "4,500"
      ],
      [
       "Family Standard",
       "5,100"
      ],
      [
       "2-Bedroom Family",
       "6,600"
      ]
     ]
    },
    {
     "title": "Child Policy",
     "rows": [
      [
       "Children 5–10 years",
       "828"
      ]
     ]
    }
   ]
  }
 },
 "oyster-box-guesthouse": {
  "2026": {
   "name": "Oyster Box Guesthouse",
   "region": "",
   "currency": "N$",
   "validity": "2026",
   "note": "Public rack, capped at 20% above the net STO (house rule: rack is never more than STO + 20%). The supplier states 20% commission, which would gross up to 25.0% above net — the cap applies.",
   "sections": [
    {
     "title": "Single Rooms — B&amp;B (per room)",
     "rows": [
      [
       "Single Room Standard",
       "1,396.68"
      ],
      [
       "Single Room, Partial-Sea Facing",
       "1,631.08"
      ],
      [
       "Single Comfort Room, Partial-Sea Facing",
       "1,802.00"
      ]
     ]
    },
    {
     "title": "Twin / Double — B&amp;B (per room)",
     "rows": [
      [
       "Twin Room Standard",
       "2,236.63"
      ],
      [
       "Twin Room, Partial-Sea Facing",
       "2,568.71"
      ],
      [
       "Double Comfort Room, Partial-Sea Facing",
       "2,812.88"
      ]
     ]
    },
    {
     "title": "Triple — B&amp;B (per room)",
     "rows": [
      [
       "Triple Room Standard",
       "2,812.88"
      ],
      [
       "Triple Room, Partial-Sea Facing",
       "3,237.74"
      ],
      [
       "Triple Comfort Room, Partial-Sea Facing",
       "3,467.27"
      ]
     ]
    }
   ]
  }
 },
 "rostock-ritz-desert-lodge": {
  "2026": {
   "name": "Rostock Ritz Desert Lodge",
   "region": "",
   "currency": "N$",
   "validity": "2026",
   "note": "Public rack, capped at 20% above the net STO (house rule: rack is never more than STO + 20%). The supplier states 20% commission, which would gross up to 25.0% above net — the cap applies.",
   "sections": [
    {
     "title": "Suites — B&amp;B",
     "rows": [
      [
       "Suite — Double/Twin (2 pax sharing)",
       "6,240"
      ],
      [
       "Suite — Single",
       "4,992"
      ],
      [
       "Children 3–11 yrs sharing with adults",
       "1,200"
      ],
      [
       "Guide — Single (no aircon)",
       "1,200"
      ]
     ]
    },
    {
     "title": "Meals (per person)",
     "rows": [
      [
       "Breakfast",
       "282"
      ],
      [
       "Lunch Pack",
       "282"
      ],
      [
       "Lunch (3-course set menu, max 10 + TG)",
       "420"
      ],
      [
       "Dinner (3-course à la carte)",
       "600"
      ]
     ]
    },
    {
     "title": "Activities (per person)",
     "rows": [
      [
       "Sunset Scenic Drive (2 hr, min 2 pax)",
       "960"
      ],
      [
       "4x4 Cave Painting Drive (4 hr, min 2 pax)",
       "1,620"
      ],
      [
       "4x4 Cave Painting Drive (4 hr, 3+ pax)",
       "1,440"
      ]
     ]
    }
   ]
  }
 },
 "sesfontein-guesthouse": {
  "2026": {
   "name": "Sesfontein Guesthouse",
   "region": "",
   "currency": "N$",
   "validity": "2026",
   "note": "Public rack, capped at 20% above the net STO (house rule: rack is never more than STO + 20%). The supplier states 20% commission, which would gross up to 25.0% above net — the cap applies.",
   "sections": [
    {
     "title": "Bed &amp; Breakfast (per person)",
     "rows": [
      [
       "Per person sharing",
       "2,112"
      ],
      [
       "Third person in room",
       "1,104"
      ],
      [
       "Per single room",
       "2,640"
      ],
      [
       "Guide / Pilot",
       "1,104"
      ],
      [
       "Children 7–12 yrs",
       "1,104"
      ]
     ]
    },
    {
     "title": "Dinner, Bed &amp; Breakfast (per person)",
     "rows": [
      [
       "Per person sharing",
       "2,784"
      ],
      [
       "Third person in room",
       "1,776"
      ],
      [
       "Per single room",
       "3,312"
      ],
      [
       "Guide / Pilot",
       "1,776"
      ],
      [
       "Children 7–12 yrs",
       "1,776"
      ]
     ]
    },
    {
     "title": "1-night Sleep-Out (DBB, min 2 pax)",
     "rows": [
      [
       "Per person",
       "4,224"
      ],
      [
       "Single supplement",
       "912"
      ],
      [
       "Child under 13 yrs",
       "2,448"
      ],
      [
       "Guide rate (per guide)",
       "2,448"
      ]
     ]
    },
    {
     "title": "2-night Hoanib Elephant Sleep-Out Package (min 2 pax)",
     "rows": [
      [
       "Per person",
       "8,064"
      ],
      [
       "Single supplement",
       "1,440"
      ],
      [
       "Child under 13 yrs",
       "4,752"
      ],
      [
       "Guide rate (per guide)",
       "4,752"
      ]
     ]
    },
    {
     "title": "3-night Rhino Tracking Sleep-Out Package (min 2 pax)",
     "rows": [
      [
       "Per person",
       "10,368"
      ],
      [
       "Single supplement",
       "2,448"
      ],
      [
       "Guide rate (per guide)",
       "6,624"
      ]
     ]
    },
    {
     "title": "1-night Ongongo Tented Option (DBB, min 2 pax)",
     "rows": [
      [
       "Per person",
       "2,448"
      ],
      [
       "Single supplement",
       "768"
      ],
      [
       "Child 7–12 yrs",
       "2,016"
      ],
      [
       "Child 0–6 yrs",
       "672"
      ],
      [
       "Guide rate (per guide)",
       "1,344"
      ]
     ]
    },
    {
     "title": "Activities (rack — fully commissionable)",
     "rows": [
      [
       "Himba Village Visit (pp, min 2)",
       "2,520"
      ],
      [
       "Hoanib Elephant Drive incl. Himba (pp, min 2)",
       "4,440"
      ],
      [
       "Sundowner Drive (incl. drinks &amp; snacks)",
       "960"
      ],
      [
       "Airstrip Transfer (return, per vehicle)",
       "840"
      ]
     ]
    }
   ]
  }
 },
 "simanya-river-lodge": {
  "2026": {
   "name": "Simanya River Lodge",
   "region": "",
   "currency": "N$",
   "validity": "2026",
   "note": "Public rack, capped at 20% above the net STO (house rule: rack is never more than STO + 20%). The supplier states 20% commission, which would gross up to 25.0% above net — the cap applies.",
   "sections": [
    {
     "title": "Luxury Rooms (×16) — Low Season DBB",
     "rows": [
      [
       "Per person sharing",
       "3,484.80"
      ],
      [
       "Single Supplement",
       "722.30"
      ],
      [
       "Children 6–12 yrs (max 2 sharing)",
       "2,178"
      ]
     ]
    },
    {
     "title": "Luxury Rooms (×16) — High Season DBB",
     "rows": [
      [
       "Per person sharing",
       "3,659.04"
      ],
      [
       "Single Supplement",
       "758.42"
      ],
      [
       "Children 6–12 yrs (max 2 sharing)",
       "2,286.90"
      ]
     ]
    },
    {
     "title": "Distinctive Rooms (×4) — Low Season DBB",
     "rows": [
      [
       "Per person sharing",
       "5,385.60"
      ],
      [
       "Single Supplement",
       "844.80"
      ],
      [
       "Children 6–12 yrs (max 2 sharing)",
       "1,742.40"
      ]
     ]
    },
    {
     "title": "Distinctive Rooms (×4) — High Season DBB",
     "rows": [
      [
       "Per person sharing",
       "5,654.88"
      ],
      [
       "Single Supplement",
       "887.04"
      ],
      [
       "Children 6–12 yrs (max 2 sharing)",
       "2,286.90"
      ]
     ]
    },
    {
     "title": "Camping (max 5 pax per site)",
     "rows": [
      [
       "Per person — Low Season",
       "420"
      ],
      [
       "Per person — High Season",
       "504"
      ],
      [
       "Kids 6–12 yrs — Low",
       "210"
      ],
      [
       "Kids 6–12 yrs — High",
       "240"
      ]
     ]
    },
    {
     "title": "Meals (per person)",
     "rows": [
      [
       "Breakfast",
       "330"
      ],
      [
       "Breakfast Pack",
       "300"
      ],
      [
       "Lunch",
       "372"
      ],
      [
       "Lunch Pack",
       "330"
      ],
      [
       "Dinner (3-course)",
       "660"
      ]
     ]
    },
    {
     "title": "Guide Room",
     "rows": [
      [
       "Guide Room (only 1 guide per group)",
       "1,332"
      ]
     ]
    }
   ]
  }
 },
 "the-rez": {
  "2026": {
   "name": "The Rez",
   "region": "",
   "currency": "N$",
   "validity": "2026",
   "note": "Public rack, capped at 20% above the net STO (house rule: rack is never more than STO + 20%). The supplier states 15% commission, which is within the cap.",
   "sections": [
    {
     "title": "Luxury Rooms — B&amp;B",
     "rows": [
      [
       "Luxury Room — Single",
       "1,790.59"
      ],
      [
       "Luxury Room — Double (pp sharing)",
       "1,529.41"
      ]
     ]
    },
    {
     "title": "Deluxe Rooms — B&amp;B",
     "rows": [
      [
       "Deluxe Room — Single",
       "1,921.35"
      ],
      [
       "Deluxe Room — Double (pp sharing)",
       "1,708.59"
      ]
     ]
    },
    {
     "title": "Super Deluxe Rooms — B&amp;B",
     "rows": [
      [
       "Super Deluxe Room — Single",
       "2,338.59"
      ],
      [
       "Super Deluxe Room — Double (pp sharing)",
       "1,888.71"
      ]
     ]
    }
   ]
  }
 },
 "tsauchab-river-camp": {
  "2026": {
   "name": "Tsauchab River Camp",
   "region": "",
   "currency": "N$",
   "validity": "2026",
   "note": "Public rack, capped at 20% above the net STO (house rule: rack is never more than STO + 20%). The supplier states 20% commission, which would gross up to 25.0% above net — the cap applies.",
   "sections": [
    {
     "title": "Chalet (DBB, per room per night)",
     "rows": [
      [
       "Chalet single",
       "2,880"
      ],
      [
       "Chalet double/twin",
       "4,800"
      ],
      [
       "Chalet 3-bed (max 2 adults)",
       "5,616"
      ],
      [
       "Chalet 4-bed (max 2 adults)",
       "6,432"
      ]
     ]
    },
    {
     "title": "Falcon View Suite — DBB (per room per night)",
     "rows": [
      [
       "Suite single",
       "7,200"
      ],
      [
       "Suite double/twin",
       "9,600"
      ]
     ]
    },
    {
     "title": "Tour Guides",
     "rows": [
      [
       "Additional Tour Guide / Driver",
       "1,920"
      ]
     ]
    },
    {
     "title": "Camping (self-catering, per site + per person)",
     "rows": [
      [
       "Campsite per night",
       "255"
      ],
      [
       "Per person per night",
       "234.60"
      ],
      [
       "Per child (5–11 yrs) per night",
       "132.60"
      ]
     ]
    },
    {
     "title": "Meals (per person — incl. VAT, rack)",
     "rows": [
      [
       "Breakfast",
       "396"
      ],
      [
       "Breakfast — child 5–11 yrs",
       "336"
      ],
      [
       "Lunch Pack",
       "360"
      ],
      [
       "Lunch",
       "420"
      ],
      [
       "Dinner",
       "540"
      ],
      [
       "Dinner — child 5–11 yrs",
       "444"
      ]
     ]
    }
   ]
  }
 },
 "uis-elephant": {
  "2026": {
   "name": "Uis Elephant Guesthouse",
   "region": "",
   "currency": "N$",
   "validity": "2026",
   "note": "Public rack, capped at 20% above the net STO (house rule: rack is never more than STO + 20%). The supplier states 20% commission, which would gross up to 25.0% above net — the cap applies.",
   "sections": [
    {
     "title": "Bed &amp; Breakfast — Per Person Sharing",
     "rows": [
      [
       "Standard Room",
       "2,016"
      ],
      [
       "Luxury Room",
       "2,208"
      ],
      [
       "Suite",
       "2,448"
      ]
     ]
    },
    {
     "title": "Bed &amp; Breakfast — Per Single Room",
     "rows": [
      [
       "Standard Room",
       "2,544"
      ],
      [
       "Luxury Room",
       "2,736"
      ],
      [
       "Suite",
       "3,168"
      ]
     ]
    },
    {
     "title": "Bed &amp; Breakfast — Guides &amp; Children",
     "rows": [
      [
       "Guide / Pilot",
       "1,056"
      ],
      [
       "Children 7–12 yrs",
       "1,056"
      ]
     ]
    },
    {
     "title": "Dinner, Bed &amp; Breakfast — Per Person Sharing",
     "rows": [
      [
       "Standard Room",
       "2,592"
      ],
      [
       "Luxury Room",
       "2,784"
      ],
      [
       "Suite",
       "3,024"
      ]
     ]
    },
    {
     "title": "Dinner, Bed &amp; Breakfast — Per Single Room",
     "rows": [
      [
       "Standard Room",
       "3,120"
      ],
      [
       "Luxury Room",
       "3,312"
      ],
      [
       "Suite",
       "3,744"
      ]
     ]
    },
    {
     "title": "Sleep-Out Packages (min 4 pax — fully commissionable)",
     "rows": [
      [
       "Stand-alone Sleep-Out — pp",
       "5,040"
      ],
      [
       "Standard Room + Sleep-Out — pp",
       "8,220"
      ],
      [
       "Luxury Room + Sleep-Out — pp",
       "8,460"
      ],
      [
       "Suite + Sleep-Out — pp",
       "8,700"
      ]
     ]
    },
    {
     "title": "Brandberg Hiking Package (min 4 pax)",
     "rows": [
      [
       "Per person",
       "14,520"
      ],
      [
       "Guide rate (per guide)",
       "7,140"
      ]
     ]
    },
    {
     "title": "Activities (rack — fully commissionable)",
     "rows": [
      [
       "Full-day Brandberg Excursion (min 2 pax)",
       "2,400"
      ],
      [
       "Sundowner Drive (min 2 pax)",
       "1,320"
      ],
      [
       "AM/PM Elephant Drive (min 2 pax)",
       "1,620"
      ]
     ]
    }
   ]
  }
 },
 "vingerklip-lodge": {
  "2026": {
   "name": "Vingerklip Lodge",
   "region": "",
   "currency": "N$",
   "validity": "2026",
   "note": "Public rack, capped at 20% above the net STO (house rule: rack is never more than STO + 20%). The supplier states 15% commission, which is within the cap.",
   "sections": [
    {
     "title": "Rooms — DBB (per person)",
     "rows": [
      [
       "Double Room (pp sharing)",
       "2,430"
      ],
      [
       "Single Supplement",
       "1,230"
      ],
      [
       "Children 4–14 yrs",
       "1,490"
      ]
     ]
    },
    {
     "title": "Heaven&#x27;s Gate Suite — DBB (per person)",
     "rows": [
      [
       "Suite (pp sharing)",
       "3,620"
      ],
      [
       "Single Supplement",
       "1,780"
      ]
     ]
    },
    {
     "title": "Tour Guides (NET rates — non-commissionable)",
     "rows": [
      [
       "Group of up to 7 full-paying pax",
       "1,623.53"
      ],
      [
       "Group of 8 or more full-paying pax",
       "1,500"
      ],
      [
       "Each additional guide",
       "1,358.82"
      ]
     ]
    },
    {
     "title": "Separate Services (per person — non-commissionable)",
     "rows": [
      [
       "Eagles Nest Dinner (extra, on top)",
       "117.65"
      ],
      [
       "Lunch — Buffet",
       "329.41"
      ],
      [
       "Lunch — Set menu",
       "258.82"
      ],
      [
       "Light Lunches (range)",
       "258.82"
      ],
      [
       "Lunch Pack",
       "200"
      ],
      [
       "Dinner",
       "458.82"
      ],
      [
       "Breakfast",
       "258.82"
      ]
     ]
    }
   ]
  }
 },
 "voigtland-guesthouse": {
  "2026": {
   "name": "Guesthouse Voigtland",
   "region": "",
   "currency": "N$",
   "validity": "2026",
   "note": "Public rack, capped at 20% above the net STO (house rule: rack is never more than STO + 20%). The supplier states 20% commission, which would gross up to 25.0% above net — the cap applies.",
   "sections": [
    {
     "title": "Explorer Package — Bed &amp; Breakfast (Agent STO)",
     "rows": [
      [
       "Per person sharing",
       "3,460.80"
      ],
      [
       "Single room",
       "3,910.80"
      ]
     ]
    },
    {
     "title": "Exclusive Package — DBB (Agent STO) — Best Seller",
     "rows": [
      [
       "Per person sharing",
       "4,296"
      ],
      [
       "Single room",
       "4,746"
      ]
     ]
    },
    {
     "title": "Superior Package — Full Board (Agent STO)",
     "rows": [
      [
       "Per person sharing",
       "4,652.40"
      ],
      [
       "Single room",
       "5,102.40"
      ]
     ]
    },
    {
     "title": "Building Blocks — Agent STO ~25% commission",
     "rows": [
      [
       "Bed Rate per person",
       "2,248.80"
      ],
      [
       "Bed Rate — single",
       "2,698.80"
      ],
      [
       "Tour Guide Room (single, accom only)",
       "2,248.80"
      ],
      [
       "Day Room — per person",
       "2,812.80"
      ]
     ]
    },
    {
     "title": "À la carte Extras (per person)",
     "rows": [
      [
       "Breakfast",
       "420"
      ],
      [
       "Lunch",
       "356.40"
      ],
      [
       "4-Course Dinner",
       "835.20"
      ],
      [
       "High Tea",
       "360"
      ],
      [
       "Giraffe Feeding",
       "432"
      ],
      [
       "Nature Drive incl. Sundowner Cocktail (2 hr)",
       "654"
      ],
      [
       "Laundry Service (per machine)",
       "276"
      ]
     ]
    },
    {
     "title": "Transfers (per person)",
     "rows": [
      [
       "Airport Transfer",
       "462"
      ],
      [
       "City Transfer",
       "552"
      ]
     ]
    }
   ]
  }
 },
 "waterberg-wilderness": {
  "2026": {
   "name": "Waterberg Wilderness Lodges",
   "region": "",
   "currency": "N$",
   "validity": "2026",
   "note": "Public rack, capped at 20% above the net STO (house rule: rack is never more than STO + 20%). The supplier states 20% commission, which would gross up to 25.0% above net — the cap applies.",
   "sections": [
    {
     "title": "Waterberg Plateau Lodge — Rock Chalet (DBB pp)",
     "rows": [
      [
       "Per person DBB",
       "4,176"
      ]
     ]
    },
    {
     "title": "Waterberg Wilderness Lodge — Double / Family Unit (DBB pp)",
     "rows": [
      [
       "Per person DBB",
       "3,072"
      ]
     ]
    },
    {
     "title": "Waterberg Valley Lodge — Econo Chalet (DBB pp)",
     "rows": [
      [
       "Per person DBB",
       "2,160"
      ]
     ]
    },
    {
     "title": "Camping (per person, non-commissionable)",
     "rows": [
      [
       "Waterberg Plateau Campsite",
       "504"
      ],
      [
       "Waterberg Andersson Camp",
       "504"
      ]
     ]
    },
    {
     "title": "Experiences — 1 night stay (non-commissionable)",
     "rows": [
      [
       "Plateau hike (guided)",
       "504"
      ],
      [
       "Honeymoon Sundowner (guided)",
       "1,200"
      ],
      [
       "Rhino drive (guided)",
       "1,440"
      ],
      [
       "Rhino tracking (guided)",
       "1,320"
      ]
     ]
    },
    {
     "title": "Experiences — Stay-2-Experience (2+ nights, 25% off)",
     "rows": [
      [
       "Plateau hike",
       "378"
      ],
      [
       "Honeymoon Sundowner",
       "900"
      ],
      [
       "Rhino drive",
       "1,080"
      ],
      [
       "Rhino tracking",
       "990"
      ]
     ]
    }
   ]
  }
 },
 "pioneers-victoria-falls": {
  "2027": {
   "name": "Pioneers Victoria Falls",
   "region": "Vic Falls",
   "currency": "US$",
   "validity": "2027 · Jan–May / Jun–Oct / Nov–Dec",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "Per person, B&B — Jan–May (per person, B&B)",
     "rows": [
      [
       "pp sharing",
       "196.80"
      ],
      [
       "single",
       "276"
      ],
      [
       "child 4–11 sharing",
       "98.40"
      ],
      [
       "child 4–11 single",
       "276"
      ]
     ]
    },
    {
     "title": "Per person, B&B — Jun–Oct (per person, B&B)",
     "rows": [
      [
       "pp sharing",
       "220.80"
      ],
      [
       "single",
       "309.60"
      ],
      [
       "child 4–11 sharing",
       "110.40"
      ],
      [
       "child 4–11 single",
       "309.60"
      ]
     ]
    },
    {
     "title": "Per person, B&B — Nov–Dec (per person, B&B)",
     "rows": [
      [
       "pp sharing",
       "196.80"
      ],
      [
       "single",
       "276"
      ],
      [
       "child 4–11 sharing",
       "98.40"
      ],
      [
       "child 4–11 single",
       "276"
      ]
     ]
    }
   ]
  }
 },
 "white-sands-caprivi": {
  "2026": {
   "name": "White Sands Lodge",
   "region": "",
   "currency": "N$",
   "validity": "2026",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "Game Drives (per person, min 2)",
     "rows": [
      [
       "Game Drive — Bwabwata NP (2.5–3 hr)",
       "1,140"
      ],
      [
       "Game Drive — Mahango NP (3.5–4 hr)",
       "1,380"
      ],
      [
       "VIP Game Drive — Bwabwata NP (5 hr)",
       "2,160"
      ],
      [
       "Full Day Game Drive — Mahango &amp; Bwabwata",
       "3,000"
      ],
      [
       "SAN Traditional Tour (1.5–2 hr)",
       "576"
      ]
     ]
    },
    {
     "title": "Sunset &amp; Fishing — N//Goabaca (per person, min 3)",
     "rows": [
      [
       "Sunset Cruise (1.5 hr)",
       "528"
      ],
      [
       "Fishing per hour — 1 to 3 pax (min 2 hr)",
       "1,122"
      ],
      [
       "Fishing — additional pax per hour",
       "288"
      ],
      [
       "Rent of fishing gear (4 hr)",
       "300"
      ]
     ]
    },
    {
     "title": "Private Boat Charters — Okavango Dreams (per person, min 4)",
     "rows": [
      [
       "Breakfast Cruise (1.5 hr)",
       "780"
      ],
      [
       "Breakfast Cruise — in-house guests",
       "504"
      ],
      [
       "Namibian Braai Cruise (4 hr, all drinks)",
       "2,038.80"
      ],
      [
       "Birding Cruise (3 hr, 2 drinks)",
       "1,056"
      ],
      [
       "Game Cruise (4 hr, 2 drinks)",
       "1,620"
      ],
      [
       "VIP Cruise (6 hr, all-inclusive)",
       "3,000"
      ]
     ]
    }
   ]
  }
 },
 "hakusembe-river-lodge": {
  "2027": {
   "name": "Hakusembe River Lodge",
   "region": "Caprivi",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "Room B&B — per person sharing",
       "3,494.40"
      ],
      [
       "Room B&B — single",
       "4,368"
      ],
      [
       "Camping2Go (bed only) — per person sharing",
       "1,104"
      ],
      [
       "Camping2Go (bed only) — single",
       "2,208"
      ],
      [
       "Campsite — per person per night",
       "388.80"
      ],
      [
       "Tour Guide Room (DBB)",
       "951.60"
      ]
     ]
    }
   ]
  }
 },
 "namushasha-river-lodge": {
  "2027": {
   "name": "Namushasha River Lodge",
   "region": "Caprivi",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "Room B&B — per person sharing",
       "3,494.40"
      ],
      [
       "Room B&B — single",
       "4,368"
      ],
      [
       "Camping2Go (bed only) — per person sharing",
       "1,104"
      ],
      [
       "Camping2Go (bed only) — single",
       "2,208"
      ],
      [
       "Campsite — per person per night",
       "388.80"
      ],
      [
       "Tour Guide Room (DBB)",
       "951.60"
      ]
     ]
    }
   ]
  }
 },
 "popa-falls-resort": {
  "2027": {
   "name": "Popa Falls Resort",
   "region": "Caprivi",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "Low Season (01 Nov – 30 Jun) · Campsite — per person camping",
       "183.60"
      ],
      [
       "High Season (01 Jul – 31 Oct) · Campsite — per person camping",
       "183.60"
      ],
      [
       "Low Season (01 Nov – 30 Jun) · Campsite (overlander) (max — per person camping",
       "183.60"
      ],
      [
       "High Season (01 Jul – 31 Oct) · Campsite (overlander) (max — per person camping",
       "183.60"
      ],
      [
       "Low Season (01 Nov – 30 Jun) · River cabins (2 beds) BB — per person sharing",
       "1,641.60"
      ],
      [
       "High Season (01 Jul – 31 Oct) · River cabins (2 beds) BB — per person sharing",
       "2,052"
      ],
      [
       "Low Season (01 Nov – 30 Jun) · River cabins (2 beds) BB — single",
       "1,900.80"
      ],
      [
       "High Season (01 Jul – 31 Oct) · River cabins (2 beds) BB — single",
       "2,322"
      ],
      [
       "Low Season (01 Nov – 30 Jun) · Bush chalet (2 beds) BB — per person sharing",
       "1,468.80"
      ],
      [
       "High Season (01 Jul – 31 Oct) · Bush chalet (2 beds) BB — per person sharing",
       "1,825.20"
      ],
      [
       "Low Season (01 Nov – 30 Jun) · Bush chalet (2 beds) BB — single",
       "1,738.80"
      ],
      [
       "High Season (01 Jul – 31 Oct) · Bush chalet (2 beds) BB — single",
       "2,095.20"
      ],
      [
       "Low Season (01 Nov – 30 Jun) · Family House (6 beds) - min BB — per person sharing",
       "1,641.60"
      ],
      [
       "High Season (01 Jul – 31 Oct) · Family House (6 beds) - min BB — per person sharing",
       "2,052"
      ],
      [
       "Low Season (01 Nov – 30 Jun) · Luxury river cabins BB — per person sharing",
       "1,965.60"
      ],
      [
       "High Season (01 Jul – 31 Oct) · Luxury river cabins BB — per person sharing",
       "2,354.40"
      ],
      [
       "Low Season (01 Nov – 30 Jun) · Luxury river cabins BB — single",
       "2,224.80"
      ],
      [
       "High Season (01 Jul – 31 Oct) · Luxury river cabins BB — single",
       "2,613.60"
      ]
     ]
    }
   ]
  }
 },
 "ai-aiba-lodge": {
  "2027": {
   "name": "Ai Aiba Lodge",
   "region": "Central Namibia",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "Low Season (16 Jan – 30 Jun) · Per Person Sharing",
       "2,401.20"
      ],
      [
       "Low Season (16 Jan – 30 Jun) · Single",
       "3,243.60"
      ],
      [
       "Low Season (16 Jan – 30 Jun) · Conservation Levy (pppn)",
       "204"
      ],
      [
       "High Season (1 Jul – 15 Jan) · Per Person Sharing",
       "3,447.60"
      ],
      [
       "High Season (1 Jul – 15 Jan) · Single",
       "4,660.80"
      ],
      [
       "High Season (1 Jul – 15 Jan) · Conservation Levy (pppn)",
       "204"
      ],
      [
       "Low — ≤3 pax (25% off)",
       "1,801.20"
      ],
      [
       "Low — 4+ pax (50% off)",
       "1,201.20"
      ],
      [
       "High — ≤3 pax (25% off)",
       "2,586"
      ],
      [
       "High — 4+ pax (50% off)",
       "1,724.40"
      ],
      [
       "Nature Drive / Bushman Rock Art (3 hrs)",
       "900"
      ],
      [
       "Guided Morning Walk — Ai Aiba (2–3 hrs)",
       "540"
      ],
      [
       "Nature Drive / Bushman Rock Art (3 hrs, AM or PM) — per person",
       "900"
      ],
      [
       "Ai Aiba Guided Walk (2–3 hrs) — per person",
       "540"
      ],
      [
       "Walk & Drive (3 hrs) — per person",
       "900"
      ],
      [
       "Walk with San Living Museum visit (3 hrs) — per person",
       "852"
      ],
      [
       "Guided Sundowner Mountain Bike Ride (E-bike) — per person",
       "420"
      ],
      [
       "Guided Mountain Bike Tour (incl. E-bike) — per person",
       "1,260"
      ]
     ]
    }
   ]
  }
 },
 "gross-barmen-resort": {
  "2027": {
   "name": "Gross Barmen Resort",
   "region": "Central Namibia",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "Low Season (01 Nov – 30 Jun) · Campsite — per person camping",
       "259.20"
      ],
      [
       "High Season (01 Jul – 31 Oct) · Campsite — per person camping",
       "259.20"
      ],
      [
       "Low Season (01 Nov – 30 Jun) · Premier chalet BB — per person sharing",
       "2,872.80"
      ],
      [
       "High Season (01 Jul – 31 Oct) · Premier chalet BB — per person sharing",
       "2,872.80"
      ],
      [
       "Low Season (01 Nov – 30 Jun) · Premier chalet BB — single",
       "3,078"
      ],
      [
       "High Season (01 Jul – 31 Oct) · Premier chalet BB — single",
       "3,078"
      ],
      [
       "Low Season (01 Nov – 30 Jun) · Bush chalet BB — per person sharing",
       "1,436.40"
      ],
      [
       "High Season (01 Jul – 31 Oct) · Bush chalet BB — per person sharing",
       "1,436.40"
      ],
      [
       "Low Season (01 Nov – 30 Jun) · Bush chalet BB — single",
       "1,641.60"
      ],
      [
       "High Season (01 Jul – 31 Oct) · Bush chalet BB — single",
       "1,641.60"
      ],
      [
       "Low Season (01 Nov – 30 Jun) · Family chalet (4 beds) – min BB — per person sharing",
       "2,160"
      ],
      [
       "High Season (01 Jul – 31 Oct) · Family chalet (4 beds) – min BB — per person sharing",
       "2,160"
      ],
      [
       "Low Season (01 Nov – 30 Jun) · Premier family chalet (4 beds) -min BB — per person sharing",
       "2,872.80"
      ],
      [
       "High Season (01 Jul – 31 Oct) · Premier family chalet (4 beds) -min BB — per person sharing",
       "2,872.80"
      ],
      [
       "Low Season (01 Nov – 30 Jun) · Acacia (A & B) – Bed only — bed only",
       "1,274.40"
      ],
      [
       "High Season (01 Jul – 31 Oct) · Acacia (A & B) – Bed only — bed only",
       "1,274.40"
      ],
      [
       "Low Season (01 Nov – 30 Jun) · Aloe (A , B & C) – Bed only — bed only",
       "1,274.40"
      ],
      [
       "High Season (01 Jul – 31 Oct) · Aloe (A , B & C) – Bed only — bed only",
       "1,274.40"
      ]
     ]
    }
   ]
  }
 },
 "hohenstein-lodge": {
  "2027": {
   "name": "Hohenstein Lodge",
   "region": "Central Namibia",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "High Season (01 Mar – 30 Nov) · DBB · Room — per person sharing",
       "2,976"
      ],
      [
       "High Season (01 Mar – 30 Nov) · DBB · Room — single",
       "3,888"
      ],
      [
       "High Season (01 Mar – 30 Nov) · DBB · Chalet — per person sharing",
       "5,088"
      ],
      [
       "High Season (01 Mar – 30 Nov) · DBB · Chalet — single",
       "6,624"
      ],
      [
       "High Season (01 Mar – 30 Nov) · Child 4–12",
       "2,544"
      ],
      [
       "Tour Guide (Guide Room)",
       "1,428"
      ],
      [
       "Low Season (01 Dec – 29 Feb) · DBB · Room — per person sharing",
       "1,824"
      ],
      [
       "Low Season (01 Dec – 29 Feb) · DBB · Room — single",
       "2,371.20"
      ],
      [
       "Low Season (01 Dec – 29 Feb) · DBB · Chalet — per person sharing",
       "3,744"
      ],
      [
       "Low Season (01 Dec – 29 Feb) · DBB · Chalet — single",
       "4,896"
      ],
      [
       "Low Season (01 Dec – 29 Feb) · Child 4–12",
       "1,872"
      ]
     ]
    }
   ]
  }
 },
 "ondudu-safari-lodge": {
  "2027": {
   "name": "Ondudu Safari Lodge",
   "region": "Central Namibia",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "Green Season (07 Jan – 31 Mar) · DBB — per person sharing",
       "3,384"
      ],
      [
       "Low Season (01 Apr – 30 Jun & 16 Nov – 14 Dec) · DBB — per person sharing",
       "4,167.60"
      ],
      [
       "High Season (01 Jul – 15 Nov & 15 Dec – 06 Jan) · DBB — per person sharing",
       "4,374"
      ],
      [
       "Green Season (07 Jan – 31 Mar) · DBB — single",
       "4,568.40"
      ],
      [
       "Low Season (01 Apr – 30 Jun & 16 Nov – 14 Dec) · DBB — single",
       "5,626.80"
      ],
      [
       "High Season (01 Jul – 15 Nov & 15 Dec – 06 Jan) · DBB — single",
       "5,904"
      ]
     ]
    }
   ]
  }
 },
 "waterberg-camp": {
  "2027": {
   "name": "Waterberg Camp",
   "region": "Central Namibia",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "Low Season (01 Nov – 30 Jun) · Campsite — per person camping",
       "464.40"
      ],
      [
       "High Season (01 Jul – 31 Oct) · Campsite — per person camping",
       "464.40"
      ],
      [
       "Low Season (01 Nov – 30 Jun) · Double room BB — per person sharing",
       "1,188"
      ],
      [
       "High Season (01 Jul – 31 Oct) · Double room BB — per person sharing",
       "1,382.40"
      ],
      [
       "Low Season (01 Nov – 30 Jun) · Double room BB — single",
       "1,458"
      ],
      [
       "High Season (01 Jul – 31 Oct) · Double room BB — single",
       "1,652.40"
      ],
      [
       "Low Season (01 Nov – 30 Jun) · Bush chalet (2 beds) BB — per person sharing",
       "1,447.20"
      ],
      [
       "High Season (01 Jul – 31 Oct) · Bush chalet (2 beds) BB — per person sharing",
       "1,674"
      ],
      [
       "Low Season (01 Nov – 30 Jun) · Bush chalet (2 beds) BB — single",
       "1,728"
      ],
      [
       "High Season (01 Jul – 31 Oct) · Bush chalet (2 beds) BB — single",
       "1,944"
      ],
      [
       "Low Season (01 Nov – 30 Jun) · Bush chalet (4 beds) - min BB — per person sharing",
       "1,447.20"
      ],
      [
       "High Season (01 Jul – 31 Oct) · Bush chalet (4 beds) - min BB — per person sharing",
       "1,641.60"
      ],
      [
       "Low Season (01 Nov – 30 Jun) · Family chalet (4 beds) - min BB — per person sharing",
       "1,641.60"
      ],
      [
       "High Season (01 Jul – 31 Oct) · Family chalet (4 beds) - min BB — per person sharing",
       "1,900.80"
      ],
      [
       "Low Season (01 Nov – 30 Jun) · Premier bush chalet (2 beds) BB — per person sharing",
       "1,771.20"
      ],
      [
       "High Season (01 Jul – 31 Oct) · Premier bush chalet (2 beds) BB — per person sharing",
       "1,965.60"
      ],
      [
       "Low Season (01 Nov – 30 Jun) · Premier bush chalet (2 beds) BB — single",
       "2,041.20"
      ],
      [
       "High Season (01 Jul – 31 Oct) · Premier bush chalet (2 beds) BB — single",
       "2,246.40"
      ]
     ]
    }
   ]
  }
 },
 "damara-mopane-lodge": {
  "2027": {
   "name": "Damara Mopane Lodge",
   "region": "Damaraland",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "Room B&B — per person sharing",
       "2,302.08"
      ],
      [
       "Room B&B — single",
       "2,877.60"
      ],
      [
       "Tour Guide Room (DBB)",
       "951.60"
      ]
     ]
    }
   ]
  }
 },
 "grootberg-lodge": {
  "2027": {
   "name": "Grootberg Lodge",
   "region": "Damaraland",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "Green Season (07 Jan – 31 Mar) · DBB — per person sharing",
       "2,965.20"
      ],
      [
       "Low Season (01 Apr – 30 Jun & 16 Nov – 14 Dec) · DBB — per person sharing",
       "3,643.20"
      ],
      [
       "High Season (01 Jul – 15 Nov & 15 Dec – 06 Jan) · DBB — per person sharing",
       "4,394.40"
      ],
      [
       "Green Season (07 Jan – 31 Mar) · DBB — single",
       "4,003.20"
      ],
      [
       "Low Season (01 Apr – 30 Jun & 16 Nov – 14 Dec) · DBB — single",
       "4,918.80"
      ],
      [
       "High Season (01 Jul – 15 Nov & 15 Dec – 06 Jan) · DBB — single",
       "5,932.80"
      ]
     ]
    }
   ]
  }
 },
 "hoada-campsite": {
  "2027": {
   "name": "Hoada Campsite",
   "region": "Damaraland",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "Green Season (07 Jan – 31 Mar) · Individual campsite — per person",
       "327.60"
      ],
      [
       "Low Season (01 Apr – 30 Jun & 16 Nov – 14 Dec) · Individual campsite — per person",
       "408"
      ],
      [
       "High Season (01 Jul – 15 Nov & 15 Dec – 06 Jan) · Individual campsite — per person",
       "442.80"
      ],
      [
       "Green Season (07 Jan – 31 Mar) · Group campsite — per site",
       "3,598.80"
      ],
      [
       "Low Season (01 Apr – 30 Jun & 16 Nov – 14 Dec) · Group campsite — per site",
       "4,484.40"
      ],
      [
       "High Season (01 Jul – 15 Nov & 15 Dec – 06 Jan) · Group campsite — per site",
       "4,957.20"
      ],
      [
       "Green Season (07 Jan – 31 Mar) · Comfort camping tent (incl) — per person",
       "1,084.80"
      ],
      [
       "Low Season (01 Apr – 30 Jun & 16 Nov – 14 Dec) · Comfort camping tent (incl) — per person",
       "1,273.20"
      ],
      [
       "High Season (01 Jul – 15 Nov & 15 Dec – 06 Jan) · Comfort camping tent (incl) — per person",
       "1,311.60"
      ],
      [
       "Green Season (07 Jan – 31 Mar) · Comfort camping tent (excl) — per person",
       "776.40"
      ],
      [
       "Low Season (01 Apr – 30 Jun & 16 Nov – 14 Dec) · Comfort camping tent (excl) — per person",
       "964.80"
      ],
      [
       "High Season (01 Jul – 15 Nov & 15 Dec – 06 Jan) · Comfort camping tent (excl) — per person",
       "1,003.20"
      ]
     ]
    }
   ]
  }
 },
 "lodge-damaraland": {
  "2027": {
   "name": "Lodge Damaraland",
   "region": "Damaraland",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "Low Season (01 Jan – 31 Mar) · Classic Room — per person sharing",
       "2,226"
      ],
      [
       "Low Season (01 Jan – 31 Mar) · Classic Room — single",
       "2,928"
      ],
      [
       "Shoulder Season (01 Apr – 30 Jun & 01 – 31 Dec) · Classic Room — per person sharing",
       "2,412"
      ],
      [
       "Shoulder Season (01 Apr – 30 Jun & 01 – 31 Dec) · Classic Room — single",
       "3,156"
      ],
      [
       "High Season (01 Jul – 30 Nov) · Classic Room — per person sharing",
       "2,766"
      ],
      [
       "High Season (01 Jul – 30 Nov) · Classic Room — single",
       "3,636"
      ]
     ]
    }
   ]
  }
 },
 "omaruru-game-lodge": {
  "2027": {
   "name": "Omaruru Game Lodge",
   "region": "Damaraland",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "Bungalow Standard · DBB — per person sharing",
       "2,256"
      ],
      [
       "Bungalow Standard · DBB — single",
       "2,400"
      ],
      [
       "Bungalow Superior · DBB — per person sharing",
       "2,496"
      ],
      [
       "Bungalow Superior · DBB — single",
       "2,880"
      ],
      [
       "Child 4–10 (DBB)",
       "960"
      ],
      [
       "Tour Guide (DBB)",
       "1,140"
      ],
      [
       "Game Drive (per person)",
       "720"
      ]
     ]
    }
   ]
  }
 },
 "palmwag-lodge": {
  "2027": {
   "name": "Palmwag Lodge",
   "region": "Damaraland",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "Standard Room B&B — per person sharing",
       "2,880"
      ],
      [
       "Standard Room B&B — single",
       "3,600"
      ],
      [
       "Comfort Room B&B — per person sharing",
       "3,538.56"
      ],
      [
       "Comfort Room B&B — single",
       "4,423.20"
      ],
      [
       "Camping2Go (bed only) — per person sharing",
       "1,104"
      ],
      [
       "Camping2Go (bed only) — single",
       "2,208"
      ],
      [
       "Campsite — per person per night",
       "388.80"
      ],
      [
       "Tour Guide Room (DBB)",
       "951.60"
      ]
     ]
    }
   ]
  }
 },
 "twyfelfontein-adventure-camp": {
  "2027": {
   "name": "Twyfelfontein Adventure Camp",
   "region": "Damaraland",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "High Season (01 Mar – 30 Nov) · DBB · Standard Tent — per person sharing",
       "2,688"
      ],
      [
       "High Season (01 Mar – 30 Nov) · DBB · Standard Tent — single",
       "3,552"
      ],
      [
       "High Season (01 Mar – 30 Nov) · DBB · Premium Tent — per person sharing",
       "4,224"
      ],
      [
       "High Season (01 Mar – 30 Nov) · DBB · Premium Tent — single",
       "5,568"
      ],
      [
       "Tour Guide (Guide Room)",
       "1,308"
      ],
      [
       "Low Season (01 Dec – 29 Feb) · DBB · Standard Tent — per person sharing",
       "2,112"
      ],
      [
       "Low Season (01 Dec – 29 Feb) · DBB · Standard Tent — single",
       "2,784"
      ],
      [
       "Low Season (01 Dec – 29 Feb) · DBB · Premium Tent — per person sharing",
       "3,360"
      ],
      [
       "Low Season (01 Dec – 29 Feb) · DBB · Premium Tent — single",
       "4,416"
      ]
     ]
    }
   ]
  }
 },
 "twyfelfontein-country-lodge": {
  "2027": {
   "name": "Twyfelfontein Country Lodge",
   "region": "Damaraland",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "(01 Nov 2026 – 31 Oct 2027) · DBB — per person sharing",
       "3,740.28"
      ],
      [
       "(01 Nov 2026 – 31 Oct 2027) · DBB — single",
       "4,435.03"
      ],
      [
       "Damaraland Scenic Flight — Route 1, 45min (per pax, 5 sharing)",
       "3,252"
      ],
      [
       "Damaraland Scenic Flight — Route 1, 45min (per pax, 2 sharing)",
       "8,130"
      ]
     ]
    }
   ]
  }
 },
 "wilderness-damaraland-camp": {
  "2027": {
   "name": "Wilderness Damaraland Camp",
   "region": "Damaraland",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "06 Jan – 31 Mar · Fully Inclusive — per person sharing",
       "10,431.60"
      ],
      [
       "06 Jan – 31 Mar · Fully Inclusive — single",
       "13,542"
      ],
      [
       "01 Apr – 31 May · Fully Inclusive — per person sharing",
       "12,890.40"
      ],
      [
       "01 Apr – 31 May · Fully Inclusive — single",
       "16,734"
      ],
      [
       "01 Jun – 31 Oct · Fully Inclusive — per person sharing",
       "18,298.80"
      ],
      [
       "01 Jun – 31 Oct · Fully Inclusive — single",
       "23,756.40"
      ],
      [
       "01 Nov – 19 Dec · Fully Inclusive — per person sharing",
       "12,890.40"
      ],
      [
       "01 Nov – 19 Dec · Fully Inclusive — single",
       "16,734"
      ],
      [
       "20 Dec – 05 Jan · Fully Inclusive — per person sharing",
       "18,298.80"
      ],
      [
       "20 Dec – 05 Jan · Fully Inclusive — single",
       "23,756.40"
      ],
      [
       "06 Jan – 31 Mar · DBB — per person sharing",
       "6,468"
      ],
      [
       "06 Jan – 31 Mar · DBB — single",
       "8,396.40"
      ],
      [
       "01 Apr – 31 May · DBB — per person sharing",
       "8,122.80"
      ],
      [
       "01 Apr – 31 May · DBB — single",
       "10,545.60"
      ],
      [
       "01 Jun – 31 Oct · DBB — per person sharing",
       "14,571.60"
      ],
      [
       "01 Jun – 31 Oct · DBB — single",
       "18,916.80"
      ],
      [
       "01 Nov – 19 Dec · DBB — per person sharing",
       "8,356.80"
      ],
      [
       "01 Nov – 19 Dec · DBB — single",
       "10,849.20"
      ],
      [
       "20 Dec – 05 Jan · DBB — per person sharing",
       "9,342"
      ],
      [
       "20 Dec – 05 Jan · DBB — single",
       "12,128.40"
      ]
     ]
    }
   ]
  }
 },
 "wilderness-desert-rhino-camp": {
  "2027": {
   "name": "Wilderness Desert Rhino Camp",
   "region": "Damaraland",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "06 Jan – 31 Mar · Fully Inclusive — per person sharing",
       "12,666"
      ],
      [
       "06 Jan – 31 Mar · Fully Inclusive — single",
       "16,443.60"
      ],
      [
       "01 Apr – 31 May · Fully Inclusive — per person sharing",
       "13,122"
      ],
      [
       "01 Apr – 31 May · Fully Inclusive — single",
       "17,035.20"
      ],
      [
       "01 Jun – 31 Oct · Fully Inclusive — per person sharing",
       "20,830.80"
      ],
      [
       "01 Jun – 31 Oct · Fully Inclusive — single",
       "27,043.20"
      ],
      [
       "01 Nov – 19 Dec · Fully Inclusive — per person sharing",
       "13,122"
      ],
      [
       "01 Nov – 19 Dec · Fully Inclusive — single",
       "17,035.20"
      ],
      [
       "20 Dec – 05 Jan · Fully Inclusive — per person sharing",
       "20,830.80"
      ],
      [
       "20 Dec – 05 Jan · Fully Inclusive — single",
       "27,043.20"
      ]
     ]
    }
   ]
  }
 },
 "wilderness-doro-nawas": {
  "2027": {
   "name": "Wilderness Doro Nawas",
   "region": "Damaraland",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "06 Jan – 31 Mar · Fully Inclusive — per person sharing",
       "7,912.80"
      ],
      [
       "06 Jan – 31 Mar · Fully Inclusive — single",
       "10,272"
      ],
      [
       "01 Apr – 31 May · Fully Inclusive — per person sharing",
       "9,657.60"
      ],
      [
       "01 Apr – 31 May · Fully Inclusive — single",
       "12,537.60"
      ],
      [
       "01 Jun – 31 Oct · Fully Inclusive — per person sharing",
       "12,273.60"
      ],
      [
       "01 Jun – 31 Oct · Fully Inclusive — single",
       "15,933.60"
      ],
      [
       "01 Nov – 19 Dec · Fully Inclusive — per person sharing",
       "10,194"
      ],
      [
       "01 Nov – 19 Dec · Fully Inclusive — single",
       "13,233.60"
      ],
      [
       "20 Dec – 05 Jan · Fully Inclusive — per person sharing",
       "11,464.80"
      ],
      [
       "20 Dec – 05 Jan · Fully Inclusive — single",
       "14,883.60"
      ],
      [
       "06 Jan – 31 Mar · DBB — per person sharing",
       "4,868.40"
      ],
      [
       "06 Jan – 31 Mar · DBB — single",
       "6,320.40"
      ],
      [
       "01 Apr – 31 May · DBB — per person sharing",
       "6,276"
      ],
      [
       "01 Apr – 31 May · DBB — single",
       "8,148"
      ],
      [
       "01 Jun – 31 Oct · DBB — per person sharing",
       "9,256.80"
      ],
      [
       "01 Jun – 31 Oct · DBB — single",
       "12,016.80"
      ],
      [
       "01 Nov – 19 Dec · DBB — per person sharing",
       "6,244.80"
      ],
      [
       "01 Nov – 19 Dec · DBB — single",
       "8,107.20"
      ],
      [
       "20 Dec – 05 Jan · DBB — per person sharing",
       "6,637.20"
      ],
      [
       "20 Dec – 05 Jan · DBB — single",
       "8,616"
      ]
     ]
    }
   ]
  }
 },
 "etosha-king-nehale": {
  "2027": {
   "name": "Etosha King Nehale",
   "region": "East Etosha",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "Room B&B — per person sharing",
       "3,163.20"
      ],
      [
       "Room B&B — single",
       "3,954"
      ],
      [
       "Tour Guide Room (DBB)",
       "951.60"
      ]
     ]
    }
   ]
  }
 },
 "omarunga-epupa-falls-camp": {
  "2027": {
   "name": "Omarunga Epupa-Falls Camp",
   "region": "Epupa",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "Room B&B — per person sharing",
       "2,544"
      ],
      [
       "Room B&B — single",
       "3,180"
      ],
      [
       "Campsite — per person per night",
       "388.80"
      ],
      [
       "Tour Guide Room (DBB)",
       "951.60"
      ]
     ]
    }
   ]
  }
 },
 "ai-ais-hot-springs-and-spa": {
  "2027": {
   "name": "/Ai-/Ais Hot Springs and Spa",
   "region": "Fish River Canyon",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "Low Season (01 Nov – 30 Jun) · Campsite — per person camping",
       "421.20"
      ],
      [
       "High Season (01 Jul – 31 Oct) · Campsite — per person camping",
       "421.20"
      ],
      [
       "Low Season (01 Nov – 30 Jun) · Mountain view double room (2 beds) BB — per person sharing",
       "1,468.80"
      ],
      [
       "High Season (01 Jul – 31 Oct) · Mountain view double room (2 beds) BB — per person sharing",
       "1,771.20"
      ],
      [
       "Low Season (01 Nov – 30 Jun) · Mountain view double room (2 beds) BB — single",
       "1,771.20"
      ],
      [
       "High Season (01 Jul – 31 Oct) · Mountain view double room (2 beds) BB — single",
       "2,062.80"
      ],
      [
       "Low Season (01 Nov – 30 Jun) · River view double room (2 beds) BB — per person sharing",
       "1,771.20"
      ],
      [
       "High Season (01 Jul – 31 Oct) · River view double room (2 beds) BB — per person sharing",
       "2,160"
      ],
      [
       "Low Season (01 Nov – 30 Jun) · River view double room (2 beds) BB — single",
       "2,062.80"
      ],
      [
       "High Season (01 Jul – 31 Oct) · River view double room (2 beds) BB — single",
       "2,462.40"
      ],
      [
       "Low Season (01 Nov – 30 Jun) · Bush family chalet (4 beds) – min Bed only — bed only",
       "1,965.60"
      ],
      [
       "High Season (01 Jul – 31 Oct) · Bush family chalet (4 beds) – min Bed only — bed only",
       "2,354.40"
      ]
     ]
    }
   ]
  }
 },
 "boplaas-campsite": {
  "2027": {
   "name": "Boplaas Campsite",
   "region": "Fish River Canyon",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "Low Season (01 Nov – 30 Jun) · Campsite — per person camping",
       "118.80"
      ],
      [
       "High Season (01 Jul – 31 Oct) · Campsite — per person camping",
       "118.80"
      ]
     ]
    }
   ]
  }
 },
 "canyon-lodge": {
  "2027": {
   "name": "Canyon Lodge",
   "region": "Fish River Canyon",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "Room B&B — per person sharing",
       "3,143.04"
      ],
      [
       "Room B&B — single",
       "3,928.80"
      ],
      [
       "Tour Guide Room (DBB)",
       "951.60"
      ]
     ]
    }
   ]
  }
 },
 "canyon-roadhouse": {
  "2027": {
   "name": "Canyon Roadhouse",
   "region": "Fish River Canyon",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "Room B&B — per person sharing",
       "2,544"
      ],
      [
       "Room B&B — single",
       "3,180"
      ],
      [
       "Campsite — per person per night",
       "388.80"
      ],
      [
       "Tour Guide Room (DBB)",
       "951.60"
      ]
     ]
    }
   ]
  }
 },
 "canyon-village": {
  "2027": {
   "name": "Canyon Village",
   "region": "Fish River Canyon",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "Room B&B — per person sharing",
       "1,915.20"
      ],
      [
       "Room B&B — single",
       "2,394"
      ],
      [
       "Tour Guide Room (DBB)",
       "951.60"
      ]
     ]
    }
   ]
  }
 },
 "fish-river-lodge": {
  "2027": {
   "name": "Fish River Lodge",
   "region": "Fish River Canyon",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "Green Season (07 Jan – 31 Mar) · FB+ — per person sharing",
       "6,806.40"
      ],
      [
       "Low Season (01 Apr – 30 Jun & 16 Nov – 14 Dec) · FB+ — per person sharing",
       "7,713.60"
      ],
      [
       "High Season (01 Jul – 15 Nov & 15 Dec – 06 Jan) · FB+ — per person sharing",
       "8,047.20"
      ],
      [
       "Green Season (07 Jan – 31 Mar) · FB+ — single",
       "8,156.40"
      ],
      [
       "Low Season (01 Apr – 30 Jun & 16 Nov – 14 Dec) · FB+ — single",
       "9,380.40"
      ],
      [
       "High Season (01 Jul – 15 Nov & 15 Dec – 06 Jan) · FB+ — single",
       "9,831.60"
      ],
      [
       "Green Season (07 Jan – 31 Mar) · DBB — per person sharing",
       "3,928.80"
      ],
      [
       "Low Season (01 Apr – 30 Jun & 16 Nov – 14 Dec) · DBB — per person sharing",
       "4,851.60"
      ],
      [
       "High Season (01 Jul – 15 Nov & 15 Dec – 06 Jan) · DBB — per person sharing",
       "5,192.40"
      ],
      [
       "Green Season (07 Jan – 31 Mar) · DBB — single",
       "5,304"
      ],
      [
       "Low Season (01 Apr – 30 Jun & 16 Nov – 14 Dec) · DBB — single",
       "6,549.60"
      ],
      [
       "High Season (01 Jul – 15 Nov & 15 Dec – 06 Jan) · DBB — single",
       "7,009.20"
      ]
     ]
    }
   ]
  }
 },
 "hobas-lodge": {
  "2027": {
   "name": "Hobas Lodge",
   "region": "Fish River Canyon",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "Low Season (01 Nov – 30 Jun) · Campsite — per person camping",
       "518.40"
      ],
      [
       "High Season (01 Jul – 31 Oct) · Campsite — per person camping",
       "518.40"
      ],
      [
       "Low Season (01 Nov – 30 Jun) · Bush chalet (2 beds) BB — per person sharing",
       "2,041.20"
      ],
      [
       "High Season (01 Jul – 31 Oct) · Bush chalet (2 beds) BB — per person sharing",
       "2,527.20"
      ],
      [
       "Low Season (01 Nov – 30 Jun) · Bush chalet (2 beds) BB — single",
       "2,322"
      ],
      [
       "High Season (01 Jul – 31 Oct) · Bush chalet (2 beds) BB — single",
       "2,527.20"
      ]
     ]
    }
   ]
  }
 },
 "hardap-resort": {
  "2027": {
   "name": "Hardap Resort",
   "region": "Kalahari",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "Low Season (01 Nov – 30 Jun) · Campsite — per person camping",
       "237.60"
      ],
      [
       "High Season (01 Jul – 31 Oct) · Campsite — per person camping",
       "237.60"
      ],
      [
       "Low Season (01 Nov – 30 Jun) · VIP chalets (4 beds) - min BB — per person sharing",
       "1,252.80"
      ],
      [
       "High Season (01 Jul – 31 Oct) · VIP chalets (4 beds) - min BB — per person sharing",
       "1,252.80"
      ],
      [
       "Low Season (01 Nov – 30 Jun) · Family chalet (4 beds) - min BB — per person sharing",
       "928.80"
      ],
      [
       "High Season (01 Jul – 31 Oct) · Family chalet (4 beds) - min BB — per person sharing",
       "928.80"
      ],
      [
       "Low Season (01 Nov – 30 Jun) · Bush chalet (2 beds) BB — per person sharing",
       "777.60"
      ],
      [
       "High Season (01 Jul – 31 Oct) · Bush chalet (2 beds) BB — per person sharing",
       "1,252.80"
      ],
      [
       "Low Season (01 Nov – 30 Jun) · Bush chalet (2 beds) BB — single",
       "982.80"
      ],
      [
       "High Season (01 Jul – 31 Oct) · Bush chalet (2 beds) BB — single",
       "1,447.20"
      ]
     ]
    }
   ]
  }
 },
 "kalahari-anib-lodge": {
  "2027": {
   "name": "Kalahari Anib Lodge",
   "region": "Kalahari",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "Standard Room B&B — per person sharing",
       "2,715.84"
      ],
      [
       "Standard Room B&B — single",
       "3,394.80"
      ],
      [
       "Comfort Room B&B — per person sharing",
       "3,386.88"
      ],
      [
       "Comfort Room B&B — single",
       "4,233.60"
      ],
      [
       "Camping2Go (bed only) — per person sharing",
       "1,104"
      ],
      [
       "Camping2Go (bed only) — single",
       "2,208"
      ],
      [
       "Campsite — per person per night",
       "388.80"
      ],
      [
       "Tour Guide Room (DBB)",
       "951.60"
      ]
     ]
    }
   ]
  }
 },
 "kalahari-farmhouse": {
  "2027": {
   "name": "Kalahari Farmhouse",
   "region": "Kalahari",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "Room B&B — per person sharing",
       "2,040"
      ],
      [
       "Room B&B — single",
       "2,550"
      ],
      [
       "Campsite — per person per night",
       "388.80"
      ],
      [
       "Tour Guide Room (DBB)",
       "951.60"
      ]
     ]
    }
   ]
  }
 },
 "kalahari-red-dunes-lodge": {
  "2027": {
   "name": "Kalahari Red Dunes Lodge",
   "region": "Kalahari",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "High Season (01 Mar – 30 Nov) · Full Board Plus · Suite — per person sharing",
       "6,672"
      ],
      [
       "High Season (01 Mar – 30 Nov) · Full Board Plus · Suite — single",
       "8,688"
      ],
      [
       "High Season (01 Mar – 30 Nov) · Full Board Plus · Superior Suite — per person sharing",
       "8,592"
      ],
      [
       "High Season (01 Mar – 30 Nov) · Child 4–12 (Suite)",
       "3,336"
      ],
      [
       "Tour Guide (Guide Room)",
       "1,428"
      ],
      [
       "Low Season (01 Dec – 29 Feb) · Full Board Plus · Suite — per person sharing",
       "4,032"
      ],
      [
       "Low Season (01 Dec – 29 Feb) · Full Board Plus · Suite — single",
       "5,280"
      ],
      [
       "Low Season (01 Dec – 29 Feb) · Full Board Plus · Superior Suite — per person sharing",
       "6,048"
      ],
      [
       "Low Season (01 Dec – 29 Feb) · Child 4–12 (Suite)",
       "2,016"
      ]
     ]
    }
   ]
  }
 },
 "teufelskrallen-lodge": {
  "2027": {
   "name": "Teufelskrallen Lodge",
   "region": "Kalahari",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "High Season (01 Mar – 30 Nov) · DBB · Standard Tent — per person sharing",
       "2,688"
      ],
      [
       "High Season (01 Mar – 30 Nov) · DBB · Standard Tent — single",
       "3,552"
      ],
      [
       "High Season (01 Mar – 30 Nov) · Child 4–12",
       "1,344"
      ],
      [
       "Tour Guide (Guide Room)",
       "1,188"
      ],
      [
       "Low Season (01 Dec – 29 Feb) · DBB · Standard Tent — per person sharing",
       "2,016"
      ],
      [
       "Low Season (01 Dec – 29 Feb) · DBB · Standard Tent — single",
       "2,688"
      ],
      [
       "Low Season (01 Dec – 29 Feb) · Child 4–12",
       "1,008"
      ]
     ]
    }
   ]
  }
 },
 "etendeka-hiking-trails": {
  "2027": {
   "name": "Etendeka Hiking Trails",
   "region": "Kaokoland",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "Low Season (01 Jan – 30 Jun) · Full Board — per person sharing",
       "6,664.80"
      ],
      [
       "Low Season (01 Jan – 30 Jun) · Full Board — single",
       "8,282.40"
      ],
      [
       "High Season (01 Jul – 31 Dec) · Full Board — per person sharing",
       "8,154"
      ],
      [
       "High Season (01 Jul – 31 Dec) · Full Board — single",
       "10,327.20"
      ],
      [
       "CESW Conservation Levy (per person per night, additional)",
       "348"
      ]
     ]
    }
   ]
  }
 },
 "etendeka-mountain-camp": {
  "2027": {
   "name": "Etendeka Mountain Camp",
   "region": "Kaokoland",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "Low Season (1 Jan – 30 Jun) · Per Person Sharing",
       "6,079.20"
      ],
      [
       "Low Season (1 Jan – 30 Jun) · Single",
       "7,557.60"
      ],
      [
       "Low Season (1 Jan – 30 Jun) · Conservation Levy (pppn)",
       "348"
      ],
      [
       "High Season (1 Jul – 31 Dec) · Per Person Sharing",
       "7,072.80"
      ],
      [
       "High Season (1 Jul – 31 Dec) · Single",
       "8,955.60"
      ],
      [
       "High Season (1 Jul – 31 Dec) · Conservation Levy (pppn)",
       "348"
      ],
      [
       "Low — ≤3 pax (25% off)",
       "4,560"
      ],
      [
       "Low — 4+ pax (50% off)",
       "3,039.60"
      ],
      [
       "High — ≤3 pax (25% off)",
       "5,305.20"
      ],
      [
       "High — 4+ pax (50% off)",
       "3,536.40"
      ]
     ]
    }
   ]
  }
 },
 "wilderness-serra-cafema": {
  "2027": {
   "name": "Wilderness Serra Cafema",
   "region": "Kaokoland",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "06 Jan – 31 Mar · Fully Inclusive — per person sharing",
       "19,968"
      ],
      [
       "06 Jan – 31 Mar · Fully Inclusive — single",
       "25,922.40"
      ],
      [
       "01 Apr – 31 May · Fully Inclusive — per person sharing",
       "20,116.80"
      ],
      [
       "01 Apr – 31 May · Fully Inclusive — single",
       "26,116.80"
      ],
      [
       "01 Jun – 31 Oct · Fully Inclusive — per person sharing",
       "33,282"
      ],
      [
       "01 Jun – 31 Oct · Fully Inclusive — single",
       "43,207.20"
      ],
      [
       "01 Nov – 19 Dec · Fully Inclusive — per person sharing",
       "20,116.80"
      ],
      [
       "01 Nov – 19 Dec · Fully Inclusive — single",
       "26,116.80"
      ],
      [
       "20 Dec – 05 Jan · Fully Inclusive — per person sharing",
       "33,282"
      ],
      [
       "20 Dec – 05 Jan · Fully Inclusive — single",
       "43,207.20"
      ]
     ]
    }
   ]
  }
 },
 "mile-108": {
  "2027": {
   "name": "Mile 108",
   "region": "Skeleton Coast",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "Low Season (01 Nov – 30 Jun) · Campsite — per person camping",
       "205.20"
      ],
      [
       "High Season (01 Jul – 31 Oct) · Campsite — per person camping",
       "205.20"
      ],
      [
       "Low Season (01 Nov – 30 Jun) · Fisherman Chalet (max Bed only — bed only",
       "518.40"
      ],
      [
       "High Season (01 Jul – 31 Oct) · Fisherman Chalet (max Bed only — bed only",
       "518.40"
      ],
      [
       "Low Season (01 Nov – 30 Jun) · Self-contained Campsites (max — per person camping",
       "334.80"
      ],
      [
       "High Season (01 Jul – 31 Oct) · Self-contained Campsites (max — per person camping",
       "334.80"
      ]
     ]
    }
   ]
  }
 },
 "shipwreck-lodge": {
  "2027": {
   "name": "Shipwreck Lodge",
   "region": "Skeleton Coast",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "Green Season (10 Jan – 31 Mar) · FI — per person sharing",
       "18,312"
      ],
      [
       "Shoulder Season (01 Apr – 30 Apr & 01 Jun – 30 Jun & 01 Nov – 19 Dec) · FI — per person sharing",
       "22,789.20"
      ],
      [
       "High Shoulder Season (01 May – 31 May) · FI — per person sharing",
       "24,519.60"
      ],
      [
       "High Season (01 Sep – 31 Oct & 20 Dec – 09 Jan) · FI — per person sharing",
       "27,368.40"
      ],
      [
       "Peak Season (01 Jul – 31 Aug) · FI — per person sharing",
       "30,726"
      ],
      [
       "Green Season (10 Jan – 31 Mar) · FI — single",
       "25,638"
      ],
      [
       "Shoulder Season (01 Apr – 30 Apr & 01 Jun – 30 Jun & 01 Nov – 19 Dec) · FI — single",
       "31,906.80"
      ],
      [
       "High Shoulder Season (01 May – 31 May) · FI — single",
       "34,328.40"
      ],
      [
       "High Season (01 Sep – 31 Oct & 20 Dec – 09 Jan) · FI — single",
       "38,317.20"
      ],
      [
       "Peak Season (01 Jul – 31 Aug) · FI — single",
       "43,018.80"
      ]
     ]
    }
   ]
  }
 },
 "terrace-bay-resort": {
  "2027": {
   "name": "Terrace Bay Resort",
   "region": "Skeleton Coast",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "Low Season (01 Nov – 30 Jun) · Double room (2 beds) DBB — per person sharing",
       "1,879.20"
      ],
      [
       "High Season (01 Jul – 31 Oct) · Double room (2 beds) DBB — per person sharing",
       "1,425.60"
      ],
      [
       "Low Season (01 Nov – 30 Jun) · Double room (2 beds) DBB — single",
       "2,095.20"
      ],
      [
       "High Season (01 Jul – 31 Oct) · Double room (2 beds) DBB — single",
       "1,652.40"
      ],
      [
       "Low Season (01 Nov – 30 Jun) · Beach chalet (8 beds) - min Bed only — bed only",
       "1,663.20"
      ],
      [
       "High Season (01 Jul – 31 Oct) · Beach chalet (8 beds) - min Bed only — bed only",
       "1,036.80"
      ]
     ]
    }
   ]
  }
 },
 "desert-camp": {
  "2027": {
   "name": "Desert Camp",
   "region": "Sossusvlei",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "High Season · DBB — per person sharing",
       "2,551.50"
      ],
      [
       "High Season · DBB — single",
       "3,433.80"
      ],
      [
       "Low Season · DBB — per person sharing",
       "2,413.80"
      ],
      [
       "Low Season · DBB — single",
       "3,229.80"
      ],
      [
       "High Season · B&B — per person sharing",
       "1,999.50"
      ],
      [
       "High Season · B&B — single",
       "2,881.80"
      ],
      [
       "Low Season · B&B — per person sharing",
       "1,861.80"
      ],
      [
       "Low Season · B&B — single",
       "2,677.80"
      ],
      [
       "High Season · Room Only (self-catering) — per person sharing",
       "1,759.50"
      ],
      [
       "High Season · Room Only (self-catering) — single",
       "2,641.80"
      ],
      [
       "Low Season · Room Only (self-catering) — per person sharing",
       "1,621.80"
      ],
      [
       "Low Season · Room Only (self-catering) — single",
       "2,437.80"
      ],
      [
       "Breakfast",
       "240"
      ],
      [
       "Lunch",
       "348"
      ],
      [
       "Lunch Pack",
       "180"
      ],
      [
       "Dinner",
       "552"
      ],
      [
       "Sundowner / Nature Drive (lodge property)",
       "660"
      ],
      [
       "Elim Dune Nature Walk",
       "1,014"
      ],
      [
       "Sesriem Canyon Excursion",
       "834"
      ],
      [
       "Sossusvlei & Dead Vlei Excursion",
       "1,788"
      ]
     ]
    }
   ]
  }
 },
 "desert-hills-lodge": {
  "2027": {
   "name": "Desert Hills Lodge",
   "region": "Sossusvlei",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "Low Season (01 Mar – 30 Apr & 01 Dec – 28 Feb) · DBB — Luxury Chalet (per room, 1–2 guests)",
       "8,088"
      ],
      [
       "High Season (01 May – 30 Nov) · DBB — Luxury Chalet (per room, 1–2 guests)",
       "8,628"
      ],
      [
       "Low Season (01 Mar – 30 Apr & 01 Dec – 28 Feb) · Additional child 7–12 (sharing)",
       "2,028"
      ],
      [
       "High Season (01 May – 30 Nov) · Additional child 7–12 (sharing)",
       "2,160"
      ]
     ]
    }
   ]
  }
 },
 "desert-homestead-lodge": {
  "2027": {
   "name": "Desert Homestead Lodge",
   "region": "Sossusvlei",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "High Season (01 Mar – 30 Nov) · DBB · Chalet — per person sharing",
       "3,360"
      ],
      [
       "High Season (01 Mar – 30 Nov) · DBB · Chalet — single",
       "4,416"
      ],
      [
       "High Season (01 Mar – 30 Nov) · Child 4–12",
       "1,680"
      ],
      [
       "Tour Guide (Guide Room)",
       "1,188"
      ],
      [
       "Low Season (01 Dec – 29 Feb) · DBB · Chalet — per person sharing",
       "2,496"
      ],
      [
       "Low Season (01 Dec – 29 Feb) · DBB · Chalet — single",
       "3,168"
      ],
      [
       "Low Season (01 Dec – 29 Feb) · Child 4–12",
       "1,248"
      ]
     ]
    }
   ]
  }
 },
 "desert-quiver-camp": {
  "2027": {
   "name": "Desert Quiver Camp",
   "region": "Sossusvlei",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "High Season · DBB — per person sharing",
       "2,551.50"
      ],
      [
       "High Season · DBB — single",
       "3,433.80"
      ],
      [
       "Low Season · DBB — per person sharing",
       "2,413.80"
      ],
      [
       "Low Season · DBB — single",
       "3,229.80"
      ],
      [
       "High Season · B&B — per person sharing",
       "1,999.50"
      ],
      [
       "High Season · B&B — single",
       "2,881.80"
      ],
      [
       "Low Season · B&B — per person sharing",
       "1,861.80"
      ],
      [
       "Low Season · B&B — single",
       "2,677.80"
      ],
      [
       "High Season · Room Only (self-catering) — per person sharing",
       "1,759.50"
      ],
      [
       "High Season · Room Only (self-catering) — single",
       "2,641.80"
      ],
      [
       "Low Season · Room Only (self-catering) — per person sharing",
       "1,621.80"
      ],
      [
       "Low Season · Room Only (self-catering) — single",
       "2,437.80"
      ],
      [
       "Breakfast",
       "240"
      ],
      [
       "Lunch",
       "348"
      ],
      [
       "Lunch Pack",
       "180"
      ],
      [
       "Dinner",
       "552"
      ],
      [
       "Sundowner / Nature Drive (lodge property)",
       "660"
      ],
      [
       "Elim Dune Nature Walk",
       "1,014"
      ],
      [
       "Sesriem Canyon Excursion",
       "834"
      ],
      [
       "Sossusvlei & Dead Vlei Excursion",
       "1,788"
      ]
     ]
    }
   ]
  }
 },
 "desert-whisper": {
  "2027": {
   "name": "Desert Whisper",
   "region": "Sossusvlei",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "Fully inclusive (per room, max 2)",
       "31,680"
      ]
     ]
    }
   ]
  }
 },
 "hammerstein-lodge": {
  "2027": {
   "name": "Hammerstein Lodge",
   "region": "Sossusvlei",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "Low Season (01 Mar – 30 Apr & 01 Dec – 28 Feb) · DBB — Standard Room (per room, 1–2 guests)",
       "2,520"
      ],
      [
       "High Season (01 May – 30 Nov) · DBB — Standard Room (per room, 1–2 guests)",
       "2,712"
      ],
      [
       "Low Season (01 Mar – 30 Apr & 01 Dec – 28 Feb) · Additional child 7–12 (sharing)",
       "708"
      ],
      [
       "High Season (01 May – 30 Nov) · Additional child 7–12 (sharing)",
       "768"
      ],
      [
       "Camping · Per campsite (up to 4 pax)",
       "564"
      ],
      [
       "Camping · Additional camper (per person, max 6)",
       "312"
      ]
     ]
    }
   ]
  }
 },
 "namib-desert-lodge": {
  "2027": {
   "name": "Namib Desert Lodge",
   "region": "Sossusvlei",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "Room B&B — per person sharing",
       "2,440.32"
      ],
      [
       "Room B&B — single",
       "3,050.40"
      ],
      [
       "Camping2Go (bed only) — per person sharing",
       "1,104"
      ],
      [
       "Camping2Go (bed only) — single",
       "2,208"
      ],
      [
       "Campsite — per person per night",
       "388.80"
      ],
      [
       "Tour Guide Room (DBB)",
       "951.60"
      ]
     ]
    }
   ]
  }
 },
 "namib-dune-star-camp": {
  "2027": {
   "name": "Namib Dune Star Camp",
   "region": "Sossusvlei",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "Room B&B — per person sharing (one-night stay)",
       "3,546.24"
      ],
      [
       "Room B&B — single (one-night stay)",
       "4,432.80"
      ],
      [
       "Tour Guide Room (DBB)",
       "951.60"
      ]
     ]
    }
   ]
  }
 },
 "naukluft-camp": {
  "2027": {
   "name": "Naukluft Camp",
   "region": "Sossusvlei",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "Low Season (01 Nov – 30 Jun) · Campsite — per person camping",
       "496.80"
      ],
      [
       "High Season (01 Jul – 31 Oct) · Campsite — per person camping",
       "496.80"
      ],
      [
       "Low Season (01 Nov – 30 Jun) · Bush chalet (2 beds) BB — per person sharing",
       "1,566"
      ],
      [
       "High Season (01 Jul – 31 Oct) · Bush chalet (2 beds) BB — per person sharing",
       "2,160"
      ],
      [
       "Low Season (01 Nov – 30 Jun) · Bush chalet (2 beds) BB — single",
       "1,857.60"
      ],
      [
       "High Season (01 Jul – 31 Oct) · Bush chalet (2 beds) BB — single",
       "2,462.40"
      ]
     ]
    }
   ]
  }
 },
 "reverie-kalahari-pod": {
  "2027": {
   "name": "Reverie Kalahari Pod",
   "region": "Sossusvlei",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "Fully inclusive (per room, max 2)",
       "31,680"
      ]
     ]
    }
   ]
  }
 },
 "sesriem-campsite": {
  "2027": {
   "name": "Sesriem Campsite",
   "region": "Sossusvlei",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "Low Season (01 Nov – 30 Jun) · Campsite — per person camping",
       "723.60"
      ],
      [
       "High Season (01 Jul – 31 Oct) · Campsite — per person camping",
       "723.60"
      ]
     ]
    }
   ]
  }
 },
 "sossus-dune-lodge": {
  "2027": {
   "name": "Sossus Dune Lodge",
   "region": "Sossusvlei",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "Low Season (01 Nov – 30 Jun) · Dune chalet (2 beds) DBB — per person sharing",
       "4,352.40"
      ],
      [
       "High Season (01 Jul – 31 Oct) · Dune chalet (2 beds) DBB — per person sharing",
       "7,560"
      ],
      [
       "Low Season (01 Nov – 30 Jun) · Dune chalet (2 beds) DBB — single",
       "4,752"
      ],
      [
       "High Season (01 Jul – 31 Oct) · Dune chalet (2 beds) DBB — single",
       "7,970.40"
      ],
      [
       "Low Season (01 Nov – 30 Jun) · Honeymoon chalets (double bed) DBB — per person sharing",
       "4,957.20"
      ],
      [
       "High Season (01 Jul – 31 Oct) · Honeymoon chalets (double bed) DBB — per person sharing",
       "8,348.40"
      ],
      [
       "Low Season (01 Nov – 30 Jun) · Honeymoon chalets (double bed) DBB — single",
       "5,356.80"
      ],
      [
       "High Season (01 Jul – 31 Oct) · Honeymoon chalets (double bed) DBB — single",
       "8,758.80"
      ]
     ]
    }
   ]
  }
 },
 "sossus-oasis-campsite": {
  "2027": {
   "name": "Sossus Oasis Campsite",
   "region": "Sossusvlei",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "Camping — per adult per night",
       "367.20"
      ],
      [
       "Camping — per child (5–11 yrs)",
       "183.60"
      ]
     ]
    }
   ]
  }
 },
 "sossusvlei-lodge": {
  "2027": {
   "name": "Sossusvlei Lodge",
   "region": "Sossusvlei",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "High Season · Superior Room DBB — per person sharing",
       "4,363.20"
      ],
      [
       "High Season · Superior Room DBB — single",
       "6,547.20"
      ],
      [
       "Low Season · Superior Room DBB — per person sharing",
       "3,259.20"
      ],
      [
       "Low Season · Superior Room DBB — single",
       "4,896"
      ],
      [
       "High Season · Standard Room DBB — per person sharing",
       "3,748.80"
      ],
      [
       "High Season · Standard Room DBB — single",
       "5,625.60"
      ],
      [
       "Low Season · Standard Room DBB — per person sharing",
       "2,788.80"
      ],
      [
       "Low Season · Standard Room DBB — single",
       "4,185.60"
      ],
      [
       "High Season · Junior Suite DBB (per room)",
       "13,094.40"
      ],
      [
       "Low Season · Junior Suite DBB (per room)",
       "12,374.40"
      ],
      [
       "Sundowner / Nature Drive (lodge property)",
       "660"
      ],
      [
       "Elim Dune Nature Walk",
       "1,014"
      ],
      [
       "Sesriem Canyon Excursion",
       "834"
      ],
      [
       "Sossusvlei & Dead Vlei Excursion",
       "1,788"
      ],
      [
       "Sundowner / Nature Drive (min 2 pax) — per person",
       "660"
      ],
      [
       "Elim Dune Nature Walk (min 2 pax) — per person",
       "1,014"
      ],
      [
       "Sossusvlei & Dead Vlei excursion (min 4 pax) — per person",
       "1,788"
      ],
      [
       "Sesriem Canyon excursion (min 4 pax) — per person",
       "834"
      ]
     ]
    }
   ]
  }
 },
 "the-desert-grace": {
  "2027": {
   "name": "The Desert Grace",
   "region": "Sossusvlei",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "Room B&B — per person sharing",
       "5,692.80"
      ],
      [
       "Room B&B — single",
       "7,116"
      ],
      [
       "Tour Guide Room (DBB)",
       "951.60"
      ]
     ]
    }
   ]
  }
 },
 "the-pearls-beach-pods": {
  "2027": {
   "name": "The Pearls Beach Pods",
   "region": "Sossusvlei",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "The Jetty — F&B inclusive (per room, max 2)",
       "29,040"
      ],
      [
       "The Jetty — additional room (2 rooms)",
       "17,424"
      ],
      [
       "The Jetty — additional room (3 rooms)",
       "11,616"
      ],
      [
       "The Mole — F&B inclusive (per room, max 2)",
       "29,040"
      ],
      [
       "The Mole — additional room (2 rooms)",
       "17,424"
      ]
     ]
    }
   ]
  }
 },
 "we-kebi-safari-lodge": {
  "2027": {
   "name": "We Kebi Safari Lodge",
   "region": "Sossusvlei",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "Low Season (01 Mar – 30 Apr & 01 Dec – 28 Feb) · DBB — Luxury Chalet (per room, 1–2 guests)",
       "5,064"
      ],
      [
       "High Season (01 May – 30 Nov) · DBB — Luxury Chalet (per room, 1–2 guests)",
       "5,388"
      ],
      [
       "Low Season (01 Mar – 30 Apr & 01 Dec – 28 Feb) · Additional child 7–12 (sharing)",
       "1,272"
      ],
      [
       "High Season (01 May – 30 Nov) · Additional child 7–12 (sharing)",
       "1,356"
      ]
     ]
    }
   ]
  }
 },
 "wilderness-kulala-desert-lodge": {
  "2027": {
   "name": "Wilderness Kulala Desert Lodge",
   "region": "Sossusvlei",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "06 Jan – 31 Mar · Fully Inclusive — per person sharing",
       "7,550.40"
      ],
      [
       "06 Jan – 31 Mar · Fully Inclusive — single",
       "9,801.60"
      ],
      [
       "01 Apr – 31 May · Fully Inclusive — per person sharing",
       "9,050.40"
      ],
      [
       "01 Apr – 31 May · Fully Inclusive — single",
       "11,749.20"
      ],
      [
       "01 Jun – 31 Oct · Fully Inclusive — per person sharing",
       "12,874.80"
      ],
      [
       "01 Jun – 31 Oct · Fully Inclusive — single",
       "16,714.80"
      ],
      [
       "01 Nov – 19 Dec · Fully Inclusive — per person sharing",
       "9,050.40"
      ],
      [
       "01 Nov – 19 Dec · Fully Inclusive — single",
       "11,749.20"
      ],
      [
       "20 Dec – 05 Jan · Fully Inclusive — per person sharing",
       "12,091.20"
      ],
      [
       "20 Dec – 05 Jan · Fully Inclusive — single",
       "15,697.20"
      ],
      [
       "06 Jan – 31 Mar · DBB — per person sharing",
       "4,647.60"
      ],
      [
       "06 Jan – 31 Mar · DBB — single",
       "6,033.60"
      ],
      [
       "01 Apr – 31 May · DBB — per person sharing",
       "5,882.40"
      ],
      [
       "01 Apr – 31 May · DBB — single",
       "7,636.80"
      ],
      [
       "01 Jun – 31 Oct · DBB — per person sharing",
       "9,238.80"
      ],
      [
       "01 Jun – 31 Oct · DBB — single",
       "11,994"
      ],
      [
       "01 Nov – 19 Dec · DBB — per person sharing",
       "6,006"
      ],
      [
       "01 Nov – 19 Dec · DBB — single",
       "7,796.40"
      ],
      [
       "20 Dec – 05 Jan · DBB — per person sharing",
       "6,505.20"
      ],
      [
       "20 Dec – 05 Jan · DBB — single",
       "8,445.60"
      ]
     ]
    }
   ]
  }
 },
 "wilderness-little-kulala": {
  "2027": {
   "name": "Wilderness Little Kulala",
   "region": "Sossusvlei",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "06 Jan – 31 Mar · Fully Inclusive — per person sharing",
       "18,741.60"
      ],
      [
       "06 Jan – 31 Mar · Fully Inclusive — single",
       "24,331.20"
      ],
      [
       "01 Apr – 31 May · Fully Inclusive — per person sharing",
       "19,417.20"
      ],
      [
       "01 Apr – 31 May · Fully Inclusive — single",
       "25,207.20"
      ],
      [
       "01 Jun – 31 Oct · Fully Inclusive — per person sharing",
       "30,828"
      ],
      [
       "01 Jun – 31 Oct · Fully Inclusive — single",
       "40,021.20"
      ],
      [
       "01 Nov – 19 Dec · Fully Inclusive — per person sharing",
       "19,417.20"
      ],
      [
       "01 Nov – 19 Dec · Fully Inclusive — single",
       "25,207.20"
      ],
      [
       "20 Dec – 05 Jan · Fully Inclusive — per person sharing",
       "30,828"
      ],
      [
       "20 Dec – 05 Jan · Fully Inclusive — single",
       "40,021.20"
      ]
     ]
    }
   ]
  }
 },
 "wolwedans-boulders-camp": {
  "2027": {
   "name": "Wolwedans Boulders Camp",
   "region": "Sossusvlei",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "Per person sharing (FI, 01 Apr – 15 Nov)",
       "20,112"
      ],
      [
       "Child sharing",
       "5,040"
      ],
      [
       "Exclusive use — whole camp (per night)",
       "120,672"
      ],
      [
       "Guide / Pilot (per night)",
       "3,150"
      ],
      [
       "Guided Nature Walk — Morning",
       "1,074"
      ],
      [
       "Sunset Drive with drinks",
       "1,578"
      ],
      [
       "Half-day Scenic Drive (6 hrs)",
       "3,150"
      ],
      [
       "Adopt & Plant a Tree",
       "6,930"
      ],
      [
       "Adopt a Fairy Circle",
       "1,578"
      ],
      [
       "E-Biking Full Day with picnic lunch (6 hrs, min 2) — per person",
       "3,150"
      ],
      [
       "Adopt & Plant a Tree — per person",
       "6,930"
      ],
      [
       "Adopt a Fairy Circle — per person",
       "1,578"
      ],
      [
       "Dune Bush Dining Experience – morning (first 2 guests)",
       "1,890"
      ],
      [
       "Dining Under the Stars Experience – evening (first 2 guests)",
       "2,334"
      ]
     ]
    }
   ]
  }
 },
 "wolwedans-dune-camp": {
  "2027": {
   "name": "Wolwedans Dune Camp",
   "region": "Sossusvlei",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "Green Season · Standard Tent — per person sharing (FI)",
       "14,304"
      ],
      [
       "High Season · Standard Tent — per person sharing (FI)",
       "15,024"
      ],
      [
       "Green Season · additional child",
       "3,600"
      ],
      [
       "High Season · additional child",
       "3,780"
      ],
      [
       "Dune Family Suite — exclusive (per unit) · Green",
       "57,216"
      ],
      [
       "Dune Family Suite — exclusive (per unit) · High",
       "60,096"
      ],
      [
       "Guide / Pilot (per night)",
       "3,150"
      ],
      [
       "Guided Nature Walk — Morning",
       "1,074"
      ],
      [
       "Sunset Drive with drinks",
       "1,578"
      ],
      [
       "Half-day Scenic Drive (6 hrs)",
       "3,150"
      ],
      [
       "Adopt & Plant a Tree",
       "6,930"
      ],
      [
       "Adopt a Fairy Circle",
       "1,578"
      ],
      [
       "E-Biking Full Day with picnic lunch (6 hrs, min 2) — per person",
       "3,150"
      ],
      [
       "Adopt & Plant a Tree — per person",
       "6,930"
      ],
      [
       "Adopt a Fairy Circle — per person",
       "1,578"
      ],
      [
       "Dune Bush Dining Experience – morning (first 2 guests)",
       "1,890"
      ],
      [
       "Dining Under the Stars Experience – evening (first 2 guests)",
       "2,334"
      ],
      [
       "Horse Riding – Morning (2 hrs) — per person",
       "1,074"
      ],
      [
       "Horse Riding – Sunset with drinks (3 hrs, min 2) — per person",
       "1,578"
      ],
      [
       "Horse Riding – Full Day with picnic (6 hrs, min 2) — per person",
       "3,150"
      ],
      [
       "Desert Sleepout – Sundowner + Sunrise Overnight (min 2) — per person",
       "3,150"
      ],
      [
       "Namib Sky Ballooning (min 2) — per person",
       "12,864"
      ],
      [
       "Shared transfer to Kwessie/Geluk (min 2) — per person",
       "2,874"
      ]
     ]
    }
   ]
  }
 },
 "wolwedans-mountain-view-suite": {
  "2027": {
   "name": "Wolwedans Mountain View Suite",
   "region": "Sossusvlei",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "Per person sharing (FI)",
       "20,112"
      ],
      [
       "Child sharing",
       "5,040"
      ],
      [
       "Guide / Pilot (per night)",
       "3,150"
      ],
      [
       "Guided Nature Walk — Morning",
       "1,074"
      ],
      [
       "Sunset Drive with drinks",
       "1,578"
      ],
      [
       "Half-day Scenic Drive (6 hrs)",
       "3,150"
      ],
      [
       "Adopt & Plant a Tree",
       "6,930"
      ],
      [
       "Adopt a Fairy Circle",
       "1,578"
      ],
      [
       "E-Biking Full Day with picnic lunch (6 hrs, min 2) — per person",
       "3,150"
      ],
      [
       "Adopt & Plant a Tree — per person",
       "6,930"
      ],
      [
       "Adopt a Fairy Circle — per person",
       "1,578"
      ],
      [
       "Dune Bush Dining Experience – morning (first 2 guests)",
       "1,890"
      ],
      [
       "Dining Under the Stars Experience – evening (first 2 guests)",
       "2,334"
      ],
      [
       "Horse Riding – Morning (2 hrs) — per person",
       "1,074"
      ],
      [
       "Horse Riding – Sunset with drinks (3 hrs, min 2) — per person",
       "1,578"
      ],
      [
       "Horse Riding – Full Day with picnic (6 hrs, min 2) — per person",
       "3,150"
      ],
      [
       "Desert Sleepout – Sundowner + Sunrise Overnight (min 2) — per person",
       "3,150"
      ],
      [
       "Namib Sky Ballooning (min 2) — per person",
       "12,864"
      ],
      [
       "Shared transfer to Kwessie/Geluk (min 2) — per person",
       "2,874"
      ]
     ]
    }
   ]
  }
 },
 "wolwedans-plains-camp": {
  "2027": {
   "name": "Wolwedans Plains Camp",
   "region": "Sossusvlei",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "Per person sharing (FI)",
       "20,112"
      ],
      [
       "Child sharing",
       "5,040"
      ],
      [
       "Exclusive use — whole camp (per night)",
       "80,448"
      ],
      [
       "Guide / Pilot (per night)",
       "3,150"
      ],
      [
       "Guided Nature Walk — Morning",
       "1,074"
      ],
      [
       "Sunset Drive with drinks",
       "1,578"
      ],
      [
       "Half-day Scenic Drive (6 hrs)",
       "3,150"
      ],
      [
       "Adopt & Plant a Tree",
       "6,930"
      ],
      [
       "Adopt a Fairy Circle",
       "1,578"
      ],
      [
       "E-Biking Full Day with picnic lunch (6 hrs, min 2) — per person",
       "3,150"
      ],
      [
       "Adopt & Plant a Tree — per person",
       "6,930"
      ],
      [
       "Adopt a Fairy Circle — per person",
       "1,578"
      ],
      [
       "Dune Bush Dining Experience – morning (first 2 guests)",
       "1,890"
      ],
      [
       "Dining Under the Stars Experience – evening (first 2 guests)",
       "2,334"
      ],
      [
       "Horse Riding – Morning (2 hrs) — per person",
       "1,074"
      ],
      [
       "Horse Riding – Sunset with drinks (3 hrs, min 2) — per person",
       "1,578"
      ],
      [
       "Horse Riding – Full Day with picnic (6 hrs, min 2) — per person",
       "3,150"
      ],
      [
       "Desert Sleepout – Sundowner + Sunrise Overnight (min 2) — per person",
       "3,150"
      ],
      [
       "Namib Sky Ballooning (min 2) — per person",
       "12,864"
      ],
      [
       "Shared transfer to Kwessie/Geluk (min 2) — per person",
       "2,874"
      ]
     ]
    }
   ]
  }
 },
 "etosha-oberland-lodge": {
  "2027": {
   "name": "Etosha Oberland Lodge",
   "region": "South Etosha",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "High Season (01 Mar – 30 Nov) · Full Board Plus · Suite — per person sharing",
       "8,467.20"
      ],
      [
       "High Season (01 Mar – 30 Nov) · Full Board Plus · Suite — single",
       "11,040"
      ],
      [
       "High Season (01 Mar – 30 Nov) · Child 4–12",
       "4,233.60"
      ],
      [
       "Tour Guide (Guide Room)",
       "1,428"
      ],
      [
       "Low Season (01 Dec – 29 Feb) · Full Board Plus · Suite — per person sharing",
       "6,960"
      ],
      [
       "Low Season (01 Dec – 29 Feb) · Full Board Plus · Suite — single",
       "9,072"
      ],
      [
       "Low Season (01 Dec – 29 Feb) · Child 4–12",
       "3,480"
      ]
     ]
    }
   ]
  }
 },
 "etosha-omusati-lodge": {
  "2027": {
   "name": "Etosha Omusati Lodge",
   "region": "South Etosha",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "Low Season (01 Mar – 30 Apr & 01 Dec – 28 Feb) · DBB — Bush Chalet/Bungalow (per room, 1–2 guests)",
       "3,444"
      ],
      [
       "High Season (01 May – 30 Nov) · DBB — Bush Chalet/Bungalow (per room, 1–2 guests)",
       "3,672"
      ],
      [
       "Low Season (01 Mar – 30 Apr & 01 Dec – 28 Feb) · Additional child 7–12 (sharing)",
       "912"
      ],
      [
       "High Season (01 May – 30 Nov) · Additional child 7–12 (sharing)",
       "984"
      ],
      [
       "Camping · Per campsite (up to 4 pax)",
       "564"
      ],
      [
       "Camping · Additional camper (per person, max 6)",
       "312"
      ]
     ]
    }
   ]
  }
 },
 "etosha-safari-camping2go": {
  "2027": {
   "name": "Etosha Safari Camping2Go",
   "region": "South Etosha",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "Camping2Go (bed only) — per person sharing",
       "1,104"
      ],
      [
       "Camping2Go (bed only) — single",
       "2,208"
      ]
     ]
    }
   ]
  }
 },
 "etosha-safari-lodge": {
  "2027": {
   "name": "Etosha Safari Lodge",
   "region": "South Etosha",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "Room B&B — per person sharing",
       "3,572.16"
      ],
      [
       "Room B&B — single",
       "4,465.20"
      ],
      [
       "Tour Guide Room (DBB)",
       "951.60"
      ]
     ]
    }
   ]
  }
 },
 "etosha-trading-post-campsite": {
  "2027": {
   "name": "Etosha Trading Post Campsite",
   "region": "South Etosha",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "Camping — per adult per night",
       "367.20"
      ],
      [
       "Camping — per child (5–11 yrs)",
       "183.60"
      ]
     ]
    }
   ]
  }
 },
 "etosha-village": {
  "2027": {
   "name": "Etosha Village",
   "region": "South Etosha",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "High Season · DBB — per person sharing",
       "2,659.20"
      ],
      [
       "High Season · DBB — single",
       "3,993.60"
      ],
      [
       "Low Season · DBB — per person sharing",
       "2,376"
      ],
      [
       "Low Season · DBB — single",
       "3,566.40"
      ],
      [
       "Breakfast",
       "240"
      ],
      [
       "Lunch",
       "348"
      ],
      [
       "Lunch Pack",
       "180"
      ],
      [
       "Dinner",
       "552"
      ],
      [
       "Morning Game Drive (Etosha)",
       "1,824"
      ],
      [
       "Full Day Game Drive (Etosha)",
       "2,172"
      ],
      [
       "Sundowner Drive",
       "660"
      ],
      [
       "Sunrise Guided Walk",
       "624"
      ],
      [
       "Stargazing (guided)",
       "528"
      ],
      [
       "Etosha NP Morning Game Drive (min 4 pax) — per person",
       "1,824"
      ],
      [
       "Etosha NP Full Day Game Drive (min 4 pax) — per person",
       "2,172"
      ],
      [
       "Sundowner Drive – private reserve (min 4 pax) — per person",
       "660"
      ],
      [
       "Sunrise Guided Walk (min 2 pax, max 8) — per person",
       "624"
      ],
      [
       "Stargazing – seasonal (min 2 pax) — per person",
       "528"
      ]
     ]
    }
   ]
  }
 },
 "etosha-village-campsite": {
  "2027": {
   "name": "Etosha Village Campsite",
   "region": "South Etosha",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "Camping — per adult per night",
       "367.20"
      ],
      [
       "Camping — per child (5–11 yrs)",
       "183.60"
      ],
      [
       "Morning Game Drive (Etosha)",
       "1,824"
      ],
      [
       "Full Day Game Drive (Etosha)",
       "2,172"
      ],
      [
       "Sundowner Drive",
       "660"
      ],
      [
       "Sunrise Guided Walk",
       "624"
      ],
      [
       "Stargazing (guided)",
       "528"
      ]
     ]
    }
   ]
  }
 },
 "okaukuejo-camp": {
  "2027": {
   "name": "Okaukuejo Camp",
   "region": "South Etosha",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "Low Season (01 Nov – 30 Jun) · Campsite — per person camping",
       "496.80"
      ],
      [
       "High Season (01 Jul – 31 Oct) · Campsite — per person camping",
       "604.80"
      ],
      [
       "Low Season (01 Nov – 30 Jun) · Double room A (2 beds) BB — per person sharing",
       "2,052"
      ],
      [
       "High Season (01 Jul – 31 Oct) · Double room A (2 beds) BB — per person sharing",
       "2,570.40"
      ],
      [
       "Low Season (01 Nov – 30 Jun) · Double room A (2 beds) BB — single",
       "2,300.40"
      ],
      [
       "High Season (01 Jul – 31 Oct) · Double room A (2 beds) BB — single",
       "2,991.60"
      ],
      [
       "Low Season (01 Nov – 30 Jun) · Double room B (2 beds) BB — per person sharing",
       "2,052"
      ],
      [
       "High Season (01 Jul – 31 Oct) · Double room B (2 beds) BB — per person sharing",
       "2,570.40"
      ],
      [
       "Low Season (01 Nov – 30 Jun) · Double room B (2 beds) BB — single",
       "2,300.40"
      ],
      [
       "High Season (01 Jul – 31 Oct) · Double room B (2 beds) BB — single",
       "2,991.60"
      ],
      [
       "Low Season (01 Nov – 30 Jun) · Bush chalet (2 beds, disabled access) BB — per person sharing",
       "2,052"
      ],
      [
       "High Season (01 Jul – 31 Oct) · Bush chalet (2 beds, disabled access) BB — per person sharing",
       "2,732.40"
      ],
      [
       "Low Season (01 Nov – 30 Jun) · Bush chalet (2 beds, disabled access) BB — single",
       "2,300.40"
      ],
      [
       "High Season (01 Jul – 31 Oct) · Bush chalet (2 beds, disabled access) BB — single",
       "3,164.40"
      ],
      [
       "Low Season (01 Nov – 30 Jun) · Bush chalet (2 beds) BB — per person sharing",
       "2,386.80"
      ],
      [
       "High Season (01 Jul – 31 Oct) · Bush chalet (2 beds) BB — per person sharing",
       "2,894.40"
      ],
      [
       "Low Season (01 Nov – 30 Jun) · Bush chalet (2 beds) BB — single",
       "2,646"
      ],
      [
       "High Season (01 Jul – 31 Oct) · Bush chalet (2 beds) BB — single",
       "3,337.20"
      ],
      [
       "Low Season (01 Nov – 30 Jun) · Family chalet (4 beds) - min BB — per person sharing",
       "2,300.40"
      ],
      [
       "High Season (01 Jul – 31 Oct) · Family chalet (4 beds) - min BB — per person sharing",
       "3,078"
      ],
      [
       "Low Season (01 Nov – 30 Jun) · Waterhole chalet (2 beds) BB — per person sharing",
       "2,570.40"
      ],
      [
       "High Season (01 Jul – 31 Oct) · Waterhole chalet (2 beds) BB — per person sharing",
       "3,758.40"
      ],
      [
       "Low Season (01 Nov – 30 Jun) · Waterhole chalet (2 beds) BB — single",
       "2,829.60"
      ],
      [
       "High Season (01 Jul – 31 Oct) · Waterhole chalet (2 beds) BB — single",
       "4,179.60"
      ],
      [
       "Low Season (01 Nov – 30 Jun) · Premier Waterhole Chalet (double BB — per person sharing",
       "4,276.80"
      ],
      [
       "High Season (01 Jul – 31 Oct) · Premier Waterhole Chalet (double BB — per person sharing",
       "6,404.40"
      ]
     ]
    }
   ]
  }
 },
 "okutala-etosha-lodge": {
  "2027": {
   "name": "Okutala Etosha Lodge",
   "region": "South Etosha",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "Season 1 (01 Jan – 31 Mar) · Hilltop Chalet DBB — per person sharing",
       "2,702.40"
      ],
      [
       "Season 1 (01 Jan – 31 Mar) · Hilltop Chalet DBB — single",
       "3,110.40"
      ],
      [
       "Season 2 (01 Apr – 31 Dec) · Hilltop Chalet DBB — per person sharing",
       "3,379.20"
      ],
      [
       "Season 2 (01 Apr – 31 Dec) · Hilltop Chalet DBB — single",
       "3,883.20"
      ],
      [
       "Season 1 (01 Jan – 31 Mar) · Lodge Luxury Room DBB — per person sharing",
       "2,702.40"
      ],
      [
       "Season 1 (01 Jan – 31 Mar) · Lodge Luxury Room DBB — single",
       "3,110.40"
      ],
      [
       "Season 2 (01 Apr – 31 Dec) · Lodge Luxury Room DBB — per person sharing",
       "3,379.20"
      ],
      [
       "Season 2 (01 Apr – 31 Dec) · Lodge Luxury Room DBB — single",
       "3,883.20"
      ],
      [
       "Season 1 (01 Jan – 31 Mar) · King Suite DBB — per person sharing",
       "3,456"
      ],
      [
       "Season 1 (01 Jan – 31 Mar) · King Suite DBB — single",
       "4,032"
      ],
      [
       "Season 2 (01 Apr – 31 Dec) · King Suite DBB — per person sharing",
       "4,032"
      ],
      [
       "Season 2 (01 Apr – 31 Dec) · King Suite DBB — single",
       "4,992"
      ],
      [
       "Guide Room (per guide)",
       "691.20"
      ],
      [
       "Light Lunch",
       "504"
      ],
      [
       "Lunch Pack",
       "240"
      ],
      [
       "Bush Picnic Lunch",
       "264"
      ],
      [
       "Etosha Day Tour (8 hrs) — per person",
       "2,106"
      ],
      [
       "Morning Game/Nature Drive (2 hrs) — per person",
       "820.80"
      ],
      [
       "Afternoon Game/Nature Drive (2 hrs) — per person",
       "820.80"
      ],
      [
       "Night Drive — per person",
       "918"
      ],
      [
       "Morning Hiking Tour — per person",
       "421.20"
      ],
      [
       "Afternoon Hiking Tour — per person",
       "421.20"
      ]
     ]
    }
   ]
  }
 },
 "olifantsrus-campsite": {
  "2027": {
   "name": "Olifantsrus Campsite",
   "region": "South Etosha",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "Low Season (01 Nov – 30 Jun) · Campsite — per person camping",
       "550.80"
      ],
      [
       "High Season (01 Jul – 31 Oct) · Campsite — per person camping",
       "550.80"
      ]
     ]
    }
   ]
  }
 },
 "onkoshi-camp": {
  "2027": {
   "name": "Onkoshi Camp",
   "region": "South Etosha",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "Low Season (01 Nov – 30 Jun) · Onkoshi chalet (2 beds) DBB — per person sharing",
       "3,434.40"
      ],
      [
       "High Season (01 Jul – 31 Oct) · Onkoshi chalet (2 beds) DBB — per person sharing",
       "4,665.60"
      ],
      [
       "Low Season (01 Nov – 30 Jun) · Onkoshi chalet (2 beds) DBB — single",
       "3,769.20"
      ],
      [
       "High Season (01 Jul – 31 Oct) · Onkoshi chalet (2 beds) DBB — single",
       "5,000.40"
      ],
      [
       "Low Season (01 Nov – 30 Jun) · Onkoshi honeymoon chalets DBB — per person sharing",
       "3,844.80"
      ],
      [
       "High Season (01 Jul – 31 Oct) · Onkoshi honeymoon chalets DBB — per person sharing",
       "5,508"
      ],
      [
       "Low Season (01 Nov – 30 Jun) · Onkoshi honeymoon chalets DBB — single",
       "4,190.40"
      ],
      [
       "High Season (01 Jul – 31 Oct) · Onkoshi honeymoon chalets DBB — single",
       "5,832"
      ]
     ]
    }
   ]
  }
 },
 "the-ekipa-etosha-pod": {
  "2027": {
   "name": "The Ekipa Etosha Pod",
   "region": "South Etosha",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "Fully inclusive (per room, max 2)",
       "31,680"
      ]
     ]
    }
   ]
  }
 },
 "toshari-lodge": {
  "2027": {
   "name": "Toshari Lodge",
   "region": "South Etosha",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "Low Season (01 Jan – 31 Mar) · Bush Room — per person sharing",
       "1,602"
      ],
      [
       "Low Season (01 Jan – 31 Mar) · Bush Chalet — per person sharing",
       "1,770"
      ],
      [
       "Low Season (01 Jan – 31 Mar) · Bush Room — single",
       "2,160"
      ],
      [
       "Low Season (01 Jan – 31 Mar) · Bush Chalet — single",
       "2,412"
      ],
      [
       "Shoulder Season (01 Apr – 30 Jun & 01 – 31 Dec) · Bush Room — per person sharing",
       "1,722"
      ],
      [
       "Shoulder Season (01 Apr – 30 Jun & 01 – 31 Dec) · Bush Chalet — per person sharing",
       "1,860"
      ],
      [
       "Shoulder Season (01 Apr – 30 Jun & 01 – 31 Dec) · Bush Room — single",
       "2,316"
      ],
      [
       "Shoulder Season (01 Apr – 30 Jun & 01 – 31 Dec) · Bush Chalet — single",
       "2,544"
      ],
      [
       "High Season (01 Jul – 30 Nov) · Bush Room — per person sharing",
       "2,016"
      ],
      [
       "High Season (01 Jul – 30 Nov) · Bush Chalet — per person sharing",
       "2,130"
      ],
      [
       "High Season (01 Jul – 30 Nov) · Bush Room — single",
       "2,706"
      ],
      [
       "High Season (01 Jul – 30 Nov) · Bush Chalet — single",
       "2,928"
      ],
      [
       "Camping — per person",
       "348"
      ]
     ]
    }
   ]
  }
 },
 "ocean-house-guesthouse": {
  "2027": {
   "name": "Ocean House Guesthouse",
   "region": "Swakopmund",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "Low Season (01 Mar – 30 Apr & 01 Jan – 28 Feb) · DBB — Standard Room (per room, 1–2 guests)",
       "2,700"
      ],
      [
       "High Season (01 May – 31 Dec) · DBB — Standard Room (per room, 1–2 guests)",
       "2,868"
      ],
      [
       "Low Season (01 Mar – 30 Apr & 01 Jan – 28 Feb) · Additional child 7–12 (sharing)",
       "696"
      ],
      [
       "High Season (01 May – 31 Dec) · Additional child 7–12 (sharing)",
       "756"
      ]
     ]
    }
   ]
  }
 },
 "swakopmund-sands": {
  "2027": {
   "name": "Swakopmund Sands",
   "region": "Swakopmund",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "Low Season (01 Jan – 31 Mar) · Classic / Cottage Room — pp sharing",
       "1,308"
      ],
      [
       "Low Season (01 Jan – 31 Mar) · Luxury Room — pp sharing",
       "1,704"
      ],
      [
       "Low Season (01 Jan – 31 Mar) · Luxury Suite — pp sharing",
       "1,872"
      ],
      [
       "Low Season (01 Jan – 31 Mar) · Sea View Cottage Suite — pp sharing",
       "2,478"
      ],
      [
       "Low Season (01 Jan – 31 Mar) · Classic / Cottage Room — single",
       "1,728"
      ],
      [
       "Low Season (01 Jan – 31 Mar) · Luxury Room — single",
       "2,160"
      ],
      [
       "Low Season (01 Jan – 31 Mar) · Luxury Suite — single",
       "2,412"
      ],
      [
       "Low Season (01 Jan – 31 Mar) · Sea View Cottage Suite — single",
       "2,994"
      ],
      [
       "Shoulder Season (01 Apr – 30 Jun & 01 – 31 Dec) · Classic / Cottage Room — pp sharing",
       "1,452"
      ],
      [
       "Shoulder Season (01 Apr – 30 Jun & 01 – 31 Dec) · Luxury Room — pp sharing",
       "1,896"
      ],
      [
       "Shoulder Season (01 Apr – 30 Jun & 01 – 31 Dec) · Luxury Suite — pp sharing",
       "2,088"
      ],
      [
       "Shoulder Season (01 Apr – 30 Jun & 01 – 31 Dec) · Sea View Cottage Suite — pp sharing",
       "2,700"
      ],
      [
       "Shoulder Season (01 Apr – 30 Jun & 01 – 31 Dec) · Classic / Cottage Room — single",
       "1,902"
      ],
      [
       "Shoulder Season (01 Apr – 30 Jun & 01 – 31 Dec) · Luxury Room — single",
       "2,394"
      ],
      [
       "Shoulder Season (01 Apr – 30 Jun & 01 – 31 Dec) · Luxury Suite — single",
       "2,688"
      ],
      [
       "Shoulder Season (01 Apr – 30 Jun & 01 – 31 Dec) · Sea View Cottage Suite — single",
       "3,336"
      ],
      [
       "High Season (01 Jul – 30 Nov) · Classic / Cottage Room — pp sharing",
       "1,662"
      ],
      [
       "High Season (01 Jul – 30 Nov) · Luxury Room — pp sharing",
       "2,076"
      ],
      [
       "High Season (01 Jul – 30 Nov) · Luxury Suite — pp sharing",
       "2,268"
      ],
      [
       "High Season (01 Jul – 30 Nov) · Sea View Cottage Suite — pp sharing",
       "2,958"
      ],
      [
       "High Season (01 Jul – 30 Nov) · Classic / Cottage Room — single",
       "2,184"
      ],
      [
       "High Season (01 Jul – 30 Nov) · Luxury Room — single",
       "2,640"
      ],
      [
       "High Season (01 Jul – 30 Nov) · Luxury Suite — single",
       "2,928"
      ],
      [
       "High Season (01 Jul – 30 Nov) · Sea View Cottage Suite — single",
       "3,624"
      ]
     ]
    }
   ]
  }
 },
 "the-delight-swakopmund": {
  "2027": {
   "name": "The Delight Swakopmund",
   "region": "Swakopmund",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "Room B&B — per person sharing",
       "2,021.76"
      ],
      [
       "Room B&B — single",
       "2,527.20"
      ],
      [
       "Tour Guide Room (B&B)",
       "2,021.76"
      ]
     ]
    }
   ]
  }
 },
 "dolomite-camp": {
  "2027": {
   "name": "Dolomite Camp",
   "region": "West Etosha",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "Low Season (01 Nov – 30 Jun) · Bush chalet (2 beds) DBB — per person sharing",
       "3,434.40"
      ],
      [
       "High Season (01 Jul – 31 Oct) · Bush chalet (2 beds) DBB — per person sharing",
       "4,665.60"
      ],
      [
       "Low Season (01 Nov – 30 Jun) · Bush chalet (2 beds) DBB — single",
       "3,769.20"
      ],
      [
       "High Season (01 Jul – 31 Oct) · Bush chalet (2 beds) DBB — single",
       "5,000.40"
      ],
      [
       "Low Season (01 Nov – 30 Jun) · Deluxe chalet (Double bed) DBB — per person sharing",
       "3,844.80"
      ],
      [
       "High Season (01 Jul – 31 Oct) · Deluxe chalet (Double bed) DBB — per person sharing",
       "5,508"
      ],
      [
       "Low Season (01 Nov – 30 Jun) · Deluxe chalet (Double bed) DBB — single",
       "4,190.40"
      ],
      [
       "High Season (01 Jul – 31 Oct) · Deluxe chalet (Double bed) DBB — single",
       "5,832"
      ]
     ]
    }
   ]
  }
 },
 "okapuka-safari-lodge": {
  "2027": {
   "name": "Okapuka Safari Lodge",
   "region": "Windhoek",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "Standard Safari Room B&B — per person sharing",
       "2,039.04"
      ],
      [
       "Standard Safari Room B&B — single",
       "2,548.80"
      ],
      [
       "Classic Safari Room B&B — per person sharing",
       "2,490.24"
      ],
      [
       "Classic Safari Room B&B — single",
       "3,112.80"
      ],
      [
       "Luxury Safari Suite B&B — per person sharing",
       "3,053.76"
      ],
      [
       "Luxury Safari Suite B&B — single",
       "3,817.20"
      ],
      [
       "Tour Guide Room (DBB)",
       "2,039.04"
      ]
     ]
    }
   ]
  }
 },
 "olive-grove-guesthouse": {
  "2027": {
   "name": "Olive Grove Guesthouse",
   "region": "Windhoek",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "Low Season (01 Jan – 30 Jun & 01 – 31 Dec) · Classic Room — per person sharing",
       "1,452"
      ],
      [
       "Low Season (01 Jan – 30 Jun & 01 – 31 Dec) · Terrace Room — per person sharing",
       "2,040"
      ],
      [
       "Low Season (01 Jan – 30 Jun & 01 – 31 Dec) · Terrace Suite — per person sharing",
       "2,322"
      ],
      [
       "Low Season (01 Jan – 30 Jun & 01 – 31 Dec) · Classic Room — single",
       "2,040"
      ],
      [
       "Low Season (01 Jan – 30 Jun & 01 – 31 Dec) · Terrace Room — single",
       "2,832"
      ],
      [
       "Low Season (01 Jan – 30 Jun & 01 – 31 Dec) · Terrace Suite — single",
       "3,270"
      ],
      [
       "High Season (01 Jul – 30 Nov) · Classic Room — per person sharing",
       "1,566"
      ],
      [
       "High Season (01 Jul – 30 Nov) · Terrace Room — per person sharing",
       "2,178"
      ],
      [
       "High Season (01 Jul – 30 Nov) · Terrace Suite — per person sharing",
       "2,448"
      ],
      [
       "High Season (01 Jul – 30 Nov) · Classic Room — single",
       "2,178"
      ],
      [
       "High Season (01 Jul – 30 Nov) · Terrace Room — single",
       "2,958"
      ],
      [
       "High Season (01 Jul – 30 Nov) · Terrace Suite — single",
       "3,432"
      ]
     ]
    }
   ]
  }
 },
 "onjala-lodge": {
  "2027": {
   "name": "Onjala",
   "region": "Windhoek",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "Low Season (01 Dec – 30 Jun) · DBB — per person sharing",
       "2,592"
      ],
      [
       "Low Season (01 Dec – 30 Jun) · Single supplement",
       "648"
      ],
      [
       "Low Season (01 Dec – 30 Jun) · Day room — per person",
       "1,620"
      ],
      [
       "High Season (01 Jul – 30 Nov) · DBB — per person sharing",
       "3,240"
      ],
      [
       "High Season (01 Jul – 30 Nov) · Single supplement",
       "810"
      ]
     ]
    }
   ]
  }
 },
 "the-weinberg-windhoek": {
  "2027": {
   "name": "The Weinberg",
   "region": "Windhoek",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "Courtyard Room B&B — per person sharing",
       "2,985.60"
      ],
      [
       "Courtyard Room B&B — single",
       "4,179.84"
      ],
      [
       "Superior Upper-Level B&B — per person sharing",
       "3,276.48"
      ],
      [
       "Superior Upper-Level B&B — single",
       "4,587.07"
      ],
      [
       "Loft Room B&B — per person sharing",
       "4,173.12"
      ],
      [
       "Loft Room B&B — single",
       "5,842.37"
      ],
      [
       "Terrace Suite B&B (per room, max 2)",
       "15,840"
      ],
      [
       "Terrace Suite supplement",
       "5,280"
      ],
      [
       "Tour Guide Single (B&B)",
       "2,985.60"
      ]
     ]
    }
   ]
  }
 },
 "ti-melen": {
  "2027": {
   "name": "Ti Melen",
   "region": "Windhoek",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "B&B · Room — per person sharing",
       "1,632"
      ],
      [
       "B&B · Room — single",
       "2,400"
      ],
      [
       "Child 4–12",
       "1,152"
      ],
      [
       "Tour Guide (Guide Room)",
       "1,188"
      ]
     ]
    }
   ]
  }
 },
 "weinberg-urban-pod": {
  "2027": {
   "name": "Weinberg Urban Pod",
   "region": "Windhoek",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "Urban Pod — F&B inclusive (per room, max 2)",
       "31,680"
      ],
      [
       "Additional room supplement (2 rooms)",
       "19,008"
      ],
      [
       "Additional room supplement (3 rooms)",
       "12,672"
      ]
     ]
    }
   ]
  }
 },
 "namib-outpost": {
  "2027": {
   "name": "Namib Outpost",
   "region": "Sossusvlei",
   "currency": "N$",
   "validity": "2027 season",
   "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
   "sections": [
    {
     "title": "2027 — rack",
     "rows": [
      [
       "High Season (01 Mar – 30 Nov) · Full Board Plus · Suite — per person sharing",
       "8,467.20"
      ],
      [
       "High Season (01 Mar – 30 Nov) · Full Board Plus · Suite — single",
       "11,040"
      ],
      [
       "High Season (01 Mar – 30 Nov) · Full Board Plus · Superior Suite — per person sharing",
       "12,720"
      ],
      [
       "High Season (01 Mar – 30 Nov) · Child 4–12 (Suite)",
       "4,233.60"
      ],
      [
       "Tour Guide (Guide Room)",
       "1,428"
      ],
      [
       "Low Season (01 Dec – 29 Feb) · Full Board Plus · Suite — per person sharing",
       "6,960"
      ],
      [
       "Low Season (01 Dec – 29 Feb) · Full Board Plus · Suite — single",
       "9,072"
      ],
      [
       "Low Season (01 Dec – 29 Feb) · Full Board Plus · Superior Suite — per person sharing",
       "10,560"
      ],
      [
       "Low Season (01 Dec – 29 Feb) · Child 4–12 (Suite)",
       "3,480"
      ]
     ]
    }
   ]
  }
 }
});

// --------------------------------------------------------------------------
// Rack for the sheet-only lodges. Where the supplier sheet prints its own rack
// column that is what appears here; where it prints only a net rate the rack is
// that rate at the house +20% ceiling, and says so in its note.
// --------------------------------------------------------------------------
Object.assign(SHEET_RACK_BY_YEAR, {
  "chobe-princess": {
    "2026": {
      "name": "Chobe Princess",
      "region": "Chobe",
      "currency": "N$",
      "validity": "2026",
      "note": "Published rack rates from the supplier sheet.",
      "sections": [
        {
          "title": "1 March – 30 November 2026",
          "rows": [
            [
              "Cabin — PP Sharing — 1 March – 30 November 2026",
              "13,432"
            ]
          ]
        },
        {
          "title": "1 December 2026 – 28 February 2027",
          "rows": [
            [
              "Cabin — PP Sharing — 1 December 2026 – 28 February 2027",
              "10,896"
            ]
          ]
        },
        {
          "title": "Levy & Guide",
          "rows": [
            [
              "Conservation & Community Levy (pppn)",
              "150"
            ],
            [
              "Tour Guide (per night, at Ichingo)",
              "3,800"
            ]
          ]
        }
      ]
    }
  },
  "ichingo-chobe-river-lodge": {
    "2026": {
      "name": "Ichingo Chobe River Lodge",
      "region": "Chobe",
      "currency": "N$",
      "validity": "2026",
      "note": "Published rack rates from the supplier sheet.",
      "sections": [
        {
          "title": "1 March – 30 November 2026",
          "rows": [
            [
              "PP Sharing — 1 March – 30 November 2026",
              "9,247"
            ]
          ]
        },
        {
          "title": "1 December 2026 – 28 February 2027",
          "rows": [
            [
              "PP Sharing — 1 December 2026 – 28 February 2027",
              "8,556"
            ]
          ]
        },
        {
          "title": "Levy & Guide",
          "rows": [
            [
              "Conservation & Community Levy (pppn)",
              "150"
            ],
            [
              "Guide Tent (per night)",
              "3,800"
            ]
          ]
        }
      ]
    }
  },
  "zambezi-queen": {
    "2026": {
      "name": "Zambezi Queen",
      "region": "Chobe",
      "currency": "N$",
      "validity": "2026",
      "note": "Published rack rates from the supplier sheet.",
      "sections": [
        {
          "title": "1 March – 30 November 2026",
          "rows": [
            [
              "Suite — PP Sharing — 1 March – 30 November 2026",
              "17,570"
            ],
            [
              "Luxury Suite — PP Sharing — 1 March – 30 November 2026",
              "20,739"
            ]
          ]
        },
        {
          "title": "1 December 2026 – 28 February 2027",
          "rows": [
            [
              "Suite — PP Sharing — 1 December 2026 – 28 February 2027",
              "15,819"
            ],
            [
              "Luxury Suite — PP Sharing — 1 December 2026 – 28 February 2027",
              "18,662"
            ]
          ]
        },
        {
          "title": "Levy & Guide",
          "rows": [
            [
              "Conservation & Community Levy (pppn)",
              "250"
            ],
            [
              "Tour Guide Cabin (per night, 2–9 suites)",
              "4,800"
            ]
          ]
        }
      ]
    }
  },
  "palmwag-under-canvas-sleep-out": {
    "2026": {
      "name": "Palmwag Under-Canvas Sleep-Out",
      "region": "Damaraland",
      "currency": "N$",
      "validity": "2026",
      "note": "Published rack rates from the supplier sheet.",
      "sections": [
        {
          "title": "STO 25% Rate -- All-Inclusive Sleep-Out",
          "rows": [
            [
              "Sharing/Single tent pp -- meals, beverages and activities included",
              "4,995"
            ]
          ]
        }
      ]
    }
  },
  "dead-valley-lodge": {
    "2026": {
      "name": "Dead Valley Lodge",
      "region": "Sossusvlei",
      "currency": "N$",
      "validity": "2026",
      "note": "Published rack rates from the supplier sheet.",
      "sections": [
        {
          "title": "Low Season (1 Nov 2025 – 31 May 2026)",
          "rows": [
            [
              "Per Person Sharing — Low Season (1 Nov 2025 – 31 May 2026)",
              "4,400"
            ],
            [
              "Per Person Single — Low Season (1 Nov 2025 – 31 May 2026)",
              "4,900"
            ]
          ]
        },
        {
          "title": "High Season (1 Jun – 31 Oct 2026)",
          "rows": [
            [
              "Per Person Sharing — High Season (1 Jun – 31 Oct 2026)",
              "6,000"
            ],
            [
              "Per Person Single — High Season (1 Jun – 31 Oct 2026)",
              "6,300"
            ]
          ]
        },
        {
          "title": "Low Season (1 Nov 2026 – 31 May 2027)",
          "rows": [
            [
              "Per Person Sharing — Low Season (1 Nov 2026 – 31 May 2027)",
              "4,700"
            ],
            [
              "Per Person Single — Low Season (1 Nov 2026 – 31 May 2027)",
              "5,200"
            ]
          ]
        },
        {
          "title": "Excursions (1 Jun 2026 – 31 May 2027, STO less 15%)",
          "rows": [
            [
              "Sossusvlei Scenic Sunrise Drive",
              "1,350"
            ],
            [
              "Sossusvlei Scenic Sunset Drive",
              "1,350"
            ],
            [
              "Sunset Elim Dune Drive / Guided Walk",
              "850"
            ],
            [
              "Sesriem Canyon",
              "700"
            ]
          ]
        }
      ]
    }
  },
  "windpomp-14-sea-side-camp": {
    "2026": {
      "name": "Windpomp 14 Sea Side Camp",
      "region": "Swakopmund",
      "currency": "N$",
      "validity": "2026",
      "note": "Published rack rates from the supplier sheet.",
      "sections": [
        {
          "title": "Beachfront Units",
          "rows": [
            [
              "Adult — Off Season — Beachfront Units",
              "310"
            ],
            [
              "Child 6–15 — Off Season — Beachfront Units",
              "200"
            ],
            [
              "Child 0–5 — Off Season — Beachfront Units",
              "50"
            ],
            [
              "Adult — Peak Season — Beachfront Units",
              "340"
            ],
            [
              "Child 6–15 — Peak Season — Beachfront Units",
              "270"
            ],
            [
              "Child 0–5 — Peak Season — Beachfront Units",
              "85"
            ]
          ]
        },
        {
          "title": "Middle Row Units",
          "rows": [
            [
              "Adult — Off Season — Middle Row Units",
              "280"
            ],
            [
              "Child 6–15 — Off Season — Middle Row Units",
              "195"
            ],
            [
              "Child 0–5 — Off Season — Middle Row Units",
              "50"
            ],
            [
              "Adult — Peak Season — Middle Row Units",
              "325"
            ],
            [
              "Child 6–15 — Peak Season — Middle Row Units",
              "260"
            ],
            [
              "Child 0–5 — Peak Season — Middle Row Units",
              "75"
            ]
          ]
        },
        {
          "title": "Back Row Units",
          "rows": [
            [
              "Adult — Off Season — Back Row Units",
              "260"
            ],
            [
              "Child 6–15 — Off Season — Back Row Units",
              "190"
            ],
            [
              "Child 0–5 — Off Season — Back Row Units",
              "50"
            ],
            [
              "Adult — Peak Season — Back Row Units",
              "315"
            ],
            [
              "Child 6–15 — Peak Season — Back Row Units",
              "250"
            ],
            [
              "Child 0–5 — Peak Season — Back Row Units",
              "70"
            ]
          ]
        }
      ]
    }
  },
  "daan-viljoen-lodge": {
    "2026": {
      "name": "Daan Viljoen Lodge",
      "region": "Windhoek",
      "currency": "N$",
      "validity": "2026",
      "note": "Published rack rates from the supplier sheet.",
      "sections": [
        {
          "title": "Standard Chalet",
          "rows": [
            [
              "Adult Double Room — Standard Chalet",
              "2,400"
            ],
            [
              "Adult Single Room — Standard Chalet",
              "1,550"
            ],
            [
              "Child Double Room (6–15)",
              "1,660"
            ],
            [
              "Child Single Room (6–15)",
              "840"
            ]
          ]
        },
        {
          "title": "Deluxe Chalet (sleeps 3)",
          "rows": [
            [
              "Adult Double Room — Deluxe Chalet (sleeps 3)",
              "2,740"
            ],
            [
              "Adult Single Room — Deluxe Chalet (sleeps 3)",
              "1,900"
            ],
            [
              "Children (6–15)",
              "590"
            ]
          ]
        },
        {
          "title": "Activities & Extras",
          "rows": [
            [
              "Dinner (per person, tour groups)",
              "440"
            ],
            [
              "Tour Guide & Driver Accommodation (pp)",
              "800"
            ]
          ]
        }
      ]
    }
  },
  "sesriem-oshana-campsite": {
    "2026": {
      "name": "Sesriem Oshana Campsite",
      "region": "Sossusvlei",
      "currency": "N$",
      "validity": "2026",
      "note": "Published rack rates from the supplier sheet.",
      "sections": [
        {
          "title": "1 Nov 2025 – 31 May 2026",
          "rows": [
            [
              "Per Person — 1 Nov 2025 – 31 May 2026",
              "440"
            ],
            [
              "Child 6–15 — 1 Nov 2025 – 31 May 2026",
              "220"
            ]
          ]
        },
        {
          "title": "1 Jun – 31 Oct 2026",
          "rows": [
            [
              "Per Person — 1 Jun – 31 Oct 2026",
              "560"
            ]
          ]
        },
        {
          "title": "1 Nov 2026 – 31 May 2027",
          "rows": [
            [
              "Per Person — 1 Nov 2026 – 31 May 2027",
              "470"
            ],
            [
              "Child 6–15 — 1 Nov 2026 – 31 May 2027",
              "240"
            ]
          ]
        }
      ]
    }
  },
  "daan-viljoen-camping": {
    "2026": {
      "name": "Daan Viljoen Camping",
      "region": "Windhoek",
      "currency": "N$",
      "validity": "2026",
      "note": "Published rack rates from the supplier sheet.",
      "sections": [
        {
          "title": "Camping Rates (2026)",
          "rows": [
            [
              "Single Camp",
              "350"
            ],
            [
              "Double Camp",
              "510"
            ],
            [
              "Extra per person",
              "180"
            ]
          ]
        }
      ]
    }
  },
  "nkasa-linyanti": {
    "2026": {
      "name": "Nkasa Linyanti",
      "region": "Caprivi",
      "currency": "N$",
      "validity": "2026",
      "note": "Rack derived from the supplier net rate at the house +20% ceiling — replace when the supplier publishes its own rack.",
      "sections": [
        {
          "title": "Nkasa Linyanti",
          "rows": [
            [
              "Per Night RatePer Person Sharing — Shoulder Season 1-30 Apr / 1-30 Jun 1 Nov-19 Dec — Nkasa Linyanti",
              "10,075.20"
            ],
            [
              "Single Supplement — Shoulder Season 1-30 Apr / 1-30 Jun 1 Nov-19 Dec — Nkasa Linyanti",
              "4,042.80"
            ],
            [
              "Private VehiclePer vehicle per night — Shoulder Season 1-30 Apr / 1-30 Jun 1 Nov-19 Dec — Nkasa Linyanti",
              "11,850"
            ],
            [
              "Per Night RatePer Person Sharing — Shoulder High 1-31 May — Nkasa Linyanti",
              "12,523.20"
            ],
            [
              "Single Supplement — Shoulder High 1-31 May — Nkasa Linyanti",
              "5,025.60"
            ],
            [
              "Private VehiclePer vehicle per night — Shoulder High 1-31 May — Nkasa Linyanti",
              "11,850"
            ],
            [
              "Per Night RatePer Person Sharing — High Season 1 Sep-31 Oct 20 Dec-9 Jan — Nkasa Linyanti",
              "14,966.40"
            ],
            [
              "Single Supplement — High Season 1 Sep-31 Oct 20 Dec-9 Jan — Nkasa Linyanti",
              "6,006"
            ],
            [
              "Private VehiclePer vehicle per night — High Season 1 Sep-31 Oct 20 Dec-9 Jan — Nkasa Linyanti",
              "14,514"
            ],
            [
              "Per Night RatePer Person Sharing — Peak Season 1 Jul-31 Aug — Nkasa Linyanti",
              "16,075.20"
            ],
            [
              "Single Supplement — Peak Season 1 Jul-31 Aug — Nkasa Linyanti",
              "6,451.20"
            ],
            [
              "Private VehiclePer vehicle per night — Peak Season 1 Jul-31 Aug — Nkasa Linyanti",
              "14,514"
            ]
          ]
        },
        {
          "title": "When would you like to travel?",
          "rows": [
            [
              "Per Night RatePer Person Sharing — Shoulder Season 1-30 Apr / 1-30 Jun 1 Nov-19 Dec — When would you like to travel?",
              "10,075.20"
            ],
            [
              "Single Supplement — Shoulder Season 1-30 Apr / 1-30 Jun 1 Nov-19 Dec — When would you like to travel?",
              "4,042.80"
            ],
            [
              "Private VehiclePer vehicle per night — Shoulder Season 1-30 Apr / 1-30 Jun 1 Nov-19 Dec — When would you like to travel?",
              "11,850"
            ],
            [
              "Per Night RatePer Person Sharing — Shoulder High 1-31 May — When would you like to travel?",
              "12,523.20"
            ],
            [
              "Single Supplement — Shoulder High 1-31 May — When would you like to travel?",
              "5,025.60"
            ],
            [
              "Private VehiclePer vehicle per night — Shoulder High 1-31 May — When would you like to travel?",
              "11,850"
            ],
            [
              "Per Night RatePer Person Sharing — High Season 1 Sep-31 Oct 20 Dec-9 Jan — When would you like to travel?",
              "14,966.40"
            ],
            [
              "Single Supplement — High Season 1 Sep-31 Oct 20 Dec-9 Jan — When would you like to travel?",
              "6,006"
            ],
            [
              "Private VehiclePer vehicle per night — High Season 1 Sep-31 Oct 20 Dec-9 Jan — When would you like to travel?",
              "14,514"
            ],
            [
              "Per Night RatePer Person Sharing — Peak Season 1 Jul-31 Aug — When would you like to travel?",
              "16,075.20"
            ],
            [
              "Single Supplement — Peak Season 1 Jul-31 Aug — When would you like to travel?",
              "6,451.20"
            ],
            [
              "Private VehiclePer vehicle per night — Peak Season 1 Jul-31 Aug — When would you like to travel?",
              "14,514"
            ]
          ]
        }
      ]
    }
  },
  "camp-kipwe": {
    "2026": {
      "name": "Camp Kipwe",
      "region": "Damaraland",
      "currency": "N$",
      "validity": "2026",
      "note": "Rack derived from the supplier net rate at the house +20% ceiling — replace when the supplier publishes its own rack.",
      "sections": [
        {
          "title": "STO15 Rate — 01 Jan 2026 to 31 Dec 2026",
          "rows": [
            [
              "9 x Bungalows — DBB p/p Sharing — Low Season STO 15%",
              "5,172"
            ],
            [
              "9 x Bungalows — DBB Single Person — Low Season STO 15%",
              "6,976.80"
            ],
            [
              "Bungalow 2-Night FI Package — Sharing p/p — Low Season STO 15%",
              "15,157.20"
            ],
            [
              "Bungalow 2-Night FI Package — Single — Low Season STO 15%",
              "18,523.20"
            ],
            [
              "Bungalow 3-Night FI Package — Sharing p/p — Low Season STO 15%",
              "22,002"
            ],
            [
              "Bungalow 3-Night FI Package — Single — Low Season STO 15%",
              "27,204"
            ],
            [
              "1 x Kipwe Suite — DBB p/p Sharing — Low Season STO 15%",
              "8,710.80"
            ],
            [
              "1 x Kipwe Suite — DBB Single Person — Low Season STO 15%",
              "11,872.80"
            ],
            [
              "Kipwe Suite 2-Night FI Package — Sharing p/p — Low Season STO 15%",
              "22,195.20"
            ],
            [
              "Kipwe Suite 2-Night FI Package — Single — Low Season STO 15%",
              "28,285.20"
            ],
            [
              "Kipwe Suite 3-Night FI Package — Sharing p/p — Low Season STO 15%",
              "32,528.40"
            ],
            [
              "Kipwe Suite 3-Night FI Package — Single — Low Season STO 15%",
              "41,830.80"
            ],
            [
              "2 x Luxury Suites — DBB p/p Sharing — Low Season STO 15%",
              "12,729.60"
            ],
            [
              "2 x Luxury Suites — DBB Single Person — Low Season STO 15%",
              "17,310"
            ],
            [
              "Luxury Suite 2-Night FI Package — Sharing p/p — Low Season STO 15%",
              "30,375.60"
            ],
            [
              "Luxury Suite 2-Night FI Package — Single — Low Season STO 15%",
              "39,280.80"
            ],
            [
              "Luxury Suite 3-Night FI Package — Sharing p/p — Low Season STO 15%",
              "44,737.20"
            ],
            [
              "Luxury Suite 3-Night FI Package — Single — Low Season STO 15%",
              "58,262.40"
            ],
            [
              "9 x Bungalows — DBB p/p Sharing — High Season STO 15%",
              "6,834"
            ],
            [
              "9 x Bungalows — DBB Single Person — High Season STO 15%",
              "10,118.40"
            ],
            [
              "Bungalow 2-Night FI Package — Sharing p/p — High Season STO 15%",
              "18,462"
            ],
            [
              "Bungalow 2-Night FI Package — Single — High Season STO 15%",
              "23,174.40"
            ],
            [
              "Bungalow 3-Night FI Package — Sharing p/p — High Season STO 15%",
              "26,928"
            ],
            [
              "Bungalow 3-Night FI Package — Single — High Season STO 15%",
              "34,149.60"
            ],
            [
              "1 x Kipwe Suite — DBB p/p Sharing — High Season STO 15%",
              "10,435.20"
            ],
            [
              "1 x Kipwe Suite — DBB Single Person — High Season STO 15%",
              "15,096"
            ],
            [
              "Kipwe Suite 2-Night FI Package — Sharing p/p — High Season STO 15%",
              "25,642.80"
            ],
            [
              "Kipwe Suite 2-Night FI Package — Single — High Season STO 15%",
              "33,088.80"
            ],
            [
              "Kipwe Suite 3-Night FI Package — Sharing p/p — High Season STO 15%",
              "37,730.40"
            ],
            [
              "Kipwe Suite 3-Night FI Package — Single — High Season STO 15%",
              "49,021.20"
            ],
            [
              "2 x Luxury Suites — DBB p/p Sharing — High Season STO 15%",
              "15,106.80"
            ],
            [
              "2 x Luxury Suites — DBB Single Person — High Season STO 15%",
              "21,195.60"
            ],
            [
              "Luxury Suite 2-Night FI Package — Sharing p/p — High Season STO 15%",
              "35,088"
            ],
            [
              "Luxury Suite 2-Night FI Package — Single — High Season STO 15%",
              "45,400.80"
            ],
            [
              "Luxury Suite 3-Night FI Package — Sharing p/p — High Season STO 15%",
              "51,867.60"
            ],
            [
              "Luxury Suite 3-Night FI Package — Single — High Season STO 15%",
              "67,473.60"
            ]
          ]
        },
        {
          "title": "Child Sharing Rates (accommodated in children's tent / camping bed)",
          "rows": [
            [
              "Child (4-12 yrs) — DBB per night — Low Season NETT",
              "3,132"
            ],
            [
              "Child (4-12 yrs) — 2-Night FI Package — Low Season NETT",
              "9,828"
            ],
            [
              "Child (4-12 yrs) — 3-Night FI Package — Low Season NETT",
              "13,428"
            ],
            [
              "Child (4-12 yrs) — DBB per night — High Season NETT",
              "3,132"
            ],
            [
              "Child (4-12 yrs) — 2-Night FI Package — High Season NETT",
              "9,828"
            ],
            [
              "Child (4-12 yrs) — 3-Night FI Package — High Season NETT",
              "13,428"
            ]
          ]
        },
        {
          "title": "Guide & Pilot Rates",
          "rows": [
            [
              "Tour Guide Room (per Guide/Pilot per night) — Rate (N$)",
              "2,652"
            ]
          ]
        },
        {
          "title": "Rack Rate — 01 Jan 2026 to 31 Dec 2026",
          "rows": [
            [
              "9 x Bungalows — DBB p/p Sharing — Low Season RACK",
              "6,084"
            ],
            [
              "9 x Bungalows — DBB Single Person — Low Season RACK",
              "8,208"
            ],
            [
              "Bungalow 2-Night FI Package — Sharing p/p — Low Season RACK",
              "17,832"
            ],
            [
              "Bungalow 2-Night FI Package — Single — Low Season RACK",
              "21,792"
            ],
            [
              "Bungalow 3-Night FI Package — Sharing p/p — Low Season RACK",
              "25,884"
            ],
            [
              "Bungalow 3-Night FI Package — Single — Low Season RACK",
              "32,004"
            ],
            [
              "1 x Kipwe Suite — DBB p/p Sharing — Low Season RACK",
              "10,248"
            ],
            [
              "1 x Kipwe Suite — DBB Single Person — Low Season RACK",
              "13,968"
            ],
            [
              "Kipwe Suite 2-Night FI Package — Sharing p/p — Low Season RACK",
              "26,112"
            ],
            [
              "Kipwe Suite 2-Night FI Package — Single — Low Season RACK",
              "33,276"
            ],
            [
              "Kipwe Suite 3-Night FI Package — Sharing p/p — Low Season RACK",
              "38,268"
            ],
            [
              "Kipwe Suite 3-Night FI Package — Single — Low Season RACK",
              "49,212"
            ],
            [
              "2 x Luxury Suites — DBB p/p Sharing — Low Season RACK",
              "14,976"
            ],
            [
              "2 x Luxury Suites — DBB Single Person — Low Season RACK",
              "20,364"
            ],
            [
              "Luxury Suite 2-Night FI Package — Sharing p/p — Low Season RACK",
              "35,736"
            ],
            [
              "Luxury Suite 2-Night FI Package — Single — Low Season RACK",
              "46,212"
            ],
            [
              "Luxury Suite 3-Night FI Package — Sharing p/p — Low Season RACK",
              "52,632"
            ],
            [
              "Luxury Suite 3-Night FI Package — Single — Low Season RACK",
              "68,544"
            ],
            [
              "9 x Bungalows — DBB p/p Sharing — High Season RACK",
              "8,040"
            ],
            [
              "9 x Bungalows — DBB Single Person — High Season RACK",
              "11,904"
            ],
            [
              "Bungalow 2-Night FI Package — Sharing p/p — High Season RACK",
              "21,720"
            ],
            [
              "Bungalow 2-Night FI Package — Single — High Season RACK",
              "27,264"
            ],
            [
              "Bungalow 3-Night FI Package — Sharing p/p — High Season RACK",
              "31,680"
            ],
            [
              "Bungalow 3-Night FI Package — Single — High Season RACK",
              "40,176"
            ],
            [
              "1 x Kipwe Suite — DBB p/p Sharing — High Season RACK",
              "12,276"
            ],
            [
              "1 x Kipwe Suite — DBB Single Person — High Season RACK",
              "17,760"
            ],
            [
              "Kipwe Suite 2-Night FI Package — Sharing p/p — High Season RACK",
              "30,168"
            ],
            [
              "Kipwe Suite 2-Night FI Package — Single — High Season RACK",
              "38,928"
            ],
            [
              "Kipwe Suite 3-Night FI Package — Sharing p/p — High Season RACK",
              "44,388"
            ],
            [
              "Kipwe Suite 3-Night FI Package — Single — High Season RACK",
              "57,672"
            ],
            [
              "2 x Luxury Suites — DBB p/p Sharing — High Season RACK",
              "17,772"
            ],
            [
              "2 x Luxury Suites — DBB Single Person — High Season RACK",
              "24,936"
            ],
            [
              "Luxury Suite 2-Night FI Package — Sharing p/p — High Season RACK",
              "41,280"
            ],
            [
              "Luxury Suite 2-Night FI Package — Single — High Season RACK",
              "53,412"
            ],
            [
              "Luxury Suite 3-Night FI Package — Sharing p/p — High Season RACK",
              "61,020"
            ],
            [
              "Luxury Suite 3-Night FI Package — Single — High Season RACK",
              "79,380"
            ]
          ]
        },
        {
          "title": "Activities offered at Camp Kipwe",
          "rows": [
            [
              "Nature Drive (guided, Morning) — Nett Price (N$)",
              "1,632"
            ],
            [
              "Twyfelfontein Excursion (guided, Afternoon) — Nett Price (N$)",
              "1,332"
            ],
            [
              "Damara Living Museum Entry — Nett Price (N$)",
              "384"
            ],
            [
              "All-Inclusive Drinks Add-On — Nett Price (N$)",
              "1,440"
            ]
          ]
        },
        {
          "title": "Transfers (Charged pp one-way)",
          "rows": [
            [
              "Twyfelfontein Airstrip Transfer — Nett Price (N$)",
              "474"
            ],
            [
              "!Doro Nawas Transfer — Nett Price (N$)",
              "558"
            ],
            [
              "Damaraland Camp Transfer — Nett Price (N$)",
              "834"
            ]
          ]
        },
        {
          "title": "Additional Meals",
          "rows": [
            [
              "Breakfast — Price (N$)",
              "474"
            ],
            [
              "Lunch — Price (N$)",
              "450"
            ],
            [
              "Lunch Pack — Price (N$)",
              "306"
            ],
            [
              "Dinner (3 Course) — Price (N$)",
              "1,068"
            ]
          ]
        }
      ]
    }
  },
  "mowani-mountain-camp": {
    "2026": {
      "name": "Mowani Mountain Camp",
      "region": "Damaraland",
      "currency": "N$",
      "validity": "2026",
      "note": "Rack derived from the supplier net rate at the house +20% ceiling — replace when the supplier publishes its own rack.",
      "sections": [
        {
          "title": "STO15 Rate — 01 Jan 2026 to 31 Dec 2026",
          "rows": [
            [
              "8 x View Rooms — DBB p/p Sharing — Low Season STO 15%",
              "6,058.80"
            ],
            [
              "8 x View Rooms — DBB Single Person — Low Season STO 15%",
              "8,180.40"
            ],
            [
              "View Room 2-Night FI Package — Sharing p/p — Low Season STO 15%",
              "16,922.40"
            ],
            [
              "View Room 2-Night FI Package — Single — Low Season STO 15%",
              "20,950.80"
            ],
            [
              "View Room 3-Night FI Package — Sharing p/p — Low Season STO 15%",
              "24,663.60"
            ],
            [
              "View Room 3-Night FI Package — Single — Low Season STO 15%",
              "30,783.60"
            ],
            [
              "4 x Superior View Rooms — DBB p/p Sharing — Low Season STO 15%",
              "6,528"
            ],
            [
              "4 x Superior View Rooms — DBB Single Person — Low Season STO 15%",
              "8,792.40"
            ],
            [
              "Superior View 2-Night FI Package — Sharing p/p — Low Season STO 15%",
              "17,829.60"
            ],
            [
              "Superior View 2-Night FI Package — Single — Low Season STO 15%",
              "22,154.40"
            ],
            [
              "Superior View 3-Night FI Package — Sharing p/p — Low Season STO 15%",
              "26,010"
            ],
            [
              "Superior View 3-Night FI Package — Single — Low Season STO 15%",
              "32,619.60"
            ],
            [
              "1 x Luxury Room — DBB p/p Sharing — Low Season STO 15%",
              "6,824.40"
            ],
            [
              "1 x Luxury Room — DBB Single Person — Low Season STO 15%",
              "9,211.20"
            ],
            [
              "Luxury Room 2-Night FI Package — Sharing p/p — Low Season STO 15%",
              "18,554.40"
            ],
            [
              "Luxury Room 2-Night FI Package — Single — Low Season STO 15%",
              "23,103.60"
            ],
            [
              "Luxury Room 3-Night FI Package — Sharing p/p — Low Season STO 15%",
              "27,081.60"
            ],
            [
              "Luxury Room 3-Night FI Package — Single — Low Season STO 15%",
              "33,997.20"
            ],
            [
              "1 x Rock Suite (Mini) — DBB p/p Sharing — Low Season STO 15%",
              "7,772.40"
            ],
            [
              "1 x Rock Suite (Mini) — DBB Single Person — Low Season STO 15%",
              "10,476"
            ],
            [
              "Rock Suite 2-Night FI Package — Sharing p/p — Low Season STO 15%",
              "20,472"
            ],
            [
              "Rock Suite 2-Night FI Package — Single — Low Season STO 15%",
              "25,653.60"
            ],
            [
              "Rock Suite 3-Night FI Package — Sharing p/p — Low Season STO 15%",
              "29,926.80"
            ],
            [
              "Rock Suite 3-Night FI Package — Single — Low Season STO 15%",
              "37,821.60"
            ],
            [
              "1 x Mountain Suite — DBB p/p Sharing — Low Season STO 15%",
              "12,852"
            ],
            [
              "1 x Mountain Suite — DBB Single Person — Low Season STO 15%",
              "17,473.20"
            ],
            [
              "Mountain Suite 2-Night FI Package — Sharing p/p — Low Season STO 15%",
              "30,631.20"
            ],
            [
              "Mountain Suite 2-Night FI Package — Single — Low Season STO 15%",
              "39,627.60"
            ],
            [
              "Mountain Suite 3-Night FI Package — Sharing p/p — Low Season STO 15%",
              "45,135.60"
            ],
            [
              "Mountain Suite 3-Night FI Package — Single — Low Season STO 15%",
              "58,783.20"
            ],
            [
              "8 x View Rooms — DBB p/p Sharing — High Season STO 15%",
              "8,119.20"
            ],
            [
              "8 x View Rooms — DBB Single Person — High Season STO 15%",
              "11,077.20"
            ],
            [
              "View Room 2-Night FI Package — Sharing p/p — High Season STO 15%",
              "21,022.80"
            ],
            [
              "View Room 2-Night FI Package — Single — High Season STO 15%",
              "26,703.60"
            ],
            [
              "View Room 3-Night FI Package — Sharing p/p — High Season STO 15%",
              "30,783.60"
            ],
            [
              "View Room 3-Night FI Package — Single — High Season STO 15%",
              "39,444"
            ],
            [
              "4 x Superior View Rooms — DBB p/p Sharing — High Season STO 15%",
              "8,710.80"
            ],
            [
              "4 x Superior View Rooms — DBB Single Person — High Season STO 15%",
              "11,750.40"
            ],
            [
              "Superior View 2-Night FI Package — Sharing p/p — High Season STO 15%",
              "22,236"
            ],
            [
              "Superior View 2-Night FI Package — Single — High Season STO 15%",
              "28,060.80"
            ],
            [
              "Superior View 3-Night FI Package — Sharing p/p — High Season STO 15%",
              "32,619.60"
            ],
            [
              "Superior View 3-Night FI Package — Single — High Season STO 15%",
              "41,493.60"
            ],
            [
              "1 x Luxury Room — DBB p/p Sharing — High Season STO 15%",
              "9,129.60"
            ],
            [
              "1 x Luxury Room — DBB Single Person — High Season STO 15%",
              "12,301.20"
            ],
            [
              "Luxury Room 2-Night FI Package — Sharing p/p — High Season STO 15%",
              "23,174.40"
            ],
            [
              "Luxury Room 2-Night FI Package — Single — High Season STO 15%",
              "29,305.20"
            ],
            [
              "Luxury Room 3-Night FI Package — Sharing p/p — High Season STO 15%",
              "33,966"
            ],
            [
              "Luxury Room 3-Night FI Package — Single — High Season STO 15%",
              "43,238.40"
            ],
            [
              "1 x Rock Suite (Mini) — DBB p/p Sharing — High Season STO 15%",
              "10,006.80"
            ],
            [
              "1 x Rock Suite (Mini) — DBB Single Person — High Season STO 15%",
              "13,332"
            ],
            [
              "Rock Suite 2-Night FI Package — Sharing p/p — High Season STO 15%",
              "24,908.40"
            ],
            [
              "Rock Suite 2-Night FI Package — Single — High Season STO 15%",
              "31,354.80"
            ],
            [
              "Rock Suite 3-Night FI Package — Sharing p/p — High Season STO 15%",
              "36,597.60"
            ],
            [
              "Rock Suite 3-Night FI Package — Single — High Season STO 15%",
              "46,359.60"
            ],
            [
              "1 x Mountain Suite — DBB p/p Sharing — High Season STO 15%",
              "15,249.60"
            ],
            [
              "1 x Mountain Suite — DBB Single Person — High Season STO 15%",
              "20,574"
            ],
            [
              "Mountain Suite 2-Night FI Package — Sharing p/p — High Season STO 15%",
              "35,394"
            ],
            [
              "Mountain Suite 2-Night FI Package — Single — High Season STO 15%",
              "45,808.80"
            ],
            [
              "Mountain Suite 3-Night FI Package — Sharing p/p — High Season STO 15%",
              "52,326"
            ],
            [
              "Mountain Suite 3-Night FI Package — Single — High Season STO 15%",
              "68,054.40"
            ]
          ]
        },
        {
          "title": "Child Sharing Rates (accommodated in children's tent / camping bed)",
          "rows": [
            [
              "Child (4-12 yrs) — DBB per night — Low Season NETT",
              "3,132"
            ],
            [
              "Child (4-12 yrs) — 2-Night FI Package — Low Season NETT",
              "9,828"
            ],
            [
              "Child (4-12 yrs) — 3-Night FI Package — Low Season NETT",
              "13,428"
            ],
            [
              "Child (4-12 yrs) — DBB per night — High Season NETT",
              "3,132"
            ],
            [
              "Child (4-12 yrs) — 2-Night FI Package — High Season NETT",
              "9,828"
            ],
            [
              "Child (4-12 yrs) — 3-Night FI Package — High Season NETT",
              "13,428"
            ]
          ]
        },
        {
          "title": "Guide & Pilot Rates",
          "rows": [
            [
              "Tour Guide Room (per Guide/Pilot per night) — Rate (N$)",
              "2,652"
            ]
          ]
        },
        {
          "title": "Rack Rate — 01 Jan 2026 to 31 Dec 2026",
          "rows": [
            [
              "8 x View Rooms — DBB p/p Sharing — Low Season RACK",
              "7,128"
            ],
            [
              "8 x View Rooms — DBB Single Person — Low Season RACK",
              "9,624"
            ],
            [
              "View Room 2-Night FI Package — Sharing p/p — Low Season RACK",
              "19,908"
            ],
            [
              "View Room 2-Night FI Package — Single — Low Season RACK",
              "24,648"
            ],
            [
              "View Room 3-Night FI Package — Sharing p/p — Low Season RACK",
              "29,016"
            ],
            [
              "View Room 3-Night FI Package — Single — Low Season RACK",
              "36,216"
            ],
            [
              "4 x Superior View Rooms — DBB p/p Sharing — Low Season RACK",
              "7,680"
            ],
            [
              "4 x Superior View Rooms — DBB Single Person — Low Season RACK",
              "10,344"
            ],
            [
              "Superior View 2-Night FI Package — Sharing p/p — Low Season RACK",
              "20,976"
            ],
            [
              "Superior View 2-Night FI Package — Single — Low Season RACK",
              "26,064"
            ],
            [
              "Superior View 3-Night FI Package — Sharing p/p — Low Season RACK",
              "30,600"
            ],
            [
              "Superior View 3-Night FI Package — Single — Low Season RACK",
              "38,376"
            ],
            [
              "1 x Luxury Room — DBB p/p Sharing — Low Season RACK",
              "8,028"
            ],
            [
              "1 x Luxury Room — DBB Single Person — Low Season RACK",
              "10,836"
            ],
            [
              "Luxury Room 2-Night FI Package — Sharing p/p — Low Season RACK",
              "21,828"
            ],
            [
              "Luxury Room 2-Night FI Package — Single — Low Season RACK",
              "27,180"
            ],
            [
              "Luxury Room 3-Night FI Package — Sharing p/p — Low Season RACK",
              "31,860"
            ],
            [
              "Luxury Room 3-Night FI Package — Single — Low Season RACK",
              "39,996"
            ],
            [
              "1 x Rock Suite (Mini) — DBB p/p Sharing — Low Season RACK",
              "9,144"
            ],
            [
              "1 x Rock Suite (Mini) — DBB Single Person — Low Season RACK",
              "12,324"
            ],
            [
              "Rock Suite 2-Night FI Package — Sharing p/p — Low Season RACK",
              "24,084"
            ],
            [
              "Rock Suite 2-Night FI Package — Single — Low Season RACK",
              "30,180"
            ],
            [
              "Rock Suite 3-Night FI Package — Sharing p/p — Low Season RACK",
              "35,208"
            ],
            [
              "Rock Suite 3-Night FI Package — Single — Low Season RACK",
              "44,496"
            ],
            [
              "1 x Mountain Suite — DBB p/p Sharing — Low Season RACK",
              "15,120"
            ],
            [
              "1 x Mountain Suite — DBB Single Person — Low Season RACK",
              "20,556"
            ],
            [
              "Mountain Suite 2-Night FI Package — Sharing p/p — Low Season RACK",
              "36,036"
            ],
            [
              "Mountain Suite 2-Night FI Package — Single — Low Season RACK",
              "46,620"
            ],
            [
              "Mountain Suite 3-Night FI Package — Sharing p/p — Low Season RACK",
              "53,100"
            ],
            [
              "Mountain Suite 3-Night FI Package — Single — Low Season RACK",
              "69,156"
            ],
            [
              "8 x View Rooms — DBB p/p Sharing — High Season RACK",
              "9,552"
            ],
            [
              "8 x View Rooms — DBB Single Person — High Season RACK",
              "13,032"
            ],
            [
              "View Room 2-Night FI Package — Sharing p/p — High Season RACK",
              "24,732"
            ],
            [
              "View Room 2-Night FI Package — Single — High Season RACK",
              "31,416"
            ],
            [
              "View Room 3-Night FI Package — Sharing p/p — High Season RACK",
              "36,216"
            ],
            [
              "View Room 3-Night FI Package — Single — High Season RACK",
              "46,404"
            ],
            [
              "4 x Superior View Rooms — DBB p/p Sharing — High Season RACK",
              "10,248"
            ],
            [
              "4 x Superior View Rooms — DBB Single Person — High Season RACK",
              "13,824"
            ],
            [
              "Superior View 2-Night FI Package — Sharing p/p — High Season RACK",
              "26,160"
            ],
            [
              "Superior View 2-Night FI Package — Single — High Season RACK",
              "33,012"
            ],
            [
              "Superior View 3-Night FI Package — Sharing p/p — High Season RACK",
              "38,376"
            ],
            [
              "Superior View 3-Night FI Package — Single — High Season RACK",
              "48,816"
            ],
            [
              "1 x Luxury Room — DBB p/p Sharing — High Season RACK",
              "10,740"
            ],
            [
              "1 x Luxury Room — DBB Single Person — High Season RACK",
              "14,472"
            ],
            [
              "Luxury Room 2-Night FI Package — Sharing p/p — High Season RACK",
              "27,264"
            ],
            [
              "Luxury Room 2-Night FI Package — Single — High Season RACK",
              "34,476"
            ],
            [
              "Luxury Room 3-Night FI Package — Sharing p/p — High Season RACK",
              "39,960"
            ],
            [
              "Luxury Room 3-Night FI Package — Single — High Season RACK",
              "50,868"
            ],
            [
              "1 x Rock Suite (Mini) — DBB p/p Sharing — High Season RACK",
              "11,772"
            ],
            [
              "1 x Rock Suite (Mini) — DBB Single Person — High Season RACK",
              "15,684"
            ],
            [
              "Rock Suite 2-Night FI Package — Sharing p/p — High Season RACK",
              "29,304"
            ],
            [
              "Rock Suite 2-Night FI Package — Single — High Season RACK",
              "36,888"
            ],
            [
              "Rock Suite 3-Night FI Package — Sharing p/p — High Season RACK",
              "43,056"
            ],
            [
              "Rock Suite 3-Night FI Package — Single — High Season RACK",
              "54,540"
            ],
            [
              "1 x Mountain Suite — DBB p/p Sharing — High Season RACK",
              "17,940"
            ],
            [
              "1 x Mountain Suite — DBB Single Person — High Season RACK",
              "24,204"
            ],
            [
              "Mountain Suite 2-Night FI Package — Sharing p/p — High Season RACK",
              "41,640"
            ],
            [
              "Mountain Suite 2-Night FI Package — Single — High Season RACK",
              "53,892"
            ],
            [
              "Mountain Suite 3-Night FI Package — Sharing p/p — High Season RACK",
              "61,560"
            ],
            [
              "Mountain Suite 3-Night FI Package — Single — High Season RACK",
              "80,064"
            ]
          ]
        },
        {
          "title": "Activities offered at Mowani Mountain Camp",
          "rows": [
            [
              "Nature Drive (guided, Morning) — Nett Price (N$)",
              "1,632"
            ],
            [
              "Twyfelfontein Excursion (guided, Afternoon) — Nett Price (N$)",
              "1,332"
            ],
            [
              "Damara Living Museum Entry — Nett Price (N$)",
              "384"
            ],
            [
              "All-Inclusive Drinks Add-On — Nett Price (N$)",
              "1,440"
            ]
          ]
        },
        {
          "title": "Transfers (Charged pp one-way)",
          "rows": [
            [
              "Twyfelfontein Airstrip Transfer — Nett Price (N$)",
              "474"
            ],
            [
              "!Doro Nawas Transfer — Nett Price (N$)",
              "558"
            ],
            [
              "Damaraland Camp Transfer — Nett Price (N$)",
              "834"
            ]
          ]
        },
        {
          "title": "Additional Meals",
          "rows": [
            [
              "Breakfast — Price (N$)",
              "474"
            ],
            [
              "Lunch — Price (N$)",
              "450"
            ],
            [
              "Lunch Pack — Price (N$)",
              "306"
            ],
            [
              "Dinner (3 Course) — Price (N$)",
              "1,068"
            ]
          ]
        }
      ]
    }
  },
  "spitzkoppe-cabin-camp": {
    "2026": {
      "name": "Spitzkoppe Cabin Camp",
      "region": "Damaraland",
      "currency": "N$",
      "validity": "2026",
      "note": "Rack derived from the supplier net rate at the house +20% ceiling — replace when the supplier publishes its own rack.",
      "sections": [
        {
          "title": "Cabin STO Rates 2026",
          "rows": [
            [
              "Per Person Sharing — Self-Catering — STO Rate (N$)",
              "1,530"
            ],
            [
              "Single Person — Self-Catering — STO Rate (N$)",
              "2,856"
            ],
            [
              "Child 3–12 Sharing with Adults (max 3) — STO Rate (N$)",
              "765"
            ],
            [
              "Child 3–12 Own Room (1st child) — STO Rate (N$)",
              "1,530"
            ],
            [
              "Child 3–12 Own Room (2nd/3rd child) — STO Rate (N$)",
              "765"
            ],
            [
              "Tour Guide Single — STO Rate (N$)",
              "2,100"
            ],
            [
              "Tour Guide Sharing — STO Rate (N$)",
              "1,056"
            ]
          ]
        },
        {
          "title": "Camp Service Extras",
          "rows": [
            [
              "Scullery / Cutlery Usage Fee (per 2 pax per stay) — STO Rate (N$)",
              "60"
            ]
          ]
        }
      ]
    }
  },
  "spitzkoppe-restcamp": {
    "2026": {
      "name": "Spitzkoppe Restcamp",
      "region": "Damaraland",
      "currency": "N$",
      "validity": "2026",
      "note": "Rack derived from the supplier net rate at the house +20% ceiling — replace when the supplier publishes its own rack.",
      "sections": [
        {
          "title": "Community Camping Rates 2026",
          "rows": [
            [
              "Adult Campsite Pitch — pppn — STO Rate (N$)",
              "324"
            ],
            [
              "Child 4–11 Campsite Pitch — pppn — STO Rate (N$)",
              "216"
            ]
          ]
        },
        {
          "title": "Day Visitor Permits",
          "rows": [
            [
              "Day Visitor — Adult — STO Rate (N$)",
              "204"
            ],
            [
              "Day Visitor — Child 4–11 — STO Rate (N$)",
              "132"
            ]
          ]
        }
      ]
    }
  },
  "spitzkoppen-lodge": {
    "2026": {
      "name": "Spitzkoppen Lodge",
      "region": "Damaraland",
      "currency": "N$",
      "validity": "2026",
      "note": "Rack derived from the supplier net rate at the house +20% ceiling — replace when the supplier publishes its own rack.",
      "sections": [
        {
          "title": "Lodge Rates 2026",
          "rows": [
            [
              "Per Person Sharing — DBB — STO Rate (N$)",
              "6,630"
            ],
            [
              "Single Person — DBB — STO Rate (N$)",
              "9,690"
            ],
            [
              "Child 6–11 Sharing with Adults — DBB — STO Rate (N$)",
              "3,060"
            ],
            [
              "Child 6–11 Own Room — DBB — STO Rate (N$)",
              "4,794"
            ],
            [
              "Tour Guide — DBB — STO Rate (N$)",
              "2,880"
            ]
          ]
        },
        {
          "title": "Spitzkoppe Excursions & Activities",
          "rows": [
            [
              "Guided Walk Chain Tour (per person) — STO Rate (N$)",
              "492"
            ],
            [
              "Guided Drive — 4 Stop Excursion (per person) — STO Rate (N$)",
              "492"
            ],
            [
              "Top-Up Sunset Drive (added to drive, per person) — STO Rate (N$)",
              "288"
            ],
            [
              "Guided Cycling Tour (per person) — STO Rate (N$)",
              "660"
            ],
            [
              "Mountain Hike (per person) — STO Rate (N$)",
              "828"
            ],
            [
              "Lunch (standard dining) — STO Rate (N$)",
              "444"
            ],
            [
              "Lunch Pack (per person) — STO Rate (N$)",
              "288"
            ]
          ]
        }
      ]
    }
  },
  "mushara-bush-camp": {
    "2026": {
      "name": "Mushara Bush Camp",
      "region": "East Etosha",
      "currency": "N$",
      "validity": "2026",
      "note": "Rack derived from the supplier net rate at the house +20% ceiling — replace when the supplier publishes its own rack.",
      "sections": [
        {
          "title": "Shoulder Season — 01.01.2026 to 30.06.2026",
          "rows": [
            [
              "Double Tent — Single Use DBB — STO Rate (N$) — Shoulder Season — 01.01.2026 to 30.06.2026",
              "3,840"
            ],
            [
              "Double Tent — Sharing DBB — STO Rate (N$) — Shoulder Season — 01.01.2026 to 30.06.2026",
              "2,976"
            ],
            [
              "Child Rate 4–12 years sharing — DBB — STO Rate (N$) — Shoulder Season — 01.01.2026 to 30.06.2026",
              "1,344"
            ],
            [
              "Single Guide Room — DBB — STO Rate (N$) — Shoulder Season — 01.01.2026 to 30.06.2026",
              "2,040"
            ]
          ]
        },
        {
          "title": "High Season — 01.07.2026 to 31.12.2026",
          "rows": [
            [
              "Double Tent — Single Use DBB — STO Rate (N$) — High Season — 01.07.2026 to 31.12.2026",
              "4,128"
            ],
            [
              "Double Tent — Sharing DBB — STO Rate (N$) — High Season — 01.07.2026 to 31.12.2026",
              "3,216"
            ],
            [
              "Child Rate 4–12 years sharing — DBB — STO Rate (N$) — High Season — 01.07.2026 to 31.12.2026",
              "1,344"
            ],
            [
              "Single Guide Room — DBB — STO Rate (N$) — High Season — 01.07.2026 to 31.12.2026",
              "2,040"
            ]
          ]
        },
        {
          "title": "Etosha Game Drives & Activities",
          "rows": [
            [
              "Morning or Afternoon Scheduled Game Drive (pp) — STO Rate (N$)",
              "1,482"
            ],
            [
              "Morning or Afternoon Private Game Drive (per vehicle exclusive) — STO Rate (N$)",
              "11,832"
            ],
            [
              "Pilot Separate Airstrip Transfer (per transfer) — STO Rate (N$)",
              "600"
            ]
          ]
        },
        {
          "title": "Dining & Extras",
          "rows": [
            [
              "Lunch (per person) — STO Rate (N$)",
              "360"
            ],
            [
              "Lunch Pack (per person) — STO Rate (N$)",
              "240"
            ]
          ]
        }
      ]
    }
  },
  "mushara-lodge": {
    "2026": {
      "name": "Mushara Lodge",
      "region": "East Etosha",
      "currency": "N$",
      "validity": "2026",
      "note": "Rack derived from the supplier net rate at the house +20% ceiling — replace when the supplier publishes its own rack.",
      "sections": [
        {
          "title": "Shoulder Season — 01.01.2026 to 30.06.2026",
          "rows": [
            [
              "Double Chalet — Single Use DBB — STO Rate (N$) — Shoulder Season — 01.01.2026 to 30.06.2026",
              "5,280"
            ],
            [
              "Double Chalet — Sharing DBB — STO Rate (N$) — Shoulder Season — 01.01.2026 to 30.06.2026",
              "3,936"
            ],
            [
              "Triple Room — Sharing DBB — STO Rate (N$) — Shoulder Season — 01.01.2026 to 30.06.2026",
              "3,936"
            ],
            [
              "Family House — Sharing pp DBB — STO Rate (N$) — Shoulder Season — 01.01.2026 to 30.06.2026",
              "3,936"
            ],
            [
              "Single Guide Room — DBB — STO Rate (N$) — Shoulder Season — 01.01.2026 to 30.06.2026",
              "2,040"
            ]
          ]
        },
        {
          "title": "High Season — 01.07.2026 to 31.12.2026",
          "rows": [
            [
              "Double Chalet — Single Use DBB — STO Rate (N$) — High Season — 01.07.2026 to 31.12.2026",
              "5,664"
            ],
            [
              "Double Chalet — Sharing DBB — STO Rate (N$) — High Season — 01.07.2026 to 31.12.2026",
              "4,224"
            ],
            [
              "Triple Room — Sharing DBB — STO Rate (N$) — High Season — 01.07.2026 to 31.12.2026",
              "4,224"
            ],
            [
              "Family House — Sharing pp DBB — STO Rate (N$) — High Season — 01.07.2026 to 31.12.2026",
              "4,224"
            ],
            [
              "Single Guide Room — DBB — STO Rate (N$) — High Season — 01.07.2026 to 31.12.2026",
              "2,040"
            ]
          ]
        },
        {
          "title": "Etosha Game Drives & Activities",
          "rows": [
            [
              "Morning or Afternoon Scheduled Game Drive (pp) — STO Rate (N$)",
              "1,482"
            ],
            [
              "Morning or Afternoon Private Game Drive (per vehicle exclusive) — STO Rate (N$)",
              "11,832"
            ],
            [
              "Pilot Separate Airstrip Transfer (per transfer) — STO Rate (N$)",
              "600"
            ]
          ]
        },
        {
          "title": "Dining & Extras",
          "rows": [
            [
              "Lunch (per person) — STO Rate (N$)",
              "360"
            ],
            [
              "Lunch Pack (per person) — STO Rate (N$)",
              "240"
            ]
          ]
        }
      ]
    }
  },
  "mushara-outpost": {
    "2026": {
      "name": "Mushara Outpost",
      "region": "East Etosha",
      "currency": "N$",
      "validity": "2026",
      "note": "Rack derived from the supplier net rate at the house +20% ceiling — replace when the supplier publishes its own rack.",
      "sections": [
        {
          "title": "Shoulder Season — 01.01.2026 to 30.06.2026",
          "rows": [
            [
              "Double Tent — Single Use DBB — STO Rate (N$) — Shoulder Season — 01.01.2026 to 30.06.2026",
              "5,472"
            ],
            [
              "Double Tent — Sharing DBB — STO Rate (N$) — Shoulder Season — 01.01.2026 to 30.06.2026",
              "4,176"
            ],
            [
              "Double Tent — Single Use Fully Inclusive — STO Rate (N$) — Shoulder Season — 01.01.2026 to 30.06.2026",
              "9,984"
            ],
            [
              "Double Tent — Sharing Fully Inclusive — STO Rate (N$) — Shoulder Season — 01.01.2026 to 30.06.2026",
              "7,632"
            ],
            [
              "Single Guide Tent — DBB — STO Rate (N$) — Shoulder Season — 01.01.2026 to 30.06.2026",
              "2,040"
            ]
          ]
        },
        {
          "title": "High Season — 01.07.2026 to 31.12.2026",
          "rows": [
            [
              "Double Tent — Single Use DBB — STO Rate (N$) — High Season — 01.07.2026 to 31.12.2026",
              "5,856"
            ],
            [
              "Double Tent — Sharing DBB — STO Rate (N$) — High Season — 01.07.2026 to 31.12.2026",
              "4,512"
            ],
            [
              "Double Tent — Single Use Fully Inclusive — STO Rate (N$) — High Season — 01.07.2026 to 31.12.2026",
              "10,656"
            ],
            [
              "Double Tent — Sharing Fully Inclusive — STO Rate (N$) — High Season — 01.07.2026 to 31.12.2026",
              "8,256"
            ],
            [
              "Single Guide Tent — DBB — STO Rate (N$) — High Season — 01.07.2026 to 31.12.2026",
              "2,040"
            ]
          ]
        },
        {
          "title": "Etosha Game Drives & Activities",
          "rows": [
            [
              "Morning or Afternoon Scheduled Game Drive (pp) — STO Rate (N$)",
              "1,482"
            ],
            [
              "Morning or Afternoon Private Game Drive (per vehicle exclusive) — STO Rate (N$)",
              "11,832"
            ],
            [
              "Pilot Separate Airstrip Transfer (per transfer) — STO Rate (N$)",
              "600"
            ]
          ]
        },
        {
          "title": "Dining & Extras",
          "rows": [
            [
              "Lunch (per person) — STO Rate (N$)",
              "360"
            ],
            [
              "Lunch Pack (per person) — STO Rate (N$)",
              "240"
            ]
          ]
        }
      ]
    }
  },
  "onguma-bush-camp": {
    "2026": {
      "name": "Onguma Bush Camp",
      "region": "East Etosha",
      "currency": "N$",
      "validity": "2026",
      "note": "Rack derived from the supplier net rate at the house +20% ceiling — replace when the supplier publishes its own rack.",
      "sections": [
        {
          "title": "Per Person Sharing (DBB)",
          "rows": [
            [
              "3 Rondavels — Rate (N$)",
              "2,697.60"
            ],
            [
              "Rondavel — Child (3–11) — Rate (N$)",
              "1,686"
            ],
            [
              "3 Loft & 3 Family Rooms — Rate (N$)",
              "3,120"
            ],
            [
              "Loft / Family — Child (3–11) — Rate (N$)",
              "1,950"
            ],
            [
              "8 Deluxe Rooms — Rate (N$)",
              "3,936"
            ],
            [
              "Deluxe — Child (3–11) — Rate (N$)",
              "2,460"
            ],
            [
              "1 Settler's Room — Rate (N$)",
              "4,118.40"
            ],
            [
              "Settler's — Child (3–11) — Rate (N$)",
              "2,574"
            ]
          ]
        },
        {
          "title": "Single Supplement (per night)",
          "rows": [
            [
              "Rondavels — Rate (N$)",
              "1,017.60"
            ],
            [
              "Loft, Family, Deluxe & Settler's — Rate (N$)",
              "1,324.80"
            ]
          ]
        },
        {
          "title": "3-Night DBB Package (per person · fixed)",
          "rows": [
            [
              "3 Rondavels — Adult",
              "6,393.60"
            ],
            [
              "3 Loft & 3 Family Rooms — Adult",
              "7,473.60"
            ],
            [
              "8 Deluxe Rooms — Adult",
              "9,345.60"
            ],
            [
              "1 Settler's Room — Adult",
              "9,885.60"
            ],
            [
              "3 Rondavels — Child (3–11)",
              "3,996"
            ],
            [
              "3 Loft & 3 Family Rooms — Child (3–11)",
              "4,672.80"
            ],
            [
              "8 Deluxe Rooms — Child (3–11)",
              "5,842.80"
            ],
            [
              "1 Settler's Room — Child (3–11)",
              "6,179.40"
            ]
          ]
        },
        {
          "title": "Activities & Nature Drives",
          "rows": [
            [
              "Morning / Afternoon Etosha Game Drive (4 hrs) — Rate",
              "2,100"
            ],
            [
              "Onguma Sunrise Drive (3 hrs) — Rate",
              "1,068"
            ],
            [
              "Onguma Sundowner Drive (3 hrs) — Rate",
              "1,068"
            ],
            [
              "Interpretive Nature Walk (1½ hrs · min age 16) — Rate",
              "1,068"
            ],
            [
              "Mid-Morning Onkolo Hide (3 hrs · min age 7) — Rate",
              "780"
            ],
            [
              "Young Explorers Walk (1½ hrs) — Rate",
              "504"
            ],
            [
              "Private Game Drive (4 hrs) — Rate",
              "11,640"
            ],
            [
              "Private Game Drive — Full Day (8 hrs) — Rate",
              "18,600"
            ],
            [
              "Private Game Drive — Fully Inclusive surcharge (per activity) — Rate",
              "7,200"
            ],
            [
              "Private Game Drive — Fully Inclusive surcharge (full day) — Rate",
              "9,000"
            ]
          ]
        },
        {
          "title": "Onguma Dream Cruiser (Sleep-Out)",
          "rows": [
            [
              "Onguma Dream Cruiser (max 2 guests) — Rate",
              "11,760"
            ],
            [
              "Additional surcharge — Leadwood & Tamboti Campsite — Rate",
              "6,240"
            ]
          ]
        },
        {
          "title": "Additional Meals",
          "rows": [
            [
              "Breakfast — Rate",
              "348"
            ],
            [
              "Breakfast Pack — Rate",
              "348"
            ],
            [
              "Lunch (3 course) — Rate",
              "432"
            ],
            [
              "Lunch Pack — Rate",
              "312"
            ],
            [
              "Dinner (3 course) — Rate",
              "768"
            ],
            [
              "Dinner (4 course) — Rate",
              "972"
            ]
          ]
        }
      ]
    }
  },
  "onguma-camp-kala": {
    "2026": {
      "name": "Onguma Camp Kala",
      "region": "East Etosha",
      "currency": "N$",
      "validity": "2026",
      "note": "Rack derived from the supplier net rate at the house +20% ceiling — replace when the supplier publishes its own rack.",
      "sections": [
        {
          "title": "All-Inclusive Rates — 01.11.2025 to 31.10.2026",
          "rows": [
            [
              "Suite — per person sharing (All-Inclusive) — Rate (N$)",
              "28,598.40"
            ],
            [
              "Single Supplement — Rate (N$)",
              "13,612.80"
            ]
          ]
        },
        {
          "title": "Activities & Nature Drives",
          "rows": [
            [
              "Morning / Afternoon Etosha Game Drive (4 hrs) — Rate",
              "2,100"
            ],
            [
              "Onguma Sunrise Drive (3 hrs) — Rate",
              "1,068"
            ],
            [
              "Onguma Sundowner Drive (3 hrs) — Rate",
              "1,068"
            ],
            [
              "Interpretive Nature Walk (1½ hrs · min age 16) — Rate",
              "1,068"
            ],
            [
              "Mid-Morning Onkolo Hide (3 hrs · min age 7) — Rate",
              "780"
            ],
            [
              "Young Explorers Walk (1½ hrs) — Rate",
              "504"
            ],
            [
              "Private Game Drive (4 hrs) — Rate",
              "11,640"
            ],
            [
              "Private Game Drive — Full Day (8 hrs) — Rate",
              "18,600"
            ],
            [
              "Private Game Drive — Fully Inclusive surcharge (per activity) — Rate",
              "7,200"
            ],
            [
              "Private Game Drive — Fully Inclusive surcharge (full day) — Rate",
              "9,000"
            ]
          ]
        },
        {
          "title": "Onguma Dream Cruiser (Sleep-Out)",
          "rows": [
            [
              "Onguma Dream Cruiser (max 2 guests) — Rate",
              "11,760"
            ],
            [
              "Additional surcharge — Leadwood & Tamboti Campsite — Rate",
              "6,240"
            ]
          ]
        },
        {
          "title": "Additional Meals",
          "rows": [
            [
              "Breakfast — Rate",
              "348"
            ],
            [
              "Breakfast Pack — Rate",
              "348"
            ],
            [
              "Lunch (3 course) — Rate",
              "432"
            ],
            [
              "Lunch Pack — Rate",
              "312"
            ],
            [
              "Dinner (3 course) — Rate",
              "768"
            ],
            [
              "Dinner (4 course) — Rate",
              "972"
            ]
          ]
        }
      ]
    }
  },
  "onguma-forest-camp": {
    "2026": {
      "name": "Onguma Forest Camp",
      "region": "East Etosha",
      "currency": "N$",
      "validity": "2026",
      "note": "Rack derived from the supplier net rate at the house +20% ceiling — replace when the supplier publishes its own rack.",
      "sections": [
        {
          "title": "Per Person Sharing (DBB)",
          "rows": [
            [
              "4 Heritage Bungalows — Rate (N$)",
              "2,918.40"
            ],
            [
              "Heritage — Child (3–11) — Rate (N$)",
              "1,824"
            ],
            [
              "3 Bush Suites — Double — Rate (N$)",
              "3,283.20"
            ],
            [
              "3 Bush Suites — Triple — Rate (N$)",
              "3,072"
            ],
            [
              "3 Bush Suites — Quad — Rate (N$)",
              "2,870.40"
            ],
            [
              "Bush Suite — Child (3–11) — Rate (N$)",
              "2,052"
            ],
            [
              "3 Explorer Bungalows — Rate (N$)",
              "3,705.60"
            ],
            [
              "Explorer — Child (3–11) — Rate (N$)",
              "2,316"
            ],
            [
              "1 Honeymoon Bungalow — Rate (N$)",
              "3,888"
            ],
            [
              "Honeymoon — Child (3–11) — Rate (N$)",
              "2,430"
            ]
          ]
        },
        {
          "title": "Single Supplement (per night)",
          "rows": [
            [
              "Heritage Bungalows — Rate (N$)",
              "1,017.60"
            ],
            [
              "Bush Suites, Explorer & Honeymoon — Rate (N$)",
              "1,324.80"
            ]
          ]
        },
        {
          "title": "3-Night DBB Package (per person · fixed)",
          "rows": [
            [
              "4 Heritage Bungalows — Adult",
              "7,671.60"
            ],
            [
              "3 Bush Suites — Double — Adult",
              "8,683.20"
            ],
            [
              "3 Bush Suites — Triple — Adult",
              "8,128.80"
            ],
            [
              "3 Bush Suites — Quad — Adult",
              "7,567.20"
            ],
            [
              "3 Explorer Bungalows — Adult",
              "9,824.40"
            ],
            [
              "1 Honeymoon Bungalow — Adult",
              "10,558.80"
            ],
            [
              "4 Heritage Bungalows — Child (3–11)",
              "4,795.20"
            ],
            [
              "3 Bush Suites — Double — Child (3–11)",
              "5,428.80"
            ],
            [
              "3 Bush Suites — Triple — Child (3–11)",
              "5,428.80"
            ],
            [
              "3 Bush Suites — Quad — Child (3–11)",
              "5,428.80"
            ],
            [
              "3 Explorer Bungalows — Child (3–11)",
              "6,141.60"
            ],
            [
              "1 Honeymoon Bungalow — Child (3–11)",
              "6,600.60"
            ]
          ]
        },
        {
          "title": "Activities & Nature Drives",
          "rows": [
            [
              "Morning / Afternoon Etosha Game Drive (4 hrs) — Rate",
              "2,100"
            ],
            [
              "Onguma Sunrise Drive (3 hrs) — Rate",
              "1,068"
            ],
            [
              "Onguma Sundowner Drive (3 hrs) — Rate",
              "1,068"
            ],
            [
              "Interpretive Nature Walk (1½ hrs · min age 16) — Rate",
              "1,068"
            ],
            [
              "Mid-Morning Onkolo Hide (3 hrs · min age 7) — Rate",
              "780"
            ],
            [
              "Young Explorers Walk (1½ hrs) — Rate",
              "504"
            ],
            [
              "Private Game Drive (4 hrs) — Rate",
              "11,640"
            ],
            [
              "Private Game Drive — Full Day (8 hrs) — Rate",
              "18,600"
            ],
            [
              "Private Game Drive — Fully Inclusive surcharge (per activity) — Rate",
              "7,200"
            ],
            [
              "Private Game Drive — Fully Inclusive surcharge (full day) — Rate",
              "9,000"
            ]
          ]
        },
        {
          "title": "Onguma Dream Cruiser (Sleep-Out)",
          "rows": [
            [
              "Onguma Dream Cruiser (max 2 guests) — Rate",
              "11,760"
            ],
            [
              "Additional surcharge — Leadwood & Tamboti Campsite — Rate",
              "6,240"
            ]
          ]
        },
        {
          "title": "Additional Meals",
          "rows": [
            [
              "Breakfast — Rate",
              "348"
            ],
            [
              "Breakfast Pack — Rate",
              "348"
            ],
            [
              "Lunch (3 course) — Rate",
              "432"
            ],
            [
              "Lunch Pack — Rate",
              "312"
            ],
            [
              "Dinner (3 course) — Rate",
              "768"
            ],
            [
              "Dinner (4 course) — Rate",
              "972"
            ]
          ]
        }
      ]
    }
  },
  "onguma-tented-camp": {
    "2026": {
      "name": "Onguma Tented Camp",
      "region": "East Etosha",
      "currency": "N$",
      "validity": "2026",
      "note": "Rack derived from the supplier net rate at the house +20% ceiling — replace when the supplier publishes its own rack.",
      "sections": [
        {
          "title": "All-Inclusive Rates — 01.11.2025 to 31.10.2026",
          "rows": [
            [
              "Luxury Safari Tent — per person sharing (All-Inclusive) — Rate (N$)",
              "14,217.60"
            ],
            [
              "Single Supplement — Rate (N$)",
              "2,918.40"
            ]
          ]
        },
        {
          "title": "Activities & Nature Drives",
          "rows": [
            [
              "Morning / Afternoon Etosha Game Drive (4 hrs) — Rate",
              "2,100"
            ],
            [
              "Onguma Sunrise Drive (3 hrs) — Rate",
              "1,068"
            ],
            [
              "Onguma Sundowner Drive (3 hrs) — Rate",
              "1,068"
            ],
            [
              "Interpretive Nature Walk (1½ hrs · min age 16) — Rate",
              "1,068"
            ],
            [
              "Mid-Morning Onkolo Hide (3 hrs · min age 7) — Rate",
              "780"
            ],
            [
              "Young Explorers Walk (1½ hrs) — Rate",
              "504"
            ],
            [
              "Private Game Drive (4 hrs) — Rate",
              "11,640"
            ],
            [
              "Private Game Drive — Full Day (8 hrs) — Rate",
              "18,600"
            ],
            [
              "Private Game Drive — Fully Inclusive surcharge (per activity) — Rate",
              "7,200"
            ],
            [
              "Private Game Drive — Fully Inclusive surcharge (full day) — Rate",
              "9,000"
            ]
          ]
        },
        {
          "title": "Onguma Dream Cruiser (Sleep-Out)",
          "rows": [
            [
              "Onguma Dream Cruiser (max 2 guests) — Rate",
              "11,760"
            ],
            [
              "Additional surcharge — Leadwood & Tamboti Campsite — Rate",
              "6,240"
            ]
          ]
        },
        {
          "title": "Additional Meals",
          "rows": [
            [
              "Breakfast — Rate",
              "348"
            ],
            [
              "Breakfast Pack — Rate",
              "348"
            ],
            [
              "Lunch (3 course) — Rate",
              "432"
            ],
            [
              "Lunch Pack — Rate",
              "312"
            ],
            [
              "Dinner (3 course) — Rate",
              "768"
            ],
            [
              "Dinner (4 course) — Rate",
              "972"
            ]
          ]
        }
      ]
    }
  },
  "onguma-the-fort": {
    "2026": {
      "name": "Onguma The Fort",
      "region": "East Etosha",
      "currency": "N$",
      "validity": "2026",
      "note": "Rack derived from the supplier net rate at the house +20% ceiling — replace when the supplier publishes its own rack.",
      "sections": [
        {
          "title": "Dinner, Bed & Breakfast (per person sharing)",
          "rows": [
            [
              "11 Bush Suites — Rate (N$) — Dinner, Bed & Breakfast (per person sharing)",
              "10,137.60"
            ],
            [
              "Bush Suite — Child (7–11) — Rate (N$) — Dinner, Bed & Breakfast (per person sharing)",
              "6,336"
            ],
            [
              "1 Sultan Suite — Rate (N$) — Dinner, Bed & Breakfast (per person sharing)",
              "12,345.60"
            ],
            [
              "Sultan Suite — Child (7–11) — Rate (N$) — Dinner, Bed & Breakfast (per person sharing)",
              "7,716"
            ],
            [
              "1 Honeymoon Suite — Rate (N$) — Dinner, Bed & Breakfast (per person sharing)",
              "14,150.40"
            ],
            [
              "Honeymoon Suite — Child (7–11) — Rate (N$) — Dinner, Bed & Breakfast (per person sharing)",
              "8,844"
            ]
          ]
        },
        {
          "title": "All-Inclusive (per person sharing)",
          "rows": [
            [
              "11 Bush Suites — Rate (N$) — All-Inclusive (per person sharing)",
              "14,467.20"
            ],
            [
              "Bush Suite — Child (7–11) — Rate (N$) — All-Inclusive (per person sharing)",
              "9,036"
            ],
            [
              "1 Sultan Suite — Rate (N$) — All-Inclusive (per person sharing)",
              "16,675.20"
            ],
            [
              "Sultan Suite — Child (7–11) — Rate (N$) — All-Inclusive (per person sharing)",
              "10,416"
            ],
            [
              "1 Honeymoon Suite — Rate (N$) — All-Inclusive (per person sharing)",
              "18,480"
            ],
            [
              "Honeymoon Suite — Child (7–11) — Rate (N$) — All-Inclusive (per person sharing)",
              "11,556"
            ]
          ]
        },
        {
          "title": "Single Supplement (per night)",
          "rows": [
            [
              "Bush Suite — Rate (N$)",
              "3,379.20"
            ],
            [
              "Sultan Suite — Rate (N$)",
              "3,753.60"
            ],
            [
              "Honeymoon Suite — Rate (N$)",
              "7,113.60"
            ]
          ]
        },
        {
          "title": "3-Night DBB Package (per person · fixed)",
          "rows": [
            [
              "11 Bush Suites — Adult",
              "24,192"
            ],
            [
              "1 Sultan Suite — Adult",
              "29,181.60"
            ],
            [
              "1 Honeymoon Suite — Adult",
              "34,088.40"
            ],
            [
              "11 Bush Suites — Child (7–11)",
              "15,120"
            ],
            [
              "1 Sultan Suite — Child (7–11)",
              "18,240"
            ],
            [
              "1 Honeymoon Suite — Child (7–11)",
              "21,306"
            ]
          ]
        },
        {
          "title": "Activities & Nature Drives",
          "rows": [
            [
              "Morning / Afternoon Etosha Game Drive (4 hrs) — Rate",
              "2,100"
            ],
            [
              "Onguma Sunrise Drive (3 hrs) — Rate",
              "1,068"
            ],
            [
              "Onguma Sundowner Drive (3 hrs) — Rate",
              "1,068"
            ],
            [
              "Interpretive Nature Walk (1½ hrs · min age 16) — Rate",
              "1,068"
            ],
            [
              "Mid-Morning Onkolo Hide (3 hrs · min age 7) — Rate",
              "780"
            ],
            [
              "Young Explorers Walk (1½ hrs) — Rate",
              "504"
            ],
            [
              "Private Game Drive (4 hrs) — Rate",
              "11,640"
            ],
            [
              "Private Game Drive — Full Day (8 hrs) — Rate",
              "18,600"
            ],
            [
              "Private Game Drive — Fully Inclusive surcharge (per activity) — Rate",
              "7,200"
            ],
            [
              "Private Game Drive — Fully Inclusive surcharge (full day) — Rate",
              "9,000"
            ]
          ]
        },
        {
          "title": "Onguma Dream Cruiser (Sleep-Out)",
          "rows": [
            [
              "Onguma Dream Cruiser (max 2 guests) — Rate",
              "11,760"
            ],
            [
              "Additional surcharge — Leadwood & Tamboti Campsite — Rate",
              "6,240"
            ]
          ]
        },
        {
          "title": "Additional Meals",
          "rows": [
            [
              "Breakfast — Rate",
              "348"
            ],
            [
              "Breakfast Pack — Rate",
              "348"
            ],
            [
              "Lunch (3 course) — Rate",
              "432"
            ],
            [
              "Lunch Pack — Rate",
              "312"
            ],
            [
              "Dinner (3 course) — Rate",
              "768"
            ],
            [
              "Dinner (4 course) — Rate",
              "972"
            ]
          ]
        }
      ]
    }
  },
  "villa-mushara": {
    "2026": {
      "name": "Villa Mushara",
      "region": "East Etosha",
      "currency": "N$",
      "validity": "2026",
      "note": "Rack derived from the supplier net rate at the house +20% ceiling — replace when the supplier publishes its own rack.",
      "sections": [
        {
          "title": "Shoulder Season — 01.01.2026 to 30.06.2026",
          "rows": [
            [
              "Single Occupancy — DBB — STO Rate (N$) — Shoulder Season — 01.01.2026 to 30.06.2026",
              "8,928"
            ],
            [
              "Double Occupancy — DBB — STO Rate (N$) — Shoulder Season — 01.01.2026 to 30.06.2026",
              "6,816"
            ],
            [
              "Single Occupancy — Fully Inclusive — STO Rate (N$) — Shoulder Season — 01.01.2026 to 30.06.2026",
              "13,056"
            ],
            [
              "Double Occupancy — Fully Inclusive — STO Rate (N$) — Shoulder Season — 01.01.2026 to 30.06.2026",
              "9,984"
            ],
            [
              "Single Guide Room — DBB — STO Rate (N$) — Shoulder Season — 01.01.2026 to 30.06.2026",
              "2,040"
            ]
          ]
        },
        {
          "title": "High Season — 01.07.2026 to 31.12.2026",
          "rows": [
            [
              "Single Occupancy — DBB — STO Rate (N$) — High Season — 01.07.2026 to 31.12.2026",
              "9,600"
            ],
            [
              "Double Occupancy — DBB — STO Rate (N$) — High Season — 01.07.2026 to 31.12.2026",
              "7,392"
            ],
            [
              "Single Occupancy — Fully Inclusive — STO Rate (N$) — High Season — 01.07.2026 to 31.12.2026",
              "14,112"
            ],
            [
              "Double Occupancy — Fully Inclusive — STO Rate (N$) — High Season — 01.07.2026 to 31.12.2026",
              "10,800"
            ],
            [
              "Single Guide Room — DBB — STO Rate (N$) — High Season — 01.07.2026 to 31.12.2026",
              "2,040"
            ]
          ]
        },
        {
          "title": "Etosha Private Excursions & Activities",
          "rows": [
            [
              "Morning or Afternoon Scheduled Game Drive (pp) — STO Rate (N$)",
              "1,482"
            ],
            [
              "Morning or Afternoon Private Game Drive (per vehicle exclusive) — STO Rate (N$)",
              "11,832"
            ],
            [
              "Pilot Separate Airstrip Transfer (per transfer) — STO Rate (N$)",
              "600"
            ]
          ]
        },
        {
          "title": "Dining & Extras",
          "rows": [
            [
              "Lunch (per person) — STO Rate (N$)",
              "360"
            ],
            [
              "Lunch Pack (per person) — STO Rate (N$)",
              "240"
            ]
          ]
        }
      ]
    }
  },
  "kalahari-bush-breaks": {
    "2026": {
      "name": "Kalahari Bush Breaks",
      "region": "Kalahari",
      "currency": "N$",
      "validity": "2026",
      "note": "Rack derived from the supplier net rate at the house +20% ceiling — replace when the supplier publishes its own rack.",
      "sections": [
        {
          "title": "Lodge Rates 2026",
          "rows": [
            [
              "Per Person Sharing — DBB — STO Rate (N$)",
              "3,264"
            ],
            [
              "Single Person — DBB — STO Rate (N$)",
              "4,896"
            ],
            [
              "Child 2–12 Max 2 in Family Room — DBB — STO Rate (N$)",
              "1,632"
            ],
            [
              "Tour Guide — DBB — STO Rate (N$)",
              "1,980"
            ]
          ]
        },
        {
          "title": "Campsite — Self-Catering",
          "rows": [
            [
              "Kalahari Campsite Pitch — pppn — STO Rate (N$)",
              "324"
            ]
          ]
        },
        {
          "title": "Meals & Dining Extras",
          "rows": [
            [
              "Dinner (adult) — STO Rate (N$)",
              "660"
            ],
            [
              "Dinner (child 2–11) — STO Rate (N$)",
              "456"
            ],
            [
              "Breakfast (adult) — STO Rate (N$)",
              "420"
            ],
            [
              "Lunch Pack (per person) — STO Rate (N$)",
              "336"
            ]
          ]
        }
      ]
    }
  },
  "hoanib-elephant-camp": {
    "2026": {
      "name": "Hoanib Elephant Camp",
      "region": "Kaokoland",
      "currency": "N$",
      "validity": "2026",
      "note": "Rack derived from the supplier net rate at the house +20% ceiling — replace when the supplier publishes its own rack.",
      "sections": [
        {
          "title": "Hoanib Elephant Camp",
          "rows": [
            [
              "Per Night RatePer Person Sharing — Shoulder Season 1-30 Apr / 1-30 Jun 1 Nov-19 Dec — Hoanib Elephant Camp",
              "19,848"
            ],
            [
              "Single Supplement — Shoulder Season 1-30 Apr / 1-30 Jun 1 Nov-19 Dec — Hoanib Elephant Camp",
              "7,965.60"
            ],
            [
              "Private VehiclePer vehicle per night — Shoulder Season 1-30 Apr / 1-30 Jun 1 Nov-19 Dec — Hoanib Elephant Camp",
              "11,850"
            ],
            [
              "Per Night RatePer Person Sharing — Shoulder High 1-31 May — Hoanib Elephant Camp",
              "21,537.60"
            ],
            [
              "Single Supplement — Shoulder High 1-31 May — Hoanib Elephant Camp",
              "8,643.60"
            ],
            [
              "Private VehiclePer vehicle per night — Shoulder High 1-31 May — Hoanib Elephant Camp",
              "11,850"
            ],
            [
              "Per Night RatePer Person Sharing — High Season 1 Sep-31 Oct 20 Dec-9 Jan — Hoanib Elephant Camp",
              "23,803.20"
            ],
            [
              "Single Supplement — High Season 1 Sep-31 Oct 20 Dec-9 Jan — Hoanib Elephant Camp",
              "9,552"
            ],
            [
              "Private VehiclePer vehicle per night — High Season 1 Sep-31 Oct 20 Dec-9 Jan — Hoanib Elephant Camp",
              "14,514"
            ],
            [
              "Per Night RatePer Person Sharing — Peak Season 1 Jul-31 Aug — Hoanib Elephant Camp",
              "27,451.20"
            ],
            [
              "Single Supplement — Peak Season 1 Jul-31 Aug — Hoanib Elephant Camp",
              "11,016"
            ],
            [
              "Private VehiclePer vehicle per night — Peak Season 1 Jul-31 Aug — Hoanib Elephant Camp",
              "14,514"
            ]
          ]
        },
        {
          "title": "When would you like to travel?",
          "rows": [
            [
              "Per Night RatePer Person Sharing — Shoulder Season 1-30 Apr / 1-30 Jun 1 Nov-19 Dec — When would you like to travel?",
              "19,848"
            ],
            [
              "Single Supplement — Shoulder Season 1-30 Apr / 1-30 Jun 1 Nov-19 Dec — When would you like to travel?",
              "7,965.60"
            ],
            [
              "Private VehiclePer vehicle per night — Shoulder Season 1-30 Apr / 1-30 Jun 1 Nov-19 Dec — When would you like to travel?",
              "11,850"
            ],
            [
              "Per Night RatePer Person Sharing — Shoulder High 1-31 May — When would you like to travel?",
              "21,537.60"
            ],
            [
              "Single Supplement — Shoulder High 1-31 May — When would you like to travel?",
              "8,643.60"
            ],
            [
              "Private VehiclePer vehicle per night — Shoulder High 1-31 May — When would you like to travel?",
              "11,850"
            ],
            [
              "Per Night RatePer Person Sharing — High Season 1 Sep-31 Oct 20 Dec-9 Jan — When would you like to travel?",
              "23,803.20"
            ],
            [
              "Single Supplement — High Season 1 Sep-31 Oct 20 Dec-9 Jan — When would you like to travel?",
              "9,552"
            ],
            [
              "Private VehiclePer vehicle per night — High Season 1 Sep-31 Oct 20 Dec-9 Jan — When would you like to travel?",
              "14,514"
            ],
            [
              "Per Night RatePer Person Sharing — Peak Season 1 Jul-31 Aug — When would you like to travel?",
              "27,451.20"
            ],
            [
              "Single Supplement — Peak Season 1 Jul-31 Aug — When would you like to travel?",
              "11,016"
            ],
            [
              "Private VehiclePer vehicle per night — Peak Season 1 Jul-31 Aug — When would you like to travel?",
              "14,514"
            ]
          ]
        }
      ]
    }
  },
  "hoanib-valley-camp": {
    "2026": {
      "name": "Hoanib Valley Camp",
      "region": "Kaokoland",
      "currency": "N$",
      "validity": "2026",
      "note": "Rack derived from the supplier net rate at the house +20% ceiling — replace when the supplier publishes its own rack.",
      "sections": [
        {
          "title": "Hoanib Valley Camp",
          "rows": [
            [
              "1-5 Night RatePer Person Sharing — Shoulder Season 1-30 Apr / 1-30 Jun 1 Nov-19 Dec — Hoanib Valley Camp",
              "18,043.20"
            ],
            [
              "Single Supplement — Shoulder Season 1-30 Apr / 1-30 Jun 1 Nov-19 Dec — Hoanib Valley Camp",
              "7,240.80"
            ],
            [
              "6-7 Night RatePer Person Sharing — Shoulder Season 1-30 Apr / 1-30 Jun 1 Nov-19 Dec — Hoanib Valley Camp",
              "16,239.60"
            ],
            [
              "Single Supplement — Shoulder Season 1-30 Apr / 1-30 Jun 1 Nov-19 Dec — Hoanib Valley Camp (2)",
              "6,517.20"
            ],
            [
              "8+ Night RatePer Person Sharing — Shoulder Season 1-30 Apr / 1-30 Jun 1 Nov-19 Dec — Hoanib Valley Camp",
              "15,337.20"
            ],
            [
              "Single Supplement — Shoulder Season 1-30 Apr / 1-30 Jun 1 Nov-19 Dec — Hoanib Valley Camp (3)",
              "6,154.80"
            ],
            [
              "Private VehiclePer vehicle per night — Shoulder Season 1-30 Apr / 1-30 Jun 1 Nov-19 Dec — Hoanib Valley Camp",
              "11,850"
            ],
            [
              "1-5 Night RatePer Person Sharing — Shoulder High 1-31 May — Hoanib Valley Camp",
              "19,579.20"
            ],
            [
              "Single Supplement — Shoulder High 1-31 May — Hoanib Valley Camp",
              "7,857.60"
            ],
            [
              "6-7 Night RatePer Person Sharing — Shoulder High 1-31 May — Hoanib Valley Camp",
              "18,600"
            ],
            [
              "Single Supplement — Shoulder High 1-31 May — Hoanib Valley Camp (2)",
              "7,464"
            ],
            [
              "8+ Night RatePer Person Sharing — Shoulder High 1-31 May — Hoanib Valley Camp",
              "17,622"
            ],
            [
              "Single Supplement — Shoulder High 1-31 May — Hoanib Valley Camp (3)",
              "7,071.60"
            ],
            [
              "Private VehiclePer vehicle per night — Shoulder High 1-31 May — Hoanib Valley Camp",
              "11,850"
            ],
            [
              "1-5 Night RatePer Person Sharing — High Season 1 Sep-31 Oct 20 Dec-9 Jan — Hoanib Valley Camp",
              "21,643.20"
            ],
            [
              "Single Supplement — High Season 1 Sep-31 Oct 20 Dec-9 Jan — Hoanib Valley Camp",
              "8,685.60"
            ],
            [
              "6-7 Night RatePer Person Sharing — High Season 1 Sep-31 Oct 20 Dec-9 Jan — Hoanib Valley Camp",
              "20,560.80"
            ],
            [
              "Single Supplement — High Season 1 Sep-31 Oct 20 Dec-9 Jan — Hoanib Valley Camp (2)",
              "8,251.20"
            ],
            [
              "8+ Night RatePer Person Sharing — High Season 1 Sep-31 Oct 20 Dec-9 Jan — Hoanib Valley Camp",
              "19,479.60"
            ],
            [
              "Single Supplement — High Season 1 Sep-31 Oct 20 Dec-9 Jan — Hoanib Valley Camp (3)",
              "7,816.80"
            ],
            [
              "Private VehiclePer vehicle per night — High Season 1 Sep-31 Oct 20 Dec-9 Jan — Hoanib Valley Camp",
              "14,514"
            ],
            [
              "1-5 Night RatePer Person Sharing — Peak Season 1 Jul-31 Aug — Hoanib Valley Camp",
              "24,955.20"
            ],
            [
              "Single Supplement — Peak Season 1 Jul-31 Aug — Hoanib Valley Camp",
              "10,015.20"
            ],
            [
              "6-7 Night RatePer Person Sharing — Peak Season 1 Jul-31 Aug — Hoanib Valley Camp",
              "23,707.20"
            ],
            [
              "Single Supplement — Peak Season 1 Jul-31 Aug — Hoanib Valley Camp (2)",
              "9,513.60"
            ],
            [
              "8+ Night RatePer Person Sharing — Peak Season 1 Jul-31 Aug — Hoanib Valley Camp",
              "23,707.20"
            ],
            [
              "Single Supplement — Peak Season 1 Jul-31 Aug — Hoanib Valley Camp (3)",
              "9,513.60"
            ],
            [
              "Private VehiclePer vehicle per night — Peak Season 1 Jul-31 Aug — Hoanib Valley Camp",
              "14,514"
            ]
          ]
        },
        {
          "title": "When would you like to travel?",
          "rows": [
            [
              "1-5 Night RatePer Person Sharing — Shoulder Season 1-30 Apr / 1-30 Jun 1 Nov-19 Dec — When would you like to travel?",
              "18,043.20"
            ],
            [
              "Single Supplement — Shoulder Season 1-30 Apr / 1-30 Jun 1 Nov-19 Dec — When would you like to travel?",
              "7,240.80"
            ],
            [
              "6-7 Night RatePer Person Sharing — Shoulder Season 1-30 Apr / 1-30 Jun 1 Nov-19 Dec — When would you like to travel?",
              "16,239.60"
            ],
            [
              "Single Supplement — Shoulder Season 1-30 Apr / 1-30 Jun 1 Nov-19 Dec — When would you like to travel? (2)",
              "6,517.20"
            ],
            [
              "8+ Night RatePer Person Sharing — Shoulder Season 1-30 Apr / 1-30 Jun 1 Nov-19 Dec — When would you like to travel?",
              "15,337.20"
            ],
            [
              "Single Supplement — Shoulder Season 1-30 Apr / 1-30 Jun 1 Nov-19 Dec — When would you like to travel? (3)",
              "6,154.80"
            ],
            [
              "Private VehiclePer vehicle per night — Shoulder Season 1-30 Apr / 1-30 Jun 1 Nov-19 Dec — When would you like to travel?",
              "11,850"
            ],
            [
              "1-5 Night RatePer Person Sharing — Shoulder High 1-31 May — When would you like to travel?",
              "19,579.20"
            ],
            [
              "Single Supplement — Shoulder High 1-31 May — When would you like to travel?",
              "7,857.60"
            ],
            [
              "6-7 Night RatePer Person Sharing — Shoulder High 1-31 May — When would you like to travel?",
              "18,600"
            ],
            [
              "Single Supplement — Shoulder High 1-31 May — When would you like to travel? (2)",
              "7,464"
            ],
            [
              "8+ Night RatePer Person Sharing — Shoulder High 1-31 May — When would you like to travel?",
              "17,622"
            ],
            [
              "Single Supplement — Shoulder High 1-31 May — When would you like to travel? (3)",
              "7,071.60"
            ],
            [
              "Private VehiclePer vehicle per night — Shoulder High 1-31 May — When would you like to travel?",
              "11,850"
            ],
            [
              "1-5 Night RatePer Person Sharing — High Season 1 Sep-31 Oct 20 Dec-9 Jan — When would you like to travel?",
              "21,643.20"
            ],
            [
              "Single Supplement — High Season 1 Sep-31 Oct 20 Dec-9 Jan — When would you like to travel?",
              "8,685.60"
            ],
            [
              "6-7 Night RatePer Person Sharing — High Season 1 Sep-31 Oct 20 Dec-9 Jan — When would you like to travel?",
              "20,560.80"
            ],
            [
              "Single Supplement — High Season 1 Sep-31 Oct 20 Dec-9 Jan — When would you like to travel? (2)",
              "8,251.20"
            ],
            [
              "8+ Night RatePer Person Sharing — High Season 1 Sep-31 Oct 20 Dec-9 Jan — When would you like to travel?",
              "19,479.60"
            ],
            [
              "Single Supplement — High Season 1 Sep-31 Oct 20 Dec-9 Jan — When would you like to travel? (3)",
              "7,816.80"
            ],
            [
              "Private VehiclePer vehicle per night — High Season 1 Sep-31 Oct 20 Dec-9 Jan — When would you like to travel?",
              "14,514"
            ],
            [
              "1-5 Night RatePer Person Sharing — Peak Season 1 Jul-31 Aug — When would you like to travel?",
              "24,955.20"
            ],
            [
              "Single Supplement — Peak Season 1 Jul-31 Aug — When would you like to travel?",
              "10,015.20"
            ],
            [
              "6-7 Night RatePer Person Sharing — Peak Season 1 Jul-31 Aug — When would you like to travel?",
              "23,707.20"
            ],
            [
              "Single Supplement — Peak Season 1 Jul-31 Aug — When would you like to travel? (2)",
              "9,513.60"
            ],
            [
              "8+ Night RatePer Person Sharing — Peak Season 1 Jul-31 Aug — When would you like to travel?",
              "23,707.20"
            ],
            [
              "Single Supplement — Peak Season 1 Jul-31 Aug — When would you like to travel? (3)",
              "9,513.60"
            ],
            [
              "Private VehiclePer vehicle per night — Peak Season 1 Jul-31 Aug — When would you like to travel?",
              "14,514"
            ]
          ]
        }
      ]
    }
  },
  "l-deritz-nest-hotel": {
    "2026": {
      "name": "Lüderitz Nest Hotel",
      "region": "Luderitz",
      "currency": "N$",
      "validity": "2026",
      "note": "Rack derived from the supplier net rate at the house +20% ceiling — replace when the supplier publishes its own rack.",
      "sections": [
        {
          "title": "Comfort Rooms — B&B (per room — gross)",
          "rows": [
            [
              "Comfort Single — Rate (N$)",
              "3,019.20"
            ],
            [
              "Comfort Twin / Double — Rate (N$)",
              "4,855.20"
            ],
            [
              "Comfort Family Room (max 2 adults + 2 children 0–12) — Rate (N$)",
              "7,874.40"
            ]
          ]
        },
        {
          "title": "Deluxe Rooms & Suite — B&B (per room — gross)",
          "rows": [
            [
              "Deluxe Single — Rate (N$)",
              "3,702.60"
            ],
            [
              "Deluxe Twin / Double — Rate (N$)",
              "5,926.20"
            ],
            [
              "Suite — Rate (N$)",
              "9,843"
            ],
            [
              "Tour Guide (50% of single rack) — Rate (N$)",
              "1,776"
            ]
          ]
        },
        {
          "title": "Meals (per person — gross)",
          "rows": [
            [
              "Breakfast — adult — Rate (N$)",
              "408"
            ],
            [
              "Breakfast — child 3–12 yrs — Rate (N$)",
              "288"
            ],
            [
              "Lunch — adult — Rate (N$)",
              "612"
            ],
            [
              "Lunch — child 3–12 yrs — Rate (N$)",
              "432"
            ],
            [
              "Dinner — adult — Rate (N$)",
              "792"
            ],
            [
              "Dinner — child 3–12 yrs — Rate (N$)",
              "564"
            ],
            [
              "Lunchpack — Rate (N$)",
              "384"
            ]
          ]
        }
      ]
    }
  },
  "shark-island-resort": {
    "2026": {
      "name": "Shark Island Resort",
      "region": "Luderitz",
      "currency": "N$",
      "validity": "2026",
      "note": "Rack derived from the supplier net rate at the house +20% ceiling — replace when the supplier publishes its own rack.",
      "sections": [
        {
          "title": "Rack Rates",
          "rows": [
            [
              "Campsite (max 8) — Low PPS (N$)",
              "396"
            ],
            [
              "Lighthouse (min 2 people) — Low PPS (N$)",
              "1,452"
            ],
            [
              "Campsite (max 8) — High PPS (N$)",
              "396"
            ],
            [
              "Lighthouse (min 2 people) — High PPS (N$)",
              "1,452"
            ]
          ]
        }
      ]
    }
  },
  "forgotten-valley": {
    "2026": {
      "name": "Forgotten Valley (Ekoto Camp)",
      "region": "Opuwo",
      "currency": "N$",
      "validity": "2026",
      "note": "Rack derived from the supplier net rate at the house +20% ceiling — replace when the supplier publishes its own rack.",
      "sections": [
        {
          "title": "Chalet Rates 2026",
          "rows": [
            [
              "Per Person Sharing — Self-Catering — STO Rate (N$)",
              "2,832"
            ],
            [
              "Single Person — Self-Catering — STO Rate (N$)",
              "5,664"
            ],
            [
              "Child 6–12 Sharing — STO Rate (N$)",
              "816"
            ],
            [
              "Tour Guide — STO Rate (N$)",
              "1,200"
            ],
            [
              "Exclusive Use — All 6 Chalets (Max 12 pax) — STO Rate (N$)",
              "33,984"
            ]
          ]
        },
        {
          "title": "Ekoto Excursions & Extras",
          "rows": [
            [
              "Compulsory Conservancy Levy (per adult per stay) — STO Rate (N$)",
              "300"
            ],
            [
              "Guided Hike pp (2–4 hours, min 2 pax) — STO Rate (N$)",
              "420"
            ]
          ]
        }
      ]
    }
  },
  "kwessi-dunes": {
    "2026": {
      "name": "Kwessi Dunes",
      "region": "Sossusvlei",
      "currency": "N$",
      "validity": "2026",
      "note": "Rack derived from the supplier net rate at the house +20% ceiling — replace when the supplier publishes its own rack.",
      "sections": [
        {
          "title": "Kwessi Dunes",
          "rows": [
            [
              "1-5 Night RatePer Person Sharing — Shoulder Season 1-30 Apr / 1-30 Jun 1 Nov-19 Dec — Kwessi Dunes",
              "11,995.20"
            ],
            [
              "Single Supplement — Shoulder Season 1-30 Apr / 1-30 Jun 1 Nov-19 Dec — Kwessi Dunes",
              "4,813.20"
            ],
            [
              "6-7 Night RatePer Person Sharing — Shoulder Season 1-30 Apr / 1-30 Jun 1 Nov-19 Dec — Kwessi Dunes",
              "10,796.40"
            ],
            [
              "Single Supplement — Shoulder Season 1-30 Apr / 1-30 Jun 1 Nov-19 Dec — Kwessi Dunes (2)",
              "4,333.20"
            ],
            [
              "8+ Night RatePer Person Sharing — Shoulder Season 1-30 Apr / 1-30 Jun 1 Nov-19 Dec — Kwessi Dunes",
              "10,196.40"
            ],
            [
              "Single Supplement — Shoulder Season 1-30 Apr / 1-30 Jun 1 Nov-19 Dec — Kwessi Dunes (3)",
              "4,092"
            ],
            [
              "Private VehiclePer vehicle per night — Shoulder Season 1-30 Apr / 1-30 Jun 1 Nov-19 Dec — Kwessi Dunes",
              "11,850"
            ],
            [
              "1-5 Night RatePer Person Sharing — Shoulder High 1-31 May — Kwessi Dunes",
              "14,059.20"
            ],
            [
              "Single Supplement — Shoulder High 1-31 May — Kwessi Dunes",
              "5,642.40"
            ],
            [
              "6-7 Night RatePer Person Sharing — Shoulder High 1-31 May — Kwessi Dunes",
              "13,356"
            ],
            [
              "Single Supplement — Shoulder High 1-31 May — Kwessi Dunes (2)",
              "5,360.40"
            ],
            [
              "8+ Night RatePer Person Sharing — Shoulder High 1-31 May — Kwessi Dunes",
              "12,654"
            ],
            [
              "Single Supplement — Shoulder High 1-31 May — Kwessi Dunes (3)",
              "5,078.40"
            ],
            [
              "Private VehiclePer vehicle per night — Shoulder High 1-31 May — Kwessi Dunes",
              "11,850"
            ],
            [
              "1-5 Night RatePer Person Sharing — High Season 1 Sep-31 Oct 20 Dec-9 Jan — Kwessi Dunes",
              "17,707.20"
            ],
            [
              "Single Supplement — High Season 1 Sep-31 Oct 20 Dec-9 Jan — Kwessi Dunes",
              "7,106.40"
            ],
            [
              "6-7 Night RatePer Person Sharing — High Season 1 Sep-31 Oct 20 Dec-9 Jan — Kwessi Dunes",
              "16,821.60"
            ],
            [
              "Single Supplement — High Season 1 Sep-31 Oct 20 Dec-9 Jan — Kwessi Dunes (2)",
              "6,751.20"
            ],
            [
              "8+ Night RatePer Person Sharing — High Season 1 Sep-31 Oct 20 Dec-9 Jan — Kwessi Dunes",
              "15,937.20"
            ],
            [
              "Single Supplement — High Season 1 Sep-31 Oct 20 Dec-9 Jan — Kwessi Dunes (3)",
              "6,396"
            ],
            [
              "Private VehiclePer vehicle per night — High Season 1 Sep-31 Oct 20 Dec-9 Jan — Kwessi Dunes",
              "14,514"
            ],
            [
              "1-5 Night RatePer Person Sharing — Peak Season 1 Jul-31 Aug — Kwessi Dunes",
              "19,675.20"
            ],
            [
              "Single Supplement — Peak Season 1 Jul-31 Aug — Kwessi Dunes",
              "7,896"
            ],
            [
              "6-7 Night RatePer Person Sharing — Peak Season 1 Jul-31 Aug — Kwessi Dunes",
              "18,691.20"
            ],
            [
              "Single Supplement — Peak Season 1 Jul-31 Aug — Kwessi Dunes (2)",
              "7,501.20"
            ],
            [
              "8+ Night RatePer Person Sharing — Peak Season 1 Jul-31 Aug — Kwessi Dunes",
              "18,691.20"
            ],
            [
              "Single Supplement — Peak Season 1 Jul-31 Aug — Kwessi Dunes (3)",
              "7,501.20"
            ],
            [
              "Private VehiclePer vehicle per night — Peak Season 1 Jul-31 Aug — Kwessi Dunes",
              "14,514"
            ]
          ]
        },
        {
          "title": "When would you like to travel?",
          "rows": [
            [
              "1-5 Night RatePer Person Sharing — Shoulder Season 1-30 Apr / 1-30 Jun 1 Nov-19 Dec — When would you like to travel?",
              "11,995.20"
            ],
            [
              "Single Supplement — Shoulder Season 1-30 Apr / 1-30 Jun 1 Nov-19 Dec — When would you like to travel?",
              "4,813.20"
            ],
            [
              "6-7 Night RatePer Person Sharing — Shoulder Season 1-30 Apr / 1-30 Jun 1 Nov-19 Dec — When would you like to travel?",
              "10,796.40"
            ],
            [
              "Single Supplement — Shoulder Season 1-30 Apr / 1-30 Jun 1 Nov-19 Dec — When would you like to travel? (2)",
              "4,333.20"
            ],
            [
              "8+ Night RatePer Person Sharing — Shoulder Season 1-30 Apr / 1-30 Jun 1 Nov-19 Dec — When would you like to travel?",
              "10,196.40"
            ],
            [
              "Single Supplement — Shoulder Season 1-30 Apr / 1-30 Jun 1 Nov-19 Dec — When would you like to travel? (3)",
              "4,092"
            ],
            [
              "Private VehiclePer vehicle per night — Shoulder Season 1-30 Apr / 1-30 Jun 1 Nov-19 Dec — When would you like to travel?",
              "11,850"
            ],
            [
              "1-5 Night RatePer Person Sharing — Shoulder High 1-31 May — When would you like to travel?",
              "14,059.20"
            ],
            [
              "Single Supplement — Shoulder High 1-31 May — When would you like to travel?",
              "5,642.40"
            ],
            [
              "6-7 Night RatePer Person Sharing — Shoulder High 1-31 May — When would you like to travel?",
              "13,356"
            ],
            [
              "Single Supplement — Shoulder High 1-31 May — When would you like to travel? (2)",
              "5,360.40"
            ],
            [
              "8+ Night RatePer Person Sharing — Shoulder High 1-31 May — When would you like to travel?",
              "12,654"
            ],
            [
              "Single Supplement — Shoulder High 1-31 May — When would you like to travel? (3)",
              "5,078.40"
            ],
            [
              "Private VehiclePer vehicle per night — Shoulder High 1-31 May — When would you like to travel?",
              "11,850"
            ],
            [
              "1-5 Night RatePer Person Sharing — High Season 1 Sep-31 Oct 20 Dec-9 Jan — When would you like to travel?",
              "17,707.20"
            ],
            [
              "Single Supplement — High Season 1 Sep-31 Oct 20 Dec-9 Jan — When would you like to travel?",
              "7,106.40"
            ],
            [
              "6-7 Night RatePer Person Sharing — High Season 1 Sep-31 Oct 20 Dec-9 Jan — When would you like to travel?",
              "16,821.60"
            ],
            [
              "Single Supplement — High Season 1 Sep-31 Oct 20 Dec-9 Jan — When would you like to travel? (2)",
              "6,751.20"
            ],
            [
              "8+ Night RatePer Person Sharing — High Season 1 Sep-31 Oct 20 Dec-9 Jan — When would you like to travel?",
              "15,937.20"
            ],
            [
              "Single Supplement — High Season 1 Sep-31 Oct 20 Dec-9 Jan — When would you like to travel? (3)",
              "6,396"
            ],
            [
              "Private VehiclePer vehicle per night — High Season 1 Sep-31 Oct 20 Dec-9 Jan — When would you like to travel?",
              "14,514"
            ],
            [
              "1-5 Night RatePer Person Sharing — Peak Season 1 Jul-31 Aug — When would you like to travel?",
              "19,675.20"
            ],
            [
              "Single Supplement — Peak Season 1 Jul-31 Aug — When would you like to travel?",
              "7,896"
            ],
            [
              "6-7 Night RatePer Person Sharing — Peak Season 1 Jul-31 Aug — When would you like to travel?",
              "18,691.20"
            ],
            [
              "Single Supplement — Peak Season 1 Jul-31 Aug — When would you like to travel? (2)",
              "7,501.20"
            ],
            [
              "8+ Night RatePer Person Sharing — Peak Season 1 Jul-31 Aug — When would you like to travel?",
              "18,691.20"
            ],
            [
              "Single Supplement — Peak Season 1 Jul-31 Aug — When would you like to travel? (3)",
              "7,501.20"
            ],
            [
              "Private VehiclePer vehicle per night — Peak Season 1 Jul-31 Aug — When would you like to travel?",
              "14,514"
            ]
          ]
        }
      ]
    }
  },
  "anderssons-at-ongava": {
    "2026": {
      "name": "Anderssons at Ongava",
      "region": "South Etosha",
      "currency": "N$",
      "validity": "2026",
      "note": "Rack derived from the supplier net rate at the house +20% ceiling — replace when the supplier publishes its own rack.",
      "sections": [
        {
          "title": "STO15 Rates — 11.01.2026 to 10.01.2027",
          "rows": [
            [
              "Fully Inclusive — Accommodation Rate (N$) — STO15 Rates — 11.01.2026 to 10.01.2027",
              "23,868"
            ],
            [
              "Fully Inclusive — Accommodation Rate (N$) — STO15 Rates — 11.01.2026 to 10.01.2027 (2)",
              "30,192"
            ],
            [
              "Fully Inclusive — Conservation Fee (N$) — STO15 Rates — 11.01.2026 to 10.01.2027",
              "1,440"
            ],
            [
              "Fully Inclusive — Conservation Fee (N$) — STO15 Rates — 11.01.2026 to 10.01.2027 (2)",
              "1,440"
            ]
          ]
        },
        {
          "title": "Child Rates — Fully Inclusive",
          "rows": [
            [
              "Ongava Lodge, Tented Camp & Anderssons — Accommodation Rate (N$)",
              "16,800"
            ],
            [
              "Ongava Lodge, Tented Camp & Anderssons — Conservation Fee (N$)",
              "720"
            ]
          ]
        },
        {
          "title": "Guide & Pilot Rates",
          "rows": [
            [
              "Per single unit — Rate (N$)",
              "2,160"
            ]
          ]
        },
        {
          "title": "Activities & Miscellaneous",
          "rows": [
            [
              "Lunch Pack — Rate (N$)",
              "720"
            ],
            [
              "Etosha Game Drives (Scheduled) — Rate (N$)",
              "3,120"
            ],
            [
              "Ongava Property Game Drives (Scheduled) — Rate (N$)",
              "1,920"
            ],
            [
              "Nature Walk (Scheduled) — Rate (N$)",
              "840"
            ],
            [
              "Night Drives (Scheduled) — Rate (N$)",
              "1,680"
            ],
            [
              "Airfield Passenger Fee — Rate (N$)",
              "840"
            ],
            [
              "Airfield Transfer — each way — Rate (N$)",
              "720"
            ],
            [
              "Private Activities — Sole Use Guide & Vehicle (FI only) — Rate (N$)",
              "22,440"
            ]
          ]
        }
      ]
    }
  },
  "little-ongava": {
    "2026": {
      "name": "Little Ongava",
      "region": "South Etosha",
      "currency": "N$",
      "validity": "2026",
      "note": "Rack derived from the supplier net rate at the house +20% ceiling — replace when the supplier publishes its own rack.",
      "sections": [
        {
          "title": "STO15 Rates — 11.01.2026 to 10.01.2027",
          "rows": [
            [
              "Fully Inclusive — Accommodation Rate (N$) — STO15 Rates — 11.01.2026 to 10.01.2027",
              "51,816"
            ],
            [
              "Fully Inclusive — Accommodation Rate (N$) — STO15 Rates — 11.01.2026 to 10.01.2027 (2)",
              "64,708.80"
            ],
            [
              "Fully Inclusive — Conservation Fee (N$) — STO15 Rates — 11.01.2026 to 10.01.2027",
              "1,440"
            ],
            [
              "Fully Inclusive — Conservation Fee (N$) — STO15 Rates — 11.01.2026 to 10.01.2027 (2)",
              "1,440"
            ]
          ]
        },
        {
          "title": "Child Rates — Fully Inclusive",
          "rows": [
            [
              "Fully Inclusive — Accommodation Rate (N$) — Child Rates — Fully Inclusive",
              "44,400"
            ],
            [
              "Fully Inclusive — Conservation Fee (N$) — Child Rates — Fully Inclusive",
              "720"
            ]
          ]
        },
        {
          "title": "Guide & Pilot Rates",
          "rows": [
            [
              "Per single unit — Rate (N$)",
              "2,160"
            ]
          ]
        }
      ]
    }
  },
  "ongava-lodge": {
    "2026": {
      "name": "Ongava Lodge",
      "region": "South Etosha",
      "currency": "N$",
      "validity": "2026",
      "note": "Rack derived from the supplier net rate at the house +20% ceiling — replace when the supplier publishes its own rack.",
      "sections": [
        {
          "title": "STO15 Rates — 11.01.2026 to 10.01.2027",
          "rows": [
            [
              "Full Board — Accommodation Rate (N$) — STO15 Rates — 11.01.2026 to 10.01.2027",
              "12,036"
            ],
            [
              "Full Board — Accommodation Rate (N$) — STO15 Rates — 11.01.2026 to 10.01.2027 (2)",
              "15,402"
            ],
            [
              "Fully Inclusive — Accommodation Rate (N$) — STO15 Rates — 11.01.2026 to 10.01.2027",
              "17,646"
            ],
            [
              "Fully Inclusive — Accommodation Rate (N$) — STO15 Rates — 11.01.2026 to 10.01.2027 (2)",
              "22,338"
            ],
            [
              "Full Board — Conservation Fee (N$) — STO15 Rates — 11.01.2026 to 10.01.2027",
              "1,440"
            ],
            [
              "Full Board — Conservation Fee (N$) — STO15 Rates — 11.01.2026 to 10.01.2027 (2)",
              "1,440"
            ],
            [
              "Fully Inclusive — Conservation Fee (N$) — STO15 Rates — 11.01.2026 to 10.01.2027",
              "1,440"
            ],
            [
              "Fully Inclusive — Conservation Fee (N$) — STO15 Rates — 11.01.2026 to 10.01.2027 (2)",
              "1,440"
            ]
          ]
        },
        {
          "title": "Child Rates",
          "rows": [
            [
              "Full Board — Accommodation Rate (N$) — Child Rates",
              "11,160"
            ],
            [
              "Fully Inclusive — Accommodation Rate (N$) — Child Rates",
              "16,800"
            ],
            [
              "Full Board — Conservation Fee (N$) — Child Rates",
              "720"
            ],
            [
              "Fully Inclusive — Conservation Fee (N$) — Child Rates",
              "720"
            ]
          ]
        },
        {
          "title": "Guide & Pilot Rates",
          "rows": [
            [
              "Per single unit — Rate (N$)",
              "2,160"
            ]
          ]
        },
        {
          "title": "Activities & Miscellaneous",
          "rows": [
            [
              "Lunch Pack — Rate (N$)",
              "720"
            ],
            [
              "Etosha Game Drives (Scheduled) — Rate (N$)",
              "3,120"
            ],
            [
              "Ongava Property Game Drives (Scheduled) — Rate (N$)",
              "1,920"
            ],
            [
              "Nature Walk (Scheduled) — Rate (N$)",
              "840"
            ],
            [
              "Night Drives (Scheduled) — Rate (N$)",
              "1,680"
            ],
            [
              "Ongava Airfield Passenger Fee — Rate (N$)",
              "840"
            ],
            [
              "Airfield Transfer — each way — Rate (N$)",
              "720"
            ],
            [
              "Private Activities — Sole Use Guide & Vehicle (FI only) — Rate (N$)",
              "22,440"
            ]
          ]
        }
      ]
    }
  },
  "ongava-tented-camp": {
    "2026": {
      "name": "Ongava Tented Camp",
      "region": "South Etosha",
      "currency": "N$",
      "validity": "2026",
      "note": "Rack derived from the supplier net rate at the house +20% ceiling — replace when the supplier publishes its own rack.",
      "sections": [
        {
          "title": "STO15 Rates — 11.01.2026 to 10.01.2027",
          "rows": [
            [
              "Fully Inclusive — Accommodation Rate (N$) — STO15 Rates — 11.01.2026 to 10.01.2027",
              "17,646"
            ],
            [
              "Fully Inclusive — Accommodation Rate (N$) — STO15 Rates — 11.01.2026 to 10.01.2027 (2)",
              "22,338"
            ],
            [
              "Fully Inclusive — Conservation Fee (N$) — STO15 Rates — 11.01.2026 to 10.01.2027",
              "1,440"
            ],
            [
              "Fully Inclusive — Conservation Fee (N$) — STO15 Rates — 11.01.2026 to 10.01.2027 (2)",
              "1,440"
            ]
          ]
        },
        {
          "title": "Child Rates — Fully Inclusive",
          "rows": [
            [
              "Ongava Lodge, Tented Camp & Anderssons — Accommodation Rate (N$)",
              "16,800"
            ],
            [
              "Ongava Lodge, Tented Camp & Anderssons — Conservation Fee (N$)",
              "720"
            ]
          ]
        },
        {
          "title": "Guide & Pilot Rates",
          "rows": [
            [
              "Per single unit — Rate (N$)",
              "2,160"
            ]
          ]
        },
        {
          "title": "Activities & Miscellaneous",
          "rows": [
            [
              "Lunch Pack — Rate (N$)",
              "720"
            ],
            [
              "Etosha Game Drives (Scheduled) — Rate (N$)",
              "3,120"
            ],
            [
              "Ongava Property Game Drives (Scheduled) — Rate (N$)",
              "1,920"
            ],
            [
              "Nature Walk (Scheduled) — Rate (N$)",
              "840"
            ],
            [
              "Night Drives (Scheduled) — Rate (N$)",
              "1,680"
            ],
            [
              "Ongava Airfield Passenger Fee — Rate (N$)",
              "840"
            ],
            [
              "Airfield Transfer — Ongava Camp to/from airfield (each way) — Rate (N$)",
              "720"
            ],
            [
              "Private Activities — Sole Use Guide & Vehicle (FI only) — Rate (N$)",
              "22,440"
            ]
          ]
        }
      ]
    }
  },
  "etosha-mountain-lodge": {
    "2026": {
      "name": "Etosha Mountain Lodge",
      "region": "West Etosha",
      "currency": "N$",
      "validity": "2026",
      "note": "Rack derived from the supplier net rate at the house +20% ceiling — replace when the supplier publishes its own rack.",
      "sections": [
        {
          "title": "Dinner, Bed and Breakfast -- Per Person Sharing",
          "rows": [
            [
              "1-5 Night Rate — Green Season 10 Jan-31 Mar — Dinner, Bed and Breakfast -- Per Person Sharing",
              "4,219.20"
            ],
            [
              "6-7 Night Rate — Green Season 10 Jan-31 Mar — Dinner, Bed and Breakfast -- Per Person Sharing",
              "3,798"
            ],
            [
              "8+ Night Rate — Green Season 10 Jan-31 Mar — Dinner, Bed and Breakfast -- Per Person Sharing",
              "3,586.80"
            ],
            [
              "1-5 Night Rate — Shoulder Season 1-30 Apr / 1-30 Jun 1 Nov-19 Dec — Dinner, Bed and Breakfast -- Per Person Sharing",
              "5,371.20"
            ],
            [
              "6-7 Night Rate — Shoulder Season 1-30 Apr / 1-30 Jun 1 Nov-19 Dec — Dinner, Bed and Breakfast -- Per Person Sharing",
              "4,834.80"
            ],
            [
              "8+ Night Rate — Shoulder Season 1-30 Apr / 1-30 Jun 1 Nov-19 Dec — Dinner, Bed and Breakfast -- Per Person Sharing",
              "4,566"
            ],
            [
              "Single Supplement — Shoulder Season 1-30 Apr / 1-30 Jun 1 Nov-19 Dec — Dinner, Bed and Breakfast -- Per Person Sharing",
              "21,553,832.40"
            ],
            [
              "1-5 Night Rate — Shoulder High 1-31 May — Dinner, Bed and Breakfast -- Per Person Sharing",
              "5,899.20"
            ],
            [
              "6-7 Night Rate — Shoulder High 1-31 May — Dinner, Bed and Breakfast -- Per Person Sharing",
              "5,604"
            ],
            [
              "8+ Night Rate — Shoulder High 1-31 May — Dinner, Bed and Breakfast -- Per Person Sharing",
              "5,310"
            ],
            [
              "Single Supplement — Shoulder High 1-31 May — Dinner, Bed and Breakfast -- Per Person Sharing",
              "23,678,131.20"
            ],
            [
              "1-5 Night Rate — High Season 1 Sep-31 Oct 20 Dec-9 Jan — Dinner, Bed and Breakfast -- Per Person Sharing",
              "6,216"
            ],
            [
              "6-7 Night Rate — High Season 1 Sep-31 Oct 20 Dec-9 Jan — Dinner, Bed and Breakfast -- Per Person Sharing",
              "5,905.20"
            ],
            [
              "8+ Night Rate — High Season 1 Sep-31 Oct 20 Dec-9 Jan — Dinner, Bed and Breakfast -- Per Person Sharing",
              "5,594.40"
            ],
            [
              "Single Supplement — High Season 1 Sep-31 Oct 20 Dec-9 Jan — Dinner, Bed and Breakfast -- Per Person Sharing",
              "24,950,245.20"
            ],
            [
              "1-5 Night Rate — Peak Season 1 Jul-31 Aug — Dinner, Bed and Breakfast -- Per Person Sharing",
              "7,051.20"
            ],
            [
              "6-7 Night Rate — Peak Season 1 Jul-31 Aug — Dinner, Bed and Breakfast -- Per Person Sharing",
              "6,698.40"
            ],
            [
              "8+ Night Rate — Peak Season 1 Jul-31 Aug — Dinner, Bed and Breakfast -- Per Person Sharing",
              "6,698.40"
            ],
            [
              "Single Supplement — Peak Season 1 Jul-31 Aug — Dinner, Bed and Breakfast -- Per Person Sharing",
              "28,298,688"
            ]
          ]
        },
        {
          "title": "Fully Inclusive -- Per Person Sharing",
          "rows": [
            [
              "1-5 Night Rate — Green Season 10 Jan-31 Mar — Fully Inclusive -- Per Person Sharing",
              "7,032"
            ],
            [
              "6-7 Night Rate — Green Season 10 Jan-31 Mar — Fully Inclusive -- Per Person Sharing",
              "6,328.80"
            ],
            [
              "8+ Night Rate — Green Season 10 Jan-31 Mar — Fully Inclusive -- Per Person Sharing",
              "5,977.20"
            ],
            [
              "1-5 Night Rate — Shoulder Season 1-30 Apr / 1-30 Jun 1 Nov-19 Dec — Fully Inclusive -- Per Person Sharing",
              "8,241.60"
            ],
            [
              "6-7 Night Rate — Shoulder Season 1-30 Apr / 1-30 Jun 1 Nov-19 Dec — Fully Inclusive -- Per Person Sharing",
              "7,418.40"
            ],
            [
              "8+ Night Rate — Shoulder Season 1-30 Apr / 1-30 Jun 1 Nov-19 Dec — Fully Inclusive -- Per Person Sharing",
              "7,005.60"
            ],
            [
              "Single Supplement — Shoulder Season 1-30 Apr / 1-30 Jun 1 Nov-19 Dec — Fully Inclusive -- Per Person Sharing",
              "33,074,811.60"
            ],
            [
              "1-5 Night Rate — Shoulder High 1-31 May — Fully Inclusive -- Per Person Sharing",
              "9,000"
            ],
            [
              "6-7 Night Rate — Shoulder High 1-31 May — Fully Inclusive -- Per Person Sharing",
              "8,550"
            ],
            [
              "8+ Night Rate — Shoulder High 1-31 May — Fully Inclusive -- Per Person Sharing",
              "8,100"
            ],
            [
              "Single Supplement — Shoulder High 1-31 May — Fully Inclusive -- Per Person Sharing",
              "36,123,250.80"
            ],
            [
              "1-5 Night Rate — High Season 1 Sep-31 Oct 20 Dec-9 Jan — Fully Inclusive -- Per Person Sharing",
              "9,355.20"
            ],
            [
              "6-7 Night Rate — High Season 1 Sep-31 Oct 20 Dec-9 Jan — Fully Inclusive -- Per Person Sharing",
              "8,887.20"
            ],
            [
              "8+ Night Rate — High Season 1 Sep-31 Oct 20 Dec-9 Jan — Fully Inclusive -- Per Person Sharing",
              "8,420.40"
            ],
            [
              "Single Supplement — High Season 1 Sep-31 Oct 20 Dec-9 Jan — Fully Inclusive -- Per Person Sharing",
              "37,551,379.20"
            ],
            [
              "1-5 Night Rate — Peak Season 1 Jul-31 Aug — Fully Inclusive -- Per Person Sharing",
              "10,363.20"
            ],
            [
              "6-7 Night Rate — Peak Season 1 Jul-31 Aug — Fully Inclusive -- Per Person Sharing",
              "9,844.80"
            ],
            [
              "8+ Night Rate — Peak Season 1 Jul-31 Aug — Fully Inclusive -- Per Person Sharing",
              "9,844.80"
            ],
            [
              "Single Supplement — Peak Season 1 Jul-31 Aug — Fully Inclusive -- Per Person Sharing",
              "41,595,950.40"
            ]
          ]
        }
      ]
    }
  },
  "safari-house": {
    "2026": {
      "name": "Safari House",
      "region": "West Etosha",
      "currency": "N$",
      "validity": "2026",
      "note": "Rack derived from the supplier net rate at the house +20% ceiling — replace when the supplier publishes its own rack.",
      "sections": [
        {
          "title": "Safari House",
          "rows": [
            [
              "1-5 Night Rate — Green Season 10 Jan-31 Mar — Safari House",
              "35,160"
            ],
            [
              "6-7 Night Rate — Green Season 10 Jan-31 Mar — Safari House",
              "31,644"
            ],
            [
              "8+ Night Rate — Green Season 10 Jan-31 Mar — Safari House",
              "29,886"
            ],
            [
              "1-5 Night Rate — Shoulder Season 1-30 Apr / 1-30 Jun 1 Nov-19 Dec — Safari House",
              "41,208"
            ],
            [
              "6-7 Night Rate — Shoulder Season 1-30 Apr / 1-30 Jun 1 Nov-19 Dec — Safari House",
              "37,087.20"
            ],
            [
              "8+ Night Rate — Shoulder Season 1-30 Apr / 1-30 Jun 1 Nov-19 Dec — Safari House",
              "35,026.80"
            ],
            [
              "1-5 Night Rate — Shoulder High 1-31 May — Safari House",
              "45,000"
            ],
            [
              "6-7 Night Rate — Shoulder High 1-31 May — Safari House",
              "42,750"
            ],
            [
              "8+ Night Rate — Shoulder High 1-31 May — Safari House",
              "40,500"
            ],
            [
              "1-5 Night Rate — High Season 1 Sep-31 Oct 20 Dec-9 Jan — Safari House",
              "46,776"
            ],
            [
              "6-7 Night Rate — High Season 1 Sep-31 Oct 20 Dec-9 Jan — Safari House",
              "44,437.20"
            ],
            [
              "8+ Night Rate — High Season 1 Sep-31 Oct 20 Dec-9 Jan — Safari House",
              "42,098.40"
            ],
            [
              "1-5 Night Rate — Peak Season 1 Jul-31 Aug — Safari House",
              "51,816"
            ],
            [
              "6-7 Night Rate — Peak Season 1 Jul-31 Aug — Safari House",
              "49,225.20"
            ],
            [
              "8+ Night Rate — Peak Season 1 Jul-31 Aug — Safari House",
              "49,225.20"
            ]
          ]
        },
        {
          "title": "When would you like to travel?",
          "rows": [
            [
              "1-5 Night Rate — Green Season 10 Jan-31 Mar — When would you like to travel?",
              "35,160"
            ],
            [
              "6-7 Night Rate — Green Season 10 Jan-31 Mar — When would you like to travel?",
              "31,644"
            ],
            [
              "8+ Night Rate — Green Season 10 Jan-31 Mar — When would you like to travel?",
              "29,886"
            ],
            [
              "1-5 Night Rate — Shoulder Season 1-30 Apr / 1-30 Jun 1 Nov-19 Dec — When would you like to travel?",
              "41,208"
            ],
            [
              "6-7 Night Rate — Shoulder Season 1-30 Apr / 1-30 Jun 1 Nov-19 Dec — When would you like to travel?",
              "37,087.20"
            ],
            [
              "8+ Night Rate — Shoulder Season 1-30 Apr / 1-30 Jun 1 Nov-19 Dec — When would you like to travel?",
              "35,026.80"
            ],
            [
              "1-5 Night Rate — Shoulder High 1-31 May — When would you like to travel?",
              "45,000"
            ],
            [
              "6-7 Night Rate — Shoulder High 1-31 May — When would you like to travel?",
              "42,750"
            ],
            [
              "8+ Night Rate — Shoulder High 1-31 May — When would you like to travel?",
              "40,500"
            ],
            [
              "1-5 Night Rate — High Season 1 Sep-31 Oct 20 Dec-9 Jan — When would you like to travel?",
              "46,776"
            ],
            [
              "6-7 Night Rate — High Season 1 Sep-31 Oct 20 Dec-9 Jan — When would you like to travel?",
              "44,437.20"
            ],
            [
              "8+ Night Rate — High Season 1 Sep-31 Oct 20 Dec-9 Jan — When would you like to travel?",
              "42,098.40"
            ],
            [
              "1-5 Night Rate — Peak Season 1 Jul-31 Aug — When would you like to travel?",
              "51,816"
            ],
            [
              "6-7 Night Rate — Peak Season 1 Jul-31 Aug — When would you like to travel?",
              "49,225.20"
            ],
            [
              "8+ Night Rate — Peak Season 1 Jul-31 Aug — When would you like to travel?",
              "49,225.20"
            ]
          ]
        }
      ]
    }
  },
  "safarihoek-lodge": {
    "2026": {
      "name": "Safarihoek Lodge",
      "region": "West Etosha",
      "currency": "N$",
      "validity": "2026",
      "note": "Rack derived from the supplier net rate at the house +20% ceiling — replace when the supplier publishes its own rack.",
      "sections": [
        {
          "title": "Luxury Room -- DBB Per Person Sharing",
          "rows": [
            [
              "1-5 Night Rate — Green Season 10 Jan-31 Mar — Luxury Room -- DBB Per Person Sharing",
              "6,235.20"
            ],
            [
              "6-7 Night Rate — Green Season 10 Jan-31 Mar — Luxury Room -- DBB Per Person Sharing",
              "5,612.40"
            ],
            [
              "8+ Night Rate — Green Season 10 Jan-31 Mar — Luxury Room -- DBB Per Person Sharing",
              "5,300.40"
            ],
            [
              "1-5 Night Rate — Shoulder Season 1-30 Apr / 1-30 Jun 1 Nov-19 Dec — Luxury Room -- DBB Per Person Sharing",
              "7,233.60"
            ],
            [
              "6-7 Night Rate — Shoulder Season 1-30 Apr / 1-30 Jun 1 Nov-19 Dec — Luxury Room -- DBB Per Person Sharing",
              "6,511.20"
            ],
            [
              "8+ Night Rate — Shoulder Season 1-30 Apr / 1-30 Jun 1 Nov-19 Dec — Luxury Room -- DBB Per Person Sharing",
              "6,148.80"
            ],
            [
              "1-5 Night Rate — Shoulder High 1-31 May — Luxury Room -- DBB Per Person Sharing",
              "7,656"
            ],
            [
              "6-7 Night Rate — Shoulder High 1-31 May — Luxury Room -- DBB Per Person Sharing",
              "7,273.20"
            ],
            [
              "8+ Night Rate — Shoulder High 1-31 May — Luxury Room -- DBB Per Person Sharing",
              "6,890.40"
            ],
            [
              "1-5 Night Rate — High Season 1 Sep-31 Oct 20 Dec-9 Jan — Luxury Room -- DBB Per Person Sharing",
              "8,232"
            ],
            [
              "6-7 Night Rate — High Season 1 Sep-31 Oct 20 Dec-9 Jan — Luxury Room -- DBB Per Person Sharing",
              "7,820.40"
            ],
            [
              "8+ Night Rate — High Season 1 Sep-31 Oct 20 Dec-9 Jan — Luxury Room -- DBB Per Person Sharing",
              "7,408.80"
            ],
            [
              "1-5 Night Rate — Peak Season 1 Jul-31 Aug — Luxury Room -- DBB Per Person Sharing",
              "9,072"
            ],
            [
              "6-7 Night Rate — Peak Season 1 Jul-31 Aug — Luxury Room -- DBB Per Person Sharing",
              "8,618.40"
            ],
            [
              "8+ Night Rate — Peak Season 1 Jul-31 Aug — Luxury Room -- DBB Per Person Sharing",
              "8,618.40"
            ]
          ]
        },
        {
          "title": "Classic Room -- DBB Per Person Sharing",
          "rows": [
            [
              "1-5 Night Rate — Green Season 10 Jan-31 Mar — Classic Room -- DBB Per Person Sharing",
              "5,563.20"
            ],
            [
              "6-7 Night Rate — Green Season 10 Jan-31 Mar — Classic Room -- DBB Per Person Sharing",
              "5,007.60"
            ],
            [
              "8+ Night Rate — Green Season 10 Jan-31 Mar — Classic Room -- DBB Per Person Sharing",
              "4,729.20"
            ],
            [
              "1-5 Night Rate — Shoulder Season 1-30 Apr / 1-30 Jun 1 Nov-19 Dec — Classic Room -- DBB Per Person Sharing",
              "6,480"
            ],
            [
              "6-7 Night Rate — Shoulder Season 1-30 Apr / 1-30 Jun 1 Nov-19 Dec — Classic Room -- DBB Per Person Sharing",
              "5,832"
            ],
            [
              "8+ Night Rate — Shoulder Season 1-30 Apr / 1-30 Jun 1 Nov-19 Dec — Classic Room -- DBB Per Person Sharing",
              "5,508"
            ],
            [
              "1-5 Night Rate — Shoulder High 1-31 May — Classic Room -- DBB Per Person Sharing",
              "6,859.20"
            ],
            [
              "6-7 Night Rate — Shoulder High 1-31 May — Classic Room -- DBB Per Person Sharing",
              "6,516"
            ],
            [
              "8+ Night Rate — Shoulder High 1-31 May — Classic Room -- DBB Per Person Sharing",
              "6,174"
            ],
            [
              "1-5 Night Rate — High Season 1 Sep-31 Oct 20 Dec-9 Jan — Classic Room -- DBB Per Person Sharing",
              "7,368"
            ],
            [
              "6-7 Night Rate — High Season 1 Sep-31 Oct 20 Dec-9 Jan — Classic Room -- DBB Per Person Sharing",
              "6,999.60"
            ],
            [
              "8+ Night Rate — High Season 1 Sep-31 Oct 20 Dec-9 Jan — Classic Room -- DBB Per Person Sharing",
              "6,631.20"
            ],
            [
              "1-5 Night Rate — Peak Season 1 Jul-31 Aug — Classic Room -- DBB Per Person Sharing",
              "8,155.20"
            ],
            [
              "6-7 Night Rate — Peak Season 1 Jul-31 Aug — Classic Room -- DBB Per Person Sharing",
              "7,747.20"
            ],
            [
              "8+ Night Rate — Peak Season 1 Jul-31 Aug — Classic Room -- DBB Per Person Sharing",
              "7,747.20"
            ]
          ]
        },
        {
          "title": "Luxury Room -- Fully Inclusive Per Person Sharing",
          "rows": [
            [
              "1-5 Night Rate — Green Season 10 Jan-31 Mar — Luxury Room -- Fully Inclusive Per Person Sharing",
              "8,587.20"
            ],
            [
              "6-7 Night Rate — Green Season 10 Jan-31 Mar — Luxury Room -- Fully Inclusive Per Person Sharing",
              "7,729.20"
            ],
            [
              "8+ Night Rate — Green Season 10 Jan-31 Mar — Luxury Room -- Fully Inclusive Per Person Sharing",
              "7,298.40"
            ],
            [
              "1-5 Night Rate — Shoulder Season 1-30 Apr / 1-30 Jun 1 Nov-19 Dec — Luxury Room -- Fully Inclusive Per Person Sharing",
              "9,835.20"
            ],
            [
              "6-7 Night Rate — Shoulder Season 1-30 Apr / 1-30 Jun 1 Nov-19 Dec — Luxury Room -- Fully Inclusive Per Person Sharing",
              "8,852.40"
            ],
            [
              "8+ Night Rate — Shoulder Season 1-30 Apr / 1-30 Jun 1 Nov-19 Dec — Luxury Room -- Fully Inclusive Per Person Sharing",
              "8,359.20"
            ],
            [
              "1-5 Night Rate — Shoulder High 1-31 May — Luxury Room -- Fully Inclusive Per Person Sharing",
              "10,440"
            ],
            [
              "6-7 Night Rate — Shoulder High 1-31 May — Luxury Room -- Fully Inclusive Per Person Sharing",
              "9,918"
            ],
            [
              "8+ Night Rate — Shoulder High 1-31 May — Luxury Room -- Fully Inclusive Per Person Sharing",
              "9,396"
            ],
            [
              "1-5 Night Rate — High Season 1 Sep-31 Oct 20 Dec-9 Jan — Luxury Room -- Fully Inclusive Per Person Sharing",
              "10,920"
            ],
            [
              "6-7 Night Rate — High Season 1 Sep-31 Oct 20 Dec-9 Jan — Luxury Room -- Fully Inclusive Per Person Sharing",
              "10,374"
            ],
            [
              "8+ Night Rate — High Season 1 Sep-31 Oct 20 Dec-9 Jan — Luxury Room -- Fully Inclusive Per Person Sharing",
              "9,828"
            ],
            [
              "1-5 Night Rate — Peak Season 1 Jul-31 Aug — Luxury Room -- Fully Inclusive Per Person Sharing",
              "12,254.40"
            ],
            [
              "6-7 Night Rate — Peak Season 1 Jul-31 Aug — Luxury Room -- Fully Inclusive Per Person Sharing",
              "11,642.40"
            ],
            [
              "8+ Night Rate — Peak Season 1 Jul-31 Aug — Luxury Room -- Fully Inclusive Per Person Sharing",
              "11,642.40"
            ]
          ]
        },
        {
          "title": "Classic Room -- Fully Inclusive Per Person Sharing",
          "rows": [
            [
              "1-5 Night Rate — Green Season 10 Jan-31 Mar — Classic Room -- Fully Inclusive Per Person Sharing",
              "6,974.40"
            ],
            [
              "6-7 Night Rate — Green Season 10 Jan-31 Mar — Classic Room -- Fully Inclusive Per Person Sharing",
              "6,277.20"
            ],
            [
              "8+ Night Rate — Green Season 10 Jan-31 Mar — Classic Room -- Fully Inclusive Per Person Sharing",
              "5,928"
            ],
            [
              "1-5 Night Rate — Shoulder Season 1-30 Apr / 1-30 Jun 1 Nov-19 Dec — Classic Room -- Fully Inclusive Per Person Sharing",
              "8,289.60"
            ],
            [
              "6-7 Night Rate — Shoulder Season 1-30 Apr / 1-30 Jun 1 Nov-19 Dec — Classic Room -- Fully Inclusive Per Person Sharing",
              "7,461.60"
            ],
            [
              "8+ Night Rate — Shoulder Season 1-30 Apr / 1-30 Jun 1 Nov-19 Dec — Classic Room -- Fully Inclusive Per Person Sharing",
              "7,046.40"
            ],
            [
              "1-5 Night Rate — Shoulder High 1-31 May — Classic Room -- Fully Inclusive Per Person Sharing",
              "8,788.80"
            ],
            [
              "6-7 Night Rate — Shoulder High 1-31 May — Classic Room -- Fully Inclusive Per Person Sharing",
              "8,349.60"
            ],
            [
              "8+ Night Rate — Shoulder High 1-31 May — Classic Room -- Fully Inclusive Per Person Sharing",
              "7,910.40"
            ],
            [
              "1-5 Night Rate — High Season 1 Sep-31 Oct 20 Dec-9 Jan — Classic Room -- Fully Inclusive Per Person Sharing",
              "8,923.20"
            ],
            [
              "6-7 Night Rate — High Season 1 Sep-31 Oct 20 Dec-9 Jan — Classic Room -- Fully Inclusive Per Person Sharing",
              "8,476.80"
            ],
            [
              "8+ Night Rate — High Season 1 Sep-31 Oct 20 Dec-9 Jan — Classic Room -- Fully Inclusive Per Person Sharing",
              "8,031.60"
            ],
            [
              "1-5 Night Rate — Peak Season 1 Jul-31 Aug — Classic Room -- Fully Inclusive Per Person Sharing",
              "9,979.20"
            ],
            [
              "6-7 Night Rate — Peak Season 1 Jul-31 Aug — Classic Room -- Fully Inclusive Per Person Sharing",
              "9,480"
            ],
            [
              "8+ Night Rate — Peak Season 1 Jul-31 Aug — Classic Room -- Fully Inclusive Per Person Sharing",
              "9,480"
            ]
          ]
        }
      ]
    }
  },
  "windhoek-lux-suites": {
    "2026": {
      "name": "The Windhoek Lux Suites",
      "region": "Windhoek",
      "currency": "N$",
      "validity": "2026",
      "note": "Rack derived from the supplier net rate at the house +20% ceiling — replace when the supplier publishes its own rack.",
      "sections": [
        {
          "title": "Rooms — B&B (per room)",
          "rows": [
            [
              "Ground Room — Single — Rate (N$)",
              "2,468.40"
            ],
            [
              "Ground Room — Double — Rate (N$)",
              "3,702.60"
            ],
            [
              "Loft Room — Single — Rate (N$)",
              "2,468.40"
            ],
            [
              "Loft Room — Double — Rate (N$)",
              "3,702.60"
            ]
          ]
        },
        {
          "title": "Family Rooms — B&B (per room)",
          "rows": [
            [
              "Family Room — 2 adults + 2 children — Rate (N$)",
              "4,936.80"
            ],
            [
              "Family Room — 2 adults + 1 child — Rate (N$)",
              "4,319.70"
            ]
          ]
        },
        {
          "title": "Children",
          "rows": [
            [
              "Children under 3 yrs — Rate (N$)",
              "0"
            ]
          ]
        }
      ]
    }
  },
  "mowani-campsite": {
    "2026": {
      "name": "Mowani Campsite",
      "region": "Damaraland",
      "currency": "N$",
      "validity": "2026",
      "note": "Rack derived from the supplier net rate at the house +20% ceiling — replace when the supplier publishes its own rack.",
      "sections": [
        {
          "title": "NETT Rates — 01 Jan 2026 to 31 Dec 2026",
          "rows": [
            [
              "Campsite — Per Adult per night — Nett Price (N$)",
              "624"
            ],
            [
              "Campsite — Per Child (3-12 yrs) per night — Nett Price (N$)",
              "288"
            ],
            [
              "Campsite — Child under 3 yrs — Nett Price (N$)",
              "0"
            ]
          ]
        }
      ]
    }
  },
  "onguma-leadwood-campsite": {
    "2026": {
      "name": "Onguma Leadwood Campsite",
      "region": "East Etosha",
      "currency": "N$",
      "validity": "2026",
      "note": "Rack derived from the supplier net rate at the house +20% ceiling — replace when the supplier publishes its own rack.",
      "sections": [
        {
          "title": "Campsite Rates — 01.11.2025 to 31.10.2026",
          "rows": [
            [
              "Camping Site — per adult (nett) — Rate (N$)",
              "600"
            ],
            [
              "Camping Site — per child 3–11 (nett) — Rate (N$)",
              "300"
            ]
          ]
        },
        {
          "title": "Activities & Nature Drives",
          "rows": [
            [
              "Morning / Afternoon Etosha Game Drive (4 hrs) — Rate",
              "2,100"
            ],
            [
              "Onguma Sunrise Drive (3 hrs) — Rate",
              "1,068"
            ],
            [
              "Onguma Sundowner Drive (3 hrs) — Rate",
              "1,068"
            ],
            [
              "Interpretive Nature Walk (1½ hrs · min age 16) — Rate",
              "1,068"
            ],
            [
              "Mid-Morning Onkolo Hide (3 hrs · min age 7) — Rate",
              "780"
            ],
            [
              "Young Explorers Walk (1½ hrs) — Rate",
              "504"
            ],
            [
              "Private Game Drive (4 hrs) — Rate",
              "11,640"
            ],
            [
              "Private Game Drive — Full Day (8 hrs) — Rate",
              "18,600"
            ],
            [
              "Private Game Drive — Fully Inclusive surcharge (per activity) — Rate",
              "7,200"
            ],
            [
              "Private Game Drive — Fully Inclusive surcharge (full day) — Rate",
              "9,000"
            ]
          ]
        },
        {
          "title": "Onguma Dream Cruiser (Sleep-Out)",
          "rows": [
            [
              "Onguma Dream Cruiser (max 2 guests) — Rate",
              "11,760"
            ],
            [
              "Additional surcharge — Leadwood & Tamboti Campsite — Rate",
              "6,240"
            ]
          ]
        },
        {
          "title": "Additional Meals",
          "rows": [
            [
              "Breakfast — Rate",
              "348"
            ],
            [
              "Breakfast Pack — Rate",
              "348"
            ],
            [
              "Lunch (3 course) — Rate",
              "432"
            ],
            [
              "Lunch Pack — Rate",
              "312"
            ],
            [
              "Dinner (3 course) — Rate",
              "768"
            ],
            [
              "Dinner (4 course) — Rate",
              "972"
            ]
          ]
        }
      ]
    }
  },
  "onguma-tamboti-campsite": {
    "2026": {
      "name": "Onguma Tamboti Campsite",
      "region": "East Etosha",
      "currency": "N$",
      "validity": "2026",
      "note": "Rack derived from the supplier net rate at the house +20% ceiling — replace when the supplier publishes its own rack.",
      "sections": [
        {
          "title": "Campsite Rates — 01.11.2025 to 31.10.2026",
          "rows": [
            [
              "Camping Site — per adult (nett) — Rate (N$)",
              "600"
            ],
            [
              "Camping Site — per child 3–11 (nett) — Rate (N$)",
              "300"
            ]
          ]
        },
        {
          "title": "Activities & Nature Drives",
          "rows": [
            [
              "Morning / Afternoon Etosha Game Drive (4 hrs) — Rate",
              "2,100"
            ],
            [
              "Onguma Sunrise Drive (3 hrs) — Rate",
              "1,068"
            ],
            [
              "Onguma Sundowner Drive (3 hrs) — Rate",
              "1,068"
            ],
            [
              "Interpretive Nature Walk (1½ hrs · min age 16) — Rate",
              "1,068"
            ],
            [
              "Mid-Morning Onkolo Hide (3 hrs · min age 7) — Rate",
              "780"
            ],
            [
              "Young Explorers Walk (1½ hrs) — Rate",
              "504"
            ],
            [
              "Private Game Drive (4 hrs) — Rate",
              "11,640"
            ],
            [
              "Private Game Drive — Full Day (8 hrs) — Rate",
              "18,600"
            ],
            [
              "Private Game Drive — Fully Inclusive surcharge (per activity) — Rate",
              "7,200"
            ],
            [
              "Private Game Drive — Fully Inclusive surcharge (full day) — Rate",
              "9,000"
            ]
          ]
        },
        {
          "title": "Onguma Dream Cruiser (Sleep-Out)",
          "rows": [
            [
              "Onguma Dream Cruiser (max 2 guests) — Rate",
              "11,760"
            ],
            [
              "Additional surcharge — Leadwood & Tamboti Campsite — Rate",
              "6,240"
            ]
          ]
        },
        {
          "title": "Additional Meals",
          "rows": [
            [
              "Breakfast — Rate",
              "348"
            ],
            [
              "Breakfast Pack — Rate",
              "348"
            ],
            [
              "Lunch (3 course) — Rate",
              "432"
            ],
            [
              "Lunch Pack — Rate",
              "312"
            ],
            [
              "Dinner (3 course) — Rate",
              "768"
            ],
            [
              "Dinner (4 course) — Rate",
              "972"
            ]
          ]
        }
      ]
    }
  },
  "chobe-river-camp": {
    "2026": {
      "name": "Chobe River Camp",
      "region": "Chobe",
      "currency": "N$",
      "validity": "2026",
      "note": "Published rack rates from the supplier sheet.",
      "sections": [
        {
          "title": "2026 — rack",
          "rows": [
            [
              "Double/Twin/Family -- Sharing BB",
              "2,364"
            ],
            [
              "Single -- BB",
              "2,955"
            ],
            [
              "Chobe Campsite pppn (10% commission)",
              "383.75"
            ],
            [
              "Morning or Afternoon Boat Cruise (guided, seasonal, 3hrs)",
              "923.44"
            ],
            [
              "Sundowner Boat Cruise (guided, seasonal, 2hrs)",
              "496.88"
            ],
            [
              "Walking Trail (guided, seasonal, 1-2hrs -- direct booking only)",
              "426.56"
            ],
            [
              "Canoe Trip (guided, 1.5hrs, refreshments -- direct booking only)",
              "520.31"
            ],
            [
              "Birding Drive (guided, 3hrs, refreshments -- direct booking only)",
              "478.12"
            ]
          ]
        }
      ]
    }
  },
  "hakusembe-camping2go": {
    "2026": {
      "name": "Hakusembe Camping2Go",
      "region": "Caprivi",
      "currency": "N$",
      "validity": "2026",
      "note": "Published rack rates from the supplier sheet.",
      "sections": [
        {
          "title": "2026 — rack",
          "rows": [
            [
              "Camping2Go Tent -- Sharing pppn",
              "1,084"
            ],
            [
              "Camping2Go Tent -- Single pppn",
              "2,166"
            ],
            [
              "Dinner pp -- buffet",
              "715"
            ],
            [
              "Breakfast pp -- buffet",
              "355"
            ],
            [
              "Lunch pp",
              "285"
            ]
          ]
        }
      ]
    }
  },
  "namushasha-river-camping2go": {
    "2026": {
      "name": "Namushasha Camping2Go",
      "region": "Caprivi",
      "currency": "N$",
      "validity": "2026",
      "note": "Published rack rates from the supplier sheet.",
      "sections": [
        {
          "title": "2026 — rack",
          "rows": [
            [
              "Camping2Go Tent -- Sharing pppn",
              "1,084"
            ],
            [
              "Camping2Go Tent -- Single pppn",
              "2,166"
            ],
            [
              "Dinner pp -- buffet",
              "715"
            ],
            [
              "Breakfast pp -- buffet",
              "355"
            ],
            [
              "Lunch pp",
              "285"
            ]
          ]
        }
      ]
    }
  },
  "namushasha-camping2go": {
    "2026": {
      "name": "Namushasha Camping2go",
      "region": "Caprivi",
      "currency": "N$",
      "validity": "2026",
      "note": "Published rack rates from the supplier sheet.",
      "sections": [
        {
          "title": "2026 — rack",
          "rows": [
            [
              "Camping2Go Tent -- Sharing pppn",
              "1,084"
            ],
            [
              "Camping2Go Tent -- Single pppn",
              "2,166"
            ],
            [
              "Dinner pp -- buffet",
              "715"
            ],
            [
              "Breakfast pp -- buffet",
              "355"
            ],
            [
              "Lunch pp",
              "285"
            ]
          ]
        }
      ]
    }
  },
  "namushasha-river-villa": {
    "2026": {
      "name": "Namushasha River Villa",
      "region": "Caprivi",
      "currency": "N$",
      "validity": "2026",
      "note": "Published rack rates from the supplier sheet.",
      "sections": [
        {
          "title": "2026 — rack",
          "rows": [
            [
              "Per room/night -- Fully Inclusive (max 2 pax)",
              "30,250"
            ],
            [
              "Transfer to Katima Mpacha Airport return (120km)",
              "1,256.25"
            ],
            [
              "Transfer to Lianshulu return (25km)",
              "412.50"
            ],
            [
              "Package Transfer -- Airport and 3 Zambezi properties return",
              "1,462.50"
            ]
          ]
        }
      ]
    }
  },
  "zambezi-mubala-camp": {
    "2026": {
      "name": "Zambezi Mubala Camp",
      "region": "Caprivi",
      "currency": "N$",
      "validity": "2026",
      "note": "Published rack rates from the supplier sheet.",
      "sections": [
        {
          "title": "2026 — rack",
          "rows": [
            [
              "Self-Catering Tent -- Sharing pppn",
              "1,084"
            ],
            [
              "Self-Catering Tent -- Single pppn",
              "2,166"
            ],
            [
              "Zambezi Mubala Campsite pppn (10% commission)",
              "383.75"
            ],
            [
              "Sundowner Boat Cruise (guided, 1.5hrs, refreshments)",
              "575"
            ],
            [
              "Morning or Afternoon Boat Cruise (guided, 3hrs, refreshments)",
              "987.50"
            ],
            [
              "Nature Walk to bird colonies (guided, 3hrs, seasonal -- direct booking)",
              "381.25"
            ],
            [
              "Transfer to Katima Mpacha Airport return (50km)",
              "631.25"
            ],
            [
              "Package Transfer -- Airport and 3 Zambezi properties return",
              "1,462.50"
            ]
          ]
        }
      ]
    }
  },
  "zambezi-mubala-lodge": {
    "2026": {
      "name": "Zambezi Mubala Lodge",
      "region": "Caprivi",
      "currency": "N$",
      "validity": "2026",
      "note": "Published rack rates from the supplier sheet.",
      "sections": [
        {
          "title": "2026 — rack",
          "rows": [
            [
              "Double/Twin/Triple/Family -- Sharing BB",
              "3,309"
            ],
            [
              "Single -- BB",
              "4,138"
            ],
            [
              "Sundowner Boat Cruise (guided, 1.5hrs, refreshments)",
              "575"
            ],
            [
              "Morning or Afternoon Boat Cruise (guided, 3hrs, refreshments)",
              "987.50"
            ],
            [
              "Nature Walk to bird colonies (guided, 3hrs, seasonal)",
              "381.25"
            ],
            [
              "Transfer to Katima Mpacha Airport return (50km)",
              "631.25"
            ],
            [
              "Package Transfer -- Airport and 3 Zambezi properties return",
              "1,462.50"
            ]
          ]
        }
      ]
    }
  },
  "palmwag-camping2go": {
    "2026": {
      "name": "Palmwag Camping2Go",
      "region": "Damaraland",
      "currency": "N$",
      "validity": "2026",
      "note": "Published rack rates from the supplier sheet.",
      "sections": [
        {
          "title": "2026 — rack",
          "rows": [
            [
              "Camping2Go Tent -- Sharing pppn",
              "1,084"
            ],
            [
              "Camping2Go Tent -- Single pppn",
              "2,166"
            ],
            [
              "Dinner pp -- buffet",
              "518.75"
            ],
            [
              "Breakfast pp -- buffet",
              "355"
            ],
            [
              "Lunch pp",
              "282.50"
            ],
            [
              "Half-Day Scenic Drive (guided, 3hrs)",
              "1,270.31"
            ],
            [
              "Full-Day Damaraland Excursion (guided, min 4 pax)",
              "3,332.81"
            ],
            [
              "Half-Day Rhino Tracking (guided, min 2 pax -- not for under 12)",
              "3,726.56"
            ]
          ]
        }
      ]
    }
  },
  "kalahari-camping2go": {
    "2026": {
      "name": "Kalahari Camping2Go",
      "region": "Kalahari",
      "currency": "N$",
      "validity": "2026",
      "note": "Published rack rates from the supplier sheet.",
      "sections": [
        {
          "title": "2026 — rack",
          "rows": [
            [
              "Camping2Go Tent -- Sharing pppn",
              "1,084"
            ],
            [
              "Camping2Go Tent -- Single pppn",
              "2,166"
            ],
            [
              "Dinner pp -- buffet",
              "715"
            ],
            [
              "Breakfast pp -- buffet",
              "355"
            ],
            [
              "Lunch pp",
              "285"
            ]
          ]
        }
      ]
    }
  }
});

// --------------------------------------------------------------------------
// Gondwana Collection — 2026 season, 01.11.2025 to 31.10.2026, straight from
// the supplier's own 'RACK & 20% STO RATES 2026' sheet. Both columns are
// printed there, so nothing here is derived. Each lodge carries every year it
// already held alongside the new 2026, so adding a season never hides one.
// --------------------------------------------------------------------------
Object.assign(DDS_RACK_BY_YEAR, {
  "okapuka-safari-lodge": {
    "2026": {
      "name": "Okapuka Safari Lodge",
      "region": "Windhoek",
      "currency": "N$",
      "validity": "01 Nov 2025 – 31 Oct 2026",
      "note": "Published rack rates from the Gondwana Collection 2026 rate sheet (01.11.2025–31.10.2026).",
      "sections": [
        {
          "title": "2026 season — rack",
          "rows": [
            [
              "Standard Safari double room - sharing: bed & breakfast pp/night.",
              "1,931"
            ],
            [
              "Standard Safari room - single: bed & breakfast pp/night.",
              "2,412"
            ],
            [
              "Classic Safari double/twin - sharing: bed & breakfast pp/night.",
              "2,358"
            ],
            [
              "Classic Safari room - single: bed & breakfast pp/night.",
              "2,948"
            ],
            [
              "Luxury Safari Suite - sharing: bed & breakfast pp/night",
              "2,892"
            ],
            [
              "Luxury Safari Suite - single: bed & breakfast pp/night.",
              "3,616"
            ],
            [
              "Dinner pp - pre-booked, alternatively à la carte at the lodge",
              "572"
            ],
            [
              "Lunch pp - pre-booked, alternatively à la carte at the lodge",
              "228"
            ],
            [
              "Full 3-course lunch pp - pre-booked, alternatively à la carte at the lodge",
              "341"
            ],
            [
              "Lunch pack pp",
              "226"
            ],
            [
              "Tour guide room: dinner, bed, and breakfast pp/night",
              "721"
            ]
          ]
        }
      ]
    },
    "2027": {
      "name": "Okapuka Safari Lodge",
      "region": "Windhoek",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
      "sections": [
        {
          "title": "2027 — rack",
          "rows": [
            [
              "Standard Safari Room B&B — per person sharing",
              "2,039.04"
            ],
            [
              "Standard Safari Room B&B — single",
              "2,548.80"
            ],
            [
              "Classic Safari Room B&B — per person sharing",
              "2,490.24"
            ],
            [
              "Classic Safari Room B&B — single",
              "3,112.80"
            ],
            [
              "Luxury Safari Suite B&B — per person sharing",
              "3,053.76"
            ],
            [
              "Luxury Safari Suite B&B — single",
              "3,817.20"
            ],
            [
              "Tour Guide Room (DBB)",
              "2,039.04"
            ]
          ]
        }
      ]
    }
  },
  "the-weinberg-windhoek": {
    "2026": {
      "name": "The Weinberg Windhoek",
      "region": "Windhoek",
      "currency": "N$",
      "validity": "01 Nov 2025 – 31 Oct 2026",
      "note": "Published rack rates from the Gondwana Collection 2026 rate sheet (01.11.2025–31.10.2026).",
      "sections": [
        {
          "title": "2026 season — rack",
          "rows": [
            [
              "Courtyard double/twin room - sharing: bed & breakfast pp/night.",
              "2,827"
            ],
            [
              "Courtyard room - single: bed & breakfast pp/night.",
              "3,961"
            ],
            [
              "Superior upper-level double/twin room - sharing: bed & breakfast pp/night.",
              "3,103"
            ],
            [
              "Superior upper-level room - single: bed & breakfast pp/night.",
              "4,340"
            ],
            [
              "Loft double/twin/family - sharing: bed & breakfast pp/night.",
              "3,952"
            ],
            [
              "Loft - single: bed & breakfast pp/night.",
              "5,515"
            ],
            [
              "Terrace Suite per room/night: bed & breakfast including minibar — max 2 pax/room",
              "16,500"
            ],
            [
              "Terrace Suite Supplement for additional room/night: bed & breakfast including minibar — max 2 pax/room",
              "5,500"
            ],
            [
              "Tour guide room - single: bed & breakfast pp/night.",
              "2,261.60"
            ]
          ]
        }
      ]
    },
    "2027": {
      "name": "The Weinberg",
      "region": "Windhoek",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
      "sections": [
        {
          "title": "2027 — rack",
          "rows": [
            [
              "Courtyard Room B&B — per person sharing",
              "2,985.60"
            ],
            [
              "Courtyard Room B&B — single",
              "4,179.84"
            ],
            [
              "Superior Upper-Level B&B — per person sharing",
              "3,276.48"
            ],
            [
              "Superior Upper-Level B&B — single",
              "4,587.07"
            ],
            [
              "Loft Room B&B — per person sharing",
              "4,173.12"
            ],
            [
              "Loft Room B&B — single",
              "5,842.37"
            ],
            [
              "Terrace Suite B&B (per room, max 2)",
              "15,840"
            ],
            [
              "Terrace Suite supplement",
              "5,280"
            ],
            [
              "Tour Guide Single (B&B)",
              "2,985.60"
            ]
          ]
        }
      ]
    }
  },
  "weinberg-urban-pod": {
    "2026": {
      "name": "Weinberg Urban Pod",
      "region": "Windhoek",
      "currency": "N$",
      "validity": "01 Nov 2025 – 31 Oct 2026",
      "note": "Published rack rates from the Gondwana Collection 2026 rate sheet (01.11.2025–31.10.2026).",
      "sections": [
        {
          "title": "2026 season — rack",
          "rows": [
            [
              "Per room/night, inclusive of food and beverage, max 2 pax/room",
              "30,250"
            ]
          ]
        }
      ]
    },
    "2027": {
      "name": "Weinberg Urban Pod",
      "region": "Windhoek",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
      "sections": [
        {
          "title": "2027 — rack",
          "rows": [
            [
              "Urban Pod — F&B inclusive (per room, max 2)",
              "31,680"
            ],
            [
              "Additional room supplement (2 rooms)",
              "19,008"
            ],
            [
              "Additional room supplement (3 rooms)",
              "12,672"
            ]
          ]
        }
      ]
    }
  },
  "kalahari-anib-lodge": {
    "2026": {
      "name": "Kalahari Anib Lodge",
      "region": "Kalahari",
      "currency": "N$",
      "validity": "01 Nov 2025 – 31 Oct 2026",
      "note": "Published rack rates from the Gondwana Collection 2026 rate sheet (01.11.2025–31.10.2026).",
      "sections": [
        {
          "title": "2026 season — rack",
          "rows": [
            [
              "Standard room double/twin/triple/family - sharing: bed & breakfast pp/night.",
              "2,572"
            ],
            [
              "Standard room - single: bed & breakfast pp/night.",
              "3,214"
            ],
            [
              "Comfort room double/twin/triple/family - sharing: bed & breakfast pp/night.",
              "3,207"
            ],
            [
              "Comfort room - single: bed & breakfast pp/night.",
              "4,010"
            ],
            [
              "Dinner pp - buffet",
              "572"
            ],
            [
              "Dune Dinner pp - min 10 pax, max 60 pax only",
              "1,386"
            ],
            [
              "Lunch pp - alternatively à la carte at the lodge",
              "228"
            ],
            [
              "Full 3 Course Lunch pp - alternatively à la carte at the lodge",
              "341"
            ],
            [
              "Lunch pack pp",
              "226"
            ],
            [
              "Kalahari Anib Campsite pp/night – 10% commission",
              "341"
            ],
            [
              "Tour guide room: dinner, bed, and breakfast pp/night",
              "721"
            ]
          ]
        }
      ]
    },
    "2027": {
      "name": "Kalahari Anib Lodge",
      "region": "Kalahari",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
      "sections": [
        {
          "title": "2027 — rack",
          "rows": [
            [
              "Standard Room B&B — per person sharing",
              "2,715.84"
            ],
            [
              "Standard Room B&B — single",
              "3,394.80"
            ],
            [
              "Comfort Room B&B — per person sharing",
              "3,386.88"
            ],
            [
              "Comfort Room B&B — single",
              "4,233.60"
            ],
            [
              "Camping2Go (bed only) — per person sharing",
              "1,104"
            ],
            [
              "Camping2Go (bed only) — single",
              "2,208"
            ],
            [
              "Campsite — per person per night",
              "388.80"
            ],
            [
              "Tour Guide Room (DBB)",
              "951.60"
            ]
          ]
        }
      ]
    }
  },
  "kalahari-camping2go": {
    "2026": {
      "name": "Kalahari Camping2Go",
      "region": "Kalahari",
      "currency": "N$",
      "validity": "01 Nov 2025 – 31 Oct 2026",
      "note": "Published rack rates from the Gondwana Collection 2026 rate sheet (01.11.2025–31.10.2026).",
      "sections": [
        {
          "title": "2026 season — rack",
          "rows": [
            [
              "Camping2Go - Self-catering tents with en-suite bathrooms - sharing: bed only, pp/night.",
              "1,084"
            ],
            [
              "Camping2Go - Self-catering tents with en-suite bathrooms - single: bed only, pp/night.",
              "2,166"
            ],
            [
              "Dinner pp - buffet at Kalahari Anib Lodge",
              "572"
            ],
            [
              "Breakfast pp - buffet at Kalahari Anib Lodge",
              "284"
            ],
            [
              "Lunch pp - alternatively à la carte at the lodge",
              "228"
            ],
            [
              "Tour guide tent: dinner, bed, and breakfast pp/night – meals at the lodge",
              "721"
            ]
          ]
        }
      ]
    }
  },
  "reverie-kalahari-pod": {
    "2026": {
      "name": "Reverie Kalahari Pod",
      "region": "Sossusvlei",
      "currency": "N$",
      "validity": "01 Nov 2025 – 31 Oct 2026",
      "note": "Published rack rates from the Gondwana Collection 2026 rate sheet (01.11.2025–31.10.2026).",
      "sections": [
        {
          "title": "2026 season — rack",
          "rows": [
            [
              "Per room/night, fully inclusive, max 2 pax/room",
              "30,250"
            ]
          ]
        }
      ]
    },
    "2027": {
      "name": "Reverie Kalahari Pod",
      "region": "Sossusvlei",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
      "sections": [
        {
          "title": "2027 — rack",
          "rows": [
            [
              "Fully inclusive (per room, max 2)",
              "31,680"
            ]
          ]
        }
      ]
    }
  },
  "kalahari-farmhouse": {
    "2026": {
      "name": "Kalahari Farmhouse",
      "region": "Kalahari",
      "currency": "N$",
      "validity": "01 Nov 2025 – 31 Oct 2026",
      "note": "Published rack rates from the Gondwana Collection 2026 rate sheet (01.11.2025–31.10.2026).",
      "sections": [
        {
          "title": "2026 season — rack",
          "rows": [
            [
              "Double/twin/triple/family room - sharing: bed & breakfast pp/night.",
              "2,125"
            ],
            [
              "Single room - bed & breakfast pp/night.",
              "2,655"
            ],
            [
              "Dinner pp - alternatively à la carte at the lodge",
              "415"
            ],
            [
              "Lunch pp - alternatively à la carte at the lodge",
              "228"
            ],
            [
              "Full 3 Course Lunch pp - alternatively à la carte at the lodge",
              "341"
            ],
            [
              "Lunch pack pp",
              "226"
            ],
            [
              "Kalahari Farmhouse Campsite pp/night– 10% commission",
              "341"
            ],
            [
              "Tour guide room: dinner, bed, and breakfast pp/night",
              "721"
            ]
          ]
        }
      ]
    },
    "2027": {
      "name": "Kalahari Farmhouse",
      "region": "Kalahari",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
      "sections": [
        {
          "title": "2027 — rack",
          "rows": [
            [
              "Room B&B — per person sharing",
              "2,040"
            ],
            [
              "Room B&B — single",
              "2,550"
            ],
            [
              "Campsite — per person per night",
              "388.80"
            ],
            [
              "Tour Guide Room (DBB)",
              "951.60"
            ]
          ]
        }
      ]
    }
  },
  "canyon-lodge": {
    "2026": {
      "name": "Canyon Lodge",
      "region": "Fish River Canyon",
      "currency": "N$",
      "validity": "01 Nov 2025 – 31 Oct 2026",
      "note": "Published rack rates from the Gondwana Collection 2026 rate sheet (01.11.2025–31.10.2026).",
      "sections": [
        {
          "title": "2026 season — rack",
          "rows": [
            [
              "Double/twin/triple/family room - sharing: bed & breakfast pp/night.",
              "2,976"
            ],
            [
              "Single room: bed & breakfast pp/night.",
              "3,719"
            ],
            [
              "Dinner pp",
              "572"
            ],
            [
              "Lunch pp - alternatively à la carte at the lodge",
              "228"
            ],
            [
              "Full 3 Course Lunch pp - alternatively à la carte at the lodge",
              "341"
            ],
            [
              "Lunch pack pp",
              "226"
            ],
            [
              "Tour guide room: dinner, bed, and breakfast pp/night",
              "721"
            ]
          ]
        }
      ]
    },
    "2027": {
      "name": "Canyon Lodge",
      "region": "Fish River Canyon",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
      "sections": [
        {
          "title": "2027 — rack",
          "rows": [
            [
              "Room B&B — per person sharing",
              "3,143.04"
            ],
            [
              "Room B&B — single",
              "3,928.80"
            ],
            [
              "Tour Guide Room (DBB)",
              "951.60"
            ]
          ]
        }
      ]
    }
  },
  "canyon-village": {
    "2026": {
      "name": "Canyon Village",
      "region": "Fish River Canyon",
      "currency": "N$",
      "validity": "01 Nov 2025 – 31 Oct 2026",
      "note": "Published rack rates from the Gondwana Collection 2026 rate sheet (01.11.2025–31.10.2026).",
      "sections": [
        {
          "title": "2026 season — rack",
          "rows": [
            [
              "Double/twin/triple/family room - sharing: bed & breakfast pp/night.",
              "1,995"
            ],
            [
              "Single room: bed & breakfast pp/night.",
              "2,495"
            ],
            [
              "Dinner pp",
              "415"
            ],
            [
              "Lunch pp - alternatively à la carte at the lodge",
              "228"
            ],
            [
              "Full 3 Course Lunch pp - alternatively à la carte at the lodge",
              "341"
            ],
            [
              "Lunch pack pp",
              "226"
            ],
            [
              "Tour guide room: dinner, bed, and breakfast pp/night",
              "721"
            ]
          ]
        }
      ]
    },
    "2027": {
      "name": "Canyon Village",
      "region": "Fish River Canyon",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
      "sections": [
        {
          "title": "2027 — rack",
          "rows": [
            [
              "Room B&B — per person sharing",
              "1,915.20"
            ],
            [
              "Room B&B — single",
              "2,394"
            ],
            [
              "Tour Guide Room (DBB)",
              "951.60"
            ]
          ]
        }
      ]
    }
  },
  "canyon-roadhouse": {
    "2026": {
      "name": "Canyon Roadhouse",
      "region": "Fish River Canyon",
      "currency": "N$",
      "validity": "01 Nov 2025 – 31 Oct 2026",
      "note": "Published rack rates from the Gondwana Collection 2026 rate sheet (01.11.2025–31.10.2026).",
      "sections": [
        {
          "title": "2026 season — rack",
          "rows": [
            [
              "Double/twin/triple/family room - sharing: bed & breakfast pp/night.",
              "2,512"
            ],
            [
              "Single room - bed & breakfast pp/night.",
              "3,143"
            ],
            [
              "Dinner pp - alternatively à la carte at the lodge",
              "572"
            ],
            [
              "Lunch pp - alternatively à la carte at the lodge",
              "228"
            ],
            [
              "Full 3 Course Lunch pp - alternatively à la carte at the lodge",
              "341"
            ],
            [
              "Lunch pack pp",
              "226"
            ],
            [
              "Canyon Road Campsite pp/night – 10% commission",
              "341"
            ],
            [
              "Tour guide room: dinner, bed, and breakfast pp/night",
              "721"
            ]
          ]
        }
      ]
    },
    "2027": {
      "name": "Canyon Roadhouse",
      "region": "Fish River Canyon",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
      "sections": [
        {
          "title": "2027 — rack",
          "rows": [
            [
              "Room B&B — per person sharing",
              "2,544"
            ],
            [
              "Room B&B — single",
              "3,180"
            ],
            [
              "Campsite — per person per night",
              "388.80"
            ],
            [
              "Tour Guide Room (DBB)",
              "951.60"
            ]
          ]
        }
      ]
    }
  },
  "namib-desert-lodge": {
    "2026": {
      "name": "Namib Desert Lodge",
      "region": "Sossusvlei",
      "currency": "N$",
      "validity": "01 Nov 2025 – 31 Oct 2026",
      "note": "Published rack rates from the Gondwana Collection 2026 rate sheet (01.11.2025–31.10.2026).",
      "sections": [
        {
          "title": "2026 season — rack",
          "rows": [
            [
              "Double/twin/triple/family room - sharing: bed & breakfast pp/night.",
              "2,398"
            ],
            [
              "Single room - bed & breakfast pp/night.",
              "3,000"
            ],
            [
              "Dinner pp - buffet",
              "415"
            ],
            [
              "Dune Dinner pp - min 10 Pax",
              "1,386"
            ],
            [
              "Lunch pp - alternatively à la carte at the lodge",
              "228"
            ],
            [
              "Full 3 Course Lunch pp - alternatively à la carte at the lodge",
              "341"
            ],
            [
              "Lunch pack pp",
              "226"
            ],
            [
              "Namib Desert Campsite pp/night– 10% commission",
              "341"
            ],
            [
              "Tour guide room: dinner, bed, and breakfast pp/night",
              "721"
            ]
          ]
        }
      ]
    },
    "2027": {
      "name": "Namib Desert Lodge",
      "region": "Sossusvlei",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
      "sections": [
        {
          "title": "2027 — rack",
          "rows": [
            [
              "Room B&B — per person sharing",
              "2,440.32"
            ],
            [
              "Room B&B — single",
              "3,050.40"
            ],
            [
              "Camping2Go (bed only) — per person sharing",
              "1,104"
            ],
            [
              "Camping2Go (bed only) — single",
              "2,208"
            ],
            [
              "Campsite — per person per night",
              "388.80"
            ],
            [
              "Tour Guide Room (DBB)",
              "951.60"
            ]
          ]
        }
      ]
    }
  },
  "namib-dune-star-camp": {
    "2026": {
      "name": "Namib Dune Star Camp",
      "region": "Sossusvlei",
      "currency": "N$",
      "validity": "01 Nov 2025 – 31 Oct 2026",
      "note": "Published rack rates from the Gondwana Collection 2026 rate sheet (01.11.2025–31.10.2026).",
      "sections": [
        {
          "title": "2026 season — rack",
          "rows": [
            [
              "Double/triple room - sharing: bed & breakfast pp/night.",
              "3,405"
            ],
            [
              "Single room - bed & breakfast pp/night.",
              "4,259"
            ],
            [
              "Dinner pp",
              "572"
            ],
            [
              "Tour guide room: dinner, bed, and breakfast pp/night",
              "721"
            ]
          ]
        }
      ]
    },
    "2027": {
      "name": "Namib Dune Star Camp",
      "region": "Sossusvlei",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
      "sections": [
        {
          "title": "2027 — rack",
          "rows": [
            [
              "Room B&B — per person sharing (one-night stay)",
              "3,546.24"
            ],
            [
              "Room B&B — single (one-night stay)",
              "4,432.80"
            ],
            [
              "Tour Guide Room (DBB)",
              "951.60"
            ]
          ]
        }
      ]
    }
  },
  "the-desert-grace": {
    "2026": {
      "name": "The Desert Grace",
      "region": "Sossusvlei",
      "currency": "N$",
      "validity": "01 Nov 2025 – 31 Oct 2026",
      "note": "Published rack rates from the Gondwana Collection 2026 rate sheet (01.11.2025–31.10.2026).",
      "sections": [
        {
          "title": "2026 season — rack",
          "rows": [
            [
              "Double/twin/triple/family room – sharing: bed & breakfast pp/night.",
              "5,391"
            ],
            [
              "Single room – bed & breakfast pp/night.",
              "6,739"
            ],
            [
              "Dinner pp",
              "572"
            ],
            [
              "Dune Dinner pp – min 10 Pax",
              "1,386"
            ],
            [
              "Lunch pp – alternatively à la carte at the lodge",
              "228"
            ],
            [
              "Full 3 Course Lunch pp – alternatively à la carte at the lodge",
              "341"
            ],
            [
              "Lunch pack pp",
              "226"
            ],
            [
              "Tour guide room: dinner, bed, and breakfast pp/night",
              "721"
            ]
          ]
        }
      ]
    },
    "2027": {
      "name": "The Desert Grace",
      "region": "Sossusvlei",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
      "sections": [
        {
          "title": "2027 — rack",
          "rows": [
            [
              "Room B&B — per person sharing",
              "5,692.80"
            ],
            [
              "Room B&B — single",
              "7,116"
            ],
            [
              "Tour Guide Room (DBB)",
              "951.60"
            ]
          ]
        }
      ]
    }
  },
  "desert-whisper": {
    "2026": {
      "name": "Desert Whisper",
      "region": "Sossusvlei",
      "currency": "N$",
      "validity": "01 Nov 2025 – 31 Oct 2026",
      "note": "Published rack rates from the Gondwana Collection 2026 rate sheet (01.11.2025–31.10.2026).",
      "sections": [
        {
          "title": "2026 season — rack",
          "rows": [
            [
              "Per room/night, fully inclusive, max 2 pax/room",
              "30,250"
            ]
          ]
        }
      ]
    },
    "2027": {
      "name": "Desert Whisper",
      "region": "Sossusvlei",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
      "sections": [
        {
          "title": "2027 — rack",
          "rows": [
            [
              "Fully inclusive (per room, max 2)",
              "31,680"
            ]
          ]
        }
      ]
    }
  },
  "the-delight-swakopmund": {
    "2026": {
      "name": "The Delight Swakopmund",
      "region": "Swakopmund",
      "currency": "N$",
      "validity": "01 Nov 2025 – 31 Oct 2026",
      "note": "Published rack rates from the Gondwana Collection 2026 rate sheet (01.11.2025–31.10.2026).",
      "sections": [
        {
          "title": "2026 season — rack",
          "rows": [
            [
              "Double/twin//family room – sharing: bed & breakfast pp/night.",
              "1,987"
            ],
            [
              "Single room: bed & breakfast pp/night.",
              "2,483"
            ],
            [
              "Tour guide room: bed & breakfast pp/night.",
              "1,589.60"
            ],
            [
              "Lunch pack pp",
              "226"
            ]
          ]
        }
      ]
    },
    "2027": {
      "name": "The Delight Swakopmund",
      "region": "Swakopmund",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
      "sections": [
        {
          "title": "2027 — rack",
          "rows": [
            [
              "Room B&B — per person sharing",
              "2,021.76"
            ],
            [
              "Room B&B — single",
              "2,527.20"
            ],
            [
              "Tour Guide Room (B&B)",
              "2,021.76"
            ]
          ]
        }
      ]
    }
  },
  "the-pearls-beach-pods": {
    "2026": {
      "name": "The Pearls Beach Pods",
      "region": "Sossusvlei",
      "currency": "N$",
      "validity": "01 Nov 2025 – 31 Oct 2026",
      "note": "Published rack rates from the Gondwana Collection 2026 rate sheet (01.11.2025–31.10.2026).",
      "sections": [
        {
          "title": "2026 season — rack",
          "rows": [
            [
              "Per room/night, inclusive of food and beverage, max 2 pax/room",
              "30,250"
            ],
            [
              "Per room/night, inclusive of food and beverage, max 2 pax/room",
              "30,250"
            ]
          ]
        }
      ]
    },
    "2027": {
      "name": "The Pearls Beach Pods",
      "region": "Sossusvlei",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
      "sections": [
        {
          "title": "2027 — rack",
          "rows": [
            [
              "The Jetty — F&B inclusive (per room, max 2)",
              "29,040"
            ],
            [
              "The Jetty — additional room (2 rooms)",
              "17,424"
            ],
            [
              "The Jetty — additional room (3 rooms)",
              "11,616"
            ],
            [
              "The Mole — F&B inclusive (per room, max 2)",
              "29,040"
            ],
            [
              "The Mole — additional room (2 rooms)",
              "17,424"
            ]
          ]
        }
      ]
    }
  },
  "damara-mopane-lodge": {
    "2026": {
      "name": "Damara Mopane Lodge",
      "region": "Damaraland",
      "currency": "N$",
      "validity": "01 Nov 2025 – 31 Oct 2026",
      "note": "Published rack rates from the Gondwana Collection 2026 rate sheet (01.11.2025–31.10.2026).",
      "sections": [
        {
          "title": "2026 season — rack",
          "rows": [
            [
              "Double/twin room - sharing: bed & breakfast pp/night.",
              "2,284"
            ],
            [
              "Single room: bed & breakfast pp/night",
              "2,857"
            ],
            [
              "Dinner (buffet) pp",
              "415"
            ],
            [
              "Lunch pp - pre-booked, alternatively à la carte at the lodge",
              "228"
            ],
            [
              "Full 3 Course Lunch pp - alternatively à la carte at the lodge",
              "341"
            ],
            [
              "Lunch pack pp",
              "226"
            ],
            [
              "Tour guide room: dinner, bed, and breakfast pp/night",
              "721"
            ]
          ]
        }
      ]
    },
    "2027": {
      "name": "Damara Mopane Lodge",
      "region": "Damaraland",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
      "sections": [
        {
          "title": "2027 — rack",
          "rows": [
            [
              "Room B&B — per person sharing",
              "2,302.08"
            ],
            [
              "Room B&B — single",
              "2,877.60"
            ],
            [
              "Tour Guide Room (DBB)",
              "951.60"
            ]
          ]
        }
      ]
    }
  },
  "palmwag-lodge": {
    "2026": {
      "name": "Palmwag Lodge",
      "region": "Damaraland",
      "currency": "N$",
      "validity": "01 Nov 2025 – 31 Oct 2026",
      "note": "Published rack rates from the Gondwana Collection 2026 rate sheet (01.11.2025–31.10.2026).",
      "sections": [
        {
          "title": "2026 season — rack",
          "rows": [
            [
              "Standard room double/twin - sharing: bed & breakfast pp/night.",
              "2,807"
            ],
            [
              "Standard room - single: bed & breakfast pp/night.",
              "3,508"
            ],
            [
              "Comfort room double/twin/triple/family - sharing: bed & breakfast pp/night.",
              "3,449"
            ],
            [
              "Comfort room - single: bed & breakfast pp/night",
              "4,309"
            ],
            [
              "Dinner pp",
              "415"
            ],
            [
              "Lunch pp",
              "228"
            ],
            [
              "Full 3 Course Lunch pp",
              "341"
            ],
            [
              "Lunch pack pp",
              "226"
            ],
            [
              "Palmwag Campsite pp/night– 10% commission",
              "341"
            ],
            [
              "Tour guide room: dinner, bed, and breakfast pp/night",
              "721"
            ]
          ]
        }
      ]
    },
    "2027": {
      "name": "Palmwag Lodge",
      "region": "Damaraland",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
      "sections": [
        {
          "title": "2027 — rack",
          "rows": [
            [
              "Standard Room B&B — per person sharing",
              "2,880"
            ],
            [
              "Standard Room B&B — single",
              "3,600"
            ],
            [
              "Comfort Room B&B — per person sharing",
              "3,538.56"
            ],
            [
              "Comfort Room B&B — single",
              "4,423.20"
            ],
            [
              "Camping2Go (bed only) — per person sharing",
              "1,104"
            ],
            [
              "Camping2Go (bed only) — single",
              "2,208"
            ],
            [
              "Campsite — per person per night",
              "388.80"
            ],
            [
              "Tour Guide Room (DBB)",
              "951.60"
            ]
          ]
        }
      ]
    }
  },
  "palmwag-camping2go": {
    "2026": {
      "name": "Palmwag Camping2Go",
      "region": "Damaraland",
      "currency": "N$",
      "validity": "01 Nov 2025 – 31 Oct 2026",
      "note": "Published rack rates from the Gondwana Collection 2026 rate sheet (01.11.2025–31.10.2026).",
      "sections": [
        {
          "title": "2026 season — rack",
          "rows": [
            [
              "Camping2Go - Self-catering tents with en-suite bathrooms - sharing: bed only, pp/night.",
              "1,084"
            ],
            [
              "Camping2Go - Self-catering tents with en-suite bathrooms - single: bed only, pp/night.",
              "2,166"
            ],
            [
              "Dinner pp - buffet at Palmwag Lodge",
              "415"
            ],
            [
              "Breakfast pp - buffet at Palmwag Lodge",
              "284"
            ],
            [
              "Lunch pp - alternatively à la carte at Palmwag Lodge",
              "226"
            ],
            [
              "Tour guide tent: dinner, bed, and breakfast pp/night",
              "721"
            ]
          ]
        }
      ]
    }
  },
  "palmwag-under-canvas-sleep-out": {
    "2026": {
      "name": "Palmwag Under-Canvas Sleep-Out",
      "region": "Damaraland",
      "currency": "N$",
      "validity": "01 Nov 2025 – 31 Oct 2026",
      "note": "Published rack rates from the Gondwana Collection 2026 rate sheet (01.11.2025–31.10.2026).",
      "sections": [
        {
          "title": "2026 season — rack",
          "rows": [
            [
              "Sharing/Single tent pp - meals, beverages, and activities as per itinerary below.",
              "4,995"
            ]
          ]
        }
      ]
    }
  },
  "omarunga-epupa-falls-camp": {
    "2026": {
      "name": "Omarunga Epupa Falls Camp",
      "region": "Epupa",
      "currency": "N$",
      "validity": "01 Nov 2025 – 31 Oct 2026",
      "note": "Published rack rates from the Gondwana Collection 2026 rate sheet (01.11.2025–31.10.2026).",
      "sections": [
        {
          "title": "2026 season — rack",
          "rows": [
            [
              "Double/twin/triple/family room - sharing: bed & breakfast pp/night.",
              "2,525"
            ],
            [
              "Single room: bed & breakfast pp/night",
              "3,155"
            ],
            [
              "Dinner pp",
              "415"
            ],
            [
              "Lunch pp",
              "228"
            ],
            [
              "Full 3 Course Lunch pp",
              "341"
            ],
            [
              "Lunch pack pp",
              "226"
            ],
            [
              "Omarunga Epupa Falls Campsite pp/night - 10% commission",
              "341"
            ],
            [
              "Tour guide room: dinner, bed, and breakfast pp/night",
              "721"
            ]
          ]
        }
      ]
    },
    "2027": {
      "name": "Omarunga Epupa-Falls Camp",
      "region": "Epupa",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
      "sections": [
        {
          "title": "2027 — rack",
          "rows": [
            [
              "Room B&B — per person sharing",
              "2,544"
            ],
            [
              "Room B&B — single",
              "3,180"
            ],
            [
              "Campsite — per person per night",
              "388.80"
            ],
            [
              "Tour Guide Room (DBB)",
              "951.60"
            ]
          ]
        }
      ]
    }
  },
  "etosha-safari-lodge": {
    "2026": {
      "name": "Etosha Safari Lodge",
      "region": "South Etosha",
      "currency": "N$",
      "validity": "01 Nov 2025 – 31 Oct 2026",
      "note": "Published rack rates from the Gondwana Collection 2026 rate sheet (01.11.2025–31.10.2026).",
      "sections": [
        {
          "title": "2026 season — rack",
          "rows": [
            [
              "Double/twin/triple/family room - sharing: bed & breakfast pp/night.",
              "3,383"
            ],
            [
              "Single room: bed & breakfast pp/night",
              "4,230"
            ],
            [
              "Dinner (buffet) pp",
              "572"
            ],
            [
              "Lunch pp - alternatively à la carte at the lodge",
              "228"
            ],
            [
              "Full 3 Course Lunch pp - alternatively à la carte at the lodge",
              "341"
            ],
            [
              "Lunch pack pp",
              "226"
            ],
            [
              "Tour guide room: dinner, bed, and breakfast pp/night",
              "721"
            ]
          ]
        }
      ]
    },
    "2027": {
      "name": "Etosha Safari Lodge",
      "region": "South Etosha",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
      "sections": [
        {
          "title": "2027 — rack",
          "rows": [
            [
              "Room B&B — per person sharing",
              "3,572.16"
            ],
            [
              "Room B&B — single",
              "4,465.20"
            ],
            [
              "Tour Guide Room (DBB)",
              "951.60"
            ]
          ]
        }
      ]
    }
  },
  "the-ekipa-etosha-pod": {
    "2026": {
      "name": "The Ekipa Etosha Pod",
      "region": "South Etosha",
      "currency": "N$",
      "validity": "01 Nov 2025 – 31 Oct 2026",
      "note": "Published rack rates from the Gondwana Collection 2026 rate sheet (01.11.2025–31.10.2026).",
      "sections": [
        {
          "title": "2026 season — rack",
          "rows": [
            [
              "Per room/night, inclusive of food and beverage, max 2 pax/room",
              "30,250"
            ]
          ]
        }
      ]
    },
    "2027": {
      "name": "The Ekipa Etosha Pod",
      "region": "South Etosha",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
      "sections": [
        {
          "title": "2027 — rack",
          "rows": [
            [
              "Fully inclusive (per room, max 2)",
              "31,680"
            ]
          ]
        }
      ]
    }
  },
  "etosha-safari-camping2go": {
    "2026": {
      "name": "Etosha Safari Camping2Go",
      "region": "South Etosha",
      "currency": "N$",
      "validity": "01 Nov 2025 – 31 Oct 2026",
      "note": "Published rack rates from the Gondwana Collection 2026 rate sheet (01.11.2025–31.10.2026).",
      "sections": [
        {
          "title": "2026 season — rack",
          "rows": [
            [
              "Camping2Go - Self-catering tents with en-suite bathrooms - sharing: bed only, pp/night.",
              "1,084"
            ],
            [
              "Camping2Go - Self-catering tents with en-suite bathrooms - single: bed only, pp/night.",
              "2,166"
            ],
            [
              "Dinner pp - buffet at Etosha Safari Camp",
              "415"
            ],
            [
              "Breakfast pp - buffet at Etosha Safari Camp",
              "284"
            ],
            [
              "Lunch pp - alternatively à la carte at Etosha Safari Camp",
              "228"
            ],
            [
              "Tour guide tent: dinner, bed, and breakfast pp/night – meals at Etosha Safari Camp",
              "721"
            ]
          ]
        }
      ]
    },
    "2027": {
      "name": "Etosha Safari Camping2Go",
      "region": "South Etosha",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
      "sections": [
        {
          "title": "2027 — rack",
          "rows": [
            [
              "Camping2Go (bed only) — per person sharing",
              "1,104"
            ],
            [
              "Camping2Go (bed only) — single",
              "2,208"
            ]
          ]
        }
      ]
    }
  },
  "etosha-king-nehale": {
    "2026": {
      "name": "Etosha King Nehale",
      "region": "East Etosha",
      "currency": "N$",
      "validity": "01 Nov 2025 – 31 Oct 2026",
      "note": "Published rack rates from the Gondwana Collection 2026 rate sheet (01.11.2025–31.10.2026).",
      "sections": [
        {
          "title": "2026 season — rack",
          "rows": [
            [
              "Double/twin/triple/family room - sharing: bed & breakfast pp/night.",
              "3,625"
            ],
            [
              "Single room: bed & breakfast pp/night",
              "4,528"
            ],
            [
              "Dinner pp",
              "572"
            ],
            [
              "Lunch pp- alternatively à la carte at the lodge",
              "228"
            ],
            [
              "Full 3 Course Lunch pp - alternatively à la carte at the lodge",
              "341"
            ],
            [
              "Lunch pack pp",
              "226"
            ],
            [
              "Tour guide room: dinner, bed, and breakfast pp/night",
              "721"
            ]
          ]
        }
      ]
    },
    "2027": {
      "name": "Etosha King Nehale",
      "region": "East Etosha",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
      "sections": [
        {
          "title": "2027 — rack",
          "rows": [
            [
              "Room B&B — per person sharing",
              "3,163.20"
            ],
            [
              "Room B&B — single",
              "3,954"
            ],
            [
              "Tour Guide Room (DBB)",
              "951.60"
            ]
          ]
        }
      ]
    }
  },
  "hakusembe-river-lodge": {
    "2026": {
      "name": "Hakusembe River Lodge",
      "region": "Caprivi",
      "currency": "N$",
      "validity": "01 Nov 2025 – 31 Oct 2026",
      "note": "Published rack rates from the Gondwana Collection 2026 rate sheet (01.11.2025–31.10.2026).",
      "sections": [
        {
          "title": "2026 season — rack",
          "rows": [
            [
              "Double/twin/triple/family room - sharing: bed & breakfast pp/night.",
              "3,309"
            ],
            [
              "Single room: bed & breakfast pp/night",
              "4,137"
            ],
            [
              "Dinner pp",
              "572"
            ],
            [
              "Lunch - alternatively à la carte at the lodge",
              "228"
            ],
            [
              "Full 3 Course Lunch pp - alternatively à la carte at the lodge",
              "341"
            ],
            [
              "Lunch pack pp",
              "226"
            ],
            [
              "Hakusembe River Campsite pp/night – 10% commission",
              "341"
            ],
            [
              "Tour guide room: dinner, bed, and breakfast pp/night",
              "721"
            ]
          ]
        }
      ]
    },
    "2027": {
      "name": "Hakusembe River Lodge",
      "region": "Caprivi",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
      "sections": [
        {
          "title": "2027 — rack",
          "rows": [
            [
              "Room B&B — per person sharing",
              "3,494.40"
            ],
            [
              "Room B&B — single",
              "4,368"
            ],
            [
              "Camping2Go (bed only) — per person sharing",
              "1,104"
            ],
            [
              "Camping2Go (bed only) — single",
              "2,208"
            ],
            [
              "Campsite — per person per night",
              "388.80"
            ],
            [
              "Tour Guide Room (DBB)",
              "951.60"
            ]
          ]
        }
      ]
    }
  },
  "hakusembe-camping2go": {
    "2026": {
      "name": "Hakusembe Camping2Go",
      "region": "Caprivi",
      "currency": "N$",
      "validity": "01 Nov 2025 – 31 Oct 2026",
      "note": "Published rack rates from the Gondwana Collection 2026 rate sheet (01.11.2025–31.10.2026).",
      "sections": [
        {
          "title": "2026 season — rack",
          "rows": [
            [
              "Camping2Go - Self-catering tents with en-suite bathrooms - sharing: bed only, pp/night.",
              "1,084"
            ],
            [
              "Camping2Go - Self-catering tents with en-suite bathrooms - single: bed only, pp/night.",
              "2,166"
            ],
            [
              "Dinner pp - buffet at Hakusembe River Lodge",
              "572"
            ],
            [
              "Breakfast pp - buffet at Hakusembe River Lodge",
              "284"
            ],
            [
              "Lunch pp - alternatively à la carte at Hakusembe River Lodge",
              "228"
            ],
            [
              "Tour guide tent: dinner, bed, and breakfast pp/night",
              "721"
            ]
          ]
        }
      ]
    }
  },
  "namushasha-river-lodge": {
    "2026": {
      "name": "Namushasha River Lodge",
      "region": "Caprivi",
      "currency": "N$",
      "validity": "01 Nov 2025 – 31 Oct 2026",
      "note": "Published rack rates from the Gondwana Collection 2026 rate sheet (01.11.2025–31.10.2026).",
      "sections": [
        {
          "title": "2026 season — rack",
          "rows": [
            [
              "Double/twin/triple/family room - sharing: bed & breakfast pp/night.",
              "3,309"
            ],
            [
              "Single room: bed & breakfast pp/night",
              "4,137"
            ],
            [
              "Dinner pp",
              "572"
            ],
            [
              "Lunch pp - alternatively à la carte at the lodge",
              "228"
            ],
            [
              "Full 3 Course Lunch pp - alternatively à la carte at the lodge",
              "341"
            ],
            [
              "Lunch pack pp",
              "226"
            ],
            [
              "Namushasha River Campsite pp/night– 10% commission",
              "341"
            ],
            [
              "Tour guide room: dinner, bed, and breakfast pp/night",
              "721"
            ]
          ]
        }
      ]
    },
    "2027": {
      "name": "Namushasha River Lodge",
      "region": "Caprivi",
      "currency": "N$",
      "validity": "2027 season",
      "note": "Public rack at the house rule of 20% above the net STO. This supplier does not state a commission on its rate sheet, so the house cap is used rather than a supplier figure — if they publish their own rack, it replaces this.",
      "sections": [
        {
          "title": "2027 — rack",
          "rows": [
            [
              "Room B&B — per person sharing",
              "3,494.40"
            ],
            [
              "Room B&B — single",
              "4,368"
            ],
            [
              "Camping2Go (bed only) — per person sharing",
              "1,104"
            ],
            [
              "Camping2Go (bed only) — single",
              "2,208"
            ],
            [
              "Campsite — per person per night",
              "388.80"
            ],
            [
              "Tour Guide Room (DBB)",
              "951.60"
            ]
          ]
        }
      ]
    }
  },
  "namushasha-river-camping2go": {
    "2026": {
      "name": "Namushasha Camping2Go",
      "region": "Caprivi",
      "currency": "N$",
      "validity": "01 Nov 2025 – 31 Oct 2026",
      "note": "Published rack rates from the Gondwana Collection 2026 rate sheet (01.11.2025–31.10.2026).",
      "sections": [
        {
          "title": "2026 season — rack",
          "rows": [
            [
              "Camping2Go - Self-catering tents with en-suite bathrooms - sharing: bed only, pp/night.",
              "1,084"
            ],
            [
              "Camping2Go - Self-catering tents with en-suite bathrooms - single: bed only, pp/night.",
              "2,166"
            ],
            [
              "Dinner pp - buffet at Namushasha River Lodge",
              "572"
            ],
            [
              "Breakfast pp - buffet at Namushasha River Lodge",
              "284"
            ],
            [
              "Lunch pp - alternatively à la carte at Namushasha River Lodge",
              "228"
            ],
            [
              "Tour guide tent: dinner, bed, and breakfast pp/night",
              "721"
            ]
          ]
        }
      ]
    }
  },
  "namushasha-river-villa": {
    "2026": {
      "name": "Namushasha River Villa",
      "region": "Caprivi",
      "currency": "N$",
      "validity": "01 Nov 2025 – 31 Oct 2026",
      "note": "Published rack rates from the Gondwana Collection 2026 rate sheet (01.11.2025–31.10.2026).",
      "sections": [
        {
          "title": "2026 season — rack",
          "rows": [
            [
              "Per room/night, fully inclusive, max 2 pax/room",
              "30,250"
            ]
          ]
        }
      ]
    }
  },
  "zambezi-mubala-camp": {
    "2026": {
      "name": "Zambezi Mubala Camp",
      "region": "Caprivi",
      "currency": "N$",
      "validity": "01 Nov 2025 – 31 Oct 2026",
      "note": "Published rack rates from the Gondwana Collection 2026 rate sheet (01.11.2025–31.10.2026).",
      "sections": [
        {
          "title": "2026 season — rack",
          "rows": [
            [
              "Self-catering tents with en-suite bathrooms - sharing: bed only, pp/night.",
              "1,084"
            ],
            [
              "Self-catering tents with en-suite bathrooms - single: bed only, pp/night.",
              "2,166"
            ],
            [
              "Zambezi Mubala Campsite pp/night– 10% commission",
              "341"
            ],
            [
              "Lunch pack pp",
              "226"
            ],
            [
              "Dinner pp - pre-booked, alternatively à la carte at the camp",
              "415"
            ],
            [
              "Breakfast pp - pre-booked, alternatively à la carte at the camp",
              "284"
            ],
            [
              "Tour guide tent: dinner, bed, and breakfast pp/night",
              "721"
            ]
          ]
        }
      ]
    }
  },
  "zambezi-mubala-lodge": {
    "2026": {
      "name": "Zambezi Mubala Lodge",
      "region": "Caprivi",
      "currency": "N$",
      "validity": "01 Nov 2025 – 31 Oct 2026",
      "note": "Published rack rates from the Gondwana Collection 2026 rate sheet (01.11.2025–31.10.2026).",
      "sections": [
        {
          "title": "2026 season — rack",
          "rows": [
            [
              "Double/twin/triple/family room - sharing: bed & breakfast pp/night.",
              "3,309"
            ],
            [
              "Single room: bed & breakfast pp/night",
              "4,138"
            ],
            [
              "Dinner pp",
              "572"
            ],
            [
              "Lunch pp - alternatively à la carte at the lodge",
              "228"
            ],
            [
              "Full 3 Course Lunch pp - alternatively à la carte at the lodge",
              "341"
            ],
            [
              "Lunch pack pp",
              "226"
            ],
            [
              "Tour guide room: dinner, bed, and breakfast pp/night",
              "721"
            ]
          ]
        }
      ]
    }
  },
  "chobe-river-camp": {
    "2026": {
      "name": "Chobe River Camp",
      "region": "Caprivi",
      "currency": "N$",
      "validity": "01 Nov 2025 – 31 Oct 2026",
      "note": "Published rack rates from the Gondwana Collection 2026 rate sheet (01.11.2025–31.10.2026).",
      "sections": [
        {
          "title": "2026 season — rack",
          "rows": [
            [
              "Double/twin/family room - sharing: bed & breakfast pp/night.",
              "2,364"
            ],
            [
              "Single room: bed & breakfast pp/night",
              "2,955"
            ],
            [
              "Dinner pp - buffet",
              "415"
            ],
            [
              "Lunch pp - alternatively à la carte at the lodge.",
              "228"
            ],
            [
              "Full 3 Course Lunch pp - alternatively à la carte at the lodge.",
              "341"
            ],
            [
              "Breakfast (if prebooked by tour operator) pp (alternatively à la carte menu available at camp)",
              "341"
            ],
            [
              "Lunch pack pp.",
              "226"
            ],
            [
              "Chobe River Campsite pp/night– 10% commission",
              "341"
            ],
            [
              "Tour guide tent: dinner, bed & breakfast pp/night.",
              "721"
            ]
          ]
        }
      ]
    }
  },
  "namushasha-camping2go": {
    "2026": {
      "name": "Namushasha Camping2go",
      "region": "Caprivi",
      "currency": "N$",
      "validity": "01 Nov 2025 – 31 Oct 2026",
      "note": "Published rack rates from the Gondwana Collection 2026 rate sheet (01.11.2025–31.10.2026).",
      "sections": [
        {
          "title": "2026 season — rack",
          "rows": [
            [
              "Camping2Go - Self-catering tents with en-suite bathrooms - sharing: bed only, pp/night.",
              "1,084"
            ],
            [
              "Camping2Go - Self-catering tents with en-suite bathrooms - single: bed only, pp/night.",
              "2,166"
            ],
            [
              "Dinner pp - buffet at Namushasha River Lodge",
              "572"
            ],
            [
              "Breakfast pp - buffet at Namushasha River Lodge",
              "284"
            ],
            [
              "Lunch pp - alternatively à la carte at Namushasha River Lodge",
              "228"
            ],
            [
              "Tour guide tent: dinner, bed, and breakfast pp/night",
              "721"
            ]
          ]
        }
      ]
    }
  }
});
// One source per lodge: the sheet supersedes the earlier recovered entries.
["okapuka-safari-lodge", "the-weinberg-windhoek", "weinberg-urban-pod", "kalahari-anib-lodge", "kalahari-camping2go", "reverie-kalahari-pod", "kalahari-farmhouse", "canyon-lodge", "canyon-village", "canyon-roadhouse", "namib-desert-lodge", "namib-dune-star-camp", "the-desert-grace", "desert-whisper", "the-delight-swakopmund", "the-pearls-beach-pods", "damara-mopane-lodge", "palmwag-lodge", "palmwag-camping2go", "palmwag-under-canvas-sleep-out", "omarunga-epupa-falls-camp", "etosha-safari-lodge", "the-ekipa-etosha-pod", "etosha-safari-camping2go", "etosha-king-nehale", "hakusembe-river-lodge", "hakusembe-camping2go", "namushasha-river-lodge", "namushasha-river-camping2go", "namushasha-river-villa", "zambezi-mubala-camp", "zambezi-mubala-lodge", "chobe-river-camp", "namushasha-camping2go"].forEach(function (s) { delete LEGACY_RACK_BY_YEAR[s]; delete SHEET_RACK_BY_YEAR[s]; });

// ---------------------------------------------------------------------------
// Gondwana Collection — lodge ACTIVITIES, 2026 season.
//
// Taken as printed from the collection sheet, which prints rack and STO side
// by side; nothing here is derived. Note the commission: the sheet heads these
// tables "Activities -- STO 25%", so they run at 25%, NOT the 20% the rooms
// carry. Deriving these at 20% would overstate the net on every row.
//
// Rows printed "Free", "Included" or "On request" are carried as printed. They
// parse to no number, so they show on the lodge page in the sectioned view but
// never reach the builder as a quotable line — which is correct.
//
// One row is not at 25%: Omarunga Epupa-Falls Camp's fly-in day visit prints
// 1,860.00 / 1,350.00, which is 27.42%. Loaded as printed and flagged rather
// than "corrected" to a number the supplier never published.
//
// Appended after the map cleanup at the end of this file, so it lands on
// whichever map actually serves each lodge.
// ---------------------------------------------------------------------------
;(function () {
  var ACTS = {
    "okapuka-safari-lodge": [
      [
        "Sunrise Drive (guided, +/-2.5hrs, refreshments)",
        "935.00"
      ],
      [
        "Game Drive (guided, +/-2hrs, refreshments)",
        "935.00"
      ],
      [
        "Sunset Drive (guided, +/-2.5hrs, refreshments)",
        "935.00"
      ]
    ],
    "canyon-lodge": [
      [
        "Canyon Drive -- guided to Fish River lookouts incl. refreshments and park fees (3hrs)",
        "1,600.00"
      ],
      [
        "Sundowner Drive in Canyon Park -- guided, refreshments (2-3hrs)",
        "870.00"
      ],
      [
        "Sunrise Hike -- guided, coffee and tea (3hrs)",
        "535.00"
      ],
      [
        "Morning Walk -- guided, 6km into Canyon Park (2-3hrs)",
        "285.00"
      ],
      [
        "Night Walk -- guided, 45min (direct booking only)",
        "290.00"
      ],
      [
        "Transfer Canyon Lodge to Hiker Point/Hobas (max 6 pax)",
        "1,440.00"
      ],
      [
        "Transfer Canyon Lodge to Ai-Ais (max 6 pax)",
        "2,880.00"
      ]
    ],
    "canyon-village": [
      [
        "Canyon Drive -- guided to Fish River lookouts (3hrs)",
        "1,600.00"
      ],
      [
        "Sundowner Drive in Canyon Park (2-3hrs)",
        "870.00"
      ],
      [
        "Sunrise Hike (3hrs)",
        "535.00"
      ],
      [
        "Morning Walk (2-3hrs)",
        "285.00"
      ]
    ],
    "namib-desert-lodge": [
      [
        "Sundowner Dune Drive -- guided, min 4 pax, 2-3hrs, refreshments",
        "935.00"
      ],
      [
        "Morning Dune Drive -- guided, min 4 pax, 2-3hrs, refreshments",
        "755.00"
      ],
      [
        "Sossusvlei Excursion -- guided, incl. park fees and brunch, 5-6hrs",
        "3,020.00"
      ],
      [
        "Desert Night Walk -- guided, 45min (direct booking only)",
        "290.00"
      ],
      [
        "Hiking Trails -- unguided",
        "Free"
      ]
    ],
    "the-desert-grace": [
      [
        "Morning or Sundowner Dune Drive -- guided, 2-3hrs, refreshments",
        "935.00"
      ],
      [
        "Sossusvlei Excursion -- guided, incl. park fees and brunch, 5-6hrs",
        "3,020.00"
      ],
      [
        "Desert Night Walk -- guided, 45min (direct booking only)",
        "290.00"
      ],
      [
        "Walking Trails 3km/5km/7km -- unguided",
        "Free"
      ]
    ],
    "etosha-safari-lodge": [
      [
        "Morning or Afternoon Half-Day Etosha Excursion -- guided, 9-seater, 5-6hrs",
        "990.00"
      ],
      [
        "Full-Day Etosha Excursion -- guided, 9-seater, 9hrs",
        "2,000.00"
      ],
      [
        "Guided Walks 2-3.5km -- mopane woodland, 1-2hrs",
        "445.00"
      ],
      [
        "Transfer to Okutala Airstrip -- return",
        "560.00"
      ]
    ],
    "kalahari-anib-lodge": [
      [
        "Sunrise / Sundowner Drive (guided, 3hrs, refreshments)",
        "935.00"
      ],
      [
        "Dune Walk (guided, 2hrs, morning only, refreshments)",
        "935.00"
      ],
      [
        "Morning Drive for Families (guided, 2hrs)",
        "755.00"
      ],
      [
        "Desert Night Walk (45min -- direct booking only)",
        "290.00"
      ],
      [
        "Hiking Trails (unguided)",
        "Free"
      ]
    ],
    "reverie-kalahari-pod": [
      [
        "Sunrise / Sundowner Dune Drive (guided, 3hrs)",
        "Included"
      ],
      [
        "Dune Walk (guided, 2hrs)",
        "Included"
      ],
      [
        "Hiking Trails (unguided)",
        "Free of charge"
      ]
    ],
    "damara-mopane-lodge": [
      [
        "Birding Morning or Afternoon Walk (guided, 1-1.5hrs)",
        "250.00"
      ],
      [
        "Sundowner Walk to viewing platform (escorted -- drinks charged to room)",
        "Free"
      ],
      [
        "Mountain or Valley Hiking Trails (unguided, marked)",
        "Free"
      ]
    ],
    "palmwag-lodge": [
      [
        "Half-Day Scenic Drive (guided, 3hrs, refreshments)",
        "1,355.00"
      ],
      [
        "Full-Day Damaraland Excursion (guided, min 4 pax, full day)",
        "3,555.00"
      ],
      [
        "Morning Hike 2km (guided, 1.5hrs)",
        "400.00"
      ],
      [
        "Morning Hike 5km (guided, 3hrs)",
        "485.00"
      ],
      [
        "Half-Day Rhino Tracking (guided, min 2 pax -- not for under 12)",
        "3,975.00"
      ],
      [
        "Welwitschia Walk (unguided, 1.5hrs)",
        "Free"
      ],
      [
        "Airstrip Transfer -- return (free of charge)",
        "Free"
      ]
    ],
    "palmwag-camping2go": [
      [
        "Half-Day Scenic Drive (guided, 3hrs)",
        "1,355.00"
      ],
      [
        "Full-Day Damaraland Excursion (guided, min 4 pax)",
        "3,555.00"
      ],
      [
        "Half-Day Rhino Tracking (guided, min 2 pax -- not for under 12)",
        "3,975.00"
      ]
    ],
    "omarunga-epupa-falls-camp": [
      [
        "Himba Village Visit (guided, 3-4hrs, refreshments included)",
        "1,195.00"
      ],
      [
        "Sundowner Walk above Epupa Falls (guided, 2hrs, snacks and drinks)",
        "475.00"
      ],
      [
        "Kunene River Walk (guided, 2hrs)",
        "445.00"
      ],
      [
        "Fly-In Day Visit -- Himba village and Epupa Falls excursion",
        "1,860.00"
      ],
      [
        "River Rafting on the Kunene (guided, 2.5hrs)",
        "On request"
      ],
      [
        "Transfer to Epupa Airstrip return (max 6 pax per vehicle, 3km)",
        "1,210.00 per vehicle"
      ]
    ],
    "etosha-safari-camping2go": [
      [
        "Half-Day Etosha Excursion (guided, 24-seater, 5-6hrs)",
        "990.00"
      ],
      [
        "Full-Day Etosha Excursion (guided, 24-seater, 9hrs)",
        "2,000.00"
      ]
    ],
    "the-ekipa-etosha-pod": [
      [
        "Morning or Afternoon Half-Day Etosha Excursion (guided, 4x4, 5-6hrs, park fees included)",
        "Included"
      ],
      [
        "Full-Day Etosha Excursion (guided, 4x4, 9hrs, park fees included)",
        "Included"
      ],
      [
        "Guided Walks 2-3.5km -- mopane woodland",
        "Included"
      ],
      [
        "Transfer to Okutala Airstrip return",
        "560.00 n.c."
      ]
    ],
    "hakusembe-river-lodge": [
      [
        "Sunset Boat Cruise (guided, 1.5hrs, refreshments)",
        "460.00"
      ],
      [
        "Morning Boat Cruise -- Bird Lovers (guided, 1.5hrs, refreshments)",
        "460.00"
      ],
      [
        "Fishing Trip (guided, per hour, min/max 2 per boat -- catch and release)",
        "290.00 p/h"
      ],
      [
        "Transfer Hakusembe to Rundu Airport return (min 2 pax, 10km)",
        "350.00"
      ]
    ],
    "namushasha-river-lodge": [
      [
        "Bwabwata National Park Drive (guided, 3hrs, incl. park fees and boat)",
        "1,130.00"
      ],
      [
        "Afternoon Boat Cruise on Kwando (guided, 3hrs, refreshments)",
        "985.00"
      ],
      [
        "Sundowner Boat Cruise (guided, 1.5hrs, refreshments)",
        "610.00"
      ],
      [
        "Morning Boat Cruise (guided, 1.5hrs, refreshments)",
        "610.00"
      ],
      [
        "Fishing Trip (guided, per hour, catch-and-release)",
        "385.00 p/h"
      ],
      [
        "Transfer to Katima Mpacha Airport return (120km)",
        "1,005.00"
      ],
      [
        "Transfer to Lianshulu return (25km)",
        "330.00"
      ],
      [
        "Package Transfer -- Airport and 3 Zambezi properties return",
        "1,170.00"
      ]
    ],
    "canyon-roadhouse": [
      [
        "Hiking Trail (unguided, 2-3hrs, marked trail)",
        "Free of charge"
      ],
      [
        "4x4 Garas Self-Drive through Canyon Park (park fee applies)",
        "Park fees only"
      ],
      [
        "Canyon Drive to Fish River lookouts (guided, 3hrs)",
        "1,600.00"
      ],
      [
        "Sundowner Drive in Canyon Park (guided, 2-3hrs)",
        "870.00"
      ],
      [
        "Sunrise Hike (guided, 3hrs)",
        "535.00"
      ],
      [
        "Morning Walk (guided, 2-3hrs)",
        "285.00"
      ]
    ],
    "zambezi-mubala-camp": [
      [
        "Sundowner Boat Cruise (guided, 1.5hrs, refreshments)",
        "460.00"
      ],
      [
        "Morning or Afternoon Boat Cruise (guided, 3hrs, refreshments)",
        "790.00"
      ],
      [
        "Nature Walk to bird colonies (guided, 3hrs, seasonal -- direct booking)",
        "305.00"
      ],
      [
        "Fishing Trip (guided, per hour, catch-and-release)",
        "385.00 p/h"
      ],
      [
        "Transfer to Katima Mpacha Airport return (50km)",
        "505.00"
      ],
      [
        "Package Transfer -- Airport and 3 Zambezi properties return",
        "1,170.00"
      ]
    ],
    "zambezi-mubala-lodge": [
      [
        "Sundowner Boat Cruise (guided, 1.5hrs, refreshments)",
        "460.00"
      ],
      [
        "Morning or Afternoon Boat Cruise (guided, 3hrs, refreshments)",
        "790.00"
      ],
      [
        "Nature Walk to bird colonies (guided, 3hrs, seasonal)",
        "305.00"
      ],
      [
        "Fishing Trip (guided, per hour, catch-and-release)",
        "385.00 p/h"
      ],
      [
        "Transfer to Katima Mpacha Airport return (50km)",
        "505.00"
      ],
      [
        "Package Transfer -- Airport and 3 Zambezi properties return",
        "1,170.00"
      ]
    ],
    "chobe-river-camp": [
      [
        "Morning or Afternoon Boat Cruise (guided, seasonal, 3hrs)",
        "985.00"
      ],
      [
        "Sundowner Boat Cruise (guided, seasonal, 2hrs)",
        "530.00"
      ],
      [
        "Walking Trail (guided, seasonal, 1-2hrs -- direct booking only)",
        "455.00"
      ],
      [
        "Canoe Trip (guided, 1.5hrs, refreshments -- direct booking only)",
        "555.00"
      ],
      [
        "Birding Drive (guided, 3hrs, refreshments -- direct booking only)",
        "510.00"
      ],
      [
        "Transfer to Katima Mpacha Airport return (90km)",
        "840.00"
      ],
      [
        "Package Transfer -- Airport and 3 Zambezi properties return",
        "1,170.00"
      ]
    ],
    "etosha-king-nehale": [
      [
        "Half-Day Etosha Excursion -- guided, 9-seater, 5-6hrs",
        "990.00"
      ],
      [
        "Full-Day Etosha Excursion -- guided, 9-seater, 9hrs",
        "2,000.00"
      ],
      [
        "Private Waterhole Excursion -- King Nehale guests only, guided, 3hrs, incl. snacks",
        "1,500.00"
      ],
      [
        "Cultural Experience -- guided, 9hrs",
        "1,185.00"
      ],
      [
        "Transfer to/from Ondangwa -- one way, 9-seater (102km)",
        "1,980.00 per vehicle"
      ],
      [
        "Transfer to/from Mokuti -- one way, 9-seater (58km)",
        "1,035.00 per vehicle"
      ],
      [
        "Transfer to/from Mushara -- one way, 9-seater (65km)",
        "1,145.00 per vehicle"
      ]
    ]
  };
  var MAPS = [DDS_RACK_BY_YEAR, LEGACY_RACK_BY_YEAR, SHEET_RACK_BY_YEAR];
  Object.keys(ACTS).forEach(function (slug) {
    for (var i = 0; i < MAPS.length; i++) {
      var m = MAPS[i];
      var doc = m && m[slug] && m[slug]["2026"];
      if (!doc || !Array.isArray(doc.sections)) continue;
      if (doc.sections.some(function (s) { return /^Activities/i.test(s.title || ""); })) return;
      doc.sections.push({ title: "Activities — 25% commission", rows: ACTS[slug] });
      return;
    }
  });
})();

// ---------------------------------------------------------------------------
// Namibia Wildlife Resorts — 2026 season, rebuilt from the NWR rate sheet.
//
// NWR publishes RACK ONLY and allows Desert Tracks 10%. The house treatment,
// which applies to NWR and to nothing else:
//
//     our net STO   = NWR published rack  x 0.90
//     our public rack = our net STO       x 1.20
//
// These properties previously carried a doc keyed "2027". Those figures were
// correct under the rule above but the YEAR was wrong: every one of the 130
// values was this 2025/2026 sheet, and NWR has published no 2027 season at all.
// (0.90 x 1.20 = 1.08, which is why they looked like a 2026 sheet escalated 8%.)
// The 2027 keys are removed so a visitor asking for 2027 gets an honest
// "rates to follow" instead of last season priced as next season.
//
// Halali Resort and Namutoni Resort get rates here for the first time — both
// have had live pages and no doc in either API.
//
// Activities follow the sheet, not the house rule: it states "game drives
// commissionable at 10% when pre-booked" and everything else non-commissionable,
// so drives take the same x0.90 / x1.20 treatment and every other row carries
// rack = net as printed. Rows reading "Rates on request" are carried as printed.
// ---------------------------------------------------------------------------
;(function () {
  var NWR = {
    "boplaas-campsite": {
      "name": "Boplaas Campsite",
      "region": "Fish River Canyon",
      "currency": "N$",
      "validity": "01 Nov 2025 – 31 Oct 2026",
      "note": "Namibia Wildlife Resorts publishes rack only and allows Desert Tracks 10%. Net STO is NWR rack less 10%; the figure shown here is that net grossed up by 20%, which is the public rack. NWR has not published a 2027 season, so no 2027 rates exist for this property.",
      "sections": [
        {
          "title": "2026 — rack",
          "rows": [
            [
              "Low Season (01 Nov – 30 Jun) · Campsite (max 8 people) -- per person 110 — per person sharing",
              "118.8"
            ]
          ]
        },
        {
          "title": "Activities — game drives 10%, all else non-commissionable",
          "rows": [
            [
              "Kayak half-day trip (min 4, max 30)",
              "400 per person"
            ],
            [
              "Kayak Hire",
              "150 per person"
            ],
            [
              "Overnight trails",
              "1,800 per person"
            ],
            [
              "3-day trails (booked in advance)",
              "4,300 per person"
            ],
            [
              "Rental of a canoe (max 2)",
              "150 per canoe"
            ]
          ]
        }
      ]
    },
    "hobas-lodge": {
      "name": "Hobas Lodge",
      "region": "Fish River Canyon",
      "currency": "N$",
      "validity": "01 Nov 2025 – 31 Oct 2026",
      "note": "Namibia Wildlife Resorts publishes rack only and allows Desert Tracks 10%. Net STO is NWR rack less 10%; the figure shown here is that net grossed up by 20%, which is the public rack. NWR has not published a 2027 season, so no 2027 rates exist for this property.",
      "sections": [
        {
          "title": "2026 — rack",
          "rows": [
            [
              "High Season (01 Jul – 31 Oct) · Campsite (max 8) — per person sharing",
              "518.4"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Campsite (max 8) — single",
              "518.4"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Bush chalet (2 beds) BB — per person sharing",
              "2,041.2"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Bush chalet (2 beds) BB — single",
              "2,322"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Bush chalet (2 beds) BB — per person sharing",
              "2,527.2"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Bush chalet (2 beds) BB — single",
              "2,527.2"
            ]
          ]
        },
        {
          "title": "Activities — game drives 10%, all else non-commissionable",
          "rows": [
            [
              "Fish River Canyon hiking trail (min 3, max 30)",
              "540 per person"
            ]
          ]
        }
      ]
    },
    "ai-ais-hot-springs-and-spa": {
      "name": "/Ai-/Ais Hot Springs and Spa",
      "region": "Fish River Canyon",
      "currency": "N$",
      "validity": "01 Nov 2025 – 31 Oct 2026",
      "note": "Namibia Wildlife Resorts publishes rack only and allows Desert Tracks 10%. Net STO is NWR rack less 10%; the figure shown here is that net grossed up by 20%, which is the public rack. NWR has not published a 2027 season, so no 2027 rates exist for this property.",
      "sections": [
        {
          "title": "2026 — rack",
          "rows": [
            [
              "Low Season (01 Nov – 30 Jun) · Campsite (max 8) — per person camping",
              "421.2"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Campsite (max 8) — per person camping",
              "421.2"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Mountain view double (2 beds) BB — per person sharing",
              "1,468.8"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Mountain view double (2 beds) BB — single",
              "1,771.2"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Mountain view double (2 beds) BB — per person sharing",
              "1,771.2"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Mountain view double (2 beds) BB — single",
              "2,062.8"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · River view double (2 beds) BB — per person sharing",
              "1,771.2"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · River view double (2 beds) BB — single",
              "2,062.8"
            ],
            [
              "High Season (01 Jul – 31 Oct) · River view double (2 beds) BB — per person sharing",
              "2,160"
            ],
            [
              "High Season (01 Jul – 31 Oct) · River view double (2 beds) BB — single",
              "2,462.4"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Bush family chalet (4 beds, min 2) Bed only — per person sharing",
              "1,965.6"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Bush family chalet (4 beds, min 2) Bed only — per person sharing",
              "2,354.4"
            ]
          ]
        },
        {
          "title": "Activities — game drives 10%, all else non-commissionable",
          "rows": [
            [
              "Nature drive (morning or afternoon)",
              "650 per person"
            ],
            [
              "Guided nature walk",
              "300 per person"
            ],
            [
              "Shuttle Service (/Ai-/Ais to Hobas)",
              "500 per person"
            ]
          ]
        }
      ]
    },
    "gross-barmen-resort": {
      "name": "Gross Barmen Resort",
      "region": "Central Namibia",
      "currency": "N$",
      "validity": "01 Nov 2025 – 31 Oct 2026",
      "note": "Namibia Wildlife Resorts publishes rack only and allows Desert Tracks 10%. Net STO is NWR rack less 10%; the figure shown here is that net grossed up by 20%, which is the public rack. NWR has not published a 2027 season, so no 2027 rates exist for this property.",
      "sections": [
        {
          "title": "2026 — rack",
          "rows": [
            [
              "Low Season (01 Nov – 30 Jun) · Campsite (max 8) — per person sharing",
              "259.2"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Premier chalet BB — per person camping",
              "2,872.8"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Premier chalet BB — per person camping",
              "3,078"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Bush chalet BB — per person camping",
              "1,436.4"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Bush chalet BB — per person camping",
              "1,641.6"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Family chalet (4 beds, min 2) BB — per person camping",
              "2,160"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Premier family chalet (4 beds, min 2) BB — per person camping",
              "2,872.8"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Self-catering Acacia (4 beds, min 2) Bed only — per person camping",
              "1,274.4"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Self-catering Aloe (2 beds, min 2) Bed only — per person camping",
              "1,274.4"
            ]
          ]
        },
        {
          "title": "Activities — game drives 10%, all else non-commissionable",
          "rows": [
            [
              "Hiking",
              "200 per person"
            ],
            [
              "Day visitor fee (Picnic and Olympic swimming pool)",
              "200 per person"
            ],
            [
              "Day visitor surcharge to access thermal pool",
              "100 per person"
            ],
            [
              "Conference facility",
              "Rates on request"
            ]
          ]
        }
      ]
    },
    "halali-resort": {
      "name": "Halali Camp",
      "region": "South Etosha",
      "currency": "N$",
      "validity": "01 Nov 2025 – 31 Oct 2026",
      "note": "Namibia Wildlife Resorts publishes rack only and allows Desert Tracks 10%. Net STO is NWR rack less 10%; the figure shown here is that net grossed up by 20%, which is the public rack. NWR has not published a 2027 season, so no 2027 rates exist for this property.",
      "sections": [
        {
          "title": "2026 — rack",
          "rows": [
            [
              "Low Season (01 Nov – 30 Jun) · Campsite (max 8) — per person camping",
              "496.8"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Campsite (max 8) — per person camping",
              "594"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Double room BB — per person sharing",
              "1,512"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Double room BB — single",
              "1,641.6"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Double room BB — per person sharing",
              "1,825.2"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Double room BB — single",
              "2,246.4"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Bush chalet (4 beds, min 2) BB — per person sharing",
              "1,663.2"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Bush chalet (4 beds, min 2) BB — per person sharing",
              "2,246.4"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Bush chalet (2 beds) BB — per person sharing",
              "1,663.2"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Bush chalet (2 beds) BB — single",
              "1,911.6"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Bush chalet (2 beds) BB — per person sharing",
              "2,246.4"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Bush chalet (2 beds) BB — single",
              "2,484"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Bush chalet disabled (2 beds) BB — per person sharing",
              "1,663.2"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Bush chalet disabled (2 beds) BB — single",
              "1,911.6"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Bush chalet disabled (2 beds) BB — per person sharing",
              "2,246.4"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Bush chalet disabled (2 beds) BB — single",
              "2,484"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Family chalet (4 beds, min 2) BB — per person sharing",
              "2,570.4"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Family chalet (4 beds, min 2) BB — per person sharing",
              "2,646"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Honeymoon suite (double bed) BB — per person sharing",
              "1,998"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Honeymoon suite (double bed) BB — single",
              "2,246.4"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Honeymoon suite (double bed) BB — per person sharing",
              "2,991.6"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Honeymoon suite (double bed) BB — single",
              "3,240"
            ]
          ]
        },
        {
          "title": "Activities — game drives 10%, all else non-commissionable",
          "rows": [
            [
              "Guided morning drives",
              "702 per person"
            ],
            [
              "Guided afternoon drives",
              "702 per person"
            ],
            [
              "Guided night drives",
              "810 per person"
            ]
          ]
        }
      ]
    },
    "okaukuejo-camp": {
      "name": "Okaukuejo Camp",
      "region": "South Etosha",
      "currency": "N$",
      "validity": "01 Nov 2025 – 31 Oct 2026",
      "note": "Namibia Wildlife Resorts publishes rack only and allows Desert Tracks 10%. Net STO is NWR rack less 10%; the figure shown here is that net grossed up by 20%, which is the public rack. NWR has not published a 2027 season, so no 2027 rates exist for this property.",
      "sections": [
        {
          "title": "2026 — rack",
          "rows": [
            [
              "Low Season (01 Nov – 30 Jun) · Campsite (max 8) — per person camping",
              "496.8"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Campsite (max 8) — per person camping",
              "604.8"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Double room A (2 beds) BB — per person sharing",
              "2,052"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Double room A (2 beds) BB — single",
              "2,300.4"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Double room A (2 beds) BB — per person sharing",
              "2,570.4"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Double room A (2 beds) BB — single",
              "2,991.6"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Double room B (2 beds) BB — per person sharing",
              "2,052"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Double room B (2 beds) BB — single",
              "2,300.4"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Double room B (2 beds) BB — per person sharing",
              "2,570.4"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Double room B (2 beds) BB — single",
              "2,991.6"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Bush chalet disabled (2 beds) BB — per person sharing",
              "2,052"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Bush chalet disabled (2 beds) BB — single",
              "2,300.4"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Bush chalet disabled (2 beds) BB — per person sharing",
              "2,732.4"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Bush chalet disabled (2 beds) BB — single",
              "3,164.4"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Bush chalet (2 beds) BB — per person sharing",
              "2,386.8"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Bush chalet (2 beds) BB — single",
              "2,646"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Bush chalet (2 beds) BB — per person sharing",
              "2,894.4"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Bush chalet (2 beds) BB — single",
              "3,337.2"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Family chalet (4 beds, min 2) BB — per person sharing",
              "2,300.4"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Family chalet (4 beds, min 2) BB — per person sharing",
              "3,078"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Waterhole chalet (2 beds) BB — per person sharing",
              "2,570.4"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Waterhole chalet (2 beds) BB — single",
              "2,829.6"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Waterhole chalet (2 beds) BB — per person sharing",
              "3,758.4"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Waterhole chalet (2 beds) BB — single",
              "4,179.6"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Premier Waterhole Chalet (double story, 4 beds, min 2) BB — per person sharing",
              "4,276.8"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Premier Waterhole Chalet (double story, 4 beds, min 2) BB — per person sharing",
              "6,404.4"
            ]
          ]
        },
        {
          "title": "Activities — game drives 10%, all else non-commissionable",
          "rows": [
            [
              "Guided morning drives",
              "702 per person"
            ],
            [
              "Guided afternoon drives",
              "702 per person"
            ],
            [
              "Guided night drives",
              "810 per person"
            ]
          ]
        }
      ]
    },
    "namutoni-resort": {
      "name": "Namutoni Camp",
      "region": "East Etosha",
      "currency": "N$",
      "validity": "01 Nov 2025 – 31 Oct 2026",
      "note": "Namibia Wildlife Resorts publishes rack only and allows Desert Tracks 10%. Net STO is NWR rack less 10%; the figure shown here is that net grossed up by 20%, which is the public rack. NWR has not published a 2027 season, so no 2027 rates exist for this property.",
      "sections": [
        {
          "title": "2026 — rack",
          "rows": [
            [
              "Low Season (01 Nov – 30 Jun) · Campsite (max 8) — per person camping",
              "496.8"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Campsite (max 8) — per person camping",
              "594"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Double room (2 beds) BB — per person sharing",
              "1,987.2"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Double room (2 beds) BB — single",
              "1,987.2"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Double room (2 beds) BB — per person sharing",
              "2,494.8"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Double room (2 beds) BB — single",
              "2,743.2"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Bush Chalet (2 beds) BB — per person sharing",
              "2,332.8"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Bush Chalet (2 beds) BB — single",
              "2,332.8"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Bush Chalet (2 beds) BB — per person sharing",
              "2,894.4"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Bush Chalet (2 beds) BB — single",
              "3,148.2"
            ]
          ]
        },
        {
          "title": "Activities — game drives 10%, all else non-commissionable",
          "rows": [
            [
              "Guided morning drives",
              "702 per person"
            ],
            [
              "Guided afternoon drives",
              "702 per person"
            ],
            [
              "Guided night drives",
              "810 per person"
            ]
          ]
        }
      ]
    },
    "waterberg-camp": {
      "name": "Waterberg Camp",
      "region": "Central Namibia",
      "currency": "N$",
      "validity": "01 Nov 2025 – 31 Oct 2026",
      "note": "Namibia Wildlife Resorts publishes rack only and allows Desert Tracks 10%. Net STO is NWR rack less 10%; the figure shown here is that net grossed up by 20%, which is the public rack. NWR has not published a 2027 season, so no 2027 rates exist for this property.",
      "sections": [
        {
          "title": "2026 — rack",
          "rows": [
            [
              "Low Season (01 Nov – 30 Jun) · Campsite (max 8) — per person camping",
              "464.4"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Campsite (max 8) — per person camping",
              "464.4"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Double room BB — per person sharing",
              "1,188"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Double room BB — single",
              "1,458"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Double room BB — per person sharing",
              "1,382.4"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Double room BB — single",
              "1,652.4"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Bush chalet (2 beds) BB — per person sharing",
              "1,447.2"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Bush chalet (2 beds) BB — single",
              "1,728"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Bush chalet (2 beds) BB — per person sharing",
              "1,674"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Bush chalet (2 beds) BB — single",
              "1,944"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Bush chalet (4 beds, min 2) BB — per person sharing",
              "1,447.2"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Bush chalet (4 beds, min 2) BB — per person sharing",
              "1,641.6"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Family chalet (4 beds, min 2) BB — per person sharing",
              "1,641.6"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Family chalet (4 beds, min 2) BB — per person sharing",
              "1,900.8"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Premier bush chalet (2 beds) BB — per person sharing",
              "1,771.2"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Premier bush chalet (2 beds) BB — single",
              "2,041.2"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Premier bush chalet (2 beds) BB — per person sharing",
              "1,965.6"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Premier bush chalet (2 beds) BB — single",
              "2,246.4"
            ]
          ]
        },
        {
          "title": "Activities — game drives 10%, all else non-commissionable",
          "rows": [
            [
              "Guided morning drives",
              "702 per person"
            ],
            [
              "Guided afternoon drives",
              "702 per person"
            ]
          ]
        }
      ]
    },
    "popa-falls-resort": {
      "name": "Popa Falls Lodge",
      "region": "Caprivi",
      "currency": "N$",
      "validity": "01 Nov 2025 – 31 Oct 2026",
      "note": "Namibia Wildlife Resorts publishes rack only and allows Desert Tracks 10%. Net STO is NWR rack less 10%; the figure shown here is that net grossed up by 20%, which is the public rack. NWR has not published a 2027 season, so no 2027 rates exist for this property.",
      "sections": [
        {
          "title": "2026 — rack",
          "rows": [
            [
              "Low Season (01 Nov – 30 Jun) · Campsite (max 8) overlander — per person camping",
              "183.6"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Campsite (max 8) overlander — per person camping",
              "183.6"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · River cabins (2 beds) BB — per person sharing",
              "1,641.6"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · River cabins (2 beds) BB — single",
              "1,900.8"
            ],
            [
              "High Season (01 Jul – 31 Oct) · River cabins (2 beds) BB — per person sharing",
              "2,052"
            ],
            [
              "High Season (01 Jul – 31 Oct) · River cabins (2 beds) BB — single",
              "2,322"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Bush chalet (2 beds) BB — per person sharing",
              "1,468.8"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Bush chalet (2 beds) BB — single",
              "1,738.8"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Bush chalet (2 beds) BB — per person sharing",
              "1,825.2"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Bush chalet (2 beds) BB — single",
              "2,095.2"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Bush chalet (4 beds, min 2) BB — per person sharing",
              "1,468.8"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Bush chalet (4 beds, min 2) BB — per person sharing",
              "1,641.6"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Family chalet (4 beds, min 2) BB — per person sharing",
              "1,641.6"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Family chalet (4 beds, min 2) BB — per person sharing",
              "1,900.8"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Premier bush chalet (2 beds) BB — per person sharing",
              "1,771.2"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Premier bush chalet (2 beds) BB — single",
              "2,041.2"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Premier bush chalet (2 beds) BB — per person sharing",
              "1,965.6"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Premier bush chalet (2 beds) BB — single",
              "2,246.4"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Luxury river cabins BB — per person sharing",
              "1,965.6"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Luxury river cabins BB — single",
              "2,224.8"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Luxury river cabins BB — per person sharing",
              "2,354.4"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Luxury river cabins BB — single",
              "2,613.6"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Family House (6 beds, min 3) BB — per person sharing",
              "1,641.6"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Family House (6 beds, min 3) BB — per person sharing",
              "2,052"
            ]
          ]
        },
        {
          "title": "Activities — game drives 10%, all else non-commissionable",
          "rows": [
            [
              "Guided morning drives",
              "594 per person"
            ],
            [
              "Guided afternoon drives",
              "594 per person"
            ],
            [
              "Exclusive Full Day Boat Cruise",
              "750 per person"
            ],
            [
              "Boat Cruise (Morning or Afternoon)",
              "350 per person"
            ],
            [
              "Day visitor fee -- Namibians",
              "20 per person"
            ],
            [
              "Day visitor fee -- Others",
              "30 per person"
            ],
            [
              "Conference facility",
              "Rates on request"
            ]
          ]
        }
      ]
    },
    "sossus-dune-lodge": {
      "name": "Sossus Dune Lodge",
      "region": "Sossusvlei",
      "currency": "N$",
      "validity": "01 Nov 2025 – 31 Oct 2026",
      "note": "Namibia Wildlife Resorts publishes rack only and allows Desert Tracks 10%. Net STO is NWR rack less 10%; the figure shown here is that net grossed up by 20%, which is the public rack. NWR has not published a 2027 season, so no 2027 rates exist for this property.",
      "sections": [
        {
          "title": "2026 — rack",
          "rows": [
            [
              "Low Season (01 Nov – 30 Jun) · Dune chalet (2 beds) DBB — per person sharing",
              "4,352.4"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Dune chalet (2 beds) DBB — single",
              "4,752"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Dune chalet (2 beds) DBB — per person sharing",
              "7,560"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Dune chalet (2 beds) DBB — single",
              "7,970.4"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Honeymoon chalet (double bed) DBB — per person sharing",
              "4,957.2"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Honeymoon chalet (double bed) DBB — single",
              "5,356.8"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Honeymoon chalet (double bed) DBB — per person sharing",
              "8,348.4"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Honeymoon chalet (double bed) DBB — single",
              "8,758.8"
            ]
          ]
        },
        {
          "title": "Activities — game drives 10%, all else non-commissionable",
          "rows": [
            [
              "Guided Game/Nature Drive (Park or Vlei, anytime)",
              "810 per person"
            ],
            [
              "Guided excursion to Elim Dune",
              "440 per person"
            ],
            [
              "Guided walks to Sesriem Canyon",
              "440 per person"
            ]
          ]
        }
      ]
    },
    "onkoshi-camp": {
      "name": "Onkoshi Camp",
      "region": "South Etosha",
      "currency": "N$",
      "validity": "01 Nov 2025 – 31 Oct 2026",
      "note": "Namibia Wildlife Resorts publishes rack only and allows Desert Tracks 10%. Net STO is NWR rack less 10%; the figure shown here is that net grossed up by 20%, which is the public rack. NWR has not published a 2027 season, so no 2027 rates exist for this property.",
      "sections": [
        {
          "title": "2026 — rack",
          "rows": [
            [
              "Low Season (01 Nov – 30 Jun) · Onkoshi chalet (2 beds) DBB — per person sharing",
              "3,434.4"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Onkoshi chalet (2 beds) DBB — single",
              "3,769.2"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Onkoshi chalet (2 beds) DBB — per person sharing",
              "4,665.6"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Onkoshi chalet (2 beds) DBB — single",
              "5,000.4"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Onkoshi honeymoon chalet (king-size) DBB — per person sharing",
              "3,844.8"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Onkoshi honeymoon chalet (king-size) DBB — single",
              "4,190.4"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Onkoshi honeymoon chalet (king-size) DBB — per person sharing",
              "5,508"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Onkoshi honeymoon chalet (king-size) DBB — single",
              "5,832"
            ]
          ]
        },
        {
          "title": "Activities — game drives 10%, all else non-commissionable",
          "rows": [
            [
              "Guided morning drives",
              "702 per person"
            ],
            [
              "Guided afternoon drives",
              "702 per person"
            ],
            [
              "Guided night drives",
              "810 per person"
            ]
          ]
        }
      ]
    },
    "dolomite-camp": {
      "name": "Dolomite Camp",
      "region": "West Etosha",
      "currency": "N$",
      "validity": "01 Nov 2025 – 31 Oct 2026",
      "note": "Namibia Wildlife Resorts publishes rack only and allows Desert Tracks 10%. Net STO is NWR rack less 10%; the figure shown here is that net grossed up by 20%, which is the public rack. NWR has not published a 2027 season, so no 2027 rates exist for this property.",
      "sections": [
        {
          "title": "2026 — rack",
          "rows": [
            [
              "Low Season (01 Nov – 30 Jun) · Bush chalet (2 beds) DBB — per person sharing",
              "3,434.4"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Bush chalet (2 beds) DBB — single",
              "3,769.2"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Bush chalet (2 beds) DBB — per person sharing",
              "4,665.6"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Bush chalet (2 beds) DBB — single",
              "5,000.4"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Deluxe chalet (double bed) DBB — per person sharing",
              "3,844.8"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Deluxe chalet (double bed) DBB — single",
              "4,190.4"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Deluxe chalet (double bed) DBB — per person sharing",
              "5,508"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Deluxe chalet (double bed) DBB — single",
              "5,832"
            ]
          ]
        },
        {
          "title": "Activities — game drives 10%, all else non-commissionable",
          "rows": [
            [
              "Guided morning drives",
              "702 per person"
            ],
            [
              "Guided afternoon drives",
              "702 per person"
            ],
            [
              "Guided night drives",
              "810 per person"
            ]
          ]
        }
      ]
    },
    "naukluft-camp": {
      "name": "Naukluft Camp",
      "region": "Sossusvlei",
      "currency": "N$",
      "validity": "01 Nov 2025 – 31 Oct 2026",
      "note": "Namibia Wildlife Resorts publishes rack only and allows Desert Tracks 10%. Net STO is NWR rack less 10%; the figure shown here is that net grossed up by 20%, which is the public rack. NWR has not published a 2027 season, so no 2027 rates exist for this property.",
      "sections": [
        {
          "title": "2026 — rack",
          "rows": [
            [
              "Low Season (01 Nov – 30 Jun) · Campsite (max 5) — per person camping",
              "496.8"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Campsite (max 5) — per person camping",
              "496.8"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Bush chalet (2 beds) BB — per person sharing",
              "1,566"
            ],
            [
              "Low Season (01 Nov – 30 Jun) · Bush chalet (2 beds) BB — single",
              "1,857.6"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Bush chalet (2 beds) BB — per person sharing",
              "2,160"
            ],
            [
              "High Season (01 Jul – 31 Oct) · Bush chalet (2 beds) BB — single",
              "2,462.4"
            ]
          ]
        },
        {
          "title": "Activities — game drives 10%, all else non-commissionable",
          "rows": [
            [
              "Guided Kluft Walk",
              "400 per person"
            ],
            [
              "Naukluft Hiking Trail -- 4 days",
              "400 per person"
            ],
            [
              "Naukluft Hiking Trail -- 8 days",
              "800 per person"
            ]
          ]
        }
      ]
    }
  };
  var LOWER = [LEGACY_RACK_BY_YEAR, SHEET_RACK_BY_YEAR, VF_RACK];
  Object.keys(NWR).forEach(function (slug) {
    // one source per lodge: clear every older copy, then install 2026 on top
    LOWER.forEach(function (m) { if (m && m[slug]) { try { delete m[slug]; } catch (e) {} } });
    DDS_RACK_BY_YEAR[slug] = { "2026": NWR[slug] };
  });
})();
