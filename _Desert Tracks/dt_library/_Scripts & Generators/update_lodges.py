import re

html_file = '/Users/jaunhusselmann/Desktop/AG Projects/dt_library/namibia_agent_portal.html'

with open(html_file, 'r') as f:
    content = f.read()

data = {
    "Windhoek": ["Acacia Guesthouse", "Auas Safari Lodge", "Am Weinberg Boutique Hotel", "Arebbusch Travel Lodge", "Avani Windhoek Hotel", "Belvedere Boutique Hotel", "Olive Exclusive", "Olive Grove Guesthouse", "Windhoek Country Club Resort", "Hotel Thule", "River Crossing Lodge", "Safari Court Hotel", "Safari Hotel", "Windhoek Luxury Guesthouse", "Roof of Africa Hotel", "Puccini House", "Londiningi Guesthouse", "Villa Violet Guesthouse", "The Elegant Guesthouse", "GocheGanas Nature Reserve", "Naankuse Lodge", "Duesternbrook Safari Guest Farm", "Droombos", "Heinitzburg Boutique Hotel", "Hohewarte Guestfarm", "Onjala", "Voigtland", "Windhoek Lux Suites", "Casa Blanca Boutique Hotel", "Immanuel Lodge", "Ti Melen Boutique Guesthouse", "Waldeck Namibia", "Zannier Omaanda"],
    "Sossusvlei & Namib": ["Sossusvlei Lodge", "Desert Camp", "Desert Quiver Camp", "Hoodia Lodge", "Moon Mountain Lodge", "Elegant Desert Lodge", "Desert Homestead Lodge", "Desert Homestead Outpost", "Le Mirage Resort & Spa", "Sossus Dune Lodge", "Wolwedans Dunes Lodge", "Wolwedans Dune Camp", "Kulala Desert Lodge", "Little Kulala", "Sossusvlei Desert Lodge", "Agama River Camp", "Rostock Ritz Desert Lodge", "Solitaire Desert Farm", "Solitaire Camping2go", "Agama Camping", "Sossusvlei Lodge Adventure Camp", "Desert Camp Camping", "Greenfire Desert Lodge", "Kanaan Desert Retreat", "Agama Lodge", "Barkhan Dune Retreat", "Little Sossus Lodge", "Tsauchab River Camp", "Wilderness Kulala Desert Lodge", "Sossus Oasis Campsite", "andBeyond Sossusvlei Desert Lodge", "Namib Outpost", "Elegant Desert Camp", "Desert Whisper", "Namib Dune Star Camp", "The Desert Grace", "Namib Sky Balloon Safaris", "Wolwedans Boulders Camp", "Wolwedans Plains Camp", "Wolwedans Mountain View Suite", "Kwessi Dunes", "Zannier Sonop"],
    "Etosha National Park": [],
    "East Etosha": [],
    "South Etosha": [],
    "Central Namibia": ["Gabuse Guest House", "Khorab Safari Lodge", "Okonjima Plains Camp", "Okonjima Bush Camp", "Waterberg Plateau Lodge", "Waterberg Wilderness", "Waterberg Valley Lodge", "Mount Etjo Safari Lodge", "Frans Indongo Lodge", "Otjiwa Safari Lodge", "Epako Safari Lodge", "Erongo Plateau Camp", "Okahandja Country Hotel", "Midgard Country Estate", "Minen Hotel", "Uris Safari Lodge", "Tsumeb Guesthouse", "Otjiwarongo Guesthouse", "C'est Si Bon Hotel", "Kamaku Guesthouse", "Hadassa Guesthouse", "Casa Forno Guesthouse", "Tsumeb Guesthouse Garden", "Kupferquelle Resort", "Aloegrove Safari Lodge", "Erongo Rocks", "Gabus Safari Lodge", "Ghaub", "Ohorongo Game and Safari Lodge", "Ai Aiba Rock Painting Lodge", "Desert Dune Safari", "Etusis Lodge", "Evening Shade", "Hohenstein Lodge", "Immenhof Guest Farm", "Kashana Namibia", "Dornhuegel Guestfarm", "Gabus Game Ranch", "Haus Mopanie", "La Rochelle Lodge", "Ohange Lodge", "Okonjima Bush Suite", "Okonjima Luxury Bush Camp", "Okonjima Villa"],
    "Swakopmund": ["Hansa Hotel", "Strand Hotel Swakopmund", "The Delight Swakopmund", "Swakopmund Hotel", "Beach Hotel Swakopmund", "Pelican Bay Hotel", "Protea Hotel Walvis Bay", "Burning Shore Lodge", "Desert Breeze Lodge", "Hotel Pension A la Mer", "Hotel Zum Kaiser", "Sea Breeze Guesthouse", "Flamingo Villa Boutique Hotel", "Henties Bay Caravan Park", "Atlantic Villa", "Namib Guesthouse", "Organic Stay", "Oyster Box Guesthouse", "The Rez", "Pelican Point Lodge", "Cornerstone Guesthouse", "Swakopmund Sands Hotel", "Brigadoon Boutique Guesthouse"],
    "Skeleton Coast": ["Shipwreck Lodge", "Terrace Bay Resort", "Torra Bay Campsite", "Cape Cross Lodge", "Wilderness Hoanib Skeleton Coast Camp"],
    "Damaraland": ["Damaraland Camp", "Mowani Mountain Camp", "Camp Kipwe", "Grootberg Lodge", "Hoada Campsite", "Palmwag Lodge", "Twyfelfontein Country Lodge", "Doro Nawas Camp", "Vingerklip Lodge", "Huab Lodge", "Ugab Terrace Lodge", "Ondjamba Hills", "Khorixas Lodge", "iGowati Country Hotel", "Uis Elephant", "Damara Mopane Lodge", "Spitzkoppen Lodge", "Etendeka Mountain Camp", "Wilderness Doro Nawas", "Wilderness Damaraland Camp", "Wilderness Desert Rhino Camp", "Twyfelfontein Adventure Camp"],
    "West Etosha": ["Hobatere Lodge"],
    "Epupa": ["Epupa Camp", "Omarunga Epupa Falls Camp", "Kapika Waterfall Lodge"],
    "Kaokoland": ["Okahirongo Elephant Lodge", "Okahirongo River Camp", "Khowarib Lodge", "Sesfontein Guesthouse", "Okahirongo Elephant Lodge (Luxury)", "Purros Bush Camp", "Wilderness Serra Cafema", "Hoanib Valley Camp", "Hoanib Elephant Camp"],
    "Luderitz": ["Luderitz Nest Hotel", "Kairos Cottage", "Island Cottage", "Luderitz Backpackers", "Shark Island Resort", "Alte Villa 2025"],
    "Kalahari": ["Bagatelle Kalahari Game Ranch", "Kalahari Anib Lodge", "Kalahari Farmhouse", "Camelthorn Kalahari Lodge", "Zebra Kalahari Lodge", "Suricate Tented Kalahari Lodge", "Lapa Lange Game Lodge", "Anib Lodge", "Intu Afrika Camelthorn Lodge", "Zelda Game & Guest Farm", "Kalahari Bush Breaks", "Burgsdorf Guest Farm", "Helmeringhausen Hotel", "Namibgrens Guest Farm", "Gibeon Folk Hotel", "Duwisib Guest Farm", "Africa Safari Lodge", "Auob Country Lodge", "Kalahari Game Lodge", "Harnas Wildlife Foundation", "Terra Rouge Guest Farm", "Guest Farm Kiripotib", "Kalahari Red Dunes Lodge", "Teufelskrallen Lodge"],
    "Zambezi & Caprivi": ["Tambuti Lodge", "Kayova River Lodge", "Ngandu Safari Lodge", "Mazambala Island Lodge", "Camp Kwando", "Lianshulu Lodge", "Lianshulu Bush Lodge", "Mudumu River Camp", "Namushasha River Camping2go", "Zambezi Mubala Camping2go", "Chobe Savannah Lodge", "Impalila Island Lodge", "Ichingo Chobe River Lodge", "Shametu River Lodge", "Popa Falls Resort", "Nunda River Lodge", "Mahangu Safari Lodge", "Ndhovu Safari Lodge", "Simanya River Lodge", "White Sands Caprivi", "Susuwe Island Lodge", "Chobe River Camp", "Jackalberry Tented Camp", "Nkasa Lupala Tented Lodge", "Zambezi Queen", "Zambezi Mubala Camp", "Zambezi Mubala Lodge", "Ntunda Lodge", "Mango Guesthouse", "Hakusembe River Lodge", "Chobe Princess", "Nkasa Linyanti"],
    "Fish River Canyon": ["Seeheim Hotel", "Garas Park Quivertree", "Garas Park", "Seeheim Hotel (Adventure)", "Bethanie Guesthouse", "Alte Kalkofen Lodge", "Bahnhof Hotel Aus", "Nooishof", "Norotshama River Resort", "Canyon Lodge", "Canyon Roadhouse", "Fish River Lodge", "Canyon Village", "Goibib Mountain Lodge"],
    "Opuwo": ["Opuwo Country Lodge", "Kaoko Mopane Lodge"],
    "Botswana": ["Chobe Water Villas", "Camp Kuzuma", "Muchenje Safari Lodge", "Ngoma Safari Lodge", "Chobe Safari Lodge", "Chobe Marina Lodge", "Cresta Mowana Safari Resort & Spa", "Chobe Game Lodge", "Elephant Valley Lodge", "Chobe Elephant Camp"]
}

