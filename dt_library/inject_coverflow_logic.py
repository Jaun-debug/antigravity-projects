import glob
import re

# We will inject code into the generators that replaces the coverflow slider HTML!
# In the generator, the html variable holds the content.
# We will inject this right before: with open(output_path, 'w') as f:

carousels_data = {
    'self_drive': {
        'title': 'Explore More Self-Drive Safaris',
        'items': [
            ("https://desert-tracks.com/wp-content/uploads/2026/03/donkey-cart-solly-damaraland-large.jpeg", "https://desert-tracks.com/18-days-hidden-treasures-of-namibia-safari/", "18 Days", "Hidden Treasures Of Namibia"),
            ("https://desert-tracks.com/wp-content/uploads/2025/10/sossuvlei_221kb.jpg", "https://desert-tracks.com/11-days-south-of-namibia-safari/", "11 Days", "South of Namibia"),
            ("https://desert-tracks.com/wp-content/uploads/2025/10/29c1a07ebd3fcf987a8cbfce29564ecda4c8c2cb01656ab89e940f236d2c438275cdee4f5a503b6939a5008af8e8e5445682ea5a966bd418fb17bd_1280-2.jpg", "https://desert-tracks.com/18-days-namibia-delta-chobe-vic-falls-safari/", "18 Days", "Namibia, Delta &amp; Chobe"),
            ("https://desert-tracks.com/wp-content/uploads/2026/03/solly_5112_4.jpg", "https://desert-tracks.com/14-days-namibia-comfort-safari/", "14 Days", "Best of Namibia"),
            ("https://desert-tracks.com/wp-content/uploads/2026/03/solly-lion-and-cub-large.jpeg", "https://desert-tracks.com/11-days-wildlife-of-namibia-safari/", "11 Days", "Namibia Wildlife"),
            ("https://desert-tracks.com/wp-content/uploads/2025/10/divava-1.jpg", "https://desert-tracks.com/17-days-namibia-chobe-vic-falls-safari/", "16 Days", "Namibia, Chobe &amp; Vic Falls")
        ]
    },
    'luxury': {
        'title': 'Explore More Luxury Safaris',
        'items': [
            ("https://desert-tracks.com/wp-content/uploads/2025/10/savuti-lion-in-the-road.jpeg", "https://wetu.com/ItineraryOutputs/Discovery/d957f35f-76c0-4276-899d-ba04411b5e9e?_gl=1*1abd97m*_gcl_au*ODU3NTYzNTQ2LjE3NzM3Mzg5MDM.", "14 Days", "14-Day Luxury Namibia Drive &amp; Fly Photo Safari"),
            ("https://desert-tracks.com/wp-content/uploads/2025/11/29c1a07ebd3fcf987a8cbfce29564ecda4c8c2cb01656ab89e940f236d2c438275cdee4f5a503b6939a5008af8e8e5445682ea5a966bd418fb17bd_1280-1.jpg", "https://wetu.com/ItineraryOutputs/Discovery/b02e8a98-0fe9-4d6b-9a85-8fcc81355557?_gl=1*1abd97m*_gcl_au*ODU3NTYzNTQ2LjE3NzM3Mzg5MDM.", "14 Days", "14-Day Luxury Namibia Highlights Self-Drive Safari"),
            ("https://desert-tracks.com/wp-content/uploads/2025/11/wilderness-desert-rhino-camp_3-scaled-3.jpg", "https://wetu.com/Itinerary/Landing/8d67bdc1-417a-411c-ac60-e312537c8730?_gl=1*269is8*_gcl_au*ODU3NTYzNTQ2LjE3NzM3Mzg5MDM.", "12 Days", "12-Day Namibia Self-Drive Luxury Safari Circuit"),
            ("https://desert-tracks.com/wp-content/uploads/2025/11/divava-1.jpg", "https://wetu.com/ItineraryOutputs/Discovery/f959961b-5ea6-43dc-b713-5a2fb0928eb1?_gl=1*269is8*_gcl_au*ODU3NTYzNTQ2LjE3NzM3Mzg5MDM.", "10 Days", "10-Day Namibia Honeymoon Luxury Fly-In Safari"),
            ("https://desert-tracks.com/wp-content/uploads/2025/11/bc95b679-56fc-4800-b602-5d040fe0cced-png-1.webp", "https://wetu.com/ItineraryOutputs/Discovery/487e81b5-4faf-4bdc-88f7-d28a3b229cdf?_gl=1*269is8*_gcl_au*ODU3NTYzNTQ2LjE3NzM3Mzg5MDM.", "10 Days", "10-Day Ultra-Luxury Namibia Safari - North Focus"),
            ("https://desert-tracks.com/wp-content/uploads/2025/11/bagatelle-lodge-kalahari-game-ranch-namibia-chalte-on-dune2-1.jpg", "https://wetu.com/ItineraryOutputs/Discovery/e3ab6f95-cd77-4d07-943b-45d8257dda6c", "10 Days", "10-Day Ultra-Luxury Namibia Safari - South Focus")
        ]
    },
    'fly_in': {
        'title': 'Explore More Fly-In Safaris',
        'items': [
            ("https://desert-tracks.com/wp-content/uploads/2024/08/Shipwreck-Lodge.jpg", "https://wetu.com/ItineraryOutputs/Discovery/de75c783-8643-4e46-b0d6-114fbcd3f137", "7 Days", "7-Day Namibia Desert, Dune &amp; Wildlife Fly-In Safari"),
            ("https://desert-tracks.com/wp-content/uploads/2025/04/Onguma-Camp-Kala-_1-scaled.jpg", "https://wetu.com/ItineraryOutputs/Discovery/4db02e36-a80a-4486-987a-251d707016c0", "12 Days", "12-Day Namibia in Style – Luxury Fly-In Safari"),
            ("https://desert-tracks.com/wp-content/uploads/2025/09/01hoanibvalley-tentexterior.jpg", "https://wetu.com/ItineraryOutputs/Discovery/cf8f5ef9-4740-4976-90d5-e644b2e25b4b", "10 Days", "10-Day Highlights of Namibia – Luxury Fly-In & Road Safari"),
            ("https://desert-tracks.com/wp-content/uploads/2025/04/Wilderness-Little-Kulala_3-scaled.jpg", "https://wetu.com/ItineraryOutputs/Discovery/F959961B-5EA6-43DC-B713-5A2FB0928EB1", "10 Days", "10-Day Namibia Honeymoon Luxury Fly-In Safari"),
            ("https://desert-tracks.com/wp-content/uploads/2025/09/wildernessserracafema_6.jpg", "https://wetu.com/ItineraryOutputs/Discovery/d957f35f-76c0-4276-899d-ba04411b5e9e", "14 Days", "14-Day Luxury Namibia Drive &amp; Fly Photographic Safari"),
            ("https://desert-tracks.com/wp-content/uploads/2025/09/kipwe1.jpg", "https://wetu.com/ItineraryOutputs/Discovery/2084D921-60AB-4B0F-8832-E857FD4D0E35", "8 Days", "8-Day Namibia in Style – Luxury Fly-In Safari")
        ]
    }
}

