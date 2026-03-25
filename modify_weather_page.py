import re

with open('/Users/jaunhusselmann/.gemini/antigravity/scratch/premium-main-weather-page.html', 'r') as f:
    html = f.read()

# Add the cc-arrow to each <h2> inside an <a>
html = re.sub(
    r'(<a[^>]*class="cc-month-link"[^>]*>\s*<h2>)(.*?)(</h2>)',
    r'\1\2 <span class="cc-arrow">&#x2192;</span>\3',
    html
)

css_to_add = """
    /* Arrow styling */
    .cc-arrow {
        color: #d87a4d;
        margin-left: 8px;
        transition: transform 0.3s ease;
        display: inline-block;
    }
    .cc-month-link:hover .cc-arrow {
        transform: translateX(6px);
    }
    
    /* Mobile Centering */
    @media (max-width: 768px) {
        .cc-article-body {
            text-align: center;
        }
        /* Fix the dropcap so it works with center alignment */
        .cc-article-body > p:first-of-type::first-letter {
            float: none;
            display: inline-block;
            vertical-align: top;
            padding: 8px 6px 0 0;
            line-height: 0.6;
        }
        .cc-month-link {
            display: inline-block;
            text-align: center;
        }
    }
"""

html = html.replace('/* Footer section for Final Thoughts */', css_to_add + '\n    /* Footer section for Final Thoughts */')

with open('/Users/jaunhusselmann/.gemini/antigravity/scratch/premium-main-weather-page.html', 'w') as f:
    f.write(html)
