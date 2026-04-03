import re

with open("temp.html") as f:
    text = f.read()

# find all anchor tags with wetu hrefs
matches = re.finditer(r'<a[^>]*href=\"([^"]*wetu\.com[^"]*)\"[^>]*>(.*?)</a>', text, re.DOTALL | re.IGNORECASE)

for m in matches:
    url = m.group(1)
    inner_html = m.group(2)
    # the title is inside something like <div class="dt-is-card-title">...</div>
    title_match = re.search(r'class="dt-is-card-title"[^>]*>\s*(.*?)\s*</div>', inner_html, re.IGNORECASE | re.DOTALL)
    title = title_match.group(1).strip() if title_match else "(No title found)"
    print(f"{title}: {url}")
