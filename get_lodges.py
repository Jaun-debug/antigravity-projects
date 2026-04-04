import re

with open("Desert_Tracks_App/14-day-comfort.html", "r") as f:
    text = f.read()

lodges = []
blocks = text.split('<div class="lux-day-block"')
for b in blocks[1:]:
    loc_match = re.search(r'<span class="lux-day-location">(.*?)</span>', b)
    film_title_match = re.search(r'<h2 class="dt-film-title">(.*?)</h3>', b)
    img_match = re.search(r'<div class="dt-film-card">\s*<img src="(.*?)"', b)
    
    if loc_match and film_title_match:
        loc = loc_match.group(1).split("—")[0].strip()
        title = film_title_match.group(1).strip()
        img = img_match.group(1) if img_match else ""
        lodges.append({"loc": loc, "title": title, "img": img})

for i, l in enumerate(lodges):
    print(f"{i+1}. {l['title']} ({l['loc']}) - {l['img']}")

