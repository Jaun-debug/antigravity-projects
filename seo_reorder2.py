import re

file_path = 'Desert_Tracks_App/14-day-comfort.html'
with open(file_path, 'r', encoding='utf-8') as f:
    text = f.read()

acc_start = text.find('<div class="lux-features-container">\n            <!-- Accommodation Split Block -->')
day1_start = text.find('        <!-- DAY 01 -->')

if acc_start != -1 and day1_start != -1:
    extracted_block = text[acc_start:day1_start]
    
    # Remove it from its current position
    text = text[:acc_start] + text[day1_start:]
    
    # Replace h3 with h2 for Accommodations
    extracted_block = extracted_block.replace('<h3>ACCOMMODATION OVERVIEW</h3>', '<h2 style="font-size: 2rem; font-family: \'Playfair Display\', serif; font-weight:normal; margin-bottom: 2rem; grid-column: 1 / -1; line-height: 1.2;">Accommodation Overview</h2>')
    
    # Prepend h2 for Inclusions
    extracted_block = extracted_block.replace('<div class="lux-inclusions-grid">', '<h2 style="font-size: 2rem; font-family: \'Playfair Display\', serif; font-weight:normal; margin-bottom: 2rem; margin-top:4rem;">Includes / Excludes</h2>\n        <div class="lux-inclusions-grid">')

    # Inject Day-by-Day H2
    day1_new_start = text.find('        <!-- DAY 01 -->')
    day_itinerary_h2 = '\n        <h2 style="font-size: 2.5rem; font-family: \'Playfair Display\', serif; margin-top: 4rem; margin-bottom: 2rem;">Day-by-Day Itinerary</h2>\n'
    text = text[:day1_new_start] + day_itinerary_h2 + text[day1_new_start:]

    # Pricing and CTA HTML
    pricing_cta_html = """
        <!-- Pricing Block -->
        <h2 style="font-size: 2.5rem; font-family: 'Playfair Display', serif; margin-top: 5rem; margin-bottom: 2rem;">Pricing</h2>
        <div class="lux-pricing-block" style="text-align: center; padding: 4rem 2rem; background: #FAF9F6; border-radius: 12px; margin-bottom: 4rem;">
            <p style="font-size: 1.2rem; color: #666; margin-bottom: 1.5rem;">From price per person sharing</p>
            <div style="font-size: 3.5rem; font-family: 'Playfair Display', serif; display:flex; align-items:flex-start; justify-content:center; gap:5px;">
                <span style="font-size: 1.5rem; margin-top:10px;">N$</span>
                <span>85,500</span>*
            </div>
            <p style="font-size: 0.85rem; color: #999; margin-top: 1rem; text-transform: uppercase;">* Prices fluctuate based on high/low season and availability.</p>
        </div>

        <!-- CTA Block -->
        <h2 style="font-size: 2.5rem; font-family: 'Playfair Display', serif; margin-top: 4rem; margin-bottom: 2rem; text-align: center;">Ready to craft your journey?</h2>
        <div class="lux-cta-block" style="text-align: center; margin-bottom: 6rem;">
            <a href="/contact" style="display: inline-block; padding: 18px 40px; background: #d87a4d; color: #fff; text-decoration: none; font-weight: 600; letter-spacing: 0.1em; border-radius: 4px; transition: background 0.3s; box-shadow: 0 4px 15px rgba(216,122,77,0.3);">ENQUIRE NOW</a>
        </div>
"""

    trust_start = text.find('        <!-- Verified Trust/Reviews Block -->')
    
    text = text[:trust_start] + extracted_block + pricing_cta_html + "\n" + text[trust_start:]

    with open(file_path, 'w', encoding='utf-8') as f:
         f.write(text)
    print("Reorder successful")
else:
    print("Could not find bounds")
