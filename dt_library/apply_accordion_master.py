import glob
import re
import os

# 1. Update the Master HTML Template with the Accordion CSS and JS
template_path = "/Users/jaunhusselmann/Desktop/AG Projects/dt_library/11_day_namibia_wildlife_safari.html"

with open(template_path, 'r') as f:
    html = f.read()

accordion_css = '''
        /* ==================================================
           DAY BLOCK ACCORDION
        ================================================== */
        .lux-day-accordion-header {
            background: linear-gradient(to left, #EAE8DF, #F5F4F0);
            padding: 20px 30px;
            border-radius: 8px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: pointer;
            margin-bottom: 2rem;
            user-select: none;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
        }
        .lux-day-accordion-header:hover {
            opacity: 0.9;
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
        }
        .lux-day-accordion-title {
            font-family: 'Cinzel', serif;
            font-size: 1.2rem;
            font-weight: 500;
            color: #123631;
            letter-spacing: 2px;
            text-transform: uppercase;
        }
        .lux-day-accordion-title span {
            font-family: 'Open Sans', sans-serif;
            font-size: 0.9rem;
            color: #7A8A8A;
            letter-spacing: 1px;
            margin-left: 10px;
            text-transform: none;
        }
        .lux-day-accordion-icon {
            font-size: 1.8rem;
            font-weight: 300;
            color: #123631;
            transition: transform 0.3s ease;
            line-height: 1;
        }
        .lux-day-accordion-content {
            overflow: hidden;
            transition: max-height 0.5s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.5s ease;
            max-height: 10000px; /* Open by default */
            opacity: 1;
        }
        .lux-day-block.is-closed .lux-day-accordion-content {
            max-height: 0;
            opacity: 0;
        }
        .lux-day-block.is-closed .lux-day-accordion-icon {
            transform: rotate(45deg); /* + to - */
        }
'''

if 'DAY BLOCK ACCORDION' not in html:
    html = html.replace('/* LEFT SIDE: Sticky Hero */', accordion_css + '\n        /* LEFT SIDE: Sticky Hero */')

accordion_js = '''
    <script data-no-optimize="1">
        document.addEventListener('DOMContentLoaded', function() {
            // Function to initialize accordions
            function initAccordions() {
                const headers = document.querySelectorAll('.lux-day-accordion-header');
                headers.forEach(header => {
                    // Prevent multiple event listeners
                    if(header.dataset.accInit === 'true') return;
                    header.dataset.accInit = 'true';
                    
                    header.addEventListener('click', function() {
                        const block = this.closest('.lux-day-block');
                        const icon = this.querySelector('.lux-day-accordion-icon');
                        
                        if (block.classList.contains('is-closed')) {
                            // Open it
                            block.classList.remove('is-closed');
                            icon.innerHTML = '&minus;';
                        } else {
                            // Close it
                            block.classList.add('is-closed');
                            icon.innerHTML = '&#43;';
                        }
                        
                        // Trigger ScrollTrigger refresh if necessary
                        if (window.ScrollTrigger) {
                            setTimeout(() => ScrollTrigger.refresh(), 500);
                        }
                    });
                });
            }
            
            // Run immediately
            initAccordions();
            // Also run after a short delay to ensure dynamically injected HTML is caught
            setTimeout(initAccordions, 1500);
        });
    </script>
</body>
'''

if 'initAccordions()' not in html[html.rfind('</body>')-1500:]:
    html = html.replace('</body>', accordion_js)
    
with open(template_path, 'w') as f:
    f.write(html)
print("Injected CSS and JS into 11_day_namibia_wildlife_safari.html")


# 2. Update all Generator Scripts
for filepath in glob.glob('/Users/jaunhusselmann/Desktop/AG Projects/dt_library/generator_*.py'):
    with open(filepath, 'r') as f:
        content = f.read()

    # The exact HTML structures we need to replace in the generators
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
                            <div class="lux-day-accordion-title">{acc_name} <span style="font-family: 'Open Sans', sans-serif; color: #7A8A8A; font-size: 0.9rem; letter-spacing: 1px;">(Accommodation Details)</span></div>
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
    
    # Apply Accordion to Generator Logic
    if old_header in content:
        content = content.replace(old_header, new_header.replace('{raw_day_str}', "{item.get('day', f'Day {day_num}')}"))
        content = content.replace(old_footer, new_footer)
        changed = True
        print(f"Updated Day Block to Accordion in: {os.path.basename(filepath)}")
    elif old_header_2 in content:
        content = content.replace(old_header_2, new_header)
        content = content.replace(old_footer, new_footer)
        changed = True
        print(f"Updated Day Block to Accordion (raw_day_str) in: {os.path.basename(filepath)}")

    # Remove the word "DESTINATION" from glance descriptions to be safe
    old_glance_dest = '<p class="lux-acc-desc"><span style="text-transform:uppercase; font-size:0.85rem; letter-spacing:0.1em; font-weight:600; color:#7A8A8A;">DESTINATION</span><br/>'
    if old_glance_dest in content:
        content = content.replace(old_glance_dest, '<p class="lux-acc-desc">')
        changed = True
        print(f"Removed 'DESTINATION' string from: {os.path.basename(filepath)}")

    if changed:
        with open(filepath, 'w') as f:
            f.write(content)

print("All generators have been perfectly updated to output the beautiful beige accordions!")
