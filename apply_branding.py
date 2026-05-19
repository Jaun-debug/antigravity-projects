import re

with open('dt_library/costing_engine_v3.html', 'r') as f:
    content = f.read()

# 1. Update fonts link
content = re.sub(
    r'<link href="https://fonts\.googleapis\.com/css2\?family=Jost.*?rel="stylesheet">',
    '<link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700&family=Cinzel:wght@400;500;600;700&display=swap" rel="stylesheet">',
    content
)

# 2. Update CSS variables and rules
content = content.replace('--accent: #d87a4d;', '--accent: #9B6A35;')
content = content.replace('--accent-hover: #e2a85e;', '--accent-hover: #7D552A;')
content = content.replace('--bg-subtle: #ffffff;', '--bg-subtle: #F5F5F3;')
content = content.replace("font-family: 'Jost', sans-serif;", "font-family: 'Open Sans', sans-serif;")
content = content.replace("font-family: 'Playfair Display', serif;", "font-family: 'Cinzel', serif;")

# Remove gradient background from body
content = re.sub(
    r'background-image: radial-gradient.*?transparent 40%\);',
    'background-image: none;',
    content,
    flags=re.DOTALL
)

# Replace 'dt-orange' with 'dt-gold' everywhere
content = content.replace('dt-orange', 'dt-gold')

with open('dt_library/costing_engine_v3.html', 'w') as f:
    f.write(content)
