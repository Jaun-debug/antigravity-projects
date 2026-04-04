import re

file_path = "Desert_Tracks_App/14-day-comfort.html"
with open(file_path, "r", encoding="utf-8") as f:
    text = f.read()

# The pricing table starts right after the includes/excludes list.
# Let's find "lux-pricing-table" or "PRICES"
prices_start = text.find('<h2 style="font-size: 2rem; font-family: \'Playfair Display\', serif; font-weight:normal; margin-bottom: 2rem; margin-top:0;">PRICES</h2>')
if prices_start == -1:
    prices_start = text.find('PRICES')
    if prices_start != -1:
        # Find the tag opening before PRICES
        prices_start = text.rfind('<', 0, prices_start)

# It's inside a flex row:
# <div style="display: flex; gap: 4rem; flex-wrap: wrap; align-items: flex-start; justify-content: space-between;">
#   <div style="flex: 1; min-width: 300px; max-width: 500px;">
#      (trust widget)
#   </div>
#   <div class="lux-pricing-table" ...>
#      ...
#   </div>
# </div>

if "lux-pricing-table" in text:
    target_start = text.find('<div class="lux-pricing-table"')
    # We need to find the matching closing div for this pricing table
    
    # Or simply: remove everything from <div class="lux-pricing-table" ... up to its end.
    target_end = text.find('</div>\n                </div>\n            </div>\n        </div>', target_start)
    if target_end != -1:
        # Find just the end of the pricing table div.
        # Pricing table contains multiple divs. Let's just use regex or extract the whole block.
        pass

# I'll use a better approach: regex to remove the parent or the pricing table div and the PRICES header.
# Let's see the exact structure.
