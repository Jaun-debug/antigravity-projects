import os

files = [
    "🔴 11_day_wildlife.html",
    "dt_library/11_day_namibia_wildlife_safari.html",
    "🔴 11_day_preview.html",
    "dt_library/component_30.html"
]

for filepath in files:
    if os.path.exists(filepath):
        with open(filepath, 'r') as f:
            content = f.read()
        
        # Replace the targetStart and targetEnd logic
        content = content.replace("txt.includes('Lodge Selection') targetStart = el;", "txt.includes('Day-By-Day Itinerary') targetStart = el;")
        content = content.replace("if (txt.includes('Lodge Selection')) targetStart = el;", "if (txt.includes('Day-By-Day Itinerary')) targetStart = el;")
        
        # And ensure targetEnd is Lodge Selection
        content = content.replace("if (txt.includes('WHAT OUR CLIENTS SAY') || txt.includes('EVERY JOURNEY LEAVES')) targetEnd = el;", "if (txt.includes('Lodge Selection')) targetEnd = el;")
        
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Fixed {filepath}")
