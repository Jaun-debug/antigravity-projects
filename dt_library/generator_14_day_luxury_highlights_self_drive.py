import json
import re

json_path = "/Users/jaunhusselmann/Downloads/14-Day Luxury Namibia Highlights Self-Drive Safari.json"
template_path = "/Users/jaunhusselmann/Desktop/AG Projects/dt_library/11_day_namibia_wildlife_safari.html"
output_path = "/Users/jaunhusselmann/Desktop/AG Projects/dt_library/component_24.html"

with open(json_path, 'r') as f:
    data = json.load(f)

with open(template_path, 'r') as f:
    html = f.read()

# 1. Replace titles and hero strings
html = html.replace("<title>11-Day Namibia Wildlife Safari</title>", "<title>14-Day Namibia Comfort Safari</title>")
html = html.replace('data-default-title="11-Day Namibia<br>Wildlife Safari"', 'data-default-title="14-Day Namibia<br>Comfort Safari"')
html = html.replace('11-Day Namibia<br>Wildlife Safari', '14-Day Namibia<br>Comfort Safari')

# HERO IMAGE REPLACEMENT
try:
    # For the single-job scripts, data is parsed directly. For multi-job it's in the loop.
    # We assume 'data' is the loaded JSON object in context.
    hero_img = data.get('top_carousel', [{'image': 'https://wetu.com/imageHandler/c1920x1080/469/etosha_national_park-istock-925720816.jpg?fmt=jpg'}])[0].get('image', 'https://wetu.com/imageHandler/c1920x1080/469/etosha_national_park-istock-925720816.jpg?fmt=jpg')
    html = html.replace('https://wetu.com/imageHandler/c1920x1080/469/etosha_national_park-istock-925720816.jpg?fmt=jpg', hero_img)
except Exception as e:
    print("Hero image replace failed:", e)

# 2. Hero Backgrounds - Using Sossusvlei dunes
html = html.replace('https://wetu.com/imageHandler/c1920x1080/469/etosha_national_park-istock-925720816.jpg?fmt=jpg', 'https://wetu.com/imageHandler/c1920x1080/468/Namib%201%201.jpg?fmt=jpg')

# 3. Subtitle and Intro
html = html.replace('A bespoke journey across the contrasting landscapes of Namibia.', 'The ultimate 14-day independent journey through Namibia’s most breathtaking landscapes.')

