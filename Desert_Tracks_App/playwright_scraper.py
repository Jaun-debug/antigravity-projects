import json
import time
import os
import re
from playwright.sync_api import sync_playwright
import traceback

urls = [
    "https://wetu.com/ItineraryOutputs/Discovery/be45bb41-0874-47ca-8af5-a65d511991f7?m=d",
    "https://wetu.com/ItineraryOutputs/Discovery/a1618c27-2633-4718-afee-6d55916d413e?m=d",
    "https://wetu.com/ItineraryOutputs/Discovery/fed30fb1-7ce5-4fc8-b519-b5f2d903af33?m=d",
    "https://wetu.com/ItineraryOutputs/Discovery/68cc8584-da8b-4229-8369-2f2c40efb082?m=d"
]

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36")
        page = context.new_page()

        for idx, url in enumerate(urls):
            print(f"--- Scraping URL {idx+1}/{len(urls)} ---")
            itinerary_data = None
            
            def handle_response(response):
                nonlocal itinerary_data
                if response.url.find("GetItinerary") != -1 or response.url.find("ItineraryApi") != -1 or response.url.find("ClientOutputs") != -1 or "api" in response.url.lower() or ".json" in response.url:
                    try:
                        text = response.text()
                        if "ItineraryDays" in text or "ItineraryName" in text:
                            itinerary_data = response.json()
                    except:
                        pass
            
            page.on("response", handle_response)
            
            try:
                page.goto(url, wait_until="networkidle")
                time.sleep(3) # Ensure js runs and API calls complete
                page.evaluate("window.scrollBy(0, document.body.scrollHeight)")
                time.sleep(2)
                
                # Check globals just in case
                global_data = page.evaluate('() => window.model || window.itineraryData || null')
                if global_data and "ItineraryDays" in str(global_data):
                    itinerary_data = global_data
                
                # Fallback to HTML search
                if not itinerary_data:
                    html = page.content()
                    model_match = re.search(r'var model\s*=\s*(\{.*?\});', html, re.DOTALL)
                    if model_match:
                        itinerary_data = json.loads(model_match.group(1))

                if itinerary_data:
                    days = itinerary_data.get("ItineraryDays", [])
                    print(f"Success! Name: {itinerary_data.get('ItineraryName')}, Days: {len(days)}")
                    with open(f"raw_itinerary_{idx+1}.json", "w") as f:
                        json.dump(itinerary_data, f)
                else:
                    print(f"Failed to find JSON for {url}")
                
            except Exception as e:
                print(f"Error on {url}:")
                traceback.print_exc()

            time.sleep(2) # human browsing delay
            page.remove_listener("response", handle_response)

        browser.close()

if __name__ == "__main__":
    run()
