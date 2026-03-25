from bs4 import BeautifulSoup
import json

with open('/Users/jaunhusselmann/.gemini/antigravity/scratch/fly-in.html', 'r') as f:
    soup = BeautifulSoup(f.read(), 'html.parser')

items = soup.find_all('div', attrs={'data-href': lambda x: x and 'wetu.com' in x})
results = []
for item in items:
    url = item['data-href']
    img = item.find('img')
    img_url = img['data-src'] if img and img.has_attr('data-src') else ''
    
    # Titles and desc are mostly in <p> tags
    ps = item.find_all('p')
    title = ps[0].get_text(strip=True) if len(ps) > 0 else ''
    desc = ps[1].get_text(strip=True) if len(ps) > 1 else ''
    
    results.append({
        'url': url,
        'image': img_url,
        'title': title,
        'desc': desc
    })

print(json.dumps(results, indent=2))
