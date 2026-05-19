import re

with open("14-day-comfort.html", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update Hero Details
content = content.replace("14-Day Comfort Safari", "17-Day Discovery Safari")
content = content.replace("From the dunes of Sossusvlei to the wildlife of Etosha", "From the dunes of Sossusvlei to the roaring Victoria Falls")

# Replace the days summary below hero
orig_summary = """                    <h1 class="lux-cin-title" id="dtHeroTitle">Where Will Your <br> Journey Take You?</h1>
                    <p class="lux-cin-desc" id="dtHeroDesc">From the stark beauty of the Kalahari to the wildlife-rich plains of Etosha, experience Namibia in unparalleled comfort.</p>"""
new_summary = """                    <h1 class="lux-cin-title" id="dtHeroTitle">From the Dunes <br> to the Falls.</h1>
                    <p class="lux-cin-desc" id="dtHeroDesc">An epic 17-day journey from the ancient Namib Desert through the wildlife corridors of Caprivi, ending at the thundering Victoria Falls.</p>"""
content = content.replace(orig_summary, new_summary)

# Update day count blocks
content = content.replace('14 Days', '17 Days')
content = content.replace('14-Day Namibia Comfort Safari', '17-Day Namibia, Chobe & Vic Falls Safari')
content = re.sub(r'Windhoek • Kalahari • Sossusvlei[^<]*', 'Windhoek • Sossusvlei • Swakopmund • Spitzkoppe • Etosha • Caprivi • Chobe • Victoria Falls', content)

# 2. Build New Day Blocks!
start_marker = '<h2 class="lux-day-block-header"'
end_marker = '<!-- Accommodations Grid Block -->'

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

new_days_html = """        <h2 class="lux-day-block-header" style="margin-bottom: 30px;">Your Itinerary</h2>

        <div class="lux-day-block" id="day-01" data-bg="https://wetu.com/imageHandler/c1920x1080/55342/143a4578.jpg?fmt=jpg">
            <span class="lux-day-number">Day 01-02</span>
            <h3 class="lux-day-title">Arrival in Windhoek</h3>
            <p class="lux-day-desc">Welcome to Namibia! Upon arrival at Hosea Kutako International Airport, you will collect your premium 4x4 rental vehicle and head into the capital city. Windhoek is a fascinating blend of modern architecture and historic German colonial buildings. Check into your boutique guesthouse and unwind after your journey.</p>
            <div class="lux-day-stay"><strong>Stay:</strong> Ti Melen Boutique Guesthouse</div>
            
            <div class="lux-day-film">
                <div class="dt-film-track">
                    <img src="https://desert-tracks.com/wp-content/uploads/2026/03/gal1.jpeg" class="dt-film-frame" alt="Windhoek">
                    <img src="https://wetu.com/imageHandler/c1920x1080/55342/143a4578.jpg?fmt=jpg" class="dt-film-frame" alt="Ti Melen">
                </div>
            </div>
        </div>

        <div class="lux-day-block" id="day-02" data-bg="https://wetu.com/imageHandler/c1920x1080/10515/ondili_desert_homestead_venture_media--23.jpg?fmt=jpg">
             <span class="lux-day-number">Day 02-04</span>
             <h3 class="lux-day-title">Into the Namib Desert</h3>
             <p class="lux-day-desc">Descend the spectacular escarpment into the ancient Namib Desert. Your base for the next two nights is nestled at the edge of the Namib-Naukluft National Park. Rise early the next morning to explore the towering red dunes of Sossusvlei and the surreal, dead camelthorn trees of Deadvlei.</p>
             <div class="lux-day-stay"><strong>Stay:</strong> Desert Homestead Lodge</div>
             <div class="lux-day-film">
                 <div class="dt-film-track">
                     <img src="https://wetu.com/imageHandler/c1920x1080/10515/ondili_desert_homestead_venture_media--23.jpg?fmt=jpg" class="dt-film-frame" alt="Desert Homestead">
                 </div>
             </div>
        </div>

        <div class="lux-day-block" id="day-04" data-bg="https://wetu.com/imageHandler/c1920x1080/47749/sls__family_room1.jpg?fmt=jpg">
            <span class="lux-day-number">Day 04-06</span>
            <h3 class="lux-day-title">Coastal Charm of Swakopmund</h3>
            <p class="lux-day-desc">Drive through the otherworldly landscapes of the Kuiseb Canyon towards the Atlantic Ocean. Swakopmund seamlessly blends coastal charm with desert adventure. Enjoy excellent seafood, explore the Germanic architecture, or embark on a Living Desert tour or thrilling quad bike excursion.</p>
            <div class="lux-day-stay"><strong>Stay:</strong> Swakopmund Luxury Suites</div>
            <div class="lux-day-film">
                <div class="dt-film-track">
                    <img src="https://wetu.com/imageHandler/c1920x1080/47749/sls__family_room1.jpg?fmt=jpg" class="dt-film-frame" alt="Swakopmund">
                </div>
            </div>
        </div>

        <div class="lux-day-block" id="day-06" data-bg="https://wetu.com/imageHandler/c1920x1080/101058/1.jpeg?fmt=jpg">
            <span class="lux-day-number">Day 06-07</span>
            <h3 class="lux-day-title">The Granite Peaks of Spitzkoppe</h3>
            <p class="lux-day-desc">Head inland towards the dramatic "Matterhorn of Namibia". Spitzkoppe's massive granite peaks rise abruptly from the desert floor. Explore ancient bushman rock art, hike the incredible rock formations, and witness some of the clearest, most spectacular starry skies in Africa.</p>
            <div class="lux-day-stay"><strong>Stay:</strong> Spitzkoppen Lodge</div>
            <div class="lux-day-film">
                <div class="dt-film-track">
                    <img src="https://wetu.com/imageHandler/c1920x1080/101058/1.jpeg?fmt=jpg" class="dt-film-frame" alt="Spitzkoppe">
                </div>
            </div>
        </div>

        <div class="lux-day-block" id="day-07" data-bg="https://wetu.com/imageHandler/c1920x1080/10560/etosha_game_drive1.jpg?fmt=jpg">
            <span class="lux-day-number">Day 07-08</span>
            <h3 class="lux-day-title">Gateway to Etosha</h3>
            <p class="lux-day-desc">Your wildlife adventure begins as you head to the southern gateway of Etosha National Park. Renowned for its massive shimmering salt pan, the park offers unparalleled opportunities to spot rhino, elephant, lion, and numerous antelope species converging at local waterholes.</p>
            <div class="lux-day-stay"><strong>Stay:</strong> Etosha Safari Camp</div>
            <div class="lux-day-film">
                <div class="dt-film-track">
                    <img src="https://wetu.com/imageHandler/c1920x1080/10560/etosha_game_drive1.jpg?fmt=jpg" class="dt-film-frame" alt="Etosha Safari Camp">
                </div>
            </div>
        </div>

        <div class="lux-day-block" id="day-08" data-bg="https://wetu.com/imageHandler/c1920x1080/8717/onguma_bush_camp_1098.jpg?fmt=jpg">
            <span class="lux-day-number">Day 08-10</span>
            <h3 class="lux-day-title">Eastern Etosha & Onguma</h3>
            <p class="lux-day-desc">Traverse the width of Etosha, game driving from waterhole to waterhole, until you reach the eastern boundary. Here, you enter the private Onguma Nature Reserve, offering exclusive sunset drives and intimate, luxurious wilderness experiences far from the crowds.</p>
            <div class="lux-day-stay"><strong>Stay:</strong> Onguma Bush Camp</div>
            <div class="lux-day-film">
                <div class="dt-film-track">
                    <img src="https://wetu.com/imageHandler/c1920x1080/8717/onguma_bush_camp_1098.jpg?fmt=jpg" class="dt-film-frame" alt="Onguma">
                </div>
            </div>
        </div>

        <div class="lux-day-block" id="day-10" data-bg="https://wetu.com/imageHandler/c1920x1080/68333/home_0003_header.jpg?fmt=jpg">
            <span class="lux-day-number">Day 10-12</span>
            <h3 class="lux-day-title">The Okavango River (Bagani)</h3>
            <p class="lux-day-desc">A dramatic change of scenery as you enter the lush, green Caprivi Strip. Arrive on the banks of the mighty Okavango River, near Popa Falls. Enjoy birding safaris, mokoro trips, and sundowner boat cruises as hippos grunt in the background.</p>
            <div class="lux-day-stay"><strong>Stay:</strong> Shametu River Lodge</div>
            <div class="lux-day-film">
                <div class="dt-film-track">
                    <img src="https://wetu.com/imageHandler/c1920x1080/68333/home_0003_header.jpg?fmt=jpg" class="dt-film-frame" alt="Shametu">
                </div>
            </div>
        </div>

        <div class="lux-day-block" id="day-12" data-bg="https://wetu.com/imageHandler/c1920x1080/15350/namushasha7.jpg?fmt=jpg">
            <span class="lux-day-number">Day 12-13</span>
            <h3 class="lux-day-title">Elephants of the Kwando River</h3>
            <p class="lux-day-desc">Continue deep into the Caprivi to the Kwando River, an ecosystem teeming with massive herds of elephant, buffalo, and rare wetland antelopes. Explore the waterways and savannas of Bwabwata National Park.</p>
            <div class="lux-day-stay"><strong>Stay:</strong> Namushasha River Lodge</div>
            <div class="lux-day-film">
                <div class="dt-film-track">
                    <img src="https://wetu.com/imageHandler/c1920x1080/15350/namushasha7.jpg?fmt=jpg" class="dt-film-frame" alt="Namushasha">
                </div>
            </div>
        </div>

        <div class="lux-day-block" id="day-13" data-bg="https://wetu.com/imageHandler/c1920x1080/19538/1762871606060riverside-breakfast-1.jpg?fmt=jpg">
            <span class="lux-day-number">Day 13-15</span>
            <h3 class="lux-day-title">Chobe National Park (Botswana)</h3>
            <p class="lux-day-desc">Cross the border into Botswana and arrive in Kasane, the gateway to Chobe National Park. World-renowned for hosting Africa's largest elephant population, your days will be spent on thrilling 4x4 game drives and spectacular Chobe River safari cruises.</p>
            <div class="lux-day-stay"><strong>Stay:</strong> The Chobe Safari Lodge</div>
            <div class="lux-day-film">
                <div class="dt-film-track">
                    <img src="https://wetu.com/imageHandler/c1920x1080/19538/1762871606060riverside-breakfast-1.jpg?fmt=jpg" class="dt-film-frame" alt="Chobe">
                </div>
            </div>
        </div>

        <div class="lux-day-block" id="day-15" data-bg="https://wetu.com/imageHandler/c1920x1080/194740/1756463034280pioneers03low.jpg?fmt=jpg">
            <span class="lux-day-number">Day 15-17</span>
            <h3 class="lux-day-title">The Smoke That Thunders (Victoria Falls)</h3>
            <p class="lux-day-desc">Transfer across the border to Zimbabwe to witness one of the Seven Natural Wonders of the World: Victoria Falls. Marvel at the sheer power of the Zambezi River. Enjoy optional activities like helicopter flights, bridge tours, or a final sunset dinner cruise before your journey concludes.</p>
            <div class="lux-day-stay"><strong>Stay:</strong> Pioneers Victoria Falls</div>
            <div class="lux-day-film" style="margin-bottom: 2rem;">
                <div class="dt-film-track">
                    <img src="https://wetu.com/imageHandler/c1920x1080/194740/1756463034280pioneers03low.jpg?fmt=jpg" class="dt-film-frame" alt="Pioneers">
                </div>
            </div>
        </div>
\n\n"""

if start_idx != -1 and end_idx != -1:
    content = content[:start_idx] + new_days_html + "\n\n            " + content[end_idx:]

# 3. Update the Lodge Grid at the bottom!
grid_start = content.find('<div class="lux-acc-grid">')
grid_end = content.find('</div>\n            </div>\n        <div class="lux-padding-wrapper"')

new_grid = """<div class="lux-acc-grid">
                    <a href="https://www.ondili.com/en/lodges-en/ti-melen/" target="_blank" class="lux-acc-card">
                        <img src="https://wetu.com/imageHandler/c1920x1080/55342/143a4578.jpg?fmt=jpg" alt="Ti Melen">
                        <h4 class="lux-acc-title">Ti Melen</h4>
                        <p class="lux-acc-desc">Boutique Windhoek luxury.</p>
                    </a>
                    <a href="https://ondili.com" target="_blank" class="lux-acc-card">
                        <img src="https://wetu.com/imageHandler/c1920x1080/10515/ondili_desert_homestead_venture_media--23.jpg?fmt=jpg" alt="Desert Homestead">
                        <h4 class="lux-acc-title">Desert Homestead Lodge</h4>
                        <p class="lux-acc-desc">Nestled between the red dunes of Sossusvlei.</p>
                    </a>
                    <a href="https://swakopmund-guesthouse.com" target="_blank" class="lux-acc-card">
                        <img src="https://wetu.com/imageHandler/c1920x1080/47749/sls__family_room1.jpg?fmt=jpg" alt="Swakopmund Luxury Suites">
                        <h4 class="lux-acc-title">Swakopmund Luxury Suites</h4>
                        <p class="lux-acc-desc">Coastal luxury in Swakopmund.</p>
                    </a>
                    <a href="#" target="_blank" class="lux-acc-card">
                        <img src="https://wetu.com/imageHandler/c1920x1080/101058/1.jpeg?fmt=jpg" alt="Spitzkoppen Lodge">
                        <h4 class="lux-acc-title">Spitzkoppen Lodge</h4>
                        <p class="lux-acc-desc">Granite peak wilderness.</p>
                    </a>
                    <a href="#" target="_blank" class="lux-acc-card">
                        <img src="https://wetu.com/imageHandler/c1920x1080/10560/etosha_game_drive1.jpg?fmt=jpg" alt="Etosha Safari Camp">
                        <h4 class="lux-acc-title">Etosha Safari Camp</h4>
                        <p class="lux-acc-desc">Gateway to southern Etosha.</p>
                    </a>
                    <a href="#" target="_blank" class="lux-acc-card">
                        <img src="https://wetu.com/imageHandler/c1920x1080/8717/onguma_bush_camp_1098.jpg?fmt=jpg" alt="Onguma Bush Camp">
                        <h4 class="lux-acc-title">Onguma Bush Camp</h4>
                        <p class="lux-acc-desc">Exclusive eastern Etosha reserve.</p>
                    </a>
                    <a href="#" target="_blank" class="lux-acc-card">
                        <img src="https://wetu.com/imageHandler/c1920x1080/68333/home_0003_header.jpg?fmt=jpg" alt="Shametu River Lodge">
                        <h4 class="lux-acc-title">Shametu River Lodge</h4>
                        <p class="lux-acc-desc">Riverside luxury at Popa Falls.</p>
                    </a>
                    <a href="#" target="_blank" class="lux-acc-card">
                        <img src="https://wetu.com/imageHandler/c1920x1080/15350/namushasha7.jpg?fmt=jpg" alt="Namushasha">
                        <h4 class="lux-acc-title">Namushasha River Lodge</h4>
                        <p class="lux-acc-desc">Kwando river elephant encounters.</p>
                    </a>
                    <a href="#" target="_blank" class="lux-acc-card">
                        <img src="https://wetu.com/imageHandler/c1920x1080/19538/1762871606060riverside-breakfast-1.jpg?fmt=jpg" alt="Chobe Safari Lodge">
                        <h4 class="lux-acc-title">Chobe Safari Lodge</h4>
                        <p class="lux-acc-desc">Access to the massive herds of Botswana.</p>
                    </a>
                    <a href="#" target="_blank" class="lux-acc-card">
                        <img src="https://wetu.com/imageHandler/c1920x1080/194740/1756463034280pioneers03low.jpg?fmt=jpg" alt="Pioneers Victoria Falls">
                        <h4 class="lux-acc-title">Pioneers Victoria Falls</h4>
                        <p class="lux-acc-desc">Classic luxury near the falls.</p>
                    </a>\n                """

if grid_start != -1 and grid_end != -1:
    content = content[:grid_start] + new_grid + content[grid_end:]

# Set primary left background to vic falls or chobe
content = content.replace('id="lux-bg-base" style="background-image: url(\'https://desert-tracks.com/wp-content/uploads/2026/03/solly_5112_4-2.jpg\');"', 'id="lux-bg-base" style="background-image: url(\'https://wetu.com/imageHandler/c1920x1080/55342/143a4578.jpg?fmt=jpg\');"')

# Write the new file
with open("17-day-discovery.html", "w", encoding="utf-8") as f:
    f.write(content)
print("Done writing new 17-day itinerary!")
