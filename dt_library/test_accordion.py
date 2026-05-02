import re

file_path = "/Users/jaunhusselmann/Desktop/AG Projects/dt_library/component_24.html"

with open(file_path, 'r') as f:
    content = f.read()

# 1. Add Accordion CSS
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
        }
        .lux-day-accordion-header:hover {
            opacity: 0.9;
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

if 'DAY BLOCK ACCORDION' not in content:
    content = content.replace('/* LEFT SIDE: Sticky Hero */', accordion_css + '\n        /* LEFT SIDE: Sticky Hero */')

# 2. Add Accordion JS
accordion_js = '''
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const headers = document.querySelectorAll('.lux-day-accordion-header');
            headers.forEach(header => {
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
        });
    </script>
</body>
'''

if 'lux-day-accordion-header' not in content[content.rfind('</body>')-1000:]:
    content = content.replace('</body>', accordion_js)


# 3. Restructure HTML inside each .lux-day-block
# We need to find <span class="lux-day-location"...>Location <span...>(Lodge)</span></span>
# Extract it, and replace it with the new accordion header structure.
# Then wrap the REST of the block in .lux-day-accordion-content.

# Find all blocks
blocks = re.findall(r'(<div class="lux-day-block".*?>)(.*?)(?=<div class="lux-day-block"|<!-- Trust & Reviews Block -->|<div class="lux-trust-block)', content, flags=re.DOTALL)

for opening_tag, inner_html in blocks:
    if 'lux-day-accordion-header' in inner_html:
        continue # Already processed
        
    # Extract the location span
    loc_match = re.search(r'<span class="lux-day-location"[^>]*>(.*?)</span>\s*</span>', inner_html, flags=re.DOTALL)
    if not loc_match:
        loc_match = re.search(r'<span class="lux-day-location"[^>]*>(.*?)</span>', inner_html, flags=re.DOTALL)
        
    if loc_match:
        loc_text = loc_match.group(1).strip()
        # Clean up any nested span tags if needed, or keep them to separate Location and Lodge
        
        # Build the new header
        # Default state is OPEN, so icon is minus (&minus;)
        header_html = f'''
            <div class="lux-day-accordion-header">
                <div class="lux-day-accordion-title">{loc_text}</div>
                <div class="lux-day-accordion-icon">&minus;</div>
            </div>
            <div class="lux-day-accordion-content">
'''
        # Replace the original span with the header_html
        new_inner = inner_html.replace(loc_match.group(0), header_html, 1)
        
        # We need to close the accordion content div at the end of the block inner_html
        new_inner = new_inner.rstrip() + '\n            </div>\n        '
        
        content = content.replace(opening_tag + inner_html, opening_tag + new_inner)

with open(file_path, 'w') as f:
    f.write(content)

print("Accordion test injected into component_24.html")
