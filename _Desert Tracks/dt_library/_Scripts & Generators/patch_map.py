import re

with open('component_24.html', 'r') as f:
    html = f.read()

# 1. Update CSS
css_to_add = """
        .lux-day-location-wrapper {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 0.75rem;
            border-bottom: 1px solid rgba(0,0,0,0.05);
            padding-bottom: 0.5rem;
        }
        @media (max-width: 768px) {
            .lux-day-location-wrapper {
                flex-direction: column;
                align-items: flex-start;
                gap: 8px;
            }
        }
        .lux-day-location {
            margin-bottom: 0 !important;
        }
        .lux-view-map-btn {
            background: none;
            border: 1px solid #d87a4d;
            color: #d87a4d;
            font-size: 0.65rem;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: 600;
            padding: 4px 10px;
            border-radius: 4px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 4px;
            transition: all 0.3s;
        }
        .lux-view-map-btn:hover {
            background: #d87a4d;
            color: #ffffff;
        }
        .lux-map-close {
            position: absolute;
            top: 10px;
            right: 10px;
            width: 32px;
            height: 32px;
            background: #ffffff;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            z-index: 50;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 10px rgba(0,0,0,0.15);
            color: #333;
            transition: transform 0.2s;
        }
        .lux-map-close:hover {
            transform: scale(1.1);
        }
"""
html = html.replace('/* Day Block Styling */', css_to_add + '\n        /* Day Block Styling */')

# 2. Add Close button to map
close_btn_html = """
        <div class="lux-interactive-map" id="mapWidget">
            <button class="lux-map-close" id="closeMapBtn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
"""
html = html.replace('<div class="lux-interactive-map">', close_btn_html)

# 3. Replace each <span class="lux-day-location">...</span> with wrapper
location_pattern = re.compile(r'(<span class="lux-day-location">.*?</span>)')
def replacer(match):
    span = match.group(1)
    btn = """<button class="lux-view-map-btn">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    View Map
                </button>"""
    return f'<div class="lux-day-location-wrapper">\n                {span}\n                {btn}\n            </div>'

html = location_pattern.sub(replacer, html)

# 4. Update JS logic
js_to_replace = """        // Auto-show map on scroll, hide when stopped for 2 seconds
        window.addEventListener('scroll', () => {
            if (mapWidget) {
                // Show map while scrolling (now triggers on mobile too)
                mapWidget.classList.add('is-visible');
                
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => {
                    // Hide map when there is no movement for 2 seconds
                    mapWidget.classList.remove('is-visible');
                }, 2000); 
            }
        });"""

js_new = """        // Map View Toggle Logic
        const closeMapBtn = document.getElementById('closeMapBtn');
        const viewMapBtns = document.querySelectorAll('.lux-view-map-btn');
        const mapContainer = document.getElementById('mapWidget');

        viewMapBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                mapContainer.classList.add('is-visible');
            });
        });

        if (closeMapBtn) {
            closeMapBtn.addEventListener('click', () => {
                mapContainer.classList.remove('is-visible');
            });
        }"""

html = html.replace(js_to_replace, js_new)

with open('component_24.html', 'w') as f:
    f.write(html)
