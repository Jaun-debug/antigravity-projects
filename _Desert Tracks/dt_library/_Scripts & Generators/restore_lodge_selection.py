import glob
import re

gens = glob.glob("/Users/jaunhusselmann/Desktop/AG Projects/dt_library/generator_*.py")

original_block = '''# 7. Bottom Carousel (Lodge Selection)
bottom_carousel_html = ""
for item in data.get('bottom_carousel', []):
    acc = item.get('accommodation', '')
    img = item.get('image', '')
    bottom_carousel_html += f\'\'\'                        <a href="#" target="_blank" class="lux-acc-card">
                            <img src="{img}" alt="{acc}">
                            <h4 class="lux-acc-title">{acc}</h4>
                        </a>\\n\'\'\'

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
{bottom_carousel_html}                    </div>
                </div>\\n\\n                \'\'\'

html = re.sub(r'<div id="lodge-selection" class="lux-acc-grid-container".*?(?=<!-- Verified Trust/Reviews Block -->)', new_lodge_selection, html, flags=re.DOTALL)
'''

# The master botwana, east_africa, guided ones have a slightly different indent because they are in a loop
original_block_indented = '''        # 6. Bottom Carousel (Lodge Selection)
        bottom_carousel_html = ""
        for item in data.get('bottom_carousel', []):
            acc = item.get('accommodation', '')
            img = item.get('image', '')
            bottom_carousel_html += f\'\'\'                        <a href="#" target="_blank" class="lux-acc-card">
                            <img src="{img}" alt="{acc}">
                            <h4 class="lux-acc-title">{acc}</h4>
                        </a>\\n\'\'\'

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
        {bottom_carousel_html}                    </div>
                        </div>\\n\\n                \'\'\'

        html = re.sub(r'<div id="lodge-selection" class="lux-acc-grid-container".*?(?=<!-- Verified Trust/Reviews Block -->)', lambda m: new_lodge_selection, html, flags=re.DOTALL)
'''

for gen in gens:
    with open(gen, 'r') as f:
        content = f.read()
        
    # We need to find whatever block is currently there between Day Blocks and replace car icon
    # This might start with `# 6. Bottom Carousel` or `# 7. Bottom Carousel`
    pattern = r"(# \d+\. Bottom Carousel.*?)(?=# \d+\. |with open|html = html\.replace\(car_svg)"
    
    match = re.search(pattern, content, flags=re.DOTALL)
    if not match:
        print(f"Could not find Bottom Carousel block in {gen}")
        continue
        
    old_block = match.group(1)
    
    # Are we in a loop? Check if the old block has '        # ' (8 spaces)
    if old_block.startswith('        #'):
        # Indented (Botswana, East Africa, Guided)
        # We also need to fix the day_blocks lambda replacement since it's above this
        # Just replace the block
        
        # But wait! The number in original_block_indented is 6. Does it match?
        num_match = re.search(r"# (\d+)\. Bottom Carousel", old_block)
        num = num_match.group(1) if num_match else "6"
        
        # Adjust number in original block
        replacement = original_block_indented.replace("# 6. Bottom Carousel", f"# {num}. Bottom Carousel")
        
        new_content = content.replace(old_block, replacement)
    else:
        # Not indented
        num_match = re.search(r"# (\d+)\. Bottom Carousel", old_block)
        num = num_match.group(1) if num_match else "7"
        
        replacement = original_block.replace("# 7. Bottom Carousel", f"# {num}. Bottom Carousel")
        
        new_content = content.replace(old_block, replacement)
        
    if new_content != content:
        with open(gen, 'w') as f:
            f.write(new_content)
        print(f"Restored Lodge Selection perfectly in {gen}")
    else:
        print(f"Skipped {gen}")

print("All done!")
