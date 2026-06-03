import sys

file_path = "/Users/jaunhusselmann/Desktop/AG Projects/Desert_Tracks_App/14-day-comfort.html"

with open(file_path, "r") as f:
    lines = f.readlines()

# Find the SECOND occurrence of the block
start_idx_1 = -1
start_idx_2 = -1

for i, line in enumerate(lines):
    if "<!-- Destinations 3x Grid Block -->" in line:
        if start_idx_1 == -1:
            start_idx_1 = i
        else:
            start_idx_2 = i
            break

if start_idx_2 != -1:
    end_idx = -1
    divs_open = 0
    in_block = False
    for i in range(start_idx_2, len(lines)):
        if '<div class="lux-acc-grid-container"' in lines[i]:
            divs_open += 1
            in_block = True
        elif '<div' in lines[i] and in_block:
            divs_open += lines[i].count('<div')
            
        if '</div' in lines[i] and in_block:
            divs_open -= lines[i].count('</div')
            if divs_open == 0:
                end_idx = i
                break
                
    if end_idx != -1:
        # Generate new block
        new_lines = []
        new_lines.append('            <!-- Accommodations Grid Block -->\n')
        new_lines.append('            <div class="lux-acc-grid-container" style="margin-bottom: 4rem;">\n')
        new_lines.append('                <h2 style="font-size: 2.5rem; font-family: \'Playfair Display\', serif; font-weight:normal; margin-bottom: 2rem; line-height: 1.2;">Premium Lodges</h2>\n')
        new_lines.append('                <div class="flex-scroll-hint">\n')
        new_lines.append('                    <span>Swipe to explore</span>\n')
        new_lines.append('                    <svg viewBox="0 0 24 24"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>\n')
        new_lines.append('                </div>\n')
        new_lines.append('                <div class="lux-acc-grid">\n')
        
        # Lodge 1
        new_lines.append('                    <a href="#day-02" class="lux-acc-card">\n')
        new_lines.append('                        <img src="https://wetu.com/imageHandler/c1920x1080/31966/anib2016-8826.jpg?fmt=jpg" alt="Kalahari Anib Lodge">\n')
        new_lines.append('                        <h4 class="lux-acc-title">Kalahari Anib Lodge</h4>\n')
        new_lines.append('                        <p class="lux-acc-desc">Eco-friendly lodge in the Kalahari with towering red dunes.</p>\n')
        new_lines.append('                    </a>\n')
        
        # Lodge 2
        new_lines.append('                    <a href="#day-03" class="lux-acc-card">\n')
        new_lines.append('                        <img src="https://wetu.com/imageHandler/c1920x1080/10515/ondili_desert_homestead_venture_media--23.jpg?fmt=jpg" alt="Desert Homestead">\n')
        new_lines.append('                        <h4 class="lux-acc-title">Desert Homestead Lodge</h4>\n')
        new_lines.append('                        <p class="lux-acc-desc">Nestled between the red dunes of Sossusvlei for stunning sunset views.</p>\n')
        new_lines.append('                    </a>\n')
        
        # Lodge 3
        new_lines.append('                    <a href="#day-05" class="lux-acc-card">\n')
        new_lines.append('                        <img src="https://wetu.com/imageHandler/c1920x1080/149035/exterior_24.jpg?fmt=jpg" alt="Swakopmund Guesthouse">\n')
        new_lines.append('                        <h4 class="lux-acc-title">Swakopmund Guesthouse</h4>\n')
        new_lines.append('                        <p class="lux-acc-desc">Coastal luxury and relaxation with easy access to Swakopmund.</p>\n')
        new_lines.append('                    </a>\n')
        
        # Lodge 4
        new_lines.append('                    <a href="#day-07" class="lux-acc-card">\n')
        new_lines.append('                        <img src="https://wetu.com/imageHandler/c1920x1080/312689/img_e18011.jpg?fmt=jpg" alt="Lodge Damaraland">\n')
        new_lines.append('                        <h4 class="lux-acc-title">Lodge Damaraland</h4>\n')
        new_lines.append('                        <p class="lux-acc-desc">Blend with ancient desert surroundings in the heart of Damaraland.</p>\n')
        new_lines.append('                    </a>\n')
        
        # Lodge 5
        new_lines.append('                    <a href="#day-10" class="lux-acc-card">\n')
        new_lines.append('                        <img src="https://wetu.com/imageHandler/c1920x1080/8717/onguma_bush_camp_1098.jpg?fmt=jpg" alt="Onguma Bush Camp">\n')
        new_lines.append('                        <h4 class="lux-acc-title">Onguma Bush Camp</h4>\n')
        new_lines.append('                        <p class="lux-acc-desc">Thrilling game drives and romantic evenings bordering Etosha.</p>\n')
        new_lines.append('                    </a>\n')
        
        new_lines.append('                </div>\n')
        new_lines.append('            </div>\n')
        
        lines = lines[:start_idx_2] + new_lines + lines[end_idx+1:]
        
        with open(file_path, "w") as f:
            f.writelines(lines)
        print("Success: Bottom block substituted with accommodations")
    else:
        print("Failed to find end of block")
else:
    print("Failed to find second block")
