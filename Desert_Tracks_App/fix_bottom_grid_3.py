import re

html_path = "/Users/jaunhusselmann/Desktop/AG Projects/Desert_Tracks_App/itinerary_3_17_day.html"

with open(html_path, "r") as f:
    html = f.read()

# Fix the Lodge Selection grids to avoid animal pictures!
title_to_image = {
    "Kanana": "https://wetu.com/Resources/10173/1743778067404_-Kanana_Deck_View1.jpg?fmt=jpg",
    "Old Drift Lodge": "https://wetu.com/Resources/112812/2._firepit_and_main_area.jpg?fmt=jpg"
}

def update_grid_image(match):
    anchor_start = match.group(1)
    inner_html = match.group(2)
    anchor_end = match.group(3)
    
    title_match = re.search(r'<h4 class="lux-acc-title">([^<]+)</h4>', inner_html)
    if title_match:
        title = title_match.group(1).strip()
        if title in title_to_image:
            new_img = title_to_image[title]
            inner_html = re.sub(r'<img src="[^"]+"', f'<img src="{new_img}"', inner_html)
            
    return anchor_start + inner_html + anchor_end

html = re.sub(r'(<a [^>]*class="lux-acc-card"[^>]*>)([\s\S]*?)(</a>)', update_grid_image, html)

with open(html_path, "w") as f:
    f.write(html)
print("Updated Lodge Selection Grids for Itinerary 3")
