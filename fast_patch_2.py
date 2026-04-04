import re

file_path = 'Desert_Tracks_App/14-day-comfort.html'
with open(file_path, 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Remove the Guarantee Block
guarantee_regex = r'<!-- The Desert Tracks Local Guarantee -->\s*<div class="lux-guarantee">.*?</div>\n'
text = re.sub(guarantee_regex, '', text, flags=re.DOTALL)

# 2. Disable Autoplay
text = text.replace('let autoplayTimer;', 'let autoplayTimer; // Disabled')
text = text.replace('autoplayTimer = setInterval', '// autoplayTimer = setInterval')
text = text.replace('setTimeout(startAutoplay, 8000);', '// setTimeout(startAutoplay, 8000);')
text = text.replace('startAutoplay();', '// startAutoplay();')

# 3. Swap the glance grid for the split destinations
glance_regex = r'<!-- Destinations at a Glance -->\s*<div class="lux-glance-wrap">.*?</div>'
new_split_html = """<!-- Destinations Split Block -->
            <div class="lux-dest-split">
                <div class="lux-dest-featured-img">
                    <img src="https://desert-tracks.com/wp-content/uploads/2024/04/Solly-Levi-Sossusvlei-1.jpg" alt="Namibia Landscapes">
                </div>
                <div class="lux-dest-list-wrap">
                    <h3>DESTINATIONS AT A GLANCE</h3>
                    <a href="#day-01" class="lux-dest-item"><img src="https://wetu.com/imageHandler/c1920x1080/39414/01__timelen_exterior.jpg?fmt=jpg" alt="Windhoek"><div class="lux-dest-item-content"><span class="lux-dest-item-meta">1 NIGHT • CITY</span><h4 class="lux-dest-item-title">Windhoek</h4><p class="lux-dest-item-desc">A vibrant blend of German colonial architecture and modern African charm.</p></div><div class="lux-dest-icon">&#8594;</div></a>
                    <a href="#day-02" class="lux-dest-item"><img src="https://wetu.com/imageHandler/c1920x1080/468/Namib%201%201.jpg?fmt=jpg" alt="Sossusvlei"><div class="lux-dest-item-content"><span class="lux-dest-item-meta">2 NIGHTS • DESERT</span><h4 class="lux-dest-item-title">Sossusvlei</h4><p class="lux-dest-item-desc">Towering red dunes and the hauntingly beautiful Deadvlei salt pan.</p></div><div class="lux-dest-icon">&#8594;</div></a>
                    <a href="#day-04" class="lux-dest-item"><img src="https://wetu.com/imageHandler/c1920x1080/471/Swakop_3.jpg?fmt=jpg" alt="Swakopmund"><div class="lux-dest-item-content"><span class="lux-dest-item-meta">2 NIGHTS • COAST</span><h4 class="lux-dest-item-title">Swakopmund</h4><p class="lux-dest-item-desc">Coastal charm, fresh Atlantic breezes, and thrilling desert adventures.</p></div><div class="lux-dest-icon">&#8594;</div></a>
                    <a href="#day-06" class="lux-dest-item"><img src="https://wetu.com/imageHandler/c1920x1080/312689/wozde81901.jpg?fmt=jpg" alt="Damaraland"><div class="lux-dest-item-content"><span class="lux-dest-item-meta">2 NIGHTS • WILDERNESS</span><h4 class="lux-dest-item-title">Damaraland</h4><p class="lux-dest-item-desc">Rugged ancient landscapes and elusive desert-adapted elephants.</p></div><div class="lux-dest-icon">&#8594;</div></a>
                    <a href="#day-08" class="lux-dest-item"><img src="https://wetu.com/imageHandler/c1920x1080/10560/etosha_game_drive1.jpg?fmt=jpg" alt="Etosha NP"><div class="lux-dest-item-content"><span class="lux-dest-item-meta">3 NIGHTS • WILDLIFE</span><h4 class="lux-dest-item-title">Etosha National Park</h4><p class="lux-dest-item-desc">World-class safari experiences surrounding a massive, shimmering salt pan.</p></div><div class="lux-dest-icon">&#8594;</div></a>
                </div>
            </div>"""
text = re.sub(glance_regex, new_split_html, text, flags=re.DOTALL)

# 4. Inject specific CSS for dest split
css = """
        .lux-dest-split { display: flex; gap: 40px; align-items: flex-start; }
        .lux-dest-featured-img { flex: 1; border-radius: 4px; overflow: hidden; position: sticky; top: 40px; }
        .lux-dest-featured-img img { width: 100%; aspect-ratio: 4/5; object-fit: cover; }
        .lux-dest-list-wrap { flex: 1; display: flex; flex-direction: column; }
        .lux-dest-list-wrap h3 { font-size: 0.75rem; letter-spacing: 0.25em; color: #888; font-weight: 600; margin-bottom: 2rem; }
        .lux-dest-item { display: flex; align-items: center; gap: 20px; padding: 25px 0; border-top: 1px solid #eaeaea; text-decoration: none; color: inherit; }
        .lux-dest-item:last-child { border-bottom: 1px solid #eaeaea; }
        .lux-dest-item:hover { opacity: 0.7; }
        .lux-dest-item img { width: 120px; height: 80px; object-fit: cover; border-radius: 4px; }
        .lux-dest-item-content { flex: 1; }
        .lux-dest-item-meta { font-size: 0.7rem; color: #d87a4d; font-weight: 600; letter-spacing: 0.2em; display: block; margin-bottom: 5px; }
        .lux-dest-item-title { font-family: 'Playfair Display', serif; font-size: 1.3rem; margin: 0 0 5px 0; }
        .lux-dest-item-desc { font-size: 0.9rem; color: #666; margin: 0; }
        .lux-dest-icon { width: 32px; height: 32px; border-radius: 50%; border: 1px solid #ccc; display: flex; align-items: center; justify-content: center; }
        @media (max-width: 900px) { .lux-dest-split { flex-direction: column; } }
"""
if '.lux-dest-split' not in text:
    text = text.replace('</style>', css + '\n</style>')

# SEO Fixes
text = text.replace('<h2 class="lux-day-tag">', '<h3 class="lux-day-tag">').replace('</h2>', '</h3>')
text = text.replace('<div class="lux-intro">', '<h2 class="lux-intro" style="font-size:1.2rem; font-weight:normal; line-height:1.8;">').replace('</p>\n        \n        \n        <div class="lux-features-container">', '</h2>\n        \n        \n        <div class="lux-features-container">')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(text)
