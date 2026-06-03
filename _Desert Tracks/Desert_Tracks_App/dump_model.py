import json
import time
from playwright.sync_api import sync_playwright

url = "https://wetu.com/ItineraryOutputs/Discovery/be45bb41-0874-47ca-8af5-a65d511991f7?m=d"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page()
    page.goto(url, wait_until="networkidle")
    time.sleep(5)
    
    model = page.evaluate('() => window.model || window.itineraryData')
    
    if model:
        with open("raw_debug.json", "w") as f:
            json.dump(model, f, indent=2)
        print("Successfully saved raw_debug.json")
    else:
        print("Could not find window.model")
        
    browser.close()
