import json
import re

json_path = "/Users/jaunhusselmann/Downloads/10-Day Namibia Honeymoon Luxury Fly-In Safari.json"
template_path = "/Users/jaunhusselmann/Desktop/AG Projects/dt_library/11_day_namibia_wildlife_safari.html"
output_path = "/Users/jaunhusselmann/Desktop/AG Projects/dt_library/10_day_namibia_honeymoon_luxury_fly_in_safari.html"

with open(json_path, 'r') as f:
    data = json.load(f)

with open(template_path, 'r') as f:
    html = f.read()

# 1. Replace titles and hero strings
html = html.replace("<title>11-Day Namibia Wildlife Safari</title>", "<title>10-Day Namibia Honeymoon Luxury Fly-In Safari</title>")
html = html.replace('data-default-title="11-Day Namibia<br>Wildlife Safari"', 'data-default-title="10-Day Namibia Honeymoon<br>Luxury Fly-In Safari"')
html = html.replace('11-Day Namibia<br>Wildlife Safari', '10-Day Namibia Honeymoon<br>Luxury Fly-In Safari')

        # HERO IMAGE REPLACEMENT
        try:
            # For the single-job scripts, data is parsed directly. For multi-job it's in the loop.
            # We assume 'data' is the loaded JSON object in context.
            hero_img = data.get('top_carousel', [{'image': 'https://wetu.com/imageHandler/c1920x1080/469/etosha_national_park-istock-925720816.jpg?fmt=jpg'}])[0].get('image', 'https://wetu.com/imageHandler/c1920x1080/469/etosha_national_park-istock-925720816.jpg?fmt=jpg')
            html = html.replace('https://wetu.com/imageHandler/c1920x1080/469/etosha_national_park-istock-925720816.jpg?fmt=jpg', hero_img)
        except Exception as e:
            print("Hero image replace failed:", e)

# 2. Hero Backgrounds - Using Little Kulala
html = html.replace('https://wetu.com/imageHandler/c1920x1080/469/etosha_national_park-istock-925720816.jpg?fmt=jpg', 'https://wetu.com/imageHandler/c1920x1080/1519/17_little_kulala_red_sand_dunes_0374.jpg?fmt=jpg')

# 3. Subtitle and Intro
html = re.sub(r'A\s*bespoke self-drive journey through iconic landscapes', 'An unforgettable, deeply romantic fly-in journey through Namibia’s most breathtaking landscapes.', html, flags=re.DOTALL)

intro_old = "Discover Namibia at your own pace while staying at some of the country’s most exceptional lodges. From the dramatic red dunes of Sossusvlei to the stark beauty of Damaraland and the prolific wildlife of Etosha National Park, this carefully curated journey balances the freedom of independent travel with the reassurance of premium hospitality. With luxury accommodation, hand-picked experiences, and our bespoke navigation app to guide you, every detail is considered."
intro_new = "Celebrate your love in absolute exclusivity with this 10-day luxury fly-in honeymoon. Soaring over vast desert expanses, you will seamlessly connect Namibia’s most romantic and remote destinations—from the towering red dunes of Sossusvlei to the wild, rugged beauty of Damaraland and the thriving wildlife sanctuaries bordering Etosha. With spectacular aerial views, deeply private luxury suites, and world-class hospitality, this is the ultimate romantic escape."
html = html.replace(intro_old, intro_new)

# 4. Glance Items (Destinations)
glance_html = ""
for i, item in enumerate(data.get('top_carousel', [])):
    day_target = str(i+1).zfill(2)
    img = item.get('image', '')
    acc = item.get('destination', '')
    glance_html += f'''                        <a href="#day-{day_target}" class="lux-acc-card">
                            <img src="{img}"
                                alt="{acc}">
                            <h4 class="lux-acc-title">{acc}</h4>
                            <p class="lux-acc-desc">Experience the luxury and tranquility of {acc}...</p>
                        </a>\n'''
                        
html = re.sub(r'<div class="lux-acc-grid">.*?</div>\s+</div>\s+<!-- // ANIMATED ROUTE MAP SECTION // -->', 
    f'<div class="lux-acc-grid">\n{glance_html}                    </div>\n                </div>\n\n                <!-- // ANIMATED ROUTE MAP SECTION // -->', 
    html, flags=re.DOTALL)


