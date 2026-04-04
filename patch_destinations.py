import re

html_path = 'Desert_Tracks_App/14-day-comfort.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Update the CSS for the Destinations Split 
new_css = """
        /* Destinations Split Block */
        .lux-dest-split {
            display: flex;
            gap: 50px;
            margin-bottom: 5rem;
            align-items: flex-start;
        }
        @media (max-width: 900px) {
            .lux-dest-split { flex-direction: column; }
        }
        .lux-dest-featured-img {
            flex: 1;
            position: sticky;
            top: 40px;
            border-radius: 4px;
            overflow: hidden;
            height: calc(100vh - 80px);
            min-height: 500px;
            max-height: 800px;
        }
        .lux-dest-featured-img img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .lux-dest-list-wrap {
            flex: 1;
            display: flex;
            flex-direction: column;
            padding: 20px 0;
        }
        .lux-dest-list-wrap > h3 {
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.25em;
            font-weight: 600;
            color: #888888;
            margin-bottom: 1.5rem;
        }
        .lux-dest-item {
            display: flex;
            align-items: center;
            gap: 20px;
            padding: 25px 0;
            border-top: 1px solid #eaeaea;
            cursor: pointer;
            transition: opacity 0.3s;
            text-decoration: none;
        }
        .lux-dest-item:last-child {
            border-bottom: 1px solid #eaeaea;
        }
        .lux-dest-item:hover {
            opacity: 0.7;
        }
        .lux-dest-item img {
            width: 150px;
            height: 100px;
            object-fit: cover;
            border-radius: 4px;
        }
        .lux-dest-item-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 6px;
        }
        .lux-dest-item-meta {
            font-size: 0.7rem;
            text-transform: uppercase;
            letter-spacing: 0.2em;
            font-weight: 600;
            color: #d87a4d;
        }
        .lux-dest-item-title {
            font-family: 'Playfair Display', serif;
            font-size: 1.4rem;
            color: #111;
            margin: 0;
            font-weight: 400;
        }
        .lux-dest-item-desc {
            font-size: 0.95rem;
            color: #666;
            margin: 0; 
            line-height: 1.5;
        }
        .lux-dest-icon {
            flex-shrink: 0;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            border: 1px solid #ccc;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #888;
        }
        .lux-dest-icon svg { width: 14px; height: 14px; }
"""
html = html.replace('</style>', new_css + '\n</style>')

# 2. Extract the Inclusions Block
inclusions_start = html.find('<!-- Inclusions Block -->')
inclusions_end = html.find('<!-- DAY 01 -->')

if inclusions_start != -1 and inclusions_end != -1:
    inclusions_block = html[inclusions_start:inclusions_end]
    
    # 3. Create the new Split HTML
    new_split_html = """
        <div class="lux-features-container">
            <!-- Destinations Split Block -->
            <div class="lux-dest-split">
                <div class="lux-dest-featured-img">
                    <!-- Using Solly Levi drone photography style -->
                    <img src="https://desert-tracks.com/wp-content/uploads/2024/04/Solly-Levi-Sossusvlei-1.jpg" alt="Namibia Landscapes">
                </div>
                <div class="lux-dest-list-wrap">
                    <h3>DESTINATIONS AT A GLANCE</h3>
                    
                    <a href="#day-01" class="lux-dest-item">
                        <img src="https://wetu.com/imageHandler/c1920x1080/39414/01__timelen_exterior.jpg?fmt=jpg" alt="Windhoek">
                        <div class="lux-dest-item-content">
                            <span class="lux-dest-item-meta">1 NIGHT • CITY</span>
                            <h4 class="lux-dest-item-title">Windhoek</h4>
                            <p class="lux-dest-item-desc">A vibrant blend of German colonial architecture and modern African charm.</p>
                        </div>
                        <div class="lux-dest-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div>
                    </a>

                    <a href="#day-02" class="lux-dest-item">
                        <img src="https://wetu.com/imageHandler/c1920x1080/468/Namib%201%201.jpg?fmt=jpg" alt="Sossusvlei">
                        <div class="lux-dest-item-content">
                            <span class="lux-dest-item-meta">2 NIGHTS • DESERT</span>
                            <h4 class="lux-dest-item-title">Sossusvlei</h4>
                            <p class="lux-dest-item-desc">Towering red dunes and the hauntingly beautiful Deadvlei salt pan.</p>
                        </div>
                        <div class="lux-dest-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div>
                    </a>

                    <a href="#day-04" class="lux-dest-item">
                        <img src="https://wetu.com/imageHandler/c1920x1080/471/Swakop_3.jpg?fmt=jpg" alt="Swakopmund">
                        <div class="lux-dest-item-content">
                            <span class="lux-dest-item-meta">2 NIGHTS • COAST</span>
                            <h4 class="lux-dest-item-title">Swakopmund</h4>
                            <p class="lux-dest-item-desc">Coastal charm, fresh Atlantic breezes, and thrilling desert adventures.</p>
                        </div>
                        <div class="lux-dest-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div>
                    </a>

                    <a href="#day-06" class="lux-dest-item">
                        <img src="https://wetu.com/imageHandler/c1920x1080/312689/wozde81901.jpg?fmt=jpg" alt="Damaraland">
                        <div class="lux-dest-item-content">
                            <span class="lux-dest-item-meta">2 NIGHTS • WILDERNESS</span>
                            <h4 class="lux-dest-item-title">Damaraland</h4>
                            <p class="lux-dest-item-desc">Rugged ancient landscapes and elusive desert-adapted elephants.</p>
                        </div>
                        <div class="lux-dest-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div>
                    </a>

                    <a href="#day-08" class="lux-dest-item">
                        <img src="https://wetu.com/imageHandler/c1920x1080/10560/etosha_game_drive1.jpg?fmt=jpg" alt="Etosha NP">
                        <div class="lux-dest-item-content">
                            <span class="lux-dest-item-meta">3 NIGHTS • WILDLIFE</span>
                            <h4 class="lux-dest-item-title">Etosha National Park</h4>
                            <p class="lux-dest-item-desc">World-class safari experiences surrounding a massive, shimmering salt pan.</p>
                        </div>
                        <div class="lux-dest-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div>
                    </a>
                </div>
            </div>

            <!-- Inclusions Block -->
"""
    
    # Replace the old <div class="lux-features-container">... to just before Inclusions
    features_start = html.find('<div class="lux-features-container">')
    html = html[:features_start] + new_split_html + inclusions_block[len('<!-- Inclusions Block -->\n'):]

# 4. Remove the Guarantee Block completely
guarantee_str = """        <!-- The Desert Tracks Local Guarantee -->
        <div class="lux-guarantee">
            <h3>Plan with Peace of Mind</h3>
            <p>Desert Tracks was born from a simple idea: travelers deserve authentic, expertly crafted safari experiences designed by locals who know Namibia best. We are a locally based safari architect company driven by passion, expertise, and a deep love for Africa. Avoid the inflated prices of overseas operators and experience true Namibian hospitality from the moment you arrive.</p>
        </div>"""
html = html.replace(guarantee_str, "")

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)
print("Destinations layout updated and Guarantee removed.")
