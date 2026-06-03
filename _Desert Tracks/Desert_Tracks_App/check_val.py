import re
html = open("itinerary_1_18_day.html").read()
blocks = html.split('<div class="lux-day-block"')[1:]
for block in blocks:
    day_id = re.search(r'id="(day-\d+)"', block).group(1)
    title = re.search(r'<h2 class="dt-film-title">([^<]+)</h2>', block).group(1)
    imgs = re.findall(r'<img src="([^"]+)" alt="([^"]+)">', block)
    print(day_id, title)
    for img in imgs:
        print("  ", img[0], img[1])
