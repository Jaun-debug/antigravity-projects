#!/usr/bin/env python3
"""build_blog.py — namibiarates.com lodge blog (first published 10 Oct 2026).

Writes:
  blog/index.html                 blog index
  blog/<slug>/index.html          one post per lodge
  assets/blog-posts.json          feed read by the footer "From the Blog" row (site-chrome.js, marker FOOTER-BLOG)
Every fact in POSTS was checked against the source listed in that post's `sources`
or confirmed by Jaun on 10 Oct 2026 (see the Lodge Blog Fact Ledger artifact).
Run from dt_library:  python3 tools/build_blog.py
"""
import json, os, html

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DT = "https://desert-tracks.com"
PUBLISHED = "2026-10-10"
PUB_HUMAN = "10 October 2026"

# Desert Tracks itineraries that use each lodge (read from the live itinerary pages, 10 Oct 2026)
# codes: sh Strand Hotel, tw The Weinberg, eo Etosha Oberland, ck Camp Kipwe, dv Dead Valley Lodge
ITINS = [
    ("/namibia-luxury-safaris/12-day-namibia-self-drive-luxury-circuit/", "12-Day Namibia Self-Drive — Luxury Circuit", "Luxury self-drive", "sh tw"),
    ("/namibia-luxury-safaris/10-day-ultra-luxury-namibia-safari-south-focus/", "10-Day Ultra-Luxury Namibia Safari — South Focus", "Luxury", "sh"),
    ("/namibia-self-drive-safaris/18-day-hidden-treasures-of-namibia-self-drive-safari/", "18-Day Hidden Treasures of Namibia Self-Drive Safari", "Self-drive", "sh tw eo ck"),
    ("/namibia-guided-safaris/11-day-namibia-guided-safari-adventure-tour/", "11-Day Namibia Guided Safari", "Guided", "sh tw eo ck dv"),
    ("/namibia-guided-safaris/16-day-namibia-chobe-vic-falls-guided-safari/", "16-Day Namibia, Chobe & Vic Falls Guided Safari", "Guided", "sh tw eo ck dv"),
    ("/namibia-luxury-safaris/14-day-luxury-namibia-highlights-self-drive-safari/", "14-Day Luxury Namibia Highlights Self-Drive Safari", "Luxury self-drive", "sh tw eo ck"),
    ("/namibia-self-drive-safaris/18-day-namibia-delta-chobe-vic-falls-self-drive-safari/", "18-Day Namibia, Delta, Chobe & Vic Falls Self-Drive and Fly Safari", "Self-drive & fly", "sh tw eo"),
    ("/namibia-guided-safaris/16-day-namibia-guided-safari-adventure-tour/", "16-Day Namibia Safari Adventure Tour", "Guided", "sh tw eo ck dv"),
    ("/namibia-lodge-camping-self-drive-safaris/27-day-namibia-in-full-safari/", "27-Day Namibia in Full Safari", "Lodge & camping self-drive", "eo dv"),
    ("/namibia-lodge-camping-self-drive-safaris/17-day-classic-namibia-discovery-safari/", "17-Day Classic Namibia Discovery Safari", "Lodge & camping self-drive", "dv"),
    ("/namibia-fly-in-safaris/7-day-namibia-desert-dune-wildlife-safari/", "7-Day Namibia Desert, Dune & Wildlife Safari", "Fly-in", "dv"),
    ("/namibia-luxury-safaris/10-day-namibia-honeymoon-luxury-fly-in-safari/", "10-Day Namibia Honeymoon Luxury Fly-In Safari", "Luxury fly-in", "sh tw"),
    ("/namibia-self-drive-safaris/17-day-namibia-chobe-vic-falls-self-drive-safari/", "17-Day Namibia, Chobe & Vic Falls Self-Drive Safari (Comfort)", "Self-drive", "sh tw eo"),
    ("/namibia-luxury-safaris/14-day-luxury-namibia-fly-drive-photographic-safari/", "14-Day Luxury Namibia Drive & Fly Photographic Safari", "Luxury drive & fly", "sh tw"),
    ("/namibia-fly-in-safaris/8-day-safari-namibia-in-style-luxury-fly-in-safari/", "8-Day Namibia in Style Luxury Fly-In Safari", "Luxury fly-in", "ck"),
]

W = "https://wetu.com/imageHandler/c1920x1080/"