# 5. Waypoints
waypoints_str = '''                                const waypoints = [
                                    { id: '', name: 'Arrival', lodge: 'Windhoek', nights: 'START', coords: [-22.5609, 17.0658] },
                                    { id: '1', name: 'Sossusvlei', lodge: 'Wilderness Little Kulala', nights: '2 NIGHTS', coords: [-24.81, 15.63] },
                                    { id: '2', name: 'Swakopmund', lodge: 'Strand Hotel Swakopmund', nights: '2 NIGHTS', coords: [-22.67, 14.52] },
                                    { id: '3', name: 'Damaraland', lodge: 'Wilderness Doro Nawas', nights: '2 NIGHTS', coords: [-20.53, 14.41] },
                                    { id: '4', name: 'Ongava', lodge: 'Horizon by Ongava', nights: '2 NIGHTS', coords: [-19.33, 15.93] },
                                    { id: '5', name: 'Windhoek', lodge: 'The Weinberg', nights: '1 NIGHT', coords: [-22.56, 17.06] },
                                    { id: '6', name: 'Departure', lodge: 'Hosea Kutako Airport', nights: 'DEPART', coords: [-22.48, 17.47] }
                                ];'''
html = re.sub(r'const waypoints = \[.*?\];', waypoints_str, html, flags=re.DOTALL)

# 6. Day Blocks
day_blocks = ""
prev_acc_name = "Luxury Lodge"
prev_bg = ""
prev_slides = ""

for i, item in enumerate(data['itinerary']):
    day_num = str(i+1).zfill(2)
    acc = item['accommodation']
    
    if acc.get('gallery_images') and len(acc['gallery_images']) > 0:
        acc_name = acc['name']
        bg = acc['gallery_images'][0]
        slides = ""
        for img in acc['gallery_images']:
            slides += f'''                                <div class="dt-film-card">
                                    <img src="{img}" alt="{acc_name}">
                                </div>\n'''
        prev_acc_name = acc_name
        prev_bg = bg
        prev_slides = slides
    else:
        acc_name = prev_acc_name
        bg = prev_bg
        slides = prev_slides
                                
    total = str(len(data['itinerary'])).zfill(2)
    
    # Handle the "Day 1 - 3" string from Wetu JSON
    raw_day_str = item.get('day', f'Day {day_num}')
    
    day_block = f'''                <!-- DAY {day_num} -->
                <div class="lux-day-block" id="day-{day_num}"
                    data-bg="{bg}"
                    data-region="{acc_name}">
                    <div class="lux-day-block-header">
                        <div class="lux-day-number-row">
                            <span class="lux-day-numeral">{day_num}</span>
                            <span class="lux-day-line"></span>
                            <span class="lux-day-location">{acc_name}</span>
                        </div>
                        <h3 class="lux-day-title">{raw_day_str}</h3>
                        <p class="lux-day-desc">{item.get('description', '')}</p>
                    </div>

                    <div class="dt-film-section">
                        <div class="dt-film-header">
                            <div>
                                <span class="dt-film-eyebrow">Accommodation Profile</span>
                                <h2 class="dt-film-title">{acc_name}</h2>
                            </div>
                            <div class="dt-film-counter">{day_num} <span>/ {total}</span></div>
                        </div>
                        
                        <div class="dt-film-track-wrap">
                            <div class="dt-film-track">
{slides}                            </div>
                        </div>

                        <div class="dt-film-footer">
                            <div class="dt-film-progress-wrap"><div class="dt-film-progress-bar" style="width: 0%;"></div></div>
                            <div class="dt-film-arrows">
                                <div class="dt-film-arrow dt-film-prev-btn"><svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"></polyline></svg></div>
                                <div class="dt-film-arrow dt-film-next-btn"><svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"></polyline></svg></div>
                            </div>
                        </div>
                    </div>
                </div>\n\n'''
    day_blocks += day_block

html = re.sub(r'<!-- DAY 01 -->.*?(?=<div class="lux-padding-wrapper" style="max-width: 900px;)', day_blocks, html, flags=re.DOTALL)

# 7. Bottom Carousel (Lodge Selection)
bottom_carousel_html = ""
for item in data.get('bottom_carousel', []):
    acc = item.get('accommodation', '')
    img = item.get('image', '')
    bottom_carousel_html += f'''                        <a href="#" target="_blank" class="lux-acc-card">
                            <img src="{img}" alt="{acc}">
                            <h4 class="lux-acc-title">{acc}</h4>
                        </a>\n'''

