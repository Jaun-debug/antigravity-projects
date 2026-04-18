import re
import sys

html_path = "/Users/jaunhusselmann/Desktop/AG Projects/Desert_Tracks_App/itinerary_1_18_day.html"

with open(html_path, "r") as f:
    html = f.read()

real_images = {
    "day-01": "https://wetu.com/imageHandler/c1920x1080/55342/143a4578.jpg?fmt=jpg", # Ti Melen
    "day-02": "https://wetu.com/imageHandler/c1920x1080/31966/anib2016-8826.jpg?fmt=jpg", # Kalahari Anib
    "day-03": "https://wetu.com/imageHandler/c1920x1080/4033/roadhouse2_2.jpg?fmt=jpg", # Canyon Roadhouse
    "day-04": "https://wetu.com/imageHandler/c1920x1080/68363/1.jpg?fmt=jpg", # Alte Villa
    "day-05": "https://wetu.com/imageHandler/c1920x1080/10515/ondili_desert_homestead_venture_media--23.jpg?fmt=jpg", # Desert Homestead (Day 6&7, day-06)
    "day-06": "https://wetu.com/imageHandler/c1920x1080/149035/exterior_24.jpg?fmt=jpg", # Swakop Guesthouse
    "day-07": "https://wetu.com/imageHandler/c1920x1080/312689/img_e18011.jpg?fmt=jpg", # Damaraland
    "day-08": "https://wetu.com/imageHandler/c1920x1080/28950/20220804_192246.jpg?fmt=jpg", # Opuwo
    "day-09": "https://wetu.com/imageHandler/c1920x1080/34701/omarunga-scenery21.jpg?fmt=jpg", # Omarunga
    "day-10": "https://wetu.com/imageHandler/c1920x1080/10417/amazing_planet_filip_kulisev_elephant3.jpg?fmt=jpg", # Hobatere
    "day-11": "https://wetu.com/imageHandler/c1920x1080/10560/etosha_game_drive1.jpg?fmt=jpg", # Etosha Safari
    "day-12": "https://wetu.com/imageHandler/c1920x1080/15330/okapuka_safai_lodge_1.jpg?fmt=jpg", # Okapuka
}

blocks = html.split('<div class="lux-day-block"')
out_html = blocks[0]

for block in blocks[1:]:
    day_id_match = re.search(r'id="(day-\d+)"', block)
    if day_id_match:
        day_id = day_id_match.group(1)
        if day_id in real_images:
            img_url = real_images[day_id]
            
            # Find the track div
            track_start = block.find('<div class="dt-film-track">')
            track_end = block.find('</div>', track_start) # first close div of track
            
            if track_start != -1:
                # Find the footer
                footer_start = block.find('<div class="dt-film-footer">')
                
                if footer_start != -1:
                    new_cards = ""
                    for i in range(1, 7):
                        new_cards += f'''                        <div class="dt-film-card">
                            <img src="{img_url}" alt="Room {i}">
                        </div>\n'''
                    
                    part1 = block[:track_start + len('<div class="dt-film-track">\n')]
                    part_end = block.find('</div>\n                </div>\n\n                <div class="dt-film-footer">')
                    if part_end != -1:
                        block = part1 + new_cards + "                    " + block[part_end:]
                        print(f"Updated images for {day_id}")
                    else:
                        print(f"part_end not found for {day_id}")
    
    out_html += '<div class="lux-day-block"' + block

html = out_html

with open(html_path, "w") as f:
    f.write(html)
print("Finished saving itinerary_1_18_day.html")
