import re, json

with open('/Users/jaunhusselmann/.gemini/antigravity/scratch/guided.html', 'r', encoding='utf-8') as f:
    text = f.read()

urls = [
    "59FB464A-B4D1-4FD0-9CD2-6586C62865B3",
    "4C89AE0C-337B-4FC9-B1D8-45E2989C9BB2",
    "66984053-E334-4AC3-8CA0-368744AA5D5B",
    "ff94535b-8db4-47c5-bf38-c9799a759365"
]

results = []
for u in urls:
    # regex to find data-href="...u..." and capture up to the next </div></div></div>
    # A simple hack: find the index of the URL, then find previous <div class="u-align-left... 
    # and next </div></div></div>.
    idx = text.find(u)
    if idx == -1: continue
    
    start = text.rfind('<div class="u-align-left u-container-align-left', 0, idx)
    end = text.find('</div></div>', idx)
    block = text[start:end]
    
    # Extract url
    url_match = re.search(r'data-href="([^"]+)"', block)
    url = url_match.group(1) if url_match else u
    
    # Extract image src
    img_match = re.search(r'data-src="([^"]+)"', block)
    img = img_match.group(1) if img_match else ""
    
    # Title is inside <p class="... u-text-2"> or similar
    # it contains "Day" usually
    ps = re.findall(r'<p[^>]*>(.*?)</p>', block, flags=re.DOTALL)
    
    # Clean tags from p
    def clean(s): return re.sub(r'<[^>]+>', '', s).strip()
    
    title = clean(ps[0]) if len(ps) > 0 else ""
    desc = clean(ps[1]) if len(ps) > 1 else ""
    
    results.append({"url": url, "image": img, "title": title, "desc": desc})

print(json.dumps(results, indent=2))
