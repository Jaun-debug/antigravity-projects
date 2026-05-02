import urllib.request
import re

url = 'https://desert-tracks.com/botswana-safaris-and-tours/'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req).read().decode('utf-8')

# Find the cards
# The cards usually have <div class="elementor-post__thumbnail__link"> or similar
matches = re.findall(r'<a class="elementor-post__thumbnail__link" href="(.*?)".*?<img.*?src="(.*?)".*?class="elementor-post__title">\s*<a.*?>(.*?)</a>', html, flags=re.DOTALL|re.IGNORECASE)

print("FOUND:")
for m in matches:
    print(m)

# Let's try another regex if that fails
if not matches:
    matches = re.findall(r'<a.*?href="([^"]+)".*?<img.*?src="([^"]+)".*?class="[^"]*title[^"]*".*?>(.*?)<', html, flags=re.DOTALL|re.IGNORECASE)
    print("TRY 2:")
    for m in matches:
        print(m)