raw_etosha = ["Etosha Village", "Etosha Safari Lodge", "Etosha Safari Camp", "Toshari Lodge", "Etosha Gateway", "Halali Resort", "Okaukuejo Resort", "Eagle Tented Lodge", "Epacha Game Lodge", "Bambatsi Guest Farm", "Ombinda Country Lodge", "Etosha Village Camping2go", "Okutala Etosha Lodge", "Little Ongava", "Anderssons At Ongava", "Ongava Tented Camp", "Ongava Lodge", "Etosha Mopane Safari Lodge", "Safari House", "Etosha Oberland Lodge", "Safarihoek Lodge", "Mushara Lodge", "Mushara Outpost", "Mushara Villa", "Mokuti Etosha Lodge", "Onguma Bush Camp", "Onguma Tented Camp", "Onguma Tree Top", "Onguma The Fort", "Etosha King Nehale", "Namutoni Resort", "Mushara Bush Camp", "Onguma Forest Camp", "Villa Mushara", "Ongula Village Homestead Lodge"]

for lodge in raw_etosha:
    lower_name = lodge.lower()
    if any(x in lower_name for x in ["mushara", "mokuti", "onguma", "namutoni", "ongula", "nehale"]):
        data["East Etosha"].append(lodge)
    elif any(x in lower_name for x in ["ongava", "anderssons", "etosha village", "etosha safari", "toshari", "halali", "okaukuejo", "epacha", "bambatsi", "ombinda", "okutala", "oberland", "safarihoek", "eagle tented"]):
        data["South Etosha"].append(lodge)
    else:
        data["Etosha National Park"].append(lodge)

