import re

file_path = 'Desert_Tracks_App/14-day-comfort.html'
with open(file_path, 'r', encoding='utf-8') as f:
    text = f.read()

bad_js = """        function startAutoPlay() {
            if (!autoPlayInterval) {
                // autoPlayInterval = setInterval(function() {
                    snapTo((activeIndex + 1) % total);
                }, 3500); 
            }
        }"""
fixed_js = """        function startAutoPlay() {
            // JS Autoplay disabled permanently
        }"""

text = text.replace(bad_js, fixed_js)

css_adds = """
        /* Extra spacing to separate counter line from picture */
        .dt-film-footer {
            padding-top: 2rem !important;
        }
"""
text = text.replace('</style>', css_adds + '\n    </style>')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(text)
print("done")