new_lodge_selection = f'''<div id="lodge-selection" class="lux-acc-grid-container"
                    style="margin-bottom: 4rem; padding-top: 2rem;">
                    <h2
                        style="color: #1F4F4B !important; font-family: 'Cinzel', serif; font-weight: 400; font-size: clamp(36px, 6vw, 46px); line-height: 1.2; letter-spacing: 0.3px; margin-bottom: 2rem; text-transform: uppercase;">
                        Lodge Selection</h2>
                    <div class="flex-scroll-hint">
                        <span>Swipe to explore</span>
                        <svg viewBox="0 0 24 24">
                            <path d="M5 12h14"></path>
                            <path d="m12 5 7 7-7 7"></path>
                        </svg>
                    </div>
                    <div class="lux-acc-grid">
{bottom_carousel_html}                    </div>
                </div>\n\n                '''

html = re.sub(r'<div id="lodge-selection" class="lux-acc-grid-container".*?(?=<!-- Verified Trust/Reviews Block -->)', new_lodge_selection, html, flags=re.DOTALL)
# 8. More Safaris Carousel
more_safaris_html = '''
                        <a href="https://wetu.com/ItineraryOutputs/Discovery/de75c783-8643-4e46-b0d6-114fbcd3f137" target="_blank" class="lux-acc-card">\n                            <img src="https://desert-tracks.com/wp-content/uploads/2024/08/Shipwreck-Lodge.jpg" alt="7-Day Namibia Desert, Dune &amp; Wildlife Fly-In Safari">\n                            <h4 class="lux-acc-title">7-Day Namibia Desert, Dune &amp; Wildlife Fly-In Safari</h4>\n                        </a>\n                        <a href="https://wetu.com/ItineraryOutputs/Discovery/4db02e36-a80a-4486-987a-251d707016c0" target="_blank" class="lux-acc-card">\n                            <img src="https://desert-tracks.com/wp-content/uploads/2025/04/Onguma-Camp-Kala-_1-scaled.jpg" alt="12-Day Namibia in Style – Luxury Fly-In Safari">\n                            <h4 class="lux-acc-title">12-Day Namibia in Style – Luxury Fly-In Safari</h4>\n                        </a>\n                        <a href="https://wetu.com/ItineraryOutputs/Discovery/cf8f5ef9-4740-4976-90d5-e644b2e25b4b" target="_blank" class="lux-acc-card">\n                            <img src="https://desert-tracks.com/wp-content/uploads/2025/09/01hoanibvalley-tentexterior.jpg" alt="10-Day Highlights of Namibia – Luxury Fly-In & Road Safari">\n                            <h4 class="lux-acc-title">10-Day Highlights of Namibia – Luxury Fly-In & Road Safari</h4>\n                        </a>\n                        <a href="https://wetu.com/ItineraryOutputs/Discovery/F959961B-5EA6-43DC-B713-5A2FB0928EB1" target="_blank" class="lux-acc-card">\n                            <img src="https://desert-tracks.com/wp-content/uploads/2025/04/Wilderness-Little-Kulala_3-scaled.jpg" alt="10-Day Namibia Honeymoon Luxury Fly-In Safari">\n                            <h4 class="lux-acc-title">10-Day Namibia Honeymoon Luxury Fly-In Safari</h4>\n                        </a>\n                        <a href="https://wetu.com/ItineraryOutputs/Discovery/d957f35f-76c0-4276-899d-ba04411b5e9e" target="_blank" class="lux-acc-card">\n                            <img src="https://desert-tracks.com/wp-content/uploads/2025/09/wildernessserracafema_6.jpg" alt="14-Day Luxury Namibia Drive &amp; Fly Photographic Safari">\n                            <h4 class="lux-acc-title">14-Day Luxury Namibia Drive &amp; Fly Photographic Safari</h4>\n                        </a>\n                        <a href="https://wetu.com/ItineraryOutputs/Discovery/2084D921-60AB-4B0F-8832-E857FD4D0E35" target="_blank" class="lux-acc-card">\n                            <img src="https://desert-tracks.com/wp-content/uploads/2025/09/kipwe1.jpg" alt="8-Day Namibia in Style – Luxury Fly-In Safari">\n                            <h4 class="lux-acc-title">8-Day Namibia in Style – Luxury Fly-In Safari</h4>\n                        </a>\n'''

