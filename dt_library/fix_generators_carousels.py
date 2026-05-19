import glob
import re

carousels_data = {
    'self_drive': {
        'title': 'More Self-Drive Safaris',
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
        'title': 'More Luxury Safaris',
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
        'title': 'More Fly-In Safaris',
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

for gen in gens:
    if "east_africa" in gen or "botswana" in gen or "guided" in gen:
        continue
    
    cat = None
    if "self_drive" in gen:
        cat = 'self_drive'
    elif "fly_in" in gen:
        cat = 'fly_in'
    elif "luxury" in gen or "focus" in gen or "north" in gen or "south" in gen:
        cat = 'luxury'
        
    if not cat:
        continue

    config = carousels_data[cat]
    
    items_html = ""
    for img, url, days, title in config['items']:
        items_html += f'''                        <a href="{url}" target="_blank" class="lux-acc-card">\\n                            <img src="{img}" alt="{title}">\\n                            <h4 class="lux-acc-title">{title}</h4>\\n                        </a>\\n'''

    with open(gen, 'r') as f:
        content = f.read()

    # We need to find the block starting with # X. Bottom Carousel and replace it completely
    # First, let's find the current block. It might be # 6 or # 7.
    # It might start with `# 7. Bottom Carousel` or `# 6. Bottom Carousel`
    pattern = r"(# \d+\. Bottom Carousel.*?)(?=# \d+\. |with open|html = html\.replace\(car_svg)"
    
    match = re.search(pattern, content, flags=re.DOTALL)
    if not match:
        print(f"Could not find Bottom Carousel block in {gen}")
        continue
        
    old_block = match.group(1)
    
    # We will replace the entire old block with our new proper block that does BOTH
    # We need to preserve the number (e.g. # 7.)
    num_match = re.search(r"# (\d+)\. Bottom Carousel", old_block)
    num = num_match.group(1) if num_match else "7"
    
    new_block = f'''# {num}. Bottom Carousel (Lodge Selection)
lodge_carousel_html = ""
for item in data.get('bottom_carousel', []):
    acc = item.get('accommodation', '')
    img_acc = item.get('image', '')
    lodge_carousel_html += f\'\'\'                        <a href="#" target="_blank" class="lux-acc-card">
                            <img src="{{img_acc}}" alt="{{acc}}">
                            <h4 class="lux-acc-title">{{acc}}</h4>
                        </a>\\n\'\'\'

# {int(num)+1}. More Safaris Carousel
more_safaris_html = \'\'\'
{items_html}\'\'\'

new_lodge_selection = f\'\'\'<div id="lodge-selection" class="lux-acc-grid-container"
                    style="margin-bottom: 4rem; padding-top: 2rem;">
                    <h2
                        style="color: #1F4F4B !important; font-family: 'Cinzel', serif; font-weight: 400; font-size: clamp(36px, 6vw, 46px); line-height: 1.2; letter-spacing: 0.3px; margin-bottom: 2rem; text-transform: uppercase;">
                        Lodge Selection</h2>
                    <div class="flex-scroll-hint">
                        <span>Swipe to explore</span>
                        <svg viewBox="0 0 24 24">
                            <path d="M5 12h14"></path>
                            <path d="m12 5 7 7-7 7"></path>
                        </svg>
                    </div>
                    <div class="lux-acc-grid">
{{lodge_carousel_html}}                    </div>
                </div>

                <div id="more-safaris" class="lux-acc-grid-container"
                    style="margin-bottom: 4rem; padding-top: 2rem;">
                    <h2
                        style="color: #1F4F4B !important; font-family: 'Cinzel', serif; font-weight: 400; font-size: clamp(36px, 6vw, 46px); line-height: 1.2; letter-spacing: 0.3px; margin-bottom: 2rem; text-transform: uppercase;">
                        {config['title']}</h2>
                    <div class="flex-scroll-hint">
                        <span>Swipe to explore</span>
                        <svg viewBox="0 0 24 24">
                            <path d="M5 12h14"></path>
                            <path d="m12 5 7 7-7 7"></path>
                        </svg>
                    </div>
                    <div class="lux-acc-grid">
{{more_safaris_html}}                    </div>
                </div>\\n\\n                \'\'\'

html = re.sub(r'<div id="lodge-selection" class="lux-acc-grid-container".*?(?=<!-- Verified Trust/Reviews Block -->)', new_lodge_selection, html, flags=re.DOTALL)

'''
    
    new_content = content.replace(old_block, new_block)
    
    if new_content != content:
        with open(gen, 'w') as f:
            f.write(new_content)
        print(f"Updated {gen} with BOTH Lodge Selection and {config['title']}")
    else:
        print(f"Skipped {gen} (no changes made)")

