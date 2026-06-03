import re

file_path = '/Users/jaunhusselmann/Desktop/AG Projects/Desert_Tracks_App/14-day-comfort.html'

with open(file_path, 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Global replace of #2F4F4F (the previous dark slate) with #2F5D5A (Premium Teal)
text = re.sub(r'#2F4F4F', '#2F5D5A', text, flags=re.IGNORECASE)

# 2. Body Text -> #5A6A6A
body_classes = [
    'lux-hero-desc', 'lux-intro', 'lux-day-desc', 'dt-dest-desc',
    'lux-acc-desc', 'lux-trust-subtitle'
]
for cls in body_classes:
    pattern = r'(\.' + cls + r'\s*{[^}]*?)color:\s*#[a-zA-Z0-9]+;'
    text = re.sub(pattern, r'\1color: #5A6A6A;', text, flags=re.IGNORECASE)

# 3. Small Text / Meta Text -> #7A8A8A
# Also 'lux-trust-eyebrow' wasn't finding #888888 because my initial replace targeted something else earlier maybe, let's just make sure it replaces whatever color is there.
meta_classes = [
    'lux-eyebrow', 'lux-welcome-tag', 'lux-day-location',
    'lux-trust-eyebrow', 'dt-dest-meta', 'lux-acc-meta'
]
for cls in meta_classes:
    pattern = r'(\.' + cls + r'\s*{[^}]*?)color:\s*#[a-zA-Z0-9]+;'
    text = re.sub(pattern, r'\1color: #7A8A8A;', text, flags=re.IGNORECASE)

# 4. Global body text color fallback to #5A6A6A
text = re.sub(r'(body\s*{[^}]*?)color:\s*#2F5D5A;', r'\1color: #5A6A6A;', text, flags=re.IGNORECASE)

# 5. Fix any specific inline <p> or <h2/h3> styles
text = re.sub(r'(<h[123][^>]*?color:\s*)#[a-zA-Z0-9]+', r'\g<1>#2F5D5A', text, flags=re.IGNORECASE)
text = re.sub(r'(<p[^>]*?color:\s*)#[a-zA-Z0-9]+', r'\g<1>#5A6A6A', text, flags=re.IGNORECASE)
text = re.sub(r'(<span[^>]*?color:\s*)#[a-zA-Z0-9]+', r'\g<1>#7A8A8A', text, flags=re.IGNORECASE)

# 6. Links logic
if 'a:hover' not in text:
    text = re.sub(r'(</style>)', r'a { color: #2F5D5A; text-decoration: none; transition: color 0.3s ease; }\n        a:hover { color: #254B49; }\n\1', text)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(text)

print("Typography system applied.")
