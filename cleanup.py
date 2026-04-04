import re

file_path = 'Desert_Tracks_App/14-day-comfort.html'
with open(file_path, 'r', encoding='utf-8') as f:
    text = f.read()

# Remove the orphaned lux-glance-grid block
glance_grid_regex = r'<div class="lux-glance-grid">.*?<div class="lux-glance-item">.*?</div>\s*</div>\s*</div>\s*</div>\s*</div>'
# Wait, safer way: find the exact block and replace
start_idx = text.find('<div class="lux-glance-grid">')
if start_idx != -1:
    end_idx = text.find('<!-- Destinations Split Block -->', start_idx)
    # Actually let's just use re.sub with a tight bound up to the next feature we know is there
    # It might be followed by Destinations Split Block since my script just injected it.
    
    # Let me just manually remove it by parsing till I see the end of the 5th item.
    pass

# Better logic:
text = re.sub(r'<div class="lux-glance-grid">.*?</div>\s*</div>\s*</div>\s*</div>\s*</div>\s*</div>', '', text, flags=re.DOTALL, count=1) 
# That's too risky. 