new_lodge_selection = f'''<div id="lodge-selection" class="lux-acc-grid-container"
                    style="margin-bottom: 4rem; padding-top: 2rem;">
                    <h2
                        style="color: #1F4F4B !important; font-family: 'Cinzel', serif; font-weight: 400; font-size: clamp(36px, 6vw, 46px); line-height: 1.2; letter-spacing: 0.3px; margin-bottom: 2rem; text-transform: uppercase;">
                        Lodge Selection</h2>
                    <div class="flex-scroll-hint">
                        <span>Swipe to explore</span>
                        <svg viewBox="0 0 24 24">
                            <path d="M5 12h14"></path>
                            <path d="m12 5 7 7-7 7"></path>
                        </svg>
                    </div>
                    <div class="lux-acc-grid">
{lodge_carousel_html}                    </div>
                </div>

                <div id="more-safaris" class="lux-acc-grid-container"
                    style="margin-bottom: 4rem; padding-top: 2rem;">
                    <h2
                        style="color: #1F4F4B !important; font-family: 'Cinzel', serif; font-weight: 400; font-size: clamp(36px, 6vw, 46px); line-height: 1.2; letter-spacing: 0.3px; margin-bottom: 2rem; text-transform: uppercase;">
                        More Fly-In Safaris</h2>
                    <div class="flex-scroll-hint">
                        <span>Swipe to explore</span>
                        <svg viewBox="0 0 24 24">
                            <path d="M5 12h14"></path>
                            <path d="m12 5 7 7-7 7"></path>
                        </svg>
                    </div>
                    <div class="lux-acc-grid">
{more_safaris_html}                    </div>
                </div>\n\n                '''

html = re.sub(r'<div id="lodge-selection" class="lux-acc-grid-container".*?(?=<!-- Verified Trust/Reviews Block -->)', new_lodge_selection, html, flags=re.DOTALL)
# --- DYNAMIC COVERFLOW REPLACEMENT ---
html = html.replace('More Extraordinary Journeys', 'Explore More Fly-In Safaris')
html = re.sub(r'<div class="swiper-wrapper">.*?</div>\s+</div>\s+<!-- Custom Controls', f'<div class="swiper-wrapper">\n                            <a href="https://wetu.com/ItineraryOutputs/Discovery/de75c783-8643-4e46-b0d6-114fbcd3f137" target="_blank" class="swiper-slide dt-coverflow-slide">\n                                <img src="https://desert-tracks.com/wp-content/uploads/2024/08/Shipwreck-Lodge.jpg" alt="7-Day Namibia Desert, Dune &amp; Wildlife Fly-In Safari" loading="lazy">\n                                <div class="dt-slide-gradient"></div>\n                                <div class="dt-slide-content">\n                                    <span class="dt-slide-days">7 Days</span>\n                                    <h3 class="dt-slide-title">7-Day Namibia Desert, Dune &amp; Wildlife Fly-In Safari</h3>\n                                </div>\n                            </a>\n                            <a href="https://wetu.com/ItineraryOutputs/Discovery/4db02e36-a80a-4486-987a-251d707016c0" target="_blank" class="swiper-slide dt-coverflow-slide">\n                                <img src="https://desert-tracks.com/wp-content/uploads/2025/04/Onguma-Camp-Kala-_1-scaled.jpg" alt="12-Day Namibia in Style – Luxury Fly-In Safari" loading="lazy">\n                                <div class="dt-slide-gradient"></div>\n                                <div class="dt-slide-content">\n                                    <span class="dt-slide-days">12 Days</span>\n                                    <h3 class="dt-slide-title">12-Day Namibia in Style – Luxury Fly-In Safari</h3>\n                                </div>\n                            </a>\n                            <a href="https://wetu.com/ItineraryOutputs/Discovery/cf8f5ef9-4740-4976-90d5-e644b2e25b4b" target="_blank" class="swiper-slide dt-coverflow-slide">\n                                <img src="https://desert-tracks.com/wp-content/uploads/2025/09/01hoanibvalley-tentexterior.jpg" alt="10-Day Highlights of Namibia – Luxury Fly-In & Road Safari" loading="lazy">\n                                <div class="dt-slide-gradient"></div>\n                                <div class="dt-slide-content">\n                                    <span class="dt-slide-days">10 Days</span>\n                                    <h3 class="dt-slide-title">10-Day Highlights of Namibia – Luxury Fly-In & Road Safari</h3>\n                                </div>\n                            </a>\n                            <a href="https://wetu.com/ItineraryOutputs/Discovery/F959961B-5EA6-43DC-B713-5A2FB0928EB1" target="_blank" class="swiper-slide dt-coverflow-slide">\n                                <img src="https://desert-tracks.com/wp-content/uploads/2025/04/Wilderness-Little-Kulala_3-scaled.jpg" alt="10-Day Namibia Honeymoon Luxury Fly-In Safari" loading="lazy">\n                                <div class="dt-slide-gradient"></div>\n                                <div class="dt-slide-content">\n                                    <span class="dt-slide-days">10 Days</span>\n                                    <h3 class="dt-slide-title">10-Day Namibia Honeymoon Luxury Fly-In Safari</h3>\n                                </div>\n                            </a>\n                            <a href="https://wetu.com/ItineraryOutputs/Discovery/d957f35f-76c0-4276-899d-ba04411b5e9e" target="_blank" class="swiper-slide dt-coverflow-slide">\n                                <img src="https://desert-tracks.com/wp-content/uploads/2025/09/wildernessserracafema_6.jpg" alt="14-Day Luxury Namibia Drive &amp; Fly Photographic Safari" loading="lazy">\n                                <div class="dt-slide-gradient"></div>\n                                <div class="dt-slide-content">\n                                    <span class="dt-slide-days">14 Days</span>\n                                    <h3 class="dt-slide-title">14-Day Luxury Namibia Drive &amp; Fly Photographic Safari</h3>\n                                </div>\n                            </a>\n                            <a href="https://wetu.com/ItineraryOutputs/Discovery/2084D921-60AB-4B0F-8832-E857FD4D0E35" target="_blank" class="swiper-slide dt-coverflow-slide">\n                                <img src="https://desert-tracks.com/wp-content/uploads/2025/09/kipwe1.jpg" alt="8-Day Namibia in Style – Luxury Fly-In Safari" loading="lazy">\n                                <div class="dt-slide-gradient"></div>\n                                <div class="dt-slide-content">\n                                    <span class="dt-slide-days">8 Days</span>\n                                    <h3 class="dt-slide-title">8-Day Namibia in Style – Luxury Fly-In Safari</h3>\n                                </div>\n                            </a>\n                        </div>\n                    </div>\n                    <!-- Custom Controls', html, flags=re.DOTALL)


