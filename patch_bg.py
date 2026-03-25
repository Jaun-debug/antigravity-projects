import re

path = '/Users/jaunhusselmann/.gemini/antigravity/scratch/dt_library/component_24.html'
with open(path, 'r') as f:
    text = f.read()

# 1. Lift the Hero text so it stops falling off the screen.
text = text.replace('bottom: 0;', 'bottom: 8vh;')

# 2. Swap LODGE properties with pure NATURE VISTA properties
replacements = [
    ('data-bg="https://wetu.com/imageHandler/c1920x1080/55342/143a4578.jpg?fmt=jpg"', 'data-bg="https://desert-tracks.com/wp-content/uploads/2024/04/Solly-Levi-Sossusvlei-1.jpg"'),
    ('data-bg="https://wetu.com/imageHandler/c1920x1080/31966/anib2016-8826.jpg?fmt=jpg"', 'data-bg="https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?q=80&w=2070"'),
    ('data-bg="https://wetu.com/imageHandler/c1920x1080/468/Namib%201%201.jpg?fmt=jpg"', 'data-bg="https://images.unsplash.com/photo-1609101183533-3dbca9551c60?q=80&w=2070"'),
    ('data-bg="https://wetu.com/imageHandler/c1920x1080/471/Swakop_3.jpg?fmt=jpg"', 'data-bg="https://images.unsplash.com/photo-1510525009512-ad7fc13eec5f?q=80&w=2070"'),
    ('data-bg="https://wetu.com/imageHandler/c1920x1080/312689/img_e18011.jpg?fmt=jpg"', 'data-bg="https://images.unsplash.com/photo-1533816766488-8160fc45fbf6?q=80&w=2070"'),
    ('data-bg="https://wetu.com/imageHandler/c1920x1080/123643/etosha_5.jpg?fmt=jpg"', 'data-bg="https://images.unsplash.com/photo-1516426462947-2cb8daae7ad6?q=80&w=2070"'),
    ('data-bg="https://wetu.com/imageHandler/c1920x1080/8717/onguma_bush_camp_1098.jpg?fmt=jpg"', 'data-bg="https://images.unsplash.com/photo-1600612668581-229d48b48f3b?q=80&w=2070"'),
    ('data-bg="https://wetu.com/imageHandler/c1920x1080/29061/2s3a1677.jpg?fmt=jpg"', 'data-bg="https://images.unsplash.com/photo-1575825091703-2415d8d052d9?q=80&w=2070"')
]

for old_bg, new_bg in replacements:
    text = text.replace(old_bg, new_bg)

# Double check in case we missed day 14 specifically:
text = re.sub(r'id="day-14" data-bg=".*?"', 'id="day-14" data-bg="https://images.unsplash.com/photo-1504280741564-f254e0c4a9a0?q=80&w=2070"', text)

with open(path, 'w') as f:
    f.write(text)
