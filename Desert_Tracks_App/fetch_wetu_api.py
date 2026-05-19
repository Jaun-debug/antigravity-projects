import json
import re
from html import unescape

def clean_html(raw_html):
    if not isinstance(raw_html, str): return ""
    cleanr = re.compile('<.*?>')
    cleantext = re.sub(cleanr, '', raw_html)
    return unescape(cleantext).strip()

def run():
    print("Parsing Ext Data...")
    with open('wetu_ext.json', 'r') as f:
        ext_data = json.load(f)
    with open('wetu_basic.json', 'r') as f:
        basic_data = json.load(f)

    basic_accs = basic_data.get('accommodations', {})
    ext_accs = ext_data.get('accommodations', {})
    basic_dests = basic_data.get('destinations', {})

    parsed_days = []
    
    leg_periods = ext_data.get('leg_periods', {})
    sorted_legs = sorted([k for k in leg_periods.keys() if k.isdigit()], key=int)
    
    for leg_num in sorted_legs:
        leg_items = leg_periods[leg_num]
        
        # Calculate day range
        start_day = leg_items[0].get('start_day')
        end_day = leg_items[-1].get('end_day')
        if end_day == start_day:
            day_range = f"Day {start_day}"
        else:
            day_range = f"Day {start_day} - {end_day}"
        
        loc_name = ""
        dest_ids = leg_items[0].get('destination_ids', [])
        if dest_ids:
            dest_id = str(dest_ids[0])
            loc_name = basic_dests.get(dest_id, {}).get('name', '')
            
        acc_id = None
        for item in leg_items:
            for cluster in item.get('element_clusters', []):
                for el in cluster:
                    if el.get('subtype') == 'Accommodation' and el.get('type') in ('CheckIn', 'Stay'):
                        acc_id = str(el.get('content_entity_id'))

        acc_name = ""
        desc = ""
        images = []
        if acc_id:
            basic_acc = basic_accs.get(acc_id, {})
            ext_acc = ext_accs.get(acc_id, {})
            
            acc_name = basic_acc.get('name', '')
            desc = clean_html(ext_acc.get('description', ''))
            
            # images in ext_acc
            imgs = ext_acc.get('images', [])
            images = [f"https://wetu.com/ImageHandler/1366x768/{img.get('url', '')}" for img in imgs]

        parsed_days.append({
            "start_day": start_day,
            "day_range": day_range,
            "location": loc_name,
            "accommodation": acc_name,
            "description": desc,
            "images": images[:6] # Grab first 6 images to match pipelone behavior
        })
        
    # Sort by start_day
    parsed_days.sort(key=lambda x: x['start_day'])
    
    # Remove the temporary 'start_day' key before writing to output
    for day in parsed_days:
        del day['start_day']
        
    with open("wetu_data.json", "w") as f:
        json.dump(parsed_days, f, indent=2)

    print(f"Successfully processed {len(parsed_days)} days into wetu_data.json.")

if __name__ == '__main__':
    run()
