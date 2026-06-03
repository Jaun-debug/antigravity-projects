import json

with open("wetu_data_raw.json", "r") as f:
    itinerary_data = json.load(f)

parsed_days = []
days = itinerary_data.get('ItineraryDays', [])
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

with open("wetu_data.json", "w") as f:
    json.dump(parsed_days, f, indent=2)

print(f"Successfully processed {len(parsed_days)} days into wetu_data.json.")
