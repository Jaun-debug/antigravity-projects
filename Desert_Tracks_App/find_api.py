import urllib.request
import urllib.error

id = "be45bb41-0874-47ca-8af5-a65d511991f7"
endpoints = [
    f"https://wetu.com/API/ItineraryOutputs/Discovery/{id}",
    f"https://wetu.com/Itinerary/GetItinerary?id={id}",
    f"https://wetu.com/API/Itinerary/Discovery/{id}",
    f"https://api.wetu.com/itinerary/{id}",
    f"https://wetu.com/ItineraryOutputs/Builder/{id}"
]

for url in endpoints:
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            text = response.read().decode('utf-8')
            print(f"{url} -> {response.status}")
            if "{" in text[:10]:
                print("FOUND JSON at:", url)
    except urllib.error.HTTPError as e:
        print(f"{url} -> {e.code}")
    except Exception as e:
        print(f"{url} -> {e}")
