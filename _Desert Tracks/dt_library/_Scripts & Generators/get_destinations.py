import json

files = [
    "/Users/jaunhusselmann/Downloads/2025 11-DAY JUST A QUICK VISIT (LUXURY) G.json",
    "/Users/jaunhusselmann/Downloads/2025 16-DAY NAM, CHOBE & VIC FALLS (LUXURY) G.json",
    "/Users/jaunhusselmann/Downloads/2025 16-DAY NAMIBIA AT A GLANCE (LUXURY) G.json",
    "/Users/jaunhusselmann/Downloads/16-DAY NAM, DELTA, CHOBE & VIC FALLS (STANDARD) G.json"
]

for f in files:
    print(f"\n--- {f} ---")
    try:
        with open(f, 'r') as file:
            data = json.load(file)
            for item in data.get('top_carousel', []):
                print(f"Destination: {item.get('destination', 'Unknown')}")
    except Exception as e:
        print(f"Error: {e}")
