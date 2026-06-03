import json
import re

json_path = "/Users/jaunhusselmann/Downloads/14_scrape.json"
html_path = "/Users/jaunhusselmann/Desktop/AG Projects/Desert_Tracks_App/14-day-highlights-FINAL.html"

with open(json_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Extract stops safely
stops = data.get("stops", [])
text = data.get("text", "")

# We want to group by date
days_map = {}

# Build simple dictionary of days
for s in stops:
    if "date" not in s or not s["date"]: continue
    d_label = str(s["date"]).strip().upper()
    if not d_label.startswith("DAY"): continue
    
    if d_label not in days_map:
        days_map[d_label] = {"location": "", "accommodation": "", "images": [], "bg": "", "desc": ""}
    
    # It seems 'destinationName' actually holds the type from the view
    dtype = str(s.get("destinationName", "")).strip()
    
    if dtype == "Destination":
        # The accommodationName field in this case seems to hold the location's actual name
        days_map[d_label]["location"] = s.get("accommodationName", "").strip()
        days_map[d_label]["bg"] = s.get("destinationPicture", "")
        # Also grab the bg from dest pic or acc pics
        if s.get("accommodationPictures"):
            for img in s["accommodationPictures"]:
                days_map[d_label]["images"].append(img)
    elif dtype == "Accommodation":
        days_map[d_label]["accommodation"] = s.get("accommodationName", "").strip()
        if s.get("destinationPicture"):
            days_map[d_label]["bg"] = s.get("destinationPicture", "")
        if s.get("accommodationPictures"):
            for img in s["accommodationPictures"]:
                days_map[d_label]["images"].append(img)
    
    # Handle the messy case where things might be 'Your Stay' or whatever
    if dtype == "Your Stay":
        if s.get("accommodationPictures"):
            for img in s["accommodationPictures"]:
                days_map[d_label]["images"].append(img)
    

# Attempt to parse descriptions from text
# Text looks like:
# Destination\nWindhoek\nDAY 1 - 2\n\nSituated in Central...
dest_blocks = re.split(r'Destination\n', text)
for block in dest_blocks[1:]:
    lines = block.split('\n')
    if len(lines) >= 4:
        loc = lines[0].strip()
        day_range = lines[1].strip()
        
        # the description usually starts around line 3 or 4 and goes until 'GALLERY'
        desc_lines = []
        for line in lines[3:]:
            if line.strip() == 'GALLERY' or line.strip() == 'MAP' or line.strip() == 'COUNTRY' or line.startswith('Accommodation'):
                break
            if line.strip():
                desc_lines.append(line.strip())
        
        desc = " ".join(desc_lines)
        if day_range.upper() in days_map:
            days_map[day_range.upper()]["desc"] = desc
        elif f"DAY {day_range}".upper() in days_map:
            days_map[f"DAY {day_range}".upper()]["desc"] = desc

# Filter out empty or broken days
final_days = []
for k, v in days_map.items():
    if v["location"] or v["accommodation"]:
        v["day_range"] = k.replace("DAY ", "Day ")
        final_days.append(v)
        
# Sort by Day number
def get_start_day(day_str):
    m = re.search(r'\d+', day_str)
    return int(m.group()) if m else 999
    
final_days.sort(key=lambda x: get_start_day(x["day_range"]))

# Deduplicate images
for day in final_days:
    unique_imgs = []
    for img in day["images"]:
        if img not in unique_imgs:
            unique_imgs.append(img)
    day["images"] = unique_imgs

print(json.dumps(final_days, indent=2))

with open(html_path, "r", encoding="utf-8") as f:
    content = f.read()

days_html = ""
for idx, day in enumerate(final_days):
    num_str = f"{idx+1:02d}"
    bg_img = day["bg"] if day["bg"] else (day["images"][0] if day["images"] else "")
    acc = day["accommodation"] if day["accommodation"] else day["location"]
    
    cards_html = ""
    for img in day["images"]:
        cards_html += f'                        <div class="dt-film-card">\n                            <img src="{img}?fmt=jpg" alt="{acc}">\n                        </div>\n'
    
    loc_display = day["location"]
    total_imgs = f"{len(day['images']):02d}"
    acc_display = f" — {acc}" if (acc and acc != loc_display) else ""
    title_display = day["day_range"]
    desc_display = day["desc"]

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

# Update the main background
if final_days and final_days[0]['bg']:
    first_bg = final_days[0]['bg']
    content = re.sub(r'id="lux-bg-base"\s+style="background-image:\s*url\([^)]+\);"', f'id="lux-bg-base" style="background-image: url(\'{first_bg}?fmt=jpg\');"', content)

with open(html_path, "w", encoding="utf-8") as f:
    f.write(content)

print("HTML Replaced successfully.")
