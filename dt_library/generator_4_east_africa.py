import json
import re
import glob

template_path = "/Users/jaunhusselmann/Desktop/AG Projects/dt_library/11_day_namibia_wildlife_safari.html"

# Resolve the weird invisible character in the 8 day Tanzania filename
tanzania_8_day = glob.glob("/Users/jaunhusselmann/Downloads/*8 Day Southern Tanzania*.json")
tanzania_8_day_path = tanzania_8_day[0] if tanzania_8_day else ""

jobs = [
    {
        "json_path": "/Users/jaunhusselmann/Downloads/13 Day East Africa Safari.json",
        "output_path": "/Users/jaunhusselmann/Desktop/AG Projects/dt_library/east_africa_itinerary_1.html",
        "title": "13-Day East Africa Safari",
        "html_title": "13-Day East Africa<br>Safari",
        "subtitle": "An unforgettable journey through the iconic landscapes of East Africa.",
        "bg": "https://wetu.com/imageHandler/c1920x1080/469/etosha_national_park-istock-925720816.jpg?fmt=jpg"
    },
    {
        "json_path": "/Users/jaunhusselmann/Downloads/10 Day Tanzania Safari & Beach Escape.json",
        "output_path": "/Users/jaunhusselmann/Desktop/AG Projects/dt_library/east_africa_itinerary_2.html",
        "title": "10-Day Tanzania Safari & Beach Escape",
        "html_title": "10-Day Tanzania<br>Safari & Beach Escape",
        "subtitle": "A perfect blend of wild encounters and pristine island relaxation.",
        "bg": "https://wetu.com/imageHandler/c1920x1080/469/etosha_national_park-istock-925720816.jpg?fmt=jpg"
    },
    {
        "json_path": "/Users/jaunhusselmann/Downloads/9 Day Kenya Fly-drive circuit.json",
        "output_path": "/Users/jaunhusselmann/Desktop/AG Projects/dt_library/east_africa_itinerary_3.html",
        "title": "9-Day Kenya Fly-Drive Circuit",
        "html_title": "9-Day Kenya<br>Fly-Drive Circuit",
        "subtitle": "A magnificent exploration of Kenya's legendary wildlife reserves.",
        "bg": "https://wetu.com/imageHandler/c1920x1080/469/etosha_national_park-istock-925720816.jpg?fmt=jpg"
    },
    {
        "json_path": tanzania_8_day_path,
        "output_path": "/Users/jaunhusselmann/Desktop/AG Projects/dt_library/east_africa_itinerary_4.html",
        "title": "8-Day Southern Tanzania Signature Safari",
        "html_title": "8-Day Southern Tanzania<br>Signature Safari",
        "subtitle": "Discover the untouched wilderness and remote beauty of Southern Tanzania.",
        "bg": "https://wetu.com/imageHandler/c1920x1080/469/etosha_national_park-istock-925720816.jpg?fmt=jpg"
    }
]

for job in jobs:
    if not job['json_path']:
        print(f"Skipping {job['title']}, JSON file not found!")
        continue

    try:
        with open(job['json_path'], 'r') as f:
            data = json.load(f)
            
        with open(template_path, 'r') as f:
            html = f.read()

        # 1. Replace titles and hero strings
        html = html.replace("<title>11-Day Namibia Wildlife Safari</title>", f"<title>{job['title']}</title>")
        html = html.replace('data-default-title="11-Day Namibia<br>Wildlife Safari"', f'data-default-title="{job["html_title"]}"')
        html = html.replace('11-Day Namibia<br>Wildlife Safari', job["html_title"])

# HERO IMAGE REPLACEMENT
try:
    # For the single-job scripts, data is parsed directly. For multi-job it's in the loop.
    # We assume 'data' is the loaded JSON object in context.
    hero_img = data.get('top_carousel', [{'image': 'https://wetu.com/imageHandler/c1920x1080/469/etosha_national_park-istock-925720816.jpg?fmt=jpg'}])[0].get('image', 'https://wetu.com/imageHandler/c1920x1080/469/etosha_national_park-istock-925720816.jpg?fmt=jpg')
    html = html.replace('https://wetu.com/imageHandler/c1920x1080/469/etosha_national_park-istock-925720816.jpg?fmt=jpg', hero_img)
