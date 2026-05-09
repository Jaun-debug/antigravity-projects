with open("🔴 11_day_preview.html", "r", encoding="utf-8") as f:
    preview = f.read()
with open("🔴 11_day_wildlife.html", "r", encoding="utf-8") as f:
    wildlife = f.read()

# Replace Head Style
style_start = preview.find('<style data-no-optimize="1">')
style_end = preview.find('</style>', style_start) + len('</style>')
preview_style = preview[style_start:style_end]

w_style_start = wildlife.find('<style data-no-optimize="1">')
w_style_end = wildlife.find('</style>', w_style_start) + len('</style>')

wildlife = wildlife[:w_style_start] + preview_style + wildlife[w_style_end:]

# Replace Engine
engine_marker = '<!-- LUXURY ITINERARY ACCORDION ENGINE -->'
engine_start = preview.find(engine_marker)
preview_engine = preview[engine_start:]

w_engine_start = wildlife.find(engine_marker)
if w_engine_start != -1:
    wildlife = wildlife[:w_engine_start] + preview_engine
else:
    # If the marker doesn't exist, we find the last script tag or </body>
    body_end = wildlife.rfind('</body>')
    wildlife = wildlife[:body_end] + "\n" + preview_engine + "\n</body>\n</html>"

with open("🔴 11_day_wildlife.html", "w", encoding="utf-8") as f:
    f.write(wildlife)

print("Parrot copied Golden Code successfully!")
