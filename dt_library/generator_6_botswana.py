import json
import re

template_path = "/Users/jaunhusselmann/Desktop/AG Projects/dt_library/11_day_namibia_wildlife_safari.html"

jobs = [
    {
        "json_path": "/Users/jaunhusselmann/Downloads/11-DAY BOTWANA DESERT AND DELTA (STANDARD OPTION D).json",
        "output_path": "/Users/jaunhusselmann/Desktop/AG Projects/dt_library/botswana_itinerary_1.html",
        "title": "11-Day Botswana Desert and Delta – Standard Option D",
        "html_title": "11-Day Botswana<br>Desert and Delta",
        "subtitle": "An epic standard journey through Botswana's desert and delta landscapes.",
        "bg": "https://wetu.com/imageHandler/c1920x1080/469/etosha_national_park-istock-925720816.jpg?fmt=jpg"
    },
    {
        "json_path": "/Users/jaunhusselmann/Downloads/9 Day Botswana Focus.json",
        "output_path": "/Users/jaunhusselmann/Desktop/AG Projects/dt_library/botswana_itinerary_2.html",
        "title": "9-Day Botswana Focus Safari",
        "html_title": "9-Day Botswana<br>Focus Safari",
        "subtitle": "A concentrated exploration of Botswana's premier wildlife regions.",
        "bg": "https://wetu.com/imageHandler/c1920x1080/469/etosha_national_park-istock-925720816.jpg?fmt=jpg"
    },
    {
        "json_path": "/Users/jaunhusselmann/Downloads/2025 11-Day Botswana Safari Experience (Superior).json",
        "output_path": "/Users/jaunhusselmann/Desktop/AG Projects/dt_library/botswana_itinerary_3.html",
        "title": "11-Day Botswana Safari Experience (Superior)",
        "html_title": "11-Day Botswana<br>Safari Experience",
        "subtitle": "A superior level safari adventure deep into the heart of Botswana.",
        "bg": "https://wetu.com/imageHandler/c1920x1080/469/etosha_national_park-istock-925720816.jpg?fmt=jpg"
    },
    {
        "json_path": "/Users/jaunhusselmann/Downloads/10 Day Botswana Delta Explorer Deluxe.json",
        "output_path": "/Users/jaunhusselmann/Desktop/AG Projects/dt_library/botswana_itinerary_4.html",
        "title": "10-Day Botswana Delta Explorer Deluxe",
        "html_title": "10-Day Botswana<br>Delta Explorer",
        "subtitle": "A deluxe exploration of the Okavango Delta's hidden channels and wildlife.",
        "bg": "https://wetu.com/imageHandler/c1920x1080/469/etosha_national_park-istock-925720816.jpg?fmt=jpg"
    },
    {
        "json_path": "/Users/jaunhusselmann/Downloads/10-Day Vic Falls - Caprivi - Delta Premier Explorer.json",
        "output_path": "/Users/jaunhusselmann/Desktop/AG Projects/dt_library/botswana_itinerary_5.html",
        "title": "10-Day Vic Falls - Caprivi - Delta Premier Explorer",
        "html_title": "10-Day Vic Falls, Caprivi<br>& Delta Explorer",
        "subtitle": "A premier journey from the thundering Victoria Falls through Caprivi to the Delta.",
        "bg": "https://wetu.com/imageHandler/c1920x1080/469/etosha_national_park-istock-925720816.jpg?fmt=jpg"
    },
    {
        "json_path": "/Users/jaunhusselmann/Downloads/2025 5-Day Victoria Falls & Chobe Getaway (Superior).json",
        "output_path": "/Users/jaunhusselmann/Desktop/AG Projects/dt_library/botswana_itinerary_6.html",
        "title": "5-Day Victoria Falls & Chobe Getaway (Superior)",
        "html_title": "5-Day Victoria Falls<br>& Chobe Getaway",
        "subtitle": "A short but spectacular superior getaway to Victoria Falls and Chobe.",
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
        intro_new = "Embark on an unforgettable Botswana safari where the wild beauty of nature is matched only by exceptional comfort. From the winding waterways of the Okavango Delta to the dense wildlife of Chobe National Park and the awe-inspiring roar of Victoria Falls, this carefully curated journey immerses you in one of Africa's most pristine environments. With hand-picked luxury accommodations and expert guides, every detail is considered to bring you the adventure of a lifetime."
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

        # 4. Waypoints (Dynamic based on destinations)
        COORDS_DB = {
            "Windhoek": [-22.5609, 17.0658],
            "Sossusvlei": [-24.81, 15.82],
            "Sesriem": [-24.48, 15.80],
            "Swakopmund": [-22.68, 14.52],
            "Damaraland": [-20.57, 14.37],
            "Twyfelfontein": [-20.57, 14.37],
            "Etosha": [-19.33, 15.90],
            "Etosha South": [-19.33, 15.90],
            "Etosha East": [-18.73, 17.04],
            "Okonjima": [-20.85, 16.64],
            "Waterberg": [-20.51, 17.24],
            "Kalahari": [-24.28, 18.06],
            "Fish River Canyon": [-27.61, 17.58],
            "Luderitz": [-26.65, 15.16],
            "Namib Desert": [-24.81, 15.82],
            "Skeleton Coast": [-19.16, 12.56],
            "Caprivi": [-17.48, 24.28],
            "Zambezi Region": [-17.48, 24.28],
            "Divundu": [-18.09, 21.53],
            "Chobe": [-17.80, 25.15],
            "Kasane": [-17.80, 25.15],
            "Victoria Falls": [-17.92, 25.85],
            "Okavango Delta": [-19.28, 22.69],
            "Okavango": [-19.28, 22.69],
            "Moremi": [-19.33, 23.00],
            "Maun": [-19.98, 23.42],
            "Makgadikgadi": [-20.72, 25.33],
            "Nxai Pan": [-19.88, 24.78],
            "Savuti": [-18.56, 24.06],
            "Linyanti": [-18.26, 23.94],
            "Central Kalahari": [-21.89, 23.68],
            "Namib-Naukluft Park": [-24.81, 15.82]
        }

        # Calculate nights automatically
        dest_nights = {}
        for item in data.get('itinerary', []):
            dest = item.get('destination', '')
            if dest:
                dest_nights[dest] = dest_nights.get(dest, 0) + 1

        waypoints_arr = []
        # Add start
        waypoints_arr.append("                                    { id: '', name: 'Start', lodge: 'Arrival', nights: 'START', coords: [-19.98, 23.42] }") # Default start for Botswana is often Maun or Vic Falls
        
        idx = 1
        for item in data.get('top_carousel', []):
            dest = item.get('destination', '')
            nights = dest_nights.get(dest, 1)
            night_str = "1 NIGHT" if nights == 1 else f"{nights} NIGHTS"
            
            # Find coords
            coords = [-19.98, 23.42] # Default Maun
            for key, val in COORDS_DB.items():
                if key.lower() in dest.lower():
                    coords = val
                    break
                    
            waypoints_arr.append(f"                                    {{ id: '{idx}', name: '{dest}', lodge: 'Botswana Safari', nights: '{night_str}', coords: {coords} }}")
            idx += 1
            
        # Add end
        waypoints_arr.append(f"                                    {{ id: '{idx}', name: 'End', lodge: 'Departure', nights: 'DEPART', coords: [-17.92, 25.85] }}")

        waypoints_str = "                                const waypoints = [\n" + ",\n".join(waypoints_arr) + "\n                                ];"
        html = re.sub(r'const waypoints = \[.*?\];', lambda m: waypoints_str, html, flags=re.DOTALL)

        # 5. Day Blocks
        day_blocks = ""
        prev_acc_name = "Lodge"
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
