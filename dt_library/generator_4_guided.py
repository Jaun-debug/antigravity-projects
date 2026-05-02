import json
import re

template_path = "/Users/jaunhusselmann/Desktop/AG Projects/dt_library/11_day_namibia_wildlife_safari.html"

jobs = [
    {
        "json_path": "/Users/jaunhusselmann/Downloads/2025 11-DAY JUST A QUICK VISIT (LUXURY) G.json",
        "output_path": "/Users/jaunhusselmann/Desktop/AG Projects/dt_library/component_37.html",
        "title": "11-Day Just A Quick Visit – Luxury Guided Safari",
        "html_title": "11-Day Just A Quick Visit<br>Luxury Guided Safari",
        "subtitle": "An expert-led journey through Namibia’s highlights in absolute comfort.",
        "bg": "https://wetu.com/imageHandler/c1920x1080/469/etosha_national_park-istock-925720816.jpg?fmt=jpg"
    },
    {
        "json_path": "/Users/jaunhusselmann/Downloads/2025 16-DAY NAM, CHOBE & VIC FALLS (LUXURY) G.json",
        "output_path": "/Users/jaunhusselmann/Desktop/AG Projects/dt_library/component_38.html",
        "title": "16-Day Namibia, Chobe & Vic Falls – Luxury Guided Safari",
        "html_title": "16-Day Namibia, Chobe & Vic Falls<br>Luxury Guided Safari",
        "subtitle": "A grand guided safari across three countries featuring spectacular wildlife.",
        "bg": "https://wetu.com/imageHandler/c1920x1080/469/etosha_national_park-istock-925720816.jpg?fmt=jpg"
    },
    {
        "json_path": "/Users/jaunhusselmann/Downloads/2025 16-DAY NAMIBIA AT A GLANCE (LUXURY) G.json",
        "output_path": "/Users/jaunhusselmann/Desktop/AG Projects/dt_library/component_39.html",
        "title": "16-Day Namibia At A Glance – Luxury Guided Safari",
        "html_title": "16-Day Namibia At A Glance<br>Luxury Guided Safari",
        "subtitle": "A comprehensive luxury guided exploration of Namibia's contrasting landscapes.",
        "bg": "https://wetu.com/imageHandler/c1920x1080/469/etosha_national_park-istock-925720816.jpg?fmt=jpg"
    },
    {
        "json_path": "/Users/jaunhusselmann/Downloads/16-DAY NAM, DELTA, CHOBE & VIC FALLS (STANDARD) G.json",
        "output_path": "/Users/jaunhusselmann/Desktop/AG Projects/dt_library/component_40.html",
        "title": "16-Day Nam, Delta, Chobe & Vic Falls – Standard Guided Safari",
        "html_title": "16-Day Nam, Delta, Chobe & Vic Falls<br>Standard Guided Safari",
        "subtitle": "An epic overland adventure connecting the Namib Desert to the roar of Victoria Falls.",
        "bg": "https://wetu.com/imageHandler/c1920x1080/469/etosha_national_park-istock-925720816.jpg?fmt=jpg"
    }
]

for job in jobs:
    try:
        with open(job['json_path'], 'r') as f:
            data = json.load(f)
            
        with open(template_path, 'r') as f:
            html = f.read()

        # 1. Replace titles and hero strings
        html = html.replace("<title>11-Day Namibia Wildlife Safari</title>", f"<title>{job['title']}</title>")
        html = html.replace('data-default-title="11-Day Namibia<br>Wildlife Safari"', f'data-default-title="{job["html_title"]}"')
        html = html.replace('11-Day Namibia<br>Wildlife Safari', job["html_title"])

        # 2. Subtitle and Intro
        html = re.sub(r'A\s*bespoke self-drive journey through iconic landscapes', lambda m: job["subtitle"], html, flags=re.DOTALL)

        intro_old = "Discover Namibia at your own pace while staying at some of the country’s most exceptional lodges. From the dramatic red dunes of Sossusvlei to the stark beauty of Damaraland and the prolific wildlife of Etosha National Park, this carefully curated journey balances the freedom of independent travel with the reassurance of premium hospitality. With luxury accommodation, hand-picked experiences, and our bespoke navigation app to guide you, every detail is considered."
        intro_new = "Embark on an unforgettable guided safari where every detail is taken care of. With a professional guide leading the way, you’ll uncover hidden gems, experience extraordinary wildlife encounters, and stay at carefully selected accommodations. From striking desert landscapes to lush wildlife sanctuaries, this immersive journey blends expert knowledge with premium comfort, ensuring a seamless and enriching adventure."
        html = html.replace(intro_old, intro_new)

        # 3. Glance Items (Destinations)
        glance_html = ""
        for i, item in enumerate(data.get('top_carousel', [])):
            day_target = str(i+1).zfill(2)
            img = item.get('image', '')
            acc = item.get('destination', '')
            glance_html += f'''                        <a href="#day-{day_target}" class="lux-acc-card">
                            <img src="{img}"
                                alt="{acc}">
                            <h4 class="lux-acc-title">{acc}</h4>
                            <p class="lux-acc-desc">Experience the magic of {acc}...</p>
                        </a>\n'''
                                
        html = re.sub(r'<div class="lux-acc-grid">.*?</div>\s+</div>\s+<!-- // ANIMATED ROUTE MAP SECTION // -->', 
            lambda m: f'<div class="lux-acc-grid">\n{glance_html}                    </div>\n                </div>\n\n                <!-- // ANIMATED ROUTE MAP SECTION // -->', 
            html, flags=re.DOTALL)

        # 4. Waypoints (just dummy for now, Wetu JSON doesn't provide coords easily)
        waypoints_str = '''                                const waypoints = [
                                    { id: '', name: 'Start', lodge: 'Arrival', nights: 'START', coords: [-22.5609, 17.0658] },
                                    { id: '1', name: 'Desert', lodge: 'Lodge', nights: '2 NIGHTS', coords: [-24.81, 15.82] },
                                    { id: '2', name: 'Coast', lodge: 'Lodge', nights: '2 NIGHTS', coords: [-22.68, 14.52] },
                                    { id: '3', name: 'Wildlife', lodge: 'Lodge', nights: '2 NIGHTS', coords: [-19.33, 15.90] },
                                    { id: '4', name: 'End', lodge: 'Departure', nights: 'DEPART', coords: [-22.48, 17.47] }
                                ];'''
        html = re.sub(r'const waypoints = \[.*?\];', lambda m: waypoints_str, html, flags=re.DOTALL)

        # 5. Day Blocks
        day_blocks = ""
        prev_acc_name = "Guided Lodge"
        prev_bg = ""
        prev_slides = ""

        for i, item in enumerate(data.get('itinerary', [])):
            day_num = str(i+1).zfill(2)
            acc = item.get('accommodation', {})
            
            if acc.get('gallery_images') and len(acc['gallery_images']) > 0:
                acc_name = acc.get('name', 'Lodge')
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

        # 6. Bottom Carousel (Lodge Selection)
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

        with open(job['output_path'], 'w') as f:
            f.write(html)

        print(f"Generated {job['output_path']} successfully!")

    except Exception as e:
        print(f"Error processing {job['json_path']}: {e}")
