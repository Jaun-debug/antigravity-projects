import { Region, Lodge, Itinerary } from '../types';

export const mockRegions: Region[] = [
  {
    "id": "r1",
    "name": "Windhoek",
    "summary": "Experience the beauty of Windhoek.",
    "heroImage": "/images/solly/flamingo2.jpg",
    "galleryImages": []
  },
  {
    "id": "r2",
    "name": "Sossusvlei",
    "summary": "Experience the beauty of Sossusvlei.",
    "heroImage": "/images/solly/flamingo1.jpg",
    "galleryImages": []
  },
  {
    "id": "r3",
    "name": "South Etosha",
    "summary": "Experience the beauty of South Etosha.",
    "heroImage": "/images/solly/flamingo2.jpg",
    "galleryImages": []
  },
  {
    "id": "r4",
    "name": "East Etosha",
    "summary": "Experience the beauty of East Etosha.",
    "heroImage": "/images/solly/flamingo5.jpg",
    "galleryImages": []
  },
  {
    "id": "r5",
    "name": "Central Namibia",
    "summary": "Experience the beauty of Central Namibia.",
    "heroImage": "/images/solly/flamingo8.jpg",
    "galleryImages": []
  },
  {
    "id": "r6",
    "name": "Swakopmund",
    "summary": "Experience the beauty of Swakopmund.",
    "heroImage": "/images/solly/flamingo5.jpg",
    "galleryImages": []
  },
  {
    "id": "r7",
    "name": "Kunene Skeleton Coast",
    "summary": "Experience the beauty of Kunene Skeleton Coast.",
    "heroImage": "/images/solly/flamingo4.jpg",
    "galleryImages": []
  },
  {
    "id": "r8",
    "name": "Damaraland",
    "summary": "Experience the beauty of Damaraland.",
    "heroImage": "/images/solly/flamingo8.jpg",
    "galleryImages": []
  },
  {
    "id": "r9",
    "name": "West Etosha",
    "summary": "Experience the beauty of West Etosha.",
    "heroImage": "/images/solly/flamingo5.jpg",
    "galleryImages": []
  },
  {
    "id": "r10",
    "name": "Epupa",
    "summary": "Experience the beauty of Epupa.",
    "heroImage": "/images/solly/flamingo11.jpg",
    "galleryImages": []
  },
  {
    "id": "r11",
    "name": "Kaokoland",
    "summary": "Experience the beauty of Kaokoland.",
    "heroImage": "/images/solly/flamingo11.jpg",
    "galleryImages": []
  },
  {
    "id": "r12",
    "name": "Luderitz",
    "summary": "Experience the beauty of Luderitz.",
    "heroImage": "/images/solly/flamingo5.jpg",
    "galleryImages": []
  },
  {
    "id": "r13",
    "name": "Kalahari",
    "summary": "Experience the beauty of Kalahari.",
    "heroImage": "/images/solly/flamingo2.jpg",
    "galleryImages": []
  },
  {
    "id": "r14",
    "name": "Caprivi",
    "summary": "Experience the beauty of Caprivi.",
    "heroImage": "/images/solly/flamingo8.jpg",
    "galleryImages": []
  },
  {
    "id": "r15",
    "name": "Canyon",
    "summary": "Experience the beauty of Canyon.",
    "heroImage": "/images/solly/flamingo1.jpg",
    "galleryImages": []
  },
  {
    "id": "r16",
    "name": "Opuwo",
    "summary": "Experience the beauty of Opuwo.",
    "heroImage": "/images/solly/flamingo5.jpg",
    "galleryImages": []
  }
];

