import json
import time
import re
import requests
from playwright.sync_api import sync_playwright

URLS = [
    "https://wetu.com/ItineraryOutputs/Discovery/fed30fb1-7ce5-4fc8-b519-b5f2d903af33?m=d"
]

def extract_id_from_url(url):
    match = re.search(r'([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})', url)
    if match:
         return match.group(1)
    return None

def parse_wetu_json(itinerary_data):
    if not itinerary_data:
        return None
    
    # Validation
    days = itinerary_data.get('ItineraryDays', [])
    if not days:
        return None
        
    title = itinerary_data.get('Name', '')
    parsed_days = []
    all_images = []
    
    for day in days:
        day_range = day.get('DayRange', '')
        
        loc_name = ""
        if day.get('LocationPaths'):
            loc_name = day['LocationPaths'][0].get('LocationModel', {}).get('Name', '')
        if not loc_name and day.get('Destinations'):
            loc_name = day['Destinations'][0].get('DestinationName', '')

        acc_name = ""
        if day.get('Accommodation'):
            acc_name = day['Accommodation'].get('Name', '')
        
        desc = day.get('Description', '')

        # Extract ALL images
        images = []
        
        if day.get('Accommodation') and day['Accommodation'].get('Pictures'):
            for pic in day['Accommodation']['Pictures']:
                images.append(pic.get('PictureUrl', ''))
                
        if day.get('AccLodge') and day['AccLodge'].get('Pictures'):
             for pic in day['AccLodge']['Pictures']:
                  if pic.get('PictureUrl'):
                       images.append(pic.get('PictureUrl'))
        
        if day.get('Gallery'):
            for item in day['Gallery']:
                pic = item.get('Picture', {})
                if pic and pic.get('PictureUrl'):
                    images.append(pic.get('PictureUrl'))
                    
        # Destination images
        if day.get('Destinations'):
             for dest in day['Destinations']:
                  if dest.get('Pictures'):
                       for pic in dest['Pictures']:
                            if pic.get('PictureUrl'):
                                 images.append(pic.get('PictureUrl'))

        # Unique images
        unique_images = []
        for img in images:
             if img and img not in unique_images:
                  unique_images.append(img)
        
        all_images.extend(unique_images)
        
        parsed_days.append({
            "day_range": day_range,
            "location": loc_name,
            "accommodation": acc_name,
            "description": desc,
            "images": unique_images
        })
        
    # Check if we have enough lodges/images (validation)
    has_lodges = any(day['accommodation'] for day in parsed_days)
    if not has_lodges:
         print("Validation failed: No lodges found.")
         return None
         
    return {
         "title": title,
         "days": parsed_days,
         "images": list(set(all_images))
    }

def process_url_api(url, id):
    print(f"Trying API for {id}...")
    api_url = f"https://wetu.com/API/Itinerary/Basic/v2/Get/{id}"
    try:
        response = requests.get(api_url, timeout=15)
        if response.status_code == 200:
             data = response.json()
             if 'ItineraryDays' in str(data):
                  return parse_wetu_json(data)
    except Exception as e:
         print(f"API request failed: {e}")
    return None

def process_url_browser(url, page):
    print(f"Trying browser fallback for {url}...")
    itinerary_data = None
    
    def handle_response(response):
        nonlocal itinerary_data
        if "GetItinerary" in response.url or "ItineraryApi" in response.url or "ClientOutputs" in response.url or "api" in response.url.lower():
            try:
                text = response.text()
                if "ItineraryDays" in text:
                    itinerary_data = response.json()
            except:
                pass
                
    page.on("response", handle_response)
    try:
         page.goto(url, wait_until="networkidle", timeout=30000)
         time.sleep(4)
         page.evaluate("window.scrollBy(0, document.body.scrollHeight)")
         time.sleep(2)
         
         if not itinerary_data:
             global_data = page.evaluate('() => window.model || window.itineraryData || null')
             if global_data and "ItineraryDays" in str(global_data):
                 itinerary_data = global_data
                 
         if itinerary_data:
              return parse_wetu_json(itinerary_data)
    except Exception as e:
         print(f"Browser processing failed: {e}")
    finally:
         page.remove_listener("response", handle_response)
         
    return None

def run():
    results = []
    
    # We will only launch playwright if needed
    playwright_instance = None
    browser = None
    context = None
    page = None

    try:
        for url in URLS:
            print(f"\nProcessing: {url}")
            wetu_id = extract_id_from_url(url)
            parsed_data = None
            
            if wetu_id:
                 parsed_data = process_url_api(url, wetu_id)
                 
            if not parsed_data:
                 print("API failed or returned incomplete data. Falling back to browser...")
                 if not playwright_instance:
                      playwright_instance = sync_playwright().start()
                      browser = playwright_instance.webkit.launch(headless=True)
                      context = browser.new_context(user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/115.0")
                      page = context.new_page()
                      
                 parsed_data = process_url_browser(url, page)
                 
            if parsed_data:
                 print(f"Success! Extracted {len(parsed_data['days'])} days for '{parsed_data['title']}'")
                 output_file = f"wetu_data_{wetu_id}.json" if wetu_id else "wetu_data_fallback.json"
                 with open(output_file, "w") as f:
                      json.dump(parsed_data, f, indent=2)
                 print(f"Saved to {output_file}")
                 results.append(parsed_data)
            else:
                 print(f"Failed to extract data for {url}")
                 
            # Delay between processing URLs
            print("Waiting before next request...")
            time.sleep(3)
            
    finally:
        if browser:
             browser.close()
        if playwright_instance:
             playwright_instance.stop()

if __name__ == "__main__":
    run()
