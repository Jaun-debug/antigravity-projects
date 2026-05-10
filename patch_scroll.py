import re
import os

files_to_patch = [
    "🔴 11_day_preview.html",
    "🔴 11_day_wildlife.html",
    "dt_library/11_day_namibia_wildlife_safari.html",
    "dt_library/component_30.html"
]

for fp in files_to_patch:
    if not os.path.exists(fp):
        continue
    
    with open(fp, "r", encoding="utf-8") as f:
        content = f.read()
        
    content = re.sub(
        r'startY = window\.scrollY \+ targetStart\.getBoundingClientRect\(\)\.top - \(window\.innerHeight \* [\d\.]+\);',
        r'startY = window.scrollY + targetStart.getBoundingClientRect().top - (window.innerHeight * 0.85);',
        content
    )
    
    content = re.sub(
        r'endY = window\.scrollY \+ targetEnd\.getBoundingClientRect\(\)\.top - \(window\.innerHeight \* [\d\.]+\);',
        r'endY = window.scrollY + targetEnd.getBoundingClientRect().top - (window.innerHeight * 0.65);',
        content
    )
    
    with open(fp, "w", encoding="utf-8") as f:
        f.write(content)

print('Updated all to 0.85 and 0.65')