export const mockLodges: Lodge[] = [
  {
    "id": "l1",
    "regionId": "r1",
    "name": "Acacia Guesthouse",
    "description": "Experience a premium stay at Acacia Guesthouse.",
    "heroImage": "/images/solly/flamingo1.jpg",
    "galleryImages": []
  },
  {
    "id": "l2",
    "regionId": "r1",
    "name": "Auas Safari Lodge",
    "description": "Experience a premium stay at Auas Safari Lodge.",
    "heroImage": "/images/solly/flamingo1.jpg",
    "galleryImages": []
  },
  {
    "id": "l3",
    "regionId": "r1",
    "name": "Am Weinberg Boutique Hotel",
    "description": "Experience a premium stay at Am Weinberg Boutique Hotel.",
    "heroImage": "/images/solly/flamingo8.jpg",
    "galleryImages": []
  },
  {
    "id": "l4",
    "regionId": "r1",
    "name": "Arebbusch Travel Lodge",
    "description": "Experience a premium stay at Arebbusch Travel Lodge.",
    "heroImage": "/images/solly/flamingo8.jpg",
    "galleryImages": []
  },
  {
    "id": "l5",
    "regionId": "r1",
    "name": "Avani Windhoek Hotel",
    "description": "Experience a premium stay at Avani Windhoek Hotel.",
    "heroImage": "/images/solly/flamingo5.jpg",
    "galleryImages": []
  },
  {
    "id": "l6",
    "regionId": "r1",
    "name": "Belvedere Boutique Hotel",
    "description": "Experience a premium stay at Belvedere Boutique Hotel.",
    "heroImage": "/images/solly/flamingo1.jpg",
    "galleryImages": []
  },
  {
    "id": "l7",
    "regionId": "r1",
    "name": "Olive Exclusive",
    "description": "Experience a premium stay at Olive Exclusive.",
    "heroImage": "/images/solly/flamingo8.jpg",
    "galleryImages": []
  },
  {
    "id": "l8",
    "regionId": "r1",
    "name": "Olive Grove Guesthouse",
    "description": "Experience a premium stay at Olive Grove Guesthouse.",
    "heroImage": "/images/solly/flamingo8.jpg",
    "galleryImages": []
  },
  {
    "id": "l9",
    "regionId": "r1",
    "name": "Windhoek Country Club Resort",
    "description": "Experience a premium stay at Windhoek Country Club Resort.",
    "heroImage": "/images/solly/flamingo8.jpg",
    "galleryImages": []
  },
  {
    "id": "l10",
    "regionId": "r1",
    "name": "Hotel Thule",
    "description": "Experience a premium stay at Hotel Thule.",
    "heroImage": "/images/solly/flamingo1.jpg",
    "galleryImages": []
  },
  {
    "id": "l11",
    "regionId": "r1",
    "name": "River Crossing Lodge",
    "description": "Experience a premium stay at River Crossing Lodge.",
    "heroImage": "/images/solly/flamingo1.jpg",
    "galleryImages": []
  },
  {
    "id": "l12",
    "regionId": "r1",
    "name": "Safari Court Hotel",
    "description": "Experience a premium stay at Safari Court Hotel.",
    "heroImage": "/images/solly/flamingo8.jpg",
    "galleryImages": []
  },
  {
    "id": "l13",
    "regionId": "r1",
    "name": "Safari Hotel",
    "description": "Experience a premium stay at Safari Hotel.",
    "heroImage": "/images/solly/flamingo8.jpg",
    "galleryImages": []
  },
  {
    "id": "l14",
    "regionId": "r1",
    "name": "Windhoek Luxury Guesthouse",
    "description": "Experience a premium stay at Windhoek Luxury Guesthouse.",
    "heroImage": "/images/solly/flamingo2.jpg",
    "galleryImages": []
  },
  {
    "id": "l15",
    "regionId": "r1",
    "name": "Roof of Africa Hotel",
    "description": "Experience a premium stay at Roof of Africa Hotel.",
    "heroImage": "/images/solly/flamingo8.jpg",
    "galleryImages": []
  },
  {
    "id": "l16",
    "regionId": "r1",
    "name": "Puccini House",
    "description": "Experience a premium stay at Puccini House.",
    "heroImage": "/images/solly/flamingo2.jpg",
    "galleryImages": []
  },
  {
    "id": "l17",
    "regionId": "r1",
    "name": "Londiningi Guesthouse",
    "description": "Experience a premium stay at Londiningi Guesthouse.",
    "heroImage": "/images/solly/flamingo5.jpg",
    "galleryImages": []
  },
  {
    "id": "l18",
    "regionId": "r1",
    "name": "Villa Violet Guesthouse",
    "description": "Experience a premium stay at Villa Violet Guesthouse.",
    "heroImage": "/images/solly/flamingo1.jpg",
    "galleryImages": []
  },
  {
    "id": "l19",
    "regionId": "r1",
    "name": "The Elegant Guesthouse",
    "description": "Experience a premium stay at The Elegant Guesthouse.",
    "heroImage": "/images/solly/flamingo4.jpg",
    "galleryImages": []
  },
  {
    "id": "l20",
    "regionId": "r1",
    "name": "GocheGanas Nature Reserve",
    "description": "Experience a premium stay at GocheGanas Nature Reserve.",
    "heroImage": "/images/solly/flamingo8.jpg",
    "galleryImages": []
  },
  {
    "id": "l21",
    "regionId": "r1",
    "name": "Naankuse Lodge",
    "description": "Experience a premium stay at Naankuse Lodge.",
    "heroImage": "/images/solly/flamingo8.jpg",
    "galleryImages": []
  },
  {
    "id": "l22",
    "regionId": "r1",
    "name": "Duesternbrook Safari Guest Farm",
    "description": "Experience a premium stay at Duesternbrook Safari Guest Farm.",
    "heroImage": "/images/solly/flamingo11.jpg",
    "galleryImages": []
  },
  {
    "id": "l23",
    "regionId": "r2",
    "name": "Sossusvlei Lodge",
    "description": "Experience a premium stay at Sossusvlei Lodge.",
    "heroImage": "/images/solly/flamingo11.jpg",
    "galleryImages": []
  },
  {
    "id": "l24",
    "regionId": "r2",
    "name": "Desert Camp",
    "description": "Experience a premium stay at Desert Camp.",
    "heroImage": "/images/solly/flamingo11.jpg",
    "galleryImages": []
  },
  {
    "id": "l25",
    "regionId": "r2",
    "name": "Desert Quiver Camp",
    "description": "Experience a premium stay at Desert Quiver Camp.",
    "heroImage": "/images/solly/flamingo1.jpg",
    "galleryImages": []
  },
  {
    "id": "l26",
    "regionId": "r2",
    "name": "Hoodia Lodge",
    "description": "Experience a premium stay at Hoodia Lodge.",
    "heroImage": "/images/solly/flamingo5.jpg",
    "galleryImages": []
  },
  {
    "id": "l27",
    "regionId": "r2",
    "name": "Moon Mountain Lodge",
    "description": "Experience a premium stay at Moon Mountain Lodge.",
    "heroImage": "/images/solly/flamingo5.jpg",
    "galleryImages": []
  },
  {
    "id": "l28",
    "regionId": "r2",
    "name": "Elegant Desert Lodge",
    "description": "Experience a premium stay at Elegant Desert Lodge.",
    "heroImage": "/images/solly/flamingo2.jpg",
    "galleryImages": []
  },
  {
    "id": "l29",
    "regionId": "r2",
    "name": "Desert Homestead Lodge",
    "description": "Experience a premium stay at Desert Homestead Lodge.",
    "heroImage": "/images/solly/flamingo5.jpg",
    "galleryImages": []
  },
  {
    "id": "l30",
    "regionId": "r2",
    "name": "Desert Homestead Outpost",
    "description": "Experience a premium stay at Desert Homestead Outpost.",
    "heroImage": "/images/solly/flamingo5.jpg",
    "galleryImages": []
  },
  {
    "id": "l31",
    "regionId": "r2",
    "name": "Le Mirage Resort & Spa",
    "description": "Experience a premium stay at Le Mirage Resort & Spa.",
    "heroImage": "/images/solly/flamingo11.jpg",
    "galleryImages": []
  },
  {
    "id": "l32",
    "regionId": "r2",
    "name": "Sossus Dune Lodge",
    "description": "Experience a premium stay at Sossus Dune Lodge.",
    "heroImage": "/images/solly/flamingo1.jpg",
    "galleryImages": []
  },
  {
    "id": "l33",
    "regionId": "r2",
    "name": "Wolwedans Dunes Lodge",
    "description": "Experience a premium stay at Wolwedans Dunes Lodge.",
    "heroImage": "/images/solly/flamingo1.jpg",
    "galleryImages": []
  },
  {
    "id": "l34",
    "regionId": "r2",
    "name": "Kulala Desert Lodge",
    "description": "Experience a premium stay at Kulala Desert Lodge.",
    "heroImage": "/images/solly/flamingo1.jpg",
    "galleryImages": []
  },
  {
    "id": "l35",
    "regionId": "r2",
    "name": "Little Kulala",
    "description": "Experience a premium stay at Little Kulala.",
    "heroImage": "/images/solly/flamingo1.jpg",
    "galleryImages": []
  },
  {
    "id": "l36",
    "regionId": "r2",
    "name": "Sossusvlei Desert Lodge",
    "description": "Experience a premium stay at Sossusvlei Desert Lodge.",
    "heroImage": "/images/solly/flamingo8.jpg",
    "galleryImages": []
  },
  {
    "id": "l37",
    "regionId": "r2",
    "name": "Agama River Camp",
    "description": "Experience a premium stay at Agama River Camp.",
    "heroImage": "/images/solly/flamingo2.jpg",
    "galleryImages": []
  },
  {
    "id": "l38",
    "regionId": "r2",
    "name": "Rostock Ritz Desert Lodge",
    "description": "Experience a premium stay at Rostock Ritz Desert Lodge.",
    "heroImage": "/images/solly/flamingo1.jpg",
    "galleryImages": []
  },
  {
    "id": "l39",
    "regionId": "r2",
    "name": "Solitaire Desert Farm",
    "description": "Experience a premium stay at Solitaire Desert Farm.",
    "heroImage": "/images/solly/flamingo2.jpg",
    "galleryImages": []
  },
  {
    "id": "l40",
    "regionId": "r3",
    "name": "Etosha Village",
    "description": "Experience a premium stay at Etosha Village.",
    "heroImage": "/images/solly/flamingo4.jpg",
    "galleryImages": []
  },
  {
    "id": "l41",
    "regionId": "r3",
    "name": "Etosha Safari Lodge",
    "description": "Experience a premium stay at Etosha Safari Lodge.",
    "heroImage": "/images/solly/flamingo11.jpg",
    "galleryImages": []
  },
  {
    "id": "l42",
    "regionId": "r3",
    "name": "Etosha Safari Camp",
    "description": "Experience a premium stay at Etosha Safari Camp.",
    "heroImage": "/images/solly/flamingo8.jpg",
    "galleryImages": []
  },
  {
    "id": "l43",
    "regionId": "r4",
    "name": "Mushara Lodge",
    "description": "Experience a premium stay at Mushara Lodge.",
    "heroImage": "/images/solly/flamingo5.jpg",
    "galleryImages": []
  },
  {
    "id": "l44",
    "regionId": "r4",
    "name": "Mushara Outpost",
    "description": "Experience a premium stay at Mushara Outpost.",
    "heroImage": "/images/solly/flamingo1.jpg",
    "galleryImages": []
  },
  {
    "id": "l45",
    "regionId": "r4",
    "name": "Mushara Villa",
    "description": "Experience a premium stay at Mushara Villa.",
    "heroImage": "/images/solly/flamingo1.jpg",
    "galleryImages": []
  },
  {
    "id": "l46",
    "regionId": "r4",
    "name": "Mokuti Etosha Lodge",
    "description": "Experience a premium stay at Mokuti Etosha Lodge.",
    "heroImage": "/images/solly/flamingo2.jpg",
    "galleryImages": []
  },
  {
    "id": "l47",
    "regionId": "r4",
    "name": "Onguma Bush Camp",
    "description": "Experience a premium stay at Onguma Bush Camp.",
    "heroImage": "/images/solly/flamingo8.jpg",
    "galleryImages": []
  },
  {
    "id": "l48",
    "regionId": "r4",
    "name": "Onguma Tented Camp",
    "description": "Experience a premium stay at Onguma Tented Camp.",
    "heroImage": "/images/solly/flamingo5.jpg",
    "galleryImages": []
  },
  {
    "id": "l49",
    "regionId": "r4",
    "name": "Onguma Tree Top",
    "description": "Experience a premium stay at Onguma Tree Top.",
    "heroImage": "/images/solly/flamingo2.jpg",
    "galleryImages": []
  },
  {
    "id": "l50",
    "regionId": "r4",
    "name": "Onguma The Fort",
    "description": "Experience a premium stay at Onguma The Fort.",
    "heroImage": "/images/solly/flamingo11.jpg",
    "galleryImages": []
  },
  {
    "id": "l51",
    "regionId": "r3",
    "name": "Toshari Lodge",
    "description": "Experience a premium stay at Toshari Lodge.",
    "heroImage": "/images/solly/flamingo11.jpg",
    "galleryImages": []
  },
  {
    "id": "l52",
    "regionId": "r3",
    "name": "Etosha Gateway",
    "description": "Experience a premium stay at Etosha Gateway.",
    "heroImage": "/images/solly/flamingo2.jpg",
    "galleryImages": []
  },
  {
    "id": "l53",
    "regionId": "r4",
    "name": "Etosha King Nehale",
    "description": "Experience a premium stay at Etosha King Nehale.",
    "heroImage": "/images/solly/flamingo11.jpg",
    "galleryImages": []
  },
  {
    "id": "l54",
    "regionId": "r4",
    "name": "Namutoni Resort",
    "description": "Experience a premium stay at Namutoni Resort.",
    "heroImage": "/images/solly/flamingo8.jpg",
    "galleryImages": []
  },
  {
    "id": "l55",
    "regionId": "r3",
    "name": "Halali Resort",
    "description": "Experience a premium stay at Halali Resort.",
    "heroImage": "/images/solly/flamingo2.jpg",
    "galleryImages": []
  },
  {
    "id": "l56",
    "regionId": "r3",
    "name": "Okaukuejo Resort",
    "description": "Experience a premium stay at Okaukuejo Resort.",
    "heroImage": "/images/solly/flamingo5.jpg",
    "galleryImages": []
  },
  {
    "id": "l57",
    "regionId": "r3",
    "name": "Eagle Tented Lodge",
    "description": "Experience a premium stay at Eagle Tented Lodge.",
    "heroImage": "/images/solly/flamingo4.jpg",
    "galleryImages": []
  },
  {
    "id": "l58",
    "regionId": "r3",
    "name": "Epacha Game Lodge",
    "description": "Experience a premium stay at Epacha Game Lodge.",
    "heroImage": "/images/solly/flamingo8.jpg",
    "galleryImages": []
  },
  {
    "id": "l59",
    "regionId": "r3",
    "name": "Bambatsi Guest Farm",
    "description": "Experience a premium stay at Bambatsi Guest Farm.",
    "heroImage": "/images/solly/flamingo5.jpg",
    "galleryImages": []
  },
  {
    "id": "l60",
    "regionId": "r5",
    "name": "Gabuse Guest House",
    "description": "Experience a premium stay at Gabuse Guest House.",
    "heroImage": "/images/solly/flamingo4.jpg",
    "galleryImages": []
  },
  {
    "id": "l61",
    "regionId": "r5",
    "name": "Khorab Safari Lodge",
    "description": "Experience a premium stay at Khorab Safari Lodge.",
    "heroImage": "/images/solly/flamingo2.jpg",
    "galleryImages": []
  },
  {
    "id": "l62",
    "regionId": "r6",
    "name": "Hansa Hotel",
    "description": "Experience a premium stay at Hansa Hotel.",
    "heroImage": "/images/solly/flamingo5.jpg",
    "galleryImages": []
  },
  {
    "id": "l63",
    "regionId": "r6",
    "name": "Strand Hotel Swakopmund",
    "description": "Experience a premium stay at Strand Hotel Swakopmund.",
    "heroImage": "/images/solly/flamingo2.jpg",
    "galleryImages": []
  },
  {
    "id": "l64",
    "regionId": "r6",
    "name": "The Delight Swakopmund",
    "description": "Experience a premium stay at The Delight Swakopmund.",
    "heroImage": "/images/solly/flamingo4.jpg",
    "galleryImages": []
  },
  {
    "id": "l65",
    "regionId": "r6",
    "name": "Swakopmund Hotel",
    "description": "Experience a premium stay at Swakopmund Hotel.",
    "heroImage": "/images/solly/flamingo11.jpg",
    "galleryImages": []
  },
  {
    "id": "l66",
    "regionId": "r6",
    "name": "Beach Hotel Swakopmund",
    "description": "Experience a premium stay at Beach Hotel Swakopmund.",
    "heroImage": "/images/solly/flamingo1.jpg",
    "galleryImages": []
  },
  {
    "id": "l67",
    "regionId": "r6",
    "name": "Pelican Bay Hotel",
    "description": "Experience a premium stay at Pelican Bay Hotel.",
    "heroImage": "/images/solly/flamingo5.jpg",
    "galleryImages": []
  },
  {
    "id": "l68",
    "regionId": "r7",
    "name": "Shipwreck Lodge",
    "description": "Experience a premium stay at Shipwreck Lodge.",
    "heroImage": "/images/solly/flamingo8.jpg",
    "galleryImages": []
  },
  {
    "id": "l69",
    "regionId": "r6",
    "name": "Protea Hotel Walvis Bay",
    "description": "Experience a premium stay at Protea Hotel Walvis Bay.",
    "heroImage": "/images/solly/flamingo4.jpg",
    "galleryImages": []
  },
  {
    "id": "l70",
    "regionId": "r6",
    "name": "Burning Shore Lodge",
    "description": "Experience a premium stay at Burning Shore Lodge.",
    "heroImage": "/images/solly/flamingo2.jpg",
    "galleryImages": []
  },
  {
    "id": "l71",
    "regionId": "r8",
    "name": "Damaraland Camp",
    "description": "Experience a premium stay at Damaraland Camp.",
    "heroImage": "/images/solly/flamingo2.jpg",
    "galleryImages": []
  },
  {
    "id": "l72",
    "regionId": "r8",
    "name": "Mowani Mountain Camp",
    "description": "Experience a premium stay at Mowani Mountain Camp.",
    "heroImage": "/images/solly/flamingo5.jpg",
    "galleryImages": []
  },
  {
    "id": "l73",
    "regionId": "r8",
    "name": "Camp Kipwe",
    "description": "Experience a premium stay at Camp Kipwe.",
    "heroImage": "/images/solly/flamingo1.jpg",
    "galleryImages": []
  },
  {
    "id": "l74",
    "regionId": "r8",
    "name": "Grootberg Lodge",
    "description": "Experience a premium stay at Grootberg Lodge.",
    "heroImage": "/images/solly/flamingo5.jpg",
    "galleryImages": []
  },
  {
    "id": "l75",
    "regionId": "r8",
    "name": "Hoada Campsite",
    "description": "Experience a premium stay at Hoada Campsite.",
    "heroImage": "/images/solly/flamingo11.jpg",
    "galleryImages": []
  },
  {
    "id": "l76",
    "regionId": "r9",
    "name": "Hobatere Lodge",
    "description": "Experience a premium stay at Hobatere Lodge.",
    "heroImage": "/images/solly/flamingo1.jpg",
    "galleryImages": []
  },
  {
    "id": "l77",
    "regionId": "r8",
    "name": "Palmwag Lodge",
    "description": "Experience a premium stay at Palmwag Lodge.",
    "heroImage": "/images/solly/flamingo11.jpg",
    "galleryImages": []
  },
  {
    "id": "l78",
    "regionId": "r8",
    "name": "Twyfelfontein Country Lodge",
    "description": "Experience a premium stay at Twyfelfontein Country Lodge.",
    "heroImage": "/images/solly/flamingo4.jpg",
    "galleryImages": []
  },
  {
    "id": "l79",
    "regionId": "r8",
    "name": "Doro Nawas Camp",
    "description": "Experience a premium stay at Doro Nawas Camp.",
    "heroImage": "/images/solly/flamingo4.jpg",
    "galleryImages": []
  },
  {
    "id": "l80",
    "regionId": "r8",
    "name": "Vingerklip Lodge",
    "description": "Experience a premium stay at Vingerklip Lodge.",
    "heroImage": "/images/solly/flamingo4.jpg",
    "galleryImages": []
  },
  {
    "id": "l81",
    "regionId": "r8",
    "name": "Huab Lodge",
    "description": "Experience a premium stay at Huab Lodge.",
    "heroImage": "/images/solly/flamingo11.jpg",
    "galleryImages": []
  },
  {
    "id": "l82",
    "regionId": "r8",
    "name": "Ugab Terrace Lodge",
    "description": "Experience a premium stay at Ugab Terrace Lodge.",
    "heroImage": "/images/solly/flamingo4.jpg",
    "galleryImages": []
  },
  {
    "id": "l83",
    "regionId": "r8",
    "name": "Ondjamba Hills",
    "description": "Experience a premium stay at Ondjamba Hills.",
    "heroImage": "/images/solly/flamingo1.jpg",
    "galleryImages": []
  },
  {
    "id": "l84",
    "regionId": "r10",
    "name": "Epupa Camp",
    "description": "Experience a premium stay at Epupa Camp.",
    "heroImage": "/images/solly/flamingo5.jpg",
    "galleryImages": []
  },
  {
    "id": "l85",
    "regionId": "r10",
    "name": "Omarunga Epupa Falls Camp",
    "description": "Experience a premium stay at Omarunga Epupa Falls Camp.",
    "heroImage": "/images/solly/flamingo2.jpg",
    "galleryImages": []
  },
  {
    "id": "l86",
    "regionId": "r10",
    "name": "Kapika Waterfall Lodge",
    "description": "Experience a premium stay at Kapika Waterfall Lodge.",
    "heroImage": "/images/solly/flamingo5.jpg",
    "galleryImages": []
  },
  {
    "id": "l87",
    "regionId": "r11",
    "name": "Okahirongo Elephant Lodge",
    "description": "Experience a premium stay at Okahirongo Elephant Lodge.",
    "heroImage": "/images/solly/flamingo8.jpg",
    "galleryImages": []
  },
  {
    "id": "l88",
    "regionId": "r11",
    "name": "Okahirongo River Camp",
    "description": "Experience a premium stay at Okahirongo River Camp.",
    "heroImage": "/images/solly/flamingo4.jpg",
    "galleryImages": []
  },
  {
    "id": "l89",
    "regionId": "r11",
    "name": "Khowarib Lodge",
    "description": "Experience a premium stay at Khowarib Lodge.",
    "heroImage": "/images/solly/flamingo8.jpg",
    "galleryImages": []
  },
  {
    "id": "l90",
    "regionId": "r11",
    "name": "Sesfontein Guesthouse",
    "description": "Experience a premium stay at Sesfontein Guesthouse.",
    "heroImage": "/images/solly/flamingo5.jpg",
    "galleryImages": []
  },
  {
    "id": "l91",
    "regionId": "r6",
    "name": "Desert Breeze Lodge",
    "description": "Experience a premium stay at Desert Breeze Lodge.",
    "heroImage": "/images/solly/flamingo2.jpg",
    "galleryImages": []
  },
  {
    "id": "l92",
    "regionId": "r6",
    "name": "Hotel Pension A la Mer",
    "description": "Experience a premium stay at Hotel Pension A la Mer.",
    "heroImage": "/images/solly/flamingo11.jpg",
    "galleryImages": []
  },
  {
    "id": "l93",
    "regionId": "r6",
    "name": "Hotel Zum Kaiser",
    "description": "Experience a premium stay at Hotel Zum Kaiser.",
    "heroImage": "/images/solly/flamingo4.jpg",
    "galleryImages": []
  },
  {
    "id": "l94",
    "regionId": "r6",
    "name": "Sea Breeze Guesthouse",
    "description": "Experience a premium stay at Sea Breeze Guesthouse.",
    "heroImage": "/images/solly/flamingo5.jpg",
    "galleryImages": []
  },
  {
    "id": "l95",
    "regionId": "r6",
    "name": "Flamingo Villa Boutique Hotel",
    "description": "Experience a premium stay at Flamingo Villa Boutique Hotel.",
    "heroImage": "/images/solly/flamingo1.jpg",
    "galleryImages": []
  },
  {
    "id": "l96",
    "regionId": "r12",
    "name": "Luderitz Nest Hotel",
    "description": "Experience a premium stay at Luderitz Nest Hotel.",
    "heroImage": "/images/solly/flamingo1.jpg",
    "galleryImages": []
  },
  {
    "id": "l97",
    "regionId": "r12",
    "name": "Kairos Cottage",
    "description": "Experience a premium stay at Kairos Cottage.",
    "heroImage": "/images/solly/flamingo5.jpg",
    "galleryImages": []
  },
  {
    "id": "l98",
    "regionId": "r12",
    "name": "Island Cottage",
    "description": "Experience a premium stay at Island Cottage.",
    "heroImage": "/images/solly/flamingo1.jpg",
    "galleryImages": []
  },
  {
    "id": "l99",
    "regionId": "r12",
    "name": "Luderitz Backpackers",
    "description": "Experience a premium stay at Luderitz Backpackers.",
    "heroImage": "/images/solly/flamingo8.jpg",
    "galleryImages": []
  },
  {
    "id": "l100",
    "regionId": "r12",
    "name": "Shark Island Resort",
    "description": "Experience a premium stay at Shark Island Resort.",
    "heroImage": "/images/solly/flamingo1.jpg",
    "galleryImages": []
  },
  {
    "id": "l101",
    "regionId": "r13",
    "name": "Bagatelle Kalahari Game Ranch",
    "description": "Experience a premium stay at Bagatelle Kalahari Game Ranch.",
    "heroImage": "/images/solly/flamingo5.jpg",
    "galleryImages": []
  },
  {
    "id": "l102",
    "regionId": "r13",
    "name": "Kalahari Anib Lodge",
    "description": "Experience a premium stay at Kalahari Anib Lodge.",
    "heroImage": "/images/solly/flamingo2.jpg",
    "galleryImages": []
  },
  {
    "id": "l103",
    "regionId": "r13",
    "name": "Kalahari Farmhouse",
    "description": "Experience a premium stay at Kalahari Farmhouse.",
    "heroImage": "/images/solly/flamingo2.jpg",
    "galleryImages": []
  },
  {
    "id": "l104",
    "regionId": "r13",
    "name": "Camelthorn Kalahari Lodge",
    "description": "Experience a premium stay at Camelthorn Kalahari Lodge.",
    "heroImage": "/images/solly/flamingo1.jpg",
    "galleryImages": []
  },
  {
    "id": "l105",
    "regionId": "r13",
    "name": "Zebra Kalahari Lodge",
    "description": "Experience a premium stay at Zebra Kalahari Lodge.",
    "heroImage": "/images/solly/flamingo1.jpg",
    "galleryImages": []
  },
  {
    "id": "l106",
    "regionId": "r13",
    "name": "Suricate Tented Kalahari Lodge",
    "description": "Experience a premium stay at Suricate Tented Kalahari Lodge.",
    "heroImage": "/images/solly/flamingo11.jpg",
    "galleryImages": []
  },
  {
    "id": "l107",
    "regionId": "r13",
    "name": "Lapa Lange Game Lodge",
    "description": "Experience a premium stay at Lapa Lange Game Lodge.",
    "heroImage": "/images/solly/flamingo11.jpg",
    "galleryImages": []
  },
  {
    "id": "l108",
    "regionId": "r13",
    "name": "Anib Lodge",
    "description": "Experience a premium stay at Anib Lodge.",
    "heroImage": "/images/solly/flamingo4.jpg",
    "galleryImages": []
  },
  {
    "id": "l109",
    "regionId": "r13",
    "name": "Intu Afrika Camelthorn Lodge",
    "description": "Experience a premium stay at Intu Afrika Camelthorn Lodge.",
    "heroImage": "/images/solly/flamingo5.jpg",
    "galleryImages": []
  },
  {
    "id": "l110",
    "regionId": "r5",
    "name": "Okonjima Plains Camp",
    "description": "Experience a premium stay at Okonjima Plains Camp.",
    "heroImage": "/images/solly/flamingo4.jpg",
    "galleryImages": []
  },
  {
    "id": "l111",
    "regionId": "r5",
    "name": "Okonjima Bush Camp",
    "description": "Experience a premium stay at Okonjima Bush Camp.",
    "heroImage": "/images/solly/flamingo1.jpg",
    "galleryImages": []
  },
  {
    "id": "l112",
    "regionId": "r5",
    "name": "Waterberg Plateau Lodge",
    "description": "Experience a premium stay at Waterberg Plateau Lodge.",
    "heroImage": "/images/solly/flamingo8.jpg",
    "galleryImages": []
  },
  {
    "id": "l113",
    "regionId": "r5",
    "name": "Waterberg Wilderness",
    "description": "Experience a premium stay at Waterberg Wilderness.",
    "heroImage": "/images/solly/flamingo2.jpg",
    "galleryImages": []
  },
  {
    "id": "l114",
    "regionId": "r5",
    "name": "Waterberg Valley Lodge",
    "description": "Experience a premium stay at Waterberg Valley Lodge.",
    "heroImage": "/images/solly/flamingo4.jpg",
    "galleryImages": []
  },
  {
    "id": "l115",
    "regionId": "r5",
    "name": "Mount Etjo Safari Lodge",
    "description": "Experience a premium stay at Mount Etjo Safari Lodge.",
    "heroImage": "/images/solly/flamingo1.jpg",
    "galleryImages": []
  },
  {
    "id": "l116",
    "regionId": "r5",
    "name": "Frans Indongo Lodge",
    "description": "Experience a premium stay at Frans Indongo Lodge.",
    "heroImage": "/images/solly/flamingo5.jpg",
    "galleryImages": []
  },
  {
    "id": "l117",
    "regionId": "r5",
    "name": "Otjiwa Safari Lodge",
    "description": "Experience a premium stay at Otjiwa Safari Lodge.",
    "heroImage": "/images/solly/flamingo8.jpg",
    "galleryImages": []
  },
  {
    "id": "l118",
    "regionId": "r5",
    "name": "Epako Safari Lodge",
    "description": "Experience a premium stay at Epako Safari Lodge.",
    "heroImage": "/images/solly/flamingo8.jpg",
    "galleryImages": []
  },
  {
    "id": "l119",
    "regionId": "r5",
    "name": "Erongo Plateau Camp",
    "description": "Experience a premium stay at Erongo Plateau Camp.",
    "heroImage": "/images/solly/flamingo11.jpg",
    "galleryImages": []
  },
  {
    "id": "l120",
    "regionId": "r5",
    "name": "Okahandja Country Hotel",
    "description": "Experience a premium stay at Okahandja Country Hotel.",
    "heroImage": "/images/solly/flamingo2.jpg",
    "galleryImages": []
  },
  {
    "id": "l121",
    "regionId": "r5",
    "name": "Midgard Country Estate",
    "description": "Experience a premium stay at Midgard Country Estate.",
    "heroImage": "/images/solly/flamingo1.jpg",
    "galleryImages": []
  },
  {
    "id": "l122",
    "regionId": "r13",
    "name": "Zelda Game & Guest Farm",
    "description": "Experience a premium stay at Zelda Game & Guest Farm.",
    "heroImage": "/images/solly/flamingo4.jpg",
    "galleryImages": []
  },
  {
    "id": "l123",
    "regionId": "r13",
    "name": "Kalahari Bush Breaks",
    "description": "Experience a premium stay at Kalahari Bush Breaks.",
    "heroImage": "/images/solly/flamingo11.jpg",
    "galleryImages": []
  },
  {
    "id": "l124",
    "regionId": "r5",
    "name": "Minen Hotel",
    "description": "Experience a premium stay at Minen Hotel.",
    "heroImage": "/images/solly/flamingo2.jpg",
    "galleryImages": []
  },
  {
    "id": "l125",
    "regionId": "r5",
    "name": "Uris Safari Lodge",
    "description": "Experience a premium stay at Uris Safari Lodge.",
    "heroImage": "/images/solly/flamingo8.jpg",
    "galleryImages": []
  },
  {
    "id": "l126",
    "regionId": "r5",
    "name": "Tsumeb Guesthouse",
    "description": "Experience a premium stay at Tsumeb Guesthouse.",
    "heroImage": "/images/solly/flamingo11.jpg",
    "galleryImages": []
  },
  {
    "id": "l127",
    "regionId": "r14",
    "name": "Tambuti Lodge",
    "description": "Experience a premium stay at Tambuti Lodge.",
    "heroImage": "/images/solly/flamingo2.jpg",
    "galleryImages": []
  },
  {
    "id": "l128",
    "regionId": "r14",
    "name": "Kayova River Lodge",
    "description": "Experience a premium stay at Kayova River Lodge.",
    "heroImage": "/images/solly/flamingo4.jpg",
    "galleryImages": []
  },
  {
    "id": "l129",
    "regionId": "r14",
    "name": "Ngandu Safari Lodge",
    "description": "Experience a premium stay at Ngandu Safari Lodge.",
    "heroImage": "/images/solly/flamingo5.jpg",
    "galleryImages": []
  },
  {
    "id": "l130",
    "regionId": "r14",
    "name": "Mazambala Island Lodge",
    "description": "Experience a premium stay at Mazambala Island Lodge.",
    "heroImage": "/images/solly/flamingo4.jpg",
    "galleryImages": []
  },
  {
    "id": "l131",
    "regionId": "r14",
    "name": "Camp Kwando",
    "description": "Experience a premium stay at Camp Kwando.",
    "heroImage": "/images/solly/flamingo5.jpg",
    "galleryImages": []
  },
  {
    "id": "l132",
    "regionId": "r14",
    "name": "Lianshulu Lodge",
    "description": "Experience a premium stay at Lianshulu Lodge.",
    "heroImage": "/images/solly/flamingo4.jpg",
    "galleryImages": []
  },
  {
    "id": "l133",
    "regionId": "r14",
    "name": "Lianshulu Bush Lodge",
    "description": "Experience a premium stay at Lianshulu Bush Lodge.",
    "heroImage": "/images/solly/flamingo1.jpg",
    "galleryImages": []
  },
  {
    "id": "l134",
    "regionId": "r14",
    "name": "Mudumu River Camp",
    "description": "Experience a premium stay at Mudumu River Camp.",
    "heroImage": "/images/solly/flamingo2.jpg",
    "galleryImages": []
  },
  {
    "id": "l135",
    "regionId": "r13",
    "name": "Burgsdorf Guest Farm",
    "description": "Experience a premium stay at Burgsdorf Guest Farm.",
    "heroImage": "/images/solly/flamingo8.jpg",
    "galleryImages": []
  },
  {
    "id": "l136",
    "regionId": "r13",
    "name": "Helmeringhausen Hotel",
    "description": "Experience a premium stay at Helmeringhausen Hotel.",
    "heroImage": "/images/solly/flamingo4.jpg",
    "galleryImages": []
  },
  {
    "id": "l137",
    "regionId": "r13",
    "name": "Namibgrens Guest Farm",
    "description": "Experience a premium stay at Namibgrens Guest Farm.",
    "heroImage": "/images/solly/flamingo11.jpg",
    "galleryImages": []
  },
  {
    "id": "l138",
    "regionId": "r15",
    "name": "Seeheim Hotel",
    "description": "Experience a premium stay at Seeheim Hotel.",
    "heroImage": "/images/solly/flamingo5.jpg",
    "galleryImages": []
  },
  {
    "id": "l139",
    "regionId": "r15",
    "name": "Garas Park Quivertree",
    "description": "Experience a premium stay at Garas Park Quivertree.",
    "heroImage": "/images/solly/flamingo2.jpg",
    "galleryImages": []
  },
  {
    "id": "l140",
    "regionId": "r7",
    "name": "Terrace Bay Resort",
    "description": "Experience a premium stay at Terrace Bay Resort.",
    "heroImage": "/images/solly/flamingo8.jpg",
    "galleryImages": []
  },
  {
    "id": "l141",
    "regionId": "r7",
    "name": "Torra Bay Campsite",
    "description": "Experience a premium stay at Torra Bay Campsite.",
    "heroImage": "/images/solly/flamingo5.jpg",
    "galleryImages": []
  },
  {
    "id": "l142",
    "regionId": "r6",
    "name": "Henties Bay Caravan Park",
    "description": "Experience a premium stay at Henties Bay Caravan Park.",
    "heroImage": "/images/solly/flamingo8.jpg",
    "galleryImages": []
  },
  {
    "id": "l143",
    "regionId": "r7",
    "name": "Cape Cross Lodge",
    "description": "Experience a premium stay at Cape Cross Lodge.",
    "heroImage": "/images/solly/flamingo4.jpg",
    "galleryImages": []
  },
  {
    "id": "l144",
    "regionId": "r11",
    "name": "Okahirongo Elephant Lodge (Luxury)",
    "description": "Experience a premium stay at Okahirongo Elephant Lodge (Luxury).",
    "heroImage": "/images/solly/flamingo2.jpg",
    "galleryImages": []
  },
  {
    "id": "l145",
    "regionId": "r11",
    "name": "Purros Bush Camp",
    "description": "Experience a premium stay at Purros Bush Camp.",
    "heroImage": "/images/solly/flamingo4.jpg",
    "galleryImages": []
  },
  {
    "id": "l146",
    "regionId": "r16",
    "name": "Opuwo Country Lodge",
    "description": "Experience a premium stay at Opuwo Country Lodge.",
    "heroImage": "/images/solly/flamingo11.jpg",
    "galleryImages": []
  },
  {
    "id": "l147",
    "regionId": "r3",
    "name": "Ombinda Country Lodge",
    "description": "Experience a premium stay at Ombinda Country Lodge.",
    "heroImage": "/images/solly/flamingo1.jpg",
    "galleryImages": []
  },
  {
    "id": "l148",
    "regionId": "r14",
    "name": "Namushasha River Camping2go",
    "description": "Experience a premium stay at Namushasha River Camping2go.",
    "heroImage": "/images/solly/flamingo8.jpg",
    "galleryImages": []
  },
  {
    "id": "l149",
    "regionId": "r14",
    "name": "Zambezi Mubala Camping2go",
    "description": "Experience a premium stay at Zambezi Mubala Camping2go.",
    "heroImage": "/images/solly/flamingo4.jpg",
    "galleryImages": []
  },
  {
    "id": "l150",
    "regionId": "r14",
    "name": "Chobe Savannah Lodge",
    "description": "Experience a premium stay at Chobe Savannah Lodge.",
    "heroImage": "/images/solly/flamingo1.jpg",
    "galleryImages": []
  },
  {
    "id": "l151",
    "regionId": "r14",
    "name": "Impalila Island Lodge",
    "description": "Experience a premium stay at Impalila Island Lodge.",
    "heroImage": "/images/solly/flamingo2.jpg",
    "galleryImages": []
  },
  {
    "id": "l152",
    "regionId": "r14",
    "name": "Ichingo Chobe River Lodge",
    "description": "Experience a premium stay at Ichingo Chobe River Lodge.",
    "heroImage": "/images/solly/flamingo11.jpg",
    "galleryImages": []
  },
  {
    "id": "l153",
    "regionId": "r2",
    "name": "Solitaire Camping2go",
    "description": "Experience a premium stay at Solitaire Camping2go.",
    "heroImage": "/images/solly/flamingo2.jpg",
    "galleryImages": []
  },
  {
    "id": "l154",
    "regionId": "r2",
    "name": "Agama Camping",
    "description": "Experience a premium stay at Agama Camping.",
    "heroImage": "/images/solly/flamingo8.jpg",
    "galleryImages": []
  },
  {
    "id": "l155",
    "regionId": "r3",
    "name": "Etosha Village Camping2go",
    "description": "Experience a premium stay at Etosha Village Camping2go.",
    "heroImage": "/images/solly/flamingo1.jpg",
    "galleryImages": []
  },
  {
    "id": "l156",
    "regionId": "r2",
    "name": "Sossusvlei Lodge Adventure Camp",
    "description": "Experience a premium stay at Sossusvlei Lodge Adventure Camp.",
    "heroImage": "/images/solly/flamingo2.jpg",
    "galleryImages": []
  },
  {
    "id": "l157",
    "regionId": "r2",
    "name": "Desert Camp Camping",
    "description": "Experience a premium stay at Desert Camp Camping.",
    "heroImage": "/images/solly/flamingo4.jpg",
    "galleryImages": []
  },
  {
    "id": "l158",
    "regionId": "r5",
    "name": "Otjiwarongo Guesthouse",
    "description": "Experience a premium stay at Otjiwarongo Guesthouse.",
    "heroImage": "/images/solly/flamingo2.jpg",
    "galleryImages": []
  },
  {
    "id": "l159",
    "regionId": "r5",
    "name": "C'est Si Bon Hotel",
    "description": "Experience a premium stay at C'est Si Bon Hotel.",
    "heroImage": "/images/solly/flamingo5.jpg",
    "galleryImages": []
  },
  {
    "id": "l160",
    "regionId": "r5",
    "name": "Kamaku Guesthouse",
    "description": "Experience a premium stay at Kamaku Guesthouse.",
    "heroImage": "/images/solly/flamingo1.jpg",
    "galleryImages": []
  },
  {
    "id": "l161",
    "regionId": "r5",
    "name": "Hadassa Guesthouse",
    "description": "Experience a premium stay at Hadassa Guesthouse.",
    "heroImage": "/images/solly/flamingo1.jpg",
    "galleryImages": []
  },
  {
    "id": "l162",
    "regionId": "r5",
    "name": "Casa Forno Guesthouse",
    "description": "Experience a premium stay at Casa Forno Guesthouse.",
    "heroImage": "/images/solly/flamingo11.jpg",
    "galleryImages": []
  },
  {
    "id": "l163",
    "regionId": "r5",
    "name": "Tsumeb Guesthouse Garden",
    "description": "Experience a premium stay at Tsumeb Guesthouse Garden.",
    "heroImage": "/images/solly/flamingo1.jpg",
    "galleryImages": []
  },
  {
    "id": "l164",
    "regionId": "r5",
    "name": "Kupferquelle Resort",
    "description": "Experience a premium stay at Kupferquelle Resort.",
    "heroImage": "/images/solly/flamingo2.jpg",
    "galleryImages": []
  },
  {
    "id": "l165",
    "regionId": "r8",
    "name": "Khorixas Lodge",
    "description": "Experience a premium stay at Khorixas Lodge.",
    "heroImage": "/images/solly/flamingo2.jpg",
    "galleryImages": []
  },
  {
    "id": "l166",
    "regionId": "r8",
    "name": "iGowati Country Hotel",
    "description": "Experience a premium stay at iGowati Country Hotel.",
    "heroImage": "/images/solly/flamingo2.jpg",
    "galleryImages": []
  },
  {
    "id": "l167",
    "regionId": "r14",
    "name": "Shametu River Lodge",
    "description": "Experience a premium stay at Shametu River Lodge.",
    "heroImage": "/images/solly/flamingo8.jpg",
    "galleryImages": []
  },
  {
    "id": "l168",
    "regionId": "r14",
    "name": "Popa Falls Resort",
    "description": "Experience a premium stay at Popa Falls Resort.",
    "heroImage": "/images/solly/flamingo8.jpg",
    "galleryImages": []
  },
  {
    "id": "l169",
    "regionId": "r14",
    "name": "Nunda River Lodge",
    "description": "Experience a premium stay at Nunda River Lodge.",
    "heroImage": "/images/solly/flamingo8.jpg",
    "galleryImages": []
  },
  {
    "id": "l170",
    "regionId": "r14",
    "name": "Mahangu Safari Lodge",
    "description": "Experience a premium stay at Mahangu Safari Lodge.",
    "heroImage": "/images/solly/flamingo1.jpg",
    "galleryImages": []
  },
  {
    "id": "l171",
    "regionId": "r14",
    "name": "Ndhovu Safari Lodge",
    "description": "Experience a premium stay at Ndhovu Safari Lodge.",
    "heroImage": "/images/solly/flamingo1.jpg",
    "galleryImages": []
  },
  {
    "id": "l172",
    "regionId": "r13",
    "name": "Gibeon Folk Hotel",
    "description": "Experience a premium stay at Gibeon Folk Hotel.",
    "heroImage": "/images/solly/flamingo5.jpg",
    "galleryImages": []
  },
  {
    "id": "l173",
    "regionId": "r15",
    "name": "Garas Park",
    "description": "Experience a premium stay at Garas Park.",
    "heroImage": "/images/solly/flamingo11.jpg",
    "galleryImages": []
  },
  {
    "id": "l174",
    "regionId": "r15",
    "name": "Seeheim Hotel (Adventure)",
    "description": "Experience a premium stay at Seeheim Hotel (Adventure).",
    "heroImage": "/images/solly/flamingo1.jpg",
    "galleryImages": []
  },
  {
    "id": "l175",
    "regionId": "r15",
    "name": "Bethanie Guesthouse",
    "description": "Experience a premium stay at Bethanie Guesthouse.",
    "heroImage": "/images/solly/flamingo2.jpg",
    "galleryImages": []
  },
  {
    "id": "l176",
    "regionId": "r13",
    "name": "Duwisib Guest Farm",
    "description": "Experience a premium stay at Duwisib Guest Farm.",
    "heroImage": "/images/solly/flamingo5.jpg",
    "galleryImages": []
  },
  {
    "id": "l177",
    "regionId": "r2",
    "name": "Greenfire Desert Lodge",
    "description": "Experience a premium stay at Greenfire Desert Lodge.",
    "heroImage": "/images/solly/flamingo2.jpg",
    "galleryImages": []
  },
  {
    "id": "l178",
    "regionId": "r2",
    "name": "Kanaan Desert Retreat",
    "description": "Experience a premium stay at Kanaan Desert Retreat.",
    "heroImage": "/images/solly/flamingo5.jpg",
    "galleryImages": []
  },
  {
    "id": "l179",
    "regionId": "r13",
    "name": "Africa Safari Lodge",
    "description": "Experience a premium stay at Africa Safari Lodge.",
    "heroImage": "/images/solly/flamingo8.jpg",
    "galleryImages": []
  },
  {
    "id": "l180",
    "regionId": "r2",
    "name": "Agama Lodge",
    "description": "Experience a premium stay at Agama Lodge.",
    "heroImage": "/images/solly/flamingo11.jpg",
    "galleryImages": []
  },
  {
    "id": "l181",
    "regionId": "r5",
    "name": "Aloegrove Safari Lodge",
    "description": "Experience a premium stay at Aloegrove Safari Lodge.",
    "heroImage": "/images/solly/flamingo11.jpg",
    "galleryImages": []
  },
  {
    "id": "l182",
    "regionId": "r15",
    "name": "Alte Kalkofen Lodge",
    "description": "Experience a premium stay at Alte Kalkofen Lodge.",
    "heroImage": "/images/solly/flamingo8.jpg",
    "galleryImages": []
  },
  {
    "id": "l183",
    "regionId": "r12",
    "name": "Alte Villa 2025",
    "description": "Experience a premium stay at Alte Villa 2025.",
    "heroImage": "/images/solly/flamingo11.jpg",
    "galleryImages": []
  },
  {
    "id": "l184",
    "regionId": "r6",
    "name": "Atlantic Villa",
    "description": "Experience a premium stay at Atlantic Villa.",
    "heroImage": "/images/solly/flamingo8.jpg",
    "galleryImages": []
  },
  {
    "id": "l185",
    "regionId": "r13",
    "name": "Auob Country Lodge",
    "description": "Experience a premium stay at Auob Country Lodge.",
    "heroImage": "/images/solly/flamingo1.jpg",
    "galleryImages": []
  },
  {
    "id": "l186",
    "regionId": "r15",
    "name": "Bahnhof Hotel Aus",
    "description": "Experience a premium stay at Bahnhof Hotel Aus.",
    "heroImage": "/images/solly/flamingo2.jpg",
    "galleryImages": []
  },
  {
    "id": "l187",
    "regionId": "r2",
    "name": "Barkhan Dune Retreat",
    "description": "Experience a premium stay at Barkhan Dune Retreat.",
    "heroImage": "/images/solly/flamingo2.jpg",
    "galleryImages": []
  },
  {
    "id": "l188",
    "regionId": "r1",
    "name": "Droombos",
    "description": "Experience a premium stay at Droombos.",
    "heroImage": "/images/solly/flamingo1.jpg",
    "galleryImages": []
  },
  {
    "id": "l189",
    "regionId": "r5",
    "name": "Erongo Rocks",
    "description": "Experience a premium stay at Erongo Rocks.",
    "heroImage": "/images/solly/flamingo1.jpg",
    "galleryImages": []
  },
  {
    "id": "l190",
    "regionId": "r5",
    "name": "Gabus Safari Lodge",
    "description": "Experience a premium stay at Gabus Safari Lodge.",
    "heroImage": "/images/solly/flamingo5.jpg",
    "galleryImages": []
  },
  {
    "id": "l191",
    "regionId": "r5",
    "name": "Ghaub",
    "description": "Experience a premium stay at Ghaub.",
    "heroImage": "/images/solly/flamingo2.jpg",
    "galleryImages": []
  },
  {
    "id": "l192",
    "regionId": "r1",
    "name": "Heinitzburg Boutique Hotel",
    "description": "Experience a premium stay at Heinitzburg Boutique Hotel.",
    "heroImage": "/images/solly/flamingo4.jpg",
    "galleryImages": []
  },
  {
    "id": "l193",
    "regionId": "r1",
    "name": "Hohewarte Guestfarm",
    "description": "Experience a premium stay at Hohewarte Guestfarm.",
    "heroImage": "/images/solly/flamingo11.jpg",
    "galleryImages": []
  },
  {
    "id": "l194",
    "regionId": "r13",
    "name": "Kalahari Game Lodge",
    "description": "Experience a premium stay at Kalahari Game Lodge.",
    "heroImage": "/images/solly/flamingo1.jpg",
    "galleryImages": []
  },
  {
    "id": "l195",
    "regionId": "r16",
    "name": "Kaoko Mopane Lodge",
    "description": "Experience a premium stay at Kaoko Mopane Lodge.",
    "heroImage": "/images/solly/flamingo8.jpg",
    "galleryImages": []
  },
  {
    "id": "l196",
    "regionId": "r2",
    "name": "Little Sossus Lodge",
    "description": "Experience a premium stay at Little Sossus Lodge.",
    "heroImage": "/images/solly/flamingo4.jpg",
    "galleryImages": []
  },
  {
    "id": "l197",
    "regionId": "r6",
    "name": "Namib Guesthouse",
    "description": "Experience a premium stay at Namib Guesthouse.",
    "heroImage": "/images/solly/flamingo11.jpg",
    "galleryImages": []
  },
  {
    "id": "l198",
    "regionId": "r15",
    "name": "Nooishof",
    "description": "Experience a premium stay at Nooishof.",
    "heroImage": "/images/solly/flamingo4.jpg",
    "galleryImages": []
  },
  {
    "id": "l199",
    "regionId": "r15",
    "name": "Norotshama River Resort",
    "description": "Experience a premium stay at Norotshama River Resort.",
    "heroImage": "/images/solly/flamingo2.jpg",
    "galleryImages": []
  },
  {
    "id": "l200",
    "regionId": "r5",
    "name": "Ohorongo Game and Safari Lodge",
    "description": "Experience a premium stay at Ohorongo Game and Safari Lodge.",
    "heroImage": "/images/solly/flamingo2.jpg",
    "galleryImages": []
  },
  {
    "id": "l201",
    "regionId": "r3",
    "name": "Okutala Etosha Lodge",
    "description": "Experience a premium stay at Okutala Etosha Lodge.",
    "heroImage": "/images/solly/flamingo11.jpg",
    "galleryImages": []
  },
  {
    "id": "l202",
    "regionId": "r1",
    "name": "Onjala",
    "description": "Experience a premium stay at Onjala.",
    "heroImage": "/images/solly/flamingo1.jpg",
    "galleryImages": []
  },
  {
    "id": "l203",
    "regionId": "r6",
    "name": "Organic Stay",
    "description": "Experience a premium stay at Organic Stay.",
    "heroImage": "/images/solly/flamingo8.jpg",
    "galleryImages": []
  },
  {
    "id": "l204",
    "regionId": "r6",
    "name": "Oyster Box Guesthouse",
    "description": "Experience a premium stay at Oyster Box Guesthouse.",
    "heroImage": "/images/solly/flamingo11.jpg",
    "galleryImages": []
  },
  {
    "id": "l205",
    "regionId": "r14",
    "name": "Simanya River Lodge",
    "description": "Experience a premium stay at Simanya River Lodge.",
    "heroImage": "/images/solly/flamingo11.jpg",
    "galleryImages": []
  },
  {
    "id": "l206",
    "regionId": "r6",
    "name": "The Rez",
    "description": "Experience a premium stay at The Rez.",
    "heroImage": "/images/solly/flamingo2.jpg",
    "galleryImages": []
  },
  {
    "id": "l207",
    "regionId": "r2",
    "name": "Tsauchab River Camp",
    "description": "Experience a premium stay at Tsauchab River Camp.",
    "heroImage": "/images/solly/flamingo4.jpg",
    "galleryImages": []
  },
  {
    "id": "l208",
    "regionId": "r8",
    "name": "Uis Elephant",
    "description": "Experience a premium stay at Uis Elephant.",
    "heroImage": "/images/solly/flamingo5.jpg",
    "galleryImages": []
  },
  {
    "id": "l209",
    "regionId": "r1",
    "name": "Voigtland",
    "description": "Experience a premium stay at Voigtland.",
    "heroImage": "/images/solly/flamingo1.jpg",
    "galleryImages": []
  },
  {
    "id": "l210",
    "regionId": "r14",
    "name": "White Sands Caprivi",
    "description": "Experience a premium stay at White Sands Caprivi.",
    "heroImage": "/images/solly/flamingo5.jpg",
    "galleryImages": []
  },
  {
    "id": "l211",
    "regionId": "r1",
    "name": "Windhoek Lux Suites",
    "description": "Experience a premium stay at Windhoek Lux Suites.",
    "heroImage": "/images/solly/flamingo5.jpg",
    "galleryImages": []
  },
  {
    "id": "l212",
    "regionId": "r14",
    "name": "Susuwe Island Lodge",
    "description": "Experience a premium stay at Susuwe Island Lodge.",
    "heroImage": "/images/solly/flamingo8.jpg",
    "galleryImages": []
  },
  {
    "id": "l213",
    "regionId": "r14",
    "name": "Chobe River Camp",
    "description": "Experience a premium stay at Chobe River Camp.",
    "heroImage": "/images/solly/flamingo8.jpg",
    "galleryImages": []
  },
  {
    "id": "l214",
    "regionId": "r14",
    "name": "Jackalberry Tented Camp",
    "description": "Experience a premium stay at Jackalberry Tented Camp.",
    "heroImage": "/images/solly/flamingo8.jpg",
    "galleryImages": []
  },
  {
    "id": "l215",
    "regionId": "r14",
    "name": "Nkasa Lupala Tented Lodge",
    "description": "Experience a premium stay at Nkasa Lupala Tented Lodge.",
    "heroImage": "/images/solly/flamingo1.jpg",
    "galleryImages": []
  },
  {
    "id": "l216",
    "regionId": "r14",
    "name": "Zambezi Queen",
    "description": "Experience a premium stay at Zambezi Queen.",
    "heroImage": "/images/solly/flamingo2.jpg",
    "galleryImages": []
  },
  {
    "id": "l217",
    "regionId": "r14",
    "name": "Zambezi Mubala Camp",
    "description": "Experience a premium stay at Zambezi Mubala Camp.",
    "heroImage": "/images/solly/flamingo11.jpg",
    "galleryImages": []
  },
  {
    "id": "l218",
    "regionId": "r14",
    "name": "Zambezi Mubala Lodge",
    "description": "Experience a premium stay at Zambezi Mubala Lodge.",
    "heroImage": "/images/solly/flamingo4.jpg",
    "galleryImages": []
  },
  {
    "id": "l219",
    "regionId": "r5",
    "name": "Ai Aiba Rock Painting Lodge",
    "description": "Experience a premium stay at Ai Aiba Rock Painting Lodge.",
    "heroImage": "/images/solly/flamingo2.jpg",
    "galleryImages": []
  },
  {
    "id": "l220",
    "regionId": "r5",
    "name": "Desert Dune Safari",
    "description": "Experience a premium stay at Desert Dune Safari.",
    "heroImage": "/images/solly/flamingo5.jpg",
    "galleryImages": []
  },
  {
    "id": "l221",
    "regionId": "r5",
    "name": "Etusis Lodge",
    "description": "Experience a premium stay at Etusis Lodge.",
    "heroImage": "/images/solly/flamingo8.jpg",
    "galleryImages": []
  },
  {
    "id": "l222",
    "regionId": "r5",
    "name": "Evening Shade",
    "description": "Experience a premium stay at Evening Shade.",
    "heroImage": "/images/solly/flamingo5.jpg",
    "galleryImages": []
  },
  {
    "id": "l223",
    "regionId": "r5",
    "name": "Hohenstein Lodge",
    "description": "Experience a premium stay at Hohenstein Lodge.",
    "heroImage": "/images/solly/flamingo5.jpg",
    "galleryImages": []
  },
  {
    "id": "l224",
    "regionId": "r5",
    "name": "Immenhof Guest Farm",
    "description": "Experience a premium stay at Immenhof Guest Farm.",
    "heroImage": "/images/solly/flamingo11.jpg",
    "galleryImages": []
  },
  {
    "id": "l225",
    "regionId": "r5",
    "name": "Kashana Namibia",
    "description": "Experience a premium stay at Kashana Namibia.",
    "heroImage": "/images/solly/flamingo4.jpg",
    "galleryImages": []
  },
  {
    "id": "l226",
    "regionId": "r8",
    "name": "Damara Mopane Lodge",
    "description": "Experience a premium stay at Damara Mopane Lodge.",
    "heroImage": "/images/solly/flamingo4.jpg",
    "galleryImages": []
  },
  {
    "id": "l227",
    "regionId": "r8",
    "name": "Spitzkoppen Lodge",
    "description": "Experience a premium stay at Spitzkoppen Lodge.",
    "heroImage": "/images/solly/flamingo11.jpg",
    "galleryImages": []
  },
  {
    "id": "l228",
    "regionId": "r8",
    "name": "Etendeka Mountain Camp",
    "description": "Experience a premium stay at Etendeka Mountain Camp.",
    "heroImage": "/images/solly/flamingo4.jpg",
    "galleryImages": []
  },
  {
    "id": "l229",
    "regionId": "r8",
    "name": "Wilderness Doro Nawas",
    "description": "Experience a premium stay at Wilderness Doro Nawas.",
    "heroImage": "/images/solly/flamingo11.jpg",
    "galleryImages": []
  },
  {
    "id": "l230",
    "regionId": "r8",
    "name": "Wilderness Damaraland Camp",
    "description": "Experience a premium stay at Wilderness Damaraland Camp.",
    "heroImage": "/images/solly/flamingo5.jpg",
    "galleryImages": []
  },
  {
    "id": "l231",
    "regionId": "r8",
    "name": "Wilderness Desert Rhino Camp",
    "description": "Experience a premium stay at Wilderness Desert Rhino Camp.",
    "heroImage": "/images/solly/flamingo1.jpg",
    "galleryImages": []
  },
  {
    "id": "l232",
    "regionId": "r2",
    "name": "Wilderness Kulala Desert Lodge",
    "description": "Experience a premium stay at Wilderness Kulala Desert Lodge.",
    "heroImage": "/images/solly/flamingo8.jpg",
    "galleryImages": []
  },
  {
    "id": "l233",
    "regionId": "r2",
    "name": "Sossus Oasis Campsite",
    "description": "Experience a premium stay at Sossus Oasis Campsite.",
    "heroImage": "/images/solly/flamingo8.jpg",
    "galleryImages": []
  },
  {
    "id": "l234",
    "regionId": "r2",
    "name": "andBeyond Sossusvlei Desert Lodge",
    "description": "Experience a premium stay at andBeyond Sossusvlei Desert Lodge.",
    "heroImage": "/images/solly/flamingo4.jpg",
    "galleryImages": []
  },
  {
    "id": "l235",
    "regionId": "r2",
    "name": "Namib Outpost",
    "description": "Experience a premium stay at Namib Outpost.",
    "heroImage": "/images/solly/flamingo8.jpg",
    "galleryImages": []
  },
  {
    "id": "l236",
    "regionId": "r2",
    "name": "Elegant Desert Camp",
    "description": "Experience a premium stay at Elegant Desert Camp.",
    "heroImage": "/images/solly/flamingo1.jpg",
    "galleryImages": []
  },
  {
    "id": "l237",
    "regionId": "r2",
    "name": "Desert Whisper",
    "description": "Experience a premium stay at Desert Whisper.",
    "heroImage": "/images/solly/flamingo2.jpg",
    "galleryImages": []
  },
  {
    "id": "l238",
    "regionId": "r2",
    "name": "Namib Dune Star Camp",
    "description": "Experience a premium stay at Namib Dune Star Camp.",
    "heroImage": "/images/solly/flamingo2.jpg",
    "galleryImages": []
  },
  {
    "id": "l239",
    "regionId": "r2",
    "name": "The Desert Grace",
    "description": "Experience a premium stay at The Desert Grace.",
    "heroImage": "/images/solly/flamingo2.jpg",
    "galleryImages": []
  },
  {
    "id": "l240",
    "regionId": "r2",
    "name": "Namib Sky Balloon Safaris",
    "description": "Experience a premium stay at Namib Sky Balloon Safaris.",
    "heroImage": "/images/solly/flamingo2.jpg",
    "galleryImages": []
  },
  {
    "id": "l241",
    "regionId": "r3",
    "name": "Little Ongava",
    "description": "Experience a premium stay at Little Ongava.",
    "heroImage": "/images/solly/flamingo11.jpg",
    "galleryImages": []
  },
  {
    "id": "l242",
    "regionId": "r4",
    "name": "Mushara Bush Camp",
    "description": "Experience a premium stay at Mushara Bush Camp.",
    "heroImage": "/images/solly/flamingo2.jpg",
    "galleryImages": []
  },
  {
    "id": "l243",
    "regionId": "r3",
    "name": "Anderssons At Ongava",
    "description": "Experience a premium stay at Anderssons At Ongava.",
    "heroImage": "/images/solly/flamingo11.jpg",
    "galleryImages": []
  },
  {
    "id": "l244",
    "regionId": "r3",
    "name": "Ongava Tented Camp",
    "description": "Experience a premium stay at Ongava Tented Camp.",
    "heroImage": "/images/solly/flamingo2.jpg",
    "galleryImages": []
  },
  {
    "id": "l245",
    "regionId": "r3",
    "name": "Ongava Lodge",
    "description": "Experience a premium stay at Ongava Lodge.",
    "heroImage": "/images/solly/flamingo11.jpg",
    "galleryImages": []
  },
  {
    "id": "l246",
    "regionId": "r4",
    "name": "Onguma Forest Camp",
    "description": "Experience a premium stay at Onguma Forest Camp.",
    "heroImage": "/images/solly/flamingo1.jpg",
    "galleryImages": []
  },
  {
    "id": "l247",
    "regionId": "r4",
    "name": "Villa Mushara",
    "description": "Experience a premium stay at Villa Mushara.",
    "heroImage": "/images/solly/flamingo5.jpg",
    "galleryImages": []
  },
  {
    "id": "l248",
    "regionId": "r3",
    "name": "Etosha Mopane Safari Lodge",
    "description": "Experience a premium stay at Etosha Mopane Safari Lodge.",
    "heroImage": "/images/solly/flamingo4.jpg",
    "galleryImages": []
  },
  {
    "id": "l249",
    "regionId": "r3",
    "name": "Safari House",
    "description": "Experience a premium stay at Safari House.",
    "heroImage": "/images/solly/flamingo5.jpg",
    "galleryImages": []
  },
  {
    "id": "l250",
    "regionId": "r6",
    "name": "Pelican Point Lodge",
    "description": "Experience a premium stay at Pelican Point Lodge.",
    "heroImage": "/images/solly/flamingo2.jpg",
    "galleryImages": []
  },
  {
    "id": "l251",
    "regionId": "r6",
    "name": "Cornerstone Guesthouse",
    "description": "Experience a premium stay at Cornerstone Guesthouse.",
    "heroImage": "/images/solly/flamingo5.jpg",
    "galleryImages": []
  },
  {
    "id": "l252",
    "regionId": "r6",
    "name": "Swakopmund Sands Hotel",
    "description": "Experience a premium stay at Swakopmund Sands Hotel.",
    "heroImage": "/images/solly/flamingo1.jpg",
    "galleryImages": []
  },
  {
    "id": "l253",
    "regionId": "r15",
    "name": "Canyon Lodge",
    "description": "Experience a premium stay at Canyon Lodge.",
    "heroImage": "/images/solly/flamingo11.jpg",
    "galleryImages": []
  },
  {
    "id": "l254",
    "regionId": "r15",
    "name": "Canyon Roadhouse",
    "description": "Experience a premium stay at Canyon Roadhouse.",
    "heroImage": "/images/solly/flamingo5.jpg",
    "galleryImages": []
  },
  {
    "id": "l255",
    "regionId": "r15",
    "name": "Fish River Lodge",
    "description": "Experience a premium stay at Fish River Lodge.",
    "heroImage": "/images/solly/flamingo2.jpg",
    "galleryImages": []
  },
  {
    "id": "l256",
    "regionId": "r15",
    "name": "Canyon Village",
    "description": "Experience a premium stay at Canyon Village.",
    "heroImage": "/images/solly/flamingo1.jpg",
    "galleryImages": []
  },
  {
    "id": "l257",
    "regionId": "r15",
    "name": "Goibib Mountain Lodge",
    "description": "Experience a premium stay at Goibib Mountain Lodge.",
    "heroImage": "/images/solly/flamingo1.jpg",
    "galleryImages": []
  },
  {
    "id": "l258",
    "regionId": "r13",
    "name": "Harnas Wildlife Foundation",
    "description": "Experience a premium stay at Harnas Wildlife Foundation.",
    "heroImage": "/images/solly/flamingo5.jpg",
    "galleryImages": []
  },
  {
    "id": "l259",
    "regionId": "r13",
    "name": "Terra Rouge Guest Farm",
    "description": "Experience a premium stay at Terra Rouge Guest Farm.",
    "heroImage": "/images/solly/flamingo11.jpg",
    "galleryImages": []
  },
  {
    "id": "l260",
    "regionId": "r13",
    "name": "Guest Farm Kiripotib",
    "description": "Experience a premium stay at Guest Farm Kiripotib.",
    "heroImage": "/images/solly/flamingo2.jpg",
    "galleryImages": []
  },
  {
    "id": "l261",
    "regionId": "r13",
    "name": "Kalahari Red Dunes Lodge",
    "description": "Experience a premium stay at Kalahari Red Dunes Lodge.",
    "heroImage": "/images/solly/flamingo5.jpg",
    "galleryImages": []
  },
  {
    "id": "l262",
    "regionId": "r13",
    "name": "Teufelskrallen Lodge",
    "description": "Experience a premium stay at Teufelskrallen Lodge.",
    "heroImage": "/images/solly/flamingo5.jpg",
    "galleryImages": []
  },
  {
    "id": "l263",
    "regionId": "r14",
    "name": "Ntunda Lodge",
    "description": "Experience a premium stay at Ntunda Lodge.",
    "heroImage": "/images/solly/flamingo4.jpg",
    "galleryImages": []
  },
  {
    "id": "l264",
    "regionId": "r4",
    "name": "Ongula Village Homestead Lodge",
    "description": "Experience a premium stay at Ongula Village Homestead Lodge.",
    "heroImage": "/images/solly/flamingo8.jpg",
    "galleryImages": []
  },
  {
    "id": "l265",
    "regionId": "r14",
    "name": "Mango Guesthouse",
    "description": "Experience a premium stay at Mango Guesthouse.",
    "heroImage": "/images/solly/flamingo11.jpg",
    "galleryImages": []
  },
  {
    "id": "l266",
    "regionId": "r14",
    "name": "Hakusembe River Lodge",
    "description": "Experience a premium stay at Hakusembe River Lodge.",
    "heroImage": "/images/solly/flamingo4.jpg",
    "galleryImages": []
  },
  {
    "id": "l267",
    "regionId": "r5",
    "name": "Dornhuegel Guestfarm",
    "description": "Experience a premium stay at Dornhuegel Guestfarm.",
    "heroImage": "/images/solly/flamingo11.jpg",
    "galleryImages": []
  },
  {
    "id": "l268",
    "regionId": "r5",
    "name": "Gabus Game Ranch",
    "description": "Experience a premium stay at Gabus Game Ranch.",
    "heroImage": "/images/solly/flamingo5.jpg",
    "galleryImages": []
  },
  {
    "id": "l269",
    "regionId": "r5",
    "name": "Haus Mopanie",
    "description": "Experience a premium stay at Haus Mopanie.",
    "heroImage": "/images/solly/flamingo5.jpg",
    "galleryImages": []
  },
  {
    "id": "l270",
    "regionId": "r5",
    "name": "La Rochelle Lodge",
    "description": "Experience a premium stay at La Rochelle Lodge.",
    "heroImage": "/images/solly/flamingo1.jpg",
    "galleryImages": []
  },
  {
    "id": "l271",
    "regionId": "r5",
    "name": "Ohange Lodge",
    "description": "Experience a premium stay at Ohange Lodge.",
    "heroImage": "/images/solly/flamingo5.jpg",
    "galleryImages": []
  },
  {
    "id": "l272",
    "regionId": "r11",
    "name": "Wilderness Serra Cafema",
    "description": "Experience a premium stay at Wilderness Serra Cafema.",
    "heroImage": "/images/solly/flamingo8.jpg",
    "galleryImages": []
  },
  {
    "id": "l273",
    "regionId": "r7",
    "name": "Wilderness Hoanib Skeleton Coast Camp",
    "description": "Experience a premium stay at Wilderness Hoanib Skeleton Coast Camp.",
    "heroImage": "/images/solly/flamingo5.jpg",
    "galleryImages": []
  },
  {
    "id": "l274",
    "regionId": "r11",
    "name": "Hoanib Valley Camp",
    "description": "Experience a premium stay at Hoanib Valley Camp.",
    "heroImage": "/images/solly/flamingo4.jpg",
    "galleryImages": []
  },
  {
    "id": "l275",
    "regionId": "r5",
    "name": "Okonjima Bush Suite",
    "description": "Experience a premium stay at Okonjima Bush Suite.",
    "heroImage": "/images/solly/flamingo1.jpg",
    "galleryImages": []
  },
  {
    "id": "l276",
    "regionId": "r5",
    "name": "Okonjima Luxury Bush Camp",
    "description": "Experience a premium stay at Okonjima Luxury Bush Camp.",
    "heroImage": "/images/solly/flamingo4.jpg",
    "galleryImages": []
  },
  {
    "id": "l277",
    "regionId": "r5",
    "name": "Okonjima Villa",
    "description": "Experience a premium stay at Okonjima Villa.",
    "heroImage": "/images/solly/flamingo8.jpg",
    "galleryImages": []
  },
  {
    "id": "l278",
    "regionId": "r1",
    "name": "Casa Blanca Boutique Hotel",
    "description": "Experience a premium stay at Casa Blanca Boutique Hotel.",
    "heroImage": "/images/solly/flamingo1.jpg",
    "galleryImages": []
  },
  {
    "id": "l279",
    "regionId": "r1",
    "name": "Immanuel Lodge",
    "description": "Experience a premium stay at Immanuel Lodge.",
    "heroImage": "/images/solly/flamingo2.jpg",
    "galleryImages": []
  },
  {
    "id": "l280",
    "regionId": "r1",
    "name": "Ti Melen Boutique Guesthouse",
    "description": "Experience a premium stay at Ti Melen Boutique Guesthouse.",
    "heroImage": "/images/solly/flamingo8.jpg",
    "galleryImages": []
  },
  {
    "id": "l281",
    "regionId": "r3",
    "name": "Etosha Oberland Lodge",
    "description": "Experience a premium stay at Etosha Oberland Lodge.",
    "heroImage": "/images/solly/flamingo2.jpg",
    "galleryImages": []
  },
  {
    "id": "l282",
    "regionId": "r8",
    "name": "Twyfelfontein Adventure Camp",
    "description": "Experience a premium stay at Twyfelfontein Adventure Camp.",
    "heroImage": "/images/solly/flamingo11.jpg",
    "galleryImages": []
  },
  {
    "id": "l283",
    "regionId": "r6",
    "name": "Brigadoon Boutique Guesthouse",
    "description": "Experience a premium stay at Brigadoon Boutique Guesthouse.",
    "heroImage": "/images/solly/flamingo8.jpg",
    "galleryImages": []
  },
  {
    "id": "l284",
    "regionId": "r1",
    "name": "Waldeck Namibia",
    "description": "Experience a premium stay at Waldeck Namibia.",
    "heroImage": "/images/solly/flamingo1.jpg",
    "galleryImages": []
  },
  {
    "id": "l285",
    "regionId": "r14",
    "name": "Chobe Princess",
    "description": "Experience a premium stay at Chobe Princess.",
    "heroImage": "/images/solly/flamingo1.jpg",
    "galleryImages": []
  },
  {
    "id": "l286",
    "regionId": "r2",
    "name": "Wolwedans Boulders Camp",
    "description": "Experience a premium stay at Wolwedans Boulders Camp.",
    "heroImage": "/images/solly/flamingo11.jpg",
    "galleryImages": []
  },
  {
    "id": "l287",
    "regionId": "r2",
    "name": "Wolwedans Plains Camp",
    "description": "Experience a premium stay at Wolwedans Plains Camp.",
    "heroImage": "/images/solly/flamingo1.jpg",
    "galleryImages": []
  },
  {
    "id": "l288",
    "regionId": "r2",
    "name": "Wolwedans Mountain View Suite",
    "description": "Experience a premium stay at Wolwedans Mountain View Suite.",
    "heroImage": "/images/solly/flamingo1.jpg",
    "galleryImages": []
  },
  {
    "id": "l289",
    "regionId": "r3",
    "name": "Safarihoek Lodge",
    "description": "Experience a premium stay at Safarihoek Lodge.",
    "heroImage": "/images/solly/flamingo5.jpg",
    "galleryImages": []
  },
  {
    "id": "l290",
    "regionId": "r2",
    "name": "Kwessi Dunes",
    "description": "Experience a premium stay at Kwessi Dunes.",
    "heroImage": "/images/solly/flamingo8.jpg",
    "galleryImages": []
  },
  {
    "id": "l291",
    "regionId": "r14",
    "name": "Nkasa Linyanti",
    "description": "Experience a premium stay at Nkasa Linyanti.",
    "heroImage": "/images/solly/flamingo5.jpg",
    "galleryImages": []
  },
  {
    "id": "l292",
    "regionId": "r11",
    "name": "Hoanib Elephant Camp",
    "description": "Experience a premium stay at Hoanib Elephant Camp.",
    "heroImage": "/images/solly/flamingo4.jpg",
    "galleryImages": []
  },
  {
    "id": "l293",
    "regionId": "r1",
    "name": "Zannier Omaanda",
    "description": "Experience a premium stay at Zannier Omaanda.",
    "heroImage": "/images/solly/flamingo1.jpg",
    "galleryImages": []
  },
  {
    "id": "l294",
    "regionId": "r2",
    "name": "Zannier Sonop",
    "description": "Experience a premium stay at Zannier Sonop.",
    "heroImage": "/images/solly/flamingo11.jpg",
    "galleryImages": []
  }
];