gens = glob.glob("/Users/jaunhusselmann/Desktop/AG Projects/dt_library/generator_*.py")

def get_static_inject(cat):
    config = carousels_data[cat]
    slides = ""
    for img, url, days, title in config['items']:
        slides += f'''                            <a href="{url}" target="_blank" class="swiper-slide dt-coverflow-slide">\\n                                <img src="{img}" alt="{title}" loading="lazy">\\n                                <div class="dt-slide-gradient"></div>\\n                                <div class="dt-slide-content">\\n                                    <span class="dt-slide-days">{days}</span>\\n                                    <h3 class="dt-slide-title">{title}</h3>\\n                                </div>\\n                            </a>\\n'''
    
    inject = f'''
# --- DYNAMIC COVERFLOW REPLACEMENT ---
html = html.replace('More Extraordinary Journeys', '{config["title"]}')
html = re.sub(r'<div class="swiper-wrapper">.*?</div>\s+</div>\s+<!-- Custom Controls', f'<div class="swiper-wrapper">\\n{slides}                        </div>\\n                    </div>\\n                    <!-- Custom Controls', html, flags=re.DOTALL)
'''
    return inject

def get_dynamic_inject(title):
    inject = f'''
        # --- DYNAMIC COVERFLOW REPLACEMENT ---
        html = html.replace('More Extraordinary Journeys', '{title}')
        
        # Build slides from jobs
        slides_html = ""
        for other_job in jobs:
            if other_job['output_path'] != job['output_path']:
                img = other_job['bg']
                try:
                    import json
                    with open(other_job['json_path'], 'r') as f_other:
                        other_data = json.load(f_other)
                        if other_data.get('top_carousel'):
                            img = other_data['top_carousel'][0].get('image', img)
                except:
                    pass
                url = other_job['output_path'].split('/')[-1]
                t = other_job['title']
                import re
                d_match = re.search(r'(\\d+)-Day', t)
                days = f"{{d_match.group(1)}} Days" if d_match else "Safari"
                
                slides_html += f\'\'\'                            <a href="{{url}}" target="_self" class="swiper-slide dt-coverflow-slide">
                                <img src="{{img}}" alt="{{t}}" loading="lazy">
                                <div class="dt-slide-gradient"></div>
                                <div class="dt-slide-content">
                                    <span class="dt-slide-days">{{days}}</span>
                                    <h3 class="dt-slide-title">{{t}}</h3>
                                </div>
                            </a>\\n\'\'\'

        import re
        html = re.sub(r'<div class="swiper-wrapper">.*?</div>\s+</div>\s+<!-- Custom Controls', f'<div class="swiper-wrapper">\\n{{slides_html}}                        </div>\\n                    </div>\\n                    <!-- Custom Controls', html, flags=re.DOTALL)
'''
    return inject

