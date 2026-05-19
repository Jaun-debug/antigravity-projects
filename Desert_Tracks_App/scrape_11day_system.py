import json
import time
from playwright.sync_api import sync_playwright
import traceback

def run():
    url = "https://wetu.com/ItineraryOutputs/Discovery/fed30fb1-7ce5-4fc8-b519-b5f2d903af33?m=d"
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            channel="chrome",
            args=[
                '--disable-crashpad',
                '--disable-mach-ports',
                '--disable-gpu',
                '--no-sandbox',
            ]
        )
        context = browser.new_context(user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36")
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
            time.sleep(6)
            page.evaluate("window.scrollBy(0, document.body.scrollHeight)")
            time.sleep(3)
            
            global_data = page.evaluate('() => window.model || window.itineraryData || null')
            if global_data and "ItineraryDays" in str(global_data):
                itinerary_data = global_data
                print("Captured from global object")
            
            if itinerary_data:
                print("SUCCESSFULLY obtained itinerary_data.")
                
                # Parse to wetu_data.json schema
                days = itinerary_data.get('ItineraryDays', [])
                out = []
                for day in days:
                    loc = ''
                    if day.get('LocationPaths'): loc = day['LocationPaths'][0].get('LocationModel', {}).get('Name', '')
                    if not loc and day.get('Destinations'): loc = day['Destinations'][0].get('DestinationName', '')
                    
                    acc = day.get('Accommodation', {})
                    acc_name = acc.get('Name', '')
                    desc = day.get('Description', '')
                    
                    day_range = day.get('DayRange', '')
                    
                    images = []
                    if acc.get('Pictures'):
                        for p in acc['Pictures']: images.append(p.get('PictureUrl', ''))
                    
                    if acc.get('AccLodge') and acc['AccLodge'].get('Pictures'):
                        for p in acc['AccLodge']['Pictures']: images.append(p.get('PictureUrl', ''))
                    
                    if day.get('Gallery'):
                        for g in day['Gallery']:
                            if g.get('Picture'): images.append(g['Picture'].get('PictureUrl', ''))
                            
                    images = list(dict.fromkeys([i for i in images if i]))[:6]
                    if images and not str(images[0]).startswith('http'):
                        images = ['https://wetu.com/imageHandler/c1920x1080/' + str(i).lstrip('/') for i in images]
                    
                    out.append({
                        'day_range': day_range,
                        'location': loc,
                        'accommodation': acc_name,
                        'description': desc,
                        'images': images
                    })
                
                if out and out[-1].get('images', []):
                    out[-1]['images'] = []
                
                with open("wetu_data.json", "w") as f:
                    json.dump(out, f, indent=2)
                
        except Exception as e:
            traceback.print_exc()

        browser.close()

if __name__ == "__main__":
    run()
