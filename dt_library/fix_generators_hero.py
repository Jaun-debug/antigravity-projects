import glob

generators = glob.glob("/Users/jaunhusselmann/Desktop/AG Projects/dt_library/generator_*.py")

for gen in generators:
    with open(gen, 'r') as f:
        content = f.read()
    
    if "HERO IMAGE REPLACEMENT" in content:
        continue

    import re

    # Find the injection point
    # We use regex to find the line starting with html = html.replace('11-Day Namibia<br>Wildlife Safari'
    pattern = r"(html\s*=\s*html\.replace\('11-Day Namibia<br>Wildlife Safari',\s*.*?\))"
    
    match = re.search(pattern, content)
    if not match:
        print(f"Skipped {gen} (injection point not found)")
        continue
        
    search_str = match.group(1)
    replace_str = search_str + """

        # HERO IMAGE REPLACEMENT
        try:
            # For the single-job scripts, data is parsed directly. For multi-job it's in the loop.
            # We assume 'data' is the loaded JSON object in context.
            hero_img = data.get('top_carousel', [{'image': 'https://wetu.com/imageHandler/c1920x1080/469/etosha_national_park-istock-925720816.jpg?fmt=jpg'}])[0].get('image', 'https://wetu.com/imageHandler/c1920x1080/469/etosha_national_park-istock-925720816.jpg?fmt=jpg')
            html = html.replace('https://wetu.com/imageHandler/c1920x1080/469/etosha_national_park-istock-925720816.jpg?fmt=jpg', hero_img)
        except Exception as e:
            print("Hero image replace failed:", e)"""
            
    # Some older scripts might use double quotes or different logic? Let's check.
    # We can just replace:
    new_content = content.replace(search_str, replace_str)
    
    if new_content != content:
        with open(gen, 'w') as f:
            f.write(new_content)
        print(f"Updated {gen}")
    else:
        print(f"Skipped {gen} (injection point not found)")
