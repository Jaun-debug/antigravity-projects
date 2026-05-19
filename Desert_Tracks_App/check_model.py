import urllib.request
import re

url = "https://wetu.com/ItineraryOutputs/Discovery/be45bb41-0874-47ca-8af5-a65d511991f7"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'})
try:
    with urllib.request.urlopen(req) as response:
        html = response.read().decode('utf-8')
        model = re.search(r'var model\s*=\s*(\{.*?\});', html, re.DOTALL)
        if model:
            print("FOUND MODEL!")
        else:
            print("NOT FOUND. HTML length:", len(html))
            print("Snippet:", html[:500])
except Exception as e:
    print("Error:", e)
