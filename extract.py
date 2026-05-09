import re

with open("🔴 11_day_preview.html", "r", encoding="utf-8") as f:
    preview = f.read()

# Extract the style block
style_match = re.search(r'<style data-no-optimize="1">.*?</style>', preview, re.DOTALL)
if style_match:
    with open("golden_style.txt", "w", encoding="utf-8") as f:
        f.write(style_match.group(0))

# Extract the engine script block
engine_match = re.search(r'<!-- LUXURY ITINERARY ACCORDION ENGINE -->.*', preview, re.DOTALL)
if engine_match:
    with open("golden_engine.txt", "w", encoding="utf-8") as f:
        f.write(engine_match.group(0))

print("Extracted golden code")
