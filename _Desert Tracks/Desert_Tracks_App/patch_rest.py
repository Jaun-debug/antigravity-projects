import urllib.request
import re
import json

data = [
    {"num": "01", "loc": "WINDHOEK — TI MELEN BOUTIQUE GUESTHOUSE", "title": "Arrival in Windhoek", "desc": "Experience the charm of Windhoek in a boutique guesthouse blending modern comforts with local warmth. Spend your first night in Namibia surrounded by the intimate atmosphere of Ti Melen, ideal for a peaceful start to your adventure.", "bg": "https://desert-tracks.com/wp-content/uploads/2024/04/Solly-Levi-Sossusvlei-1.jpg", "imgs": ["https://wetu.com/imageHandler/c1920x1080/55342/143a4578.jpg?fmt=jpg", "https://wetu.com/imageHandler/c1920x1080/55342/img_4373.jpg?fmt=jpg", "https://wetu.com/imageHandler/c1920x1080/55342/img_4408.jpg?fmt=jpg"]},
    {"num": "02", "loc": "KALAHARI DESERT — KALAHARI ANIB LODGE", "title": "Journey to the Kalahari", "desc": "Discover the beauty of the Kalahari at this eco-friendly lodge. The towering red dunes and starry nights set the perfect backdrop for a romantic evening. Enjoy luxurious cuisine and desert exploration before retreating to your cozy room.", "bg": "https://wetu.com/imageHandler/c1920x1080/31966/anib2016-8826.jpg?fmt=jpg", "imgs": ["https://wetu.com/imageHandler/c1920x1080/31966/anib2016-8826.jpg?fmt=jpg", "https://wetu.com/imageHandler/c1920x1080/31966/gondwana_collection_-_kalahari_anib_lodge_00018.jpg?fmt=jpg", "https://wetu.com/imageHandler/c1920x1080/31966/anib2016-8819.jpg?fmt=jpg"]},
    {"num": "03", "loc": "SOSSUSVLEI — DESERT HOMESTEAD LODGE", "title": "Dunes of Sossusvlei", "desc": "Immerse yourself in the surreal beauty of the Namib Desert. Stay at Desert Homestead, nestled between the red dunes, where you can explore the world's tallest dunes and return to luxury at the lodge for intimate sunset views.", "bg": "https://wetu.com/imageHandler/c1920x1080/468/Namib%201%201.jpg?fmt=jpg", "imgs": ["https://wetu.com/imageHandler/c1920x1080/10515/ondili_desert_homestead_venture_media--23.jpg?fmt=jpg", "https://wetu.com/imageHandler/c1920x1080/10515/img_68201.jpg?fmt=jpg", "https://wetu.com/imageHandler/c1920x1080/468/Namib%201%201.jpg?fmt=jpg"]},
    {"num": "05", "loc": "SWAKOPMUND — SWAKOPMUND GUESTHOUSE", "title": "Coastal Charm", "desc": "Blend adventure with relaxation at this charming guesthouse in Swakopmund, offering easy access to the beach and colonial-style comforts. Explore the unique coastal town with its German heritage, or unwind with a stroll along the ocean.", "bg": "https://wetu.com/imageHandler/c1920x1080/471/Swakop_3.jpg?fmt=jpg", "imgs": ["https://wetu.com/imageHandler/c1920x1080/149035/exterior_24.jpg?fmt=jpg", "https://wetu.com/imageHandler/c1920x1080/149035/marcbass_swakopgh_renew_-_courtyard1.jpg?fmt=jpg", "https://wetu.com/imageHandler/c1920x1080/471/Swakop_3.jpg?fmt=jpg"]},
    {"num": "07", "loc": "DAMARALAND — LODGE DAMARALAND", "title": "Ancient Landscapes", "desc": "In the heart of Damaraland, experience timeless landscapes and ancient rock art. Stay in a comfortable lodge designed to blend with its surroundings, offering exciting excursions to explore the desert's hidden gems.", "bg": "https://wetu.com/imageHandler/c1920x1080/312689/wozde81901.jpg?fmt=jpg", "imgs": ["https://wetu.com/imageHandler/c1920x1080/312689/img_e18011.jpg?fmt=jpg", "https://wetu.com/imageHandler/c1920x1080/312689/wozde81901.jpg?fmt=jpg", "https://wetu.com/imageHandler/c1920x1080/312689/img_e18421.jpg?fmt=jpg"]},
    {"num": "09", "loc": "ETOSHA SOUTH — ETOSHA SAFARI CAMP", "title": "Gateway to Wildlife", "desc": "Set near the southern entrance to Etosha National Park, Etosha Safari Camp gives you access to one of Africa's most celebrated wildlife sanctuaries. Enjoy an evening of delicious meals and sunset views.", "bg": "https://wetu.com/imageHandler/c1920x1080/10560/etosha_game_drive1.jpg?fmt=jpg", "imgs": ["https://wetu.com/imageHandler/c1920x1080/10560/dsc_7278.jpg?fmt=jpg", "https://wetu.com/imageHandler/c1920x1080/10560/etosha_game_drive1.jpg?fmt=jpg", "https://wetu.com/imageHandler/c1920x1080/123643/etosha_5.jpg?fmt=jpg"]},
    {"num": "10", "loc": "ETOSHA RESERVE — ONGUMA BUSH CAMP", "title": "The Great Salt Pan", "desc": "Enjoy luxurious tented suites at Onguma, a private reserve bordering Etosha National Park. The tranquil setting allows for both thrilling game drives and romantic evenings by the campfire.", "bg": "https://wetu.com/imageHandler/c1920x1080/123643/etosha_5.jpg?fmt=jpg", "imgs": ["https://wetu.com/imageHandler/c1920x1080/8717/onguma_bush_camp_1098.jpg?fmt=jpg", "https://wetu.com/imageHandler/c1920x1080/8717/onguma_bush_camp_1117.jpg?fmt=jpg", "https://wetu.com/imageHandler/c1920x1080/8717/d31g9127.jpg?fmt=jpg"]},
    {"num": "12", "loc": "OTJIWA NATURE RESERVE — EAGLE'S REST", "title": "Journey's End in Luxury", "desc": "End your Namibian adventure in luxury at Eagle's Rest. Nestled in the peaceful Otjiwa Nature Reserve, the lodge offers exceptional service and the chance to unwind with private bush walks or simply relax.", "bg": "https://wetu.com/imageHandler/c1920x1080/29061/2s3a1677.jpg?fmt=jpg", "imgs": ["https://wetu.com/imageHandler/c1920x1080/29061/2s3a1677.jpg?fmt=jpg", "https://wetu.com/imageHandler/c1920x1080/29061/2s3a0834.jpg?fmt=jpg", "https://wetu.com/imageHandler/c1920x1080/29061/2s3a9305.jpg?fmt=jpg"]},
]

