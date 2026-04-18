import json
import time
from playwright.sync_api import sync_playwright

url = "https://wetu.com/ItineraryOutputs/Discovery/a1618c27-2633-4718-afee-6d55916d413e?m=d"

def run():
    with sync_playwright() as p:
        try:
            browser = p.firefox.launch(headless=True)
            context = browser.new_context()
            page = context.new_page()
            page.goto(url, wait_until="networkidle")
            time.sleep(3)
            global_data = page.evaluate('() => window.model || null')
            if global_data:
                with open("temp_wetu_dump.json", "w") as f:
                    json.dump(global_data, f, indent=2)
                print("Dumped to temp_wetu_dump.json")
            else:
                print("Failed to find window.model")
            browser.close()
        except Exception as e:
            print("Firefox failed:", e)

if __name__ == "__main__":
    run()
