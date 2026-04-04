import re

file_path = 'Desert_Tracks_App/14-day-comfort.html'
with open(file_path, 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Extract Accommodation Block
acc_start = text.find('<!-- Accommodation Split Block -->')
if acc_start != -1:
    acc_end = text.find('<!-- Inclusions Block -->', acc_start)
    acc_block = text[acc_start:acc_end]
    # delete acc_block from current position
    text = text[:acc_start] + text[acc_end:]
else:
    acc_block = ""

# 2. Extract Inclusions Block
inc_start = text.find('<!-- Inclusions Block -->')
if inc_start != -1:
    inc_end = text.find('</div>', text.find('</ul>\n                </div>\n            </div>', inc_start)) + 6
    # It might have a trailing </div> for the features container
    inc_block = text[inc_start:inc_end]
    text = text[:inc_start] + text[inc_end:]
else:
    inc_block = ""

# Close the features container early if it was left open
# Actually, the </div> at the end of inclusions is probably the closing of features container if it was inside it.
# Let's cleanly inject the blocks at the end of the days.
day14_end = text.find('<!-- Verified Trust/Reviews Block -->')

if day14_end != -1:
    # Build Pricing and CTA
    pricing_cta_html = """
        <!-- Pricing Block -->
        <div class="lux-pricing-block" style="margin-top: 5rem; text-align: center; padding: 4rem 2rem; background: #FAF9F6; border-radius: 12px;">
            <h2 style="font-family: 'Playfair Display', serif; font-size: 2.5rem; margin: 0 0 1rem 0;">Pricing Guide</h2>
            <p style="font-size: 1.2rem; color: #666; margin-bottom: 1.5rem;">From price per person sharing</p>
            <div style="font-size: 3rem; font-weight: 300; display:flex; align-items:flex-start; justify-content:center; gap:5px;">
                <span style="font-size: 1.5rem; margin-top:10px;">N$</span>
                <span>85,500</span>*
            </div>
            <p style="font-size: 0.85rem; color: #999; margin-top: 1rem; text-transform: uppercase;">* Prices fluctuate based on high/low season and availability.</p>
        </div>

        <!-- CTA Block -->
        <div class="lux-cta-block" style="margin-top: 4rem; text-align: center; margin-bottom: 5rem;">
            <h2 style="font-family: 'Playfair Display', serif; font-size: 2rem; margin-bottom: 1.5rem;">Ready to craft your journey?</h2>
            <a href="/contact" style="display: inline-block; padding: 18px 40px; background: #d87a4d; color: #fff; text-decoration: none; font-weight: 600; letter-spacing: 0.1em; border-radius: 4px; transition: background 0.3s;">ENQUIRE NOW</a>
        </div>
"""

    
    # Let's fix H2 tags for Inclusions and Accommodations
    acc_block = acc_block.replace('<h3>ACCOMMODATION OVERVIEW</h3>', '<h2 style="font-size: 2rem; font-family: \'Playfair Display\', serif; font-weight:normal; margin-bottom: 2rem;">Accommodation</h2>')
    
    # For Includes Excludes, add an H2 title
    inc_block = '<h2 style="font-size: 2rem; font-family: \'Playfair Display\', serif; font-weight:normal; margin-bottom: 2rem;">Includes / Excludes</h2>\n' + inc_block

    new_bottom_content = "\n" + acc_block + "\n" + inc_block + "\n" + pricing_cta_html + "\n"
    
    text = text[:day14_end] + new_bottom_content + text[day14_end:]
    
    # Add H2 Day by Day Itinerary before Day 1
    day1_start = text.find('<!-- DAY 01 -->')
    day_itinerary_h2 = '\n        <h2 style="font-size: 2.5rem; font-family: \'Playfair Display\', serif; margin-top: 4rem; margin-bottom: 2rem;">Day-by-Day Itinerary</h2>\n'
    text = text[:day1_start] + day_itinerary_h2 + text[day1_start:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(text)
print("SEO reorder applied")
