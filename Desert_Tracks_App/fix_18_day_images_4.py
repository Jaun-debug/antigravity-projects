import re
import sys

html_path = "/Users/jaunhusselmann/Desktop/AG Projects/Desert_Tracks_App/itinerary_1_18_day.html"

with open(html_path, "r") as f:
    html = f.read()

images_data = {
  "day-01": [
    "https://wetu.com/imageHandler/c1920x1080/55342/143a4578.jpg?fmt=jpg",
    "https://wetu.com/imageHandler/c1920x1080/55342/img_4373.jpg?fmt=jpg",
    "https://wetu.com/imageHandler/c1920x1080/55342/img_43721.jpg?fmt=jpg",
    "https://wetu.com/imageHandler/c1920x1080/55342/img_4408.jpg?fmt=jpg",
    "https://wetu.com/imageHandler/c1920x1080/55342/img_44211.jpg?fmt=jpg",
    "https://wetu.com/imageHandler/c1920x1080/55342/img_7922.jpg?fmt=jpg"
  ],
  "day-02": [
    "https://wetu.com/imageHandler/c1920x1080/31966/anib2016-8826.jpg?fmt=jpg",
    "https://wetu.com/imageHandler/c1920x1080/31966/anib2016-8828.jpg?fmt=jpg",
    "https://wetu.com/imageHandler/c1920x1080/31966/gondwana_collection_-_kalahari_anib_lodge_00018.jpg?fmt=jpg",
    "https://wetu.com/imageHandler/c1920x1080/31966/anib2016-8296.jpg?fmt=jpg",
    "https://wetu.com/imageHandler/c1920x1080/31966/anib2016-8328.jpg?fmt=jpg",
    "https://wetu.com/imageHandler/c1920x1080/31966/anib2016-8367.jpg?fmt=jpg"
  ],
  "day-03": [
    "https://wetu.com/imageHandler/c1920x1080/4033/roadhouse2_2.jpg?fmt=jpg",
    "https://wetu.com/imageHandler/c1920x1080/4033/2017_12_namibia-72772.jpg?fmt=jpg",
    "https://wetu.com/imageHandler/c1920x1080/4033/roadhouse18.jpg?fmt=jpg",
    "https://wetu.com/imageHandler/c1920x1080/4033/dscf7061.jpg?fmt=jpg",
    "https://wetu.com/imageHandler/c1920x1080/4033/dscf7071.jpg?fmt=jpg",
    "https://wetu.com/imageHandler/c1920x1080/4033/dscf7020.jpg?fmt=jpg"
  ],
  "day-04": [
    "https://wetu.com/imageHandler/c1920x1080/68363/1.jpg?fmt=jpg",
    "https://wetu.com/imageHandler/c1920x1080/68363/2.jpg?fmt=jpg",
    "https://wetu.com/imageHandler/c1920x1080/68363/3.jpg?fmt=jpg",
    "https://wetu.com/imageHandler/c1920x1080/68363/4.jpg?fmt=jpg",
    "https://wetu.com/imageHandler/c1920x1080/68363/5.jpg?fmt=jpg",
    "https://wetu.com/imageHandler/c1920x1080/68363/6.jpg?fmt=jpg"
  ],
  "day-05": [
    "https://wetu.com/imageHandler/c1920x1080/10515/ondili_desert_homestead_venture_media--23.jpg?fmt=jpg",
    "https://wetu.com/imageHandler/c1920x1080/10515/img_6924.jpg?fmt=jpg",
    "https://wetu.com/imageHandler/c1920x1080/10515/img_5262.jpg?fmt=jpg",
    "https://wetu.com/imageHandler/c1920x1080/10515/2016_desert_homestead_lodge_reiterhaus_5.jpg?fmt=jpg",
    "https://wetu.com/imageHandler/c1920x1080/10515/img_68201.jpg?fmt=jpg",
    "https://wetu.com/imageHandler/c1920x1080/10515/img_68961.jpg?fmt=jpg"
  ],
  "day-06": [
    "https://wetu.com/imageHandler/c1920x1080/149035/exterior_24.jpg?fmt=jpg",
    "https://wetu.com/imageHandler/c1920x1080/149035/exterior_23.jpg?fmt=jpg",
    "https://wetu.com/imageHandler/c1920x1080/149035/marcbass_swakopgh_renew_-_courtyard1.jpg?fmt=jpg",
    "https://wetu.com/imageHandler/c1920x1080/149035/marcbass_swakopgh_renew-8_-_standard_room1.jpg?fmt=jpg",
    "https://wetu.com/imageHandler/c1920x1080/149035/marcbass_swakopgh_renew-7_-_luxury_room.jpg?fmt=jpg",
    "https://wetu.com/imageHandler/c1920x1080/149035/marcbass_swakopgh_renew-9_-_suite.jpg?fmt=jpg"
  ],
  "day-07": [
    "https://wetu.com/imageHandler/c1920x1080/312689/img_e18011.jpg?fmt=jpg",
    "https://wetu.com/imageHandler/c1920x1080/312689/wozde81901.jpg?fmt=jpg",
    "https://wetu.com/imageHandler/c1920x1080/312689/img_e18421.jpg?fmt=jpg",
    "https://wetu.com/imageHandler/c1920x1080/312689/img_e18161.jpg?fmt=jpg",
    "https://wetu.com/imageHandler/c1920x1080/312689/dsc_4868.jpg?fmt=jpg",
    "https://wetu.com/imageHandler/c1920x1080/312689/lodgedamaraland309.jpg?fmt=jpg"
  ],
  "day-08": [
    "https://wetu.com/imageHandler/c1920x1080/28950/20220804_192246.jpg?fmt=jpg",
    "https://wetu.com/imageHandler/c1920x1080/28950/20220816_182328.jpg?fmt=jpg",
    "https://wetu.com/imageHandler/c1920x1080/28950/20220827_115537.jpg?fmt=jpg",
    "https://wetu.com/imageHandler/c1920x1080/28950/20220813_0924071.jpg?fmt=jpg",
    "https://wetu.com/imageHandler/c1920x1080/28950/20220913_184802.jpg?fmt=jpg",
    "https://wetu.com/imageHandler/c1920x1080/28950/20220831_065618.jpg?fmt=jpg"
  ],
  "day-09": [
    "https://wetu.com/imageHandler/c1920x1080/34701/omarunga-scenery21.jpg?fmt=jpg",
    "https://wetu.com/imageHandler/c1920x1080/34701/dsc_8001.jpg?fmt=jpg",
    "https://wetu.com/imageHandler/c1920x1080/34701/dsc_7983.jpg?fmt=jpg",
    "https://wetu.com/imageHandler/c1920x1080/34701/dsc_8087.jpg?fmt=jpg",
    "https://wetu.com/imageHandler/c1920x1080/34701/dsc_8007.jpg?fmt=jpg",
    "https://wetu.com/imageHandler/c1920x1080/34701/omarunga-scenery3.jpg?fmt=jpg"
  ],
  "day-10": [
    "https://wetu.com/imageHandler/c1920x1080/10417/amazing_planet_filip_kulisev_elephant3.jpg?fmt=jpg",
    "https://wetu.com/imageHandler/c1920x1080/10417/amazing_planet_filip_kulisev_front-of-lodge2.jpg?fmt=jpg",
    "https://wetu.com/imageHandler/c1920x1080/10417/green_lions2.jpg?fmt=jpg",
    "https://wetu.com/imageHandler/c1920x1080/10417/amazing_planet_filip_kulisev_lions1.jpg?fmt=jpg",
    "https://wetu.com/imageHandler/c1920x1080/10417/yawn-2.jpg?fmt=jpg",
    "https://wetu.com/imageHandler/c1920x1080/10417/snitch.jpg?fmt=jpg"
  ],
  "day-11": [
    "https://wetu.com/imageHandler/c1920x1080/10560/etosha_game_drive1.jpg?fmt=jpg",
    "https://wetu.com/imageHandler/c1920x1080/10560/dsc_9369.jpg?fmt=jpg",
    "https://wetu.com/imageHandler/c1920x1080/10560/dsc_7303.jpg?fmt=jpg",
    "https://wetu.com/imageHandler/c1920x1080/10560/dsc_7278.jpg?fmt=jpg",
    "https://wetu.com/imageHandler/c1920x1080/10560/dsc_7284.jpg?fmt=jpg",
    "https://wetu.com/imageHandler/c1920x1080/10560/music.jpg?fmt=jpg"
  ],
  "day-12": [
    "https://wetu.com/imageHandler/c1920x1080/15330/okapuka_safai_lodge_1.jpg?fmt=jpg",
    "https://wetu.com/imageHandler/c1920x1080/15330/okapuka_safari_lodge__game_drive_17.jpg?fmt=jpg",
    "https://wetu.com/imageHandler/c1920x1080/15330/okapuka_safari_lodge_lounge_4.jpg?fmt=jpg",
    "https://wetu.com/imageHandler/c1920x1080/15330/okapuka_safari_lodge_classic_safari_room_12.jpg?fmt=jpg",
    "https://wetu.com/imageHandler/c1920x1080/15330/okapuka_safari_lodge_classic_safari_room_5.jpg?fmt=jpg",
    "https://wetu.com/imageHandler/c1920x1080/15330/okapuka_safari_lodge_reception_2.jpg?fmt=jpg"
  ]
}

