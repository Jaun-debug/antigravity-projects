import re
import os

file_path = "Desert_Tracks_App/14-day-comfort.html"
with open(file_path, "r", encoding="utf-8") as f:
    text = f.read()

# 1. Update the Accommodation Overview grid
GRID_START = '<div class="lux-acc-grid-container" style="margin-bottom: 4rem;">'
GRID_END = '</div>\n            </div>\n        </div>\n\n        <div style="padding: 0 4rem;" class="lux-padding-wrapper">'

start_idx = text.find(GRID_START)
end_idx = text.find('<div style="padding: 0 4rem;" class="lux-padding-wrapper">', start_idx)

if start_idx != -1 and end_idx != -1:
    new_grid = """<div class="lux-acc-grid-container" style="margin-bottom: 4rem;">
                <h2 style="font-size: 2.5rem; font-family: 'Playfair Display', serif; font-weight:normal; margin-bottom: 2rem; line-height: 1.2;">Accommodation Overview</h2>
                <div class="lux-acc-grid">
                    
                    <a href="#day-01" class="lux-acc-card">
                        <img src="https://wetu.com/imageHandler/c1920x1080/39414/01__timelen_exterior.jpg?fmt=jpg" alt="Ti Melen Boutique Guesthouse">
                        <h4 class="lux-acc-title">Ti Melen Boutique Guesthouse</h4>
                        <p class="lux-acc-desc"><span style="text-transform:uppercase; font-size:0.75rem; letter-spacing:0.1em; font-weight:600; color:#d87a4d;">WINDHOEK</span><br/>A tranquil, modern retreat blending local warmth.</p>
                    </a>

                    <a href="#day-02" class="lux-acc-card">
                        <img src="https://wetu.com/imageHandler/c1920x1080/31966/anib2016-8826.jpg?fmt=jpg" alt="Kalahari Anib Lodge">
                        <h4 class="lux-acc-title">Kalahari Anib Lodge</h4>
                        <p class="lux-acc-desc"><span style="text-transform:uppercase; font-size:0.75rem; letter-spacing:0.1em; font-weight:600; color:#d87a4d;">KALAHARI DESERT</span><br/>Eco-friendly lodge amidst the red dunes of the Kalahari.</p>
                    </a>

                    <a href="#day-03" class="lux-acc-card">
                        <img src="https://wetu.com/imageHandler/c1920x1080/468/Namib%201%201.jpg?fmt=jpg" alt="Desert Homestead Lodge">
                        <h4 class="lux-acc-title">Desert Homestead Lodge</h4>
                        <p class="lux-acc-desc"><span style="text-transform:uppercase; font-size:0.75rem; letter-spacing:0.1em; font-weight:600; color:#d87a4d;">SOSSUSVLEI</span><br/>Intimate luxury set against sweeping desert vistas.</p>
                    </a>

                    <a href="#day-05" class="lux-acc-card">
                        <img src="https://wetu.com/imageHandler/c1920x1080/471/Swakop_3.jpg?fmt=jpg" alt="Swakopmund Guesthouse">
                        <h4 class="lux-acc-title">Swakopmund Guesthouse</h4>
                        <p class="lux-acc-desc"><span style="text-transform:uppercase; font-size:0.75rem; letter-spacing:0.1em; font-weight:600; color:#d87a4d;">SWAKOPMUND</span><br/>Charming colonial-style comfort by the ocean.</p>
                    </a>

                    <a href="#day-07" class="lux-acc-card">
                        <img src="https://wetu.com/imageHandler/c1920x1080/312689/wozde81901.jpg?fmt=jpg" alt="Lodge Damaraland">
                        <h4 class="lux-acc-title">Lodge Damaraland</h4>
                        <p class="lux-acc-desc"><span style="text-transform:uppercase; font-size:0.75rem; letter-spacing:0.1em; font-weight:600; color:#d87a4d;">DAMARALAND</span><br/>Secluded luxury immersed in ancient rugged landscapes.</p>
                    </a>

                    <a href="#day-08" class="lux-acc-card">
                        <img src="https://wetu.com/imageHandler/c1920x1080/10560/dsc_7278.jpg?fmt=jpg" alt="Etosha Safari Camp">
                        <h4 class="lux-acc-title">Etosha Safari Camp</h4>
                        <p class="lux-acc-desc"><span style="text-transform:uppercase; font-size:0.75rem; letter-spacing:0.1em; font-weight:600; color:#d87a4d;">ETOSHA SOUTH</span><br/>Set near the southern entrance to Etosha National Park.</p>
                    </a>

                    <a href="#day-10" class="lux-acc-card">
                        <img src="https://wetu.com/imageHandler/c1920x1080/8717/onguma_bush_camp_1098.jpg?fmt=jpg" alt="Onguma Bush Camp">
                        <h4 class="lux-acc-title">Onguma Bush Camp</h4>
                        <p class="lux-acc-desc"><span style="text-transform:uppercase; font-size:0.75rem; letter-spacing:0.1em; font-weight:600; color:#d87a4d;">ETOSHA RESERVE</span><br/>Luxurious tented suites at Onguma private reserve.</p>
                    </a>

                    <a href="#day-12" class="lux-acc-card">
                        <img src="https://wetu.com/imageHandler/c1920x1080/29061/2s3a1677.jpg?fmt=jpg" alt="Eagle's Rest">
                        <h4 class="lux-acc-title">Eagle's Rest</h4>
                        <p class="lux-acc-desc"><span style="text-transform:uppercase; font-size:0.75rem; letter-spacing:0.1em; font-weight:600; color:#d87a4d;">OTJIWA NATURE RESERVE</span><br/>Exceptional service and private bush walks.</p>
                    </a>

                </div>
            </div>
        </div>
"""
    text = text[:start_idx] + new_grid + "\n" + text[end_idx:]


# 2. Fix Overview header
text = text.replace('<div class="lux-welcome-tag">OVERVIEW</div>', '<h2 style="font-size: 2.5rem; font-family: \'Playfair Display\', serif; font-weight:normal; margin-bottom: 2rem; line-height: 1.2;">Overview</h2>')


with open(file_path, "w", encoding="utf-8") as f:
    f.write(text)

print("Done patching.")
