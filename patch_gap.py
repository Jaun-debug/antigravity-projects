import re

file_path = "/Users/jaunhusselmann/Desktop/AG Projects/Desert_Tracks_App/14-day-comfort.html"
with open(file_path, "r", encoding='utf-8') as f:
    text = f.read()

# Replace gap: 20px; with column-gap: 40px; row-gap: 50px;
text = text.replace('gap: 20px;', 'column-gap: 40px;\n            row-gap: 50px;')

with open(file_path, "w", encoding='utf-8') as f:
    f.write(text)

print("Gap updated")
