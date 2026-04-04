import re
file_path = "Desert_Tracks_App/14-day-comfort.html"
with open(file_path, "r", encoding="utf-8") as f:
    text = f.read()

# Remove dotted lines
text = text.replace('border: 1px dashed #ccc;', '')

with open(file_path, "w", encoding="utf-8") as f:
    f.write(text)
