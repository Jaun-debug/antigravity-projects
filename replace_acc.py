import re

file_path = 'Desert_Tracks_App/14-day-comfort.html'
with open(file_path, 'r', encoding='utf-8') as f:
    text = f.read()

start_marker = '        <div class="lux-features-container">\n            <!-- Accommodation Split Block -->'
end_marker = '                    </a>\n                </div>\n            </div>\n        </div>'

start_idx = text.find(start_marker)
end_idx = text.find(end_marker, start_idx)

if start_idx != -1 and end_idx != -1:
    end_idx += len(end_marker)
    
    new_block = """        <div class="lux-acc-grid-container" style="margin-bottom: 4rem;">
            <h2 style="font-size: 2.5rem; font-family: 'Playfair Display', serif; font-weight:normal; margin-bottom: 2rem; line-height: 1.2;">Accommodation</h2>
            <div class="lux-acc-grid">
                <a href="#day-01" class="lux-acc-card">
                    <img src="https://wetu.com/imageHandler/c1920x1080/39414/01__timelen_exterior.jpg?fmt=jpg" alt="Ti Melen Boutique Guesthouse">
                    <h4 class="lux-acc-title">Ti Melen Boutique Guesthouse</h4>
                </a>
                <a href="#day-02" class="lux-acc-card">
                    <img src="https://wetu.com/imageHandler/c1920x1080/31966/anib2016-8826.jpg?fmt=jpg" alt="Kalahari Anib Lodge">
                    <h4 class="lux-acc-title">Kalahari Anib Lodge</h4>
                </a>
                <a href="#day-03" class="lux-acc-card">
                    <img src="https://wetu.com/imageHandler/c1920x1080/468/Namib%201%201.jpg?fmt=jpg" alt="Desert Homestead Lodge">
                    <h4 class="lux-acc-title">Desert Homestead Lodge</h4>
                </a>
                <a href="#day-05" class="lux-acc-card">
                    <img src="https://wetu.com/imageHandler/c1920x1080/471/Swakop_3.jpg?fmt=jpg" alt="Swakopmund Guesthouse">
                    <h4 class="lux-acc-title">Swakopmund Guesthouse</h4>
                </a>
                <a href="#day-07" class="lux-acc-card">
                    <img src="https://wetu.com/imageHandler/c1920x1080/312689/wozde81901.jpg?fmt=jpg" alt="Lodge Damaraland">
                    <h4 class="lux-acc-title">Lodge Damaraland</h4>
                </a>
                <a href="#day-09" class="lux-acc-card">
                    <img src="https://wetu.com/imageHandler/c1920x1080/10560/etosha_game_drive1.jpg?fmt=jpg" alt="Ongava Lodge">
                    <h4 class="lux-acc-title">Ongava Lodge</h4>
                </a>
            </div>
        </div>"""
    
    text = text[:start_idx] + new_block + text[end_idx:]
    
    new_css = """
        .lux-acc-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 30px;
        }
        .lux-acc-card {
            display: block;
            text-decoration: none;
            color: inherit;
        }
        .lux-acc-card img {
            width: 100%;
            aspect-ratio: 16/9;
            object-fit: cover;
            border-radius: 10px;
            margin-bottom: 12px;
            transition: opacity 0.3s;
        }
        .lux-acc-card:hover img {
            opacity: 0.8;
        }
        .lux-acc-title {
            font-family: 'Inter', sans-serif;
            font-size: 1.1rem;
            font-weight: 500;
            margin: 0;
            color: #111;
        }
        @media (max-width: 900px) {
            .lux-acc-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
            .lux-acc-grid { grid-template-columns: 1fr; }
        }
"""
    text = text.replace('</style>', new_css + '\n    </style>')
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(text)
    print("Accommodation block successfully updated to 3x grid.")
else:
    print("Could not find Accommodation block markers. Please check the file.")
