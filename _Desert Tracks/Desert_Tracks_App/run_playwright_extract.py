import sys
import json
from playwright.sync_api import sync_playwright

def run_extraction(url):
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(
                headless=True,
                args=[
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--single-process',
                    '--no-zygote',
                    '--disable-gpu',
                    '--disable-crash-reporter'
                ]
            )
            context = browser.new_context(user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/115.0")
            page = context.new_page()
            
            itinerary_data = None
            
            api_responses = []
            def handle_response(response):
                try:
                    if "wetu.com" in response.url and ("api" in response.url.lower() or "client" in response.url.lower() or "data" in response.url.lower() or "get" in response.url.lower()):
                        text = response.text()
                        if text and "{" in text:
                            data = response.json()
                            api_responses.append({"url": response.url, "data": data})
                except Exception as e:
                    pass
                        
            page.on("response", handle_response)
            
            page.goto(url, wait_until="domcontentloaded", timeout=60000)
            page.evaluate("window.scrollBy(0, document.body.scrollHeight)")
            page.wait_for_timeout(8000)
            
            for num, d in enumerate(api_responses):
                with open(f"debug_api_dump_{num}.json", "w") as f:
                    json.dump(d, f)
            
            title_val = "Unknown Itinerary"
            all_images = []
            
            def extract_images_recursively(obj):
                res = []
                if isinstance(obj, dict):
                    for k, v in obj.items():
                        if k == 'images' and isinstance(v, list):
                            for item in v:
                                if isinstance(item, str):
                                    res.append(item)
                                elif isinstance(item, dict) and 'url' in item:
                                    res.append(item['url'])
                                elif isinstance(item, dict) and 'PictureUrl' in item:
                                    res.append(item['PictureUrl'])
                        elif k == 'PictureUrl' and isinstance(v, str):
                            res.append(v)
                        
                        if k.lower() in ('name', 'title') and isinstance(v, str) and title_val == "Unknown Itinerary":
                            pass # We handle title carefully below
                        else:
                            res.extend(extract_images_recursively(v))
                elif isinstance(obj, list):
                    for item in obj:
                        res.extend(extract_images_recursively(item))
                return res

            for d in api_responses:
                try:
                    if isinstance(d, dict):
                        if "data" in d and isinstance(d["data"], dict) and d["data"].get("name"):
                            title_val = d["data"]["name"]
                        elif d.get("Name"):
                            title_val = d["Name"]
                    all_images.extend(extract_images_recursively(d))
                except Exception:
                    pass
                    
            if not all_images:
                global_data = page.evaluate('() => window.model || window.itineraryData || null')
                if global_data:
                    if isinstance(global_data, dict) and global_data.get('Name'):
                        title_val = global_data.get('Name')
                    all_images.extend(extract_images_recursively(global_data))
            
            browser.close()
            
            import urllib.parse
            unique_images = []
            
            def format_url(img):
                if img and isinstance(img, str):
                    if img.startswith("//"):
                        img = "https:" + img
                    elif not img.startswith("http"):
                        img = "https://wetu.com/Resources/" + img
                    return urllib.parse.quote(img, safe=':/&=+?#')
                return None

            groups = []

            merged_destinations = {}
            merged_accommodations = {}

            for d in api_responses:
                try:
                    data = d.get('data', {}) if isinstance(d, dict) else {}
                    if isinstance(data, dict):
                        if "destinations" in data:
                            for dst_id, dst_data in data['destinations'].items():
                                if dst_id not in merged_destinations:
                                    merged_destinations[dst_id] = {'name': '', 'images': []}
                                if dst_data.get('name'):
                                    merged_destinations[dst_id]['name'] = dst_data.get('name')
                                imgs = extract_images_recursively(dst_data)
                                merged_destinations[dst_id]['images'].extend(imgs)

                        if "accommodations" in data:
                            for acc_id, acc_data in data['accommodations'].items():
                                if acc_id not in merged_accommodations:
                                    merged_accommodations[acc_id] = {'name': '', 'images': []}
                                if acc_data.get('name'):
                                    merged_accommodations[acc_id]['name'] = acc_data.get('name')
                                imgs = extract_images_recursively(acc_data)
                                merged_accommodations[acc_id]['images'].extend(imgs)
                except Exception:
                    pass

            dst_items = list(merged_destinations.items())
            acc_items = list(merged_accommodations.items())
            
            # Interleave regions and lodges for a more logical chronological flow
            max_len = max(len(dst_items), len(acc_items))
            for i in range(max_len):
                if i < len(dst_items):
                    dst_id, dst_data = dst_items[i]
                    clean_imgs = []
                    for img in dst_data['images']:
                        fmt = format_url(img)
                        if fmt and fmt not in clean_imgs:
                            clean_imgs.append(fmt)
                    if clean_imgs:
                        dst_name = dst_data['name'] or f"Region {dst_id}"
                        groups.append({"name": dst_name, "type": "Region", "images": clean_imgs[:3]})
                
                if i < len(acc_items):
                    acc_id, acc_data = acc_items[i]
                    clean_imgs = []
                    for img in acc_data['images']:
                        fmt = format_url(img)
                        if fmt and fmt not in clean_imgs:
                            clean_imgs.append(fmt)
                    if clean_imgs:
                        acc_name = acc_data['name'] or f"Lodge {acc_id}"
                        groups.append({"name": acc_name, "type": "Lodge", "images": clean_imgs[:6]})

            for img in all_images:
                clean_img = format_url(img)
                if clean_img and clean_img not in unique_images:
                    unique_images.append(clean_img)
                    
            result = {
                "title": title_val,
                "images": unique_images,
                "groups": groups
            }
            if len(unique_images) == 0:
                print(json.dumps({"error": "Failed to locate itinerary data in page."}))
            else:
                print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    url = sys.argv[1]
    run_extraction(url)