POSTS = [
 # Newest first in the footer and index: order here = display order.
 dict(
  slug="dead-valley-lodge", code="dv", lodge="Dead Valley Lodge", region="Sossusvlei & Namib",
  title="Dead Valley Lodge: Staying Inside the Sesriem Gate",
  seo="Dead Valley Lodge, Sossusvlei: Early Park Access & FAQs",
  desc="Dead Valley Lodge sits inside the Sesriem gate. Early park access, Deadvlei at sunrise, rooms and meals answered, with trade rates.",
  nr="/sossusvlei-accommodation/dead-valley-lodge/", dt="/namibia-accommodation/dead-valley-lodge/",
  imgs=[W+"180634/1783577335273_1782398357294_upscalemedia-transformed.jpeg?fmt=jpg",
        W+"180634/1783577335273_1782398357294_upscalemedia-transformed--2-.jpeg?fmt=jpg",
        W+"180634/1783577335270_1782398357292_dead-valley-lodge-26.jpg?fmt=jpg",
        W+"180634/1783577335273_1782398357294_upscalemedia-transformed--1-.jpeg?fmt=jpg"],
  answer="Dead Valley Lodge is a Sun Karros lodge inside the Sesriem gates of the Namib-Naukluft Park. Its guests may access the park an hour before sunrise and stay until an hour after sunset, so with an early start you can be at Deadvlei for sunrise.",
  intro=[
   "Dead Valley Lodge is inside the Namib-Naukluft Park, between Sesriem and Elim Dune. It is one of only two lodges whose guests may access the park an hour before sunrise and stay until an hour after sunset.",
   "The lodge opened on 1 July 2019 and has 20 en-suite rooms with air-conditioning. It runs on full board, with a restaurant, a bar and a pool, and offers guided drives to Sossusvlei, Sesriem Canyon and Elim Dune.",
  ],
  faq=[
   ("Who runs Dead Valley Lodge?", "Dead Valley Lodge is a Sun Karros property."),
   ("Is Dead Valley Lodge inside the park?", "Yes. It is inside the gates of Sesriem in the Namib-Naukluft Park, between Sesriem and Elim Dune."),
   ("Can guests get into the park early?", "Yes. Guests may access the park an hour before sunrise and stay until an hour after sunset. Dead Valley Lodge is one of only two lodges with this access."),
   ("Can I be at Deadvlei for sunrise from Dead Valley Lodge?", "Yes, with an early start, using the lodge's early access to the park."),
   ("How many people can share a room?", "Two. Every room takes two people, so a family of three or four needs two rooms."),
   ("What is included in the rate?", "The lodge runs on full board, with a restaurant and bar on site."),
   ("What facilities does the lodge have?", "The 20 rooms are en suite with air-conditioning. The lodge has a pool, a bar, a restaurant and internet access."),
   ("Which activities does the lodge offer?", "Morning and afternoon nature drives to Sossusvlei and Sesriem Canyon, and sunset drives to Elim Dune."),
   ("How do I get past the 2WD car park to Deadvlei?", "Since 1 May 2026 the last stretch beyond the 2WD car park requires a paid transfer arranged locally."),
  ],
  sources=[("Sun Karros", "https://www.sunkarros.com/"),
           ("Expert Africa: Dead Valley Lodge in detail", "https://www.expertafrica.com/namibia/namib-naukluft-national-park/dead-valley-lodge/in-detail"),
           ("Expert Africa: info from the owner", "https://www.expertafrica.com/namibia/namib-naukluft-national-park/dead-valley-lodge/info-from-owner")],
 ),
 dict(
  slug="camp-kipwe", code="ck", lodge="Camp Kipwe", region="Damaraland",
  title="Camp Kipwe: Desert Elephants and Twyfelfontein",
  seo="Camp Kipwe, Twyfelfontein: Elephant Drives, Rooms & FAQs",
  desc="Camp Kipwe near Twyfelfontein: desert-elephant drives, rock engravings, rooms, roads and how many nights, answered, with trade rates.",
  nr="/damaraland-accommodation/camp-kipwe/", dt="/namibia-accommodation/camp-kipwe/",
  imgs=[W+"10498/camp_kipwe_-_aerial_view_1.jpg?fmt=jpg",
        W+"10498/camp_kipwe_-_bungalow__l._suite.jpg?fmt=jpg",
        W+"10498/camp_kipwe_-_deck__view.jpg?fmt=jpg",
        W+"10498/camp_kipwe_-_main_lounge_to_deck.jpg?fmt=jpg"],
  answer="Camp Kipwe is a Chiwani Safari Camps lodge near Twyfelfontein in Damaraland, sister to Mowani Mountain Camp. We recommend two nights and the camp's guided desert-elephant drive. The road in is gravel and a 2WD vehicle is fine.",
  intro=[
   "Camp Kipwe sits in the Uibasen-Twyfelfontein Community Conservancy, with rondavel-style bungalows and a pool carved out of the local boulders. A sundowner viewpoint gives 180-degree views.",
   "The camp runs two signature outings: a morning drive to find the desert-adapted elephants, and an afternoon excursion to the UNESCO-listed Twyfelfontein rock engravings, Burnt Mountain and the Organ Pipes.",
  ],
  faq=[
   ("Who runs Camp Kipwe?", "Chiwani Safari Camps. Its sister camp nearby is Mowani Mountain Camp."),
   ("Should I stay at Camp Kipwe or Mowani?", "Both are good choices and both are Chiwani camps in the same area. They have different styles, so pick the one that suits the stay you want."),
   ("How many nights should I spend at Camp Kipwe?", "We recommend two nights."),
   ("How do the desert-elephant drives work?", "The guided drive usually departs at 06h30 and lasts about four to six hours, with drinks and snacks. We recommend the guided drive rather than searching for the elephants on your own."),
   ("Can I visit the Twyfelfontein rock engravings from the camp?", "Yes. The Twyfelfontein, Burnt Mountain and Organ Pipes excursion usually departs at 15h00 and takes about two hours."),
   ("How far is Camp Kipwe from Swakopmund and Windhoek?", "About 320 km (around 4 hours) from Swakopmund and 550 km (around 5.5 hours) from Windhoek. Twyfelfontein airstrip is 15 km away, about a 20-minute transfer."),
   ("Do I need a 4x4 to reach Camp Kipwe?", "No. The road is gravel, and a 2WD vehicle is fine."),
   ("What rooms does Camp Kipwe have?", "Rondavel-style bungalows with open-air bathrooms (outdoor shower) and air-conditioning, twin beds that convert to a double, plus the Kipwe Suite and two thatched Luxury Suites, each with a heated splash pool."),
   ("Is there Wi-Fi and phone signal?", "Wi-Fi is limited because of the remote location, and cell reception is limited too."),
   ("Is Camp Kipwe good for children?", "Yes. The camp is child friendly. Children under 3 stay free, and children aged 3 to 12 sleep in a children's tent or on camping beds in their parents' room."),
   ("What power and payment options are there?", "220/240V power with a backup generator. The camp accepts Mastercard and Visa, and Namibian dollars, rand and US dollars."),
  ],
  sources=[("Chiwani Safari Camps: Camp Kipwe", "https://www.chiwani.com/kipwe"),
           ("Chiwani: Kipwe bungalows", "https://www.chiwani.com/kipebungalows"),
           ("Chiwani: Kipwe Suite", "https://www.chiwani.com/kipwesuite"),
           ("Chiwani: Kipwe Luxury Suites", "https://www.chiwani.com/kipweluxurysuites")],
 ),
 dict(
  slug="etosha-oberland-lodge", code="eo", lodge="Etosha Oberland Lodge", region="South Etosha",
  title="Etosha Oberland Lodge: On Etosha's Southern Border",
  seo="Etosha Oberland Lodge: Chalets, Game Drives & FAQs",
  desc="Etosha Oberland Lodge borders Etosha National Park. Chalets, full board, Wi-Fi, children and guided Etosha drives, answered, with trade rates.",
  nr="/south-etosha-accommodation/etosha-oberland-lodge/", dt="/namibia-accommodation/etosha-oberland-lodge/",
  imgs=[W+"201088/ondili_etosha_21_rgb_v1_web.jpg?fmt=jpg",
        W+"201088/ondili_etosha_16_rgb_v1_web.jpg?fmt=jpg",
        W+"201088/ondili_etosha_07_rgb_v1_web.jpg?fmt=jpg",
        W+"201088/ondili_etosha_20_rgb_v1_web.jpg?fmt=jpg"],
  answer="Etosha Oberland Lodge is an Ondili lodge on a private game reserve of about 5,000 hectares that shares a 10 km border with Etosha National Park, 12 km from the park. It has 15 chalets including 3 family chalets, runs on full board, has Wi-Fi in the chalets and offers guided Etosha drives for guests over 12.",
  intro=[
   "The lodge looks out over open tree savanna and two waterholes from its infinity pool. The whole lodge runs on solar power.",
   "Each 75 m² chalet has air-conditioning, an outside shower and a private shaded terrace. Dinner is five courses after sunset, inside or outside by the waterholes, and sundowners are part of the day.",
  ],
  faq=[
   ("Is Etosha Oberland Lodge inside Etosha National Park?", "No. It is on a private game reserve of about 5,000 hectares that shares a 10 km border with Etosha National Park, 12 km from the park."),
   ("How many chalets are there?", "15 chalets, including 3 family chalets. There are also 5 rooms for tour guides and pilots."),
   ("What is in the chalets?", "Each 75 m² chalet has air-conditioning, a barrier-free shower and an outside shower, a fridge/minibar, tea and coffee, mosquito nets, a hair dryer, a safe and a private terrace."),
   ("What is the meal plan?", "Full board. Dinner is a five-course meal served after sunset."),
   ("Is there Wi-Fi in the chalets?", "Yes, there is Wi-Fi in the chalets."),
   ("Does the lodge run game drives into Etosha?", "Yes. Guided drives into Etosha take 7 to 8 hours by 4x4 and include park entrance fees, an early breakfast and lunch packs. They need at least two guests (or a single supplement), take at most six guests per vehicle, and are for stays of two nights or more."),
   ("Are children welcome?", "Yes, children of all ages are welcome at the lodge. The guided Etosha game drives are for children over 12 only."),
   ("Can I fly in?", "Yes. The lodge has a hard-surface landing strip."),
  ],
  sources=[("Ondili: Etosha Oberland Lodge", "https://www.ondili.com/en/lodges-en/etosha-oberland-lodge/"),
           ("Expert Africa: info from the owner", "https://expertafrica.com/namibia/etosha-national-park/etosha-oberland-lodge/info-from-owner")],
 ),
 dict(
  slug="the-weinberg-windhoek", code="tw", lodge="The Weinberg Windhoek", region="Windhoek",
  title="The Weinberg Windhoek: A First Night in Namibia",
  seo="The Weinberg Windhoek: Rooms, Airport Transfers & FAQs",
  desc="The Weinberg, a Gondwana boutique hotel in central Windhoek. Check-in, airport transfers, rooms, children and the pool, answered, with trade rates.",
  nr="/windhoek-accommodation/the-weinberg-windhoek/", dt="/namibia-accommodation/the-weinberg-windhoek/",
  imgs=[W+"143053/awbh_hotel_courtyard_lrg1.jpg?fmt=jpg",
        W+"143053/culb.jpg?fmt=jpg",
        W+"143053/awbh_lobby_l2_sml.jpg?fmt=jpg",
        W+"143053/skylounge_view2_sml.jpg?fmt=jpg"],
  answer="The Weinberg is a Gondwana Collection boutique hotel on the Am Weinberg Estate in central Windhoek. Breakfast, Wi-Fi and a minibar with selected drinks are included, the hotel can arrange airport transfers, and we recommend it as a first night before you collect your hire car.",
  intro=[
   "The name means “vineyard” in German. The hotel wraps around a heritage building at the heart of the Am Weinberg Estate, blending old-world splendour with modern lines.",
   "The estate has restaurants in different culinary styles and the Life Day Spa, and the hotel's Sky Lounge serves light meals and wine with views over Windhoek.",
  ],
  faq=[
   ("Is The Weinberg a good first night in Namibia?", "Yes. We recommend it as a first night in Windhoek before you collect your hire car."),
   ("What time is check-in and check-out?", "Check-in is from 14:00, with early check-in subject to availability. Check-out is at 10:00, with late check-out on request."),
   ("Can the hotel arrange airport transfers?", "Yes. Airport transfers can be organised through the hotel, subject to availability, from Hosea Kutako International Airport and Eros Airport on request."),
   ("What is included in the rate?", "Breakfast, a minibar with selected drinks, unlimited Wi-Fi and use of the safe. The hotel has a 24-hour front desk and 24-hour security."),
   ("What rooms are there?", "Courtyard rooms (fountain level and upper level), Superior rooms, Lofts, Family Lofts and the two-bedroom Terrace Suite with its own double garage."),
   ("Is The Weinberg good for families?", "Yes. Children are welcome and stay free up to 5 years. The 7 Family Lofts sleep 2 adults and 2 children under 12."),
   ("Is there a pool?", "The pool is for spa clients only."),
   ("Where can I eat?", "The Sky Lounge serves light meals, wine and drinks, and the Am Weinberg Estate has restaurants in different culinary styles."),
   ("Can I take a shuttle from Windhoek to Sossusvlei, Swakopmund or Etosha?", "Yes. Gondwana's Go2 shuttle leaves from the Windhoek Fuel Centre for Kalahari Anib, Sesriem, Swakopmund and Etosha. Book shuttles in advance."),
   ("Are pets allowed, and which cards are accepted?", "No pets. The hotel accepts Visa and Mastercard, and there is an ATM."),
  ],
  sources=[("Gondwana Collection: The Weinberg", "https://gondwana-collection.com/accommodation/the-weinberg")],
 ),
 dict(
  slug="strand-hotel-swakopmund", code="sh", lodge="Strand Hotel Swakopmund", region="Swakopmund",
  title="Strand Hotel Swakopmund: Rooms, Dining and What Guests Ask",
  seo="Strand Hotel Swakopmund: Sea-View Rooms, Dining & FAQs",
  desc="Strand Hotel on the Mole in Swakopmund. Sea-view rooms, family rooms, restaurants, breakfast, parking and Wi-Fi, answered, with trade rates.",
  nr="/swakopmund-accommodation/strand-hotel-swakopmund/", dt="/namibia-accommodation/strand-hotel/",
  imgs=[W+"1747/_hab4490.jpg?fmt=jpg",
        W+"1747/standard_double_room12.jpg?fmt=jpg",
        W+"1747/standard_twin_room11.jpg?fmt=jpg",
        W+"1747/standard_room_bathroom.jpg?fmt=jpg"],
  answer="The Strand Hotel is a four-star O&L Leisure hotel with 125 en-suite rooms on the Mole in Swakopmund, with the Atlantic on three sides. Rates include breakfast, Wi-Fi in the rooms is free, parking on site is free and secure, and the town centre is a short walk away.",
  intro=[
   "The hotel stands on the Mole, surrounded by the Atlantic Ocean on three sides and the Namib dunes on the fourth. It is part of O&L Leisure.",
   "Rooms run from the 28 m² Standard Room to the 125–150 m² Presidential Suite. For food there is Brewer & Butcher with its own in-house brewery, the Ocean Cellar for oysters and seafood, the Farmhouse Deli, the Welwitschia Lounge on a sea-facing terrace and Café Mole at the beach entrance.",
  ],
  faq=[
   ("Where is the Strand Hotel in Swakopmund?", "On the Mole, with the Atlantic Ocean on three sides and the Namib dunes on the fourth. The town centre is a short walk away."),
   ("Which rooms have a sea view?", "Standard Rooms come with or without a sea view. Luxury Rooms 1 and 2 have a partial sea view, and Luxury Room 3, the Junior Suite, the Luxury Suite and the Presidential Suite all face the sea."),
   ("Does the Strand Hotel have family rooms?", "Yes. The Standard Family Room takes up to 3 guests, Connecting Rooms up to 4, and Luxury Room 1, the Junior Suite and the Luxury Suite up to 4. There is also a Standard Enabled Room."),
   ("What time is check-in and check-out?", "Arrival from 14:00 and departure by 10:00."),
   ("Is breakfast included?", "Yes, rates include breakfast. It is served at the Farmhouse Deli from 06h00."),
   ("Where can I eat at the hotel?", "Brewer & Butcher (restaurant, bar and lounge with an in-house brewery), the Ocean Cellar (seafood and oysters), the Farmhouse Deli (walk-ins welcome), the Welwitschia Lounge (cocktails on a sea-facing terrace) and Café Mole (street food at the Mole beach entrance)."),
   ("Is there parking?", "Yes. Parking on site is free and secure."),
   ("Is there Wi-Fi?", "Yes. Wi-Fi in the rooms is free."),
   ("Is there a spa?", "Yes. The Atlantic Spa has crystal steam rooms, rain showers, a relaxation lounge and an outdoor couple's therapy suite, and there is a gym."),
  ],
  sources=[("O&L Leisure: Strand Hotel Swakopmund", "https://www.ol-leisure.com/destinations/coastal"),
           ("O&L Leisure: rooms", "https://www.ol-leisure.com/destinations/coastal/strand-hotel-swakopmund-rooms"),
           ("O&L Leisure: restaurants", "https://www.ol-leisure.com/destinations/coastal/strand-hotel-swakopmund-restaurants"),
           ("O&L Leisure: Atlantic Spa", "https://www.ol-leisure.com/destinations/coastal/strand-wellness")],
 ),
]