airport = {"num": "14", "loc": "WINDHOEK — HOSEA KUTAKO AIRPORT", "title": "Departure Bound", "desc": "After a breathtaking final morning in the Otjiwa reserve, make your way back down to the capital for your departure. Journey safely and take home an eternity of memories.", "bg": "https://wetu.com/imageHandler/c1920x1080/29061/2s3a1677.jpg?fmt=jpg"}

with open("14-day-comfort.html", "r", encoding="utf-8") as f:
    html = f.read()

days_html = ""
for d in data:
    imgs = d["imgs"]*2 # duplicate to 6 
    
    lodge_name = d["loc"].split("— ")[-1]
    
    cards_html = ""
    for i, img in enumerate(imgs):
        label = "Exterior View" if i%3==0 else "Luxury Room" if i%3==1 else "Dining / Lounge"
        cards_html += f"""
                        <div class="dt-film-card">
                            <img src="{img}" alt="Room {i+1}">
                            <div class="dt-film-caption"><span class="dt-film-caption-text">{label}</span></div>
                        </div>"""

    days_html += f"""
        <!-- DAY {d['num']} -->
        <div class="lux-day-block" id="day-{d['num']}" data-bg="{d['bg']}">
            <div class="lux-day-block-header">
                <div class="lux-day-number-row">
                    <span class="lux-day-numeral">{d['num']}</span>
                    <div class="lux-day-line"></div>
                </div>
                <span class="lux-day-location">{d['loc']}</span>
                <h2 class="lux-day-title">{d['title']}</h2>
                <p class="lux-day-desc">{d['desc']}</p>
            </div>
            
            <div class="dt-film-section">
                <div class="dt-film-header">
                    <div>
                        <span class="dt-film-eyebrow">Accommodation Profile</span>
                        <h2 class="dt-film-title">{lodge_name}</h2>
                    </div>
                    <div class="dt-film-counter">01 <span>/ 06</span></div>
                </div>
                
                <div class="dt-film-track-wrap">
                    <div class="dt-film-track">{cards_html}
                    </div>
                </div>

                <div class="dt-film-footer">
                    <div class="dt-film-progress-wrap"><div class="dt-film-progress-bar" style="width: 0%;"></div></div>
                    <div class="dt-film-arrows">
                        <div class="dt-film-arrow dt-film-prev-btn"><svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"></polyline></svg></div>
                        <div class="dt-film-arrow dt-film-next-btn"><svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"></polyline></svg></div>
                    </div>
                </div>
            </div>
        </div>
"""

# add airport
days_html += f"""
        <!-- DAY {airport['num']} -->
        <div class="lux-day-block" id="day-{airport['num']}" data-bg="{airport['bg']}">
            <div class="lux-day-block-header">
                <div class="lux-day-number-row">
                    <span class="lux-day-numeral">{airport['num']}</span>
                    <div class="lux-day-line"></div>
                </div>
                <span class="lux-day-location">{airport['loc']}</span>
                <h2 class="lux-day-title">{airport['title']}</h2>
                <p class="lux-day-desc">{airport['desc']}</p>
            </div>
        </div>
"""

# Replace the inner sequence in 14-day-comfort.html
start_marker = "        <!-- DAY 1-2 -->"
end_marker = "    </div>\n</div>\n\n<script>"

start_idx = html.find(start_marker)
end_idx = html.find(end_marker)

if start_idx != -1 and end_idx != -1:
    new_html = html[:start_idx] + days_html + html[end_idx:]
    with open("14-day-comfort.html", "w", encoding="utf-8") as f:
        f.write(new_html)
    print("Injected all 14 days successfully!")
else:
    print("Markers not found.")