# 1. Update day block galleries
blocks = html.split('<div class="lux-day-block"')
out_html = blocks[0]

for block in blocks[1:]:
    day_id_match = re.search(r'id="(day-\d+)"', block)
    if day_id_match:
        day_id = day_id_match.group(1)
        if day_id in images_data:
            urls = images_data[day_id]
            
            # Find the track div
            track_start = block.find('<div class="dt-film-track">')
            track_end = block.find('</div>', track_start)
            
            if track_start != -1:
                # Find the footer
                footer_start = block.find('<div class="dt-film-footer">')
                
                if footer_start != -1:
                    new_cards = ""
                    for i, img_url in enumerate(urls, 1):
                        new_cards += f'''                        <div class="dt-film-card">
                            <img src="{img_url}" alt="Room {i}">
                        </div>\n'''
                    
                    part1 = block[:track_start + len('<div class="dt-film-track">\n')]
                    part_end = block.find('</div>\n                </div>\n\n                <div class="dt-film-footer">')
                    if part_end != -1:
                        block = part1 + new_cards + "                    " + block[part_end:]
    
    out_html += '<div class="lux-day-block"' + block

html = out_html

# 2. Update LODGE selection array at the very bottom or top (lux-acc-card images)
# Regex to match: <a href="#day-01" class="lux-acc-card"> ... <img src="..."> ...
def update_acc_cards(match):
    day_id = match.group(1)
    old_card_content = match.group(0)
    
    if day_id in images_data:
        # get first visual from LODGE pictures instead of the generic animal/location DESTINATION pics
        new_lodge_pic = images_data[day_id][0]
        # replace the <img src="..." in the match
        new_card_content = re.sub(r'<img src="[^"]+"', f'<img src="{new_lodge_pic}"', old_card_content)
        return new_card_content
    return old_card_content

html = re.sub(r'<a href="#(day-\d+)" class="lux-acc-card">([\s\S]*?)</a>', update_acc_cards, html)

with open(html_path, "w") as f:
    f.write(html)
print("Finished saving itinerary_1_18_day.html")