e = html.escape

HEAD = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>@@TITLE@@</title>
<meta name="description" content="@@DESC@@">
<link rel="canonical" href="https://namibiarates.com@@PATH@@">
<meta property="og:title" content="@@OGT@@">
<meta property="og:description" content="@@DESC@@">
<meta property="og:image" content="@@IMG@@">
<meta property="og:type" content="@@OGTYPE@@">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600&family=Jost:wght@300;400;500&family=Pinyon+Script&display=swap" rel="stylesheet">
<style>
:root{--brand-accent:#a48256;--brand-green:#87a996;--text-main:#3c3530;--text-muted:#7d756e;--ink:#2F5450;--bg-color:#eae9e6;--panel:#f6f5f2;--line:rgba(164,130,86,0.25);--font-head:'Cinzel',serif;--font-body:'Jost',sans-serif}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:var(--font-body);background:var(--bg-color);color:var(--text-main);line-height:1.7;font-weight:300;-webkit-font-smoothing:antialiased}
a{color:var(--brand-accent)}
img{max-width:100%;display:block}
.main-header #hdr-signup-btn{background:transparent!important;border:1px solid var(--brand-accent)!important;color:var(--brand-accent)!important;font-family:var(--font-head)!important}
.main-header #hdr-signup-btn:hover{background:var(--brand-accent)!important;color:#fff!important}
.main-header #hdr-agent-btn{background:var(--brand-green)!important;border:1px solid var(--brand-green)!important;color:#fff!important;font-family:var(--font-head)!important}
.main-header #hdr-agent-btn:hover{background:var(--brand-accent)!important;border-color:var(--brand-accent)!important}
.bl-hero{position:relative;min-height:440px;height:62vh;max-height:620px;display:flex;align-items:flex-end;background:#3c3530 center/cover no-repeat}
.bl-hero::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(20,18,16,.05) 30%,rgba(20,18,16,.62))}
.bl-hero-in{position:relative;z-index:1;width:100%;max-width:1100px;margin:0 auto;padding:0 28px 46px;color:#fff}
.bl-eyebrow{font-size:.72rem;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,.85)}
.bl-hero h1{font-family:var(--font-head);font-weight:400;font-size:clamp(1.9rem,4vw,3.1rem);line-height:1.15;margin-top:10px;max-width:880px;text-wrap:balance;color:rgba(255,255,255,.95)}
.bl-meta{margin-top:12px;font-size:.85rem;color:rgba(255,255,255,.8)}
.bl-wrap{max-width:780px;margin:0 auto;padding:44px 24px 70px;color:var(--ink)}
.bl-crumb{font-size:.72rem;letter-spacing:2px;text-transform:uppercase;margin-bottom:26px}
.bl-crumb a{color:var(--text-muted);text-decoration:none}.bl-crumb a:hover{color:var(--brand-accent)}
.bl-answer{background:var(--panel);border-left:3px solid var(--brand-green);border-radius:0 10px 10px 0;padding:20px 24px;margin-bottom:30px;font-size:1.06rem}
.bl-answer b{display:block;font-family:var(--font-head);font-weight:500;color:var(--brand-accent);font-size:.8rem;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px}
.bl-wrap p{margin-bottom:18px;font-size:1.02rem}
.bl-wrap h2{font-family:var(--font-head);font-weight:500;color:var(--brand-accent);font-size:1.5rem;margin:44px 0 18px;text-wrap:balance}
.bl-wrap h2 .cur{font-family:'Pinyon Script',cursive;text-transform:none;font-size:1.25em;color:var(--ink);font-weight:400}
.bl-strip{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:30px 0 8px}
.bl-strip img{width:100%;height:auto;aspect-ratio:4/3;object-fit:cover;border-radius:8px}
.bl-faq{border-top:1px solid var(--line)}
.bl-faq details{border-bottom:1px solid var(--line);padding:16px 0}
.bl-faq summary{cursor:pointer;list-style:none;font-weight:500;font-size:1.04rem;display:flex;justify-content:space-between;gap:14px;color:var(--ink)}
.bl-faq summary::-webkit-details-marker{display:none}
.bl-faq summary::after{content:"+";color:var(--brand-accent);font-size:1.3rem;line-height:1}
.bl-faq details[open] summary::after{content:"\\2013"}
.bl-faq details p{margin:10px 0 0;font-size:1rem}
.bl-faq summary:focus-visible{outline:2px solid var(--brand-accent);outline-offset:4px}
.bl-book{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-top:6px}
.bl-btn{display:flex;flex-direction:column;gap:4px;padding:18px 20px;border-radius:10px;text-decoration:none;border:1px solid var(--line);background:var(--panel);transition:.25s}
.bl-btn:hover{border-color:var(--brand-accent);transform:translateY(-2px)}
.bl-btn span{font-size:.68rem;letter-spacing:2px;text-transform:uppercase;color:var(--text-muted)}
.bl-btn strong{font-family:var(--font-head);font-weight:500;color:var(--brand-accent);font-size:1.02rem}
.bl-btn.solid{background:var(--brand-green);border-color:var(--brand-green)}
.bl-btn.solid span{color:rgba(255,255,255,.85)}.bl-btn.solid strong{color:#fff}
.bl-itins{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.bl-itin{display:flex;flex-direction:column;gap:6px;padding:16px 18px;background:#fff;border-radius:10px;text-decoration:none;border:1px solid transparent;box-shadow:0 4px 18px rgba(60,53,48,.06);transition:.25s}
.bl-itin:hover{border-color:var(--brand-accent)}
.bl-itin span{font-size:.66rem;letter-spacing:2px;text-transform:uppercase;color:var(--brand-green);font-weight:500}
.bl-itin strong{font-weight:400;color:var(--ink);font-size:.98rem;line-height:1.4}
.bl-src{margin-top:44px;padding-top:18px;border-top:1px solid var(--line);font-size:.86rem;color:var(--text-muted)}
.bl-src a{color:var(--text-muted)}
.bl-src ul{margin:6px 0 10px 18px}
@media(max-width:640px){.bl-strip{grid-template-columns:repeat(2,minmax(0,1fr))}.bl-strip img:nth-child(3){display:none}.bl-book,.bl-itins{grid-template-columns:minmax(0,1fr)}.bl-hero{min-height:380px}}
/* index */
.bi-intro{text-align:center;padding:56px 24px 10px}
.bi-intro h1{font-family:var(--font-head);font-weight:500;font-size:2.5rem;color:var(--brand-accent)}
.bi-intro p{max-width:620px;margin:12px auto 0;color:var(--text-muted)}
.bi-grid{max-width:1180px;margin:0 auto;padding:34px 24px 80px;display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:26px}
.bi-card{display:flex;flex-direction:column;background:#fff;border-radius:12px;overflow:hidden;text-decoration:none;color:var(--ink);box-shadow:0 6px 24px rgba(60,53,48,.07);transition:.3s}
.bi-card:hover{transform:translateY(-3px);box-shadow:0 14px 36px rgba(60,53,48,.12)}
.bi-card img{width:100%;height:auto;aspect-ratio:16/10;object-fit:cover}
.bi-card div{padding:18px 20px 22px;display:flex;flex-direction:column;gap:8px}
.bi-card span{font-size:.66rem;letter-spacing:2px;text-transform:uppercase;color:var(--brand-green);font-weight:500}
.bi-card h2{font-family:var(--font-head);font-weight:500;font-size:1.12rem;line-height:1.35;color:var(--brand-accent)}
.bi-card p{font-size:.92rem;color:var(--text-muted)}
</style>
<script type="application/ld+json">@@LD@@</script>
</head>
<body>
"""

FOOT = """<script src="/assets/site-chrome.js"></script>
</body>
</html>
"""

def fill(t, **kw):
    for k, v in kw.items():
        t = t.replace("@@%s@@" % k.upper(), v)
    return t

def itins_for(code):
    return [i for i in ITINS if code in i[3].split()]

def post_html(p):
    path = "/blog/%s/" % p["slug"]
    its = itins_for(p["code"])
    ld = [
        {"@context": "https://schema.org", "@type": "BlogPosting", "headline": p["title"],
         "description": p["desc"], "image": p["imgs"][0], "datePublished": PUBLISHED, "dateModified": PUBLISHED,
         "mainEntityOfPage": "https://namibiarates.com" + path,
         "publisher": {"@type": "Organization", "name": "Namibia Rates", "url": "https://namibiarates.com/"},
         "about": {"@type": "LodgingBusiness", "name": p["lodge"], "url": "https://namibiarates.com" + p["nr"]}},
        {"@context": "https://schema.org", "@type": "FAQPage",
         "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in p["faq"]]},
    ]
    o = [fill(HEAD, title=e(p["seo"]) + " | Namibia Rates", desc=e(p["desc"]), path=path, ogt=e(p["title"]),
                     img=e(p["imgs"][0]), ogtype="article", ld=json.dumps(ld, ensure_ascii=False).replace("</", "<\\/"))]
    o.append('<section class="bl-hero" style="background-image:url(\'%s\')"><div class="bl-hero-in">' % e(p["imgs"][0]))
    o.append('<div class="bl-eyebrow">%s &middot; Lodge Guide</div><h1>%s</h1>' % (e(p["region"]), e(p["title"])))
    o.append('<div class="bl-meta">Published %s</div></div></section>' % PUB_HUMAN)
    o.append('<main class="bl-wrap"><nav class="bl-crumb"><a href="/blog/">Blog</a> &nbsp;/&nbsp; <a href="%s">%s</a></nav>' % (p["nr"], e(p["lodge"])))
    o.append('<div class="bl-answer"><b>In short</b>%s</div>' % e(p["answer"]))
    for para in p["intro"]:
        o.append("<p>%s</p>" % e(para))
    o.append('<div class="bl-strip">%s</div>' % "".join(
        '<img src="%s" alt="%s" loading="lazy" width="640" height="480">' % (e(u), e(p["lodge"])) for u in p["imgs"][1:4]))
    o.append('<h2>What travellers <span class="cur">ask</span></h2><div class="bl-faq">')
    for i, (q, a) in enumerate(p["faq"]):
        o.append('<details%s><summary>%s</summary><p>%s</p></details>' % (" open" if i == 0 else "", e(q), e(a)))
    o.append("</div>")
    o.append("<h2>Rates and booking</h2><div class=\"bl-book\">")
    o.append('<a class="bl-btn solid" href="%s"><span>Namibia Rates</span><strong>%s rates</strong></a>' % (p["nr"], e(p["lodge"])))
    o.append('<a class="bl-btn" href="%s%s" target="_blank" rel="noopener"><span>Desert Tracks</span><strong>Book a stay</strong></a></div>' % (DT, p["dt"]))
    if its:
        o.append('<h2>Safaris that stay <span class="cur">here</span></h2><p>%d Desert Tracks itineraries include %s:</p><div class="bl-itins">' % (len(its), e(p["lodge"])))
        for path_, t, kind, _ in its:
            o.append('<a class="bl-itin" href="%s%s" target="_blank" rel="noopener"><span>%s</span><strong>%s</strong></a>' % (DT, path_, e(kind), e(t)))
        o.append("</div>")
    o.append('<div class="bl-src"><strong>Sources</strong><ul>')
    for name, url in p["sources"]:
        o.append('<li><a href="%s" target="_blank" rel="noopener nofollow">%s</a></li>' % (e(url), e(name)))
    o.append("</ul>Lodge details checked against these pages on %s. Recommendations and on-the-ground details are from Desert Tracks. Rates are on the lodge's Namibia Rates page.</div>" % PUB_HUMAN)
    o.append("</main>")
    o.append(FOOT)
    return "".join(o)

def index_html():
    ld = {"@context": "https://schema.org", "@type": "Blog", "name": "Namibia Rates Blog", "url": "https://namibiarates.com/blog/",
          "blogPost": [{"@type": "BlogPosting", "headline": p["title"], "url": "https://namibiarates.com/blog/%s/" % p["slug"], "datePublished": PUBLISHED} for p in POSTS]}
    o = [fill(HEAD, title="Lodge Guides | Namibia Rates Blog", desc="Lodge guides from Namibia Rates: the questions travellers ask about Namibia's lodges, answered from the lodges' own information, with links to trade rates.",
                     path="/blog/", ogt="Namibia Rates Blog", img=e(POSTS[0]["imgs"][0]), ogtype="website", ld=json.dumps(ld, ensure_ascii=False))]
    o.append('<section class="bi-intro"><h1>Lodge Guides</h1><p>The questions travellers ask about Namibia’s lodges, answered from each lodge’s own information, with links to rates and to the safaris that stay there.</p></section><div class="bi-grid">')
    for p in POSTS:
        o.append('<a class="bi-card" href="/blog/%s/"><img src="%s" alt="%s" loading="lazy"><div><span>%s</span><h2>%s</h2><p>%s</p></div></a>' % (
            p["slug"], e(p["imgs"][0]), e(p["lodge"]), e(p["region"]), e(p["title"]), e(p["desc"])))
    o.append("</div>")
    o.append(FOOT)
    return "".join(o)

def write(rel, s):
    fp = os.path.join(ROOT, rel)
    os.makedirs(os.path.dirname(fp), exist_ok=True)
    tmp = fp + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        f.write(s)
    os.replace(tmp, fp)
    print("wrote", rel, len(s))

if __name__ == "__main__":
    for p in POSTS:
        write("blog/%s/index.html" % p["slug"], post_html(p))
    write("blog/index.html", index_html())
    feed = [{"slug": p["slug"], "title": p["title"], "lodge": p["lodge"], "region": p["region"],
             "img": p["imgs"][0], "url": "/blog/%s/" % p["slug"], "date": PUBLISHED} for p in POSTS]
    write("assets/blog-posts.json", json.dumps(feed, ensure_ascii=False, indent=0))
