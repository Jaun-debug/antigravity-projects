import re

file_path = 'Desert_Tracks_App/14-day-comfort.html'
with open(file_path, 'r', encoding='utf-8') as f:
    text = f.read()

start_marker = '            <!-- Destinations Split Block -->'
end_marker = '                <!-- Inclusions Block -->'

start_idx = text.find(start_marker)
end_idx = text.find(end_marker, start_idx)

if start_idx != -1 and end_idx != -1:
    new_block = """            <!-- Destinations 3x Grid Block -->
            <div class="lux-acc-grid-container" style="margin-bottom: 4rem;">
                <h2 style="font-size: 2.5rem; font-family: 'Playfair Display', serif; font-weight:normal; margin-bottom: 2rem; line-height: 1.2;">Destinations</h2>
                <div class="lux-acc-grid">
                    <a href="#day-01" class="lux-acc-card">
                        <img src="https://desert-tracks.com/wp-content/uploads/2024/04/Solly-Levi-Sossusvlei-1.jpg" alt="Windhoek">
                        <h4 class="lux-acc-title">Windhoek</h4>
                        <p class="lux-acc-desc">A vibrant blend of German colonial architecture and modern African charm.</p>
                    </a>
                    <a href="#day-02" class="lux-acc-card">
                        <img src="https://wetu.com/imageHandler/c1920x1080/468/Namib%201%201.jpg?fmt=jpg" alt="Sossusvlei">
                        <h4 class="lux-acc-title">Sossusvlei</h4>
                        <p class="lux-acc-desc">Towering red dunes and the hauntingly beautiful Deadvlei salt pan.</p>
                    </a>
                    <a href="#day-04" class="lux-acc-card">
                        <img src="https://wetu.com/imageHandler/c1920x1080/471/Swakop_3.jpg?fmt=jpg" alt="Swakopmund">
                        <h4 class="lux-acc-title">Swakopmund</h4>
                        <p class="lux-acc-desc">Coastal charm, fresh Atlantic breezes, and thrilling desert adventures.</p>
                    </a>
                    <a href="#day-06" class="lux-acc-card">
                        <img src="https://wetu.com/imageHandler/c1920x1080/312689/wozde81901.jpg?fmt=jpg" alt="Damaraland">
                        <h4 class="lux-acc-title">Damaraland</h4>
                        <p class="lux-acc-desc">Rugged ancient landscapes and elusive desert-adapted elephants.</p>
                    </a>
                    <a href="#day-08" class="lux-acc-card">
                        <img src="https://wetu.com/imageHandler/c1920x1080/10560/etosha_game_drive1.jpg?fmt=jpg" alt="Etosha NP">
                        <h4 class="lux-acc-title">Etosha National Park</h4>
                        <p class="lux-acc-desc">World-class safari experiences surrounding a massive, shimmering salt pan.</p>
                    </a>
                </div>
            </div>
"""
    # Just need to add the CSS for lux-acc-desc which doesn't exist yet
    css_desc = """
        .lux-acc-desc {
            font-size: 0.95rem;
            color: #666;
            margin-top: 8px;
            line-height: 1.5;
        }
    """
    
    text = text.replace('</style>', css_desc + '\n    </style>')
    
    text = text[:start_idx] + new_block + text[end_idx:]
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(text)
    print("Destinations block successfully updated to 3x grid.")
else:
    print("Could not find Destinations block markers.")
