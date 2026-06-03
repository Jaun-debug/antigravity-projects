import re

with open("14-day-comfort.html", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update Hero Details
content = content.replace("14-Day Comfort Safari", "17-Day Discovery Safari")
content = content.replace("From the dunes of Sossusvlei to the wildlife of Etosha", "From the dunes of Sossusvlei to the roaring Victoria Falls")

# Replace Title
content = content.replace('<h1 class="lux-title">14-Day Namibia<br>Comfort Safari</h1>', '<h1 class="lux-title">17-Day Namibia,<br>Chobe & Vic Falls<br>Safari</h1>')

orig_summary = """                    <h1 class="lux-cin-title" id="dtHeroTitle">Where Will Your <br> Journey Take You?</h1>
                    <p class="lux-cin-desc" id="dtHeroDesc">From the stark beauty of the Kalahari to the wildlife-rich plains of Etosha, experience Namibia in unparalleled comfort.</p>"""
new_summary = """                    <h1 class="lux-cin-title" id="dtHeroTitle">From the Dunes <br> to the Falls.</h1>
                    <p class="lux-cin-desc" id="dtHeroDesc">An epic 17-day journey from the ancient Namib Desert through the wildlife corridors of Caprivi, ending at the thundering Victoria Falls.</p>"""
content = content.replace(orig_summary, new_summary)

content = content.replace('14 Days', '17 Days')
content = content.replace('14-Day Namibia Comfort Safari', '17-Day Namibia, Chobe & Vic Falls Safari')
content = re.sub(r'Windhoek • Kalahari • Sossusvlei[^<]*', 'Windhoek • Sossusvlei • Swakopmund • Spitzkoppe • Etosha • Caprivi • Chobe • Victoria Falls', content)

# Replace the day blocks
start_marker = '<!-- DAY 01 -->'
end_marker = '<!-- Verified Trust/Reviews Block -->'

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

new_days_html = """        <!-- DAY 01 -->
        <div class="lux-day-block" id="day-01" data-bg="https://wetu.com/imageHandler/c1920x1080/55342/143a4578.jpg?fmt=jpg">
            <div class="lux-day-block-header">
                <div class="lux-day-number-row">
                    <span class="lux-day-numeral">01</span>
                    <div class="lux-day-line"></div>
                </div>
                <span class="lux-day-location">Windhoek — Ti Melen Boutique Guesthouse</span>
                <h2 class="lux-day-title">Arrival in Windhoek</h2>
                <p class="lux-day-desc">Welcome to Namibia! Upon arrival at Hosea Kutako International Airport, you will collect your premium 4x4 rental vehicle and head into the capital city. Windhoek is a fascinating blend of modern architecture and historic German colonial buildings. Check into your boutique guesthouse and unwind after your journey.</p>
            </div>
            
            <div class="dt-film-section">
                <div class="dt-film-header">
                    <div>
                        <span class="dt-film-eyebrow">Accommodation Profile</span>
                        <h2 class="dt-film-title">Ti Melen Boutique Guesthouse</h2>
                    </div>
                </div>
                <div class="dt-film-track-wrap"><div class="dt-film-track">
                    <div class="dt-film-card"><img src="https://wetu.com/imageHandler/c1920x1080/55342/143a4578.jpg?fmt=jpg"></div>
                </div></div>
            </div>
        </div>

        <!-- DAY 02 -->
        <div class="lux-day-block" id="day-02" data-bg="https://wetu.com/imageHandler/c1920x1080/10515/ondili_desert_homestead_venture_media--23.jpg?fmt=jpg">
             <div class="lux-day-block-header">
                <div class="lux-day-number-row"><span class="lux-day-numeral">02</span><div class="lux-day-line"></div></div>
                <span class="lux-day-location">Sossusvlei — Desert Homestead Lodge</span>
                <h2 class="lux-day-title">Into the Namib Desert</h2>
                <p class="lux-day-desc">Descend the spectacular escarpment into the ancient Namib Desert. Your base for the next two nights is nestled at the edge of the Namib-Naukluft National Park. Rise early the next morning to explore the towering red dunes of Sossusvlei and the surreal, dead camelthorn trees of Deadvlei.</p>
            </div>
        </div>

        <div class="lux-day-block" id="day-04" data-bg="https://wetu.com/imageHandler/c1920x1080/47749/sls__family_room1.jpg?fmt=jpg">
            <div class="lux-day-block-header">
                <div class="lux-day-number-row"><span class="lux-day-numeral">04</span><div class="lux-day-line"></div></div>
                <h2 class="lux-day-title">Coastal Charm of Swakopmund</h2>
                <p class="lux-day-desc">Drive through the otherworldly landscapes of the Kuiseb Canyon towards the Atlantic Ocean. Swakopmund seamlessly blends coastal charm with desert adventure. Enjoy excellent seafood, explore the Germanic architecture, or embark on a Living Desert tour or thrilling quad bike excursion.</p>
            </div>
        </div>

        <div class="lux-day-block" id="day-06" data-bg="https://wetu.com/imageHandler/c1920x1080/101058/1.jpeg?fmt=jpg">
            <div class="lux-day-block-header">
                <div class="lux-day-number-row"><span class="lux-day-numeral">06</span><div class="lux-day-line"></div></div>
                <h2 class="lux-day-title">The Granite Peaks of Spitzkoppe</h2>
                <p class="lux-day-desc">Head inland towards the dramatic "Matterhorn of Namibia". Spitzkoppe's massive granite peaks rise abruptly from the desert floor. Explore ancient bushman rock art, hike the incredible rock formations, and witness some of the clearest, most spectacular starry skies in Africa.</p>
            </div>
        </div>

        <div class="lux-day-block" id="day-07" data-bg="https://wetu.com/imageHandler/c1920x1080/10560/etosha_game_drive1.jpg?fmt=jpg">
            <div class="lux-day-block-header">
                <div class="lux-day-number-row"><span class="lux-day-numeral">07</span><div class="lux-day-line"></div></div>
                <h2 class="lux-day-title">Gateway to Etosha</h2>
                <p class="lux-day-desc">Your wildlife adventure begins as you head to the southern gateway of Etosha National Park. Renowned for its massive shimmering salt pan, the park offers unparalleled opportunities to spot rhino, elephant, lion, and numerous antelope species converging at local waterholes.</p>
            </div>
        </div>

        <div class="lux-day-block" id="day-08" data-bg="https://wetu.com/imageHandler/c1920x1080/8717/onguma_bush_camp_1098.jpg?fmt=jpg">
            <div class="lux-day-block-header">
                <div class="lux-day-number-row"><span class="lux-day-numeral">08</span><div class="lux-day-line"></div></div>
                <h2 class="lux-day-title">Eastern Etosha & Onguma</h2>
                <p class="lux-day-desc">Traverse the width of Etosha, game driving from waterhole to waterhole, until you reach the eastern boundary. Here, you enter the private Onguma Nature Reserve, offering exclusive sunset drives and intimate, luxurious wilderness experiences far from the crowds.</p>
            </div>
        </div>

        <div class="lux-day-block" id="day-10" data-bg="https://wetu.com/imageHandler/c1920x1080/68333/home_0003_header.jpg?fmt=jpg">
            <div class="lux-day-block-header">
                <div class="lux-day-number-row"><span class="lux-day-numeral">10</span><div class="lux-day-line"></div></div>
                <h2 class="lux-day-title">The Okavango River (Bagani)</h2>
                <p class="lux-day-desc">A dramatic change of scenery as you enter the lush, green Caprivi Strip. Arrive on the banks of the mighty Okavango River, near Popa Falls. Enjoy birding safaris, mokoro trips, and sundowner boat cruises as hippos grunt in the background.</p>
            </div>
        </div>

        <div class="lux-day-block" id="day-12" data-bg="https://wetu.com/imageHandler/c1920x1080/15350/namushasha7.jpg?fmt=jpg">
            <div class="lux-day-block-header">
                <div class="lux-day-number-row"><span class="lux-day-numeral">12</span><div class="lux-day-line"></div></div>
                <h2 class="lux-day-title">Elephants of the Kwando River</h2>
                <p class="lux-day-desc">Continue deep into the Caprivi to the Kwando River, an ecosystem teeming with massive herds of elephant, buffalo, and rare wetland antelopes. Explore the waterways and savannas of Bwabwata National Park.</p>
            </div>
        </div>

        <div class="lux-day-block" id="day-13" data-bg="https://wetu.com/imageHandler/c1920x1080/19538/1762871606060riverside-breakfast-1.jpg?fmt=jpg">
            <div class="lux-day-block-header">
                <div class="lux-day-number-row"><span class="lux-day-numeral">13</span><div class="lux-day-line"></div></div>
                <h2 class="lux-day-title">Chobe National Park (Botswana)</h2>
                <p class="lux-day-desc">Cross the border into Botswana and arrive in Kasane, the gateway to Chobe National Park. World-renowned for hosting Africa's largest elephant population, your days will be spent on thrilling 4x4 game drives and spectacular Chobe River safari cruises.</p>
            </div>
        </div>

        <div class="lux-day-block" id="day-15" data-bg="https://wetu.com/imageHandler/c1920x1080/194740/1756463034280pioneers03low.jpg?fmt=jpg">
             <div class="lux-day-block-header">
                <div class="lux-day-number-row"><span class="lux-day-numeral">15</span><div class="lux-day-line"></div></div>
                <h2 class="lux-day-title">The Smoke That Thunders (Victoria Falls)</h2>
                <p class="lux-day-desc">Transfer across the border to Zimbabwe to witness one of the Seven Natural Wonders of the World: Victoria Falls. Marvel at the sheer power of the Zambezi River. Enjoy optional activities like helicopter flights, bridge tours, or a final sunset dinner cruise before your journey concludes.</p>
            </div>
        </div>
\n\n"""

if start_idx != -1 and end_idx != -1:
    content = content[:start_idx] + new_days_html + "        " + content[end_idx:]

# Update Lodge Grid array above Include/Exclude
grid_start = content.find('<div class="lux-acc-grid">')
grid_end = content.find('<!-- Inclusions Block -->')

new_grid = """<div class="lux-acc-grid">
                    <a href="https://www.ondili.com/en/lodges-en/ti-melen/" target="_blank" class="lux-acc-card">
                        <img src="https://wetu.com/imageHandler/c1920x1080/55342/143a4578.jpg?fmt=jpg" alt="Ti Melen">
                        <h4 class="lux-acc-title">Ti Melen</h4>
                    </a>
                    <a href="https://ondili.com" target="_blank" class="lux-acc-card"><img src="https://wetu.com/imageHandler/c1920x1080/10515/ondili_desert_homestead_venture_media--23.jpg?fmt=jpg"><h4 class="lux-acc-title">Desert Homestead Lodge</h4></a>
                    <a href="#" target="_blank" class="lux-acc-card"><img src="https://wetu.com/imageHandler/c1920x1080/47749/sls__family_room1.jpg?fmt=jpg" alt="Swakop"> <h4 class="lux-acc-title">Swakopmund Luxury Suites</h4></a>
                    <a href="#" target="_blank" class="lux-acc-card"><img src="https://wetu.com/imageHandler/c1920x1080/101058/1.jpeg?fmt=jpg"><h4 class="lux-acc-title">Spitzkoppen Lodge</h4></a>
                    <a href="#" target="_blank" class="lux-acc-card"><img src="https://wetu.com/imageHandler/c1920x1080/10560/etosha_game_drive1.jpg?fmt=jpg"><h4 class="lux-acc-title">Etosha Safari Camp</h4></a>
                    <a href="#" target="_blank" class="lux-acc-card"><img src="https://wetu.com/imageHandler/c1920x1080/8717/onguma_bush_camp_1098.jpg?fmt=jpg"><h4 class="lux-acc-title">Onguma Bush Camp</h4></a>
                    <a href="#" target="_blank" class="lux-acc-card"><img src="https://wetu.com/imageHandler/c1920x1080/68333/home_0003_header.jpg?fmt=jpg"><h4 class="lux-acc-title">Shametu River Lodge</h4></a>
                    <a href="#" target="_blank" class="lux-acc-card"><img src="https://wetu.com/imageHandler/c1920x1080/15350/namushasha7.jpg?fmt=jpg"><h4 class="lux-acc-title">Namushasha</h4></a>
                    <a href="#" target="_blank" class="lux-acc-card"><img src="https://wetu.com/imageHandler/c1920x1080/19538/1762871606060riverside-breakfast-1.jpg?fmt=jpg"><h4 class="lux-acc-title">Chobe Safari Lodge</h4></a>
                    <a href="#" target="_blank" class="lux-acc-card"><img src="https://wetu.com/imageHandler/c1920x1080/194740/1756463034280pioneers03low.jpg?fmt=jpg"><h4 class="lux-acc-title">Pioneers Vic Falls</h4></a>
                </div>
            </div>
            """

if grid_start != -1 and grid_end != -1:
    content = content[:grid_start] + new_grid + content[grid_end:]

content = content.replace('id="lux-bg-base" style="background-image: url(\'https://desert-tracks.com/wp-content/uploads/2026/03/solly_5112_4-2.jpg\');"', 'id="lux-bg-base" style="background-image: url(\'https://wetu.com/imageHandler/c1920x1080/55342/143a4578.jpg?fmt=jpg\');"')

with open("17-day-discovery.html", "w", encoding="utf-8") as f:
    f.write(content)
print("Done writing new 17-day itinerary!")
