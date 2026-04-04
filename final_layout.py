import re

file_path = 'Desert_Tracks_App/14-day-comfort.html'
with open(file_path, 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Strip the orphaned circle grid
circle_grid_regex = r'<div class="lux-glance-grid">.*?<div class="lux-glance-name">Etosha NP</div>\s*</div>\s*</div>\s*</div>'
# Let's find exactly lines 599 to 621
match = re.search(r'<div class="lux-glance-grid">.*?</div>\s*</div>', text, flags=re.DOTALL)
if match:
    # Just to be extremely safe, we manually look for the string that is orphaned.
    pass

# Safe way to delete the orphaned grid:
start = text.find('<div class="lux-glance-grid">')
if start != -1:
    end = text.find('<!-- Inclusions Block -->', start)
    if end != -1:
        # replace the whole chunk between them with empty string
        text = text[:start] + text[end:]

# 2. Modify CSS to hide the featured image and create a 2-column grid for destinations
css_fixes = """
        /* OVERRIDES FOR DESTINATIONS & ACCOM LISTS */
        .lux-dest-featured-img {
            display: none !important;
        }
        .lux-dest-split {
            display: block !important;
        }
        .lux-dest-list-wrap {
            display: grid !important;
            grid-template-columns: 1fr 1fr;
            column-gap: 40px;
            row-gap: 10px;
        }
        .lux-dest-list-wrap h3 {
            grid-column: 1 / -1; 
            margin-bottom: 1.5rem !important;
        }
        @media (max-width: 900px) {
            .lux-dest-list-wrap {
                grid-template-columns: 1fr;
            }
        }
"""
text = text.replace('</style>', css_fixes + '\n    </style>')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(text)
print("final layout updated")
