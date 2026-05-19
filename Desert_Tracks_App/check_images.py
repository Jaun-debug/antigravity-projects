import re

html = open("itinerary_1_18_day.html").read()

day_blocks = re.findall(r'<div class="lux-day-block" id="day-\d+".*?</div\s*>\s*</div\s*>\s*</div\s*>', html, re.DOTALL)
print(f"Found {len(day_blocks)} day blocks")

for day_block in html.split('<div class="lux-day-block"')[1:]:
    day_id = re.search(r'id="(day-\d+)"', day_block)
    acc_title = re.search(r'<h2 class="dt-film-title">([^<]+)</h3>', day_block)
    if day_id and acc_title:
        print(f"\n{day_id.group(1)} - {acc_title.group(1)}")
        images = re.findall(r'<img src="([^"]+?)(?:\?fmt=jpg)?" alt="([^"]+)">', day_block)
        for img, alt in images:
            if "Room" in alt or "Guesthouse" in alt or "Lodge" in alt or "Camp" in alt or "Villa" in alt:
                print(f"  - {img} [{alt}]")
