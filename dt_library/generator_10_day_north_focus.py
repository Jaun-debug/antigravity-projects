import json
import re

json_path = "/tmp/data.json"
template_path = "/Users/jaunhusselmann/Desktop/AG Projects/dt_library/11_day_namibia_wildlife_safari.html"
output_path = "/Users/jaunhusselmann/Desktop/AG Projects/dt_library/10_day_ultra_luxury_namibia_safari_north_focus.html"

with open(json_path, 'r') as f:
    data = json.load(f)

with open(template_path, 'r') as f:
    html = f.read()

# 1. Replace titles and hero strings
html = html.replace("<title>11-Day Namibia Wildlife Safari</title>", "<title>10-Day Ultra-Luxury Namibia Safari - North Focus</title>")
html = html.replace('data-default-title="11-Day Namibia<br>Wildlife Safari"', 'data-default-title="10-Day Ultra-Luxury<br>Namibia Safari - North Focus"')
html = html.replace('11-Day Namibia<br>Wildlife Safari', '10-Day Ultra-Luxury<br>Namibia Safari - North Focus')

# 2. Hero Backgrounds
html = html.replace('https://wetu.com/imageHandler/c1920x1080/469/etosha_national_park-istock-925720816.jpg?fmt=jpg', 'https://wetu.com/imageHandler/c1920x1080/298045/gmundner_lodge_pool_area__outside-54.jpg?fmt=jpg')

# 3. Subtitle and Intro
html = html.replace('A bespoke journey across the contrasting landscapes of Namibia.', 'A bespoke journey across the striking landscapes of the North.')

intro_old = "Discover Namibia at your own pace while staying at some of the country’s most exceptional lodges. From the dramatic red dunes of Sossusvlei to the stark beauty of Damaraland and the prolific wildlife of Etosha National Park, this carefully curated journey balances the freedom of independent travel with the reassurance of premium hospitality. With luxury accommodation, hand-picked experiences, and our bespoke navigation app to guide you, every detail is considered."
intro_new = "Discover Namibia at an unhurried pace while staying at some of the country’s most exclusive lodges. From the tranquil wilderness of Gmundner Lodge to the dramatic landscapes of Damaraland, the intimacy of Little Ongava in Etosha, and the refined elegance of Epako and Omaanda, this journey blends privacy, indulgence, and unforgettable wildlife encounters. With private villas, fine dining, and tailored activities throughout, every moment is designed for absolute comfort and exclusivity."
html = html.replace(intro_old, intro_new)

# 4. Glance Items (Destinations)
glance_html = ""
for i, item in enumerate(data['top_carousel']):
    day_target = str(i+1).zfill(2)
    img = item['image']
    acc = item['destination']
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
                                    { id: '1', name: 'Gmundner Lodge', lodge: 'Gmundner Lodge', nights: '2 NIGHTS', coords: [-22.5, 17.1] },
                                    { id: '2', name: 'Damaraland', lodge: 'Onduli Ridge', nights: '2 NIGHTS', coords: [-20.5, 14.4] },
                                    { id: '3', name: 'Etosha South', lodge: 'Horizon by Ongava', nights: '2 NIGHTS', coords: [-19.33, 15.9] },
                                    { id: '4', name: 'Omaruru', lodge: 'Epako Safari Lodge', nights: '2 NIGHTS', coords: [-21.41, 15.93] },
                                    { id: '5', name: 'Windhoek East', lodge: 'Zannier Omaanda', nights: '1 NIGHT', coords: [-22.38, 17.47] },
                                    { id: '6', name: 'Windhoek (Departure)', lodge: 'Hosea Kutako Airport', nights: 'DEPART', coords: [-22.48, 17.47] }
                                ];'''
html = re.sub(r'const waypoints = \[.*?\];', waypoints_str, html, flags=re.DOTALL)

# 6. Day Blocks
day_blocks = ""
for i, item in enumerate(data['itinerary']):
    day_num = str(i+1).zfill(2)
    acc = item['accommodation']
    acc_name = acc['name']
    bg = acc['gallery_images'][0] if acc['gallery_images'] else ''
    
    slides = ""
    for img in acc['gallery_images']:
        slides += f'''                                <div class="dt-film-card">
                                    <img src="{img}" alt="{acc_name}">
                                </div>\n'''
                                
    total = str(len(data['itinerary'])).zfill(2)
    
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
                        <h3 class="lux-day-title">{item['day']}</h3>
                        <p class="lux-day-desc">{item['description']}</p>
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

# Let's also make sure to use data-no-optimize="1" on the style and script tags if it's missing, but the 11-day master already has it!

with open(output_path, 'w') as f:
    f.write(html)

print("Generated 10_day_ultra_luxury_namibia_safari_north_focus.html successfully!")