export const mockItinerary: Itinerary = {
  id: 'i1',
  title: 'Classic Namibia Luxury Safari',
  clientName: 'The Smith Family',
  startDate: '2026-05-10',
  endDate: '2026-05-12',
  days: [
    {
      id: 'd1',
      dayNumber: 1,
      regionId: 'r1',
      lodgeId: 'l1',
      title: 'Arrival in Windhoek',
      description: 'Upon arrival, you will be transferred to your lodge in Windhoek. Spend the afternoon relaxing before an early dinner under the stars.',
      activities: ['City orientation', 'Relaxation at lodge'],
      images: ['/images/solly/flamingo1.jpg']
    },
    {
      id: 'd2',
      dayNumber: 2,
      regionId: 'r2',
      lodgeId: 'l12',
      title: 'Journey to Sossusvlei',
      description: 'After breakfast, depart for the majestic red dunes of Sossusvlei. Arrive at Desert Camp and take in the panoramic views of the Namib Desert.',
      activities: ['Scenic drive', 'Sunset overlooking the plains'],
      images: ['/images/solly/flamingo8.jpg']
    },
    {
      id: 'd3',
      dayNumber: 3,
      regionId: 'r2',
      lodgeId: 'l14',
      title: 'Exploring the Dunes',
      description: 'An early morning start to enter the Namib-Naukluft park at sunrise. Climb Big Daddy dune before exploring the surreal landscape of Deadvlei.',
      activities: ['Guided Sossusvlei excursion', 'Hot air ballooning (optional)', 'Dune climbing'],
      images: ['/images/solly/flamingo1.jpg']
    },
    {
      id: 'd4',
      dayNumber: 4,
      regionId: 'r3',
      lodgeId: 'l40',
      title: 'Wildlife of Etosha',
      description: 'Fly to the Etosha region and settle in. Experience an afternoon game drive looking for lions and elephants across the shimmering salt pan.',
      activities: ['Afternoon Game Drive', 'Sundowners at the waterhole'],
      images: ['/images/solly/flamingo1.jpg']
    }
  ]
};
