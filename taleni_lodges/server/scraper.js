const puppeteer = require('puppeteer');

const LODGES = [
    {
        "bbid": "25170",
        "name": "Acacia Guesthouse",
        "region": "Windhoek"
    },
    {
        "bbid": "25175",
        "name": "Auas Safari Lodge",
        "region": "Windhoek"
    },
    {
        "bbid": "17122",
        "name": "Am Weinberg Boutique Hotel",
        "region": "Windhoek"
    },
    {
        "bbid": "25178",
        "name": "Arebbusch Travel Lodge",
        "region": "Windhoek"
    },
    {
        "bbid": "25180",
        "name": "Avani Windhoek Hotel",
        "region": "Windhoek"
    },
    {
        "bbid": "25183",
        "name": "Belvedere Boutique Hotel",
        "region": "Windhoek"
    },
    {
        "bbid": "25195",
        "name": "Olive Exclusive",
        "region": "Windhoek"
    },
    {
        "bbid": "25197",
        "name": "Olive Grove Guesthouse",
        "region": "Windhoek"
    },
    {
        "bbid": "25221",
        "name": "Windhoek Country Club Resort",
        "region": "Windhoek"
    },
    {
        "bbid": "11402",
        "name": "Hotel Thule",
        "region": "Windhoek"
    },
    {
        "bbid": "11405",
        "name": "River Crossing Lodge",
        "region": "Windhoek"
    },
    {
        "bbid": "25225",
        "name": "Safari Court Hotel",
        "region": "Windhoek"
    },
    {
        "bbid": "25230",
        "name": "Safari Hotel",
        "region": "Windhoek"
    },
    {
        "bbid": "25235",
        "name": "Windhoek Luxury Guesthouse",
        "region": "Windhoek"
    },
    {
        "bbid": "25240",
        "name": "Roof of Africa Hotel",
        "region": "Windhoek"
    },
    {
        "bbid": "25245",
        "name": "Puccini House",
        "region": "Windhoek"
    },
    {
        "bbid": "25250",
        "name": "Londiningi Guesthouse",
        "region": "Windhoek"
    },
    {
        "bbid": "25255",
        "name": "Villa Violet Guesthouse",
        "region": "Windhoek"
    },
    {
        "bbid": "25260",
        "name": "The Elegant Guesthouse",
        "region": "Windhoek"
    },
    {
        "bbid": "21502",
        "name": "GocheGanas Nature Reserve",
        "region": "Windhoek"
    },
    {
        "bbid": "21505",
        "name": "Naankuse Lodge",
        "region": "Windhoek"
    },
    {
        "bbid": "21510",
        "name": "Duesternbrook Safari Guest Farm",
        "region": "Windhoek"
    },
    {
        "bbid": "12865",
        "name": "Sossusvlei Lodge",
        "region": "Sossusvlei"
    },
    {
        "bbid": "12866",
        "name": "Desert Camp",
        "region": "Sossusvlei"
    },
    {
        "bbid": "12867",
        "name": "Desert Quiver Camp",
        "region": "Sossusvlei"
    },
    {
        "bbid": "15195",
        "name": "Hoodia Lodge",
        "region": "Sossusvlei"
    },
    {
        "bbid": "24451",
        "name": "Moon Mountain Lodge",
        "region": "Sossusvlei"
    },
    {
        "bbid": "25445",
        "name": "Elegant Desert Lodge",
        "region": "Sossusvlei"
    },
    {
        "bbid": "25472",
        "name": "Desert Homestead Lodge",
        "region": "Sossusvlei"
    },
    {
        "bbid": "25475",
        "name": "Desert Homestead Outpost",
        "region": "Sossusvlei"
    },
    {
        "bbid": "11202",
        "name": "Le Mirage Resort & Spa",
        "region": "Sossusvlei"
    },
    {
        "bbid": "11205",
        "name": "Sossus Dune Lodge",
        "region": "Sossusvlei"
    },
    {
        "bbid": "11210",
        "name": "Wolwedans Dunes Lodge",
        "region": "Sossusvlei"
    },
    {
        "bbid": "11215",
        "name": "Kulala Desert Lodge",
        "region": "Sossusvlei"
    },
    {
        "bbid": "11220",
        "name": "Little Kulala",
        "region": "Sossusvlei"
    },
    {
        "bbid": "11225",
        "name": "Sossusvlei Desert Lodge",
        "region": "Sossusvlei"
    },
    {
        "bbid": "14560",
        "name": "Agama River Camp",
        "region": "Solitaire"
    },
    {
        "bbid": "14565",
        "name": "Rostock Ritz Desert Lodge",
        "region": "Solitaire"
    },
    {
        "bbid": "14570",
        "name": "Solitaire Desert Farm",
        "region": "Solitaire"
    },
    {
        "bbid": "12868",
        "name": "Etosha Village",
        "region": "Etosha"
    },
    {
        "bbid": "14390",
        "name": "Etosha Safari Lodge",
        "region": "Etosha"
    },
    {
        "bbid": "14393",
        "name": "Etosha Safari Camp",
        "region": "Etosha"
    },
    {
        "bbid": "15160",
        "name": "Mushara Lodge",
        "region": "Etosha"
    },
    {
        "bbid": "15165",
        "name": "Mushara Outpost",
        "region": "Etosha"
    },
    {
        "bbid": "15170",
        "name": "Mushara Villa",
        "region": "Etosha"
    },
    {
        "bbid": "25421",
        "name": "Mokuti Etosha Lodge",
        "region": "Etosha"
    },
    {
        "bbid": "25424",
        "name": "Onguma Bush Camp",
        "region": "Etosha"
    },
    {
        "bbid": "25427",
        "name": "Onguma Tented Camp",
        "region": "Etosha"
    },
    {
        "bbid": "25430",
        "name": "Onguma Tree Top",
        "region": "Etosha"
    },
    {
        "bbid": "25433",
        "name": "Onguma The Fort",
        "region": "Etosha"
    },
    {
        "bbid": "21160",
        "name": "Toshari Lodge",
        "region": "Etosha"
    },
    {
        "bbid": "21170",
        "name": "Etosha Gateway",
        "region": "Etosha"
    },
    {
        "bbid": "16802",
        "name": "Etosha King Nehale",
        "region": "Etosha North"
    },
    {
        "bbid": "16805",
        "name": "Namutoni Resort",
        "region": "Etosha"
    },
    {
        "bbid": "16810",
        "name": "Halali Resort",
        "region": "Etosha"
    },
    {
        "bbid": "16815",
        "name": "Okaukuejo Resort",
        "region": "Etosha"
    },
    {
        "bbid": "21145",
        "name": "Eagle Tented Lodge",
        "region": "Outjo"
    },
    {
        "bbid": "21150",
        "name": "Epacha Game Lodge",
        "region": "Outjo"
    },
    {
        "bbid": "21155",
        "name": "Bambatsi Guest Farm",
        "region": "Outjo"
    },
    {
        "bbid": "14402",
        "name": "Gabuse Guest House",
        "region": "Otavi"
    },
    {
        "bbid": "14405",
        "name": "Khorab Safari Lodge",
        "region": "Otavi"
    },
    {
        "bbid": "11722",
        "name": "Hansa Hotel",
        "region": "Swakopmund"
    },
    {
        "bbid": "22865",
        "name": "Strand Hotel Swakopmund",
        "region": "Swakopmund"
    },
    {
        "bbid": "22870",
        "name": "The Delight Swakopmund",
        "region": "Swakopmund"
    },
    {
        "bbid": "25120",
        "name": "Swakopmund Hotel",
        "region": "Swakopmund"
    },
    {
        "bbid": "13402",
        "name": "Beach Hotel Swakopmund",
        "region": "Swakopmund"
    },
    {
        "bbid": "13405",
        "name": "Pelican Bay Hotel",
        "region": "Walvis Bay"
    },
    {
        "bbid": "25310",
        "name": "Shipwreck Lodge",
        "region": "Skeleton Coast"
    },
    {
        "bbid": "13410",
        "name": "Protea Hotel Walvis Bay",
        "region": "Walvis Bay"
    },
    {
        "bbid": "13415",
        "name": "Burning Shore Lodge",
        "region": "Walvis Bay"
    },
    {
        "bbid": "22350",
        "name": "Damaraland Camp",
        "region": "Damaraland"
    },
    {
        "bbid": "22355",
        "name": "Mowani Mountain Camp",
        "region": "Damaraland"
    },
    {
        "bbid": "22360",
        "name": "Camp Kipwe",
        "region": "Damaraland"
    },
    {
        "bbid": "14850",
        "name": "Grootberg Lodge",
        "region": "Damaraland"
    },
    {
        "bbid": "14855",
        "name": "Hoada Campsite",
        "region": "Damaraland"
    },
    {
        "bbid": "14860",
        "name": "Hobatere Lodge",
        "region": "Damaraland"
    },
    {
        "bbid": "21365",
        "name": "Palmwag Lodge",
        "region": "Damaraland"
    },
    {
        "bbid": "18902",
        "name": "Twyfelfontein Country Lodge",
        "region": "Twyfelfontein"
    },
    {
        "bbid": "18905",
        "name": "Doro Nawas Camp",
        "region": "Twyfelfontein"
    },
    {
        "bbid": "11902",
        "name": "Vingerklip Lodge",
        "region": "Damaraland"
    },
    {
        "bbid": "11905",
        "name": "Huab Lodge",
        "region": "Damaraland"
    },
    {
        "bbid": "11910",
        "name": "Ugab Terrace Lodge",
        "region": "Damaraland"
    },
    {
        "bbid": "13502",
        "name": "Ondjamba Hills",
        "region": "Damaraland"
    },
    {
        "bbid": "12002",
        "name": "Epupa Camp",
        "region": "Epupa Falls"
    },
    {
        "bbid": "12005",
        "name": "Omarunga Epupa Falls Camp",
        "region": "Epupa Falls"
    },
    {
        "bbid": "12010",
        "name": "Kapika Waterfall Lodge",
        "region": "Epupa Falls"
    },
    {
        "bbid": "15502",
        "name": "Okahirongo Elephant Lodge",
        "region": "Kaokoland"
    },
    {
        "bbid": "15505",
        "name": "Okahirongo River Camp",
        "region": "Kaokoland"
    },
    {
        "bbid": "25602",
        "name": "Khowarib Lodge",
        "region": "Kaokoland"
    },
    {
        "bbid": "25605",
        "name": "Sesfontein Guesthouse",
        "region": "Kaokoland"
    },
    {
        "bbid": "22875",
        "name": "Desert Breeze Lodge",
        "region": "Swakopmund"
    },
    {
        "bbid": "16502",
        "name": "Hotel Pension A la Mer",
        "region": "Swakopmund"
    },
    {
        "bbid": "16505",
        "name": "Hotel Zum Kaiser",
        "region": "Swakopmund"
    },
    {
        "bbid": "19302",
        "name": "Sea Breeze Guesthouse",
        "region": "Swakopmund"
    },
    {
        "bbid": "13420",
        "name": "Flamingo Villa Boutique Hotel",
        "region": "Walvis Bay"
    },
    {
        "bbid": "25280",
        "name": "Luderitz Nest Hotel",
        "region": "Luderitz"
    },
    {
        "bbid": "11302",
        "name": "Kairos Cottage",
        "region": "Luderitz"
    },
    {
        "bbid": "11305",
        "name": "Island Cottage",
        "region": "Luderitz"
    },
    {
        "bbid": "11310",
        "name": "Luderitz Backpackers",
        "region": "Luderitz"
    },
    {
        "bbid": "11315",
        "name": "Shark Island Resort",
        "region": "Luderitz"
    },
    {
        "bbid": "14354",
        "name": "Bagatelle Kalahari Game Ranch",
        "region": "Mariental"
    },
    {
        "bbid": "14502",
        "name": "Kalahari Anib Lodge",
        "region": "Mariental"
    },
    {
        "bbid": "14505",
        "name": "Kalahari Farmhouse",
        "region": "Mariental"
    },
    {
        "bbid": "18702",
        "name": "Camelthorn Kalahari Lodge",
        "region": "Kalahari"
    },
    {
        "bbid": "18705",
        "name": "Zebra Kalahari Lodge",
        "region": "Kalahari"
    },
    {
        "bbid": "18710",
        "name": "Suricate Tented Kalahari Lodge",
        "region": "Kalahari"
    },
    {
        "bbid": "16702",
        "name": "Lapa Lange Game Lodge",
        "region": "Mariental"
    },
    {
        "bbid": "16705",
        "name": "Anib Lodge",
        "region": "Mariental"
    },
    {
        "bbid": "15560",
        "name": "Intu Afrika Camelthorn Lodge",
        "region": "Kalahari"
    },
    {
        "bbid": "99702",
        "name": "Okonjima Plains Camp",
        "region": "Otjiwarongo"
    },
    {
        "bbid": "99705",
        "name": "Okonjima Bush Camp",
        "region": "Otjiwarongo"
    },
    {
        "bbid": "13450",
        "name": "Waterberg Plateau Lodge",
        "region": "Waterberg"
    },
    {
        "bbid": "13455",
        "name": "Waterberg Wilderness",
        "region": "Waterberg"
    },
    {
        "bbid": "13460",
        "name": "Waterberg Valley Lodge",
        "region": "Waterberg"
    },
    {
        "bbid": "11502",
        "name": "Mount Etjo Safari Lodge",
        "region": "Otjiwarongo"
    },
    {
        "bbid": "11505",
        "name": "Frans Indongo Lodge",
        "region": "Otjiwarongo"
    },
    {
        "bbid": "11510",
        "name": "Otjiwa Safari Lodge",
        "region": "Otjiwarongo"
    },
    {
        "bbid": "11620",
        "name": "Epako Safari Lodge",
        "region": "Omaruru"
    },
    {
        "bbid": "11625",
        "name": "Erongo Plateau Camp",
        "region": "Omaruru"
    },
    {
        "bbid": "16302",
        "name": "Okahandja Country Hotel",
        "region": "Okahandja"
    },
    {
        "bbid": "16305",
        "name": "Midgard Country Estate",
        "region": "Okahandja"
    },
    {
        "bbid": "14602",
        "name": "Zelda Game & Guest Farm",
        "region": "Gobabis"
    },
    {
        "bbid": "14605",
        "name": "Kalahari Bush Breaks",
        "region": "Gobabis"
    },
    {
        "bbid": "11802",
        "name": "Minen Hotel",
        "region": "Tsumeb"
    },
    {
        "bbid": "11805",
        "name": "Uris Safari Lodge",
        "region": "Tsumeb"
    },
    {
        "bbid": "11810",
        "name": "Tsumeb Guesthouse",
        "region": "Tsumeb"
    },
    {
        "bbid": "15325",
        "name": "Tambuti Lodge",
        "region": "Rundu"
    },
    {
        "bbid": "15330",
        "name": "Kayova River Lodge",
        "region": "Rundu"
    },
    {
        "bbid": "15335",
        "name": "Ngandu Safari Lodge",
        "region": "Rundu"
    },
    {
        "bbid": "12330",
        "name": "Mazambala Island Lodge",
        "region": "Caprivi"
    },
    {
        "bbid": "12335",
        "name": "Camp Kwando",
        "region": "Caprivi"
    },
    {
        "bbid": "12340",
        "name": "Lianshulu Lodge",
        "region": "Caprivi"
    },
    {
        "bbid": "12345",
        "name": "Lianshulu Bush Lodge",
        "region": "Caprivi"
    },
    {
        "bbid": "12350",
        "name": "Mudumu River Camp",
        "region": "Caprivi"
    },
    {
        "bbid": "11102",
        "name": "Burgsdorf Guest Farm",
        "region": "Maltahohe"
    },
    {
        "bbid": "11105",
        "name": "Helmeringhausen Hotel",
        "region": "Helmeringhausen"
    },
    {
        "bbid": "11110",
        "name": "Namibgrens Guest Farm",
        "region": "Maltahohe"
    },
    {
        "bbid": "21130",
        "name": "Seeheim Hotel",
        "region": "Keetmanshoop"
    },
    {
        "bbid": "21135",
        "name": "Garas Park Quivertree",
        "region": "Keetmanshoop"
    },
    {
        "bbid": "25315",
        "name": "Terrace Bay Resort",
        "region": "Skeleton Coast"
    },
    {
        "bbid": "25320",
        "name": "Torra Bay Campsite",
        "region": "Skeleton Coast"
    },
    {
        "bbid": "25325",
        "name": "Henties Bay Caravan Park",
        "region": "Henties Bay"
    },
    {
        "bbid": "25330",
        "name": "Cape Cross Lodge",
        "region": "Cape Cross"
    },
    {
        "bbid": "25610",
        "name": "Okahirongo Elephant Lodge (Luxury)",
        "region": "Purros"
    },
    {
        "bbid": "25615",
        "name": "Purros Bush Camp",
        "region": "Purros"
    },
    {
        "bbid": "25620",
        "name": "Opuwo Country Lodge",
        "region": "Opuwo"
    },
    {
        "bbid": "25625",
        "name": "Ombinda Country Lodge",
        "region": "Outjo"
    },
    {
        "bbid": "12355",
        "name": "Namushasha River Camping2go",
        "region": "Caprivi"
    },
    {
        "bbid": "12360",
        "name": "Zambezi Mubala Camping2go",
        "region": "Caprivi"
    },
    {
        "bbid": "12365",
        "name": "Chobe Savannah Lodge",
        "region": "Caprivi"
    },
    {
        "bbid": "12370",
        "name": "Impalila Island Lodge",
        "region": "Caprivi"
    },
    {
        "bbid": "12375",
        "name": "Ichingo Chobe River Lodge",
        "region": "Caprivi"
    },
    {
        "bbid": "14575",
        "name": "Solitaire Camping2go",
        "region": "Solitaire"
    },
    {
        "bbid": "14580",
        "name": "Agama Camping",
        "region": "Solitaire"
    },
    {
        "bbid": "12869",
        "name": "Etosha Village Camping2go",
        "region": "Etosha"
    },
    {
        "bbid": "12870",
        "name": "Sossusvlei Lodge Adventure Camp",
        "region": "Sossusvlei"
    },
    {
        "bbid": "12871",
        "name": "Desert Camp Camping",
        "region": "Sossusvlei"
    },
    {
        "bbid": "25702",
        "name": "Otjiwarongo Guesthouse",
        "region": "Otjiwarongo"
    },
    {
        "bbid": "25705",
        "name": "C'est Si Bon Hotel",
        "region": "Otjiwarongo"
    },
    {
        "bbid": "25710",
        "name": "Kamaku Guesthouse",
        "region": "Otjiwarongo"
    },
    {
        "bbid": "25715",
        "name": "Hadassa Guesthouse",
        "region": "Otjiwarongo"
    },
    {
        "bbid": "25720",
        "name": "Casa Forno Guesthouse",
        "region": "Tsumeb"
    },
    {
        "bbid": "25725",
        "name": "Tsumeb Guesthouse Garden",
        "region": "Tsumeb"
    },
    {
        "bbid": "25730",
        "name": "Kupferquelle Resort",
        "region": "Tsumeb"
    },
    {
        "bbid": "25735",
        "name": "Khorixas Lodge",
        "region": "Damaraland"
    },
    {
        "bbid": "25740",
        "name": "iGowati Country Hotel",
        "region": "Damaraland"
    },
    {
        "bbid": "25802",
        "name": "Shametu River Lodge",
        "region": "Divundu"
    },
    {
        "bbid": "25805",
        "name": "Popa Falls Resort",
        "region": "Divundu"
    },
    {
        "bbid": "25810",
        "name": "Nunda River Lodge",
        "region": "Divundu"
    },
    {
        "bbid": "25815",
        "name": "Mahangu Safari Lodge",
        "region": "Divundu"
    },
    {
        "bbid": "25820",
        "name": "Ndhovu Safari Lodge",
        "region": "Divundu"
    },
    {
        "bbid": "25902",
        "name": "Gibeon Folk Hotel",
        "region": "Gibeon"
    },
    {
        "bbid": "25905",
        "name": "Garas Park",
        "region": "Keetmanshoop"
    },
    {
        "bbid": "25910",
        "name": "Seeheim Hotel (Adventure)",
        "region": "Keetmanshoop"
    },
    {
        "bbid": "25915",
        "name": "Bethanie Guesthouse",
        "region": "Bethanie"
    },
    {
        "bbid": "25920",
        "name": "Duwisib Guest Farm",
        "region": "Maltahohe"
    },
    {
        "bbid": "25925",
        "name": "Greenfire Desert Lodge",
        "region": "Namib Rand"
    },
    {
        "bbid": "25930",
        "name": "Kanaan Desert Retreat",
        "region": "Namib Rand"
    },
    {
        "bbid": "26001",
        "name": "Africa Safari Lodge",
        "region": "Kalahari"
    },
    {
        "bbid": "26002",
        "name": "Agama Lodge",
        "region": "Sossusvlei"
    },
    {
        "bbid": "26003",
        "name": "Aloegrove Safari Lodge",
        "region": "Otjiwarongo"
    },
    {
        "bbid": "26004",
        "name": "Alte Kalkofen Lodge",
        "region": "Keetmanshoop"
    },
    {
        "bbid": "26005",
        "name": "Alte Villa 2025",
        "region": "Luderitz"
    },
    {
        "bbid": "26006",
        "name": "Atlantic Villa",
        "region": "Swakopmund"
    },
    {
        "bbid": "26007",
        "name": "Auob Country Lodge",
        "region": "Gochas"
    },
    {
        "bbid": "26008",
        "name": "Bahnhof Hotel Aus",
        "region": "Aus"
    },
    {
        "bbid": "26009",
        "name": "Barkhan Dune Retreat",
        "region": "Sossusvlei"
    },
    {
        "bbid": "26010",
        "name": "Droombos",
        "region": "Windhoek"
    },
    {
        "bbid": "26011",
        "name": "Erongo Rocks",
        "region": "Omaruru"
    },
    {
        "bbid": "26012",
        "name": "Gabus Safari Lodge",
        "region": "Otavi"
    },
    {
        "bbid": "26013",
        "name": "Ghaub",
        "region": "Tsumeb"
    },
    {
        "bbid": "26014",
        "name": "Heinitzburg Boutique Hotel",
        "region": "Windhoek"
    },
    {
        "bbid": "26015",
        "name": "Hohewarte Guestfarm",
        "region": "Windhoek"
    },
    {
        "bbid": "26016",
        "name": "Kalahari Game Lodge",
        "region": "Kalahari"
    },
    {
        "bbid": "26017",
        "name": "Kaoko Mopane Lodge",
        "region": "Opuwo"
    },
    {
        "bbid": "26018",
        "name": "Little Sossus Lodge",
        "region": "Sossusvlei"
    },
    {
        "bbid": "26019",
        "name": "Namib Guesthouse",
        "region": "Swakopmund"
    },
    {
        "bbid": "26020",
        "name": "Nooishof",
        "region": "Keetmanshoop"
    },
    {
        "bbid": "26021",
        "name": "Norotshama River Resort",
        "region": "Noordoewer"
    },
    {
        "bbid": "26022",
        "name": "Ohorongo Game and Safari Lodge",
        "region": "Otavi"
    },
    {
        "bbid": "26023",
        "name": "Okutala Etosha Lodge",
        "region": "Etosha"
    },
    {
        "bbid": "26024",
        "name": "Onjala",
        "region": "Windhoek"
    },
    {
        "bbid": "26025",
        "name": "Organic Stay",
        "region": "Swakopmund"
    },
    {
        "bbid": "26026",
        "name": "Oyster Box Guesthouse",
        "region": "Walvis Bay"
    },
    {
        "bbid": "26027",
        "name": "Simanya River Lodge",
        "region": "Rundu"
    },
    {
        "bbid": "26028",
        "name": "The Rez",
        "region": "Walvis Bay"
    },
    {
        "bbid": "26029",
        "name": "Tsauchab River Camp",
        "region": "Sossusvlei"
    },
    {
        "bbid": "26030",
        "name": "Uis Elephant",
        "region": "Uis"
    },
    {
        "bbid": "26031",
        "name": "Voigtland",
        "region": "Windhoek"
    },
    {
        "bbid": "26032",
        "name": "White Sands Caprivi",
        "region": "Caprivi"
    },
    {
        "bbid": "26033",
        "name": "Windhoek Lux Suites",
        "region": "Windhoek"
    },
    {
        "bbid": "WETU_1770375965441_0",
        "name": "Susuwe Island Lodge",
        "region": "Caprivi"
    },
    {
        "bbid": "WETU_1770375965441_1",
        "name": "Chobe River Camp",
        "region": "Caprivi"
    },
    {
        "bbid": "WETU_1770375965441_2",
        "name": "Jackalberry Tented Camp",
        "region": "Caprivi"
    },
    {
        "bbid": "WETU_1770375965441_3",
        "name": "Nkasa Lupala Tented Lodge",
        "region": "Caprivi"
    },
    {
        "bbid": "WETU_1770375965441_4",
        "name": "Zambezi Queen",
        "region": "Caprivi"
    },
    {
        "bbid": "WETU_1770375965441_5",
        "name": "Zambezi Mubala Camp",
        "region": "Caprivi"
    },
    {
        "bbid": "WETU_1770375965441_6",
        "name": "Zambezi Mubala Lodge",
        "region": "Caprivi"
    },
    {
        "bbid": "WETU_1770375965441_7",
        "name": "Ai Aiba Rock Painting Lodge",
        "region": "Erongo"
    },
    {
        "bbid": "WETU_1770375965441_8",
        "name": "Desert Dune Safari",
        "region": "Erongo"
    },
    {
        "bbid": "WETU_1770375965441_9",
        "name": "Etusis Lodge",
        "region": "Erongo"
    },
    {
        "bbid": "WETU_1770375965441_10",
        "name": "Evening Shade",
        "region": "Erongo"
    },
    {
        "bbid": "WETU_1770375965441_11",
        "name": "Hohenstein Lodge",
        "region": "Erongo"
    },
    {
        "bbid": "WETU_1770375965441_12",
        "name": "Immenhof Guest Farm",
        "region": "Erongo"
    },
    {
        "bbid": "WETU_1770375965441_13",
        "name": "Kashana Namibia",
        "region": "Erongo"
    },
    {
        "bbid": "WETU_1770375965441_14",
        "name": "Damara Mopane Lodge",
        "region": "Damaraland"
    },
    {
        "bbid": "WETU_1770375965441_15",
        "name": "Spitzkoppen Lodge",
        "region": "Damaraland"
    },
    {
        "bbid": "WETU_1770375965441_16",
        "name": "Etendeka Mountain Camp",
        "region": "Damaraland"
    },
    {
        "bbid": "WETU_1770375965441_17",
        "name": "Wilderness Doro Nawas",
        "region": "Damaraland"
    },
    {
        "bbid": "WETU_1770375965441_18",
        "name": "Wilderness Damaraland Camp",
        "region": "Damaraland"
    },
    {
        "bbid": "WETU_1770375965441_19",
        "name": "Wilderness Desert Rhino Camp",
        "region": "Damaraland"
    },
    {
        "bbid": "WETU_1770375965441_20",
        "name": "Wilderness Kulala Desert Lodge",
        "region": "Sossusvlei"
    },
    {
        "bbid": "WETU_1770375965441_21",
        "name": "Sossus Oasis Campsite",
        "region": "Sossusvlei"
    },
    {
        "bbid": "WETU_1770375965441_22",
        "name": "andBeyond Sossusvlei Desert Lodge",
        "region": "Sossusvlei"
    },
    {
        "bbid": "WETU_1770375965441_23",
        "name": "Namib Outpost",
        "region": "Sossusvlei"
    },
    {
        "bbid": "WETU_1770375965441_24",
        "name": "Elegant Desert Camp",
        "region": "Sossusvlei"
    },
    {
        "bbid": "WETU_1770375965441_25",
        "name": "Desert Whisper",
        "region": "Sossusvlei"
    },
    {
        "bbid": "WETU_1770375965441_26",
        "name": "Namib Dune Star Camp",
        "region": "Sossusvlei"
    },
    {
        "bbid": "WETU_1770375965441_27",
        "name": "The Desert Grace",
        "region": "Sossusvlei"
    },
    {
        "bbid": "WETU_1770375965441_28",
        "name": "Namib Sky Balloon Safaris",
        "region": "Sossusvlei"
    },
    {
        "bbid": "WETU_1770375965441_29",
        "name": "Little Ongava",
        "region": "Etosha"
    },
    {
        "bbid": "WETU_1770375965441_30",
        "name": "Mushara Bush Camp",
        "region": "Etosha"
    },
    {
        "bbid": "WETU_1770375965441_31",
        "name": "Anderssons At Ongava",
        "region": "Etosha"
    },
    {
        "bbid": "WETU_1770375965441_32",
        "name": "Ongava Tented Camp",
        "region": "Etosha"
    },
    {
        "bbid": "WETU_1770375965441_33",
        "name": "Ongava Lodge",
        "region": "Etosha"
    },
    {
        "bbid": "WETU_1770375965441_34",
        "name": "Onguma Forest Camp",
        "region": "Etosha"
    },
    {
        "bbid": "WETU_1770375965441_35",
        "name": "Villa Mushara",
        "region": "Etosha"
    },
    {
        "bbid": "WETU_1770375965441_36",
        "name": "Etosha Mopane Safari Lodge",
        "region": "Etosha"
    },
    {
        "bbid": "WETU_1770375965441_37",
        "name": "Safari House",
        "region": "Etosha"
    },
    {
        "bbid": "WETU_1770375965441_38",
        "name": "Pelican Point Lodge",
        "region": "Swakopmund"
    },
    {
        "bbid": "WETU_1770375965441_39",
        "name": "Cornerstone Guesthouse",
        "region": "Swakopmund"
    },
    {
        "bbid": "WETU_1770375965441_40",
        "name": "Swakopmund Sands Hotel",
        "region": "Swakopmund"
    },
    {
        "bbid": "WETU_1770375965441_41",
        "name": "Canyon Lodge",
        "region": "Fish River Canyon"
    },
    {
        "bbid": "WETU_1770375965441_42",
        "name": "Canyon Roadhouse",
        "region": "Fish River Canyon"
    },
    {
        "bbid": "WETU_1770375965441_43",
        "name": "Fish River Lodge",
        "region": "Fish River Canyon"
    },
    {
        "bbid": "WETU_1770375965441_44",
        "name": "Canyon Village",
        "region": "Fish River Canyon"
    },
    {
        "bbid": "WETU_1770375965441_45",
        "name": "Goibib Mountain Lodge",
        "region": "South"
    },
    {
        "bbid": "WETU_1770375965441_46",
        "name": "Harnas Wildlife Foundation",
        "region": "Kalahari"
    },
    {
        "bbid": "WETU_1770375965441_47",
        "name": "Terra Rouge Guest Farm",
        "region": "Kalahari"
    },
    {
        "bbid": "WETU_1770375965441_48",
        "name": "Guest Farm Kiripotib",
        "region": "Kalahari"
    },
    {
        "bbid": "WETU_1770375965441_49",
        "name": "Kalahari Red Dunes Lodge",
        "region": "Kalahari"
    },
    {
        "bbid": "WETU_1770375965441_50",
        "name": "Teufelskrallen Lodge",
        "region": "Kalahari"
    },
    {
        "bbid": "WETU_1770375965441_51",
        "name": "Ntunda Lodge",
        "region": "Caprivi"
    },
    {
        "bbid": "WETU_1770375965441_52",
        "name": "Ongula Village Homestead Lodge",
        "region": "Owamboland"
    },
    {
        "bbid": "WETU_1770375965441_53",
        "name": "Mango Guesthouse",
        "region": "Caprivi"
    },
    {
        "bbid": "WETU_1770375965441_54",
        "name": "Hakusembe River Lodge",
        "region": "Rundu"
    },
    {
        "bbid": "WETU_1770375965441_55",
        "name": "Dornhuegel Guestfarm",
        "region": "Grootfontein"
    },
    {
        "bbid": "WETU_1770375965441_56",
        "name": "Gabus Game Ranch",
        "region": "Otavi"
    },
    {
        "bbid": "WETU_1770375965441_57",
        "name": "Haus Mopanie",
        "region": "Tsumeb"
    },
    {
        "bbid": "WETU_1770375965441_58",
        "name": "La Rochelle Lodge",
        "region": "Tsumeb"
    },
    {
        "bbid": "WETU_1770375965441_59",
        "name": "Ohange Lodge",
        "region": "Otavi"
    },
    {
        "bbid": "WETU_1770375965441_60",
        "name": "Wilderness Serra Cafema",
        "region": "Kaokoland"
    },
    {
        "bbid": "WETU_1770375965441_61",
        "name": "Wilderness Hoanib Skeleton Coast Camp",
        "region": "Skeleton Coast"
    },
    {
        "bbid": "WETU_1770375965441_62",
        "name": "Hoanib Valley Camp",
        "region": "Kaokoland"
    },
    {
        "bbid": "WETU_1770375965441_63",
        "name": "Okonjima Bush Suite",
        "region": "Otjiwarongo"
    },
    {
        "bbid": "WETU_1770375965441_64",
        "name": "Okonjima Luxury Bush Camp",
        "region": "Otjiwarongo"
    },
    {
        "bbid": "WETU_1770375965441_65",
        "name": "Okonjima Villa",
        "region": "Otjiwarongo"
    },
    {
        "bbid": "WETU_1770375965441_66",
        "name": "Casa Blanca Boutique Hotel",
        "region": "Windhoek"
    },
    {
        "bbid": "WETU_1770375965441_67",
        "name": "Immanuel Lodge",
        "region": "Windhoek"
    },
    {
        "bbid": "WETU_1770375965441_68",
        "name": "Ti Melen Boutique Guesthouse",
        "region": "Windhoek"
    },
    {
        "bbid": "WETU_1770375965441_69",
        "name": "Etosha Oberland Lodge",
        "region": "Etosha"
    },
    {
        "bbid": "WETU_1770375965441_70",
        "name": "Twyfelfontein Adventure Camp",
        "region": "Damaraland"
    },
    {
        "bbid": "WETU_1770375965441_71",
        "name": "Brigadoon Boutique Guesthouse",
        "region": "Swakopmund"
    },
    {
        "bbid": "WETU_1770375965441_72",
        "name": "Waldeck Namibia",
        "region": "Windhoek"
    },
    {
        "bbid": "WETU_1770375965441_73",
        "name": "Chobe Princess",
        "region": "Caprivi"
    },
    {
        "bbid": "WETU_1770375965441_74",
        "name": "Wolwedans Boulders Camp",
        "region": "Sossusvlei"
    },
    {
        "bbid": "WETU_1770375965441_75",
        "name": "Wolwedans Plains Camp",
        "region": "Sossusvlei"
    },
    {
        "bbid": "WETU_1770375965441_76",
        "name": "Wolwedans Mountain View Suite",
        "region": "Sossusvlei"
    },
    {
        "bbid": "WETU_1770375965441_77",
        "name": "Safarihoek Lodge",
        "region": "Etosha"
    },
    {
        "bbid": "WETU_1770375965441_78",
        "name": "Kwessi Dunes",
        "region": "Sossusvlei"
    },
    {
        "bbid": "WETU_1770375965441_79",
        "name": "Nkasa Linyanti",
        "region": "Caprivi"
    },
    {
        "bbid": "WETU_1770375965441_80",
        "name": "Hoanib Elephant Camp",
        "region": "Kaokoland"
    },
    {
        "bbid": "WETU_1770375965441_81",
        "name": "Zannier Omaanda",
        "region": "Windhoek"
    },
    {
        "bbid": "WETU_1770375965441_82",
        "name": "Zannier Sonop",
        "region": "Namib"
    }
];