for gen in gens:
    with open(gen, 'r') as f:
        content = f.read()

    # Skip if already injected
    if "DYNAMIC COVERFLOW REPLACEMENT" in content:
        print(f"Skipping {gen} (already injected)")
        continue

    inject_code = ""
    if "botswana" in gen:
        inject_code = get_dynamic_inject('Explore More Botswana Safaris')
    elif "east_africa" in gen:
        inject_code = get_dynamic_inject('Explore More East Africa Safaris')
    elif "guided" in gen:
        inject_code = get_dynamic_inject('Explore More Guided Safaris')
    elif "self_drive" in gen:
        inject_code = get_static_inject('self_drive')
    elif "fly_in" in gen:
        inject_code = get_static_inject('fly_in')
    elif "luxury" in gen or "focus" in gen:
        inject_code = get_static_inject('luxury')

    if inject_code:
        # Find where to inject: right before "with open(output_path, 'w') as f:"
        # In single scripts: `with open(output_path, 'w') as f:`
        # In loop scripts: `        with open(output_path, 'w') as f:`
        
        pattern = r"(\s+with open\(output_path, 'w'\) as f:)"
        match = re.search(pattern, content)
        if match:
            indent = match.group(1).split('with')[0] # get exact whitespace
            # format inject_code to match indent if needed. 
            # get_dynamic_inject is already indented with 8 spaces. get_static is not indented.
            # actually we can just literally insert it before the match.
            new_content = content[:match.start()] + inject_code + content[match.start():]
            
            with open(gen, 'w') as f:
                f.write(new_content)
            print(f"Injected coverflow logic into {gen}")
        else:
            print(f"Could not find injection point in {gen}")