if "overflow-y: auto;" not in content:
    content = content.replace(".lodge-list {\n            padding: 25px;\n            flex: 1;\n        }", ".lodge-list {\n            padding: 25px;\n            flex: 1;\n            overflow-y: auto;\n        }")
    content = content.replace(".lodge-list {\n            padding: 25px;\n            flex: 1;\n", ".lodge-list {\n            padding: 25px;\n            flex: 1;\n            overflow-y: auto;\n")

# Adding custom scrollbar styling
scrollbar_css = """
        .lodge-list::-webkit-scrollbar {
            width: 6px;
        }
        .lodge-list::-webkit-scrollbar-track {
            background: transparent;
        }
        .lodge-list::-webkit-scrollbar-thumb {
            background: rgba(0,0,0,0.1);
            border-radius: 10px;
        }
        .lodge-list::-webkit-scrollbar-thumb:hover {
            background: rgba(0,0,0,0.2);
        }
"""
if ".lodge-list::-webkit-scrollbar" not in content:
    content = content.replace("    </style>", scrollbar_css + "    </style>")

for region_name, lodges in data.items():
    pattern = r"(<h3>" + re.escape(region_name) + r"</h3>\s*</div>\s*<div class=\"lodge-list\">)(.*?)(</div>\s*</div>)"
    
    new_lodge_html = "\n"
    for lodge in lodges:
        new_lodge_html += f"""                    <div class="lodge-item" onclick="openLogin('{lodge.replace("'", "\\'")}')">
                        {lodge}
                        <button class="lodge-btn">Rates</button>
                    </div>\n"""
    new_lodge_html += "                "
    
    if re.search(pattern, content, re.DOTALL):
        content = re.sub(pattern, r"\g<1>" + new_lodge_html.replace('\\', '\\\\') + r"\g<3>", content, flags=re.DOTALL)
    else:
        print(f"Could not find block for {region_name}")

with open(html_file, 'w') as f:
    f.write(content)

print("Lodges updated successfully.")
