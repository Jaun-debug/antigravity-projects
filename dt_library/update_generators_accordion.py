import glob
import re
import os

for filepath in glob.glob('/Users/jaunhusselmann/Desktop/AG Projects/dt_library/generator_*.py'):
    with open(filepath, 'r') as f:
        content = f.read()

    old_header = """                    <div class="lux-day-block-header">
                        <div class="lux-day-number-row">
                            <span class="lux-day-numeral">{day_num}</span>
                            <span class="lux-day-line"></span>
                            <span class="lux-day-location">{acc_name}</span>
                        </div>
                        <h3 class="lux-day-title">{item.get('day', f'Day {day_num}')}</h3>
                        <p class="lux-day-desc">{item.get('description', '')}</p>
                    </div>"""
                    
    old_header_2 = """                    <div class="lux-day-block-header">
                        <div class="lux-day-number-row">
                            <span class="lux-day-numeral">{day_num}</span>
                            <span class="lux-day-line"></span>
                            <span class="lux-day-location">{acc_name}</span>
                        </div>
                        <h3 class="lux-day-title">{raw_day_str}</h3>
                        <p class="lux-day-desc">{item.get('description', '')}</p>
                    </div>"""

    new_header = """                    <div class="lux-day-block-header">
                        <div class="lux-day-accordion-header">
                            <div class="lux-day-accordion-title">{acc_name}</div>
                            <div class="lux-day-accordion-icon">&minus;</div>
                        </div>
                        <div class="lux-day-accordion-content">
                            <div class="lux-day-number-row" style="display: flex; align-items: center; margin-bottom: 1.5rem;">
                                <span class="lux-day-numeral" style="font-family: 'Open Sans', sans-serif; font-weight: 300; font-size: clamp(3rem, 5vw, 4rem); color: #d87a4d; line-height: 1; letter-spacing: -0.02em;">{day_num}</span>
                                <div class="lux-day-line" style="flex-grow: 1; height: 1px; background-color: rgba(216, 122, 77, 0.3); margin-left: 20px;"></div>
                            </div>
                            <h2 class="lux-day-title" style="font-family: 'Cinzel', serif; font-size: clamp(24px, 4vw, 32px); font-weight: 300; color: #1F4F4B; text-transform: uppercase; margin-bottom: 1.5rem; letter-spacing: 0.05em;">{raw_day_str}</h2>
                            <p class="lux-day-desc" style="font-family: 'Open Sans', sans-serif; font-size: clamp(1rem, 1.5vw, 1.125rem); line-height: 1.7; color: #5A6A6A; font-weight: 300; margin-bottom: 3.5rem; max-width: 45rem;">{item.get('description', '')}</p>
                    </div>"""

    old_footer = """                        </div>
                    </div>
                </div>\\n\\n'''"""
                
    new_footer = """                        </div>
                    </div>
                </div> <!-- End lux-day-accordion-content -->
                </div>\\n\\n'''"""

    changed = False
    if old_header in content:
        content = content.replace(old_header, new_header.replace('{raw_day_str}', "{item.get('day', f'Day {day_num}')}"))
        content = content.replace(old_footer, new_footer)
        changed = True
        print(f"Updated {os.path.basename(filepath)}")
    elif old_header_2 in content:
        content = content.replace(old_header_2, new_header)
        content = content.replace(old_footer, new_footer)
        changed = True
        print(f"Updated {os.path.basename(filepath)} with raw_day_str")
        
    # Also we MUST add the accordion CSS and JS logic directly to the script if we do this!
    # Otherwise the generated output won't have the CSS/JS to run the accordion!
    # And we must remove DESTINATION.
    
    # 1. Remove DESTINATION from glance_html
    old_glance_dest = '<p class="lux-acc-desc"><span style="text-transform:uppercase; font-size:0.85rem; letter-spacing:0.1em; font-weight:600; color:#7A8A8A;">DESTINATION</span><br/>'
    if old_glance_dest in content:
        content = content.replace(old_glance_dest, '<p class="lux-acc-desc">')
        changed = True
    
    # Wait, my generators don't generate the glance cards from scratch, they either replace the wrapper or they use regex to replace specific ones.
    # In `generator_14_day_luxury_highlights_self_drive.py`:
    old_glance_code = '                            <p class="lux-acc-desc">Experience the luxury and tranquility of {acc}...</p>'
    new_glance_code = '                            <p class="lux-acc-desc">Explore the wonders of {acc}...</p>'
    if old_glance_code in content:
        content = content.replace(old_glance_code, new_glance_code)
        
    if changed:
        with open(filepath, 'w') as f:
            f.write(content)
