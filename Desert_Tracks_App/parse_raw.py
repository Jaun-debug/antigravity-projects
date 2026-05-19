import json
import re

with open('wetu_data_raw.json', 'r', encoding='utf-8') as f:
    html = f.read()

# Find var model = { ... };
model_match = re.search(r'var model\s*=\s*(\{.*?\});\n', html, re.DOTALL)
if model_match:
    print("Found model json variable.")
    global_data = json.loads(model_match.group(1))
    
    parsed_days = []
    days = global_data.get('ItineraryDays', [])
    print(f"Found {len(days)} days")
    for day in days:
        day_range = day.get('DayRange', '')
        
        loc_name = ""
        if day.get('LocationPaths'):
            loc_name = day['LocationPaths'][0].get('LocationModel', {}).get('Name', '')
        if not loc_name and day.get('Destinations'):
            loc_name = day['Destinations'][0].get('DestinationName', '')

        acc_name = ""
        if day.get('Accommodation'):
            acc_name = day['Accommodation'].get('Name', '')
        
        desc = day.get('Description', '')

        images = []
        if day.get('Accommodation') and day['Accommodation'].get('Pictures'):
            for pic in day['Accommodation']['Pictures']:
                images.append(pic.get('PictureUrl', ''))
        
        if day.get('Gallery'):
            for item in day['Gallery']:
                pic = item.get('Picture', {})
                if pic and pic.get('PictureUrl'):
                    url = pic.get('PictureUrl')
                    if url and url not in images:
                        images.append(url)

        parsed_days.append({
            "day_range": day_range,
            "location": loc_name,
            "accommodation": acc_name,
            "description": desc,
            "images": [img for img in images if img]
        })
    
    with open("wetu_data.json", "w", encoding='utf-8') as f:
        json.dump(parsed_days, f, indent=2)
    print("Dumped correctly formatted data to wetu_data.json")
else:
    print("Failed to find var model")
