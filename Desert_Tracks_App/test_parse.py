import json
import sys
from playwright.sync_api import sync_playwright

url = "https://wetu.com/ItineraryOutputs/Discovery/8b54b589-04ad-4f50-8bdc-c11f24c56d65?m=c"

# Start playwright
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    
    responses = []
    def handle_response(response):
        if "DiscoveryApi/GetItinerary" in response.url or "ItineraryOutputs" in response.url or "api" in response.url.lower():
            try:
                text = response.text()
                # we just want everything so we can see
                if "destinations" in text or "accommodations" in text:
                    data = response.json()
                    responses.append(data)
            except:
                pass
                
    page.on("response", handle_response)
    page.goto(url, wait_until="networkidle", timeout=30000)
    
    with open("debug_api_dump_full.json", "w") as f:
        json.dump(responses, f)
    
    browser.close()
