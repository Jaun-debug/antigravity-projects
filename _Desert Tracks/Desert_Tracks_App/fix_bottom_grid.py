import re

html_path = "/Users/jaunhusselmann/Desktop/AG Projects/Desert_Tracks_App/itinerary_1_18_day.html"

with open(html_path, "r") as f:
    html = f.read()

title_to_image = {
    "Ti Melen Boutique Guesthouse": "https://wetu.com/imageHandler/c1920x1080/55342/143a4578.jpg?fmt=jpg",
    "Kalahari Anib Lodge Gondwana Collection Namibia": "https://wetu.com/imageHandler/c1920x1080/31966/anib2016-8826.jpg?fmt=jpg",
    "Canyon Roadhouse Gondwana Collection Namibia": "https://wetu.com/imageHandler/c1920x1080/4033/roadhouse2_2.jpg?fmt=jpg",
    "Alte Villa": "https://wetu.com/imageHandler/c1920x1080/68363/1.jpg?fmt=jpg",
    "Desert Homestead Lodge": "https://wetu.com/imageHandler/c1920x1080/10515/img_68201.jpg?fmt=jpg",
    "Swakopmund Guesthouse": "https://wetu.com/imageHandler/c1920x1080/149035/exterior_24.jpg?fmt=jpg",
    "Lodge Damaraland": "https://wetu.com/imageHandler/c1920x1080/312689/img_e18011.jpg?fmt=jpg",
    "Opuwo Country Lodge": "https://wetu.com/imageHandler/c1920x1080/28950/20220804_192246.jpg?fmt=jpg",
    "Omarunga Epupa-Falls Camp Gondwana Collection Namibia": "https://wetu.com/imageHandler/c1920x1080/34701/omarunga-scenery21.jpg?fmt=jpg",
    "Hobatere Lodge": "https://wetu.com/imageHandler/c1920x1080/10417/amazing_planet_filip_kulisev_front-of-lodge2.jpg?fmt=jpg",
    "Etosha Safari Camp Gondwana Collection Namibia": "https://wetu.com/imageHandler/c1920x1080/10560/dsc_7303.jpg?fmt=jpg",
    "Okapuka Safari Lodge Gondwana Collection Namibia": "https://wetu.com/imageHandler/c1920x1080/15330/okapuka_safari_lodge_lounge_4.jpg?fmt=jpg",
}

def update_grid_image(match):
    anchor_start = match.group(1)
    inner_html = match.group(2)
    anchor_end = match.group(3)
    
    # find the title
    title_match = re.search(r'<h4 class="lux-acc-title">([^<]+)</h4>', inner_html)
    if title_match:
        title = title_match.group(1).strip()
        if title in title_to_image:
            new_img = title_to_image[title]
            # replace the src
            inner_html = re.sub(r'<img src="[^"]+"', f'<img src="{new_img}"', inner_html)
    
    return anchor_start + inner_html + anchor_end

# find both top grid (<a href="#day-..." class="lux-acc-card">) and bottom grid (<a href="#" target="_blank" class="lux-acc-card">)
html = re.sub(r'(<a [^>]*class="lux-acc-card"[^>]*>)([\s\S]*?)(</a>)', update_grid_image, html)

with open(html_path, "w") as f:
    f.write(html)
print("Updated all grids with precise lodge images.")
