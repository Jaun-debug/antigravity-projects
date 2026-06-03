import os
import re

file_path = '/Users/jaunhusselmann/Desktop/AG Projects/Desert_Tracks_App/14-day-comfort.html'

with open(file_path, 'r', encoding='utf-8') as f:
    text = f.read()

# Make the changes
text = re.sub(r'#355A58', '#2F4F4F', text, flags=re.IGNORECASE)
text = re.sub(r'rgba\(\s*53\s*,\s*90\s*,\s*88\s*,', 'rgba(47, 79, 79,', text)
text = text.replace('background: linear-gradient(135deg, #E6DED6 0%, #E9E1D9 100%);', 'background: #E7DED6;')
text = text.replace('>Highlights</h2>', '>Why This Journey Is Special</h2>')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(text)

print('✅ Update Success')
