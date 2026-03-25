import urllib.request
import re
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def fetch_html(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        html = urllib.request.urlopen(req, context=ctx, timeout=10).read().decode('utf-8')
        return html
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return ""

# We will look for images containing '/contents/brand/'
brands_html = fetch_html("https://www.african-marketing.com/brands")
brand_images = set()

# Find all <img> tags and background-image urls
for match in re.finditer(r'src=[\'"]([^\'"]*/contents/brand/[^\'"]*)[\'"]', brands_html):
    brand_images.add(match.group(1))
for match in re.finditer(r'url\([\'"]?([^\'"\)]*/contents/brand/[^\'"\)]+)[\'"]?\)', brands_html):
    brand_images.add(match.group(1))

# Let's format the brands into a JSON array for nextjs
brands_array = []
for i, img in enumerate(sorted(brand_images)):
    # Try to guess brand name from filename
    filename = img.split('/')[-1]
    name = re.sub(r'[\-_]', ' ', filename).split('.')[0].upper()
    
    # Clean up name a bit
    name = name.replace(' LOGO', '').replace(' WITH', '').replace(' BK', '').replace(' BLK', '').strip()
    
    brands_array.append({
        'id': i + 1,
        'name': name,
        'image': img if img.startswith('http') else 'https://www.african-marketing.com' + img
    })

print(f"Exporting {len(brands_array)} brands")

with open("/Users/jaunhusselmann/.gemini/antigravity/scratch/african-marketing-redesign/brands_export.json", "w") as f:
    json.dump(brands_array, f, indent=2)

