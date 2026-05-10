import re
import os

files_to_patch = [
    "🔴 11_day_preview.html",
    "🔴 11_day_wildlife.html",
    "dt_library/11_day_namibia_wildlife_safari.html",
    "dt_library/11_day_south_of_namibia_self_drive_safari.html"
]

for fp in files_to_patch:
    if not os.path.exists(fp):
        print(f"File not found: {fp}")
        continue
    
    with open(fp, "r", encoding="utf-8") as f:
        content = f.read()
        
    # Replace the startY logic
    content = re.sub(
        r'startY = window\.scrollY \+ targetStart\.getBoundingClientRect\(\)\.top - \(window\.innerHeight \* [\d\.]+\);',
        r'startY = window.scrollY + targetStart.getBoundingClientRect().top - (window.innerHeight * 0.5);',
        content
    )
    
    # Replace the endY logic
    content = re.sub(
        r'endY = window\.scrollY \+ targetEnd\.getBoundingClientRect\(\)\.top - \(window\.innerHeight \* [\d\.]+\);',
        r'endY = window.scrollY + targetEnd.getBoundingClientRect().top - (window.innerHeight * 0.5);',
        content
    )
    
    with open(fp, "w", encoding="utf-8") as f:
        f.write(content)
        
    print(f"Patched {fp}")

