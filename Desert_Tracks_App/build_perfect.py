import json
import re

with open("wetu_data.json", "r") as f:
    days_data = json.load(f)

with open("14-day-comfort.html", "r", encoding="utf-8") as f:
    content = f.read()

# Replace Hero Details
content = content.replace('<h1 class="lux-title">14-Day Namibia<br>Comfort Safari</h1>', '<h1 class="lux-title">11-Day Wildlife<br>of Namibia</h1>')
content = content.replace("From the stark beauty of the Kalahari to the wildlife-rich plains of Etosha, experience Namibia in unparalleled comfort.", "Immerse yourself in Namibia's spectacular wildlife and landscapes. This 11-day journey takes you from the striking dunes of Sossusvlei to the renowned Etosha National Park, promising an unforgettable adventure.")
content = content.replace('14 Days', '11 Days')
content = content.replace('Windhoek • Kalahari • Sossusvlei • Swakopmund • Damaraland • Etosha', 'Windhoek • Sossusvlei • Swakopmund • Twyfelfontein • Etosha • Waterberg')
content = content.replace('14-Day Namibia Comfort Safari', '11-Day Wildlife of Namibia')


days_html = ""
for idx, day in enumerate(days_data):
    num_str = f"{idx+1:02d}"
    
    def fix_url(url):
        return url.replace("p.wetu.com/ImageHandler/Itinerary/", "wetu.com/imageHandler/c1920x1080/")

    bg_img = fix_url(day["images"][0]) if day["images"] else ""
    acc = day["accommodation"]
    
    cards_html = ""
    for img in day["images"]:
        fixed_img = fix_url(img)
        cards_html += f'                        <div class="dt-film-card">\n                            <img src="{fixed_img}?fmt=jpg" alt="{acc}">\n                        </div>\n'

    
    loc_display = day['location']
    total_imgs = f"{len(day['images']):02d}"
    acc_display = f" — {acc}" if acc else ""
    title_display = day['day_range']
    desc_display = day['description']
    
    # Custom rendering for outbound/departure day
    if not day["images"]:
        loc_display = "Windhoek — Hosea Kutako Airport"
        acc_display = ""
        title_display = "Departure Bound"
        desc_display = "After a breathtaking final morning, make your way back down to the capital for your departure. Journey safely and take home an eternity of memories, or extend your trip with a Namibia to Victoria Falls safari."
        
    days_html += f"""
        <!-- DAY {num_str} -->
        <div class="lux-day-block" id="day-{num_str}" data-bg="{bg_img}?fmt=jpg">
            <div class="lux-day-block-header">
                <div class="lux-day-number-row">
                    <span class="lux-day-numeral">{num_str}</span>
                    <div class="lux-day-line"></div>
                </div>
                <span class="lux-day-location">{loc_display}{acc_display}</span>
                <h2 class="lux-day-title">{title_display}</h2>
                <p class="lux-day-desc">{desc_display}</p>
            </div>
"""
    if day["images"]:
        days_html += f"""            
            <div class="dt-film-section">
                <div class="dt-film-header">
                    <div>
                        <span class="dt-film-eyebrow">Accommodation Profile</span>
                        <h2 class="dt-film-title">{acc}</h2>
                    </div>
                    <div class="dt-film-counter">01 <span>/ {total_imgs}</span></div>
                </div>
                
                <div class="dt-film-track-wrap">
                    <div class="dt-film-track">
{cards_html}                    </div>
                </div>

                <div class="dt-film-footer">
                    <div class="dt-film-progress-wrap"><div class="dt-film-progress-bar" style="width: 0%;"></div></div>
                    <div class="dt-film-arrows">
                        <div class="dt-film-arrow dt-film-prev-btn"><svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"></polyline></svg></div>
                        <div class="dt-film-arrow dt-film-next-btn"><svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"></polyline></svg></div>
                    </div>
                </div>
            </div>
"""
    days_html += '        </div>\n'

start_marker = '<!-- DAY 01 -->'
end_marker = '<!-- Accommodations Grid Block -->'

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx != -1 and end_idx != -1:
    content = content[:start_idx] + days_html + "        " + content[end_idx:]


# Replace Destinations at a Glance Grid
dest_start_marker = '<div class="lux-acc-grid-container" style="margin-bottom: 4rem;">'
des_idx = content.find(dest_start_marker)
if des_idx != -1:
    grid_start_idx = content.find('<div class="lux-acc-grid">', des_idx)
    grid_end_idx = content.find('</div>\n            </div>\n                <!-- Inclusions Block -->', grid_start_idx)
    
    if grid_start_idx != -1 and grid_end_idx != -1:
        grid_html = '<div class="lux-acc-grid">\n'
        for idx, day in enumerate(days_data):
            num_str = f"{idx+1:02d}"
            img = day["images"][0] if day["images"] else ""
            if not img: continue
            fixed_img = fix_url(img)
            loc = day["location"]
            # Creating a shortened abstract of the description for the card
            short_desc = day["description"][:90] + "..." if len(day["description"]) > 90 else day["description"]
            grid_html += f"""                    <a href="#day-{num_str}" class="lux-acc-card">
                        <img src="{fixed_img}?fmt=jpg" alt="{loc}">
                        <h4 class="lux-acc-title">{loc}</h4>
                        <p class="lux-acc-desc">{short_desc}</p>
                    </a>\n"""
        grid_html += '                '
        content = content[:grid_start_idx] + grid_html + content[grid_end_idx:]


# Replace Lodge Selection Grid
str_accomo_start = content.find('<!-- Accommodations Grid Block -->')
if str_accomo_start != -1:
    grid_start_idx = content.find('<div class="lux-acc-grid">', str_accomo_start)
    grid_end_idx = content.find('<div class="lux-padding-wrapper"', grid_start_idx)
    
    if grid_start_idx != -1 and grid_end_idx != -1:
        grid_html = '<div class="lux-acc-grid">\n'
        for day in days_data:
            img = day["images"][0] if day["images"] else ""
            if not img: continue
            fixed_img = fix_url(img)
            acc = day["accommodation"]
            grid_html += f"""                    <a href="#" target="_blank" class="lux-acc-card">
                        <img src="{fixed_img}?fmt=jpg" alt="{acc}">
                        <h4 class="lux-acc-title">{acc}</h4>
                        <p class="lux-acc-desc">{day['location']}</p>
                    </a>\n"""
        grid_html += '                </div>\n            </div>\n        '
        content = content[:grid_start_idx] + grid_html + content[grid_end_idx:]


# Update main background image
if days_data and days_data[0]['images']:
    fixed_bg = fix_url(days_data[0]["images"][0])
    content = re.sub(r'id="lux-bg-base"\s+style="background-image:\s*url\([^)]+\);"', f'id="lux-bg-base" style="background-image: url(\'{fixed_bg}?fmt=jpg\');"', content)

with open("11-day-wildlife-FINAL.html", "w", encoding="utf-8") as f:
    f.write(content)

print("Done writing perfect 11-day wildlife itinerary!")
