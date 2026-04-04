import re

file_path = 'Desert_Tracks_App/14-day-comfort.html'
with open(file_path, 'r', encoding='utf-8') as f:
    text = f.read()

# Fix Autoplay
text = text.replace('autoPlayInterval = setInterval(function() {', '// autoPlayInterval = setInterval(function() {')

# Fix spacing of buttons/progress
# The user wants arrows/counter pushed down further from the picture/progress bar.
# I will make .dt-film-progress-wrap have a larger margin underneath IF it wraps,
# and also enforce more top spacing on the arrows if they wrap.
css_adds = """
        /* Extra spacing for arrows */
        .dt-film-progress-wrap { margin-bottom: 2rem !important; }
        .dt-film-footer { align-items: flex-start !important; }
"""
text = text.replace('</style>', css_adds + '\n    </style>')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(text)
print("done")
