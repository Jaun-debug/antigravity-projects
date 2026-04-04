import re

file_path = 'Desert_Tracks_App/14-day-comfort.html'
with open(file_path, 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Fix the Arrow/Counter spacing (margin-top on footer)
# Currently .dt-film-footer has padding: 80px 40px 50px 40px; from my previous edit.
text = text.replace('padding: 80px 40px 50px 40px; /* Spaced out 80px from images on desktop */',
                    'padding: 20px 40px 40px 40px;\n            margin-top: 50px; /* New desktop spacing from pictures */')


# 2. Add Accommodation Block (same layout as destinations)
accommodation_html = """
        <div class="lux-features-container">
            <!-- Accommodation Split Block -->
            <div class="lux-dest-split">
                <div class="lux-dest-featured-img">
                    <img src="https://images.wetu.com/imageHandler/c1920x1080/468/Desert%20Homestead%20Lodge_Namibia%20(8).jpg" alt="Luxury Safari Lodge">
                </div>
                <div class="lux-dest-list-wrap">
                    <h3>ACCOMMODATION OVERVIEW</h3>
                    
                    <a href="#day-01" class="lux-dest-item">
                        <img src="https://wetu.com/imageHandler/c1920x1080/39414/01__timelen_exterior.jpg?fmt=jpg" alt="Ti Melen Boutique Guesthouse">
                        <div class="lux-dest-item-content">
                            <span class="lux-dest-item-meta">WINDHOEK</span>
                            <h4 class="lux-dest-item-title">Ti Melen Boutique Guesthouse</h4>
                            <p class="lux-dest-item-desc">A tranquil, modern retreat blending local warmth.</p>
                        </div>
                        <div class="lux-dest-icon">&#8594;</div>
                    </a>

                    <a href="#day-02" class="lux-dest-item">
                        <img src="https://wetu.com/imageHandler/c1920x1080/31966/anib2016-8826.jpg?fmt=jpg" alt="Kalahari Anib Lodge">
                        <div class="lux-dest-item-content">
                            <span class="lux-dest-item-meta">KALAHARI DESERT</span>
                            <h4 class="lux-dest-item-title">Kalahari Anib Lodge</h4>
                            <p class="lux-dest-item-desc">Eco-friendly lodge amidst the red dunes of the Kalahari.</p>
                        </div>
                        <div class="lux-dest-icon">&#8594;</div>
                    </a>

                    <a href="#day-03" class="lux-dest-item">
                        <img src="https://wetu.com/imageHandler/c1920x1080/468/Namib%201%201.jpg?fmt=jpg" alt="Desert Homestead Lodge">
                        <div class="lux-dest-item-content">
                            <span class="lux-dest-item-meta">SOSSUSVLEI</span>
                            <h4 class="lux-dest-item-title">Desert Homestead Lodge</h4>
                            <p class="lux-dest-item-desc">Intimate luxury set against sweeping desert vistas.</p>
                        </div>
                        <div class="lux-dest-icon">&#8594;</div>
                    </a>

                    <a href="#day-05" class="lux-dest-item">
                        <img src="https://wetu.com/imageHandler/c1920x1080/471/Swakop_3.jpg?fmt=jpg" alt="Swakopmund Guesthouse">
                        <div class="lux-dest-item-content">
                            <span class="lux-dest-item-meta">SWAKOPMUND</span>
                            <h4 class="lux-dest-item-title">Swakopmund Guesthouse</h4>
                            <p class="lux-dest-item-desc">Charming colonial-style comfort by the ocean.</p>
                        </div>
                        <div class="lux-dest-icon">&#8594;</div>
                    </a>

                    <a href="#day-07" class="lux-dest-item">
                        <img src="https://wetu.com/imageHandler/c1920x1080/312689/wozde81901.jpg?fmt=jpg" alt="Lodge Damaraland">
                        <div class="lux-dest-item-content">
                            <span class="lux-dest-item-meta">DAMARALAND</span>
                            <h4 class="lux-dest-item-title">Lodge Damaraland</h4>
                            <p class="lux-dest-item-desc">Secluded luxury immersed in ancient rugged landscapes.</p>
                        </div>
                        <div class="lux-dest-icon">&#8594;</div>
                    </a>

                    <a href="#day-09" class="lux-dest-item">
                        <img src="https://wetu.com/imageHandler/c1920x1080/10560/etosha_game_drive1.jpg?fmt=jpg" alt="Ongava Lodge">
                        <div class="lux-dest-item-content">
                            <span class="lux-dest-item-meta">ETOSHA NP</span>
                            <h4 class="lux-dest-item-title">Ongava Lodge</h4>
                            <p class="lux-dest-item-desc">World-renowned private reserve on Etosha's border.</p>
                        </div>
                        <div class="lux-dest-icon">&#8594;</div>
                    </a>
                </div>
            </div>
        </div>
"""

# Inject before the Inclusions block, which starts with <div class="lux-inclusions-grid">
text = text.replace('<div class="lux-inclusions-grid">', accommodation_html + '\n        <div class="lux-inclusions-grid">')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(text)
print("done")
