import re

file_path = "/Users/jaunhusselmann/Desktop/AG Projects/Desert_Tracks_App/14-day-comfort.html"
with open(file_path, "r", encoding='utf-8') as f:
    text = f.read()

text = text.replace('margin-bottom: 2rem; line-height: 1.2;">Overview</h2>', 'margin-bottom: 2rem; line-height: 1.2;">Destinations</h2>')

with open(file_path, "w", encoding='utf-8') as f:
    f.write(text)

print("Heading updated")
