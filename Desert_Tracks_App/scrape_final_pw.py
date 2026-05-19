import json
import time
from playwright.sync_api import sync_playwright
import traceback

def run():
    url = "https://wetu.com/ItineraryOutputs/Discovery/fed30fb1-7ce5-4fc8-b519-b5f2d903af33?m=d"
    with sync_playwright() as p:
        browser = p.firefox.launch(headless=True)
        context = browser.new_context(user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/115.0")
        page = context.new_page()

        print(f"Navigating to {url}")
        
        # Intercept response
        def handle_response(response):
            if "Basic/v2/Get/" in response.url:
                try:
                    with open("wetu_basic.json", "w") as f:
                        json.dump(response.json(), f)
                    print("Saved wetu_basic.json")
                except Exception as e:
                    print(f"Basic error: {e}")
            elif "Basic/v2/GetExtendedContent/" in response.url:
                try:
                    with open("wetu_ext.json", "w") as f:
                        json.dump(response.json(), f)
                    print("Saved wetu_ext.json")
                except Exception as e:
                    print(f"Ext error: {e}")

        page.on("response", handle_response)
        
        try:
            page.goto(url, wait_until="networkidle", timeout=30000)
            print("Page loaded")
            time.sleep(5)
            page.evaluate("window.scrollBy(0, document.body.scrollHeight)")
            time.sleep(5)
        except Exception as e:
            print("Error navigating:", e)

        browser.close()

if __name__ == "__main__":
    run()
