import urllib.request
import re

url = "https://wetu.com/ItineraryOutputs/Discovery/4c89ae0c-337b-4fc9-b1d8-45e2989c9bb2"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req) as response:
        html = response.read().decode('utf-8')
        print(f"Total HTML length: {len(html)}")
        
        # Look for JSON configs usually embedded by Wetu
        itinerary_data = re.search(r'var itineraryData\s*=\s*(\{.*?\});', html, re.DOTALL)
        if itinerary_data:
            print("Found itineraryData JSON!")
        
        model_data = re.search(r'var model\s*=\s*(\{.*?\});', html, re.DOTALL)
        if model_data:
            print("Found model JSON!")
            print(model_data.group(1)[:500])
except Exception as e:
    print(e)
