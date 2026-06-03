import json
import time
from playwright.sync_api import sync_playwright
import traceback

def run():
    url = "https://wetu.com/ItineraryOutputs/Discovery/a1618c27-2633-4718-afee-6d55916d413e?m=d"
    with sync_playwright() as p:
        browser = p.firefox.launch(headless=True)
        context = browser.new_context(user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/115.0")
        page = context.new_page()

        itinerary_data = None
        
        def handle_response(response):
            nonlocal itinerary_data
            if response.url.find("GetItinerary") != -1 or response.url.find("ItineraryApi") != -1 or response.url.find("ClientOutputs") != -1 or "api" in response.url.lower() or ".json" in response.url:
                try:
                    text = response.text()
                    if "ItineraryDays" in text or "ItineraryName" in text:
                        itinerary_data = response.json()
                        print(f"Captured from API: {response.url}")
                except:
                    pass
        
        page.on("response", handle_response)
        
        try:
            print(f"Navigating to {url}")
            page.goto(url, wait_until="networkidle")
            time.sleep(6) # Wait for page load
            page.evaluate("window.scrollBy(0, document.body.scrollHeight)")
            time.sleep(4)
            
            # Check globals
            global_data = page.evaluate('() => window.model || window.itineraryData || null')
            if global_data and "ItineraryDays" in str(global_data):
                itinerary_data = global_data
                print("Captured from global object")
            
            if itinerary_data:
                print("SUCCESSFULLY obtained itinerary_data.")
                with open("wetu_data_18_day.json", "w") as f:
                    json.dump(itinerary_data, f, indent=2)
            else:
                print("Failed to find itinerary_data")
            
        except Exception as e:
            traceback.print_exc()

        browser.close()

if __name__ == "__main__":
    run()
