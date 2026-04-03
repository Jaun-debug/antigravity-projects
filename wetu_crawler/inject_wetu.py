import json
import os
import re

json_path = '/tmp/wetu_scraped_data.json'
base_dir = '/Users/jaunhusselmann/.gemini/antigravity/scratch/dt_library'

with open(json_path, 'r') as f:
    data = json.load(f)

# The keys are tour_1 to tour_6
# Components are 31 to 36
component_start = 31

for i in range(1, 7):
    tour_key = f"tour_{i}"
    if tour_key not in data:
        continue
    
    comp_file = os.path.join(base_dir, f"component_{component_start + i - 1}.html")
    tour_data = data[tour_key]
    
    days_html = '<div style="padding: 100px 40px; font-family: \'DM Sans\', sans-serif;">\\n'
    
    days_list = [d for d in tour_data.get('days', []) if len(d['desc']) > 15]
    
    if not days_list:
        days_html += f'<h2 style="font-family: \'Playfair Display\', serif; font-size: 2.2rem; margin-bottom: 20px;">{tour_data.get("title", "Itinerary")}</h2>'
        days_html += f'<p class="lux-desc">No detailed days found. Please check Wetu.</p>'
    else:
        for day in days_list:
            # We don't have images extracted cleanly (React canvas blocking), so we use a fallback or none.
            # actually we don't strictly need a background if no image, we can just leave it blank or default
            bg_image = day['images'][0] if day.get('images') else 'https://desert-tracks.com/wp-content/uploads/2025/11/29c1a07ebd3fcf987a8cbfce29564ecda4c8c2cb01656ab89e940f236d2c438275cdee4f5a503b6939a5008af8e8e5445682ea5a966bd418fb17bd_1280-1.jpg'
            desc_text = day['desc'].replace('\\n', '<br>')
            
            days_html += f'''
        <div class="lux-day-block" data-day="{day['title'].replace('Day ','')}" data-bg="{bg_image}">
            <h3 class="lux-day-title">{day['title']}</h3>
            <p class="lux-desc">{desc_text}</p>
        </div>
'''
    days_html += '</div>'
    
    with open(comp_file, 'r') as cf:
        html = cf.read()
        
    # Replace the lux-right contents
    html = re.sub(r'<div class="lux-right">.*?(</div>\s*</div>\s*<script>)', f'<div class="lux-right">{days_html}\\\\1', html, flags=re.DOTALL)
    
    with open(comp_file, 'w') as cf:
        cf.write(html)
        
print("Successfully injected all Wetu days into components 31-36.")
