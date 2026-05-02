import json
import re

json_path = "/Users/jaunhusselmann/Downloads/12-Day Namibia in Style – Luxury Fly-In Safari.json"
template_path = "/Users/jaunhusselmann/Desktop/AG Projects/dt_library/11_day_namibia_wildlife_safari.html"
output_path = "/Users/jaunhusselmann/Desktop/AG Projects/dt_library/12_day_namibia_in_style_luxury_fly_in_safari.html"

with open(json_path, 'r') as f:
    data = json.load(f)

with open(template_path, 'r') as f:
    html = f.read()

# 1. Replace titles and hero strings
html = html.replace("<title>11-Day Namibia Wildlife Safari</title>", "<title>12-Day Namibia in Style \u2013 Luxury Fly-In Safari</title>")
html = html.replace('data-default-title="11-Day Namibia<br>Wildlife Safari"', 'data-default-title="12-Day Namibia In Style<br>Luxury Fly-In Safari"')
html = html.replace('11-Day Namibia<br>Wildlife Safari', '12-Day Namibia In Style<br>Luxury Fly-In Safari')

# 2. Hero Backgrounds
html = html.replace('https://wetu.com/imageHandler/c1920x1080/469/etosha_national_park-istock-925720816.jpg?fmt=jpg', 'https://wetu.com/imageHandler/c1920x1080/94631/hartmannvalley-shutterstock_1601943580_1.jpg?fmt=jpg')

# 3. Subtitle and Intro
html = re.sub(r'A\s*bespoke self-drive journey through iconic landscapes', 'An opulent aerial journey to Namibia’s most remote and breathtaking destinations.', html, flags=re.DOTALL)

intro_old = "Discover Namibia at your own pace while staying at some of the country’s most exceptional lodges. From the dramatic red dunes of Sossusvlei to the stark beauty of Damaraland and the prolific wildlife of Etosha National Park, this carefully curated journey balances the freedom of independent travel with the reassurance of premium hospitality. With luxury accommodation, hand-picked experiences, and our bespoke navigation app to guide you, every detail is considered."
intro_new = "Experience the absolute pinnacle of luxury travel with this 12-day fly-in safari, designed for those who seek uncompromising exclusivity. Soar across vast desert expanses, landing in some of the most remote and dramatic landscapes on Earth—from the hauntingly beautiful Skeleton Coast and the ancient Hartmann Valley to the wildlife-rich plains of Etosha. With spectacular aerial views, deeply private luxury suites, and world-class hospitality, this is Namibia presented in unmatched style."
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
    lambda m: f'<div class="lux-acc-grid">\n{glance_html}                    </div>\n                </div>\n\n                <!-- // ANIMATED ROUTE MAP SECTION // -->', 
    html, flags=re.DOTALL)

# 5. Waypoints
waypoints_str = '''                                const waypoints = [
                                    { id: '', name: 'Arrival', lodge: 'Windhoek', nights: 'START', coords: [-22.5609, 17.0658] },
                                    { id: '1', name: 'Sossusvlei', lodge: 'andBeyond Sossusvlei', nights: '3 NIGHTS', coords: [-24.81, 15.82] },
                                    { id: '2', name: 'Skeleton Coast', lodge: 'Shipwreck Lodge', nights: '2 NIGHTS', coords: [-19.16, 12.56] },
                                    { id: '3', name: 'Hartmann Valley', lodge: 'Wilderness Serra Cafema', nights: '2 NIGHTS', coords: [-17.06, 12.18] },
                                    { id: '4', name: 'Etosha East', lodge: 'Onguma Camp Kala', nights: '3 NIGHTS', coords: [-18.73, 17.04] },
                                    { id: '5', name: 'Okonjima', lodge: 'Okonjima African Villa', nights: '1 NIGHT', coords: [-20.85, 16.64] },
                                    { id: '6', name: 'Departure', lodge: 'Hosea Kutako Airport', nights: 'DEPART', coords: [-22.48, 17.47] }
                                ];'''
html = re.sub(r'const waypoints = \[.*?\];', lambda m: waypoints_str, html, flags=re.DOTALL)

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

html = re.sub(r'<!-- DAY 01 -->.*?(?=<div class="lux-padding-wrapper" style="max-width: 900px;)', lambda m: day_blocks, html, flags=re.DOTALL)

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

html = re.sub(r'<div id="lodge-selection" class="lux-acc-grid-container".*?(?=<!-- Verified Trust/Reviews Block -->)', lambda m: new_lodge_selection, html, flags=re.DOTALL)

# 8. Replace car icon with plane icon
car_svg = '<svg id="dt-car-svg" viewBox="0 0 100 100" fill="#ffffff"><path d="M 28 20 L 72 20 A 2 2 0 0 1 74 22 L 78 45 L 22 45 L 26 22 A 2 2 0 0 1 28 20" fill="none" stroke="#ffffff" stroke-width="5" /><path d="M 18 45 L 82 45 Q 85 45 86 48 L 88 56 L 88 75 L 12 75 L 12 56 L 14 48 Q 15 45 18 45" fill="#ffffff"/><rect x="8" y="55" width="10" height="25" rx="3" fill="#ffffff" /><rect x="82" y="55" width="10" height="25" rx="3" fill="#ffffff" /><circle cx="28" cy="58" r="6" fill="#C85F19" /><circle cx="72" cy="58" r="6" fill="#C85F19" /><rect x="40" y="54" width="2" height="12" rx="1" fill="#C85F19" /><rect x="45" y="54" width="2" height="12" rx="1" fill="#C85F19" /><rect x="50" y="54" width="2" height="12" rx="1" fill="#C85F19" /><rect x="55" y="54" width="2" height="12" rx="1" fill="#C85F19" /><rect x="60" y="54" width="2" height="12" rx="1" fill="#C85F19" /><rect x="25" y="68" width="6" height="3" rx="1" fill="#C85F19" /><rect x="69" y="68" width="6" height="3" rx="1" fill="#C85F19" /></svg>'
plane_svg = '<svg id="dt-car-svg" viewBox="0 0 24 24" width="100%" height="100%" fill="#ffffff" style="transform: rotate(45deg);"><path d="M21,16v-2l-8-5V3.5C13,2.67,12.33,2,11.5,2S10,2.67,10,3.5V9l-8,5v2l8-2.5V19l-2,1.5V22l3.5-1l3.5,1v-1.5L13,19v-5.5L21,16z"/></svg>'
html = html.replace(car_svg, plane_svg)

with open(output_path, 'w') as f:
    f.write(html)

print("Generated 12_day_namibia_in_style_luxury_fly_in_safari.html successfully!")
