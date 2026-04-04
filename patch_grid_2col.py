import re

file_path = "/Users/jaunhusselmann/Desktop/AG Projects/Desert_Tracks_App/14-day-comfort.html"
with open(file_path, "r", encoding='utf-8') as f:
    text = f.read()

# I want to update the latest CSS I injected for lux-acc-grid
text = re.sub(r'grid-template-columns:\s*repeat\(3,\s*1fr\);', 'grid-template-columns: repeat(2, 1fr);', text)
text = re.sub(r'aspect-ratio:\s*1/1;', 'aspect-ratio: 16/9;', text)

with open(file_path, "w", encoding='utf-8') as f:
    f.write(text)

print("Grid updated to 2 columns with 16:9 images.")