except Exception as e:
    print("Hero image replace failed:", e)

        # 2. Subtitle and Intro
        html = re.sub(r'A\s*bespoke self-drive journey through iconic landscapes', lambda m: job["subtitle"], html, flags=re.DOTALL)

        intro_old = "Discover Namibia at your own pace while staying at some of the country’s most exceptional lodges. From the dramatic red dunes of Sossusvlei to the stark beauty of Damaraland and the prolific wildlife of Etosha National Park, this carefully curated journey balances the freedom of independent travel with the reassurance of premium hospitality. With luxury accommodation, hand-picked experiences, and our bespoke navigation app to guide you, every detail is considered."
        intro_new = "Embark on an unforgettable East African safari where legendary landscapes and spectacular wildlife await. From the vast, game-rich plains of the Serengeti and Masai Mara to the breathtaking Ngorongoro Crater and pristine white-sand beaches of the Indian Ocean, this carefully curated journey immerses you in the quintessential African adventure. With hand-picked luxury accommodations and expert guides, every detail is considered to bring you the experience of a lifetime."
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
            "Nairobi": [-1.29, 36.82],
            "Masai Mara": [-1.49, 35.14],
            "Mara": [-1.49, 35.14],
            "Serengeti": [-2.33, 34.83],
            "Ngorongoro": [-3.23, 35.58],
            "Tarangire": [-3.85, 36.10],
            "Manyara": [-3.53, 35.85],
            "Zanzibar": [-6.16, 39.19],
            "Dongwe": [-6.23, 39.54],
            "Dar es Salaam": [-6.79, 39.20],
            "Dar": [-6.79, 39.20],
            "Ruaha": [-7.66, 34.88],
            "Selous": [-8.06, 38.00],
            "Nyerere": [-8.06, 38.00],
            "Amboseli": [-2.65, 37.26],
            "Lake Nakuru": [-0.36, 36.08],
            "Nakuru": [-0.36, 36.08],
            "Ol Pejeta": [0.01, 36.93],
            "Arusha": [-3.37, 36.68],
            "Kilimanjaro": [-3.06, 37.35]
        }

        # Calculate nights automatically
        dest_nights = {}
        for item in data.get('itinerary', []):
            dest = item.get('destination', '')
            if dest:
                dest_nights[dest] = dest_nights.get(dest, 0) + 1

        waypoints_arr = []
        # Add start
        waypoints_arr.append("                                    { id: '', name: 'Start', lodge: 'Arrival', nights: 'START', coords: [-1.29, 36.82] }") # Default start for East Africa is often Nairobi
        
        idx = 1
        for item in data.get('top_carousel', []):
            dest = item.get('destination', '')
            nights = dest_nights.get(dest, 1)
            night_str = "1 NIGHT" if nights == 1 else f"{nights} NIGHTS"
            
            # Find coords
            coords = [-1.29, 36.82] # Default Nairobi
            for key, val in COORDS_DB.items():
                if key.lower() in dest.lower():
                    coords = val
                    break
                    
            waypoints_arr.append(f"                                    {{ id: '{idx}', name: '{dest}', lodge: 'East Africa Safari', nights: '{night_str}', coords: {coords} }}")
            idx += 1
            
        # Add end
        waypoints_arr.append(f"                                    {{ id: '{idx}', name: 'End', lodge: 'Departure', nights: 'DEPART', coords: [-3.37, 36.68] }}")

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
            # Calculate consecutive days without overlap
            # We parse the day string from Wetu which looks like "Day 2 - 5"
            # It means you check in on Day 2, and check out on Day 5 (3 nights).
            # So the stay is Day 2, 3, 4. So we should show "Day 2 - 4".
            raw_wetu_day = item.get('day', f'Day {day_num}')
            day_match = re.search(r'Day\s+(\d+)(?:\s*-\s*(\d+))?', raw_wetu_day, re.IGNORECASE)
            if day_match:
            start_day = int(day_match.group(1))
            end_day = int(day_match.group(2)) if day_match.group(2) else start_day

            # If they check out on end_day, the last full day of the stay is end_day - 1
            if end_day > start_day:
            stay_end = end_day - 1
            if stay_end > start_day:
            raw_day_str = f"Day {start_day} - {stay_end}"
            else:
            raw_day_str = f"Day {start_day}"
            else:
            raw_day_str = f"Day {start_day}"
            else:
            raw_day_str = raw_wetu_day
            
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
                            <h2 class="lux-day-title" style="font-family: 'Cinzel', serif; font-size: clamp(24px, 4vw, 32px); font-weight: 300; color: #1F4F4B; text-transform: uppercase; margin-bottom: 1.5rem; letter-spacing: 0.05em;">{raw_day_str}</h2>
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

html = re.sub(r'<div id="lodge-selection" class="lux-acc-grid-container".*?(?=<!-- Verified Trust/Reviews Block -->)', new_lodge_selection, html, flags=re.DOTALL)
# 7. More Safaris Carousel
        more_safaris_html = ""
        for other_job in jobs:
            if other_job['output_path'] != job['output_path']:
                title_plain = other_job['title']
                img_other = other_job['bg']
                try:
                    with open(other_job['json_path'], 'r') as f_other:
                        other_data = json.load(f_other)
                        if other_data.get('top_carousel'):
                            img_other = other_data['top_carousel'][0].get('image', img_other)
                except:
                    pass
                    
                file_name = other_job['output_path'].split('/')[-1]
                more_safaris_html += f'''                        <a href="{file_name}" target="_self" class="lux-acc-card">
                            <img src="{img_other}" alt="{title_plain}">
                            <h4 class="lux-acc-title">{title_plain}</h4>
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
        {lodge_carousel_html}                    </div>
                        </div>

                        <div id="more-safaris" class="lux-acc-grid-container"
                            style="margin-bottom: 4rem; padding-top: 2rem;">
                            <h2
                                style="color: #1F4F4B !important; font-family: 'Cinzel', serif; font-weight: 400; font-size: clamp(36px, 6vw, 46px); line-height: 1.2; letter-spacing: 0.3px; margin-bottom: 2rem; text-transform: uppercase;">
                                More East Africa Safaris</h2>
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

        html = re.sub(r'<div id="lodge-selection" class="lux-acc-grid-container".*?(?=<!-- Verified Trust/Reviews Block -->)', lambda m: new_lodge_selection, html, flags=re.DOTALL)

        with open(job['output_path'], 'w') as f:
            f.write(html)

        print(f"Generated {job['output_path']} successfully!")

    except Exception as e:
        print(f"Error processing {job['json_path']}: {e}")
