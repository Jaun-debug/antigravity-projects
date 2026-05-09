import re

with open("🔴 11_day_preview.html", "r", encoding="utf-8") as f:
    golden = f.read()

with open("dt_library/11_day_namibia_wildlife_safari.html", "r", encoding="utf-8") as f:
    wildlife_source = f.read()

# 1. Title and Hero
golden = golden.replace("11-Day Safari South of Namibia - Upgraded Film Structure", "11-Day Namibia Wildlife Safari")
golden = golden.replace("11-Day Safari<br>South of Namibia", "11-Day Namibia<br>Wildlife Safari")
golden = golden.replace("11-DAY SAFARI", "11-DAY WILDLIFE SAFARI")

# 2. Hero BG (if any, find it)
hero_bg_match = re.search(r"background-image:\s*url\('([^']+)'\)", wildlife_source)
if hero_bg_match:
    wildlife_hero_bg = hero_bg_match.group(1)
    golden = re.sub(r"background-image:\s*url\('https://wetu.com/imageHandler/c1920x1080/37314/namib-shutterstock-2103238025.jpg\?fmt=jpg'\)", f"background-image: url('{wildlife_hero_bg}')", golden)

# 3. Intro text
intro_match = re.search(r'<p class="lux-intro">(.*?)</p>', wildlife_source, re.DOTALL)
if intro_match:
    golden = re.sub(r'<p class="lux-intro">.*?</p>', intro_match.group(0), golden, flags=re.DOTALL)

# 4. Glance Wrap / Destinations
dest_match = re.search(r'<div class="lux-acc-grid-container".*?<div class="lux-acc-grid">(.*?)</div>\s*</div>\s*<!-- // ANIMATED ROUTE MAP SECTION // -->', wildlife_source, re.DOTALL)
if dest_match:
    dest_content = dest_match.group(1)
    golden = re.sub(r'(<div class="lux-acc-grid">)(.*?)(</div>\s*</div>\s*<!-- // ANIMATED ROUTE MAP SECTION // -->)', lambda m: f"{m.group(1)}{dest_content}{m.group(3)}", golden, flags=re.DOTALL)

# 5. Map Waypoints
waypoints_match = re.search(r'const waypoints = \[(.*?)\];', wildlife_source, re.DOTALL)
if waypoints_match:
    golden = re.sub(r'const waypoints = \[(.*?)\];', f"const waypoints = [{waypoints_match.group(1)}];", golden, flags=re.DOTALL)

# 6. Day Blocks
# Extract everything from <!-- DAY 01 --> to <section class="dt-cin-hero"
days_match = re.search(r'(<!-- DAY 01 -->.*?)<section class="dt-cin-hero"', wildlife_source, re.DOTALL)
if days_match:
    days_content = days_match.group(1)
    # Replace the day blocks in golden
    golden = re.sub(r'<!-- DAY 01 -->.*?<section class="dt-cin-hero"', f"{days_content}<section class=\"dt-cin-hero\"", golden, flags=re.DOTALL)
else:
    print("WARNING: Could not find Day Blocks in wildlife_source!")

# 7. Bottom Lodge Selection
lodge_match = re.search(r'<div id="lodge-selection".*?<div class="lux-acc-grid">(.*?)</div>\s*</div>\s*<!-- Verified Trust/Reviews Block -->', wildlife_source, re.DOTALL)
if lodge_match:
    lodge_content = lodge_match.group(1)
    golden = re.sub(r'(<div id="lodge-selection".*?<div class="lux-acc-grid">)(.*?)(</div>\s*</div>\s*<!-- Verified Trust/Reviews Block -->)', lambda m: f"{m.group(1)}{lodge_content}{m.group(3)}", golden, flags=re.DOTALL)
else:
    print("WARNING: Could not find Bottom Lodge Selection in wildlife_source!")

with open("🔴 11_day_wildlife.html", "w", encoding="utf-8") as f:
    f.write(golden)

print("Parrot script complete!")