intro_old = "Discover Namibia at your own pace while staying at some of the country’s most exceptional lodges. From the dramatic red dunes of Sossusvlei to the stark beauty of Damaraland and the prolific wildlife of Etosha National Park, this carefully curated journey balances the freedom of independent travel with the reassurance of premium hospitality. With luxury accommodation, hand-picked experiences, and our bespoke navigation app to guide you, every detail is considered."
intro_new = "Embark on an unforgettable self-drive adventure across Namibia, blending absolute freedom with uncompromised luxury. From the golden sands of the Kalahari and the towering dunes of Sossusvlei, to the rugged beauty of Damaraland and the wildlife-rich plains of Etosha, this 14-day highlights tour is meticulously crafted for independent explorers. With premium 4x4 rentals, exclusive lodge bookings, and our bespoke navigation assistance, you can experience the wonders of Namibia at your own perfect pace."
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
                                    { id: '1', name: 'Kalahari', lodge: 'Kalahari Red Dunes Lodge', nights: '2 NIGHTS', coords: [-23.95, 17.58] },
                                    { id: '2', name: 'Sossusvlei', lodge: 'Hoodia Desert Lodge', nights: '2 NIGHTS', coords: [-24.81, 15.63] },
                                    { id: '3', name: 'Swakopmund', lodge: 'Strand Hotel Swakopmund', nights: '2 NIGHTS', coords: [-22.67, 14.52] },
                                    { id: '4', name: 'Damaraland', lodge: 'Camp Kipwe', nights: '2 NIGHTS', coords: [-20.53, 14.41] },
                                    { id: '5', name: 'Etosha South', lodge: 'Etosha Oberland Lodge', nights: '2 NIGHTS', coords: [-19.33, 15.93] },
                                    { id: '6', name: 'Erongo', lodge: 'Epako Safari Lodge', nights: '2 NIGHTS', coords: [-21.41, 15.93] },
                                    { id: '7', name: 'Windhoek', lodge: 'The Weinberg', nights: '1 NIGHT', coords: [-22.56, 17.06] },
                                    { id: '8', name: 'Departure', lodge: 'Hosea Kutako Airport', nights: 'DEPART', coords: [-22.48, 17.47] }
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
    
    # Intelligently inherit previous day's accommodation if Wetu export is missing images for activity days
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
    
    day_block = f'''                <!-- DAY {day_num} -->
                <div class="lux-day-block" id="day-{day_num}"
                    data-bg="{bg}"
                    data-region="{acc_name}">
                    <div class="lux-day-block-header">
                        <div class="lux-day-accordion-header">
                            <div class="lux-day-accordion-title">{acc_name} <span style="font-family: 'Open Sans', sans-serif; color: #7A8A8A; font-size: 0.9rem; letter-spacing: 1px;">(Accommodation Details)</span></div>
                            <div class="lux-day-accordion-icon">&minus;</div>
                        </div>
                        <div class="lux-day-accordion-content">
                            <div class="lux-day-number-row" style="display: flex; align-items: center; margin-bottom: 1.5rem;">
                                <span class="lux-day-numeral" style="font-family: 'Open Sans', sans-serif; font-weight: 300; font-size: clamp(3rem, 5vw, 4rem); color: #d87a4d; line-height: 1; letter-spacing: -0.02em;">{day_num}</span>
                                <div class="lux-day-line" style="flex-grow: 1; height: 1px; background-color: rgba(216, 122, 77, 0.3); margin-left: 20px;"></div>
                            </div>
                            <h2 class="lux-day-title" style="font-family: 'Cinzel', serif; font-size: clamp(24px, 4vw, 32px); font-weight: 300; color: #1F4F4B; text-transform: uppercase; margin-bottom: 1.5rem; letter-spacing: 0.05em;">{item.get('day', f'Day {day_num}')}</h2>
                            <p class="lux-day-desc" style="font-family: 'Open Sans', sans-serif; font-size: clamp(1rem, 1.5vw, 1.125rem); line-height: 1.7; color: #5A6A6A; font-weight: 300; margin-bottom: 3.5rem; max-width: 45rem;">{item.get('description', '')}</p>
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
                </div> <!-- End lux-day-accordion-content -->
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
                        <a href="https://desert-tracks.com/18-days-hidden-treasures-of-namibia-safari/" target="_blank" class="lux-acc-card">\n                            <img src="https://desert-tracks.com/wp-content/uploads/2026/03/donkey-cart-solly-damaraland-large.jpeg" alt="Hidden Treasures Of Namibia">\n                            <h4 class="lux-acc-title">Hidden Treasures Of Namibia</h4>\n                        </a>\n                        <a href="https://desert-tracks.com/11-days-south-of-namibia-safari/" target="_blank" class="lux-acc-card">\n                            <img src="https://desert-tracks.com/wp-content/uploads/2025/10/sossuvlei_221kb.jpg" alt="South of Namibia">\n                            <h4 class="lux-acc-title">South of Namibia</h4>\n                        </a>\n                        <a href="https://desert-tracks.com/18-days-namibia-delta-chobe-vic-falls-safari/" target="_blank" class="lux-acc-card">\n                            <img src="https://desert-tracks.com/wp-content/uploads/2025/10/29c1a07ebd3fcf987a8cbfce29564ecda4c8c2cb01656ab89e940f236d2c438275cdee4f5a503b6939a5008af8e8e5445682ea5a966bd418fb17bd_1280-2.jpg" alt="Namibia, Delta &amp; Chobe">\n                            <h4 class="lux-acc-title">Namibia, Delta &amp; Chobe</h4>\n                        </a>\n                        <a href="https://desert-tracks.com/14-days-namibia-comfort-safari/" target="_blank" class="lux-acc-card">\n                            <img src="https://desert-tracks.com/wp-content/uploads/2026/03/solly_5112_4.jpg" alt="Best of Namibia">\n                            <h4 class="lux-acc-title">Best of Namibia</h4>\n                        </a>\n                        <a href="https://desert-tracks.com/11-days-wildlife-of-namibia-safari/" target="_blank" class="lux-acc-card">\n                            <img src="https://desert-tracks.com/wp-content/uploads/2026/03/solly-lion-and-cub-large.jpeg" alt="Namibia Wildlife">\n                            <h4 class="lux-acc-title">Namibia Wildlife</h4>\n                        </a>\n                        <a href="https://desert-tracks.com/17-days-namibia-chobe-vic-falls-safari/" target="_blank" class="lux-acc-card">\n                            <img src="https://desert-tracks.com/wp-content/uploads/2025/10/divava-1.jpg" alt="Namibia, Chobe &amp; Vic Falls">\n                            <h4 class="lux-acc-title">Namibia, Chobe &amp; Vic Falls</h4>\n                        </a>\n'''

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
                </div>

                <div id="more-safaris" class="lux-acc-grid-container"
                    style="margin-bottom: 4rem; padding-top: 2rem;">
                    <h2
                        style="color: #1F4F4B !important; font-family: 'Cinzel', serif; font-weight: 400; font-size: clamp(36px, 6vw, 46px); line-height: 1.2; letter-spacing: 0.3px; margin-bottom: 2rem; text-transform: uppercase;">
                        More Self-Drive Safaris</h2>
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
html = html.replace('More Extraordinary Journeys', 'Explore More Self-Drive Safaris')
html = re.sub(r'<div class="swiper-wrapper">.*?</div>\s+</div>\s+<!-- Custom Controls', f'<div class="swiper-wrapper">\n                            <a href="https://desert-tracks.com/18-days-hidden-treasures-of-namibia-safari/" target="_blank" class="swiper-slide dt-coverflow-slide">\n                                <img src="https://desert-tracks.com/wp-content/uploads/2026/03/donkey-cart-solly-damaraland-large.jpeg" alt="Hidden Treasures Of Namibia" loading="lazy">\n                                <div class="dt-slide-gradient"></div>\n                                <div class="dt-slide-content">\n                                    <span class="dt-slide-days">18 Days</span>\n                                    <h3 class="dt-slide-title">Hidden Treasures Of Namibia</h3>\n                                </div>\n                            </a>\n                            <a href="https://desert-tracks.com/11-days-south-of-namibia-safari/" target="_blank" class="swiper-slide dt-coverflow-slide">\n                                <img src="https://desert-tracks.com/wp-content/uploads/2025/10/sossuvlei_221kb.jpg" alt="South of Namibia" loading="lazy">\n                                <div class="dt-slide-gradient"></div>\n                                <div class="dt-slide-content">\n                                    <span class="dt-slide-days">11 Days</span>\n                                    <h3 class="dt-slide-title">South of Namibia</h3>\n                                </div>\n                            </a>\n                            <a href="https://desert-tracks.com/18-days-namibia-delta-chobe-vic-falls-safari/" target="_blank" class="swiper-slide dt-coverflow-slide">\n                                <img src="https://desert-tracks.com/wp-content/uploads/2025/10/29c1a07ebd3fcf987a8cbfce29564ecda4c8c2cb01656ab89e940f236d2c438275cdee4f5a503b6939a5008af8e8e5445682ea5a966bd418fb17bd_1280-2.jpg" alt="Namibia, Delta &amp; Chobe" loading="lazy">\n                                <div class="dt-slide-gradient"></div>\n                                <div class="dt-slide-content">\n                                    <span class="dt-slide-days">18 Days</span>\n                                    <h3 class="dt-slide-title">Namibia, Delta &amp; Chobe</h3>\n                                </div>\n                            </a>\n                            <a href="https://desert-tracks.com/14-days-namibia-comfort-safari/" target="_blank" class="swiper-slide dt-coverflow-slide">\n                                <img src="https://desert-tracks.com/wp-content/uploads/2026/03/solly_5112_4.jpg" alt="Best of Namibia" loading="lazy">\n                                <div class="dt-slide-gradient"></div>\n                                <div class="dt-slide-content">\n                                    <span class="dt-slide-days">14 Days</span>\n                                    <h3 class="dt-slide-title">Best of Namibia</h3>\n                                </div>\n                            </a>\n                            <a href="https://desert-tracks.com/11-days-wildlife-of-namibia-safari/" target="_blank" class="swiper-slide dt-coverflow-slide">\n                                <img src="https://desert-tracks.com/wp-content/uploads/2026/03/solly-lion-and-cub-large.jpeg" alt="Namibia Wildlife" loading="lazy">\n                                <div class="dt-slide-gradient"></div>\n                                <div class="dt-slide-content">\n                                    <span class="dt-slide-days">11 Days</span>\n                                    <h3 class="dt-slide-title">Namibia Wildlife</h3>\n                                </div>\n                            </a>\n                            <a href="https://desert-tracks.com/17-days-namibia-chobe-vic-falls-safari/" target="_blank" class="swiper-slide dt-coverflow-slide">\n                                <img src="https://desert-tracks.com/wp-content/uploads/2025/10/divava-1.jpg" alt="Namibia, Chobe &amp; Vic Falls" loading="lazy">\n                                <div class="dt-slide-gradient"></div>\n                                <div class="dt-slide-content">\n                                    <span class="dt-slide-days">16 Days</span>\n                                    <h3 class="dt-slide-title">Namibia, Chobe &amp; Vic Falls</h3>\n                                </div>\n                            </a>\n                        </div>\n                    </div>\n                    <!-- Custom Controls', html, flags=re.DOTALL)


with open(output_path, 'w') as f:
    f.write(html)

print("Generated component_24.html successfully!")
