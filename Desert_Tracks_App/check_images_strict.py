import re

html = open("itinerary_1_18_day.html").read()

for i, day_block in enumerate(html.split('<div class="lux-day-block"')[1:]):
    day_id = re.search(r'id="(day-\d+)"', day_block)
    acc_title = re.search(r'<h2 class="dt-film-title">([^<]+)</h3>', day_block)
    if day_id and acc_title:
        print(f"\n{day_id.group(1)} - {acc_title.group(1)}")
        images = re.findall(r'<img src="([^"]+?)(?:\?fmt=jpg)?" alt="([^"]+)">', day_block)
        for img, alt in images:
            print(f"  - {img} [{alt}]")