async function fetchLodgeData({ checkInDate, checkOutDate, adults, children, lodgeName }) {
    let browser = null;
    const results = [];

    // Filter lodges if specific one requested
    const targetLodges = lodgeName
        ? LODGES.filter(l => l.name === lodgeName)
        : LODGES;

    if (targetLodges.length === 0) return [];

    try {
        browser = await puppeteer.launch({
            headless: "new",
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu'
            ]
        });

        const page = await browser.newPage();
        // Set a reasonable viewport
        await page.setViewport({ width: 1280, height: 800 });

        for (const lodge of targetLodges) {
            let url;
            if (lodge.bbid) {
                // NightsBridge URL pattern
                url = `https://book.nightsbridge.com/${lodge.bbid}?checkInDate=${checkInDate}&checkOutDate=${checkOutDate}`;
            } else if (lodge.urlKey && lodge.urlKey !== 'placeholder') {
                // DirectBook URL pattern
                url = `https://direct-book.com/properties/${lodge.urlKey}?locale=en&items[0][adults]=${adults}&items[0][children]=${children}&items[0][infants]=0&currency=NAD&checkInDate=${checkInDate}&checkOutDate=${checkOutDate}&trackPage=no`;
            } else {
                continue; // Skip placeholders
            }

            try {
                console.log(`Navigating to ${lodge.name} (${url})...`);
                await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

                const data = await page.evaluate((lodgeName, lodgeRegion) => {
                    const noAvailability = document.body.innerText.includes('No availability') || document.body.innerText.includes('no rooms available');

                    if (noAvailability) {
                        return {
                            name: lodgeName,
                            region: lodgeRegion,
                            available: false,
                            rooms: [],
                            details: "Not available for selected dates"
                        };
                    }

                    const bodyText = document.body.innerText;
                    // Attempt to extract multiple prices
                    // Look for patterns like "Room Name ... NAD 1,200.00"
                    // This is strictly a fallback heuristic

                    const priceMatches = [...bodyText.matchAll(/(.*?)\s+NAD\s?([\d,]+\.\d{2})/g)];

                    if (priceMatches.length > 0) {
                        // Extract up to 3 distinct price points as rooms
                        // Filter out garbage
                        const roomList = priceMatches.slice(0, 3).map(m => {
                            let name = m[1].trim().split('\n').pop(); // Take last line before price
                            if (name.length > 30) name = "Standard Room";
                            return {
                                name: name || "Standard Room",
                                price: `NAD ${m[2]}`
                            };
                        });

                        return {
                            name: lodgeName,
                            region: lodgeRegion,
                            available: true,
                            rooms: roomList,
                            details: "Available",
                            bookingUrl: window.location.href // Return the current URL as the booking link
                        };
                    }

                    // Simple price match
                    const simplePrice = bodyText.match(/NAD\s?[\d,]+\.\d{2}/);
                    if (simplePrice) {
                        return {
                            name: lodgeName,
                            region: lodgeRegion,
                            available: true,
                            rooms: [
                                { name: "Standard Room", price: simplePrice[0] }
                            ],
                            details: "Available",
                            bookingUrl: window.location.href
                        };
                    }

                    return {
                        name: lodgeName,
                        region: lodgeRegion,
                        available: false,
                        rooms: [],
                        details: "Could not determine price/availability"
                    };

                }, lodge.name, lodge.region);

                results.push(data);

            } catch (err) {
                console.error(`Failed to scrape ${lodge.name}:`, err.message);
                results.push({
                    name: lodge.name,
                    region: lodge.region,
                    available: false,
                    error: "Scraping failed"
                });
            }
        }
        return results;

    } catch (error) {
        console.error("Browser error or scraping failed:", error);
        console.log("Generating mock data...");

        // Dynamic mock data generator
        const mockResults = targetLodges.map(lodge => {
            // Simulate random availability (80% chance available)
            const isAvailable = Math.random() > 0.2;

            if (!isAvailable) {
                return {
                    name: lodge.name,
                    region: lodge.region,
                    available: false,
                    rooms: [],
                    details: "Fully Booked (Mock Data)"
                };
            }

            // Generate realistic looking prices
            const basePrice = 3000 + Math.floor(Math.random() * 5000);

            // Construct a mock booking URL
            let mockUrl = "#";
            if (lodge.bbid) {
                mockUrl = `https://book.nightsbridge.com/${lodge.bbid}`;
            } else if (lodge.fallbackUrl) {
                mockUrl = lodge.fallbackUrl;
            }

            return {
                name: lodge.name,
                region: lodge.region,
                available: true,
                rooms: [
                    { name: "Luxury Suite", price: `NAD ${(basePrice * 1.5).toFixed(2)}` },
                    { name: "Standard Room", price: `NAD ${basePrice.toFixed(2)}` }
                ],
                details: "Available (Mock Data)",
                bookingUrl: mockUrl
            };
        });

        return mockResults;
    } finally {
        if (browser) await browser.close();
    }
}

module.exports = { fetchLodgeData, LODGES };
