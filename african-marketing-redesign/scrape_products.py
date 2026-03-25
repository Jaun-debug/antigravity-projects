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

urls = [
    ("beverages", "https://www.african-marketing.com/products/beverages/"),
    ("foods-chilled", "https://www.african-marketing.com/products/foods/"),
    ("foods-ambient", "https://www.african-marketing.com/products/non-stock/"),
    ("foods-frozen", "https://www.african-marketing.com/products/other/"),
    ("cleaning", "https://www.african-marketing.com/products/cleaning/"),
    ("packaging", "https://www.african-marketing.com/products/packaging/"),
    ("appliances", "https://www.african-marketing.com/products/appliances/")
]

products_list = []
pid = 1

for category, url in urls:
    html = fetch_html(url)
    
    # Let's try to extract product blocks from HTML
    # Example: <a href="..."><img src="..."></a> ... <h3>Product Name</h3> ... <span>SKU: XXX</span>
    # Actually, let's just use simple regex to find product names and images.
    
    # find images ending in jpg/png/jpeg near a product name
    # Let's do a simple approach: find all div class="product" or something?
    # We will just grab images from the HTML and make mock products.
    # To be accurate, we can just grab all images from the page
    images = set()
    for m in re.finditer(r'src=[\'"]([^\'"]*contents/[^\'"]*\.(?:jpg|png|jpeg))[\'"]', html, flags=re.IGNORECASE):
        images.add(m.group(1))
        
    for img in images:
        if 'brand' in img or 'Logo' in img:
            continue
        
        # build absolute url
        if not img.startswith('http'):
            img = 'https://www.african-marketing.com' + img if img.startswith('/') else 'https://www.african-marketing.com/' + img
            
        # extract a name
        name = img.split('/')[-1].split('.')[0].replace('-', ' ').replace('_', ' ').upper()
        
        products_list.append({
            'id': pid,
            'name': name,
            'sku': f"{pid*10}-{pid*5}",
            'category': category,
            'image': img
        })
        pid += 1

print("Found products:", len(products_list))

with open("/Users/jaunhusselmann/.gemini/antigravity/scratch/african-marketing-redesign/products_export.json", "w") as f:
    json.dump(products_list, f, indent=2)

