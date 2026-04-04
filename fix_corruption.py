import re

file_path = "/Users/jaunhusselmann/Desktop/AG Projects/Desert_Tracks_App/14-day-comfort.html"
with open(file_path, "r", encoding='utf-8') as f:
    text = f.read()

# Fix CSS syntax error
text = text.replace(".dt-film-card:hover \n        \n        .dt-film-footer {", ".dt-film-footer {")
text = text.replace(".dt-film-card:hover \r\n        \r\n        .dt-film-footer {", ".dt-film-footer {")
# Just to be safe: regex replace empty rules
text = re.sub(r'\.dt-film-card:hover\s*\n\s*\.dt-film-footer \{', '.dt-film-footer {', text)

# Fix cutoff intro text:
broken_intro = 'journey tak            <!-- Destinations 3x Grid Block -->'
fixed_intro = 'journey takes you from the rolling red dunes of the Kalahari to the wildlife-rich plains of Etosha, stopping by the dramatic coastlines of Swakopmund. Crafted for the independent traveler, this route guarantees the perfect blend of freedom, comfort, and luxury.</p>\n        </div>\n\n        <div class="lux-features-container">\n            <!-- Destinations 3x Grid Block -->'
text = text.replace(broken_intro, fixed_intro)

# Fix cutoff remnant at end of grid block:
broken_remnant = """                </div>
            </div>
 safari experiences surrounding a massive, shimmering salt pan.</p></div><div class="lux-dest-icon">&#8594;</div></a>
                </div>
            </div>"""

fixed_remnant = """                </div>
            </div>"""
text = text.replace(broken_remnant, fixed_remnant)

with open(file_path, "w", encoding='utf-8') as f:
    f.write(text)

print("Corruption fixed")