with open(output_path, 'w') as f:
    f.write(html)

# 8. Replace car icon with plane icon
car_svg = '<svg id="dt-car-svg" viewBox="0 0 100 100" fill="#ffffff"><path d="M 28 20 L 72 20 A 2 2 0 0 1 74 22 L 78 45 L 22 45 L 26 22 A 2 2 0 0 1 28 20" fill="none" stroke="#ffffff" stroke-width="5" /><path d="M 18 45 L 82 45 Q 85 45 86 48 L 88 56 L 88 75 L 12 75 L 12 56 L 14 48 Q 15 45 18 45" fill="#ffffff"/><rect x="8" y="55" width="10" height="25" rx="3" fill="#ffffff" /><rect x="82" y="55" width="10" height="25" rx="3" fill="#ffffff" /><circle cx="28" cy="58" r="6" fill="#C85F19" /><circle cx="72" cy="58" r="6" fill="#C85F19" /><rect x="40" y="54" width="2" height="12" rx="1" fill="#C85F19" /><rect x="45" y="54" width="2" height="12" rx="1" fill="#C85F19" /><rect x="50" y="54" width="2" height="12" rx="1" fill="#C85F19" /><rect x="55" y="54" width="2" height="12" rx="1" fill="#C85F19" /><rect x="60" y="54" width="2" height="12" rx="1" fill="#C85F19" /><rect x="25" y="68" width="6" height="3" rx="1" fill="#C85F19" /><rect x="69" y="68" width="6" height="3" rx="1" fill="#C85F19" /></svg>'
plane_svg = '<svg id="dt-car-svg" viewBox="0 0 24 24" fill="#ffffff" style="transform: rotate(45deg);"><path d="M21,16v-2l-8-5V3.5C13,2.67,12.33,2,11.5,2S10,2.67,10,3.5V9l-8,5v2l8-2.5V19l-2,1.5V22l3.5-1l3.5,1v-1.5L13,19v-5.5L21,16z"/></svg>'

with open(output_path, 'r') as f:
    html = f.read()

html = html.replace(car_svg, plane_svg)

with open(output_path, 'w') as f:
    f.write(html)

print("Generated 10_day_namibia_honeymoon_luxury_fly_in_safari.html successfully!")
