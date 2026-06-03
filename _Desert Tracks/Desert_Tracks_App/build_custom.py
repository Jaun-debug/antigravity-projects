import json
import re

with open("wetu_data.json", "r") as f:
    days_data = json.load(f)

with open("14-day-comfort.html", "r", encoding="utf-8") as f:
    content = f.read()

# Replace Hero Details
content = content.replace('<h1 class="lux-title">14-Day Namibia<br>Comfort Safari</h1>', '<h1 class="lux-title">17-Day Safari<br>Namibia, Chobe<br>& Victoria Falls</h1>')
content = content.replace("From the stark beauty of the Kalahari to the wildlife-rich plains of Etosha, experience Namibia in unparalleled comfort.", "An epic 17-day journey from the ancient Namib Desert through the wildlife corridors of Caprivi, ending at the thundering Victoria Falls.")
content = content.replace('14 Days', '17 Days')
content = content.replace('Windhoek • Kalahari • Sossusvlei • Swakopmund • Damaraland • Etosha', 'Windhoek • Sossusvlei • Swakopmund • Spitzkoppe • Etosha • Caprivi • Chobe • Victoria Falls')

days_html = ""
for idx, day in enumerate(days_data):
    num_str = f"{idx+1:02d}"
    # The first image acts as the block background
    bg_img = day["images"][0] if day["images"] else ""
    
    # Safely get the location name
    location = day["location"].split(" ")[0] if day["location"] else ""
    acc = day["accommodation"]
    
    cards_html = ""
    for img in day["images"]:
        cards_html += f'                    <div class="dt-film-card"><img src="{img}?fmt=jpg"></div>\n'
    
    days_html += f"""
        <!-- DAY {num_str} -->
        <div class="lux-day-block" id="day-{num_str}" data-bg="{bg_img}?fmt=jpg">
            <div class="lux-day-block-header">
                <div class="lux-day-number-row">
                    <span class="lux-day-numeral">{num_str}</span>
                    <div class="lux-day-line"></div>
                </div>
                <span class="lux-day-location">{day['location']} — {acc}</span>
                <h2 class="lux-day-title">{day['day_range']}</h2>
                <p class="lux-day-desc">{day['description']}</p>
            </div>
            
            <div class="dt-film-section">
                <div class="dt-film-header">
                    <div>
                        <span class="dt-film-eyebrow">Accommodation Profile</span>
                        <h2 class="dt-film-title">{acc}</h2>
                    </div>
                </div>
                <!-- Added scroll hint and arrows like 14 day -->
                <div class="dt-film-track-wrap">
                    <div class="dt-film-track">
{cards_html}
                    </div>
                </div>
                <div class="dt-film-footer">
                    <div class="dt-film-counter"><span>01</span>/0{len(day['images'])}</div>
                    <div class="dt-film-progress-wrap"><div class="dt-film-progress-bar"></div></div>
                    <div class="dt-film-arrows">
                        <button class="dt-film-arrow prev" aria-label="Previous"><svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg></button>
                        <button class="dt-film-arrow next" aria-label="Next"><svg viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg></button>
                    </div>
                </div>
            </div>
        </div>
"""

start_marker = '<!-- DAY 01 -->'
end_marker = '<!-- Verified Trust/Reviews Block -->'

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx != -1 and end_idx != -1:
    content = content[:start_idx] + days_html + "        " + content[end_idx:]

# Update Lodge Grid
grid_html = '<div class="lux-acc-grid">\n'
for day in days_data:
    img = day["images"][0] if day["images"] else ""
    acc = day["accommodation"]
    grid_html += f"""                    <a href="#" target="_blank" class="lux-acc-card">
                        <img src="{img}?fmt=jpg" alt="{acc}">
                        <h4 class="lux-acc-title">{acc}</h4>
                        <p class="lux-acc-desc">{day['location']}</p>
                    </a>\n"""
grid_html += '                </div>'

grid_start = content.find('<div class="lux-acc-grid">')
grid_end = content.find('<!-- Inclusions Block -->')

if grid_start != -1 and grid_end != -1:
    content = content[:grid_start] + grid_html + '\n            </div>\n        </div>\n\n        ' + content[grid_end:]

# Update main background image
if days_data and days_data[0]['images']:
    content = re.sub(r'id="lux-bg-base"\s+style="background-image:\s*url\([^)]+\);"', f'id="lux-bg-base" style="background-image: url(\'{days_data[0]["images"][0]}?fmt=jpg\');"', content)

with open("17-day-discovery-FINAL.html", "w", encoding="utf-8") as f:
    f.write(content)
print("Done writing new 17-day itinerary!")
